import React from "react";

interface CalicoCatIconProps {
  className?: string;
  size?: number;
  mood?: "happy" | "thinking" | "excited" | "idle" | "curious";
}

/**
 * CalicoCatIcon - Official mascot "Sofa" (Софа) for ElectroForge.
 * A friendly tricolor calico cat (white, warm ginger/orange, dark slate/black)
 * with electronics spark charm.
 */
export const CalicoCatIcon: React.FC<CalicoCatIconProps> = ({
  className = "w-8 h-8",
  size,
  mood = "happy",
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background Glow / Aura */}
      <circle cx="50" cy="50" r="46" fill="#F8FAFC" fillOpacity="0.05" />

      {/* Cat Ears */}
      {/* Left Ear (Dark Slate / Charcoal Patch) */}
      <path
        d="M26 38 L14 14 Q28 16 38 24 Z"
        fill="#334155"
        stroke="#1E293B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Left Inner Ear */}
      <path
        d="M25 33 L18 19 Q26 21 32 26 Z"
        fill="#FDA4AF"
        fillOpacity="0.8"
      />

      {/* Right Ear (Warm Ginger / Orange Patch) */}
      <path
        d="M62 24 Q72 16 86 14 L74 38 Z"
        fill="#F97316"
        stroke="#EA580C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right Inner Ear */}
      <path
        d="M68 26 Q74 21 82 19 L75 33 Z"
        fill="#FECDD3"
        fillOpacity="0.8"
      />

      {/* Cat Head Base (White) */}
      <ellipse
        cx="50"
        cy="55"
        rx="36"
        ry="32"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="2.5"
      />

      {/* Calico Patches on Face */}
      {/* Left Dark Slate Patch */}
      <path
        d="M16 48 C15 36 28 26 38 28 C42 34 38 46 32 50 C26 54 18 54 16 48 Z"
        fill="#334155"
      />
      {/* Right Orange / Ginger Patch */}
      <path
        d="M84 48 C85 36 72 26 62 28 C58 35 64 48 70 52 C76 56 82 54 84 48 Z"
        fill="#FB923C"
      />

      {/* White Forehead Blaze & Cheeks */}
      <path
        d="M50 28 C44 32 40 40 40 50 C40 60 45 68 50 68 C55 68 60 60 60 50 C60 40 56 32 50 28 Z"
        fill="#FFFFFF"
      />

      {/* Cute Eyes */}
      {mood === "happy" || mood === "excited" ? (
        <>
          {/* Left Eye: Amber/Gold with sparkle */}
          <ellipse cx="36" cy="50" rx="6.5" ry="7.5" fill="#0284C7" />
          <ellipse cx="34.5" cy="48" rx="2.5" ry="3" fill="#FFFFFF" />
          <circle cx="38" cy="52" r="1.2" fill="#E0F2FE" />

          {/* Right Eye: Emerald/Teal with sparkle */}
          <ellipse cx="64" cy="50" rx="6.5" ry="7.5" fill="#0D9488" />
          <ellipse cx="62.5" cy="48" rx="2.5" ry="3" fill="#FFFFFF" />
          <circle cx="66" cy="52" r="1.2" fill="#CCFBF1" />
        </>
      ) : mood === "thinking" ? (
        <>
          {/* Curious squint/look up */}
          <ellipse cx="36" cy="47" rx="6" ry="6" fill="#0284C7" />
          <ellipse cx="34.5" cy="45" rx="2" ry="2.5" fill="#FFFFFF" />
          <ellipse cx="64" cy="47" rx="6" ry="6" fill="#0D9488" />
          <ellipse cx="62.5" cy="45" rx="2" ry="2.5" fill="#FFFFFF" />
        </>
      ) : (
        <>
          {/* Friendly Idle Eyes */}
          <circle cx="36" cy="50" r="6" fill="#1E293B" />
          <circle cx="34.5" cy="48" r="2" fill="#FFFFFF" />
          <circle cx="64" cy="50" r="6" fill="#1E293B" />
          <circle cx="62.5" cy="48" r="2" fill="#FFFFFF" />
        </>
      )}

      {/* Soft Rosy Cheeks */}
      <ellipse cx="26" cy="58" rx="5" ry="3" fill="#FDA4AF" fillOpacity="0.7" />
      <ellipse cx="74" cy="58" rx="5" ry="3" fill="#FDA4AF" fillOpacity="0.7" />

      {/* Small Pink Nose */}
      <polygon points="50,56 46,60 54,60" fill="#F43F5E" />

      {/* Cute Cat Mouth */}
      <path
        d="M46 60 Q43 65 47 67 Q50 65 50 61 Q50 65 53 67 Q57 65 54 60"
        stroke="#475569"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Whiskers */}
      {/* Left Whiskers */}
      <line x1="16" y1="56" x2="30" y2="58" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="62" x2="29" y2="62" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right Whiskers */}
      <line x1="84" y1="56" x2="70" y2="58" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="86" y1="62" x2="71" y2="62" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

      {/* Electronics Collar / Spark Pendant */}
      <path
        d="M32 78 Q50 86 68 78"
        stroke="#6366F1"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Golden / Amber Microchip Pendant */}
      <rect
        x="45"
        y="80"
        width="10"
        height="10"
        rx="2"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      {/* Chip pins */}
      <line x1="43" y1="83" x2="45" y2="83" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="43" y1="87" x2="45" y2="87" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="55" y1="83" x2="57" y2="83" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="55" y1="87" x2="57" y2="87" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Lightning spark on pendant */}
      <path
        d="M50 82 L48 85 L51 85 L49 88"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
