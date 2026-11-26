import React, { useState } from "react";
import {
  FlaskConical,
  Zap,
  Flame,
  Shield,
  Search,
  BookOpen,
  Layers,
  Thermometer,
} from "lucide-react";
import { MATERIALS_DATABASE } from "../../data/materialsDatabase";
import { MaterialCategory, MaterialDefinition } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MaterialsDatabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { tr, localize } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("copper");

  if (!isOpen) return null;

  const materialsList = Object.values(MATERIALS_DATABASE);

  const filteredMaterials = materialsList.filter((mat) => {
    const matchesCat = selectedCategory === "all" || mat.category === selectedCategory;
    const apps = mat.applications || [];
    const matName = localize(mat.name);
    const matchesSearch =
      mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apps.some((app) => app.toLowerCase().includes(searchQuery.toLowerCase()) || localize(app).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const activeMaterial: MaterialDefinition =
    MATERIALS_DATABASE[selectedMaterialId] || materialsList[0];

  const getCategoryBadge = (cat: MaterialCategory) => {
    switch (cat) {
      case "conductor":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-yellow-400/15 text-yellow-300 border border-yellow-400/40">
            {tr("Проводник (Conductor)", "Conductor")}
          </span>
        );
      case "semiconductor":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-600/20 text-blue-300 border border-blue-500/40">
            {tr("Полупроводник (Semiconductor)", "Semiconductor")}
          </span>
        );
      case "insulator":
        return (
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-950/60 text-blue-200 border border-blue-800/60">
            {tr("Диэлектрик (Insulator)", "Insulator")}
          </span>
        );
    }
  };

  return (
    <div
      id="materials-database-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div className="bg-[#0B101B] border border-blue-800/60 rounded-2xl max-w-4xl w-full h-[620px] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="h-14 border-b border-blue-900/60 px-6 flex items-center justify-between bg-[#06080D]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-wide">
                Materials & Physical Constants Database
              </h2>
              <div className="text-[11px] text-slate-400">
                Electrical resistivity, thermal conductivity & breakdown ratings of matter
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

        {/* Filter bar */}
        <div className="p-3 border-b border-blue-900/60 bg-[#06080D] flex items-center justify-between gap-3 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All Matter" },
              { id: "conductor", label: "Conductors" },
              { id: "semiconductor", label: "Semiconductors" },
              { id: "insulator", label: "Insulators" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-yellow-400 border-yellow-300 text-black"
                    : "bg-[#111827] border-blue-900/60 text-slate-300 hover:text-white hover:border-blue-600/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by material or application..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#111827] border border-blue-900/60 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Main Content (Split view) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left List */}
          <div className="w-72 border-r border-blue-900/60 p-3 space-y-1.5 overflow-y-auto bg-[#06080D]">
            {filteredMaterials.map((mat) => {
              const isSelected = mat.id === activeMaterial.id;
              const firstApp = mat.applications?.[0] || mat.description;
              return (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterialId(mat.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-blue-950/70 border-yellow-400 text-white shadow-md"
                      : "bg-[#111827] border-blue-900/50 text-slate-300 hover:text-white hover:border-blue-600/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{mat.name}</span>
                    <span className="text-[10px] font-mono text-blue-400">
                      {mat.category[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {firstApp}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#0B101B] text-xs">
            <div className="flex items-start justify-between border-b border-blue-900/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xl text-white">{activeMaterial.name}</h3>
                  {getCategoryBadge(activeMaterial.category)}
                </div>
                <p className="text-slate-300 mt-2 max-w-xl text-xs leading-relaxed">
                  {activeMaterial.description}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Cost Index:</span>
                <span className="font-mono text-sm font-bold text-yellow-400">
                  {activeMaterial.costRating || "$$"}
                </span>
              </div>
            </div>

            {/* Physical Properties Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Resistivity */}
              <div className="bg-[#06080D] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Resistivity (ρ):</span>
                </div>
                <div className="font-mono text-sm font-bold text-white">
                  {activeMaterial.resistivityOhmM > 1e6
                    ? `> 10¹² Ω·m`
                    : `${activeMaterial.resistivityOhmM.toExponential(2)} Ω·m`}
                </div>
              </div>

              {/* Thermal Conductivity */}
              <div className="bg-[#06080D] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                  <Flame className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Thermal Conductivity (k):</span>
                </div>
                <div className="font-mono text-sm font-bold text-white">
                  {activeMaterial.thermalConductivityWmK} W/(m·K)
                </div>
              </div>

              {/* Melting / Max Operating Temp */}
              <div className="bg-[#06080D] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                  <Thermometer className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Melting / Max Temp:</span>
                </div>
                <div className="font-mono text-sm font-bold text-white">
                  {activeMaterial.meltingPointC
                    ? `${activeMaterial.meltingPointC}°C (Melting Point)`
                    : `${activeMaterial.maxOperatingTempC}°C (Max Continuous)`}
                </div>
              </div>

              {/* Dielectric / Bandgap / Conductivity */}
              <div className="bg-[#06080D] p-3 rounded-xl border border-blue-900/60">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Key Characteristic:</span>
                </div>
                <div className="font-mono text-sm font-bold text-blue-300">
                  {activeMaterial.dielectricStrengthKvMm
                    ? `${activeMaterial.dielectricStrengthKvMm} kV/mm Dielectric`
                    : activeMaterial.bandgapEv
                    ? `${activeMaterial.bandgapEv} eV Bandgap`
                    : `${activeMaterial.conductivityPctIacs || 100}% IACS Conductivity`}
                </div>
              </div>
            </div>

            {/* Industrial Applications */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Primary Electronics Applications:</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(activeMaterial.applications || []).map((app, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#06080D] border border-blue-900/60 text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mathematical Equation & Reference Guide */}
            <div className="bg-blue-950/30 border border-blue-700/50 rounded-xl p-3.5 space-y-1.5">
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Physical Wire Resistance Equation:</span>
              </div>
              <p className="text-yellow-300 font-mono text-[11px]">
                R = ρ · (L / A)
              </p>
              <p className="text-slate-400 text-[11px]">
                Where <strong>ρ</strong> is conductor resistivity, <strong>L</strong> is wire length in meters, and <strong>A</strong> is cross-sectional area in m² (A = gauge · 10⁻⁶). Thicker wires have lower resistance and dissipate less Joule heat ($P = I^2 R$).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
