import React from "react";
import { ExperimentLabId } from "../../types";

interface Props {
  experimentId: ExperimentLabId | string;
  theme?: "dark" | "light";
  compact?: boolean;
  className?: string;
}

/**
 * Renders a crisp, transparent mathematical formula SVG with zero background box
 * ("прям только без лишнего фона") using stacked fractions, roots, and subscripts.
 */
export const ExperimentFormulaGraphic: React.FC<Props> = ({
  experimentId,
  theme = "dark",
  compact = false,
  className = "",
}) => {
  const mainInk = theme === "dark" ? "#FACC15" : "#141416";
  const accentInk = theme === "dark" ? "#93C5FD" : "#FF5C35";
  const mutedInk = theme === "dark" ? "#CBD5E1" : "#4B5563";
  const hClass = compact ? "h-7" : "h-9 sm:h-10";
  const fontFamily = "Georgia, 'Times New Roman', serif";

  switch (experimentId) {
    case "ohms_law_circuit":
      return (
        <svg
          viewBox="0 0 110 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="I = U / R"
          role="img"
        >
          <text x="8" y="29" fill={mainInk} fontSize="22" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            I
          </text>
          <text x="27" y="29" fill={mutedInk} fontSize="20" fontWeight="600" fontFamily={fontFamily}>
            =
          </text>
          <text x="64" y="18" textAnchor="middle" fill={accentInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            U
          </text>
          <line x1="48" y1="23" x2="82" y2="23" stroke={mutedInk} strokeWidth="1.8" strokeLinecap="round" />
          <text x="65" y="40" textAnchor="middle" fill={mainInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R
          </text>
        </svg>
      );

    case "resistivity_determination":
      return (
        <svg
          viewBox="0 0 128 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="R = ρ · L / S"
          role="img"
        >
          <text x="6" y="29" fill={mainInk} fontSize="21" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R
          </text>
          <text x="27" y="29" fill={mutedInk} fontSize="20" fontWeight="600" fontFamily={fontFamily}>
            =
          </text>
          <text x="48" y="29" fill={accentInk} fontSize="21" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            ρ
          </text>
          <text x="63" y="28" fill={mutedInk} fontSize="18" fontFamily={fontFamily}>
            ·
          </text>
          <text x="92" y="18" textAnchor="middle" fill={mainInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            L
          </text>
          <line x1="75" y1="23" x2="109" y2="23" stroke={mutedInk} strokeWidth="1.8" strokeLinecap="round" />
          <text x="92" y="40" textAnchor="middle" fill={accentInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            S
          </text>
        </svg>
      );

    case "series_parallel_connection":
      return (
        <svg
          viewBox="0 0 240 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="R посл = R1 + R2"
          role="img"
        >
          <text x="4" y="28" fill={mainInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="4" fontSize="11" fontStyle="normal">посл</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> = </tspan>
            <tspan fill={accentInk}>R</tspan>
            <tspan dy="4" fontSize="11" fontStyle="normal" fill={accentInk}>1</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> + </tspan>
            <tspan fill={accentInk}>R</tspan>
            <tspan dy="4" fontSize="11" fontStyle="normal" fill={accentInk}>2</tspan>
          </text>
        </svg>
      );

    case "emf_internal_resistance":
      return (
        <svg
          viewBox="0 0 156 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="I = E / (R + r)"
          role="img"
        >
          <text x="8" y="29" fill={mainInk} fontSize="21" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            I
          </text>
          <text x="24" y="29" fill={mutedInk} fontSize="20" fontWeight="600" fontFamily={fontFamily}>
            =
          </text>
          <text x="92" y="18" textAnchor="middle" fill={accentInk} fontSize="19" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            ℰ
          </text>
          <line x1="48" y1="23" x2="138" y2="23" stroke={mutedInk} strokeWidth="1.8" strokeLinecap="round" />
          <text x="93" y="40" textAnchor="middle" fill={mainInk} fontSize="17" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="3" fontSize="10" fontStyle="normal">н</tspan>
            <tspan dy="-3" fill={mutedInk} fontStyle="normal"> + </tspan>
            <tspan fill={accentInk}>r</tspan>
          </text>
        </svg>
      );

    case "rc_capacitor_transient":
      return (
        <svg
          viewBox="0 0 198 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="τ = R · C"
          role="img"
        >
          <text x="8" y="29" fill={mainInk} fontSize="21" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            τ
          </text>
          <text x="25" y="29" fill={mutedInk} fontSize="19" fontFamily={fontFamily}>
            =
          </text>
          <text x="44" y="29" fill={accentInk} fontSize="20" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R · C
          </text>
          <text x="97" y="29" fill={mutedInk} fontSize="16" fontFamily={fontFamily}>
            ,
          </text>
          <text x="112" y="29" fill={mainInk} fontSize="17" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            U(t) ~ 1 − e<tspan dy="-7" fontSize="11">−t/τ</tspan>
          </text>
        </svg>
      );

    case "diode_iv_curve":
      return (
        <svg
          viewBox="0 0 185 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="I = Is · (e^(U/Ut) - 1)"
          role="img"
        >
          <text x="8" y="30" fill={mainInk} fontSize="19" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            I
            <tspan fill={mutedInk} fontStyle="normal"> = </tspan>
            <tspan fill={accentInk}>I</tspan>
            <tspan dy="4" fontSize="11" fontStyle="normal" fill={accentInk}>s</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> · (</tspan>
            <tspan fill={mainInk}>e</tspan>
            <tspan dy="-8" fontSize="11" fill={accentInk}>U/Uₜ</tspan>
            <tspan dy="8" fill={mutedInk} fontStyle="normal"> − 1)</tspan>
          </text>
        </svg>
      );

    case "joule_lenz_heating":
      return (
        <svg
          viewBox="0 0 182 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="Q = I² · R · t"
          role="img"
        >
          <text x="8" y="30" fill={mainInk} fontSize="20" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            Q
            <tspan fill={mutedInk} fontStyle="normal"> = </tspan>
            <tspan fill={accentInk}>I</tspan>
            <tspan dy="-7" fontSize="12" fontStyle="normal" fill={accentInk}>2</tspan>
            <tspan dy="7" fill={mutedInk} fontStyle="normal"> · </tspan>
            <tspan fill={mainInk}>R · t</tspan>
          </text>
        </svg>
      );

    case "potentiometer_divider":
      return (
        <svg
          viewBox="0 0 175 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="U вых = U вх · R2 / (R1 + R2)"
          role="img"
        >
          <text x="6" y="29" fill={mainInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            U<tspan dy="4" fontSize="10" fontStyle="normal">вых</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> = </tspan>
            <tspan fill={accentInk}>U</tspan>
            <tspan dy="4" fontSize="10" fontStyle="normal" fill={accentInk}>вх</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> ·</tspan>
          </text>
          <text x="132" y="18" textAnchor="middle" fill={mainInk} fontSize="16" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="3" fontSize="10" fontStyle="normal">2</tspan>
          </text>
          <line x1="97" y1="23" x2="167" y2="23" stroke={mutedInk} strokeWidth="1.7" strokeLinecap="round" />
          <text x="132" y="40" textAnchor="middle" fill={accentInk} fontSize="15" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="3" fontSize="10" fontStyle="normal">1</tspan>
            <tspan dy="-3" fill={mutedInk} fontStyle="normal"> + </tspan>
            R<tspan dy="3" fontSize="10" fontStyle="normal">2</tspan>
          </text>
        </svg>
      );

    case "wheatstone_bridge":
      return (
        <svg
          viewBox="0 0 156 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="Rx = R3 · R2 / R1"
          role="img"
        >
          <text x="6" y="29" fill={mainInk} fontSize="19" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="4" fontSize="11" fontStyle="normal">x</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> = </tspan>
            <tspan fill={accentInk}>R</tspan>
            <tspan dy="4" fontSize="11" fontStyle="normal" fill={accentInk}>3</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> ·</tspan>
          </text>
          <text x="115" y="18" textAnchor="middle" fill={mainInk} fontSize="16" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="3" fontSize="10" fontStyle="normal">2</tspan>
          </text>
          <line x1="94" y1="23" x2="136" y2="23" stroke={mutedInk} strokeWidth="1.7" strokeLinecap="round" />
          <text x="115" y="40" textAnchor="middle" fill={accentInk} fontSize="16" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="3" fontSize="10" fontStyle="normal">1</tspan>
          </text>
        </svg>
      );

    case "photoresistor_illuminance":
      return (
        <svg
          viewBox="0 0 142 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="Rф = A / E^α"
          role="img"
        >
          <text x="8" y="29" fill={mainInk} fontSize="19" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R<tspan dy="4" fontSize="11" fontStyle="normal">ф</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> = </tspan>
          </text>
          <text x="88" y="18" textAnchor="middle" fill={accentInk} fontSize="17" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            A
          </text>
          <line x1="65" y1="23" x2="112" y2="23" stroke={mutedInk} strokeWidth="1.7" strokeLinecap="round" />
          <text x="88" y="40" textAnchor="middle" fill={mainInk} fontSize="17" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            E<tspan dy="-5" fontSize="11" fill={accentInk}>α</tspan>
          </text>
        </svg>
      );

    case "thermistor_ntc_characteristics":
      return (
        <svg
          viewBox="0 0 182 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="R(T) = R0 · e^(B/T)"
          role="img"
        >
          <text x="6" y="30" fill={mainInk} fontSize="18" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            R(T)
            <tspan fill={mutedInk} fontStyle="normal"> = </tspan>
            <tspan fill={accentInk}>R</tspan>
            <tspan dy="4" fontSize="10" fontStyle="normal" fill={accentInk}>0</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> · </tspan>
            <tspan fill={mainInk}>e</tspan>
            <tspan dy="-8" fontSize="11" fill={accentInk}>B·(1/T − 1/T₀)</tspan>
          </text>
        </svg>
      );

    case "rlc_resonance_filters":
      return (
        <svg
          viewBox="0 0 165 46"
          className={`${hClass} w-auto select-none shrink-0 ${className}`}
          aria-label="f0 = 1 / (2π√(L·C))"
          role="img"
        >
          <text x="6" y="29" fill={mainInk} fontSize="19" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            f<tspan dy="4" fontSize="11" fontStyle="normal">0</tspan>
            <tspan dy="-4" fill={mutedInk} fontStyle="normal"> =</tspan>
          </text>
          <text x="98" y="18" textAnchor="middle" fill={accentInk} fontSize="16" fontWeight="700" fontFamily={fontFamily}>
            1
          </text>
          <line x1="48" y1="23" x2="152" y2="23" stroke={mutedInk} strokeWidth="1.7" strokeLinecap="round" />
          <text x="58" y="40" fill={mainInk} fontSize="16" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            2π
          </text>
          {/* Radical sign */}
          <path
            d="M 80 35 L 84 41 L 90 27 L 144 27"
            fill="none"
            stroke={accentInk}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="118" y="40" textAnchor="middle" fill={mainInk} fontSize="15" fontStyle="italic" fontWeight="700" fontFamily={fontFamily}>
            L · C
          </text>
        </svg>
      );

    default:
      return null;
  }
};
