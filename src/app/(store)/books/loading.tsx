import { BookGridSkeleton } from "@/components/books/book-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function BooksLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      role="status"
      aria-label="Loading books"
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-10 w-64" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <div className="hidden space-y-3 lg:block">
          <Skeleton className="h-6 w-20" />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
        <div>
          <Skeleton className="h-10 w-full sm:max-w-md" />
          <div className="mt-12">
            <BookGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}