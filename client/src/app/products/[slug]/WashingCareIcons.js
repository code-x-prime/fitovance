// Product information SVG icons for client rendering

const iconProps = { width: 40, height: 40, viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const WASHING_CARE_ICONS = [
  {
    name: "shedding",
    label: "High Protein",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <rect x="22" y="24" width="20" height="16" rx="3" />
        <rect x="14" y="28" width="8" height="8" rx="2" />
        <rect x="42" y="28" width="8" height="8" rx="2" />
        <rect x="8" y="30" width="6" height="4" rx="1" />
        <rect x="50" y="30" width="6" height="4" rx="1" />
        <line x1="32" y1="16" x2="32" y2="24" />
        <path d="M28 20 L32 16 L36 20" />
      </svg>
    ),
  },
  {
    name: "no-brush",
    label: "Vegan",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M32 48 L32 28" />
        <path d="M32 28 Q20 24 18 14 Q28 16 32 28" />
        <path d="M32 34 Q44 30 46 20 Q36 22 32 34" />
        <path d="M32 40 Q22 38 16 30 Q26 30 32 40" />
      </svg>
    ),
  },
  {
    name: "vacuum",
    label: "Gluten Free",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M32 12 L32 52" />
        <path d="M26 18 L32 12 L38 18" />
        <path d="M22 28 L42 28" />
        <path d="M24 38 L40 38" />
        <circle cx="32" cy="32" r="22" />
        <line x1="14" y1="50" x2="50" y2="14" />
      </svg>
    ),
  },
  {
    name: "blot",
    label: "Sugar Free",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <rect x="22" y="20" width="20" height="24" rx="2" />
        <line x1="22" y1="28" x2="42" y2="28" />
        <line x1="22" y1="36" x2="42" y2="36" />
        <line x1="32" y1="20" x2="32" y2="44" />
        <circle cx="32" cy="32" r="22" />
        <line x1="14" y1="50" x2="50" y2="14" />
      </svg>
    ),
  },
  {
    name: "rotate",
    label: "High Fiber",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M32 48 L32 20" />
        <path d="M24 28 L32 20 L40 28" />
        <path d="M20 36 L32 28 L44 36" />
        <path d="M18 44 L32 34 L46 44" />
        <line x1="18" y1="52" x2="46" y2="52" />
      </svg>
    ),
  },
  {
    name: "furniture-protector",
    label: "Natural Ingredients",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M32 48 L32 28" />
        <path d="M32 28 C20 20 16 12 20 8 C28 10 36 18 32 28" />
        <path d="M32 34 C44 26 48 18 44 14 C36 16 28 24 32 34" />
        <circle cx="26" cy="20" r="1.5" fill="currentColor" />
        <circle cx="38" cy="22" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "trim-thread",
    label: "Gym Friendly",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <rect x="24" y="28" width="16" height="8" rx="2" />
        <rect x="16" y="30" width="8" height="4" rx="1" />
        <rect x="40" y="30" width="8" height="4" rx="1" />
        <rect x="10" y="31" width="6" height="2" rx="1" />
        <rect x="48" y="31" width="6" height="2" rx="1" />
        <path d="M28 28 L28 20 L36 20 L36 28" />
      </svg>
    ),
  },
  {
    name: "professional-clean",
    label: "Energy Boost",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <polygon points="36,8 20,32 30,32 26,56 44,28 34,28" />
      </svg>
    ),
  },
  {
    name: "no-fold",
    label: "Daily Use",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <rect x="14" y="16" width="36" height="36" rx="4" />
        <line x1="14" y1="28" x2="50" y2="28" />
        <line x1="22" y1="12" x2="22" y2="20" />
        <line x1="42" y1="12" x2="42" y2="20" />
        <circle cx="24" cy="36" r="2" fill="currentColor" />
        <circle cx="32" cy="36" r="2" fill="currentColor" />
        <circle cx="40" cy="36" r="2" fill="currentColor" />
        <circle cx="24" cy="44" r="2" fill="currentColor" />
        <circle cx="32" cy="44" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "no-damp",
    label: "Premium Quality",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <polygon points="32,10 37,24 52,24 40,33 44,48 32,39 20,48 24,33 12,24 27,24" />
      </svg>
    ),
  },
  {
    name: "hand-wash",
    label: "Best Seller",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M32 8 L36 20 L48 20 L38 28 L42 40 L32 32 L22,40 L26,28 L16,20 L28,20 Z" />
        <path d="M20 48 Q20 44 24 42" />
        <path d="M44 48 Q44 44 40 42" />
        <path d="M20 48 L44 48" />
      </svg>
    ),
  },
  {
    name: "no-direct-sun",
    label: "New Launch",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M32 8 L28 28 L18 32 L28 36 L32 56 L36 36 L46 32 L36 28 Z" />
        <circle cx="32" cy="28" r="3" />
      </svg>
    ),
  },
  {
    name: "roll",
    label: "Lab Tested",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <path d="M24 12 L24 32 L14 48 L50 48 L40 32 L40 12" />
        <line x1="22" y1="12" x2="42" y2="12" />
        <line x1="18" y1="40" x2="46" y2="40" />
        <circle cx="28" cy="44" r="2" fill="currentColor" />
        <circle cx="36" cy="42" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "spot-clean",
    label: "Fast Absorption",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <circle cx="32" cy="32" r="20" />
        <path d="M32 16 L32 32 L42 38" />
        <path d="M44 14 L50 8" />
        <path d="M46 12 L50 8 L44 6" />
      </svg>
    ),
  },
  {
    name: "dry-flat",
    label: "Easy to Consume",
    svg: (p) => (
      <svg {...iconProps} {...p}>
        <rect x="18" y="24" width="28" height="16" rx="8" />
        <line x1="32" y1="24" x2="32" y2="40" />
        <circle cx="26" cy="32" r="2" fill="currentColor" />
        <circle cx="38" cy="32" r="2" fill="currentColor" />
      </svg>
    ),
  },
];

export function getIconByName(name) {
  return WASHING_CARE_ICONS.find((i) => i.name === name);
}

export function parseWashingCare(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return raw.split("\n").filter(Boolean).map((line) => ({ iconName: "", text: line }));
  }
  return [];
}
