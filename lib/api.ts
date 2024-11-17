import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const sendAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  const response = await api.post('/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const searchDocuments = async (query: string) => {
  const response = await api.get('/search', {
    params: { q: query },
  });
  
  return response.data;
};

export const getChatHistory = async (userId: string) => {
  const response = await api.get(`/chat-history/${userId}`);
  return response.data.history;
};

export const clearChatHistory = async (userId: string) => {
  const response = await api.post(`/clear-history/${userId}`);
  return response.data;
};