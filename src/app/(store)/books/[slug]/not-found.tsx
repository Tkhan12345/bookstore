import Link from "next/link";
import { BookX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function BookNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <EmptyState
        icon={BookX}
        title="We couldn't find that book"
        description="It may have been removed, or the link might be mistyped."
        action={
          <Button asChild className="h-10 px-5">
            <Link href="/books">Browse all books</Link>
          </Button>
        }
      />
    </div>
  );
}