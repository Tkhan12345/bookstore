"use client";

import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function BooksError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <EmptyState
        icon={AlertTriangle}
        title="We couldn't load the shelf"
        description="Something went wrong while fetching books. Please try again in a moment."
        action={
          <Button onClick={reset} className="h-10 px-5">
            Try again
          </Button>
        }
      />
    </div>
  );
}