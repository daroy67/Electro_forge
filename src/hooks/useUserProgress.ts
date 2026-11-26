import { useState, useCallback, useEffect, useRef } from "react";
import { UserProfile } from "../types";
import { centralAudio } from "./useAudioSystem";

export type ExperienceProfile = "casual" | "advanced";

const STORAGE_KEY_PROFILE = "electroforge_user_profile_v2";
const STORAGE_KEY_UX_MODE = "electroforge_ux_profile";
const STORAGE_KEY_CREDITS = "electroforge_user_credits";

const INITIAL_PROFILE: UserProfile = {
  name: "Инженер-разработчик",
  title: "Junior Hardware Engineer",
  level: 1,
  xp: 120,
  xpForNextLevel: 300,
  completedChallenges: [],
  completedGameChallenges: [],
  earnedBadges: [
    {
      id: "badge-first-circuit",
      name: "Первая цепь",
      icon: "⚡",
      unlockedAt: new Date().toISOString(),
    },
  ],
  skills: {
    electronics: 45,
    programming: 60,
    physics: 50,
    cad: 30,
    systemDesign: 40,
  },
  savedProjects: [],
  rank: "Junior Hardware Engineer",
  completedTasks: 3,
  reliabilityScore: 92,
  completedRepairScenarios: [],
};

export interface XpGainNotification {
  id: string;
  amount: number;
  reason?: string;
  credits?: number;
  badgeName?: string;
}

export function useUserProgress() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PROFILE;
  });

  const [experienceMode, setExperienceModeState] = useState<ExperienceProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UX_MODE);
      if (saved === "casual" || saved === "advanced") return saved;
    } catch {}
    return "casual"; // Default friendly profile for lower cognitive load
  });

  const [hasSelectedExperienceMode, setHasSelectedExperienceMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_UX_MODE) !== null;
    } catch {
      return false;
    }
  });

  const [credits, setCredits] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CREDITS);
      if (saved) return Number(saved);
    } catch {}
    return 250; // Starter credits
  });

  const [floatingToasts, setFloatingToasts] = useState<XpGainNotification[]>([]);
  const prevLevelRef = useRef<number>(userProfile.level);

  useEffect(() => {
    if (userProfile.level > prevLevelRef.current) {
      centralAudio.playTriumphFanfare();
    }
    prevLevelRef.current = userProfile.level;
  }, [userProfile.level]);

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  // Persist credits
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CREDITS, String(credits));
    } catch {}
  }, [credits]);

  const setExperienceMode = useCallback((mode: ExperienceProfile) => {
    setExperienceModeState(mode);
    setHasSelectedExperienceMode(true);
    try {
      localStorage.setItem(STORAGE_KEY_UX_MODE, mode);
    } catch {}
  }, []);

  const addXp = useCallback(
    (amount: number, reason?: string, earnedCredits?: number, badgeToUnlock?: { id: string; name: string; icon: string }) => {
      centralAudio.playXpGain();

      const toastId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      setFloatingToasts((prev) => [
        ...prev,
        {
          id: toastId,
          amount,
          reason,
          credits: earnedCredits,
          badgeName: badgeToUnlock?.name,
        },
      ]);

      if (earnedCredits && earnedCredits > 0) {
        setCredits((c) => c + earnedCredits);
      }

      setUserProfile((prev) => {
        let newXp = prev.xp + amount;
        let newLevel = prev.level;
        let nextTarget = prev.xpForNextLevel;
        let rank = prev.rank || "Junior Hardware Engineer";

        while (newXp >= nextTarget) {
          newXp -= nextTarget;
          newLevel += 1;
          nextTarget = Math.round(nextTarget * 1.45);

          if (newLevel >= 10) rank = "Chief Hardware Architect";
          else if (newLevel >= 6) rank = "Senior Electronics Engineer";
          else if (newLevel >= 3) rank = "Middle Hardware Specialist";
        }

        const newBadges = [...prev.earnedBadges];
        if (badgeToUnlock && !newBadges.some((b) => b.id === badgeToUnlock.id)) {
          newBadges.push({
            ...badgeToUnlock,
            unlockedAt: new Date().toISOString(),
          });
        }

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          xpForNextLevel: nextTarget,
          rank,
          earnedBadges: newBadges,
          completedTasks: (prev.completedTasks || 0) + 1,
        };
      });

      // Auto dismiss toast after 3.2s
      setTimeout(() => {
        setFloatingToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 3200);
    },
    []
  );

  const unlockBadge = useCallback((badge: { id: string; name: string; icon: string }) => {
    setUserProfile((prev) => {
      if (prev.earnedBadges.some((b) => b.id === badge.id)) return prev;
      centralAudio.playTriumphFanfare();
      return {
        ...prev,
        earnedBadges: [
          ...prev.earnedBadges,
          { ...badge, unlockedAt: new Date().toISOString() },
        ],
      };
    });
  }, []);

  const recordRepairCompleted = useCallback(
    (scenarioId: string, xpReward: number = 180, creditsReward: number = 75) => {
      setUserProfile((prev) => ({
        ...prev,
        completedRepairScenarios: Array.from(
          new Set([...(prev.completedRepairScenarios || []), scenarioId])
        ),
      }));
      addXp(xpReward, "Заказ успешно выполнен!", creditsReward, {
        id: "badge-quick-repair-master",
        name: "Мастер быстрого ремонта",
        icon: "🔧",
      });
    },
    [addXp]
  );

  const dismissToast = useCallback((id: string) => {
    setFloatingToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    userProfile,
    setUserProfile,
    experienceMode,
    setExperienceMode,
    isCasual: experienceMode === "casual",
    isAdvanced: experienceMode === "advanced",
    hasSelectedExperienceMode,
    credits,
    addXp,
    unlockBadge,
    recordRepairCompleted,
    floatingToasts,
    dismissToast,
  };
}
