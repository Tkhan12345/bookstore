import Image from "next/image";
import { cn } from "@/lib/utils";

type BookCoverProps = {
  title: string;
  author?: string;
  coverImage?: string | null;
  sizes?: string;
  priority?: boolean;
  /** Hide from assistive tech when the title is already announced nearby. */
  decorative?: boolean;
  className?: string;
};

const coverShadow =
  "shadow-[0_1px_2px_rgba(34,40,33,0.2),0_12px_24px_-8px_rgba(34,40,33,0.35)]";

export function BookCover({
  title,
  author,
  coverImage,
  sizes = "(min-width: 1024px) 20vw, 45vw",
  priority = false,
  decorative = false,
  className,
}: BookCoverProps) {
  const src = coverImage?.trim() || null;
  const isLocal = src?.startsWith("/") ?? false;
  const isRemote = src ? /^https?:\/\//i.test(src) : false;
  const hasImage = isLocal || isRemote;

  return (
    <div
      className={cn(
        // `container-type` lets the text below size itself from the cover width.
        "relative aspect-[2/3] w-full overflow-hidden rounded-l-sm rounded-r-md bg-forest [container-type:inline-size]",
        coverShadow,
        className,
      )}
      {...(decorative
        ? { "aria-hidden": true }
        : !hasImage
          ? { role: "img", "aria-label": `Cover of ${title}` }
          : {})}
    >
      {hasImage && src ? (
        <Image
          src={src}
          alt={decorative ? "" : `Cover of ${title}`}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={!isLocal}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex min-w-0 flex-col justify-between gap-[6%] p-[12%] pl-[16%] text-cream">
          <span className="block h-px w-[22%] shrink-0 bg-gold" />
          <span
            className="min-w-0 font-heading font-semibold leading-[1.15] hyphens-auto [overflow-wrap:anywhere]"
            style={{ fontSize: "clamp(0.5rem, 11cqw, 1.5rem)" }}
          >
            {title}
          </span>
          {author ? (
            <span
              className="min-w-0 truncate uppercase tracking-[0.12em] text-sage"
              style={{ fontSize: "clamp(0.35rem, 5.5cqw, 0.7rem)" }}
            >
              {author}
            </span>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Spine highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-black/25 to-transparent"
      />
    </div>
  );
}