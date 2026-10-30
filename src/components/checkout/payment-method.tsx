import type { PaymentMethod } from "@/lib/validations/checkout";

type Props = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

export function PaymentMethodSelect({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="font-heading text-2xl font-semibold text-forest">
        Payment method
      </legend>

      <div className="mt-5 space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-forest bg-secondary/60 p-4">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={value === "cod"}
            onChange={() => onChange("cod")}
            className="mt-1 size-4 accent-[var(--forest)]"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">
              Cash on delivery
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Pay when your books arrive. Available now.
            </span>
          </span>
        </label>

        <label className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-input bg-white p-4 opacity-60">
          <input
            type="radio"
            name="paymentMethod"
            value="razorpay"
            disabled
            checked={false}
            readOnly
            className="mt-1 size-4"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">
              Online payment
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              UPI, cards and net banking — coming soon.
            </span>
          </span>
        </label>
      </div>
    </fieldset>
  );
}