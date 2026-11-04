import { SectionHeading } from "@/components/shared/section-heading";

const REASONS = [
  {
    title: "A considered catalogue",
    body: "A smaller shelf, chosen deliberately, rather than everything under the sun.",
  },
  {
    title: "Honest availability",
    body: "Stock levels come straight from our inventory, so what you see is what we have.",
  },
  {
    title: "Transparent pricing",
    body: "Every price is in rupees, and any original price is shown next to the current one.",
  },
  {
    title: "Real, physical books",
    body: "Paper, ink and a spine on your shelf. Nothing here is a download.",
  },
] as const;

export function WhyUsSection() {
  return (
    <section
      aria-labelledby="why-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <SectionHeading
        headingId="why-heading"
        eyebrow="Why shop with us"
        title="Bookselling, kept simple"
      />
      <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason, index) => (
          <li key={reason.title} className="border-t border-forest/25 pt-5">
            <span
              aria-hidden="true"
              className="font-heading text-2xl text-gold"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-heading text-xl font-semibold text-forest">
              {reason.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {reason.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}