"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { useToast } from '@/components/ui/use-toast';

export function Header() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { clearHistory } = useChat();
  const { toast } = useToast();

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      toast({
        title: "Success",
        description: "Chat history cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-border bg-card/50 p-2">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg gradient-text">Jameea AI</span>
        </Link>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearHistory}
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => signIn()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}