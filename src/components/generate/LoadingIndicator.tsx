import * as React from "react";
import { Skeleton } from "../ui/skeleton";

interface LoadingIndicatorProps {
  isVisible: boolean;
}

export function LoadingIndicator({ isVisible }: LoadingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="space-y-4" data-testid="loading-indicator">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
