import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions: export, approve, run model */
  actions?: React.ReactNode;
  /** Eyebrow above the title, e.g. "Asset Registry" */
  eyebrow?: string;
  className?: string;
}

export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-charcoal-200 bg-white px-4 py-4 sm:px-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight text-charcoal-900">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-charcoal-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
