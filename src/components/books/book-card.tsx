
import Link from "next/link";

type BookCardProps = {
  title: string;
  slug: string;
  author: string;
  pricePaise: number;
};

export function BookCard({
  title,
  slug,
  author,
  pricePaise,
}: BookCardProps) {
  const price = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(pricePaise / 100);

  return (
    <Link
      href={`/books/${slug}`}
      className="group block overflow-hidden rounded-xl
        border border-[#E6E7DF] bg-white
        transition-shadow hover:shadow-lg"
    >
      <div
        className="flex aspect-[4/5] items-center
          justify-center bg-[#A8BBA3] p-6"
      >
        <div
          className="flex h-full w-3/4 items-center
            justify-center rounded-r-md border-l-8
            border-[#C69C55] bg-[#18392B]
            px-3 text-center shadow-xl"
        >
          <span
            className="font-editorial text-xl
              text-white"
          >
            {title}
          </span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-editorial text-lg font-semibold">
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          {author}
        </p>
        <p className="font-semibold text-[#18392B]">
          {price}
        </p>
      </div>
    </Link>
  );
}
