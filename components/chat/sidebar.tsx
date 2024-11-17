"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploadProgress } from './file-upload-progress';
import { 
  Upload, 
  FileText, 
  FileImage, 
  FileAudio, 
  FileVideo,
  File as FileIcon,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadProgress?: number;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'jpg':
    case 'png':
    case 'gif':
      return <FileImage className="w-4 h-4 text-green-500" />;
    case 'mp3':
    case 'wav':
      return <FileAudio className="w-4 h-4 text-yellow-500" />;
    case 'mp4':
    case 'mov':
      return <FileVideo className="w-4 h-4 text-purple-500" />;
    default:
      return <FileIcon className="w-4 h-4 text-gray-500" />;
  }
};

export function Sidebar() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.split('.').pop() || '',
      size: file.size,
      uploadProgress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);

    // Simulate upload progress
    for (const file of newFiles) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, uploadProgress: progress } : f
          )
        );
      }
    }

    setUploading(false);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="w-80 border-r border-border bg-card/50">
      <Tabs defaultValue="chat">
        <TabsList className="w-full">
          <TabsTrigger value="chat" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-4 px-4">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Start a new conversation
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="files" className="mt-4 px-4">
          <div className="space-y-4">
            <label htmlFor="file-upload">
              <Button variant="outline" className="w-full" disabled={uploading}>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
              accept=".doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx,.mp3,.mp4,.jpg,.jpeg,.png,.gif"
            />
            
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-2">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No files uploaded yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload documents, images, audio, or video files
                    </p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="relative group"
                    >
                      {file.uploadProgress !== undefined && file.uploadProgress < 100 ? (
                        <FileUploadProgress
                          fileName={file.name}
                          progress={file.uploadProgress}
                        />
                      ) : (
                        <div className="flex items-center p-2 rounded-md hover:bg-muted/50">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0 ml-3">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}