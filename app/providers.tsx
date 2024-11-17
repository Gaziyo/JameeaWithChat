"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { type PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

// Prevent unnecessary re-renders
export default Providers;