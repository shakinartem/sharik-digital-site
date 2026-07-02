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
      <path d="M12 20.3s6.2-4.9 6.2-10.8a6.2 6.2 0 1 0-12.4 0c0 5.9 6.2 10.8 6.2 10.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.2" r="2.25" stroke="currentColor" strokeWidth="1.7" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.6 18.2 6v4.8c0 4.3-2.8 7.3-6.2 8.8-3.4-1.5-6.2-4.5-6.2-8.8V6L12 3.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m9.3 11.8 1.7 1.7 3.8-3.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function CompareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 7h10M7 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m14.5 4 2.8 3-2.8 3M9.5 14 6.7 17l2.8 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.1 6.2h11.8a2.6 2.6 0 0 1 2.6 2.6v4.1a2.6 2.6 0 0 1-2.6 2.6h-7.4l-3.9 3.1v-3.1H6.1a2.6 2.6 0 0 1-2.6-2.6V8.8a2.6 2.6 0 0 1 2.6-2.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.2 10.2h7.6M8.2 13h4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 4.5v2.6M17 4.5v2.6M4.5 9h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="4.5" y="6.8" width="15" height="12.7" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m9.1 14 1.8 1.8 4-4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ToothIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8.3 4.2c1.2 0 2.2.6 3.7.6s2.5-.6 3.7-.6c2.4 0 4 2 4 4.7 0 2-.8 3.2-1.5 4.6-.7 1.4-.9 4.1-2.3 5.4-.7.7-1.7.4-2-.6l-.9-3.1c-.2-.7-1.3-.7-1.5 0l-.9 3.1c-.3 1-1.3 1.3-2 .6-1.4-1.3-1.6-4-2.3-5.4C5.5 12.1 4.7 10.9 4.7 9c0-2.8 1.6-4.8 3.6-4.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ToothbrushIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5.3 18.8 8.9-8.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.1 5.6c.8-.8 2.1-.8 2.9 0l1.4 1.4c.8.8.8 2.1 0 2.9l-1.1 1.1-4.3-4.3 1.1-1.1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16.7 4.4 18.9 2.5M19.4 6.8l2-.8M18.2 9.4l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m4.1 20.1 1.8-1.8 1.8 1.8-1.8 1.8H4.1v-1.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </IconBase>
  );
}

export function PasteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.8 15.1 15 5.9l3.2 3.2-9.2 9.2H5.8v-3.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m13.6 7.2 3.2 3.2M5.2 20h13.6M4.5 12.5l4.7-4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function MegaphoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.6 13.3V10l9.4-3.9v11.1l-9.4-3.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 9.2h1.1a3.2 3.2 0 1 1 0 6.4H14M7.3 14l1.1 4.3h2.7l-1.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.9 5.7 20.6 4.4M19.4 18.2l1.7 1.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </IconBase>
  );
}

export function BotIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.3v2.5M8.3 5.1h7.4M6.1 7.2h11.8a2.6 2.6 0 0 1 2.6 2.6v5a4.2 4.2 0 0 1-4.2 4.2H7.7a4.2 4.2 0 0 1-4.2-4.2v-5a2.6 2.6 0 0 1 2.6-2.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.1 12h.01M14.9 12h.01M9.1 15.8h5.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconBase>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 19.2h15M7.7 15.8V10M12 15.8V5.8M16.3 15.8v-3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m6.5 11.9 4.3-4.2 3.4 3.2 3.3-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.2 12h14.4M13.2 6.7l5 5.3-5 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

export function TelegramSocialIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.5 5.2 17.7 18a1.1 1.1 0 0 1-1.6.7l-3.8-2.7-2 1.9a.9.9 0 0 1-1.5-.6V15l8.2-7.4-10 6.2-3.3-1.1a1 1 0 0 1 0-1.9l15.4-5.9a1.1 1.1 0 0 1 1.4 1.3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </IconBase>
  );
}

export function VkSocialIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.2 7.5c.2 4.6 2.6 8.5 6.8 8.5h.3v-2.7c1.5.1 2.6 1.2 3.1 2.7h2.2c-.6-2-2-3.1-2.9-3.5.9-.5 2.1-1.8 2.4-5H15c-.4 2.6-1.5 3.6-1.9 3.8V7.5h-2.1v6.6c-.4 0-2.4-1.1-2.7-6.6H5.2Z" fill="currentColor" />
    </IconBase>
  );
}

export function DzenSocialIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.2c-3.2 0-5.8 2.6-5.8 5.8H12V4.2ZM12 4.2c3.2 0 5.8 2.6 5.8 5.8H12V4.2ZM12 19.8c-3.2 0-5.8-2.6-5.8-5.8H12v5.8ZM12 19.8c3.2 0 5.8-2.6 5.8-5.8H12v5.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </IconBase>
  );
}

export function MaxSocialIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 18.5V5.5h2.9l4.6 6.8 4.6-6.8h2.9v13h-2.6V9.8L12 16.1 7.1 9.8v8.7H4.5Z" fill="currentColor" />
    </IconBase>
  );
}
