// ── Form control primitives ──────────────────────────────────────────────────
// Shared styled inputs for filter bars and modal forms — semantic <label> +
// native controls for accessibility and mobile keyboard behavior.

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-charcoal-300 bg-white px-2.5 text-sm text-charcoal-900 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  ...props
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <label className={className}>
      {label && (
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
          {label}
        </span>
      )}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-charcoal-300 bg-white px-3 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600"
        {...props}
      />
    </label>
  );
}
