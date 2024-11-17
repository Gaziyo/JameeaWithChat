"use client";

import { Progress } from "@/components/ui/progress";

interface FileUploadProgressProps {
  fileName: string;
  progress: number;
}

export function FileUploadProgress({ fileName, progress }: FileUploadProgressProps) {
  return (
    <div className="w-full p-2 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="truncate">{fileName}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}