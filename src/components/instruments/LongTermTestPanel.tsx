import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Square,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Flame,
  BatteryCharging,
  Zap,
  ShieldCheck,
  FileText,
  Wrench,
  Bot,
  Thermometer,
  Cpu,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  PlacedComponent,
  Wire,
  LongTermTestConfig,
  LongTermTestProgress,
  TestDuration,
  TestUsageMode,
  TestReport,
} from "../../types";
import {
  getDurationInDays,
  evaluateLongTermDay,
  generateTestReport,
} from "../../simulation/longTermTester";
import { checkCircuitShortCircuitRisk } from "../../simulation/circuitSimulator";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  wires: Wire[];
  onAskMentorAboutFailure: (what: string, why: string, howToFix: string[]) => void;
  onSelectComponentForRepair?: (componentId: string) => void;
}

export const LongTermTestPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  wires,
  onAskMentorAboutFailure,
  onSelectComponentForRepair,
}) => {
  const { tr, isEn } = useLanguage();
  // Test Configuration
  const [duration, setDuration] = useState<TestDuration>("1_week");
  const [usage, setUsage] = useState<TestUsageMode>("active");
  const [ambientTempC, setAmbientTempC] = useState<number>(25);
  const [activeCoolingEnabled, setActiveCoolingEnabled] = useState<boolean>(false);

  // Test Runner State
  const [progress, setProgress] = useState<LongTermTestProgress>({
    isRunning: false,
    isPaused: false,
    currentDay: 0,
    totalDays: 7,
    progressPct: 0,
    liveTempC: 25,
    livePowerW: 0,
    batteryHealthPct: 100,
    status: "idle",
    failureEvent: null,
    report: null,
  });

  const [showFullReport, setShowFullReport] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // Stop timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalDays = getDurationInDays(duration);

  // Start endurance simulation
  const handleStartTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const config: LongTermTestConfig = {
      duration,
      usage,
      ambientTempC,
      activeCoolingEnabled,
    };

    setProgress({
      isRunning: true,
      isPaused: false,
      currentDay: 1,
      totalDays,
      progressPct: 0,
      liveTempC: ambientTempC,
      livePowerW: 1.5,
      batteryHealthPct: 100,
      status: "testing",
      failureEvent: null,
      report: null,
    });

    let currentDay = 1;

    // Run animation loop through days
    // Fast simulated tick (e.g. 150ms per simulated step)
    const stepInterval = Math.max(80, Math.min(300, 3000 / Math.min(totalDays, 60)));

    timerRef.current = setInterval(() => {
      const evaluation = evaluateLongTermDay(
        currentDay,
        totalDays,
        components,
        wires,
        config
      );

      const pct = Math.min(100, Math.round((currentDay / totalDays) * 100));

      if (evaluation.failure) {
        clearInterval(timerRef.current);
        const failReport = generateTestReport(
          currentDay,
          config,
          evaluation.liveTempC,
          evaluation.livePowerW,
          evaluation.batteryHealthPct,
          evaluation.failure
        );

        setProgress((prev) => ({
          ...prev,
          isRunning: false,
          currentDay,
          progressPct: pct,
          liveTempC: evaluation.liveTempC,
          livePowerW: evaluation.livePowerW,
          batteryHealthPct: evaluation.batteryHealthPct,
          status: "failed",
          failureEvent: evaluation.failure,
          report: failReport,
        }));
        return;
      }

      // Check if test reached end successfully
      if (currentDay >= totalDays) {
        clearInterval(timerRef.current);
        const passReport = generateTestReport(
          totalDays,
          config,
          evaluation.liveTempC,
          evaluation.livePowerW,
          evaluation.batteryHealthPct,
          null
        );

        setProgress((prev) => ({
          ...prev,
          isRunning: false,
          currentDay: totalDays,
          progressPct: 100,
          liveTempC: evaluation.liveTempC,
          livePowerW: evaluation.livePowerW,
          batteryHealthPct: evaluation.batteryHealthPct,
          status: "passed",
          failureEvent: null,
          report: passReport,
        }));
        return;
      }

      // Increment day
      currentDay += Math.max(1, Math.floor(totalDays / 50));
      if (currentDay > totalDays) currentDay = totalDays;

      setProgress((prev) => ({
        ...prev,
        currentDay,
        progressPct: pct,
        liveTempC: evaluation.liveTempC,
        livePowerW: evaluation.livePowerW,
        batteryHealthPct: evaluation.batteryHealthPct,
      }));
    }, stepInterval);
  };

  const handleStopTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
    }));
  };

  const handleResetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress({
      isRunning: false,
      isPaused: false,
      currentDay: 0,
      totalDays,
      progressPct: 0,
      liveTempC: ambientTempC,
      livePowerW: 0,
      batteryHealthPct: 100,
      status: "idle",
      failureEvent: null,
      report: null,
    });
    setShowFullReport(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="long-term-test-panel"
      className="fixed right-0 top-14 bottom-0 w-96 bg-[#0B101B] border-l border-blue-800/60 shadow-2xl z-30 flex flex-col select-none text-xs text-white"
    >
      {/* Header */}
      <div className="h-12 border-b border-blue-900/60 px-4 flex items-center justify-between bg-[#06080D]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-sm text-white">
            {tr("Длительный стресс-тест", "Long-Term Stress Testing")}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#111827] cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Pre-Flight Short Circuit Risk Inspection */}
        {(() => {
          const scRisk = checkCircuitShortCircuitRisk(components, wires);
          if (scRisk.hasRisk) {
            return (
              <div
                id="preflight-short-circuit-risk-card"
                className="p-3 rounded-xl border bg-yellow-400/10 border-yellow-400/60 text-yellow-200"
              >
                <div className="flex items-start gap-2">
                  <Flame className="w-4 h-4 shrink-0 mt-0.5 text-yellow-400" />
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-xs flex items-center justify-between gap-2 text-yellow-300">
                      <span>
                        {scRisk.hasFuseProtection
                          ? tr("Предупреждение КЗ (Цепь защищена)", "Short Circuit Warning (Protected)")
                          : tr("Риск короткого замыкания (КЗ)", "Severe Short Circuit Risk (Dead Short)")}
                      </span>
                      <span className="font-mono tabular-nums text-[10px] text-yellow-400 font-semibold shrink-0">
                        I_sc ≈ {scRisk.prospectiveCurrentA} A
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {tr(
                        `Прямой 0Ω путь между ${scRisk.shortedPins?.[0]} и ${scRisk.shortedPins?.[1]}. Мощность импульса: `,
                        `Direct 0Ω path between ${scRisk.shortedPins?.[0]} and ${scRisk.shortedPins?.[1]}. Pulse power: `
                      )}
                      <strong className="font-mono tabular-nums text-white">{scRisk.prospectivePowerW} {tr("Вт", "W")}</strong> {tr("при", "at")} R_int={scRisk.internalResistance} {tr("Ом", "Ω")}.
                    </p>
                    {scRisk.hasFuseProtection ? (
                      <div className="text-[10px] text-blue-300 font-semibold bg-blue-950/80 px-2 py-1 rounded border border-blue-700/60 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        {tr(
                          `Установлен предохранитель (${scRisk.fuseRatingA}А) — компоненты спасены, но вставка сработает при старте.`,
                          `Fuse installed (${scRisk.fuseRatingA}A) — components protected, but fuse will blow at startup.`
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          onAskMentorAboutFailure(
                            isEn ? "Short Circuit (Dead Short) in Circuit" : "Короткое замыкание (КЗ) в схеме",
                            isEn
                              ? `Detected a direct 0-ohm path between ${scRisk.shortedPins?.[0]} and ${scRisk.shortedPins?.[1]}. Calculated short current of ${scRisk.prospectiveCurrentA}A will cause immediate destruction.`
                              : `Обнаружен прямой 0-омный путь между ${scRisk.shortedPins?.[0]} и ${scRisk.shortedPins?.[1]}. Расчетный ток КЗ ${scRisk.prospectiveCurrentA}А вызовет немедленное разрушение компонентов.`,
                            isEn
                              ? [
                                  "Install a protective Fuse from the component catalog",
                                  "Separate VCC and GND power rails on the breadboard",
                                  "Verify current-limiting resistors before LEDs and ICs",
                                ]
                              : [
                                  "Установите плавкий предохранитель (Fuse) из каталога компонентов",
                                  "Разведите шины питания VCC и GND на макетной плате",
                                  "Проверьте наличие токоограничивающих резисторов перед светодиодами и микросхемами",
                                ]
                          )
                        }
                        className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" /> {tr("Спросить AI-ментора об устранении КЗ", "Ask AI Mentor to Resolve Short Circuit")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div
                id="preflight-short-circuit-safe-badge"
                className="p-2.5 rounded-xl border bg-blue-950/80 border-blue-700/60 text-blue-300 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] font-medium">
                  {tr(
                    "Предпусковая проверка: 0-омных замыканий шин питания не обнаружено",
                    "Pre-flight DRC check: No 0-ohm power rail shorts detected"
                  )}
                </span>
              </div>
            );
          }
        })()}

        {/* Test Configuration Controls (When idle) */}
        {!progress.isRunning && progress.status === "idle" && (
          <div className="space-y-4">
            {/* TIME HORIZON */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                {tr("Длительность моделирования", "Simulation Duration")}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "1_week", label: "1 Week" },
                    { id: "1_month", label: "1 Month" },
                    { id: "1_year", label: "1 Year" },
                    { id: "5_years", label: "5 Years" },
                    { id: "10_years", label: "10 Years" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDuration(t.id)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition-colors cursor-pointer ${
                      duration === t.id
                        ? "bg-yellow-400 border-yellow-300 text-black font-bold"
                        : "bg-[#111827] border-blue-900/60 text-slate-300 hover:text-white hover:border-blue-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* USAGE PROFILE */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                {tr("Профиль нагрузки", "Workload & Usage")}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "inactive", label: "Inactive", desc: "Low idle load" },
                    { id: "medium", label: "Medium", desc: "Nominal load" },
                    { id: "active", label: "Active", desc: "Heavy stress" },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setUsage(u.id)}
                    className={`py-2 px-2 rounded-lg font-semibold border text-center transition-colors cursor-pointer ${
                      usage === u.id
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-[#111827] border-blue-900/60 text-slate-300 hover:text-white hover:border-blue-600"
                    }`}
                  >
                    <div className="font-bold">{u.label}</div>
                    <div className={`text-[10px] mt-0.5 font-normal ${usage === u.id ? "text-blue-100" : "text-slate-400"}`}>{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ENVIRONMENT & COOLING */}
            <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{tr("Температура среды:", "Ambient Temperature:")}</span>
                <span className="font-mono tabular-nums text-yellow-400 font-bold">{ambientTempC}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="55"
                value={ambientTempC}
                onChange={(e) => setAmbientTempC(Number(e.target.value))}
                className="w-full accent-yellow-400 bg-black h-1.5 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between pt-2 border-t border-blue-900/60">
                <span className="text-slate-300 font-medium">{tr("Активное охлаждение:", "Active Cooling (Fan/Sink):")}</span>
                <button
                  onClick={() => setActiveCoolingEnabled(!activeCoolingEnabled)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                    activeCoolingEnabled
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-black border-blue-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {activeCoolingEnabled ? "Enabled" : "Off (Passive)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Timeline & Execution Display */}
        {(progress.isRunning || progress.status !== "idle") && (
          <div className="space-y-4">
            {/* Timeline Progress Header */}
            <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {tr("Прогресс испытания", "Timeline Progress")}
                </span>
                <span className="font-mono tabular-nums font-bold text-yellow-400">
                  DAY {progress.currentDay} / {progress.totalDays}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-blue-900/60">
                <div
                  className={`h-full transition-all duration-150 ${
                    progress.status === "failed"
                      ? "bg-yellow-400"
                      : progress.status === "passed"
                      ? "bg-blue-500"
                      : "bg-yellow-400"
                  }`}
                  style={{ width: `${progress.progressPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono tabular-nums">
                <span>Start: Day 1</span>
                <span>{progress.progressPct}%</span>
                <span>Target: {progress.totalDays}d</span>
              </div>
            </div>

            {/* Live Real-Time Telemetry Counters */}
            <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
              <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                  <Thermometer className="w-3 h-3 text-yellow-400" />
                  <span>Temp</span>
                </div>
                <div
                  className={`text-sm font-bold ${
                    progress.liveTempC > 60
                      ? "text-yellow-400"
                      : "text-blue-400"
                  }`}
                >
                  {progress.liveTempC}°C
                </div>
              </div>

              <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>Power</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {progress.livePowerW} W
                </div>
              </div>

              <div className="bg-[#111827] border border-blue-900/60 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                  <BatteryCharging className="w-3 h-3 text-blue-400" />
                  <span>Battery</span>
                </div>
                <div className="text-sm font-bold text-blue-400">
                  {progress.batteryHealthPct}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Critical Failure Card */}
        {progress.status === "failed" && progress.failureEvent && (
          <div className="bg-yellow-400/10 border border-yellow-400/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-400" />
              <span>{tr("КРИТИЧЕСКИЙ ОТКАЗ", "Critical Failure")}</span>
            </div>

            <div className="text-xs text-white font-semibold">
              {progress.failureEvent.title}
            </div>

            <div className="text-[11px] text-slate-300 bg-black rounded-lg p-2.5 border border-yellow-400/40">
              <div className="text-slate-400 mb-1">
                <strong className="text-white">Component:</strong> {progress.failureEvent.componentName}
              </div>
              <div className="text-slate-400 mb-1 font-mono tabular-nums">
                <strong className="text-white">Halted at:</strong> Day {progress.failureEvent.day} / {progress.failureEvent.totalDays}
              </div>
              <p className="text-yellow-300">{progress.failureEvent.details}</p>
            </div>

            {/* AI Explanation Summary */}
            <div className="space-y-1 text-[11px]">
              <div className="font-bold text-white">Why it failed:</div>
              <p className="text-slate-300">{progress.failureEvent.why}</p>
            </div>

            {/* Recommended Fixes */}
            <div className="space-y-1 text-[11px]">
              <div className="font-bold text-white">Engineering Fixes:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                {progress.failureEvent.howToFix.map((fix, idx) => (
                  <li key={idx}>{fix}</li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() =>
                  onAskMentorAboutFailure(
                    progress.failureEvent!.what,
                    progress.failureEvent!.why,
                    progress.failureEvent!.howToFix
                  )
                }
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Explain in AI Mentor</span>
              </button>

              <button
                onClick={handleResetTest}
                className="py-2 px-3 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-200 font-semibold cursor-pointer"
              >
                Modify & Retest
              </button>
            </div>
          </div>
        )}

        {/* Test Passed Card */}
        {progress.status === "passed" && progress.report && (
          <div className="bg-blue-950/50 border border-blue-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <span>{tr("Тест пройден — система стабильна", "Test Passed - System Stable")}</span>
            </div>

            <div className="text-xs text-slate-300">
              Device successfully operated for{" "}
              <strong className="text-white">
                {progress.totalDays} days ({progress.report.simulatedYears} years equivalent)
              </strong>{" "}
              under {usage.toUpperCase()} usage without thermal or electrical breakdown.
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono tabular-nums bg-black p-2.5 rounded-lg border border-blue-900/60">
              <div>
                <span className="text-slate-400">Reliability Score:</span>
                <div className="text-blue-400 font-bold text-sm">
                  {progress.report.reliabilityScore}%
                </div>
              </div>
              <div>
                <span className="text-slate-400">Battery Health:</span>
                <div className="text-yellow-400 font-bold text-sm">
                  {progress.report.batteryHealthPct}%
                </div>
              </div>
              <div>
                <span className="text-slate-400">Peak Temp:</span>
                <div className="text-white font-bold">{progress.report.maxTempC}°C</div>
              </div>
              <div>
                <span className="text-slate-400">Avg Power:</span>
                <div className="text-white font-bold">{progress.report.avgPowerW} W</div>
              </div>
            </div>

            <button
              onClick={() => setShowFullReport(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Full Engineering Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls: CHECK, STOP, RESET, RETRY */}
      <div className="p-4 border-t border-blue-900/60 bg-[#06080D] flex items-center gap-2">
        {!progress.isRunning ? (
          <button
            onClick={handleStartTest}
            className="flex-1 py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{tr("Запустить тест", "Run Stress Test")}</span>
          </button>
        ) : (
          <button
            onClick={handleStopTest}
            className="flex-1 py-2.5 px-4 rounded-xl bg-black border-2 border-yellow-400 hover:bg-yellow-400/15 text-yellow-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>{tr("Остановить тест", "Stop Test")}</span>
          </button>
        )}

        <button
          onClick={handleResetTest}
          title="Reset endurance simulation"
          className="p-2.5 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-300 hover:text-white border border-blue-900/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Full Engineering Report Modal */}
      {showFullReport && progress.report && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-base text-white">
                  Engineering Certification Report
                </h3>
              </div>
              <button
                onClick={() => setShowFullReport(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
              <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 font-sans">Reliability Score</div>
                <div className="text-lg font-bold text-blue-400 mt-0.5">
                  {progress.report.reliabilityScore} / 100%
                </div>
              </div>
              <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 font-sans">Estimated Lifespan</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {progress.report.estimatedLifetimeYears} Years
                </div>
              </div>
              <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 font-sans">Total Energy Consumed</div>
                <div className="text-base font-bold text-yellow-400 mt-0.5">
                  {progress.report.energyConsumedKwh} kWh
                </div>
              </div>
              <div className="bg-[#111827] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 font-sans">Peak Thermal Junction</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {progress.report.maxTempC}°C
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white mb-1.5">
                Engineering Recommendations:
              </h4>
              <ul className="space-y-1 text-xs text-slate-300 list-disc pl-4">
                {progress.report.aiRecommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowFullReport(false)}
                className="px-4 py-2 bg-[#111827] hover:bg-blue-950 border border-blue-800/60 text-white font-semibold rounded-xl text-xs cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
