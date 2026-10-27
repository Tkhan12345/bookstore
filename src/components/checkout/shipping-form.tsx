import { Field, controlClass } from "@/components/checkout/form-field";
import { INDIAN_STATES } from "@/lib/india-states";
import type {
  FieldErrors,
  ShippingField,
  ShippingValues,
} from "@/lib/validations/checkout";

type ShippingFormProps = {
  values: ShippingValues;
  /** Only errors that should currently be visible. */
  errors: FieldErrors;
  onChange: (field: ShippingField, value: string) => void;
  onBlur: (field: ShippingField) => void;
};

export function fieldId(field: ShippingField): string {
  return `shipping-${field}`;
}

export function ShippingForm({
  values,
  errors,
  onChange,
  onBlur,
}: ShippingFormProps) {
  return (
    <fieldset className="grid gap-5 sm:grid-cols-2">
      <legend className="font-heading text-2xl font-semibold text-forest">
        Shipping address
      </legend>

      <Field
        id={fieldId("fullName")}
        label="Full name"
        error={errors.fullName}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            {...control}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={values.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            onBlur={() => onBlur("fullName")}
            className={controlClass}
          />
        )}
      </Field>

      <Field
        id={fieldId("phone")}
        label="Mobile number"
        hint="We'll use this for delivery updates."
        error={errors.phone}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            {...control}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={values.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            onBlur={() => onBlur("phone")}
            className={controlClass}
          />
        )}
      </Field>

      <Field
        id={fieldId("line1")}
        label="Address line 1"
        hint="House or flat number, building, street."
        error={errors.line1}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            {...control}
            name="line1"
            type="text"
            autoComplete="address-line1"
            required
            value={values.line1}
            onChange={(event) => onChange("line1", event.target.value)}
            onBlur={() => onBlur("line1")}
            className={controlClass}
          />
        )}
      </Field>

      <Field
        id={fieldId("line2")}
        label="Address line 2"
        optional
        hint="Area, landmark."
        error={errors.line2}
        className="sm:col-span-2"
      >
        {(control) => (
          <input
            {...control}
            name="line2"
            type="text"
            autoComplete="address-line2"
            value={values.line2}
            onChange={(event) => onChange("line2", event.target.value)}
            onBlur={() => onBlur("line2")}
            className={controlClass}
          />
        )}
      </Field>

      <Field id={fieldId("city")} label="City or town" error={errors.city}>
        {(control) => (
          <input
            {...control}
            name="city"
            type="text"
            autoComplete="address-level2"
            required
            value={values.city}
            onChange={(event) => onChange("city", event.target.value)}
            onBlur={() => onBlur("city")}
            className={controlClass}
          />
        )}
      </Field>

      <Field id={fieldId("postalCode")} label="PIN code" error={errors.postalCode}>
        {(control) => (
          <input
            {...control}
            name="postalCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            required
            value={values.postalCode}
            onChange={(event) =>
              onChange("postalCode", event.target.value.replace(/\D/g, ""))
            }
            onBlur={() => onBlur("postalCode")}
            className={controlClass}
          />
        )}
      </Field>

      <Field
        id={fieldId("state")}
        label="State or union territory"
        error={errors.state}
      >
        {(control) => (
          <select
            {...control}
            name="state"
            autoComplete="address-level1"
            required
            value={values.state}
            onChange={(event) => onChange("state", event.target.value)}
            onBlur={() => onBlur("state")}
            className={controlClass}
          >
            <option value="">Select…</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        )}
      </Field>

      <div>
        <p className="text-sm font-medium text-ink">Country</p>
        <p className="mt-1.5 flex h-11 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
          India
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          We currently deliver within India only.
        </p>
      </div>
    </fieldset>
  );
}