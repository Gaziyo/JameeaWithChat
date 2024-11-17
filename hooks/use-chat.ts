"use client";

import { useState, useCallback, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { uploadFile, sendAudio, searchDocuments } from '@/lib/api';
import { useAuth } from './use-auth';
import { useToast } from '@/hooks/use-toast';
import { useChatMemory } from './use-chat-memory';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { messages, addMessage, clearHistory } = useChatMemory();
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !user?.uid) return;

    socket.on('message', async (response) => {
      await addMessage({
        content: response.content,
        role: 'assistant',
        type: response.type || 'text',
        audioUrl: response.audioUrl,
        fileUrl: response.fileUrl,
        fileName: response.fileName,
      });
      setIsLoading(false);
    });

    return () => {
      socket.off('message');
    };
  }, [socket, user?.uid, addMessage]);

  const sendMessage = useCallback(async (content: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await addMessage({
        content,
        role: 'user',
        type: 'text',
      });
      
      socket.emit('message', { 
        content, 
        userId: user?.uid,
        messageId: uuidv4(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.uid, addMessage, socket, toast]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await uploadFile(file);
      
      await addMessage({
        content: `Uploaded file: ${file.name}`,
        role: 'user',
        type: 'file',
        fileUrl: response.url,
        fileName: file.name,
      });

      socket.emit('file', { 
        fileUrl: response.url,
        fileName: file.name,
        userId: user?.uid,
        messageId: uuidv4(),
      });

      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.uid, addMessage, socket, toast]);

  return {
    messages,
    isLoading,
    sendMessage,
    handleFileUpload,
    clearHistory,
  };
}