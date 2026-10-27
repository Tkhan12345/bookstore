import { MessageSquareText, Star } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { BookReviewSummary } from "@/features/catalog/catalog.types";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="sr-only">Rated {rating} out of 5</span>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "size-4",
            index < Math.round(rating)
              ? "fill-gold text-gold"
              : "text-border",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewsSection({ summary }: { summary: BookReviewSummary }) {
  return (
    <section aria-labelledby="reviews-heading">
      <h2
        id="reviews-heading"
        className="font-heading text-3xl font-semibold text-forest"
      >
        Reader reviews
      </h2>

      {summary.count === 0 ? (
        <EmptyState
          className="mt-6"
          icon={MessageSquareText}
          title="No reviews yet"
          description="Reviews from readers will appear here once they are available."
        />
      ) : (
        <>
          {summary.average !== null ? (
            <p className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <Stars rating={summary.average} />
              <span>
                {summary.average.toFixed(1)} average from {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}
              </span>
            </p>
          ) : null}
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {summary.reviews.map((review) => (
              <li key={review.id} className="py-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={review.rating} />
                  <p className="text-sm font-medium text-ink">
                    {review.authorName}
                  </p>
                  <time
                    dateTime={review.createdAt.toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {review.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                </div>
                {review.comment ? (
                  <p className="mt-2 leading-relaxed text-ink/80">
                    {review.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}