import type { PlacedComponent, Wire } from "../types";

function isCanvasVisible(el: HTMLElement | null): el is HTMLCanvasElement {
  if (!el || !el.isConnected) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 40 && rect.height > 40;
}

function downscaleCanvasToJpeg(source: HTMLCanvasElement, maxWidth = 1024, quality = 0.78): string | null {
  try {
    if (source.width <= 0 || source.height <= 0) return null;
    const scale = source.width > maxWidth ? maxWidth / source.width : 1;
    const outW = Math.max(1, Math.round(source.width * scale));
    const outH = Math.max(1, Math.round(source.height * scale));

    const off = document.createElement("canvas");
    off.width = outW;
    off.height = outH;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#06080d";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(source, 0, 0, outW, outH);
    return off.toDataURL("image/jpeg", quality);
  } catch {
    return null;
  }
}

export interface CaptureContext {
  components?: PlacedComponent[];
  wires?: Wire[];
  isSimulating?: boolean;
}

/**
 * Captures what is currently visible on the user's ElectroForge workspace
 * (3D Sculptor Studio, 3D Engineering Scene, or 2D Schematic Viewport) as a compact JPEG data URL.
 */
export function captureActiveWorkspaceImage(ctx?: CaptureContext): string | null {
  try {
    // 1. Prefer 3D Sculptor WebGL canvas if open and visible
    const sculptHook = (window as any).__electroforgeRenderSculpt as (() => HTMLCanvasElement | null) | undefined;
    if (sculptHook) {
      const sculptCanvas = sculptHook();
      if (isCanvasVisible(sculptCanvas)) {
        const img = downscaleCanvasToJpeg(sculptCanvas, 1024, 0.8);
        if (img) return img;
      }
    }

    // 2. Main 3D Engineering Scene WebGL canvas (synchronous render before toDataURL)
    const sceneHook = (window as any).__electroforgeRenderScene as (() => HTMLCanvasElement | null) | undefined;
    if (sceneHook) {
      const sceneCanvas = sceneHook();
      if (isCanvasVisible(sceneCanvas)) {
        const img = downscaleCanvasToJpeg(sceneCanvas, 1024, 0.78);
        if (img) return img;
      }
    }

    // 3. 2D Schematic Canvas schematic diagram synthesis
    const viewport2d = document.getElementById("schematic-2d-viewport");
    if (viewport2d && viewport2d.getBoundingClientRect().width > 80) {
      const rect = viewport2d.getBoundingClientRect();
      const outW = Math.min(1024, Math.max(640, Math.round(rect.width)));
      const outH = Math.min(720, Math.max(420, Math.round(rect.height)));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const g = canvas.getContext("2d");
      if (g) {
        g.fillStyle = "#08101e";
        g.fillRect(0, 0, outW, outH);

        // Subtle grid
        g.strokeStyle = "rgba(56, 189, 248, 0.14)";
        g.lineWidth = 1;
        for (let x = 0; x < outW; x += 32) {
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, outH);
          g.stroke();
        }
        for (let y = 0; y < outH; y += 32) {
          g.beginPath();
          g.moveTo(0, y);
          g.lineTo(outW, y);
          g.stroke();
        }

        const comps = ctx?.components || [];
        const wires = ctx?.wires || [];

        // Map component world positions into canvas coordinates
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const c of comps) {
          minX = Math.min(minX, c.position.x);
          maxX = Math.max(maxX, c.position.x);
          minZ = Math.min(minZ, c.position.z);
          maxZ = Math.max(maxZ, c.position.z);
        }
        const spanX = Math.max(6, maxX - minX + 4);
        const spanZ = Math.max(4, maxZ - minZ + 3);
        const cxMid = Number.isFinite(minX) ? (minX + maxX) / 2 : 0;
        const czMid = Number.isFinite(minZ) ? (minZ + maxZ) / 2 : 0;
        const pxScale = Math.min((outW - 140) / spanX, (outH - 120) / spanZ);

        const toPx = (wx: number, wz: number) => ({
          x: outW / 2 + (wx - cxMid) * pxScale,
          y: outH / 2 + (wz - czMid) * pxScale,
        });

        // Draw wires
        for (const w of wires) {
          const a = comps.find((c) => c.id === w.fromComponentId);
          const b = comps.find((c) => c.id === w.toComponentId);
          if (!a || !b) continue;
          const pa = toPx(a.position.x, a.position.z);
          const pb = toPx(b.position.x, b.position.z);
          g.strokeStyle = w.color || "#38bdf8";
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(pa.x, pa.y);
          g.quadraticCurveTo((pa.x + pb.x) / 2, (pa.y + pb.y) / 2 + 28, pb.x, pb.y);
          g.stroke();
        }

        // Draw components with state indicators
        for (const c of comps) {
          const p = toPx(c.position.x, c.position.z);
          const isLed = c.type.startsWith("led");
          const isBlown = Boolean(c.state?.isBlown);
          const rawActive = c.state?.activeValue;
          const activeVal = typeof rawActive === "number" ? rawActive : rawActive ? 1 : 0;

          if (isLed && !isBlown && activeVal > 0.04) {
            const rad = 36 + activeVal * 26;
            const grad = g.createRadialGradient(p.x, p.y, 4, p.x, p.y, rad);
            grad.addColorStop(0, "rgba(255, 240, 180, 0.95)");
            grad.addColorStop(0.4, "rgba(239, 68, 68, 0.7)");
            grad.addColorStop(1, "rgba(239, 68, 68, 0)");
            g.fillStyle = grad;
            g.beginPath();
            g.arc(p.x, p.y, rad, 0, Math.PI * 2);
            g.fill();
          }

          g.fillStyle = isBlown ? "#450a0a" : "#111827";
          g.strokeStyle = isBlown ? "#ef4444" : activeVal > 0.04 ? "#facc15" : "#3b82f6";
          g.lineWidth = 2;
          g.fillRect(p.x - 42, p.y - 20, 84, 40);
          g.strokeRect(p.x - 42, p.y - 20, 84, 40);

          g.fillStyle = "#f8fafc";
          g.font = "bold 11px monospace";
          g.textAlign = "center";
          g.fillText((c.name || c.type).slice(0, 14), p.x, p.y - 2);
          g.fillStyle = isBlown ? "#fca5a5" : activeVal > 0.04 ? "#fde047" : "#94a3b8";
          g.font = "10px monospace";
          const status = isBlown
            ? "BLOWN"
            : isLed
            ? activeVal > 0.04
              ? `ON ${Math.round(activeVal * 100)}%`
              : "OFF"
            : `${(c.state?.currentMa || 0).toFixed(0)}mA`;
          g.fillText(status, p.x, p.y + 13);
        }

        // Simulation badge
        g.fillStyle = ctx?.isSimulating ? "#10b981" : "#64748b";
        g.font = "bold 12px monospace";
        g.textAlign = "left";
        g.fillText(
          `2D VIEW | SIM: ${ctx?.isSimulating ? "RUNNING" : "STOPPED"} | PARTS: ${comps.length}`,
          14,
          22
        );

        return canvas.toDataURL("image/jpeg", 0.78);
      }
    }

    // 4. Fallback: any visible canvas (e.g. CAD tab Three.js canvas)
    const canvases = Array.from(document.querySelectorAll("canvas"));
    for (const c of canvases) {
      if (isCanvasVisible(c) && c.width > 120 && c.height > 120) {
        const img = downscaleCanvasToJpeg(c, 1024, 0.78);
        if (img) return img;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getOrCreateClientId(): string {
  const key = "electroforge_client_id";
  try {
    const existing = localStorage.getItem(key);
    if (existing && existing.length >= 6) return existing;
    const created = `ef-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, created);
    return created;
  } catch {
    return "ef-browser-guest";
  }
}
