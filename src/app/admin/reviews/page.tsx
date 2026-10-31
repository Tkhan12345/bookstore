import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReviewDeleteButton } from "@/components/admin/review-delete-button";

export const dynamic = "force-dynamic";
export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page || "1", 10) || 1));
  const [reviews, count] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20,
      include: { user: { select: { name: true, email: true } }, book: { select: { title: true, slug: true } } } }),
    prisma.review.count(),
  ]);
  return <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Moderation</p><h1 className="mt-2 font-heading text-3xl font-semibold text-forest">Book reviews</h1><p className="mt-2 text-sm text-muted-foreground">{count} reviews · Remove abusive or inappropriate submissions</p></div>
    <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-muted/40"><tr><th className="p-4">Book</th><th className="p-4">Reviewer</th><th className="p-4">Rating</th><th className="p-4">Comment</th><th className="p-4">Date</th><th className="p-4">Action</th></tr></thead>
      <tbody className="divide-y">{reviews.map((review) => <tr key={review.id}>
        <td className="p-4"><Link href={`/books/${review.book.slug}`} className="font-medium text-forest underline">{review.book.title}</Link></td>
        <td className="p-4"><p>{review.user.name || "Anonymous"}</p><p className="text-xs text-muted-foreground">{review.user.email}</p></td>
        <td className="p-4">{review.rating} / 5</td>
        <td className="max-w-sm whitespace-pre-wrap p-4">{review.comment || "—"}</td>
        <td className="p-4">{review.createdAt.toLocaleDateString("en-IN")}</td>
        <td className="p-4"><ReviewDeleteButton id={review.id} /></td>
      </tr>)}</tbody></table>{reviews.length === 0 && <p className="p-8 text-center text-muted-foreground">No reviews on this page.</p>}</div>
    <div className="flex gap-3 text-sm">{page > 1 && <Link className="rounded border px-4 py-2" href={`/admin/reviews?page=${page - 1}`}>Previous</Link>}{page * 20 < count && <Link className="rounded border px-4 py-2" href={`/admin/reviews?page=${page + 1}`}>Next</Link>}</div>
  </main>;
}
