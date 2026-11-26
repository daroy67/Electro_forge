import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  HelpCircle,
  Search,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Activity,
  Code2,
  GripHorizontal,
  X,
  Pin,
  Move,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { CalicoCatIcon } from "../common/CalicoCatIcon";
import {
  ChatMessage,
  PlacedComponent,
  Wire,
  SimulationResult,
  CareerChallenge,
  IdeaBreakdown,
  UserPlan,
} from "../../types";
import {
  MENTOR_KNOWLEDGE_BASE,
  KnowledgeItem,
  searchKnowledgeBase,
  detectLanguage,
} from "../../data/mentorKnowledgeBase";

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  components: PlacedComponent[];
  wires: Wire[];
  simulation: SimulationResult;
  code: string;
  activeChallenge?: CareerChallenge;
  onApplyBomToBench?: (componentTypes: string[]) => void;
  onSelectDevice?: (deviceId: string) => void;
  onToggleExploded?: () => void;
  onOpenMultimeter?: () => void;
  onOpenCode?: () => void;
  onApplyCode?: (code: string) => void;
  onClose?: () => void;
  userPlan?: UserPlan;
  onOpenPlans?: () => void;
  onProFeatureClick?: (title: string, desc: string) => void;
  dailyAiCount?: number;
  dailyAiMax?: number;
}

// Extracts C++ / Arduino sketch block from markdown text
function extractCodeBlock(text: string): string | null {
  if (!text) return null;
  // Match any ```cpp / ```arduino / ```c++ block or any code block containing C++ syntax
  const match = text.match(/```(?:cpp|arduino|c\+\+|c)?[\r\n]+([\s\S]*?)```/i);
  if (match && match[1]) {
    const raw = match[1].trim();
    if (
      raw.length > 10 &&
      (raw.includes("void") ||
        raw.includes("setup") ||
        raw.includes("loop") ||
        raw.includes("pinMode") ||
        raw.includes("digitalWrite") ||
        raw.includes("int ") ||
        raw.includes("#include") ||
        raw.includes("analog") ||
        raw.includes("Serial"))
    ) {
      return raw;
    }
  }
  return null;
}

export const AiMentorPanel: React.FC<Props> = ({
  messages,
  onSendMessage,
  isLoading,
  components,
  wires,
  simulation,
  code,
  activeChallenge,
  onApplyBomToBench,
  onSelectDevice,
  onToggleExploded,
  onOpenMultimeter,
  onOpenCode,
  onApplyCode,
  onClose,
  userPlan = "free",
  onOpenPlans,
  onProFeatureClick,
  dailyAiCount = 0,
  dailyAiMax = 5,
}) => {
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "knowledge" | "generator">("chat");
  const [preferredLang, setPreferredLang] = useState<"ru" | "en">("ru");

  // Knowledge base search state
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedKnowledgeId, setExpandedKnowledgeId] = useState<string | null>("build-drone");

  // Idea to Prototype Generator state
  const [ideaPrompt, setIdeaPrompt] = useState("");
  const [ideaResult, setIdeaResult] = useState<IdeaBreakdown | null>(null);
  const [ideaError, setIdeaError] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  // Draggable Mentor state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mentorRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, textarea, .no-drag")) {
      return;
    }
    const el = mentorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position ? position.x : rect.left,
      initialY: position ? position.y : rect.top,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 380, dragStartRef.current.initialX + dx));
    const newY = Math.max(50, Math.min(window.innerHeight - 200, dragStartRef.current.initialY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-detect language when user types
  useEffect(() => {
    if (inputText.trim().length >= 2) {
      const detected = detectLanguage(inputText);
      if (detected !== preferredLang) {
        setPreferredLang(detected);
      }
    }
  }, [inputText, preferredLang]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Real-time suggestions when user types ("Вы хотите спросить это?")
  const suggestions = useMemo(() => {
    if (!inputText || inputText.trim().length < 2) return [];
    const results = searchKnowledgeBase(inputText);
    return results.slice(0, 3);
  }, [inputText]);

  // Filtered knowledge base items for the Knowledge tab
  const filteredKnowledge = useMemo(() => {
    let items = MENTOR_KNOWLEDGE_BASE;
    if (selectedCategory !== "all") {
      items = items.filter((item) => item.category === selectedCategory);
    }
    if (knowledgeSearchQuery.trim().length > 0) {
      items = searchKnowledgeBase(knowledgeSearchQuery);
      if (selectedCategory !== "all") {
        items = items.filter((item) => item.category === selectedCategory);
      }
    }
    return items;
  }, [knowledgeSearchQuery, selectedCategory]);

  const trySendPrompt = (promptToSend: string): boolean => {
    const clean = promptToSend.trim();
    if (!clean || isLoading) return false;
    if (userPlan === "free" && dailyAiCount >= dailyAiMax) {
      onProFeatureClick?.(
        "AI Ментор: Дневной лимит (5/5)",
        `Вы использовали все ${dailyAiMax} бесплатных запросов к AI Ментору на сегодня. Лимит обнуляется каждые 24 часа, а в PRO доступен безлимитный анализ экрана и схем.`
      );
      return false;
    }
    onSendMessage(clean);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trySendPrompt(inputText)) {
      setInputText("");
    }
  };

  const handleApplySuggestion = (item: KnowledgeItem) => {
    const promptToSend =
      preferredLang === "ru" ? item.suggestedPromptRu : item.suggestedPromptEn;
    if (trySendPrompt(promptToSend)) {
      setInputText("");
      if (activeTab !== "chat") setActiveTab("chat");
    }
  };

  const handleAskKnowledgeItem = (item: KnowledgeItem) => {
    const promptToSend =
      preferredLang === "ru" ? item.suggestedPromptRu : item.suggestedPromptEn;
    if (trySendPrompt(promptToSend)) {
      setActiveTab("chat");
    }
  };

  const handleGenerateIdea = async () => {
    if (!ideaPrompt.trim() || isGeneratingIdea) return;
    setIsGeneratingIdea(true);
    setIdeaError(null);

    try {
      const response = await fetch("/api/ai/idea-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaPrompt.trim(), prompt: ideaPrompt.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Ошибка сервера AI (${response.status})`);
      }
      setIdeaResult(data);
    } catch (err: any) {
      console.error("Failed to generate idea breakdown", err);
      setIdeaError(err?.message || "Не удалось связаться с сервисом ИИ.");
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // Quick ready-made question chips
  const quickReadyQuestions = [
    {
      labelRu: "👁️ Что на экране сейчас?",
      labelEn: "👁️ Inspect my screen",
      query:
        preferredLang === "ru"
          ? "Посмотри на мой экран и объясни, что сейчас собрано, горит ли лампочка/схема и что нужно исправить."
          : "Look at my current screen and explain what is built, whether LEDs/circuits work, and what to fix.",
    },
    {
      labelRu: "Дрон: полет и сборка",
      labelEn: "Drone: Fly & Build",
      query: preferredLang === "ru" ? "Как запустить моторы и летать на квадрокоптере?" : "How do I arm motors and fly the quadcopter drone?",
    },
    {
      labelRu: "Смартфон и тест экрана",
      labelEn: "Smartphone & Screen",
      query: preferredLang === "ru" ? "Как устроен смартфон и как включить его виртуальный экран и фонарик?" : "How is the smartphone built and how to test its screen and torch?",
    },
    {
      labelRu: "Взрыв-схема 3D слоев",
      labelEn: "3D Exploded View",
      query: preferredLang === "ru" ? "Что такое Взрыв-схема и как её включить?" : "What is an Exploded View and how to toggle it?",
    },
    {
      labelRu: "Сборка схемы с нуля",
      labelEn: "Build from scratch",
      query: preferredLang === "ru" ? "Как собрать реальную работающую схему с нуля?" : "How do I build a real working circuit from scratch without templates?",
    },
    {
      labelRu: "Светодиод + резистор",
      labelEn: "LED & Resistor",
      query: preferredLang === "ru" ? "Как собрать базовую цепь со светодиодом и резистором с нуля?" : "How to wire an LED and resistor?",
    },
    {
      labelRu: "Кнопка и зуммер",
      labelEn: "Button & Buzzer",
      query: preferredLang === "ru" ? "Как собрать интерактивную схему с кнопкой и зуммером?" : "How do I wire a pushbutton to trigger a buzzer?",
    },
    {
      labelRu: "Макетная плата Breadboard",
      labelEn: "Breadboard guide",
      query: preferredLang === "ru" ? "Как собирать схемы на макетной плате (Breadboard)?" : "How to build circuits on a solderless breadboard?",
    },
    {
      labelRu: "Как собрать дрон?",
      labelEn: "How to build a drone?",
      query: preferredLang === "ru" ? "Как собрать и запустить квадрокоптер?" : "How to build and fly a drone?",
    },
    {
      labelRu: "Как собрать смартфон?",
      labelEn: "How to build a phone?",
      query: preferredLang === "ru" ? "Как собрать и проверить смартфон?" : "How to assemble a smartphone?",
    },
    {
      labelRu: "Как собрать ноутбук / ПК?",
      labelEn: "How to build laptop / PC?",
      query: preferredLang === "ru" ? "Как собрать ноутбук или ПК?" : "How do I build a Laptop or PC?",
    },
    {
      labelRu: "Как собрать телевизор?",
      labelEn: "How to build smart TV?",
      query: preferredLang === "ru" ? "Как собрать телевизор (Smart TV)?" : "How do I build a Smart TV?",
    },
    {
      labelRu: "Как собрать смарт дом?",
      labelEn: "How to build smart home?",
      query: preferredLang === "ru" ? "Как собрать систему умного дома?" : "How do I build a Smart Home system?",
    },
    {
      labelRu: "Как собрать робота?",
      labelEn: "How to build a rover?",
      query: preferredLang === "ru" ? "Как собрать робота-ровера?" : "How to build a robot rover?",
    },
    {
      labelRu: "Как соединять провода?",
      labelEn: "How to connect wires?",
      query: preferredLang === "ru" ? "Как соединять детали проводами?" : "How to connect wires between components?",
    },
    {
      labelRu: "Что такое взрыв-схема?",
      labelEn: "Exploded view guide?",
      query: preferredLang === "ru" ? "Что такое взрыв-схема и как её включить?" : "What is an exploded view?",
    },
    {
      labelRu: "Как измерить мультиметром?",
      labelEn: "How to use multimeter?",
      query: preferredLang === "ru" ? "Как пользоваться виртуальным мультиметром?" : "How to use the multimeter?",
    },
    {
      labelRu: "Почему сгорел светодиод?",
      labelEn: "Why did LED burn out?",
      query: preferredLang === "ru" ? "Почему сгорел светодиод и как это исправить?" : "Why did my LED burn out?",
    },
    {
      labelRu: "Как прошить код?",
      labelEn: "How to flash code?",
      query: preferredLang === "ru" ? "Как писать и прошивать код для контроллера?" : "How to flash firmware code?",
    },
  ];

  return (
    <>
      {!position && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}
      <div
        ref={mentorRef}
        id="ai-mentor-panel"
        style={
          position
            ? {
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                right: "auto",
                bottom: "auto",
                height: "calc(100vh - 120px)",
                maxHeight: "780px",
                zIndex: 40,
              }
            : undefined
        }
        className={`flex flex-col bg-[#0B101B] border-l border-blue-900/60 ${
          position
            ? "w-[420px] max-w-[calc(100vw-24px)] rounded-2xl border border-blue-800/60 shadow-2xl overflow-hidden"
            : "fixed md:relative inset-y-0 right-0 z-40 md:z-20 w-full sm:w-[400px] max-w-full sm:max-w-[400px] h-full shadow-xl md:shadow-none"
        } text-slate-100 select-none ${isDragging ? "ring-2 ring-yellow-400 cursor-grabbing" : ""}`}
      >
      {/* Mentor Header with Drag Handle */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="px-2.5 py-2.5 border-b border-blue-900/60 bg-black/70 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing touch-none select-none group min-w-0"
        title="Зажмите и перетаскивайте панель ИИ по экрану"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-xl bg-blue-950 border border-blue-700/60 flex items-center justify-center p-0.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <CalicoCatIcon className="w-6 h-6" mood="happy" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 min-w-0">
              <span className="truncate">AI Ментор</span>
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              {position && (
                <span className="text-[9px] font-mono text-yellow-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-700/60 shrink-0">
                  Плавающий
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 min-w-0">
              <Eye className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">
                {preferredLang === "ru"
                  ? "Видит экран, схему и код"
                  : "Sees screen, circuit & code"}
              </span>
            </div>
          </div>
        </div>

        {/* Language, Pin, Tabs & Close */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Dock / Pin button if floating */}
          {position && (
            <button
              onClick={() => setPosition(null)}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#111827] hover:bg-blue-950 text-slate-200 border border-blue-800/60 transition flex items-center gap-1 cursor-pointer shrink-0"
              title="Прикрепить обратно к правому краю"
            >
              <Pin className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">Сбоку</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setPreferredLang((prev) => (prev === "ru" ? "en" : "ru"))}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111827] hover:bg-blue-950 text-blue-300 border border-blue-800/60 transition cursor-pointer shrink-0"
            title={preferredLang === "ru" ? "Язык ответов: Русский" : "Response language: English"}
          >
            {preferredLang === "ru" ? "RU" : "EN"}
          </button>

          {/* Navigation Tabs */}
          <div className="flex bg-[#111827] rounded-lg p-0.5 border border-blue-900/60 text-[11px] shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "chat"
                  ? "bg-yellow-400 text-black font-bold shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>{preferredLang === "ru" ? "Чат" : "Chat"}</span>
            </button>
            <button
              onClick={() => setActiveTab("knowledge")}
              className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "knowledge"
                  ? "bg-yellow-400 text-black font-bold shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>{preferredLang === "ru" ? "База" : "Wiki"}</span>
            </button>
            <button
              onClick={() => setActiveTab("generator")}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "generator"
                  ? "bg-yellow-400 text-black font-bold shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>{preferredLang === "ru" ? "Идея" : "Idea"}</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-900/50 rounded-lg text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              title="Закрыть панель ИИ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CHAT TUTOR */}
      {activeTab === "chat" && (
        <>
          {/* Telemetry & Context Strip */}
          <div className="px-3.5 py-1.5 bg-[#111827] border-b border-blue-900/60 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="font-mono text-slate-300">
              Схема: {components.length} дет., {wires.length} пров.
            </span>
            <span
              className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold ${
                simulation.alerts.some((a) => a.level === "error")
                  ? "bg-yellow-400/15 text-yellow-300 border border-yellow-400/50"
                  : simulation.isRunning
                  ? "bg-blue-950 text-blue-300 border border-blue-600/60"
                  : "bg-black text-slate-400 border border-blue-900/50"
              }`}
            >
              {simulation.alerts.some((a) => a.level === "error")
                ? "Отказ в цепи"
                : simulation.isRunning
                ? "Симуляция активна"
                : "Ожидание"}
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#06080D]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.sender === "user"
                      ? "bg-yellow-400 text-black shadow-xs"
                      : "bg-[#111827] border border-blue-800/60 p-0.5 shadow-xs"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <CalicoCatIcon className="w-6 h-6" mood="happy" />
                  )}
                </div>

                <div
                  className={`max-w-[88%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none font-medium"
                      : "bg-[#111827] text-slate-200 border border-blue-900/60 rounded-tl-none"
                  }`}
                >
                  <div className={`markdown-body text-xs max-w-none prose-p:my-1 prose-headings:my-1.5 prose-ul:my-1 prose-li:my-0.5 ${msg.sender === "user" ? "text-white" : "text-slate-200"}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Reactive 1-Click Code Flash/Apply Button */}
                  {(() => {
                    const extractedCode = msg.sender === "mentor" ? extractCodeBlock(msg.text) : null;
                    if (!extractedCode) return null;
                    return (
                      <div className="mt-2.5 p-2 rounded-xl bg-blue-950/80 border border-blue-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-300 font-semibold">
                          <Cpu className="w-3.5 h-3.5 text-yellow-400" />
                          <span>{preferredLang === "ru" ? "C++ прошивка готова к загрузке" : "C++ sketch ready to flash"}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (onApplyCode) {
                              onApplyCode(extractedCode);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title={preferredLang === "ru" ? "Мгновенно прошить чип без ручного открытия редактора" : "Instantly flash MCU without opening editor"}
                        >
                          <Zap className="w-3.5 h-3.5 fill-black" />
                          <span>{preferredLang === "ru" ? "Прошить (Flash)" : "Flash in 1 Click"}</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Interactive Action Shortcuts under Assistant Messages */}
                  {msg.sender === "mentor" && (
                    <div className="mt-2.5 pt-2 border-t border-blue-900/60 flex flex-wrap gap-1.5">
                      {(msg.text.toLowerCase().includes("дрон") ||
                        msg.text.toLowerCase().includes("drone") ||
                        msg.text.toLowerCase().includes("квадрокоптер")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-drone")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить готовую 3D-архитектуру квадрокоптера"
                          >
                            <span>Загрузить дрон в 3D</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("смартфон") ||
                        msg.text.toLowerCase().includes("телефон") ||
                        msg.text.toLowerCase().includes("phone")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-smartphone")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить 3D-архитектуру смартфона с экраном"
                          >
                            <span>Загрузить смартфон в 3D</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("робот") ||
                        msg.text.toLowerCase().includes("ровер") ||
                        msg.text.toLowerCase().includes("rover")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-robot")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить автономного робота 2WD"
                          >
                            <span>Загрузить ровера 2WD</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("ноутбук") ||
                        msg.text.toLowerCase().includes("laptop") ||
                        msg.text.toLowerCase().includes("пк") ||
                        msg.text.toLowerCase().includes("компьютер")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-laptop")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить архитектуру Ноутбука и ПК"
                          >
                            <span>Загрузить ноутбук / ПК</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("базов") ||
                        msg.text.toLowerCase().includes("arduino") ||
                        msg.text.toLowerCase().includes("макет")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-custom")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить базовый макет Arduino + LED"
                          >
                            <span>Загрузить базовый макет</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("телевизор") ||
                        msg.text.toLowerCase().includes("tv") ||
                        msg.text.toLowerCase().includes("монитор")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-television")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить архитектуру Smart TV"
                          >
                            <span>Загрузить телевизор</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("смарт дом") ||
                        msg.text.toLowerCase().includes("умный дом") ||
                        msg.text.toLowerCase().includes("smarthome") ||
                        msg.text.toLowerCase().includes("smart home")) &&
                        onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("device-iothome")}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Загрузить архитектуру Смарт Дома"
                          >
                            <span>Загрузить смарт дом</span>
                          </button>
                        )}
                      {(msg.text.toLowerCase().includes("взрыв-схем") ||
                        msg.text.toLowerCase().includes("exploded")) &&
                        onToggleExploded && (
                          <button
                            onClick={onToggleExploded}
                            className="px-2.5 py-1 rounded-lg bg-black hover:bg-blue-950 border border-blue-800/60 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 transition hover:border-yellow-400 cursor-pointer"
                            title="Разнести детали на парящие 3D-слои"
                          >
                            <span>Взрыв-схема (3D-слои)</span>
                          </button>
                        )}
                    </div>
                  )}

                  <div className={`text-[9px] text-right mt-1 font-mono ${msg.sender === "user" ? "text-blue-100" : "text-slate-400"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-slate-200 p-2.5 bg-[#111827] rounded-xl border border-blue-900/60">
                <CalicoCatIcon className="w-5 h-5" mood="thinking" />
                <span>
                  {preferredLang === "ru"
                    ? "ИИ анализирует схему и готовит ответ..."
                    : "Analyzing the circuit and physics..."}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Ready-Made Questions Scroll Strip */}
          <div className="px-2 py-1.5 border-t border-blue-900/60 bg-[#111827] flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickReadyQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => trySendPrompt(q.query)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-blue-950 hover:text-yellow-400 hover:border-yellow-400 text-slate-300 rounded-lg text-[11px] whitespace-nowrap transition border border-blue-900/60 flex-shrink-0 shadow-xs cursor-pointer"
              >
                <span>{preferredLang === "ru" ? q.labelRu : q.labelEn}</span>
              </button>
            ))}
          </div>

          {/* REAL-TIME INTELLIGENT SUGGESTIONS */}
          {suggestions.length > 0 && inputText.trim().length >= 2 && (
            <div className="mx-3 mb-1 p-2.5 bg-[#0B101B] border-2 border-yellow-400 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-yellow-400 mb-1.5 px-0.5">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
                  <span>
                    {preferredLang === "ru" ? "Вы хотите спросить это?" : "Did you mean to ask this?"}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">
                  {preferredLang === "ru" ? "Подсказка" : "Topic"}
                </span>
              </div>

              <div className="space-y-1">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplySuggestion(item)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950 border border-blue-900/60 hover:border-yellow-400 text-xs text-slate-200 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate pr-2 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <span className="truncate">
                        {preferredLang === "ru" ? item.titleRu : item.titleEn}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-yellow-400 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Free Tier AI usage strip */}
          {userPlan === "free" && (
            <div className="px-3.5 py-1.5 bg-[#111827] border-t border-blue-900/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">
                Лимит сообщений (Free):{" "}
                <span className={dailyAiCount >= dailyAiMax ? "text-yellow-300 font-bold" : "text-yellow-400 font-bold"}>
                  {dailyAiCount}/{dailyAiMax}
                </span>
              </span>
              {onOpenPlans && (
                <button
                  type="button"
                  onClick={onOpenPlans}
                  className="text-blue-400 hover:underline font-semibold text-[10px] cursor-pointer"
                >
                  Безлимит в PRO →
                </button>
              )}
            </div>
          )}

          {/* Chat Input Field Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-blue-900/60 bg-black/70 flex gap-2"
          >
            <input
              ref={inputRef}
              id="ai-mentor-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                userPlan === "free" && dailyAiCount >= dailyAiMax
                  ? preferredLang === "ru"
                    ? "Дневной лимит 5/5 исчерпан (доступно завтра или в PRO)"
                    : "Daily limit 5/5 reached (tomorrow or PRO)"
                  : preferredLang === "ru"
                  ? "Спросите про экран, схему или код..."
                  : "Ask about your screen, circuit, or code..."
              }
              disabled={isLoading}
              className="flex-1 bg-[#111827] border border-blue-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-yellow-400 transition-colors shadow-xs"
            />
            <button
              id="btn-send-mentor"
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold rounded-xl transition-all shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer"
              title={preferredLang === "ru" ? "Отправить вопрос" : "Send message"}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}

      {/* TAB 2: KNOWLEDGE BASE BROWSER */}
      {activeTab === "knowledge" && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden bg-[#0B101B]">
          {/* Search bar inside Knowledge Base */}
          <div className="relative mb-2.5">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={knowledgeSearchQuery}
              onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
              placeholder={
                preferredLang === "ru"
                  ? "Поиск тем: дрон, телефон, робот, провод, мультиметр..."
                  : "Search topics: drone, phone, robot, wires, multimeter..."
              }
              className="w-full bg-black border border-blue-800/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:bg-[#06080D] focus:border-yellow-400 transition shadow-xs"
            />
            {knowledgeSearchQuery && (
              <button
                onClick={() => setKnowledgeSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-yellow-300 text-xs p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar text-[11px]">
            {[
              { id: "all", labelRu: "Все темы", labelEn: "All Topics" },
              { id: "devices", labelRu: "Устройства", labelEn: "Devices" },
              { id: "wiring", labelRu: "Проводка", labelEn: "Wiring" },
              { id: "instruments", labelRu: "Приборы", labelEn: "Instruments" },
              { id: "physics", labelRu: "Физика / КЗ", labelEn: "Physics" },
              { id: "code", labelRu: "Прошивка", labelEn: "Firmware" },
              { id: "general", labelRu: "Общее", labelEn: "General" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition font-medium border ${
                  selectedCategory === cat.id
                    ? "bg-yellow-400 text-black border-yellow-300 font-bold shadow-xs"
                    : "bg-[#111827] text-slate-300 border-blue-900/60 hover:text-white hover:border-blue-600"
                }`}
              >
                {preferredLang === "ru" ? cat.labelRu : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Knowledge Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredKnowledge.map((item) => {
              const isExpanded = expandedKnowledgeId === item.id;
              const title = preferredLang === "ru" ? item.titleRu : item.titleEn;
              const summary = preferredLang === "ru" ? item.summaryRu : item.summaryEn;
              const answer = preferredLang === "ru" ? item.answerRu : item.answerEn;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "bg-[#111827] border-yellow-400/70 shadow-sm"
                      : "bg-[#111827]/80 border-blue-900/60 hover:border-blue-600/80"
                  }`}
                >
                  <div
                    onClick={() => setExpandedKnowledgeId(isExpanded ? null : item.id)}
                    className="p-3 cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs leading-snug">{title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{summary}</p>
                    </div>
                    <button className="text-slate-400 p-1 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-blue-900/60 text-xs bg-[#06080D]">
                      <div className="markdown-body max-w-none text-xs leading-relaxed py-2 text-slate-200">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                      </div>

                      {/* Action Bar for this item */}
                      <div className="pt-2.5 mt-2 border-t border-blue-900/60 flex flex-wrap gap-2 justify-between items-center">
                        <button
                          onClick={() => handleAskKnowledgeItem(item)}
                          className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>
                            {preferredLang === "ru" ? "Спросить в чате" : "Ask in Chat"}
                          </span>
                        </button>

                        {/* Interactive Direct Shortcuts */}
                        {item.id === "build-drone" && onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("quadcopter-drone")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 text-blue-300 text-xs border border-blue-800/60 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Загрузить дрон</span>
                          </button>
                        )}

                        {item.id === "build-smartphone" && onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("smartphone-pro")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 text-blue-300 text-xs border border-blue-800/60 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Загрузить смартфон</span>
                          </button>
                        )}

                        {item.id === "build-robot" && onSelectDevice && (
                          <button
                            onClick={() => onSelectDevice("robot-rover")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#111827] hover:bg-blue-950/70 text-blue-300 text-xs border border-blue-800/60 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Загрузить робота</span>
                          </button>
                        )}

                        {item.id === "exploded-view" && onToggleExploded && (
                          <button
                            onClick={onToggleExploded}
                            className="px-2.5 py-1.5 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 text-xs border border-yellow-400/40 flex items-center gap-1 cursor-pointer"
                          >
                            <Layers className="w-3 h-3 text-yellow-400" />
                            <span>Взрыв-схема</span>
                          </button>
                        )}

                        {item.id === "use-multimeter" && onOpenMultimeter && (
                          <button
                            onClick={onOpenMultimeter}
                            className="px-2.5 py-1.5 rounded-lg bg-yellow-400/15 hover:bg-yellow-400/25 text-yellow-300 text-xs border border-yellow-400/40 flex items-center gap-1 cursor-pointer"
                          >
                            <Activity className="w-3 h-3 text-yellow-400" />
                            <span>Мультиметр</span>
                          </button>
                        )}

                        {item.id === "code-and-firmware" && onOpenCode && (
                          <button
                            onClick={onOpenCode}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 text-xs border border-blue-700/60 flex items-center gap-1 cursor-pointer"
                          >
                            <Code2 className="w-3 h-3 text-blue-400" />
                            <span>Редактор кода</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredKnowledge.length === 0 && (
              <div className="text-center p-6 bg-[#111827] rounded-xl border border-blue-900/60">
                <HelpCircle className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <p className="text-xs text-white font-bold">Ничего не найдено</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Попробуйте ввести другие ключевые слова или спросите в чате напрямую.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: IDEA TO PROTOTYPE GENERATOR */}
      {activeTab === "generator" && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#0B101B]">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{preferredLang === "ru" ? "Генератор спецификаций (BOM)" : "Idea-to-Prototype Engine"}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {preferredLang === "ru"
                ? "Опишите вашу идею электронного гаджета простыми словами. ИИ-архитектор разложит её на необходимые радиодетали, требования по питанию и логику прошивки."
                : "Describe an electronic device or invention in natural language. The AI architect will break down the system architecture, generate a Bill of Materials, and guide your build."}
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              id="idea-prompt-input"
              value={ideaPrompt}
              onChange={(e) => setIdeaPrompt(e.target.value)}
              rows={3}
              placeholder={
                preferredLang === "ru"
                  ? "Например: «Умная кормушка для питомца с датчиком веса и OLED-дисплеем» или «Дверной звонок с сонаром и зуммером»"
                  : "e.g. 'An automatic pet food dispenser with weight sensor and OLED display' or 'Smart doorbell with buzzer'"
              }
              className="w-full bg-black border border-blue-800/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:bg-[#06080D] focus:border-yellow-400 resize-none shadow-xs"
            />

            <button
              id="btn-generate-architecture"
              onClick={handleGenerateIdea}
              disabled={isGeneratingIdea || !ideaPrompt.trim()}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isGeneratingIdea ? (
                <>
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>{preferredLang === "ru" ? "Синтез архитектуры системы..." : "Synthesizing System Architecture..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{preferredLang === "ru" ? "Создать спецификацию и BOM" : "Generate Architecture & BOM"}</span>
                </>
              )}
            </button>
          </div>

          {ideaError && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200">
              ⚠️ {ideaError}
            </div>
          )}

          {/* Idea breakdown results */}
          {ideaResult && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-[#111827] rounded-xl border border-blue-900/60">
                <div className="font-bold text-blue-300 mb-1">
                  {preferredLang === "ru" ? "Резюме проекта:" : "Project Summary:"}
                </div>
                <p className="text-slate-200 leading-relaxed">{ideaResult.summary}</p>
              </div>

              {ideaResult.recommendedComponents && (
                <div className="p-3 bg-[#111827] rounded-xl border border-blue-900/60">
                  <div className="font-bold text-white mb-2 flex items-center justify-between">
                    <span>{preferredLang === "ru" ? "Рекомендуемые компоненты (BOM):" : "Recommended Components:"}</span>
                    {onApplyBomToBench && (
                      <button
                        onClick={() =>
                          onApplyBomToBench(ideaResult.recommendedComponents.map((c: any) => c.type))
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-black border border-yellow-300 hover:bg-yellow-300 font-bold cursor-pointer"
                      >
                        {preferredLang === "ru" ? "+ Добавить на верстак" : "+ Add to Bench"}
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {ideaResult.recommendedComponents.map((comp: any, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <span className="text-yellow-400 font-mono">•</span>
                        <div>
                          <span className="font-bold text-white">{comp.name}</span>:{" "}
                          <span className="text-slate-400">{comp.rationale}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
};
