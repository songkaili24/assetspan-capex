import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-figure-3xl font-semibold tabular-nums text-charcoal-300">404</p>
      <h1 className="text-lg font-semibold text-charcoal-900">Record not found</h1>
      <p className="max-w-sm text-sm text-charcoal-500">
        The asset, project, or report you requested is not in the active portfolio scope. It may
        have been disposed or transferred to another entity.
      </p>
      <Link href="/">
        <Button variant="outline" size="sm">
          Return to Portfolio Overview
        </Button>
      </Link>
    </div>
  );
}
