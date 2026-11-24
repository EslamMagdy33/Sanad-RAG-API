import { useId } from "react";

/** معرّف آمن للـ SVG (useId بيرجّع رموز ممكن تكسر url(#...)) */
function safeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, "");
}

type IllustrationProps = { className?: string };

/** ورقة مستند بطيّة الزاوية مع سطور نص وعلامة توثيق */
export function DocIllustration({ className = "" }: IllustrationProps) {
  const id = safeId(useId());
  return (
    <svg className={className} viewBox="0 0 120 150" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f2e6dd" />
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e1d4" />
          <stop offset="1" stopColor="#e9bfa8" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#7a3a26" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path
          d="M22 10h56l26 26v96a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z"
          fill={`url(#${id}-paper)`}
          stroke="#efe2d8"
        />
        <path d="M78 10v22a6 6 0 0 0 6 6h22z" fill={`url(#${id}-fold)`} />
      </g>
      <rect x="26" y="50" width="40" height="7" rx="3.5" fill="#9a4d33" />
      <rect x="26" y="66" width="66" height="5" rx="2.5" fill="#e6d4c8" />
      <rect x="26" y="78" width="58" height="5" rx="2.5" fill="#e6d4c8" />
      <rect x="26" y="90" width="66" height="5" rx="2.5" fill="#e6d4c8" />
      <rect x="26" y="102" width="44" height="5" rx="2.5" fill="#e6d4c8" />
      <circle cx="84" cy="124" r="15" fill="#fbae8e" />
      <path d="M77 124l5 5 9-10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** مجلد ملفات بطبقات */
export function FolderIllustration({ className = "" }: IllustrationProps) {
  const id = safeId(useId());
  return (
    <svg className={className} viewBox="0 0 160 130" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-back`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2a27c" />
          <stop offset="1" stopColor="#cf6f47" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdc9ae" />
          <stop offset="1" stopColor="#f09a6f" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#7a3a26" floodOpacity="0.22" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M14 28h44l10 12h72a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8z" fill={`url(#${id}-back)`} />
        <rect x="22" y="34" width="116" height="34" rx="6" fill="#ffffff" />
        <rect x="32" y="44" width="62" height="5" rx="2.5" fill="#e6d4c8" />
        <rect x="32" y="55" width="44" height="5" rx="2.5" fill="#e6d4c8" />
        <path d="M6 60h148a6 6 0 0 1 6 6v54a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V66a6 6 0 0 1 6-6z" fill={`url(#${id}-front)`} />
      </g>
    </svg>
  );
}

/** مستند مع عدسة مكبّرة (للبحث والتحقق) */
export function SearchDocIllustration({ className = "" }: IllustrationProps) {
  const id = safeId(useId());
  return (
    <svg className={className} viewBox="0 0 130 130" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3e9e2" />
        </linearGradient>
        <linearGradient id={`${id}-lens`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fbe4d8" stopOpacity="0.85" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#7a3a26" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        <rect x="14" y="10" width="78" height="98" rx="10" fill={`url(#${id}-paper)`} stroke="#efe2d8" />
        <rect x="26" y="28" width="46" height="6" rx="3" fill="#9a4d33" />
        <rect x="26" y="42" width="54" height="5" rx="2.5" fill="#e6d4c8" />
        <rect x="26" y="54" width="48" height="5" rx="2.5" fill="#e6d4c8" />
        <rect x="26" y="66" width="30" height="5" rx="2.5" fill="#e6d4c8" />
        <circle cx="86" cy="86" r="24" fill={`url(#${id}-lens)`} stroke="#9a4d33" strokeWidth="6" />
        <path d="M104 104l16 16" stroke="#9a4d33" strokeWidth="9" strokeLinecap="round" />
        <path d="M76 84l6 6 12-13" stroke="#9a4d33" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** نجمة لامعة بتدرج، للمسة الزخرفة */
export function SparkIllustration({ className = "" }: IllustrationProps) {
  const id = safeId(useId());
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-spark`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fdc9ae" />
          <stop offset="1" stopColor="#d9764c" />
        </linearGradient>
      </defs>
      <path
        d="M32 4c2.6 14.6 9.4 21.4 24 24-14.6 2.6-21.4 9.4-24 24-2.6-14.6-9.4-21.4-24-24C22.6 25.4 29.4 18.6 32 4z"
        fill={`url(#${id}-spark)`}
      />
    </svg>
  );
}
