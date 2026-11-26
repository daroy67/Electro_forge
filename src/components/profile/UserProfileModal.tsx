import React from "react";
import {
  User,
  Trophy,
  Zap,
  Award,
  Shield,
  Activity,
  Flame,
  CheckCircle,
  BarChart3,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userXp: number;
  completedChallengesCount: number;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userXp,
  completedChallengesCount,
}) => {
  if (!isOpen) return null;

  const currentLevel = Math.floor(userXp / 250) + 1;
  const currentLevelXp = userXp % 250;
  const levelProgressPct = Math.round((currentLevelXp / 250) * 100);

  // Engineering skill ratings
  const skills = [
    { name: "Electronics & Circuit Design", value: Math.min(100, 35 + currentLevel * 12) },
    { name: "Firmware & Embedded C++", value: Math.min(100, 25 + currentLevel * 10) },
    { name: "Thermal & Physical Modeling", value: Math.min(100, 20 + currentLevel * 14) },
    { name: "Reliability & Stress Analysis", value: Math.min(100, 40 + currentLevel * 8) },
    { name: "Power Systems & Battery Storage", value: Math.min(100, 30 + currentLevel * 11) },
  ];

  const badges = [
    {
      id: "b1",
      title: "Ohm's Pioneer",
      desc: "Mastered V = I × R and series resistor sizing",
      unlocked: true,
      icon: Zap,
    },
    {
      id: "b2",
      title: "Thermal Architect",
      desc: "Successfully conducted long-term thermal dissipation testing",
      unlocked: currentLevel >= 2,
      icon: Flame,
    },
    {
      id: "b3",
      title: "Silicon Guardian",
      desc: "Protected microcontrollers against reverse voltage and flyback spikes",
      unlocked: currentLevel >= 3,
      icon: Shield,
    },
    {
      id: "b4",
      title: "10-Year Survivor",
      desc: "Built a hardware system that survived 10 years of endurance testing",
      unlocked: completedChallengesCount >= 3,
      icon: Award,
    },
  ];

  return (
    <div
      id="user-profile-modal"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl max-w-2xl w-full h-[580px] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="h-14 border-b border-blue-900/60 px-6 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-wide">
                Hardware Engineer Profile
              </h2>
              <div className="text-[11px] text-slate-400">
                Skills progress, engineering rating & certified achievements
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-blue-950/60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Level Card */}
          <div className="bg-[#06080D] border border-blue-900/60 rounded-xl p-4 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-yellow-400 flex flex-col items-center justify-center text-black font-black shadow-lg">
              <span className="text-[10px] tracking-wider text-black font-bold uppercase">
                LEVEL
              </span>
              <span className="text-2xl -mt-1 font-black text-black">{currentLevel}</span>
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Senior Hardware Systems Apprentice</span>
                <span className="font-mono text-yellow-400">{userXp} Total XP</span>
              </div>

              <div className="w-full bg-[#111827] border border-blue-900/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${levelProgressPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Next Rank: Level {currentLevel + 1}</span>
                <span>{250 - currentLevelXp} XP Needed</span>
              </div>
            </div>
          </div>

          {/* Engineering Skill Ratings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Competency & Domain Mastery</span>
            </h4>

            <div className="space-y-2.5">
              {skills.map((s, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{s.name}</span>
                    <span className="font-mono text-blue-400 font-bold">{s.value}%</span>
                  </div>
                  <div className="w-full bg-[#06080D] h-2 rounded-full overflow-hidden border border-blue-900/60">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earned Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Engineering Honors & Badges</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => {
                const IconComponent = b.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      b.unlocked
                        ? "bg-[#06080D] border-blue-800/60 text-slate-200"
                        : "bg-[#06080D]/50 border-blue-950/60 text-slate-600 opacity-60"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg border ${
                        b.unlocked
                          ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/40"
                          : "bg-[#111827] text-slate-600 border-blue-950/60"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{b.title}</span>
                        {b.unlocked && (
                          <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {b.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
