import React from "react";
import { X, Sparkles } from "lucide-react";
import { BlenderSculptStudio } from "../builder/BlenderSculptStudio";
import { CustomItem } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUseInLab: (item: CustomItem) => void;
  onSaveToToolbox: (item: CustomItem) => void;
}

export const BlenderSculptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUseInLab,
  onSaveToToolbox,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md select-none p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-7xl h-[94vh] bg-[#0B101B] border border-blue-800/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-blue-900/60 bg-[#06080D] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  3D Конструктор и Лепка корпусов (Blender Sculpt Studio)
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
                  СВОБОДНОЕ ТВОРЧЕСТВО
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Лепите произвольную 3D форму как в Blender, выбирайте металлы или пластик, вставляйте чипы и кнопки и сохраняйте для свободной сборки
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111827] hover:bg-blue-950/60 border border-blue-900/60 text-slate-400 hover:text-white transition cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-hidden relative">
          <BlenderSculptStudio
            onClose={onClose}
            onSaveToToolbox={(item) => {
              onSaveToToolbox(item);
            }}
            onUseInLab={(item) => {
              onUseInLab(item);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
