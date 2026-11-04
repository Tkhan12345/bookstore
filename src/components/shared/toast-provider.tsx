"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Toast } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastInput = {
  title: string;
  description?: string;
  tone?: "default" | "error";
  action?: { label: string; href: string };
};

type ToastItem = ToastInput & { id: number; open: boolean };

type ToastContextValue = { toast: (input: ToastInput) => void };

const MAX_TOASTS = 3;
const REMOVE_DELAY_MS = 300;

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, open: false } : item)),
    );
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, REMOVE_DELAY_MS);
  }, []);

  const toast = useCallback((input: ToastInput) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((prev) => [...prev, { ...input, id, open: true }].slice(-MAX_TOASTS));
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right" duration={5000} label="Notification">
        {children}
        {toasts.map((item) => (
          <Toast.Root
            key={item.id}
            open={item.open}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            className={cn(
              "relative flex items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-border",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right",
              item.tone === "error" && "border-l-4 border-l-destructive",
            )}
          >
            <div className="min-w-0 flex-1">
              <Toast.Title className="text-sm font-semibold text-forest">
                {item.title}
              </Toast.Title>
              {item.description ? (
                <Toast.Description className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </Toast.Description>
              ) : null}
              {item.action ? (
                <Toast.Action asChild altText={item.action.label}>
                  <Link
                    href={item.action.href}
                    className="mt-2 inline-block text-sm font-medium text-forest underline underline-offset-4"
                  >
                    {item.action.label}
                  </Link>
                </Toast.Action>
              ) : null}
            </div>
            <Toast.Close
              aria-label="Dismiss notification"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed inset-x-0 bottom-0 z-[70] m-0 flex max-h-screen w-full flex-col gap-2 p-4 outline-none sm:left-auto sm:max-w-sm" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
