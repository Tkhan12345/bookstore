import type { PaymentMethod } from "@/lib/validations/checkout";

type PaymentMethodSelectProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

const OPTIONS: {
  value: PaymentMethod;
  title: string;
  description: string;
}[] = [
  {
    value: "razorpay",
    title: "Pay online with Razorpay",
    description: "UPI, cards and net banking. Planned, not connected yet.",
  },
  {
    value: "cod",
    title: "Cash on delivery",
    description: "Placeholder. Not decided yet, so it may not be offered.",
  },
];

export function PaymentMethodSelect({
  value,
  onChange,
}: PaymentMethodSelectProps) {
  return (
    <fieldset>
      <legend className="font-heading text-2xl font-semibold text-forest">
        Payment method
      </legend>

      <div className="mt-5 space-y-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-input bg-white p-4 transition-colors has-[:checked]:border-forest has-[:checked]:bg-secondary/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/40"
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 size-4 accent-[var(--forest)]"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">
                {option.title}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        No payment is taken on this page. Online payments will be handled by
        Razorpay once it is connected.
      </p>
    </fieldset>
  );
}