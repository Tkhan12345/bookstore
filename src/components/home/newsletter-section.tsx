"use client";

import { useId, useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const emailSchema = z.email();

type Feedback =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "not-connected" };

/**
 * UI only: no endpoint exists yet, so a valid address is NOT stored and we
 * say so instead of showing a fake success message.
 */
export function NewsletterSection() {
  const inputId = useId();
  const messageId = useId();
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    const parsed = emailSchema.safeParse(
      typeof email === "string" ? email.trim() : "",
    );
    setFeedback(
      parsed.success
        ? { kind: "not-connected" }
        : { kind: "error", message: "Please enter a valid email address." },
    );
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="rounded-xl bg-secondary px-6 py-12 text-center ring-1 ring-border sm:px-12">
        <h2
          id="newsletter-heading"
          className="font-heading text-3xl font-semibold text-forest sm:text-4xl"
        >
          Letters from the shelf
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          New arrivals and reading notes, now and then. No noise.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={feedback.kind === "error"}
            aria-describedby={messageId}
            className="h-12 w-full rounded-md border border-input bg-white px-4 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/25 aria-[invalid=true]:border-destructive"
          />
          <Button type="submit" className="h-12 rounded-md px-6 text-base">
            Subscribe
          </Button>
        </form>

        <p
          id={messageId}
          role="status"
          className={
            feedback.kind === "error"
              ? "mt-3 text-sm text-destructive"
              : "mt-3 text-sm text-muted-foreground"
          }
        >
          {feedback.kind === "error" && feedback.message}
          {feedback.kind === "not-connected" &&
            "Newsletter sign-up isn't connected yet, so your address was not saved."}
        </p>
      </div>
    </section>
  );
}