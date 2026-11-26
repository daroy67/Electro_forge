import React from "react";
import {
  Wrench,
  Zap,
  Award,
  Play,
  Flame,
  Star,
  Users,
  ThumbsUp,
  Cpu,
  Clock,
  Sparkles,
  ShieldCheck,
  Rocket,
} from "lucide-react";

export type RobloxCoverPreset =
  | "repair"
  | "challenges"
  | "career"
  | "smartphone"
  | "speed"
  | "budget"
  | "efficiency"
  | "logic"
  | "first_light"
  | "default";

interface RobloxMiniCoverProps {
  preset?: RobloxCoverPreset;
  title?: string;
  tag?: string;
  rating?: string;
  players?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  sticker?: string;
  customIcon?: React.ReactNode;
}

export const RobloxMiniCover: React.FC<RobloxMiniCoverProps> = ({
  preset = "repair",
  title,
  tag,
  rating,
  players,
  size = "md",
  sticker,
  customIcon,
  className = "",
}) => {
  // Preset definitions tailored for Roblox game aesthetic
  const config = React.useMemo(() => {
    switch (preset) {
      case "repair":
        return {
          gradient: "from-amber-500 via-orange-600 to-rose-950",
          border: "border-amber-400/50 shadow-orange-500/20",
          tagBg: "bg-amber-950/80 text-amber-300 border-amber-500/40",
          tag: tag || "🔧 REPAIR SIMULATOR",
          rating: rating || "98%",
          players: players || "18.4K",
          icon: <Wrench className="w-8 h-8 text-amber-200 drop-shadow-md" />,
          title: title || "СЕРВИСНЫЙ ЦЕНТР",
          sticker: sticker || "🔧",
          accentColor: "from-amber-400 to-orange-500",
        };
      case "challenges":
        return {
          gradient: "from-violet-600 via-fuchsia-600 to-indigo-950",
          border: "border-fuchsia-400/50 shadow-fuchsia-500/20",
          tagBg: "bg-purple-950/80 text-fuchsia-300 border-fuchsia-500/40",
          tag: tag || "⚡ SPEED OBBY & TIME",
          rating: rating || "96%",
          players: players || "24.1K",
          icon: <Zap className="w-8 h-8 text-yellow-300 drop-shadow-md" />,
          title: title || "СПИДРАН СХЕМ",
          sticker: sticker || "⚡",
          accentColor: "from-violet-400 to-fuchsia-500",
        };
      case "career":
        return {
          gradient: "from-sky-500 via-blue-600 to-slate-950",
          border: "border-sky-400/50 shadow-sky-500/20",
          tagBg: "bg-blue-950/80 text-sky-300 border-sky-500/40",
          tag: tag || "🚀 ENGINEER TYCOON",
          rating: rating || "99%",
          players: players || "35.2K",
          icon: <Rocket className="w-8 h-8 text-sky-200 drop-shadow-md" />,
          title: title || "КАРЬЕРА: LVL 1-50",
          sticker: sticker || "🚀",
          accentColor: "from-sky-400 to-indigo-500",
        };
      case "smartphone":
        return {
          gradient: "from-emerald-500 via-teal-600 to-slate-950",
          border: "border-emerald-400/50 shadow-emerald-500/20",
          tagBg: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
          tag: tag || "📱 PHONE REPAIR",
          rating: rating || "97%",
          players: players || "12.0K",
          icon: <Cpu className="w-8 h-8 text-emerald-200 drop-shadow-md" />,
          title: title || "РЕМОНТ СМАРТФОНА",
          sticker: sticker || "📱",
          accentColor: "from-emerald-400 to-teal-500",
        };
      case "speed":
        return {
          gradient: "from-yellow-500 via-amber-600 to-red-950",
          border: "border-yellow-400/50 shadow-yellow-500/20",
          tagBg: "bg-amber-950/80 text-yellow-300 border-yellow-500/40",
          tag: tag || "⏱️ 45s RUSH",
          rating: rating || "95%",
          players: players || "8.4K",
          icon: <Clock className="w-8 h-8 text-yellow-200 drop-shadow-md" />,
          title: title || "СБОРКА НА СКОРОСТЬ",
          sticker: sticker || "⏱️",
          accentColor: "from-yellow-400 to-amber-500",
        };
      case "budget":
        return {
          gradient: "from-teal-500 via-emerald-600 to-slate-950",
          border: "border-teal-400/50 shadow-teal-500/20",
          tagBg: "bg-teal-950/80 text-teal-300 border-teal-500/40",
          tag: tag || "💰 ECONOMY SIM",
          rating: rating || "94%",
          players: players || "6.7K",
          icon: <Sparkles className="w-8 h-8 text-teal-200 drop-shadow-md" />,
          title: title || "БЮДЖЕТ $5",
          sticker: sticker || "💰",
          accentColor: "from-teal-400 to-emerald-500",
        };
      case "efficiency":
        return {
          gradient: "from-cyan-500 via-blue-600 to-slate-950",
          border: "border-cyan-400/50 shadow-cyan-500/20",
          tagBg: "bg-cyan-950/80 text-cyan-300 border-cyan-500/40",
          tag: tag || "❄ ZERO HEAT",
          rating: rating || "97%",
          players: players || "9.1K",
          icon: <Flame className="w-8 h-8 text-cyan-200 drop-shadow-md" />,
          title: title || "ХОЛОДНАЯ ЛИНИЯ",
          sticker: sticker || "❄️",
          accentColor: "from-cyan-400 to-blue-500",
        };
      case "logic":
        return {
          gradient: "from-purple-500 via-pink-600 to-slate-950",
          border: "border-pink-400/50 shadow-pink-500/20",
          tagBg: "bg-purple-950/80 text-pink-300 border-pink-500/40",
          tag: tag || "🧩 LOGIC PUZZLE",
          rating: rating || "98%",
          players: players || "11.5K",
          icon: <Award className="w-8 h-8 text-pink-200 drop-shadow-md" />,
          title: title || "ИНЖЕНЕРНАЯ ЛОГИКА",
          sticker: sticker || "🧩",
          accentColor: "from-purple-400 to-pink-500",
        };
      case "first_light":
        return {
          gradient: "from-amber-400 via-emerald-600 to-slate-950",
          border: "border-amber-400/50 shadow-emerald-500/20",
          tagBg: "bg-slate-950/80 text-amber-300 border-amber-500/40",
          tag: tag || "💡 MISSION 01",
          rating: rating || "99%",
          players: players || "45.0K",
          icon: <ShieldCheck className="w-8 h-8 text-amber-200 drop-shadow-md" />,
          title: title || "ПЕРВЫЙ СВЕТ",
          sticker: sticker || "💡",
          accentColor: "from-amber-400 to-emerald-500",
        };
      default:
        return {
          gradient: "from-sky-500 via-indigo-600 to-slate-950",
          border: "border-sky-400/50 shadow-sky-500/20",
          tagBg: "bg-slate-950/80 text-sky-300 border-sky-500/40",
          tag: tag || "🎮 PLAY EXPERIENCE",
          rating: rating || "96%",
          players: players || "15.0K",
          icon: <Zap className="w-8 h-8 text-white drop-shadow-md" />,
          title: title || "ИНЖЕНЕРНЫЙ РЕЖИМ",
          sticker: sticker || "⚡",
          accentColor: "from-sky-400 to-indigo-500",
        };
    }
  }, [preset, title, tag, rating, players, sticker]);

  // Size dimensions
  const sizeClasses = {
    sm: "w-20 h-20 min-w-[5rem] rounded-xl text-[9px]",
    md: "w-24 h-24 min-w-[6rem] sm:w-28 sm:h-28 sm:min-w-[7rem] rounded-2xl text-[10px]",
    lg: "w-32 h-32 min-w-[8rem] sm:w-36 sm:h-36 sm:min-w-[9rem] rounded-2xl text-xs",
  };

  return (
    <div
      className={`relative group cursor-pointer select-none overflow-hidden bg-gradient-to-br ${config.gradient} border-2 ${config.border} shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:brightness-110 flex flex-col justify-between p-2 flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {/* 3D Glossy Light Reflection Sheen (Roblox Signature Gloss) */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none transform -rotate-12 group-hover:opacity-80 transition opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none rounded-t-xl" />

      {/* Subtle Roblox Grid Texture Pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px]"
      />

      {/* Top Bar: Genre Badge & VIP Glow */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span
          className={`font-black font-mono tracking-tight px-1.5 py-0.5 rounded-md border text-[8px] uppercase backdrop-blur-md shadow-sm truncate max-w-[85%] ${config.tagBg}`}
        >
          {config.tag}
        </span>
        <div className="w-2 h-2 rounded-full bg-emerald-400 border border-slate-900 animate-pulse shadow-sm" />
      </div>

      {/* Center 3D Mascot / Sticker / Icon */}
      <div className="relative z-10 flex items-center justify-center my-auto transition-transform duration-300 group-hover:scale-110">
        <div className="relative">
          {/* Glowing Aura */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-sky-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition" />

          {/* Sticker Emoji or Lucide Icon */}
          <div className="relative flex items-center justify-center">
            {customIcon ? (
              customIcon
            ) : config.sticker ? (
              <span className="text-2xl sm:text-3xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
                {config.sticker}
              </span>
            ) : (
              config.icon
            )}
          </div>
        </div>
      </div>

      {/* Bottom Roblox Stats Pill (Rating & Players) */}
      <div className="relative z-10 w-full pt-1">
        <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-lg px-1.5 py-0.5 flex items-center justify-between text-white font-mono text-[8px] sm:text-[9px]">
          <div className="flex items-center gap-0.5 text-emerald-400 font-bold">
            <ThumbsUp className="w-2.5 h-2.5" />
            <span>{config.rating}</span>
          </div>
          <div className="flex items-center gap-0.5 text-slate-300">
            <Users className="w-2.5 h-2.5 text-sky-400" />
            <span>{config.players}</span>
          </div>
        </div>
      </div>

      {/* Green Play Button Pop-up Overlay on Hover (Like in Roblox) */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 border-2 border-white text-slate-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-200">
          <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
        </div>
      </div>
    </div>
  );
};
