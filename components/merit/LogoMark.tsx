import type { SVGProps } from "react";

/** A folded-page M, shared by navigation and social previews. */
export default function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" width={32} height={32} aria-hidden="true" {...props}>
      <rect width="48" height="48" rx="12" fill="#e7f1ec" />
      <path d="M7 37V10l17 12 17-12v27l-7-4V23L24 31 14 23v10Z" fill="#0f5d3e" />
      <path d="m24 22 17-12v27l-7-4V23l-10 8Z" fill="#287857" />
    </svg>
  );
}
