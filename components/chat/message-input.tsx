"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, File, Send, Loader2 } from 'lucide-react';
import { AudioRecorder } from './audio-recorder';
import { useToast } from '@/components/ui/use-toast';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!input.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSend(input);
      setInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        toast({
          title: "Processing Image",
          description: "Analyzing image content...",
        });
      }
    }
  };

  return (
    <div className="border-t border-border p-4 bg-card/50">
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex gap-2">
          <AudioRecorder 
            onRecordingComplete={async () => {}}
            disabled={disabled || isSubmitting}
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleFileSelect}
            disabled={disabled || isSubmitting}
          >
            <Camera className="w-4 h-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            size="icon"
            disabled={disabled || isSubmitting}
          >
            <File className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift + Enter for new line)"
            className="min-h-[80px] resize-none"
            rows={3}
            disabled={disabled || isSubmitting}
          />
          <Button 
            className="self-end"
            onClick={handleSend}
            disabled={!input.trim() || disabled || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}