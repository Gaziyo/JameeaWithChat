"use client";

import { useRequireAuth } from '@/hooks/use-require-auth';
import { useChat } from '@/hooks/use-chat';
import { Header } from '@/components/chat/header';
import { Sidebar } from '@/components/chat/sidebar';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { useToast } from '@/components/ui/use-toast';

export default function ChatPage() {
  const { isLoading } = useRequireAuth();
  const { messages, isLoading: chatLoading, sendMessage } = useChat();
  const { toast } = useToast();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const onSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen chat-gradient">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} isLoading={chatLoading} />
          <MessageInput onSend={onSend} disabled={chatLoading} />
        </div>
      </div>
    </div>
  );
}