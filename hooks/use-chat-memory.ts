"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { useAuth } from './use-auth';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  type: 'text' | 'audio' | 'file';
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
}

export function useChatMemory(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'conversations', conversationId || 'default', 'messages'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      })) as ChatMessage[];
      
      setMessages(newMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, conversationId]);

  const addMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user?.uid) return;

    await addDoc(
      collection(db, 'conversations', conversationId || 'default', 'messages'),
      {
        ...message,
        userId: user.uid,
        timestamp: serverTimestamp(),
      }
    );
  };

  const clearHistory = async () => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'conversations', conversationId || 'default', 'messages'),
      where('userId', '==', user.uid)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  };

  return {
    messages,
    isLoading,
    addMessage,
    clearHistory,
  };
}