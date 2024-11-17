import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  url: string;
  userId: string;
  createdAt: Date;
  embeddings?: number[];
}

export async function uploadDocument(
  file: File,
  userId: string
): Promise<Document> {
  // Upload file to Firebase Storage
  const storageRef = ref(storage, `documents/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // Process document with Qdrant
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  const response = await axios.post('http://localhost:8000/process-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const { embeddings, content } = response.data;

  // Store document metadata in Firestore
  const docRef = await addDoc(collection(db, 'documents'), {
    title: file.name,
    content,
    type: file.type,
    url,
    userId,
    embeddings,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    title: file.name,
    content,
    type: file.type,
    url,
    userId,
    createdAt: new Date(),
    embeddings,
  };
}

export async function searchDocuments(
  query: string,
  userId: string
): Promise<Document[]> {
  // Get query embeddings from backend
  const response = await axios.post('http://localhost:8000/get-embeddings', {
    text: query,
  });

  const { embeddings } = response.data;

  // Search Qdrant for similar documents
  const results = await axios.post('http://localhost:8000/search-documents', {
    embeddings,
    userId,
  });

  // Get full documents from Firestore
  const docs = await Promise.all(
    results.data.map(async (result: { id: string }) => {
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))[0];
    })
  );

  return docs;
}