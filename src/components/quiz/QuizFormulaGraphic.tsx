import React, { useMemo } from "react";

interface Props {
  formulaKey: string;
  caption?: string;
  compact?: boolean;
  className?: string;
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function buildFormulaSvg(formulaKey: string): { width: number; height: number; inner: string; alt: string } {
  switch (formulaKey) {
    case "led_resistor":
      return {
        width: 560,
        height: 150,
        alt: "R = (Vcc - Vf) / If = (5.0 В - 2.0 В) / 0.02 А",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ДАНО (СХЕМА СВЕТОДИОДА):</text>
          <rect x="24" y="38" width="215" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="38" y="64" fill="#E2E8F0" font-size="14" font-family="${MONO}">V<tspan dy="3" font-size="10">cc</tspan><tspan dy="-3"> = </tspan><tspan fill="#FACC15" font-weight="700">5.0 В</tspan></text>
          <text x="38" y="88" fill="#E2E8F0" font-size="14" font-family="${MONO}">V<tspan dy="3" font-size="10">f</tspan><tspan dy="-3">  = </tspan><tspan fill="#93C5FD" font-weight="700">2.0 В</tspan></text>
          <text x="38" y="112" fill="#E2E8F0" font-size="14" font-family="${MONO}">I<tspan dy="3" font-size="10">f</tspan><tspan dy="-3">  = </tspan><tspan fill="#34D399" font-weight="700">20 мА (0.02 А)</tspan></text>

          <text x="262" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">РАСЧЁТНАЯ ФОРМУЛА:</text>
          <text x="266" y="92" fill="#FACC15" font-size="30" font-style="italic" font-weight="700" font-family="${SERIF}">R</text>
          <text x="296" y="92" fill="#CBD5E1" font-size="26" font-family="${SERIF}">=</text>

          <text x="415" y="69" text-anchor="middle" fill="#93C5FD" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">
            V<tspan dy="4" font-size="14" font-style="normal">cc</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> − </tspan>V<tspan dy="4" font-size="14" font-style="normal">f</tspan>
          </text>
          <line x1="330" y1="82" x2="500" y2="82" stroke="#CBD5E1" stroke-width="2.2" stroke-linecap="round" />
          <text x="415" y="112" text-anchor="middle" fill="#34D399" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">
            I<tspan dy="4" font-size="14" font-style="normal">f</tspan>
          </text>
          <text x="524" y="92" fill="#FACC15" font-size="24" font-weight="700" font-family="${SERIF}">= ?</text>
        `,
      };

    case "voltage_divider_quiz":
      return {
        width: 560,
        height: 155,
        alt: "Uвых = Uвх · R2 / (R1 + R2)",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ДЕЛИТЕЛЬ НАПРЯЖЕНИЯ (ДАНО):</text>
          <rect x="24" y="38" width="215" height="96" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="38" y="63" fill="#E2E8F0" font-size="14" font-family="${MONO}">U<tspan dy="3" font-size="10">вх</tspan><tspan dy="-3"> = </tspan><tspan fill="#FACC15" font-weight="700">12 В</tspan></text>
          <text x="38" y="89" fill="#E2E8F0" font-size="14" font-family="${MONO}">R<tspan dy="3" font-size="10">1</tspan><tspan dy="-3">  = </tspan><tspan fill="#93C5FD" font-weight="700">2 кОм</tspan></text>
          <text x="38" y="115" fill="#E2E8F0" font-size="14" font-family="${MONO}">R<tspan dy="3" font-size="10">2</tspan><tspan dy="-3">  = </tspan><tspan fill="#34D399" font-weight="700">1 кОм</tspan></text>

          <text x="262" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ФОРМУЛА:</text>
          <text x="262" y="93" fill="#FACC15" font-size="26" font-style="italic" font-weight="700" font-family="${SERIF}">
            U<tspan dy="4" font-size="13" font-style="normal">вых</tspan>
            <tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan>
            <tspan fill="#93C5FD">U</tspan><tspan dy="4" font-size="13" font-style="normal" fill="#93C5FD">вх</tspan>
            <tspan dy="-4" fill="#CBD5E1" font-style="normal"> ·</tspan>
          </text>
          <text x="455" y="70" text-anchor="middle" fill="#34D399" font-size="23" font-style="italic" font-weight="700" font-family="${SERIF}">
            R<tspan dy="4" font-size="13" font-style="normal">2</tspan>
          </text>
          <line x1="395" y1="83" x2="515" y2="83" stroke="#CBD5E1" stroke-width="2.2" stroke-linecap="round" />
          <text x="455" y="113" text-anchor="middle" fill="#E2E8F0" font-size="22" font-style="italic" font-weight="700" font-family="${SERIF}">
            R<tspan dy="4" font-size="13" font-style="normal">1</tspan>
            <tspan dy="-4" fill="#CBD5E1" font-style="normal"> + </tspan>
            R<tspan dy="4" font-size="13" font-style="normal">2</tspan>
          </text>
        `,
      };

    case "voltage_divider":
      return {
        width: 560,
        height: 150,
        alt: "Uвых = Uвх · R2 / (R1 + R2)",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ДЕЛИТЕЛЬ НАПРЯЖЕНИЯ НА ДВУХ РЕЗИСТОРАХ:</text>
          <text x="34" y="90" fill="#FACC15" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">
            U<tspan dy="4" font-size="13" font-style="normal">вых</tspan>
            <tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan>
            <tspan fill="#93C5FD">U</tspan><tspan dy="4" font-size="13" font-style="normal" fill="#93C5FD">вх</tspan>
            <tspan dy="-4" fill="#CBD5E1" font-style="normal"> ·</tspan>
          </text>
          <text x="242" y="67" text-anchor="middle" fill="#34D399" font-size="25" font-style="italic" font-weight="700" font-family="${SERIF}">
            R<tspan dy="4" font-size="13" font-style="normal">2</tspan>
          </text>
          <line x1="180" y1="80" x2="304" y2="80" stroke="#CBD5E1" stroke-width="2.2" stroke-linecap="round" />
          <text x="242" y="110" text-anchor="middle" fill="#E2E8F0" font-size="23" font-style="italic" font-weight="700" font-family="${SERIF}">
            R<tspan dy="4" font-size="13" font-style="normal">1</tspan>
            <tspan dy="-4" fill="#CBD5E1" font-style="normal"> + </tspan>
            R<tspan dy="4" font-size="13" font-style="normal">2</tspan>
          </text>
          <rect x="330" y="40" width="206" height="88" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="346" y="70" fill="#93C5FD" font-size="12.5" font-family="${MONO}">R1 — верхнее плечо (к +)</text>
          <text x="346" y="96" fill="#34D399" font-size="12.5" font-family="${MONO}">R2 — нижнее плечо (к GND)</text>
          <text x="346" y="118" fill="#FACC15" font-size="11.5" font-family="${MONO}">R1 = R2 ⇒ Uвых = 0.5·Uвх</text>
        `,
      };

    case "ohms_law":
      return {
        width: 520,
        height: 135,
        alt: "I = U / R, U = I · R",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ЗАКОН ОМА ДЛЯ УЧАСТКА ЦЕПИ:</text>
          <text x="46" y="84" fill="#FACC15" font-size="34" font-style="italic" font-weight="700" font-family="${SERIF}">I</text>
          <text x="72" y="84" fill="#CBD5E1" font-size="28" font-family="${SERIF}">=</text>
          <text x="132" y="61" text-anchor="middle" fill="#93C5FD" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">U</text>
          <line x1="102" y1="74" x2="162" y2="74" stroke="#CBD5E1" stroke-width="2.4" stroke-linecap="round" />
          <text x="132" y="106" text-anchor="middle" fill="#34D399" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">R</text>

          <line x1="210" y1="42" x2="210" y2="112" stroke="#1E3A8A" stroke-width="1.5" stroke-dasharray="4 4" />
          <text x="244" y="84" fill="#93C5FD" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">
            U<tspan fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#FACC15">I</tspan><tspan fill="#CBD5E1" font-style="normal"> · </tspan><tspan fill="#34D399">R</tspan>
          </text>
          <text x="244" y="114" fill="#94A3B8" font-size="12" font-family="${MONO}">[I]=А (Ампер), [U]=В (Вольт), [R]=Ом (Ω)</text>
        `,
      };

    case "power_joule":
      return {
        width: 560,
        height: 145,
        alt: "Q = I² · R · t, P = U · I = I² · R = U² / R",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ЗАКОН ДЖОУЛЯ–ЛЕНЦА И МОЩНОСТЬ:</text>
          <text x="32" y="82" fill="#FACC15" font-size="30" font-style="italic" font-weight="700" font-family="${SERIF}">
            Q<tspan fill="#CBD5E1" font-style="normal"> = </tspan>
            <tspan fill="#93C5FD">I</tspan><tspan dy="-11" font-size="17" font-style="normal" fill="#93C5FD">2</tspan>
            <tspan dy="11" fill="#CBD5E1" font-style="normal"> · </tspan>
            <tspan fill="#34D399">R</tspan><tspan fill="#CBD5E1" font-style="normal"> · </tspan><tspan fill="#E2E8F0">t</tspan>
          </text>
          <line x1="258" y1="40" x2="258" y2="116" stroke="#1E3A8A" stroke-width="1.5" stroke-dasharray="4 4" />
          <text x="282" y="76" fill="#93C5FD" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">
            P<tspan fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#FACC15">U · I</tspan><tspan fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#34D399">I</tspan><tspan dy="-9" font-size="14" font-style="normal" fill="#34D399">2</tspan><tspan dy="9" fill="#34D399">R</tspan>
          </text>
          <text x="282" y="114" fill="#94A3B8" font-size="12" font-family="${MONO}">[Q]=Дж (Джоуль), [P]=Вт (Ватт)</text>
          <text x="32" y="114" fill="#94A3B8" font-size="12" font-family="${MONO}">Ток ↑ в 2× ⇒ тепло ↑ в 4×</text>
        `,
      };

    case "wire_resistivity":
      return {
        width: 560,
        height: 150,
        alt: "R = ρ · L / S",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">СОПРОТИВЛЕНИЕ ПРОВОДНИКА:</text>
          <text x="38" y="90" fill="#FACC15" font-size="32" font-style="italic" font-weight="700" font-family="${SERIF}">R</text>
          <text x="68" y="90" fill="#CBD5E1" font-size="28" font-family="${SERIF}">=</text>
          <text x="98" y="90" fill="#93C5FD" font-size="32" font-style="italic" font-weight="700" font-family="${SERIF}">ρ</text>
          <text x="122" y="90" fill="#CBD5E1" font-size="26" font-family="${SERIF}">·</text>
          <text x="165" y="68" text-anchor="middle" fill="#FACC15" font-size="26" font-style="italic" font-weight="700" font-family="${SERIF}">L</text>
          <line x1="140" y1="80" x2="190" y2="80" stroke="#CBD5E1" stroke-width="2.2" stroke-linecap="round" />
          <text x="165" y="110" text-anchor="middle" fill="#34D399" font-size="26" font-style="italic" font-weight="700" font-family="${SERIF}">S</text>

          <rect x="235" y="38" width="300" height="94" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="250" y="63" fill="#FACC15" font-size="13" font-family="${MONO}" font-weight="700">ρ(Cu медь) = 0.017 Ом·мм²/м</text>
          <text x="250" y="88" fill="#93C5FD" font-size="13" font-family="${MONO}">ρ(Ag серебро) = 0.016 Ом·мм²/м</text>
          <text x="250" y="113" fill="#34D399" font-size="13" font-family="${MONO}">ρ(Al алюм.) = 0.028 Ом·мм²/м</text>
        `,
      };

    case "series_parallel":
      return {
        width: 560,
        height: 150,
        alt: "Rпосл = R1 + R2; 1/Rпар = 1/R1 + 1/R2",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">СОЕДИНЕНИЕ РЕЗИСТОРОВ:</text>
          <rect x="24" y="40" width="242" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="38" y="64" fill="#93C5FD" font-size="11" font-family="${MONO}" font-weight="700">ПОСЛЕДОВАТЕЛЬНО (I = const):</text>
          <text x="38" y="102" fill="#FACC15" font-size="22" font-style="italic" font-weight="700" font-family="${SERIF}">
            R<tspan dy="4" font-size="12" font-style="normal">общ</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan>R<tspan dy="4" font-size="12" font-style="normal">1</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> + </tspan>R<tspan dy="4" font-size="12" font-style="normal">2</tspan>
          </text>

          <rect x="282" y="40" width="254" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="296" y="64" fill="#34D399" font-size="11" font-family="${MONO}" font-weight="700">ПАРАЛЛЕЛЬНО (U = const):</text>
          <text x="312" y="83" text-anchor="middle" fill="#CBD5E1" font-size="18" font-family="${SERIF}">1</text>
          <line x1="295" y1="90" x2="332" y2="90" stroke="#CBD5E1" stroke-width="1.8" />
          <text x="313" y="113" text-anchor="middle" fill="#34D399" font-size="18" font-style="italic" font-weight="700" font-family="${SERIF}">R<tspan dy="3" font-size="11" font-style="normal">общ</tspan></text>
          <text x="345" y="99" fill="#CBD5E1" font-size="20" font-family="${SERIF}">=</text>
          <text x="384" y="83" text-anchor="middle" fill="#CBD5E1" font-size="18" font-family="${SERIF}">1</text>
          <line x1="368" y1="90" x2="400" y2="90" stroke="#CBD5E1" stroke-width="1.8" />
          <text x="384" y="113" text-anchor="middle" fill="#FACC15" font-size="18" font-style="italic" font-weight="700" font-family="${SERIF}">R<tspan dy="3" font-size="11" font-style="normal">1</tspan></text>
          <text x="414" y="99" fill="#CBD5E1" font-size="20" font-family="${SERIF}">+</text>
          <text x="452" y="83" text-anchor="middle" fill="#CBD5E1" font-size="18" font-family="${SERIF}">1</text>
          <line x1="436" y1="90" x2="468" y2="90" stroke="#CBD5E1" stroke-width="1.8" />
          <text x="452" y="113" text-anchor="middle" fill="#93C5FD" font-size="18" font-style="italic" font-weight="700" font-family="${SERIF}">R<tspan dy="3" font-size="11" font-style="normal">2</tspan></text>
        `,
      };

    case "emf_internal":
      return {
        width: 560,
        height: 150,
        alt: "I = E / (R + r), U = E - I·r",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ЗАКОН ОМА ДЛЯ ПОЛНОЙ ЦЕПИ (ЭДС):</text>
          <text x="32" y="88" fill="#FACC15" font-size="30" font-style="italic" font-weight="700" font-family="${SERIF}">I</text>
          <text x="56" y="88" fill="#CBD5E1" font-size="26" font-family="${SERIF}">=</text>
          <text x="132" y="64" text-anchor="middle" fill="#93C5FD" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">ℰ</text>
          <line x1="80" y1="78" x2="185" y2="78" stroke="#CBD5E1" stroke-width="2.2" stroke-linecap="round" />
          <text x="132" y="108" text-anchor="middle" fill="#34D399" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">
            R<tspan dy="4" font-size="13" font-style="normal">н</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> + </tspan><tspan fill="#FACC15">r</tspan>
          </text>

          <rect x="225" y="40" width="310" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="242" y="72" fill="#E2E8F0" font-size="22" font-style="italic" font-weight="700" font-family="${SERIF}">
            U<tspan dy="4" font-size="12" font-style="normal">клемм</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#93C5FD">ℰ</tspan><tspan fill="#CBD5E1" font-style="normal"> − </tspan><tspan fill="#FACC15">I · r</tspan>
          </text>
          <text x="242" y="110" fill="#94A3B8" font-size="12" font-family="${MONO}">r — внутреннее сопротивление батареи</text>
        `,
      };

    case "rc_tau":
      return {
        width: 560,
        height: 145,
        alt: "τ = R · C, за 5τ конденсатор заряжен на 99.3%",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ПОСТОЯННАЯ ВРЕМЕНИ RC-ЦЕПИ:</text>
          <text x="34" y="84" fill="#FACC15" font-size="32" font-style="italic" font-weight="700" font-family="${SERIF}">
            τ<tspan fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#93C5FD">R</tspan><tspan fill="#CBD5E1" font-style="normal"> · </tspan><tspan fill="#34D399">C</tspan>
          </text>
          <text x="34" y="118" fill="#94A3B8" font-size="12" font-family="${MONO}">[R]=Ом, [C]=Ф (Фарад) ⇒ [τ]=сек</text>
          <rect x="255" y="40" width="280" height="88" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="272" y="72" fill="#E2E8F0" font-size="19" font-style="italic" font-weight="700" font-family="${SERIF}">
            U(t) = U<tspan dy="4" font-size="11" font-style="normal">0</tspan><tspan dy="-4" font-style="normal">·(1 − e</tspan><tspan dy="-8" font-size="12" fill="#FACC15">−t/τ</tspan><tspan dy="8" font-style="normal">)</tspan>
          </text>
          <text x="272" y="106" fill="#34D399" font-size="12" font-family="${MONO}">t = 1τ → 63.2%   |   t = 5τ → 99.3%</text>
        `,
      };

    case "capacitor_energy":
      return {
        width: 560,
        height: 145,
        alt: "W = C · U² / 2, Cпар = C1 + C2",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ЭНЕРГИЯ КОНДЕНСАТОРА И ЁМКОСТЬ:</text>
          <text x="34" y="86" fill="#FACC15" font-size="30" font-style="italic" font-weight="700" font-family="${SERIF}">W</text>
          <text x="68" y="86" fill="#CBD5E1" font-size="26" font-family="${SERIF}">=</text>
          <text x="145" y="64" text-anchor="middle" fill="#93C5FD" font-size="26" font-style="italic" font-weight="700" font-family="${SERIF}">
            C · U<tspan dy="-10" font-size="15" font-style="normal" fill="#FACC15">2</tspan>
          </text>
          <line x1="95" y1="76" x2="195" y2="76" stroke="#CBD5E1" stroke-width="2.2" />
          <text x="145" y="106" text-anchor="middle" fill="#34D399" font-size="24" font-weight="700" font-family="${SERIF}">2</text>

          <rect x="230" y="40" width="305" height="88" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="246" y="74" fill="#E2E8F0" font-size="20" font-style="italic" font-weight="700" font-family="${SERIF}">
            C<tspan dy="4" font-size="12" font-style="normal">пар</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#34D399">C</tspan><tspan dy="4" font-size="12" font-style="normal" fill="#34D399">1</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> + </tspan><tspan fill="#93C5FD">C</tspan><tspan dy="4" font-size="12" font-style="normal" fill="#93C5FD">2</tspan>
          </text>
          <text x="246" y="108" fill="#94A3B8" font-size="12" font-family="${MONO}">q = C · U  (Заряд = Ёмкость × Вольт)</text>
        `,
      };

    case "inductor_emf":
      return {
        width: 560,
        height: 150,
        alt: "E_L = -L · (ΔI / Δt), W_L = L · I² / 2",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ЭДС САМОИНДУКЦИИ КАТУШКИ (ЗАКОН ФАРАДЕЯ–ЛЕНЦА):</text>
          <text x="30" y="88" fill="#FACC15" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">
            ℰ<tspan dy="4" font-size="13" font-style="normal">L</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = −</tspan><tspan fill="#93C5FD">L</tspan><tspan fill="#CBD5E1" font-style="normal"> ·</tspan>
          </text>
          <text x="180" y="65" text-anchor="middle" fill="#34D399" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">ΔI</text>
          <line x1="150" y1="78" x2="210" y2="78" stroke="#CBD5E1" stroke-width="2.2" />
          <text x="180" y="108" text-anchor="middle" fill="#E2E8F0" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">Δt</text>

          <rect x="245" y="40" width="290" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="262" y="72" fill="#93C5FD" font-size="20" font-style="italic" font-weight="700" font-family="${SERIF}">
            W<tspan dy="4" font-size="12" font-style="normal">L</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#FACC15">½ · L · I</tspan><tspan dy="-8" font-size="13" fill="#FACC15">2</tspan>
          </text>
          <text x="262" y="108" fill="#94A3B8" font-size="11.5" font-family="${MONO}">При Δt → 0 скачок ℰL пробивает транзистор!</text>
        `,
      };

    case "rlc_resonance":
      return {
        width: 560,
        height: 150,
        alt: "f0 = 1 / (2π√(L·C)), XL = Xc",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ЧАСТОТА РЕЗОНАНСА В КОНТУРЕ RLC:</text>
          <text x="34" y="88" fill="#FACC15" font-size="30" font-style="italic" font-weight="700" font-family="${SERIF}">
            f<tspan dy="4" font-size="14" font-style="normal">0</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> =</tspan>
          </text>
          <text x="175" y="64" text-anchor="middle" fill="#93C5FD" font-size="24" font-weight="700" font-family="${SERIF}">1</text>
          <line x1="92" y1="76" x2="262" y2="76" stroke="#CBD5E1" stroke-width="2.2" />
          <text x="116" y="109" fill="#E2E8F0" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">2π</text>
          <path d="M 148 99 L 154 111 L 164 85 L 252 85" fill="none" stroke="#34D399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <text x="206" y="109" text-anchor="middle" fill="#FACC15" font-size="23" font-style="italic" font-weight="700" font-family="${SERIF}">L · C</text>

          <rect x="284" y="40" width="252" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="300" y="72" fill="#34D399" font-size="18" font-style="italic" font-weight="700" font-family="${SERIF}">X<tspan dy="4" font-size="11" font-style="normal">L</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan>X<tspan dy="4" font-size="11" font-style="normal">C</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> ⇒ Z = R</tspan></text>
          <text x="300" y="108" fill="#94A3B8" font-size="11.5" font-family="${MONO}">Реактивные сопротивления равны</text>
        `,
      };

    case "efficiency_eta":
      return {
        width: 560,
        height: 145,
        alt: "η = (Pполезн / Pзатрач) · 100%",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">КОЭФФИЦИЕНТ ПОЛЕЗНОГО ДЕЙСТВИЯ (КПД):</text>
          <text x="36" y="88" fill="#FACC15" font-size="32" font-style="italic" font-weight="700" font-family="${SERIF}">η</text>
          <text x="64" y="88" fill="#CBD5E1" font-size="26" font-family="${SERIF}">=</text>
          <text x="155" y="64" text-anchor="middle" fill="#34D399" font-size="22" font-style="italic" font-weight="700" font-family="${SERIF}">P<tspan dy="4" font-size="12" font-style="normal">полезн</tspan></text>
          <line x1="94" y1="78" x2="216" y2="78" stroke="#CBD5E1" stroke-width="2.2" />
          <text x="155" y="108" text-anchor="middle" fill="#93C5FD" font-size="22" font-style="italic" font-weight="700" font-family="${SERIF}">P<tspan dy="4" font-size="12" font-style="normal">вход</tspan></text>
          <text x="226" y="88" fill="#CBD5E1" font-size="22" font-weight="700" font-family="${SERIF}">· 100%</text>

          <rect x="315" y="38" width="220" height="90" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="330" y="64" fill="#E2E8F0" font-size="13" font-family="${MONO}">P<tspan dy="3" font-size="9">вх</tspan><tspan dy="-3"> = 12В × 1А = </tspan><tspan fill="#93C5FD" font-weight="700">12 Вт</tspan></text>
          <text x="330" y="88" fill="#E2E8F0" font-size="13" font-family="${MONO}">P<tspan dy="3" font-size="9">вых</tspan><tspan dy="-3"> = 5В × 1А = </tspan><tspan fill="#34D399" font-weight="700">5 Вт</tspan></text>
          <text x="330" y="112" fill="#FACC15" font-size="12.5" font-family="${MONO}" font-weight="700">ΔP(тепло) = 7 Вт!</text>
        `,
      };

    case "pwm_duty":
      return {
        width: 560,
        height: 150,
        alt: "Uср = Umax · (t_вкл / T), analogWrite(0..255)",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ШИРОТНО-ИМПУЛЬСНАЯ МОДУЛЯЦИЯ (PWM):</text>
          <polyline points="28,112 28,62 82,62 82,112 138,112 138,62 192,62 192,112 248,112" fill="none" stroke="#FACC15" stroke-width="2.8" />
          <line x1="22" y1="112" x2="255" y2="112" stroke="#475569" stroke-width="1.2" />
          <text x="55" y="54" text-anchor="middle" fill="#93C5FD" font-size="11" font-family="${MONO}">5V</text>
          <text x="110" y="128" text-anchor="middle" fill="#94A3B8" font-size="11" font-family="${MONO}">D = 50% (128/255)</text>

          <rect x="275" y="40" width="262" height="92" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="292" y="75" fill="#FACC15" font-size="21" font-style="italic" font-weight="700" font-family="${SERIF}">
            U<tspan dy="4" font-size="12" font-style="normal">ср</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> = </tspan><tspan fill="#93C5FD">U</tspan><tspan dy="4" font-size="11" font-style="normal" fill="#93C5FD">пит</tspan><tspan dy="-4" fill="#CBD5E1" font-style="normal"> · </tspan><tspan fill="#34D399">D</tspan>
          </text>
          <text x="292" y="110" fill="#94A3B8" font-size="12" font-family="${MONO}">D = Val / 255 (8-бит таймер)</text>
        `,
      };

    case "adc_resolution":
      return {
        width: 560,
        height: 150,
        alt: "ΔU = Vref / (2^N - 1)",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">РАЗРЕШЕНИЕ АЦП (ADC):</text>
          <text x="32" y="88" fill="#FACC15" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">ΔU</text>
          <text x="74" y="88" fill="#CBD5E1" font-size="26" font-family="${SERIF}">=</text>
          <text x="148" y="64" text-anchor="middle" fill="#93C5FD" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">U<tspan dy="4" font-size="12" font-style="normal">опорн</tspan></text>
          <line x1="98" y1="78" x2="198" y2="78" stroke="#CBD5E1" stroke-width="2.2" />
          <text x="148" y="108" text-anchor="middle" fill="#34D399" font-size="22" font-style="italic" font-weight="700" font-family="${SERIF}">2<tspan dy="-8" font-size="13" font-style="normal">N</tspan><tspan dy="8" font-style="normal"> − 1</tspan></text>

          <rect x="232" y="38" width="303" height="94" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="248" y="64" fill="#E2E8F0" font-size="13" font-family="${MONO}">Arduino Uno: N = <tspan fill="#FACC15" font-weight="700">10 бит (0..1023)</tspan></text>
          <text x="248" y="89" fill="#E2E8F0" font-size="13" font-family="${MONO}">U<tspan dy="3" font-size="9">опорн</tspan><tspan dy="-3"> = </tspan><tspan fill="#93C5FD" font-weight="700">5.0 В</tspan></text>
          <text x="248" y="114" fill="#34D399" font-size="13" font-family="${MONO}">analogRead() = 512 ⇒ U ≈ ?</text>
        `,
      };

    case "ac_rms":
      return {
        width: 560,
        height: 145,
        alt: "Uдейств = Umax / √2",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ДЕЙСТВУЮЩЕЕ НАПРЯЖЕНИЕ ПЕРЕМЕННОГО ТОКА (RMS):</text>
          <text x="32" y="88" fill="#FACC15" font-size="28" font-style="italic" font-weight="700" font-family="${SERIF}">U<tspan dy="4" font-size="12" font-style="normal">RMS</tspan></text>
          <text x="98" y="88" fill="#CBD5E1" font-size="26" font-family="${SERIF}">=</text>
          <text x="155" y="63" text-anchor="middle" fill="#93C5FD" font-size="24" font-style="italic" font-weight="700" font-family="${SERIF}">U<tspan dy="4" font-size="12" font-style="normal">max</tspan></text>
          <line x1="122" y1="76" x2="188" y2="76" stroke="#CBD5E1" stroke-width="2.2" />
          <path d="M 136 99 L 141 108 L 149 87 L 172 87" fill="none" stroke="#34D399" stroke-width="1.8" stroke-linecap="round" />
          <text x="160" y="108" text-anchor="middle" fill="#34D399" font-size="21" font-weight="700" font-family="${SERIF}">2</text>

          <rect x="225" y="40" width="310" height="88" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="242" y="72" fill="#E2E8F0" font-size="14" font-family="${MONO}">В розетке: U<tspan dy="3" font-size="10">RMS</tspan><tspan dy="-3"> = </tspan><tspan fill="#FACC15" font-weight="700">220 В</tspan></text>
          <text x="242" y="102" fill="#34D399" font-size="13.5" font-family="${MONO}">Амплитуда U<tspan dy="3" font-size="10">max</tspan><tspan dy="-3"> = 220 × √2 ≈ </tspan><tspan fill="#93C5FD" font-weight="700">311 В</tspan></text>
        `,
      };

    case "kirchhoff_laws":
    default:
      return {
        width: 560,
        height: 145,
        alt: "Σ I_вх = Σ I_вых; Σ U = 0",
        inner: `
          <text x="24" y="28" fill="#94A3B8" font-size="11" font-family="${MONO}" font-weight="700">ПРАВИЛА КИРХГОФА (УЗЛЫ И КОНТУРЫ):</text>
          <rect x="24" y="40" width="248" height="88" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="38" y="64" fill="#93C5FD" font-size="11" font-family="${MONO}" font-weight="700">1-Й ЗАКОН (ТОКИ В УЗЛЕ):</text>
          <text x="38" y="102" fill="#FACC15" font-size="23" font-weight="700" font-family="${SERIF}">Σ I<tspan dy="4" font-size="12">вх</tspan><tspan dy="-4" fill="#CBD5E1"> = </tspan>Σ I<tspan dy="4" font-size="12">вых</tspan></text>

          <rect x="288" y="40" width="248" height="88" rx="10" fill="#0B1220" stroke="#1E3A8A" stroke-width="1.2" />
          <text x="302" y="64" fill="#34D399" font-size="11" font-family="${MONO}" font-weight="700">2-Й ЗАКОН (НАПРЯЖЕНИЯ):</text>
          <text x="302" y="102" fill="#E2E8F0" font-size="22" font-weight="700" font-family="${SERIF}">Σ U<tspan dy="4" font-size="12">пад</tspan><tspan dy="-4" fill="#CBD5E1"> = </tspan>Σ ℰ</text>
        `,
      };
  }
}

export const QuizFormulaGraphic: React.FC<Props> = ({
  formulaKey,
  caption,
  compact = false,
  className = "",
}) => {
  const { dataUri, width, height, alt } = useMemo(() => {
    const spec = buildFormulaSvg(formulaKey);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0F1D3A" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="${spec.width}" height="${spec.height}" rx="12" fill="#060A14"/>
      <rect width="${spec.width}" height="${spec.height}" rx="12" fill="url(#grid)"/>
      <rect x="1" y="1" width="${spec.width - 2}" height="${spec.height - 2}" rx="11" fill="none" stroke="#1E3A8A" stroke-width="1.5"/>
      ${spec.inner}
    </svg>`;
    return {
      dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      width: spec.width,
      height: spec.height,
      alt: spec.alt,
    };
  }, [formulaKey]);

  return (
    <figure className={`rounded-xl overflow-hidden border border-blue-800/70 bg-[#060A14] shadow-md ${className}`}>
      <img
        src={dataUri}
        alt={alt}
        width={width}
        height={height}
        className={`w-full object-contain block select-none ${compact ? "max-h-32" : "max-h-44"}`}
      />
      {caption && (
        <figcaption className="px-3.5 py-1.5 bg-[#0B101B] border-t border-blue-900/60 text-[11px] font-mono text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
