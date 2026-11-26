import React from "react";
import { PlacedComponent } from "../../types";

// ==================== COLOR CODE HELPER ====================
export interface ResistorBandColors {
  band1: string;
  band2: string;
  mult: string;
  tolerance: string;
}

const DIGIT_COLORS: Record<number, string> = {
  0: "#18181b", // Black
  1: "#78350f", // Brown
  2: "#dc2626", // Red
  3: "#ea580c", // Orange
  4: "#eab308", // Yellow
  5: "#16a34a", // Green
  6: "#2563eb", // Blue
  7: "#9333ea", // Violet
  8: "#6b7280", // Gray
  9: "#f8fafc", // White
};

export function getResistorBands(ohms: number = 220): ResistorBandColors {
  const num = Number(ohms);
  const rounded = Math.max(1, Math.round(Number.isFinite(num) ? num : 220));
  const s = rounded.toString();
  const d1 = parseInt(s[0], 10) || 2;
  const d2 = s.length > 1 ? parseInt(s[1], 10) : 0;
  const exponent = Math.max(0, s.length - 2);

  return {
    band1: DIGIT_COLORS[d1] || "#dc2626",
    band2: DIGIT_COLORS[d2] || "#dc2626",
    mult: DIGIT_COLORS[exponent] || "#78350f",
    tolerance: "#d97706", // Gold 5%
  };
}

interface ComponentProps {
  comp: PlacedComponent;
  isPowered: boolean;
  isBurned: boolean;
  mode?: "realistic" | "schematic";
}

// ==================== 1. RESISTOR (Axial Ceramic Metal Film) ====================
export const Resistor2DView: React.FC<ComponentProps> = ({ comp, isPowered, isBurned, mode = "realistic" }) => {
  const ohms = comp.params?.resistanceOhms || 220;
  const bands = getResistorBands(ohms);

  if (mode === "schematic") {
    return (
      <svg width="130" height="40" viewBox="-65 -20 130 40" className="overflow-visible select-none">
        <line x1="-60" y1="0" x2="-35" y2="0" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="35" y1="0" x2="60" y2="0" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <polyline
          points="-35,0 -28,-9 -14,9 0,-9 14,9 28,-9 35,0"
          fill="none"
          stroke={isBurned ? "#ef4444" : "#38bdf8"}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <text x="0" y="-12" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
          {ohms >= 1000 ? `${ohms / 1000}kΩ` : `${ohms}Ω`}
        </text>
      </svg>
    );
  }

  return (
    <svg width="144" height="46" viewBox="-72 -23 144 46" className="overflow-visible select-none">
      <defs>
        <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="resistorBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="25%" stopColor="#ffedd5" />
          <stop offset="65%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      {/* Tinned Copper Axial Leads */}
      <line x1="-68" y1="0" x2="-34" y2="0" stroke="url(#leadGrad)" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="34" y1="0" x2="68" y2="0" stroke="url(#leadGrad)" strokeWidth="3.2" strokeLinecap="round" />

      {/* Ceramic Contoured Body (with bulging ends) */}
      <path
        d="M -34,-10 C -30,-14 -24,-14 -18,-11 L 18,-11 C 24,-14 30,-14 34,-10 C 37,-6 37,6 34,10 C 30,14 24,14 18,11 L -18,11 C -24,14 -30,14 -34,10 C -37,6 -37,-6 -34,-10 Z"
        fill={isBurned ? "#27272a" : "url(#resistorBodyGrad)"}
        stroke={isBurned ? "#ef4444" : "#b45309"}
        strokeWidth="1.2"
      />

      {/* Realistic 4-Band Color Bands with Cylindrical Reflection */}
      {!isBurned && (
        <>
          <rect x="-24" y="-12" width="5.5" height="24" rx="1" fill={bands.band1} />
          <rect x="-14" y="-11" width="5.5" height="22" rx="1" fill={bands.band2} />
          <rect x="-2" y="-11" width="5.5" height="22" rx="1" fill={bands.mult} />
          <rect x="18" y="-12" width="5.5" height="24" rx="1" fill={bands.tolerance} />
          {/* Specular gloss highlight stripe */}
          <path d="M -30,-6 L 30,-6" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.5" strokeLinecap="round" />
        </>
      )}

      {/* Lead end contact pads */}
      <circle cx="-68" cy="0" r="3.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
      <circle cx="68" cy="0" r="3.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
    </svg>
  );
};

// ==================== 2. LED (5mm T-1 3/4 Domed Epoxy Bulb) ====================
export const Led2DView: React.FC<ComponentProps> = ({ comp, isPowered, isBurned, mode = "realistic" }) => {
  const ledColor = comp.params?.color || "red";
  const glowHex =
    ledColor === "green"
      ? "#22c55e"
      : ledColor === "blue"
      ? "#3b82f6"
      : ledColor === "yellow"
      ? "#eab308"
      : ledColor === "white"
      ? "#f8fafc"
      : "#ef4444";

  if (mode === "schematic") {
    return (
      <svg width="80" height="90" viewBox="-40 -45 80 90" className="overflow-visible select-none">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
          </marker>
        </defs>
        <line x1="0" y1="-35" x2="0" y2="-12" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="0" y1="12" x2="0" y2="35" stroke="#94a3b8" strokeWidth="2.5" />
        <polygon
          points="-14,-12 14,-12 0,12"
          fill={isPowered ? glowHex : "none"}
          stroke={isBurned ? "#ef4444" : "#38bdf8"}
          strokeWidth="2.5"
        />
        <line x1="-14" y1="12" x2="14" y2="12" stroke={isBurned ? "#ef4444" : "#38bdf8"} strokeWidth="2.5" />
        <line x1="12" y1="-2" x2="24" y2="10" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
        <line x1="18" y1="-8" x2="30" y2="4" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
      </svg>
    );
  }

  const rawDuty =
    isPowered && !isBurned
      ? typeof comp.state?.activeValue === "number"
        ? Math.max(0, Math.min(1, comp.state.activeValue))
        : 1
      : 0;
  const isLit = rawDuty > 0.01 && !isBurned;
  const brightness = isLit ? Math.max(0.15, rawDuty) : 0;

  return (
    <svg width="80" height="100" viewBox="-40 -48 80 100" className="overflow-visible select-none">
      <defs>
        <radialGradient id={`ledGlow-${comp.id}`} cx="50%" cy="42%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95 * brightness} />
          <stop offset="28%" stopColor={glowHex} stopOpacity={0.9 * brightness} />
          <stop offset="65%" stopColor={glowHex} stopOpacity={0.38 * brightness} />
          <stop offset="100%" stopColor={glowHex} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`lensGrad-${comp.id}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={isLit ? 0.98 : 0.25} />
          <stop offset="38%" stopColor={glowHex} stopOpacity={isLit ? 0.95 : 0.35} />
          <stop offset="100%" stopColor={glowHex} stopOpacity={isLit ? 0.98 : 0.45} />
        </radialGradient>
      </defs>

      {/* Powered Radiant Bloom & Rays */}
      {isLit && (
        <g className="pointer-events-none">
          <circle
            cx="0"
            cy="-10"
            r={34 + 26 * brightness}
            fill={`url(#ledGlow-${comp.id})`}
          />
          <g stroke={glowHex} strokeWidth={2} strokeLinecap="round" opacity={0.85 * brightness}>
            <line x1="-26" y1="-26" x2="-34" y2="-34" />
            <line x1="26" y1="-26" x2="34" y2="-34" />
            <line x1="0" y1="-36" x2="0" y2="-46" />
            <line x1="-30" y1="-8" x2="-40" y2="-8" />
            <line x1="30" y1="-8" x2="40" y2="-8" />
          </g>
        </g>
      )}

      {/* Silver Anode (+) and Cathode (-) Lead Legs */}
      <line x1="-14" y1="12" x2="-14" y2="44" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="12" x2="14" y2="38" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      {/* Polarity markers beside legs */}
      <text x="-22" y="38" fill="#ef4444" fontSize="11" fontWeight="black" textAnchor="middle">+</text>
      <text x="22" y="36" fill="#38bdf8" fontSize="13" fontWeight="black" textAnchor="middle">−</text>

      {/* LED Plastic Rim Collar (Base) with Flat Notch on Right (Cathode) */}
      <path d="M -22,12 L 18,12 L 20,8 L -22,8 Z" fill={glowHex} fillOpacity={isLit ? 0.95 : 0.4} stroke="#1e293b" strokeWidth="1" />

      {/* 5mm Domed Lens Bulb */}
      <path
        d="M -20,8 L -20,-12 C -20,-34 20,-34 20,-12 L 20,8 Z"
        fill={isBurned ? "#3f3f46" : `url(#lensGrad-${comp.id})`}
        stroke={isBurned ? "#ef4444" : isLit ? "#ffffff" : "#0f172a"}
        strokeWidth={isLit ? "1.8" : "1.5"}
      />

      {/* Internal Leadframe & Emitter Core */}
      {!isBurned && (
        <>
          <polygon points="4,2 14,2 10,-10 6,-10" fill="#cbd5e1" opacity={isLit ? 0.8 : 0.45} />
          <line x1="-8" y1="2" x2="-8" y2="-6" stroke="#cbd5e1" strokeWidth="1.5" opacity={isLit ? 0.8 : 0.45} />
          <path d="M -8,-6 Q 0,-14 6,-10" fill="none" stroke="#fef08a" strokeWidth="0.9" opacity={isLit ? 0.95 : 0.4} />
          {isLit && (
            <circle cx="0" cy="-10" r={6 + 4 * brightness} fill="#ffffff" opacity={0.9 * brightness} />
          )}
          <path d="M -13,-24 C -7,-30 5,-30 11,-24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity={isLit ? 0.95 : 0.45} />
        </>
      )}

      {isBurned && <circle cx="0" cy="-10" r="12" fill="#000000" opacity="0.85" />}
    </svg>
  );
};

// ==================== 3. 9V BATTERY (PP3 / 6LR61 Alkaline) ====================
export const Battery9V2DView: React.FC<ComponentProps> = ({ isBurned, mode = "realistic" }) => {
  if (mode === "schematic") {
    return (
      <svg width="80" height="90" viewBox="-40 -45 80 90" className="overflow-visible select-none">
        <line x1="0" y1="-42" x2="0" y2="-16" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="-20" y1="-16" x2="20" y2="-16" stroke="#ef4444" strokeWidth="3" />
        <line x1="-10" y1="-8" x2="10" y2="-8" stroke="#64748b" strokeWidth="5" />
        <line x1="-20" y1="0" x2="20" y2="0" stroke="#ef4444" strokeWidth="3" />
        <line x1="-10" y1="8" x2="10" y2="8" stroke="#64748b" strokeWidth="5" />
        <line x1="0" y1="8" x2="0" y2="35" stroke="#38bdf8" strokeWidth="2.5" />
        <text x="24" y="-12" fill="#ef4444" fontSize="12" fontWeight="bold">+</text>
        <text x="24" y="14" fill="#38bdf8" fontSize="14" fontWeight="bold">−</text>
        <text x="0" y="32" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">9.0V</text>
      </svg>
    );
  }

  return (
    <svg width="96" height="126" viewBox="-48 -63 96 126" className="overflow-visible select-none">
      <defs>
        <linearGradient id="bat9vGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="30%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#334155" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
        <linearGradient id="copperGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>

      {/* Main Metal Rectangular Shell */}
      <rect x="-42" y="-42" width="84" height="96" rx="8" fill="url(#bat9vGrad)" stroke="#475569" strokeWidth="1.8" />

      {/* Top Header Plate */}
      <rect x="-38" y="-48" width="76" height="8" rx="2" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />

      {/* Left Male Hexagonal Stud Terminal (+) with Red Insulator Core */}
      <g>
        <circle cx="-22" cy="-48" r="9" fill="#ef4444" opacity="0.9" />
        <polygon points="-22,-55 -16,-52 -16,-44 -22,-41 -28,-44 -28,-52" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
        <text x="-22" y="-35" fill="#ef4444" fontSize="10" fontWeight="black" textAnchor="middle">+</text>
      </g>

      {/* Right Female Snap Socket Terminal (−) */}
      <g>
        <circle cx="22" cy="-48" r="10" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <circle cx="22" cy="-48" r="6.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
        <circle cx="22" cy="-48" r="3" fill="#020617" />
        <text x="22" y="-35" fill="#38bdf8" fontSize="12" fontWeight="black" textAnchor="middle">−</text>
      </g>

      {/* Copper Brand Stripe */}
      <rect x="-42" y="-12" width="84" height="20" fill="url(#copperGrad)" />

      {/* Silkscreen text */}
      <text x="0" y="2" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.05em">
        9V
      </text>
      <text x="0" y="20" fill="#cbd5e1" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        ALKALINE PP3
      </text>
      <text x="0" y="36" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        6LR61 · HEAVY DUTY
      </text>

      {/* Insulated bottom rim */}
      <rect x="-40" y="49" width="80" height="5" rx="1" fill="#020617" />
    </svg>
  );
};

// ==================== 4. BREADBOARD (400 Tie-Point Half Size) ====================
export const Breadboard2DView: React.FC<ComponentProps> = () => {
  return (
    <svg width="340" height="190" viewBox="-170 -95 340 190" className="overflow-visible select-none">
      <defs>
        <linearGradient id="bbBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>

      {/* White ABS Plastic Body with Interlocking Notches */}
      <rect x="-160" y="-85" width="320" height="170" rx="8" fill="url(#bbBodyGrad)" stroke="#cbd5e1" strokeWidth="2" />

      {/* Side Puzzle Connectors (Left Tab & Right Notch) */}
      <rect x="-166" y="-20" width="6" height="40" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="160" y="-20" width="6" height="40" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

      {/* Top Power Distribution Rails */}
      <line x1="-140" y1="-72" x2="140" y2="-72" stroke="#ef4444" strokeWidth="2" />
      <text x="-150" y="-69" fill="#ef4444" fontSize="11" fontWeight="black">+</text>
      <line x1="-140" y1="-58" x2="140" y2="-58" stroke="#3b82f6" strokeWidth="2" />
      <text x="-150" y="-55" fill="#3b82f6" fontSize="13" fontWeight="black">−</text>

      {/* Bottom Power Distribution Rails */}
      <line x1="-140" y1="58" x2="140" y2="58" stroke="#3b82f6" strokeWidth="2" />
      <text x="-150" y="61" fill="#3b82f6" fontSize="13" fontWeight="black">−</text>
      <line x1="-140" y1="72" x2="140" y2="72" stroke="#ef4444" strokeWidth="2" />
      <text x="-150" y="75" fill="#ef4444" fontSize="11" fontWeight="black">+</text>

      {/* Center Trough (0.3" DIP divider) */}
      <rect x="-145" y="-4" width="290" height="8" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />

      {/* Row Coordinate Letters (A-E and F-J) */}
      {["A", "B", "C", "D", "E"].map((letter, idx) => (
        <text key={letter} x="-150" y={-42 + idx * 8} fill="#94a3b8" fontSize="6" fontFamily="monospace" fontWeight="bold">
          {letter}
        </text>
      ))}
      {["F", "G", "H", "I", "J"].map((letter, idx) => (
        <text key={letter} x="-150" y={10 + idx * 8} fill="#94a3b8" fontSize="6" fontFamily="monospace" fontWeight="bold">
          {letter}
        </text>
      ))}

      {/* Column Coordinate Numbers: 1, 5, 10, 15, 20, 25, 30 */}
      {[1, 5, 10, 15, 20, 25, 30].map((col) => {
        const xPos = -135 + ((col - 1) / 29) * 270;
        return (
          <text key={col} x={xPos} y="-48" fill="#94a3b8" fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            {col}
          </text>
        );
      })}

      {/* Tie point pin matrix with nickel contact clips */}
      {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((x) => (
        <React.Fragment key={x}>
          {/* Top power bus pins */}
          <rect x={x - 2} y="-74" width="4" height="4" fill="#1e293b" rx="0.5" />
          <rect x={x - 2} y="-60" width="4" height="4" fill="#1e293b" rx="0.5" />
          {/* Main tie points */}
          {[-38, -30, -22, -14, -6].map((y) => (
            <rect key={y} x={x - 2} y={y} width="4" height="4" fill="#334155" rx="0.5" />
          ))}
          {[6, 14, 22, 30, 38].map((y) => (
            <rect key={y} x={x - 2} y={y} width="4" height="4" fill="#334155" rx="0.5" />
          ))}
          {/* Bottom power bus pins */}
          <rect x={x - 2} y="56" width="4" height="4" fill="#1e293b" rx="0.5" />
          <rect x={x - 2} y="70" width="4" height="4" fill="#1e293b" rx="0.5" />
        </React.Fragment>
      ))}

      {/* Silkscreen Brand Name */}
      <text x="0" y="85" fill="#94a3b8" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        BREADBOARD 400 TIE-POINTS
      </text>
    </svg>
  );
};

// ==================== 5. ARDUINO UNO REV3 ====================
export const ArduinoUno2DView: React.FC<ComponentProps> = ({ comp, isPowered }) => {
  return (
    <svg width="240" height="160" viewBox="-120 -80 240 160" className="overflow-visible select-none">
      {/* Teal/Turquoise Solder Mask PCB Board */}
      <rect x="-110" y="-70" width="220" height="140" rx="8" fill="#0891b2" stroke="#155e75" strokeWidth="2" />

      {/* Mounting Holes */}
      <circle cx="-95" cy="-55" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="95" cy="-55" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
      <circle cx="95" cy="55" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />

      {/* USB Type-B Port (Silver) on Left */}
      <rect x="-116" y="-55" width="30" height="32" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="-114" y="-47" width="16" height="16" rx="1" fill="#0f172a" />

      {/* DC Power Barrel Jack (Black) on Bottom-Left */}
      <rect x="-116" y="15" width="36" height="30" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <circle cx="-100" cy="30" r="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />

      {/* Red Reset Push Button */}
      <circle cx="-75" cy="-55" r="5" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />

      {/* 16MHz Crystal Resonator (Silver Oval) */}
      <rect x="-65" y="-10" width="16" height="8" rx="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />

      {/* ATmega328P DIP-28 Microcontroller IC in socket */}
      <rect x="-35" y="-12" width="70" height="24" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      {[-30, -20, -10, 0, 10, 20, 30].map((x) => (
        <React.Fragment key={x}>
          <line x1={x} y1="-16" x2={x} y2="-12" stroke="#cbd5e1" strokeWidth="1.8" />
          <line x1={x} y1="12" x2={x} y2="16" stroke="#cbd5e1" strokeWidth="1.8" />
        </React.Fragment>
      ))}
      <text x="0" y="3" fill="#e2e8f0" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        ATMEGA328P
      </text>

      {/* Top Female Pin Header Strip (Digital D0-D13, GND, AREF) */}
      <rect x="-60" y="-66" width="125" height="14" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
      <text x="2" y="-56" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        DIGITAL (PWM ~)
      </text>

      {/* Bottom Female Pin Header Strip (Power 5V, GND, Vin & Analog A0-A5) */}
      <rect x="-60" y="52" width="125" height="14" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
      <text x="-25" y="62" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        POWER
      </text>
      <text x="32" y="62" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        ANALOG IN
      </text>

      {/* Status LEDs on board */}
      <circle cx="48" cy="-35" r="3" fill={isPowered ? "#22c55e" : "#15803d"} />
      <text x="56" y="-33" fill="#e2e8f0" fontSize="7" fontWeight="bold">ON</text>

      <circle cx="48" cy="-22" r="3" fill={isPowered ? "#eab308" : "#854d0e"} />
      <text x="56" y="-20" fill="#e2e8f0" fontSize="7" fontWeight="bold">L13</text>

      {/* Silkscreen text */}
      <text x="60" y="20" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">
        UNO
      </text>
      <text x="60" y="30" fill="#67e8f9" fontSize="7" fontWeight="bold">
        ARDUINO REV3
      </text>
    </svg>
  );
};

// ==================== 6. ESP32 DEVKIT V1 ====================
export const Esp32DevKit2DView: React.FC<ComponentProps> = ({ isPowered }) => {
  return (
    <svg width="170" height="200" viewBox="-85 -100 170 200" className="overflow-visible select-none">
      {/* Dark Matte Black PCB */}
      <rect x="-65" y="-90" width="130" height="180" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />

      {/* Copper Meandering PCB Antenna */}
      <path
        d="M -30,-82 L 30,-82 L 30,-72 L 20,-72 L 20,-78 L 10,-78 L 10,-72 L 0,-72 L 0,-78 L -10,-78 L -10,-72 L -20,-72 L -20,-78 L -30,-78 Z"
        fill="#b45309"
        stroke="#d97706"
        strokeWidth="1"
      />

      {/* Laser-Engraved Metal RF Shield */}
      <rect x="-42" y="-62" width="84" height="68" rx="3" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="0" y="-40" fill="#0f172a" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle">
        ESP-WROOM-32
      </text>
      <text x="0" y="-28" fill="#1e293b" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        Wi-Fi + BT MCU 240MHz
      </text>

      {/* Micro-USB Port on Bottom */}
      <rect x="-18" y="74" width="36" height="18" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="-10" y="80" width="20" height="6" rx="1" fill="#0f172a" />

      {/* Left and Right Gold Header Strips */}
      <rect x="-62" y="-65" width="14" height="135" rx="2" fill="#020617" stroke="#ca8a04" strokeWidth="1" />
      <rect x="48" y="-65" width="14" height="135" rx="2" fill="#020617" stroke="#ca8a04" strokeWidth="1" />

      {/* EN and BOOT tactile buttons */}
      <circle cx="-25" cy="58" r="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
      <text x="-25" y="50" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">EN</text>

      <circle cx="25" cy="58" r="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
      <text x="25" y="50" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">BOOT</text>

      {/* Power LED (Red) */}
      <circle cx="-32" cy="28" r="3" fill={isPowered ? "#ef4444" : "#7f1d1d"} />
      <text x="-32" y="20" fill="#94a3b8" fontSize="6" textAnchor="middle">PWR</text>
    </svg>
  );
};

// ==================== 7. TACTILE PUSH BUTTON ====================
export const PushButton2DView: React.FC<ComponentProps> = ({ comp, isPowered, mode = "realistic" }) => {
  const isPressed = comp.params?.isPressed || false;

  if (mode === "schematic") {
    return (
      <svg width="80" height="60" viewBox="-40 -30 80 60" className="overflow-visible select-none">
        <line x1="-35" y1="0" x2="-14" y2="0" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="14" y1="0" x2="35" y2="0" stroke="#94a3b8" strokeWidth="2.5" />
        <circle cx="-14" cy="0" r="3" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="14" cy="0" r="3" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <line
          x1="-14"
          y1="-3"
          x2={isPressed ? "14" : "10"}
          y2={isPressed ? "-3" : "-16"}
          stroke={isPressed ? "#22c55e" : "#e2e8f0"}
          strokeWidth="2.5"
        />
        <line x1="0" y1={isPressed ? "-3" : "-10"} x2="0" y2="-22" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg width="90" height="80" viewBox="-45 -40 90 80" className="overflow-visible select-none">
      {/* 4 Gullwing Metal Leads */}
      <path d="M -36,-16 L -26,-16" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M -36,16 L -26,16" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 26,-16 L 36,-16" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 26,16 L 36,16" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />

      {/* Square Black Molded Base */}
      <rect x="-26" y="-26" width="52" height="52" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

      {/* Silver Top Faceplate */}
      <rect x="-22" y="-22" width="44" height="44" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

      {/* 4 Corner Brass Rivets */}
      <circle cx="-17" cy="-17" r="1.8" fill="#475569" />
      <circle cx="17" cy="-17" r="1.8" fill="#475569" />
      <circle cx="-17" cy="17" r="1.8" fill="#475569" />
      <circle cx="17" cy="17" r="1.8" fill="#475569" />

      {/* Round Plunger Button (Depresses on click!) */}
      <circle
        cx="0"
        cy="0"
        r={isPressed ? 11 : 13}
        fill={isPressed ? "#0284c7" : "#0f172a"}
        stroke={isPressed ? "#38bdf8" : "#475569"}
        strokeWidth="2"
      />
      <circle cx="0" cy="0" r={isPressed ? 7 : 9} fill={isPressed ? "#38bdf8" : "#1e293b"} />

      {/* Terminal solder pins */}
      <circle cx="-36" cy="-16" r="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <circle cx="-36" cy="16" r="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <circle cx="36" cy="-16" r="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <circle cx="36" cy="16" r="3" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
    </svg>
  );
};

// ==================== 8. DIODE 1N4007 ====================
export const Diode2DView: React.FC<ComponentProps> = ({ isBurned, mode = "realistic" }) => {
  if (mode === "schematic") {
    return (
      <svg width="120" height="40" viewBox="-60 -20 120 40" className="overflow-visible select-none">
        <line x1="-50" y1="0" x2="-12" y2="0" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="12" y1="0" x2="50" y2="0" stroke="#94a3b8" strokeWidth="2.5" />
        <polygon points="-12,-12 12,0 -12,12" fill="#38bdf8" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="12" y1="-12" x2="12" y2="12" stroke="#e2e8f0" strokeWidth="3" />
        <text x="0" y="-14" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">1N4007</text>
      </svg>
    );
  }

  return (
    <svg width="130" height="40" viewBox="-65 -20 130 40" className="overflow-visible select-none">
      <line x1="-64" y1="0" x2="-28" y2="0" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="0" x2="64" y2="0" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

      {/* Black DO-41 Epoxy Package */}
      <rect x="-28" y="-11" width="56" height="22" rx="4" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

      {/* Silver Cathode Band */}
      <rect x="14" y="-11" width="10" height="22" fill="#e2e8f0" />
      <text x="-8" y="3" fill="#a1a1aa" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        1N4007
      </text>

      <circle cx="-64" cy="0" r="3.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <circle cx="64" cy="0" r="3.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
    </svg>
  );
};

// ==================== 9. ELECTROLYTIC CAPACITOR ====================
export const Capacitor2DView: React.FC<ComponentProps> = ({ isBurned, mode = "realistic" }) => {
  if (mode === "schematic") {
    return (
      <svg width="60" height="80" viewBox="-30 -40 60 80" className="overflow-visible select-none">
        <line x1="0" y1="-35" x2="0" y2="-8" stroke="#94a3b8" strokeWidth="2.5" />
        <line x1="-16" y1="-8" x2="16" y2="-8" stroke="#38bdf8" strokeWidth="3" />
        <path d="M -16,6 C -8,0 8,0 16,6" fill="none" stroke="#94a3b8" strokeWidth="3" />
        <line x1="0" y1="6" x2="0" y2="35" stroke="#94a3b8" strokeWidth="2.5" />
        <text x="14" y="-12" fill="#ef4444" fontSize="12" fontWeight="bold">+</text>
      </svg>
    );
  }

  return (
    <svg width="70" height="96" viewBox="-35 -48 70 96" className="overflow-visible select-none">
      <line x1="-14" y1="16" x2="-14" y2="42" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="16" x2="14" y2="42" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      {/* Blue Aluminum Can */}
      <rect x="-26" y="-36" width="52" height="52" rx="6" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="1.5" />

      {/* Scored Vent Header Cross (+) */}
      <rect x="-24" y="-42" width="48" height="8" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
      <line x1="-6" y1="-38" x2="6" y2="-38" stroke="#64748b" strokeWidth="1.5" />
      <line x1="0" y1="-41" x2="0" y2="-35" stroke="#64748b" strokeWidth="1.5" />

      {/* White Cathode Stripe */}
      <rect x="12" y="-36" width="12" height="52" fill="#f8fafc" />
      <text x="18" y="-20" fill="#0f172a" fontSize="11" fontWeight="black" textAnchor="middle">−</text>
      <text x="18" y="-6" fill="#0f172a" fontSize="11" fontWeight="black" textAnchor="middle">−</text>
      <text x="18" y="8" fill="#0f172a" fontSize="11" fontWeight="black" textAnchor="middle">−</text>

      <text x="-4" y="-8" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        100μF
      </text>
      <text x="-4" y="4" fill="#bfdbfe" fontSize="8" fontFamily="monospace" textAnchor="middle">
        25V
      </text>

      <circle cx="-14" cy="42" r="3.5" fill="#f1f5f9" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx="14" cy="42" r="3.5" fill="#f1f5f9" stroke="#38bdf8" strokeWidth="1.5" />
    </svg>
  );
};

// ==================== 10. HC-SR04 ULTRASONIC SENSOR ====================
export const SensorUltrasonic2DView: React.FC<ComponentProps> = () => {
  return (
    <svg width="150" height="80" viewBox="-75 -40 150 80" className="overflow-visible select-none">
      <rect x="-65" y="-30" width="130" height="60" rx="5" fill="#1e40af" stroke="#1d4ed8" strokeWidth="1.5" />

      {/* Left Transmitter Can ("T") */}
      <circle cx="-34" cy="-2" r="22" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <circle cx="-34" cy="-2" r="16" fill="#475569" />
      <circle cx="-34" cy="-2" r="14" fill="#0f172a" />
      <text x="-34" y="2" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">T</text>

      {/* Right Receiver Can ("R") */}
      <circle cx="34" cy="-2" r="22" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <circle cx="34" cy="-2" r="16" fill="#475569" />
      <circle cx="34" cy="-2" r="14" fill="#0f172a" />
      <text x="34" y="2" fill="#ffffff" fontSize="12" fontWeight="black" textAnchor="middle">R</text>

      {/* 4 Header Pins at Bottom */}
      <rect x="-35" y="24" width="70" height="12" rx="2" fill="#020617" />
      <text x="0" y="33" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        VCC  TRIG  ECHO  GND
      </text>
    </svg>
  );
};

// ==================== 11. POTENTIOMETER ====================
export const Potentiometer2DView: React.FC<ComponentProps> = ({ comp }) => {
  const valuePct = comp.params?.valuePct ?? 50;
  const angleDeg = -135 + (valuePct / 100) * 270;

  return (
    <svg width="90" height="100" viewBox="-45 -50 90 100" className="overflow-visible select-none">
      <circle cx="0" cy="-6" r="32" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
      <circle cx="0" cy="-6" r="26" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />

      {/* Rotating Dial Knob */}
      <g transform={`rotate(${angleDeg}, 0, -6)`}>
        <circle cx="0" cy="-6" r="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="0" y1="-24" x2="0" y2="-12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 3 Solder Lug Terminals */}
      <line x1="-26" y1="24" x2="-26" y2="44" stroke="#cbd5e1" strokeWidth="3" />
      <line x1="0" y1="26" x2="0" y2="46" stroke="#cbd5e1" strokeWidth="3" />
      <line x1="26" y1="24" x2="26" y2="44" stroke="#cbd5e1" strokeWidth="3" />

      <circle cx="-26" cy="44" r="3.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <circle cx="0" cy="46" r="3.5" fill="#f1f5f9" stroke="#38bdf8" strokeWidth="1" />
      <circle cx="26" cy="44" r="3.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
    </svg>
  );
};

// ==================== 12. DC MOTOR ====================
export const Motor2DView: React.FC<ComponentProps> = ({ isPowered }) => {
  return (
    <svg width="100" height="100" viewBox="-50 -50 100 100" className="overflow-visible select-none">
      <circle cx="0" cy="-4" r="34" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
      <circle cx="0" cy="-4" r="26" fill="#b45309" stroke="#92400e" strokeWidth="1" />
      <circle cx="0" cy="-4" r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />

      {/* Spinning Rotor Blade */}
      <g transform="translate(0, -4)" className={isPowered ? "animate-spin" : ""}>
        <line x1="-22" y1="0" x2="22" y2="0" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        <circle cx="-20" cy="0" r="3" fill="#ef4444" />
        <circle cx="20" cy="0" r="3" fill="#38bdf8" />
      </g>

      <line x1="-20" y1="30" x2="-20" y2="44" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="20" y1="30" x2="20" y2="44" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="-20" cy="44" r="3.5" fill="#f1f5f9" stroke="#ef4444" strokeWidth="1" />
      <circle cx="20" cy="44" r="3.5" fill="#f1f5f9" stroke="#38bdf8" strokeWidth="1" />
    </svg>
  );
};

// ==================== 13. BUZZER / PIEZO ====================
export const Buzzer2DView: React.FC<ComponentProps> = ({ isPowered }) => {
  return (
    <svg width="80" height="90" viewBox="-40 -45 80 90" className="overflow-visible select-none">
      <circle cx="0" cy="-8" r="30" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      <circle cx="0" cy="-8" r="8" fill="#020617" stroke="#475569" strokeWidth="1" />

      {isPowered && (
        <g stroke="#38bdf8" strokeWidth="1.5" fill="none" className="animate-ping origin-center">
          <circle cx="0" cy="-8" r="16" opacity="0.6" />
        </g>
      )}

      <text x="-16" y="-14" fill="#ef4444" fontSize="12" fontWeight="bold">+</text>

      <line x1="-16" y1="22" x2="-16" y2="38" stroke="#cbd5e1" strokeWidth="3" />
      <line x1="16" y1="22" x2="16" y2="38" stroke="#cbd5e1" strokeWidth="3" />
      <circle cx="-16" cy="38" r="3.5" fill="#f1f5f9" stroke="#ef4444" strokeWidth="1" />
      <circle cx="16" cy="38" r="3.5" fill="#f1f5f9" stroke="#38bdf8" strokeWidth="1" />
    </svg>
  );
};

// ==================== 14. PHOTORESISTOR (LDR) ====================
export const Photoresistor2DView: React.FC<ComponentProps> = () => {
  return (
    <svg width="70" height="80" viewBox="-35 -40 70 80" className="overflow-visible select-none">
      <circle cx="0" cy="-10" r="22" fill="#fed7aa" stroke="#c2410c" strokeWidth="1.5" />
      <path
        d="M -14,-16 C -6,-20 6,-20 14,-16 C 14,-10 -14,-10 -14,-4 C -14,2 14,2 14,8 C 6,10 -6,10 -14,6"
        fill="none"
        stroke="#dc2626"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line x1="-14" y1="12" x2="-14" y2="34" stroke="#cbd5e1" strokeWidth="3" />
      <line x1="14" y1="12" x2="14" y2="34" stroke="#cbd5e1" strokeWidth="3" />
      <circle cx="-14" cy="34" r="3.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
      <circle cx="14" cy="34" r="3.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
    </svg>
  );
};

// ==================== 15. LI-PO BATTERY 3.7V ====================
export const BatteryLipo2DView: React.FC<ComponentProps> = ({ mode = "realistic" }) => {
  if (mode === "schematic") {
    return (
      <svg width="80" height="90" viewBox="-40 -45 80 90" className="overflow-visible select-none">
        <line x1="-18" y1="-46" x2="-18" y2="-14" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="18" y1="-46" x2="18" y2="14" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="-22" y1="-14" x2="22" y2="-14" stroke="#ef4444" strokeWidth="3" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#94a3b8" strokeWidth="5" />
        <line x1="-22" y1="14" x2="22" y2="14" stroke="#38bdf8" strokeWidth="3" />
        <text x="0" y="34" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">Li-Po 3.7V</text>
      </svg>
    );
  }
  return (
    <svg width="96" height="114" viewBox="-48 -57 96 114" className="overflow-visible select-none">
      <defs>
        <linearGradient id="lipoFoil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
      {/* Top wire leads */}
      <path d="M -18,-46 L -18,-28" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
      <path d="M 18,-46 L 18,-28" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
      <text x="-28" y="-36" fill="#ef4444" fontSize="11" fontWeight="black">+</text>
      <text x="28" y="-36" fill="#38bdf8" fontSize="12" fontWeight="black">−</text>

      {/* Silver Pouch Body */}
      <rect x="-36" y="-28" width="72" height="78" rx="7" fill="url(#lipoFoil)" stroke="#475569" strokeWidth="1.5" />
      <rect x="-36" y="-12" width="72" height="48" fill="#1d4ed8" />
      <rect x="-30" y="-28" width="60" height="8" rx="2" fill="#facc15" opacity="0.9" />
      <text x="0" y="8" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">Li-Po</text>
      <text x="0" y="22" fill="#bfdbfe" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3.7V 5000mAh</text>
    </svg>
  );
};

// ==================== 16. 18650 LI-ION CELL ====================
export const Battery186502DView: React.FC<ComponentProps> = ({ mode = "realistic" }) => {
  if (mode === "schematic") {
    return (
      <svg width="64" height="120" viewBox="-32 -60 64 120" className="overflow-visible select-none">
        <line x1="0" y1="-54" x2="0" y2="-16" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="-18" y1="-16" x2="18" y2="-16" stroke="#ef4444" strokeWidth="3" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#94a3b8" strokeWidth="5" />
        <line x1="0" y1="0" x2="0" y2="54" stroke="#38bdf8" strokeWidth="2.5" />
        <text x="16" y="-22" fill="#ef4444" fontSize="12" fontWeight="bold">+</text>
        <text x="16" y="20" fill="#38bdf8" fontSize="14" fontWeight="bold">−</text>
      </svg>
    );
  }
  return (
    <svg width="64" height="124" viewBox="-32 -62 64 124" className="overflow-visible select-none">
      <defs>
        <linearGradient id="cell18650Grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#065f46" />
          <stop offset="40%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Positive Button Cap */}
      <rect x="-10" y="-54" width="20" height="8" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
      <rect x="-20" y="-46" width="40" height="5" rx="1" fill="#ef4444" />
      {/* Main Cell */}
      <rect x="-22" y="-41" width="44" height="88" rx="5" fill="url(#cell18650Grad)" stroke="#064e3b" strokeWidth="1.5" />
      {/* Negative Cap */}
      <rect x="-18" y="47" width="36" height="7" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
      <text x="0" y="-12" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle">18650</text>
      <text x="0" y="4" fill="#d1fae5" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">3.7V</text>
      <text x="0" y="24" fill="#fde047" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">LI-ION</text>
    </svg>
  );
};

// ==================== 17. USB-C POWER 5V ====================
export const UsbPower2DView: React.FC<ComponentProps> = ({ isPowered }) => {
  return (
    <svg width="96" height="76" viewBox="-48 -38 96 76" className="overflow-visible select-none">
      <rect x="-38" y="-24" width="76" height="52" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.8" />
      {/* Brushed Steel USB-C Port */}
      <rect x="-18" y="-32" width="36" height="22" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="-12" y="-28" width="24" height="8" rx="2" fill="#020617" />
      <circle cx="-24" cy="4" r="3" fill={isPowered ? "#22c55e" : "#15803d"} />
      <text x="0" y="4" fill="#38bdf8" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">USB-C</text>
      <text x="-24" y="20" fill="#ef4444" fontSize="8" fontWeight="bold" textAnchor="middle">+5V</text>
      <text x="24" y="20" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">GND</text>
    </svg>
  );
};

// ==================== 18. SG90 SERVO MOTOR ====================
export const Servo2DView: React.FC<ComponentProps> = ({ comp }) => {
  const angleDeg = comp.params?.angleDeg ?? 90;
  return (
    <svg width="96" height="106" viewBox="-48 -53 96 106" className="overflow-visible select-none">
      {/* Mounting Ears */}
      <rect x="-42" y="-12" width="84" height="12" rx="2" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1" />
      {/* Translucent Blue Case */}
      <rect x="-28" y="-32" width="56" height="58" rx="4" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.5" />
      {/* Gear Hub & Horn */}
      <circle cx="0" cy="-14" r="14" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.2" />
      <g transform={`translate(0, -14) rotate(${angleDeg - 90})`}>
        <rect x="-5" y="-24" width="10" height="32" rx="5" fill="#f8fafc" stroke="#64748b" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="4" fill="#94a3b8" />
      </g>
      {/* 3-Wire Ribbon */}
      <line x1="-18" y1="26" x2="-18" y2="42" stroke="#78350f" strokeWidth="3.5" />
      <line x1="0" y1="26" x2="0" y2="42" stroke="#ef4444" strokeWidth="3.5" />
      <line x1="18" y1="26" x2="18" y2="42" stroke="#facc15" strokeWidth="3.5" />
      <text x="0" y="16" fill="#bfdbfe" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">SG90</text>
    </svg>
  );
};

// ==================== 19. LCD 1602 / OLED I2C DISPLAY ====================
export const DisplayI2C2DView: React.FC<ComponentProps> = ({ comp, isPowered }) => {
  const line1 = comp.params?.line1 || "ElectroForge Lab";
  const line2 = comp.params?.line2 || "Status: OK";
  return (
    <svg width="160" height="104" viewBox="-80 -52 160 104" className="overflow-visible select-none">
      {/* Green/Blue Module PCB */}
      <rect x="-74" y="-36" width="148" height="80" rx="6" fill="#15803d" stroke="#166534" strokeWidth="1.8" />
      {/* Top 4-pin header bar */}
      <rect x="-40" y="-48" width="80" height="14" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
      <text x="-30" y="-28" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">GND</text>
      <text x="-10" y="-28" fill="#fca5a5" fontSize="6" fontWeight="bold" textAnchor="middle">VCC</text>
      <text x="10" y="-28" fill="#93c5fd" fontSize="6" fontWeight="bold" textAnchor="middle">SDA</text>
      <text x="30" y="-28" fill="#fde047" fontSize="6" fontWeight="bold" textAnchor="middle">SCL</text>
      {/* Display Bezel & Screen */}
      <rect x="-64" y="-22" width="128" height="56" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <rect x="-56" y="-14" width="112" height="40" rx="2" fill={isPowered ? "#1d4ed8" : "#090d16"} />
      <text x="-50" y="2" fill={isPowered ? "#e0f2fe" : "#475569"} fontSize="8" fontFamily="monospace" fontWeight="bold">
        {String(line1).slice(0, 16)}
      </text>
      <text x="-50" y="16" fill={isPowered ? "#bae6fd" : "#334155"} fontSize="8" fontFamily="monospace">
        {String(line2).slice(0, 16)}
      </text>
    </svg>
  );
};

// ==================== MASTER COMPONENT RENDERER ====================
export const Realistic2DComponentGraphic: React.FC<{
  comp: PlacedComponent;
  mode?: "realistic" | "schematic";
}> = ({ comp, mode = "realistic" }) => {
  const type = comp.type.toLowerCase();
  const isPowered = !!comp.state?.isPowered;
  const isBurned = (comp.state?.healthPct ?? 100) <= 0;

  if (type === "breadboard_half" || type.includes("breadboard")) {
    return <Breadboard2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "resistor" || type.includes("resistor")) {
    return <Resistor2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "led" || type.includes("led")) {
    return <Led2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "battery_9v" || type.includes("battery_9v")) {
    return <Battery9V2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "battery_lipo" || type.includes("lipo")) {
    return <BatteryLipo2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "battery_18650" || type.includes("18650")) {
    return <Battery186502DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("usb")) {
    return <UsbPower2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "push_button" || type === "pushbutton" || type.includes("button")) {
    return <PushButton2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type === "diode" || type.includes("diode") || type.includes("1n4007")) {
    return <Diode2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("capacitor_electrolytic") || type.includes("electrolytic")) {
    return <Capacitor2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("arduino")) {
    return <ArduinoUno2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("esp32") || type.includes("mcu")) {
    return <Esp32DevKit2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("ultrasonic") || type.includes("hcsr04") || type.includes("sensor_ultrasonic")) {
    return <SensorUltrasonic2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("potentiometer") || type.includes("pot")) {
    return <Potentiometer2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("servo")) {
    return <Servo2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("motor") && !type.includes("servo") && !type.includes("driver")) {
    return <Motor2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("buzzer") || type.includes("piezo")) {
    return <Buzzer2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.includes("photoresistor") || type.includes("ldr")) {
    return <Photoresistor2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }
  if (type.startsWith("tv_") || type.startsWith("laptop_") || type.startsWith("smarthome_")) {
    const isDisplay = type === "tv_panel" || type === "tv_backlight" || type === "laptop_screen" || type === "smarthome_oled";
    const isPower = type === "tv_smps" || type === "tv_ac_inlet" || type === "laptop_battery" || type === "laptop_pmic" || type === "smarthome_psu";
    const isChassis = type === "tv_chassis" || type === "tv_bezel" || type === "laptop_chassis" || type === "laptop_topcase";
    const w = type === "tv_panel" || type === "tv_backlight" || type === "tv_chassis" ? 210 : type.includes("motherboard") || type.includes("mainboard") || type === "tv_smps" ? 150 : 124;
    const h = type === "tv_panel" || type === "tv_backlight" || type === "tv_chassis" ? 120 : 84;
    const fill = isDisplay
      ? isPowered ? "#0369a1" : "#090d16"
      : isPower
      ? "#451a03"
      : isChassis
      ? "#1e293b"
      : "#064e3b";
    const stroke = isDisplay
      ? isPowered ? "#38bdf8" : "#334155"
      : isPower
      ? "#f59e0b"
      : isChassis
      ? "#64748b"
      : "#10b981";
    return (
      <svg width={w} height={h} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} className="overflow-visible select-none">
        <rect
          x={-w / 2 + 6}
          y={-h / 2 + 6}
          width={w - 12}
          height={h - 12}
          rx="8"
          fill={fill}
          fillOpacity={isChassis ? 0.55 : 0.95}
          stroke={stroke}
          strokeWidth={isPowered ? "2.4" : "1.6"}
        />
        {isDisplay && isPowered && (
          <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx="4" fill="#0ea5e9" fillOpacity="0.35" />
        )}
        <circle cx={-w / 2 + 16} cy={-h / 2 + 16} r="3" fill={isPowered ? "#22c55e" : "#475569"} />
        <text x="0" y="-2" fill="#f8fafc" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          {(comp.name || comp.type).slice(0, 18)}
        </text>
        <text x="0" y="13" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
          {type.toUpperCase()}
        </text>
      </svg>
    );
  }
  if (type.includes("lcd") || type.includes("oled") || type.includes("display")) {
    return <DisplayI2C2DView comp={comp} isPowered={isPowered} isBurned={isBurned} mode={mode} />;
  }

  // Fallback realistic PCB module card with clear name
  return (
    <svg width="116" height="74" viewBox="-58 -37 116 74" className="overflow-visible select-none">
      <rect x="-48" y="-28" width="96" height="56" rx="7" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx="-40" cy="-20" r="2.5" fill="#cbd5e1" />
      <circle cx="40" cy="-20" r="2.5" fill="#cbd5e1" />
      <text x="0" y="3" fill="#e2e8f0" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        {(comp.name || comp.type).slice(0, 14)}
      </text>
    </svg>
  );
};
