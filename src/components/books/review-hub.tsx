import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReviewManager } from "@/components/books/review-manager";
import { Star } from "lucide-react";

type Props = { bookId: string };
export async function ReviewHub({ bookId }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const [reviews, stats, existing, purchased] = await Promise.all([
    prisma.review.findMany({ where: { bookId }, orderBy: { createdAt: "desc" }, take: 30,
      select: { id: true, rating: true, comment: true, createdAt: true, userId: true, user: { select: { name: true } } } }),
    prisma.review.aggregate({ where: { bookId }, _avg: { rating: true }, _count: { _all: true } }),
    userId ? prisma.review.findUnique({ where: { userId_bookId: { userId, bookId } }, select: { id: true, rating: true, comment: true } }) : Promise.resolve(null),
    userId ? prisma.orderItem.findFirst({ where: { bookId, order: { userId, status: { not: "CANCELLED" } } }, select: { id: true } }) : Promise.resolve(null),
  ]);
  const counts = [5,4,3,2,1].map((rating) => ({ rating, count: reviews.filter((r) => r.rating === rating).length }));
  // Distribution counts cover all reviews, not just the first page.
  const fullCounts = await prisma.review.groupBy({ by: ["rating"], where: { bookId }, _count: { _all: true } });
  const distribution = counts.map((item) => ({ rating: item.rating, count: fullCounts.find((row) => row.rating === item.rating)?._count._all ?? 0 }));
  const verifiedUsers = new Set((await prisma.orderItem.findMany({
    where: { bookId, order: { status: { not: "CANCELLED" } }, orderId: { not: "" } },
    select: { order: { select: { userId: true } } },
    distinct: ["orderId"],
  })).map((item) => item.order.userId));

  return <section aria-labelledby="reviews-heading" className="space-y-6">
    <div>
      <h2 id="reviews-heading" className="font-heading text-3xl font-semibold text-forest">Reader reviews</h2>
      <p className="mt-2 text-sm text-muted-foreground">{stats._count._all ? `${stats._avg.rating?.toFixed(1)} / 5 · ${stats._count._all} reviews` : "No reviews yet. Be the first verified buyer to share your thoughts."}</p>
    </div>
    {stats._count._all > 0 && <div className="max-w-lg space-y-2">
      {distribution.map(({rating,count}) => <div key={rating} className="flex items-center gap-3 text-sm">
        <span className="w-9 shrink-0">{rating} ★</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(count / stats._count._all) * 100}%` }} /></div>
        <span className="w-8 text-right text-muted-foreground">{count}</span>
      </div>)}
    </div>}
    <ReviewManager bookId={bookId} signedIn={Boolean(userId)} purchased={Boolean(purchased)} existing={existing} />
    {reviews.length > 0 && <ul className="divide-y rounded-xl border bg-white px-5">
      {reviews.map((review) => <li key={review.id} className="py-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex" aria-label={`${review.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} className={`size-4 ${i < review.rating ? "fill-amber-400 text-amber-500" : "text-gray-300"}`} />)}</span>
          <strong>{review.user.name?.trim() || "Anonymous reader"}</strong>
          {verifiedUsers.has(review.userId) && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">Verified purchase</span>}
          <time className="text-xs text-muted-foreground" dateTime={review.createdAt.toISOString()}>{review.createdAt.toLocaleDateString("en-IN")}</time>
        </div>
        {review.comment && <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{review.comment}</p>}
      </li>)}
    </ul>}
    {stats._count._all > reviews.length && <p className="text-sm text-muted-foreground">Showing the latest {reviews.length} reviews of {stats._count._all}.</p>}
  </section>;
}
