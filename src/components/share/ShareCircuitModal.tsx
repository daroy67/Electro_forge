import React, { useState } from "react";
import { Share2, Copy, Check, Link, Globe, X, Sparkles, Layers } from "lucide-react";
import { PlacedComponent, Wire } from "../../types";
import { centralAudio } from "../../hooks/useAudioSystem";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  components: PlacedComponent[];
  wires: Wire[];
  activeDeviceName: string;
  code?: string;
}

export interface SharedCircuitPayload {
  version: number;
  title: string;
  deviceName: string;
  timestamp: number;
  components: PlacedComponent[];
  wires: Wire[];
  code?: string;
}

export function serializeCircuitToHash(
  components: PlacedComponent[],
  wires: Wire[],
  deviceName: string,
  code?: string
): string {
  const payload: SharedCircuitPayload = {
    version: 1,
    title: `Схема: ${deviceName}`,
    deviceName,
    timestamp: Date.now(),
    components: components.map((c) => ({
      id: c.id,
      type: c.type,
      name: c.name,
      position: c.position,
      rotation: c.rotation,
      params: c.params,
    })),
    wires: wires.map((w) => ({
      id: w.id,
      fromComponentId: w.fromComponentId,
      fromPinId: w.fromPinId,
      toComponentId: w.toComponentId,
      toPinId: w.toPinId,
      color: w.color,
      crossSectionMm2: w.crossSectionMm2,
      conductorMaterial: w.conductorMaterial,
    })),
    code,
  };

  try {
    const jsonStr = JSON.stringify(payload);
    // Safe base64 encoding with UTF-8
    const base64 = btoa(encodeURIComponent(jsonStr));
    return `circuit=${base64}`;
  } catch (err) {
    console.error("Failed to serialize circuit:", err);
    return "";
  }
}

export function deserializeCircuitFromHash(hash: string): SharedCircuitPayload | null {
  try {
    const raw = hash.replace(/^#/, "");
    const match = raw.match(/circuit=([^&]+)/);
    if (!match) return null;
    const base64 = match[1];
    const jsonStr = decodeURIComponent(atob(base64));
    const parsed = JSON.parse(jsonStr) as SharedCircuitPayload;
    if (parsed && Array.isArray(parsed.components) && Array.isArray(parsed.wires)) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to deserialize circuit from hash:", err);
  }
  return null;
}

export const ShareCircuitModal: React.FC<Props> = ({
  isOpen,
  onClose,
  components,
  wires,
  activeDeviceName,
  code,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const hashString = serializeCircuitToHash(components, wires, activeDeviceName, code);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}#${hashString}`
    : `https://electroforge.app#${hashString}`;

  const handleCopy = () => {
    centralAudio.playSwitchClick(true);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0B101B] border border-blue-800/60 rounded-2xl shadow-2xl overflow-hidden p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-yellow-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Поделиться схемой (One-Click Share)
              </h3>
              <p className="text-xs text-slate-400">
                Создайте прямую ссылку на текущее состояние верстака
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-blue-950/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content info */}
        <div className="py-4 space-y-4">
          <div className="p-3.5 bg-[#06080D] rounded-xl border border-blue-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Компонентов: <strong>{components.length}</strong></span>
              <span className="text-slate-600">·</span>
              <span>Проводов: <strong>{wires.length}</strong></span>
            </div>
            <span className="text-yellow-400 font-semibold">{activeDeviceName}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-400" />
              Ссылка на схему:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#06080D] border border-blue-900/60 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500 select-all"
              />
              <button
                onClick={handleCopy}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? "bg-yellow-400 text-black"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Копировать</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <span>
              Любой, кто откроет эту ссылку в браузере, мгновенно увидит вашу схему на 3D-верстаке и сможет продолжить симуляцию или модификацию.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-blue-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-lg bg-[#111827] hover:bg-blue-950/70 border border-blue-900/60 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
