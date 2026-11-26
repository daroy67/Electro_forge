import React from "react";
import {
  FolderArchive,
  Save,
  Trash2,
  Play,
  X,
  FileCode,
  Download,
  Upload,
} from "lucide-react";
import { PlacedComponent, Wire, UserPlan } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  wires: Wire[];
  onLoadProject: (components: PlacedComponent[], wires: Wire[]) => void;
  userPlan?: UserPlan;
  onProFeatureClick?: (title: string, desc: string) => void;
}

export const ProjectsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  wires,
  onLoadProject,
  userPlan = "free",
  onProFeatureClick,
}) => {
  if (!isOpen) return null;

  const handleExportJson = () => {
    if (userPlan === "free") {
      onProFeatureClick?.(
        "Экспорт схем и устройств",
        "Экспорт файлов схем и устройств в формате JSON доступен в тарифе PRO. В бесплатной версии проектирование и моделирование сохраняются локально."
      );
      return;
    }

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify({ version: "2.0", components, wires }, null, 2)
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `electroforge-circuit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.components && parsed.wires) {
            onLoadProject(parsed.components, parsed.wires);
            onClose();
          }
        } catch (err) {
          console.error("Failed to parse project file", err);
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B101B] border border-blue-800/60 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-blue-900/60 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest">
                ПРОЕКТЫ И СОХРАНЕНИЕ
              </span>
              <h2 className="text-xl font-bold text-white">СОХРАНЁННЫЕ СХЕМЫ</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-400 hover:text-white border border-blue-900/60 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#06080D] border border-blue-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-white">Текущая схема на верстаке</div>
              <div className="text-slate-400 mt-0.5">
                {components.length} компонентов, {wires.length} проводов
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                userPlan === "free"
                  ? "bg-yellow-400/15 text-yellow-300 hover:bg-yellow-400 hover:text-black border border-yellow-400/40"
                  : "bg-yellow-400 hover:bg-yellow-300 text-black"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Экспорт JSON</span>
              {userPlan === "free" && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-400 text-black ml-1">
                  PRO
                </span>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#06080D] border border-blue-900/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-white">Импорт схемы из файла</div>
              <div className="text-slate-400 mt-0.5">Загрузите ранее сохраненный .json файл</div>
            </div>
            <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer border border-blue-500">
              <Upload className="w-4 h-4" />
              <span>Выбрать файл</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-blue-900/60 bg-[#06080D] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111827] hover:bg-blue-950 border border-blue-900/60 transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
