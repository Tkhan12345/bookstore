import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/25 aria-[invalid=true]:border-destructive";

export type ControlProps = {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (control: ControlProps) => ReactNode;
};

export function Field({
  id,
  label,
  optional,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        ) : null}
      </label>
      <div className="mt-1.5">
        {children({
          id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy,
        })}
      </div>
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className={cn(
            "mt-1.5 flex items-start gap-1.5 text-sm text-destructive",
          )}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}