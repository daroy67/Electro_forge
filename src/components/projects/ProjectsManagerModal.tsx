import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Save,
  Trash2,
  Copy,
  Download,
  Upload,
  Edit2,
  Calendar,
  Layers,
  Check,
} from "lucide-react";
import { ProjectSaveData, PlacedComponent, Wire } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentProjectData: {
    deviceId: string;
    components: PlacedComponent[];
    wires: Wire[];
    code: string;
    codePlatform: "arduino" | "esp32";
  };
  onLoadProject: (project: ProjectSaveData) => void;
  onNewProject: () => void;
}

const STORAGE_KEY = "electroforge_saved_projects";

export const ProjectsManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentProjectData,
  onLoadProject,
  onNewProject,
}) => {
  const [projects, setProjects] = useState<ProjectSaveData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        // Initial sample saved project
        const sample: ProjectSaveData = {
          id: "proj-sample-1",
          name: "Smart Hydration Node",
          deviceId: "device-iothome",
          description: "IoT soil monitor with relay solenoid valve",
          updatedAt: new Date().toLocaleDateString(),
          components: currentProjectData.components,
          wires: currentProjectData.wires,
          code: currentProjectData.code,
          codePlatform: currentProjectData.codePlatform,
          reliabilityScore: 92,
        };
        setProjects([sample]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([sample]));
      }
    } catch (e) {
      console.error("Failed to load projects from storage", e);
    }
  }, []);

  const persistProjects = (newProjects: ProjectSaveData[]) => {
    setProjects(newProjects);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    } catch (e) {
      console.error("Failed to save projects to storage", e);
    }
  };

  const handleSaveCurrent = () => {
    const newProj: ProjectSaveData = {
      id: `proj-${Date.now()}`,
      name: `Project ${projects.length + 1} (${currentProjectData.deviceId})`,
      deviceId: currentProjectData.deviceId,
      description: `Saved bench configuration with ${currentProjectData.components.length} components`,
      updatedAt: new Date().toLocaleDateString(),
      components: currentProjectData.components,
      wires: currentProjectData.wires,
      code: currentProjectData.code,
      codePlatform: currentProjectData.codePlatform,
      reliabilityScore: 90,
    };

    const updated = [newProj, ...projects];
    persistProjects(updated);
    setSaveSuccessNotice("Current bench saved successfully!");
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleDelete = (id: string) => {
    persistProjects(projects.filter((p) => p.id !== id));
  };

  const handleDuplicate = (proj: ProjectSaveData) => {
    const dup: ProjectSaveData = {
      ...proj,
      id: `proj-${Date.now()}`,
      name: `${proj.name} (Copy)`,
      updatedAt: new Date().toLocaleDateString(),
    };
    persistProjects([dup, ...projects]);
  };

  const handleStartRename = (proj: ProjectSaveData) => {
    setEditingId(proj.id);
    setEditName(proj.name);
  };

  const handleSaveRename = (id: string) => {
    if (!editName.trim()) return;
    persistProjects(
      projects.map((p) => (p.id === id ? { ...p, name: editName.trim() } : p))
    );
    setEditingId(null);
  };

  const handleExport = (proj: ProjectSaveData) => {
    const jsonStr = JSON.stringify(proj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${proj.name.toLowerCase().replace(/\s+/g, "_")}.electroforge.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.components && parsed.wires) {
          const imported: ProjectSaveData = {
            ...parsed,
            id: `proj-import-${Date.now()}`,
            name: `${parsed.name || "Imported Project"}`,
            updatedAt: new Date().toLocaleDateString(),
          };
          persistProjects([imported, ...projects]);
        }
      } catch (err) {
        setSaveSuccessNotice("Invalid project file format. Please upload a valid ElectroForge JSON file.");
        setTimeout(() => setSaveSuccessNotice(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div
      id="projects-manager-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl max-w-3xl w-full h-[580px] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="h-14 border-b border-blue-900/60 px-6 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-wide">
                Project Storage & Vault
              </h2>
              <div className="text-[11px] text-slate-400">
                Save, load, duplicate, and export full hardware & firmware schematics
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-blue-950 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Toolbar Actions */}
        <div className="p-4 border-b border-blue-900/60 bg-[#06080D] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveCurrent}
              className="py-2 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Current Bench</span>
            </button>

            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 text-white font-bold flex items-center gap-1.5 border border-blue-900/60 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>New Empty Project</span>
            </button>
          </div>

          <label className="py-2 px-3 rounded-xl bg-[#111827] hover:bg-blue-950 text-slate-300 font-bold flex items-center gap-1.5 border border-blue-900/60 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {saveSuccessNotice && (
          <div className="bg-blue-950/60 text-blue-200 text-xs px-6 py-2 border-b border-blue-700/60 flex items-center gap-2">
            <Check className="w-4 h-4 text-yellow-400" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {projects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <FolderOpen className="w-10 h-10 opacity-30" />
              <p className="text-xs">No saved projects yet. Click "Save Current Bench" above!</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-[#06080D] border border-blue-900/60 rounded-xl p-4 flex items-center justify-between hover:border-blue-600/60 transition-colors"
              >
                <div className="space-y-1">
                  {editingId === proj.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-[#111827] border border-blue-500 rounded px-2 py-1 text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(proj.id)}
                        className="p-1 text-yellow-400 hover:text-yellow-300 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white">{proj.name}</h4>
                      <button
                        onClick={() => handleStartRename(proj)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-blue-400" />
                      {proj.components.length} components, {proj.wires.length} wires
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {proj.updatedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      onLoadProject(proj);
                      onClose();
                    }}
                    className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
                  >
                    Load Project
                  </button>

                  <button
                    onClick={() => handleDuplicate(proj)}
                    title="Duplicate"
                    className="p-2 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 hover:text-white border border-blue-900/60 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleExport(proj)}
                    title="Export to JSON"
                    className="p-2 rounded-lg bg-[#111827] hover:bg-blue-950 text-slate-300 hover:text-white border border-blue-900/60 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(proj.id)}
                    title="Delete"
                    className="p-2 rounded-lg bg-[#111827] hover:bg-yellow-400/15 text-slate-300 hover:text-yellow-300 border border-blue-900/60 hover:border-yellow-400/50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
