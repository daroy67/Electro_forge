import React, { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Play,
} from "lucide-react";
import { LEARNING_COURSES } from "../../data/learningCourses";
import { LearningCourse, CourseLesson, PlacedComponent, Wire, UserPlan } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { QuizFormulaGraphic } from "../quiz/QuizFormulaGraphic";

interface Props {
  onBackToMenu: () => void;
  onStartPracticeInLab: (
    lesson: CourseLesson,
    starterComponents?: PlacedComponent[],
    starterWires?: Wire[]
  ) => void;
  onAddXp: (amount: number) => void;
  userXp: number;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
}

export const LearningMode: React.FC<Props> = ({
  onBackToMenu,
  onStartPracticeInLab,
  onAddXp,
  userXp,
}) => {
  const { tr, localize } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<LearningCourse | null>(
    LEARNING_COURSES[0]
  );
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const activeLesson: CourseLesson | undefined =
    selectedCourse?.lessons[activeLessonIndex];

  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerIndex(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null || !activeLesson) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswerIndex === activeLesson.question.correctIndex) {
      if (!completedLessonIds.includes(activeLesson.id)) {
        setCompletedLessonIds((prev) => [...prev, activeLesson.id]);
        onAddXp(activeLesson.xpReward);
      }
    }
  };

  const handleNextLesson = () => {
    if (!selectedCourse) return;
    if (activeLessonIndex < selectedCourse.lessons.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex((prev) => prev - 1);
      setSelectedAnswerIndex(null);
      setIsAnswerSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080D] engineering-grid text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-blue-900/60 bg-[#0B101B]/95 backdrop-blur-md px-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-800/60 text-slate-200 hover:text-yellow-300 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tr("Главное меню", "Main Menu")}</span>
          </button>
          <div className="h-5 w-px bg-blue-900/60" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span className="font-bold text-sm text-white">
              {tr("Обучение электронике", "Electronics Courses")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono tabular-nums bg-[#111827] border border-blue-900/60 px-3 py-1.5 rounded-lg">
          <span className="text-slate-400">
            {tr("Пройдено:", "Completed:")}{" "}
            <strong className="text-white">
              {completedLessonIds.length} / {LEARNING_COURSES.reduce((acc, c) => acc + c.lessons.length, 0)}
            </strong>
          </span>
          <span className="text-blue-800">·</span>
          <span className="font-bold text-yellow-300">{userXp} XP</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Course Curriculum Navigation */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-blue-900/60 bg-[#0B101B] flex flex-col p-4 overflow-y-auto">
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-300/80 font-semibold mb-3">
            {tr("Учебные курсы", "Curriculum Courses")}
          </div>

          <div className="space-y-3">
            {LEARNING_COURSES.map((course) => {
              const isSelected = selectedCourse?.id === course.id;

              return (
                <div key={course.id} className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveLessonIndex(0);
                      setSelectedAnswerIndex(null);
                      setIsAnswerSubmitted(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-950/70 border-yellow-400/70 text-white"
                        : "bg-[#111827] border-blue-800/60 text-slate-300 hover:border-blue-600 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-blue-300">
                        {localize(course.level)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {course.lessons.length} {tr("ур.", "les.")}
                      </span>
                    </div>
                    <div className="font-semibold text-xs leading-snug text-white">
                      {localize(course.title)}
                    </div>
                  </button>

                  {isSelected && (
                    <div className="pl-2 space-y-1 py-1">
                      {course.lessons.map((lesson, idx) => {
                        const isCurrent = activeLessonIndex === idx;
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setActiveLessonIndex(idx);
                              setSelectedAnswerIndex(null);
                              setIsAnswerSubmitted(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                              isCurrent
                                ? "bg-blue-600 text-white font-semibold"
                                : "text-slate-300 hover:text-white hover:bg-[#111827]"
                            }`}
                          >
                            <span className="truncate pr-2">
                              {idx + 1}. {localize(lesson.title)}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? "text-yellow-300" : "text-emerald-400"}`} />
                            ) : (
                              <span className={`text-[10px] font-mono tabular-nums ${isCurrent ? "text-yellow-200" : "text-slate-400"}`}>
                                +{lesson.xpReward}XP
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Body: Clean Single-Text Lesson + Question */}
        {activeLesson ? (
          <main className="flex-1 p-5 md:p-8 overflow-y-auto max-w-3xl mx-auto space-y-5 w-full">
            {/* Single Clean Explanation Card */}
            <article className="bg-[#0B101B] border border-blue-900/60 rounded-2xl p-6 md:p-7 space-y-5 shadow-xl shadow-black/40">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="font-bold text-yellow-400">
                    {tr("Урок", "Lesson")} {activeLesson.order}
                  </span>
                  <span>·</span>
                  <span>{localize(selectedCourse?.title || "")}</span>
                </div>
                <h1 className="text-2xl md:text-[26px] font-extrabold text-white tracking-tight leading-tight">
                  {localize(activeLesson.title)}
                </h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {localize(activeLesson.subtitle)}
                </p>
              </div>

              <div className="h-px bg-blue-900/50" />

              {/* One clear readable explanation */}
              <div className="text-[15px] text-slate-200 leading-7 whitespace-pre-line font-normal">
                {localize(activeLesson.theory)}
              </div>

              {activeLesson.formulaKey && (
                <QuizFormulaGraphic formulaKey={activeLesson.formulaKey} compact />
              )}

              {activeLesson.example && (
                <div className="rounded-xl bg-blue-950/50 border border-blue-700/50 px-4 py-3 text-sm text-slate-200 leading-relaxed">
                  <span className="font-bold text-yellow-400 mr-1.5">
                    {tr("Коротко:", "In short:")}
                  </span>
                  {localize(activeLesson.example)}
                </div>
              )}

              {/* Compact inline 3D practice CTA */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-blue-900/50">
                <span className="text-xs text-slate-400 max-w-md">
                  {localize(activeLesson.practiceTask.instruction)}
                </span>
                <button
                  onClick={() =>
                    onStartPracticeInLab(
                      activeLesson,
                      activeLesson.practiceTask.starterComponents,
                      activeLesson.practiceTask.starterWires
                    )
                  }
                  className="py-2 px-4 bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs rounded-xl inline-flex items-center gap-2 transition cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{tr("Попробовать в 3D", "Try in 3D Lab")}</span>
                </button>
              </div>
            </article>

            {/* Knowledge Check Question Card */}
            <section className="bg-[#0B101B] border border-blue-900/60 p-6 md:p-7 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-yellow-400" />
                  <span>{tr("Проверь себя", "Quick Check")}</span>
                </div>
                <span className="text-xs font-mono text-yellow-400 font-bold tabular-nums">
                  +{activeLesson.xpReward} XP
                </span>
              </div>

              <div className="text-base font-bold text-white leading-snug">
                {localize(activeLesson.question.text)}
              </div>

              <div className="space-y-2.5">
                {activeLesson.question.options.map((opt, i) => {
                  const isSelected = selectedAnswerIndex === i;
                  const isCorrect = i === activeLesson.question.correctIndex;
                  let btnStyle =
                    "bg-[#111827] border-blue-800/60 text-slate-200 hover:border-blue-600";

                  if (isAnswerSubmitted) {
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
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectAnswer(i)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm leading-relaxed flex items-center gap-3 transition cursor-pointer ${btnStyle}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono flex-shrink-0 bg-[#06080D] ${
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

              {!isAnswerSubmitted ? (
                <button
                  disabled={selectedAnswerIndex === null}
                  onClick={handleSubmitAnswer}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold transition cursor-pointer"
                >
                  {tr("Проверить ответ", "Check Answer")}
                </button>
              ) : (
                <div
                  className={`p-4 rounded-xl border text-sm leading-relaxed space-y-1.5 ${
                    selectedAnswerIndex === activeLesson.question.correctIndex
                      ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
                      : "bg-rose-950/50 border-rose-500/50 text-rose-200"
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {selectedAnswerIndex === activeLesson.question.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{tr(`Верно! +${activeLesson.xpReward} XP`, `Correct! +${activeLesson.xpReward} XP`)}</span>
                      </>
                    ) : (
                      <span>{tr("Почти! Посмотри разбор:", "Not quite — here is why:")}</span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {localize(activeLesson.question.explanation)}
                  </p>
                </div>
              )}
            </section>

            {/* Bottom Lesson Navigation */}
            <div className="flex items-center justify-between pt-2 pb-6">
              <button
                disabled={activeLessonIndex === 0}
                onClick={handlePrevLesson}
                className="py-2.5 px-4 rounded-xl bg-[#111827] hover:bg-blue-950/70 disabled:opacity-30 border border-blue-800/60 text-xs font-semibold text-slate-200 flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{tr("Предыдущий урок", "Previous Lesson")}</span>
              </button>

              <button
                disabled={
                  !selectedCourse ||
                  activeLessonIndex >= selectedCourse.lessons.length - 1
                }
                onClick={handleNextLesson}
                className="py-2.5 px-5 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 text-black text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <span>{tr("Следующий урок", "Next Lesson")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
};
