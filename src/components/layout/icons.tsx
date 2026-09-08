import type { SVGProps } from "react";

// Minimal 24px stroke icon set — consistent 1.5px strokes, no external icon
// dependency. Extend here rather than pulling per-icon packages.

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const OverviewIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 13h6a2 2 0 0 0 2-2V3H5a2 2 0 0 0-2 2v8Zm0 0v6a2 2 0 0 0 2 2h4" />
    <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8v-8a2 2 0 0 1 2-2h6" />
  </Base>
);

export const RegistryIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4h16v4H4zM4 12h16v8H4z" />
    <path d="M9 12v8M15 12v8" />
  </Base>
);

export const ForecastIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 20h18" />
    <path d="M4 16l4-6 4 3 5-8 3 4" />
  </Base>
);

export const ProjectsIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
  </Base>
);

export const ScenarioIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
    <circle cx="12" cy="12" r="4" />
    <path d="M6 6l2 2m8 8 2 2m0-12-2 2M8 16l-2 2" />
  </Base>
);

export const BidsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6M9 12h6" />
  </Base>
);

export const ReportsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Base>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 13 4 4L19 7" />
  </Base>
);
