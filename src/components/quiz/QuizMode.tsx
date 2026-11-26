import React, { useMemo, useState } from "react";
import {
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
} from "lucide-react";
import { QUIZ_QUESTIONS, QUIZ_VARIANTS } from "../../data/quizDatabase";
import { QuizQuestion, QuizTestVariant } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { QuizFormulaGraphic } from "./QuizFormulaGraphic";

interface Props {
  onBackToMenu: () => void;
  onAddXp: (amount: number) => void;
  userXp: number;
}

type QuizScopeMode = "variants" | "categories";

export const QuizMode: React.FC<Props> = ({ onBackToMenu, onAddXp, userXp }) => {
  const { tr, localize } = useLanguage();
  const [scopeMode, setScopeMode] = useState<QuizScopeMode>("variants");
  const [selectedVariantId, setSelectedVariantId] = useState<string>(QUIZ_VARIANTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredMap, setAnsweredMap] = useState<
    Record<string, { selected: number; isCorrect: boolean }>
  >({});
  const [showExamSummary, setShowExamSummary] = useState<boolean>(false);

  const categories = [
    "Все",
    "Основы",
    "Физика",
    "Схемотехника",
    "Микроконтроллеры",
    "Расчёты",
    "Диагностика",
  ];

  const activeVariant: QuizTestVariant = useMemo(
    () => QUIZ_VARIANTS.find((v) => v.id === selectedVariantId) || QUIZ_VARIANTS[0],
    [selectedVariantId]
  );

  const filteredQuestions: QuizQuestion[] = useMemo(() => {
    if (scopeMode === "variants") {
      const byId = new Map(QUIZ_QUESTIONS.map((q) => [q.id, q]));
      return activeVariant.questionIds
        .map((id) => byId.get(id))
        .filter((q): q is QuizQuestion => Boolean(q));
    }
    return QUIZ_QUESTIONS.filter((q) =>
      selectedCategory === "Все" ? true : q.category === selectedCategory
    );
  }, [scopeMode, activeVariant, selectedCategory]);

  const currentQuestion: QuizQuestion | undefined =
    filteredQuestions[activeQuestionIndex] || filteredQuestions[0];

  // Scoring calculations for the active set (weighted engineering points + 100-point scale)
  const examStats = useMemo(() => {
    let maxPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    let answeredCount = 0;

    for (const q of filteredQuestions) {
      const pts = q.points ?? 2;
      maxPoints += pts;
      const rec = answeredMap[q.id];
      if (rec) {
        answeredCount += 1;
        if (rec.isCorrect) {
          correctCount += 1;
          earnedPoints += pts;
        }
      }
    }

    const score100 = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    const passingPct = scopeMode === "variants" ? activeVariant.passingScorePct : 70;
    const isPassed = answeredCount === filteredQuestions.length && score100 >= passingPct;

    let gradeLabel = tr("Ожидает завершения", "In Progress");
    let rankLabel = tr("Кандидат", "Candidate");
    if (answeredCount > 0) {
      if (score100 >= 90) {
        gradeLabel = tr("5 (Отлично)", "A (Excellent)");
        rankLabel = tr("Ведущий инженер-схемотехник", "Lead Circuit Engineer");
      } else if (score100 >= passingPct) {
        gradeLabel = tr("4 (Хорошо • Сдано)", "B (Good • Passed)");
        rankLabel = tr("Инженер-электроник (Аттестован)", "Certified Electronics Engineer");
      } else if (answeredCount === filteredQuestions.length) {
        gradeLabel = tr("Не сдан (Ниже порога)", "Not Passed");
        rankLabel = tr("Требуется повторная сдача", "Retake Recommended");
      } else {
        gradeLabel = tr("Тест в процессе", "Exam In Progress");
        rankLabel = tr("Проверка знаний", "Assessment Active");
      }
    }

    return {
      maxPoints,
      earnedPoints,
      correctCount,
      answeredCount,
      totalCount: filteredQuestions.length,
      score100,
      passingPct,
      isPassed,
      gradeLabel,
      rankLabel,
    };
  }, [filteredQuestions, answeredMap, scopeMode, activeVariant, tr]);

  const currentAnswerRecord = currentQuestion ? answeredMap[currentQuestion.id] : undefined;
  const isSubmitted = Boolean(currentAnswerRecord);
  const displayedSelectedOption = isSubmitted
    ? currentAnswerRecord!.selected
    : selectedOption;

  const jumpToQuestion = (idx: number) => {
    if (idx < 0 || idx >= filteredQuestions.length) return;
    setActiveQuestionIndex(idx);
    const targetQ = filteredQuestions[idx];
    const rec = answeredMap[targetQ.id];
    setSelectedOption(rec ? rec.selected : null);
    setShowExamSummary(false);
  };

  const handleSwitchVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    setActiveQuestionIndex(0);
    setSelectedOption(null);
    setAnsweredMap({});
    setShowExamSummary(false);
  };

  const handleResetActiveTest = () => {
    const nextMap = { ...answeredMap };
    for (const q of filteredQuestions) {
      delete nextMap[q.id];
    }
    setAnsweredMap(nextMap);
    setActiveQuestionIndex(0);
    setSelectedOption(null);
    setShowExamSummary(false);
  };

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion || isSubmitted) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const updatedMap = {
      ...answeredMap,
      [currentQuestion.id]: { selected: selectedOption, isCorrect },
    };
    setAnsweredMap(updatedMap);

    if (isCorrect) {
      onAddXp(currentQuestion.xp);
    }
  };

  const handleNext = () => {
    if (activeQuestionIndex < filteredQuestions.length - 1) {
      jumpToQuestion(activeQuestionIndex + 1);
    } else {
      setShowExamSummary(true);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      jumpToQuestion(activeQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080D] engineering-grid text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-blue-900/60 bg-[#0B101B]/95 backdrop-blur-md px-4 md:px-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToMenu}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tr("Главное меню", "Main Menu")}</span>
          </button>
          <div className="h-5 w-px bg-blue-900/60 hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardCheck className="w-4 h-4 text-yellow-400 shrink-0" />
            <span className="font-bold text-sm text-white truncate">
              {tr("Инженерная проверка и экзамены", "Electrical Engineering Assessment")}
            </span>
          </div>
        </div>

        {/* Live Exam Scoreboard in Header */}
        <div className="flex items-center gap-2.5 text-xs font-mono tabular-nums bg-[#111827] border border-blue-900/60 px-3 py-1.5 rounded-lg shrink-0">
          <span className="text-slate-400 hidden md:inline">
            {tr("Баллы:", "Points:")}{" "}
            <strong className="text-emerald-400">{examStats.earnedPoints}</strong>
            <span className="text-slate-500"> / {examStats.maxPoints}</span>
          </span>
          <span className="text-blue-800 hidden md:inline">·</span>
          <span className="text-slate-200">
            <strong className={examStats.score100 >= examStats.passingPct ? "text-emerald-400" : "text-sky-300"}>
              {examStats.score100}
            </strong>
            <span className="text-slate-400"> / 100</span>
          </span>
          <span className="text-blue-800">·</span>
          <span className="font-bold text-yellow-300">{userXp} XP</span>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-5">
        {/* Mode Switcher + Exam Progress Summary Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-[#0B101B] border border-blue-900/60 self-start">
            <button
              onClick={() => {
                setScopeMode("variants");
                setActiveQuestionIndex(0);
                setSelectedOption(null);
                setShowExamSummary(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                scopeMode === "variants"
                  ? "bg-yellow-400 text-black font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>{tr("Варианты экзамена", "Prepared Test Variants")}</span>
            </button>
            <button
              onClick={() => {
                setScopeMode("categories");
                setActiveQuestionIndex(0);
                setSelectedOption(null);
                setShowExamSummary(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                scopeMode === "categories"
                  ? "bg-yellow-400 text-black font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{tr("Все темы", "By Topic")}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExamSummary((s) => !s)}
              className="px-3 py-1.5 rounded-lg bg-[#0B101B] hover:bg-blue-950/60 border border-blue-800/70 text-xs font-semibold text-sky-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {showExamSummary
                  ? tr("Вернуться к заданиям", "Back to Questions")
                  : tr("Итоги и ведомость", "Exam Report")}
              </span>
            </button>
            <button
              onClick={handleResetActiveTest}
              className="px-3 py-1.5 rounded-lg bg-[#0B101B] hover:bg-rose-950/40 border border-blue-900/60 hover:border-rose-700/60 text-xs font-semibold text-slate-300 hover:text-rose-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tr("Начать заново", "Reset Test")}</span>
            </button>
          </div>
        </div>

        {/* Prepared Variants Picker OR Category Picker */}
        {scopeMode === "variants" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {QUIZ_VARIANTS.map((variant) => {
              const isActive = variant.id === selectedVariantId;
              const isExam = variant.id === "variant-exam";
              const answeredInVariant = variant.questionIds.filter(
                (id) => Boolean(answeredMap[id])
              ).length;

              return (
                <button
                  key={variant.id}
                  onClick={() => handleSwitchVariant(variant.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isActive
                      ? isExam
                        ? "bg-amber-950/50 border-yellow-400 shadow-lg shadow-yellow-500/10"
                        : "bg-blue-950/70 border-yellow-400/90 shadow-lg shadow-blue-900/20"
                      : "bg-[#0B101B] border-blue-900/60 hover:border-blue-600/80"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-mono font-bold tracking-wider ${
                          isActive ? "text-yellow-300" : isExam ? "text-amber-400" : "text-blue-300"
                        }`}
                      >
                        {variant.code}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                        {answeredInVariant}/{variant.questionIds.length}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white leading-snug">
                      {localize(variant.title)}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {variant.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveQuestionIndex(0);
                  setSelectedOption(null);
                  setShowExamSummary(false);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-yellow-400 border-yellow-400 text-black font-bold"
                    : "bg-[#0B101B] border-blue-900/60 text-slate-300 hover:text-yellow-300 hover:border-blue-700"
                }`}
              >
                {localize(cat)}
              </button>
            ))}
          </div>
        )}

        {/* Active Variant Banner + Question Stepper */}
        <div className="bg-[#0B101B] border border-blue-900/60 rounded-xl p-3.5 md:px-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-yellow-400 font-bold">
                {scopeMode === "variants" ? activeVariant.code : tr("ТРЕНИРОВКА", "PRACTICE")}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-sans font-semibold">
                {scopeMode === "variants"
                  ? localize(activeVariant.title)
                  : `${tr("Тема:", "Topic:")} ${localize(selectedCategory)}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {scopeMode === "variants"
                ? `${activeVariant.description} (${tr("Порог сдачи:", "Pass:")} ${activeVariant.passingScorePct}%)`
                : tr("Все вопросы выбранного раздела с начислением экзаменационных баллов.", "All questions in selected category.")}
            </p>
          </div>

          {/* Question Stepper Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {filteredQuestions.map((q, idx) => {
              const rec = answeredMap[q.id];
              const isCurr = !showExamSummary && idx === activeQuestionIndex;
              let pillCls = "bg-[#111827] border-blue-800/60 text-slate-400 hover:border-blue-500";
              if (rec) {
                pillCls = rec.isCorrect
                  ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-300"
                  : "bg-rose-950/70 border-rose-500/80 text-rose-300";
              }
              if (isCurr) {
                pillCls += " ring-2 ring-yellow-400 text-white font-bold";
              }
              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`w-7 h-7 rounded-lg border text-[11px] font-mono tabular-nums flex items-center justify-center transition cursor-pointer ${pillCls}`}
                  title={`${tr("Вопрос", "Question")} ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exam Summary Report OR Active Question Card */}
        {showExamSummary ? (
          <div className="bg-[#0B101B] border border-blue-900/70 p-6 md:p-8 rounded-2xl space-y-6 shadow-xl shadow-black/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-blue-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-yellow-400 font-bold">
                  {examStats.isPassed ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{tr("Аттестационная ведомость", "Engineering Examination Report")}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white">
                  {scopeMode === "variants"
                    ? `${activeVariant.code}: ${activeVariant.title}`
                    : `${tr("Раздел", "Topic")}: ${selectedCategory}`}
                </h2>
                <p className="text-xs text-slate-400">{examStats.rankLabel}</p>
              </div>

              <div className="flex items-center gap-4 bg-[#060A14] border border-blue-800/70 rounded-xl px-5 py-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    {tr("Рейтинг (100-б.)", "Exam Score")}
                  </div>
                  <div
                    className={`text-3xl font-extrabold font-mono tabular-nums ${
                      examStats.score100 >= examStats.passingPct
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {examStats.score100}
                    <span className="text-sm text-slate-500 font-normal"> / 100</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-blue-900/60" />
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    {tr("Вердикт", "Result")}
                  </div>
                  <div className="text-sm font-bold text-white">{examStats.gradeLabel}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {examStats.earnedPoints} / {examStats.maxPoints} {tr("б.", "pts")}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredQuestions.map((q, idx) => {
                const rec = answeredMap[q.id];
                const pts = q.points ?? 2;
                return (
                  <button
                    key={q.id}
                    onClick={() => jumpToQuestion(idx)}
                    className="text-left p-3.5 rounded-xl bg-[#111827] hover:bg-blue-950/40 border border-blue-900/60 flex items-start justify-between gap-3 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {rec ? (
                        rec.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )
                      ) : (
                        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-slate-400">
                          #{idx + 1} · {q.category}
                        </div>
                        <div className="text-xs font-semibold text-slate-200 line-clamp-2">
                          {localize(q.question)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold tabular-nums shrink-0 ${
                        rec?.isCorrect
                          ? "text-emerald-400"
                          : rec
                          ? "text-rose-400"
                          : "text-slate-500"
                      }`}
                    >
                      {rec ? (rec.isCorrect ? `+${pts}` : "0") : "—"} / {pts}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-900/50">
              <button
                onClick={handleResetActiveTest}
                className="px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/70 text-xs font-semibold text-slate-200 flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{tr("Пересдать этот вариант", "Retake Variant")}</span>
              </button>

              {scopeMode === "variants" && (
                <button
                  onClick={() => {
                    const currIdx = QUIZ_VARIANTS.findIndex((v) => v.id === selectedVariantId);
                    const nextVariant = QUIZ_VARIANTS[(currIdx + 1) % QUIZ_VARIANTS.length];
                    handleSwitchVariant(nextVariant.id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <span>{tr("Следующий вариант теста", "Next Test Variant")}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="bg-[#0B101B] border border-blue-900/60 p-6 md:p-8 rounded-2xl space-y-5 shadow-xl shadow-black/40">
            {/* Question Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-blue-900/50">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="font-semibold text-blue-300 bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 rounded">
                  {localize(currentQuestion.category)}
                </span>
                <span>·</span>
                <span>{localize(currentQuestion.difficulty)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-bold">
                  {currentQuestion.points ?? 2} {tr("балл(а)", "pts")}
                </span>
                <span className="text-yellow-400 font-bold">+{currentQuestion.xp} XP</span>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
              {localize(currentQuestion.question)}
            </h2>

            {/* Formula Graphic Image (replaces messy text math) */}
            {currentQuestion.formulaImageKey && (
              <QuizFormulaGraphic
                formulaKey={currentQuestion.formulaImageKey}
                caption={currentQuestion.formulaCaption}
              />
            )}

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = displayedSelectedOption === i;
                const isCorrect = i === currentQuestion.correctIndex;
                let btnStyle =
                  "bg-[#111827] border-blue-800/60 text-slate-200 hover:border-blue-600";

                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      "bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      "bg-rose-950/60 border-rose-500/80 text-rose-200 font-semibold";
                  }
                } else if (isSelected) {
                  btnStyle =
                    "bg-blue-950/80 border-yellow-400 text-white font-semibold";
                }

                return (
                  <button
                    key={i}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm leading-relaxed flex items-center gap-3 transition cursor-pointer ${btnStyle}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-mono flex-shrink-0 bg-[#06080D] ${
                        isSelected
                          ? "border-yellow-400 text-yellow-300 font-bold"
                          : "border-blue-800/70 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span>{localize(opt)}</span>
                  </button>
                );
              })}
            </div>

            {/* Check Button or Explanation */}
            {!isSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {tr("Зафиксировать ответ", "Submit Answer")}
              </button>
            ) : (
              <div
                className={`p-4 md:p-5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                  displayedSelectedOption === currentQuestion.correctIndex
                    ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                    : "bg-rose-950/50 border-rose-500/50 text-rose-200"
                }`}
              >
                <div className="font-bold flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {displayedSelectedOption === currentQuestion.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>
                          {tr(
                            `Верно! +${currentQuestion.points ?? 2} б. (+${currentQuestion.xp} XP)`,
                            `Correct! +${currentQuestion.points ?? 2} pts (+${currentQuestion.xp} XP)`
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span>{tr("Неверный ответ (0 б.)", "Incorrect (0 pts)")}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-slate-300 pt-1 leading-relaxed">
                  {localize(currentQuestion.explanation)}
                </p>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-blue-900/50">
              <button
                disabled={activeQuestionIndex === 0}
                onClick={handlePrev}
                className="py-2 px-4 rounded-xl bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 disabled:opacity-30 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                {tr("← Назад", "← Previous")}
              </button>
              <div className="text-xs font-mono text-slate-400 tabular-nums">
                {tr(
                  `Задание ${activeQuestionIndex + 1} из ${filteredQuestions.length}`,
                  `Question ${activeQuestionIndex + 1} of ${filteredQuestions.length}`
                )}
              </div>
              <button
                onClick={handleNext}
                className={`py-2 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  activeQuestionIndex >= filteredQuestions.length - 1
                    ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-400/60 text-white"
                    : "bg-blue-600 hover:bg-blue-500 border-blue-500/60 text-white"
                }`}
              >
                {activeQuestionIndex >= filteredQuestions.length - 1
                  ? tr("Завершить и итоги →", "Finish & Report →")
                  : tr("Вперёд →", "Next →")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
