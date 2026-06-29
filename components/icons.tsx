import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11.5a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" stroke="currentColor" strokeWidth="1.8" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.2 19 6v5.2c0 4.6-2.9 7.9-7 9.6-4.1-1.7-7-5-7-9.6V6l7-2.8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function CompareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 5v14M17 5v14M4 8h6M14 8h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 8 3 12h8L9.5 8M14.5 8 13 12h8l-1.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H10l-5 4v-4.8a3.5 3.5 0 0 1 0-6.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 8h8M8 11h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 4v3M18 4v3M4.5 9h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9A2.5 2.5 0 0 1 6.5 6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9 14 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ToothIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.2 3.5c1.2 0 2.1.6 3.8.6s2.6-.6 3.8-.6c2.5 0 4.2 2.2 4.2 5.1 0 2.1-.9 3.4-1.7 5-.7 1.5-.9 4.7-2.5 6.1-.8.7-1.8.4-2.1-.7l-.9-3.4c-.2-.8-1.4-.8-1.6 0L10.3 19c-.3 1.1-1.3 1.4-2.1.7-1.6-1.4-1.8-4.6-2.5-6.1C4.9 12 4 10.7 4 8.6c0-2.9 1.7-5.1 4.2-5.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconBase>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v3M8 3h8M6.5 7h11A2.5 2.5 0 0 1 20 9.5v6A4.5 4.5 0 0 1 15.5 20h-7A4.5 4.5 0 0 1 4 15.5v-6A2.5 2.5 0 0 1 6.5 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 12h.01M15 12h.01M9 16h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </IconBase>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m6 11 5-5 4 4 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}
