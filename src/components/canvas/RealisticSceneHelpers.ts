import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Shared caches to prevent GC thrashing and redundant GPU texture uploads
let cachedESDMatTexture: THREE.CanvasTexture | null = null;
let cachedStudioEnvMap: THREE.Texture | null = null;
let cachedContactTexture: THREE.CanvasTexture | null = null;
let cachedContactGeo: THREE.PlaneGeometry | null = null;

/**
 * Authentic Industrial ESD Laboratory Workbench Mat Texture.
 * Modeled after real ANSI/ESD S20.20 certified dual-layer dissipative rubber mats (e.g. Desco/Hakko/3M).
 * Cached in memory so it is generated only once with optimal 1024x1024 resolution.
 */
export function createESDMatTexture(): THREE.CanvasTexture {
  if (cachedESDMatTexture) {
    return cachedESDMatTexture;
  }

  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    const fallbackCanvas = document.createElement("canvas");
    fallbackCanvas.width = 16;
    fallbackCanvas.height = 16;
    cachedESDMatTexture = new THREE.CanvasTexture(fallbackCanvas);
    return cachedESDMatTexture;
  }

  // 1. Uniform Authentic ESD Dissipative Rubber Color (Industry standard matte Royal Blue)
  ctx.fillStyle = "#1b3358";
  ctx.fillRect(0, 0, size, size);

  // 2. Realistic Micro-texture: fine non-glare dissipative rubber grain (fast Uint32Array noise)
  const imgData = ctx.getImageData(0, 0, size, size);
  const buf32 = new Uint32Array(imgData.data.buffer);
  const len = buf32.length;
  for (let i = 0; i < len; i += 2) {
    const n = ((Math.random() * 8) | 0) - 4;
    const pixel = buf32[i];
    let r = (pixel & 0xff) + n;
    let g = ((pixel >> 8) & 0xff) + n;
    let b = ((pixel >> 16) & 0xff) + n;
    r = r < 0 ? 0 : r > 255 ? 255 : r;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    b = b < 0 ? 0 : b > 255 ? 255 : b;
    buf32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Precision Engineering Grid
  const margin = 40;
  const workWidth = size - margin * 2;
  const step = workWidth / 50; // 50 units (corresponding to 50cm bench)

  // Minor Grid lines (every 10mm / 1cm) - crisp, subtle light gray
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const p = margin + i * step;
    ctx.moveTo(p, margin);
    ctx.lineTo(p, size - margin);
    ctx.moveTo(margin, p);
    ctx.lineTo(size - margin, p);
  }
  ctx.stroke();

  // Major Grid lines (every 50mm / 5cm) - clear, crisp white
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 50; i += 5) {
    const p = margin + i * step;
    ctx.moveTo(p, margin);
    ctx.lineTo(p, size - margin);
    ctx.moveTo(margin, p);
    ctx.lineTo(size - margin, p);
  }
  ctx.stroke();

  // Precision Crosshairs (+) at every 5cm intersection
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.5;
  const arm = 3.5;
  ctx.beginPath();
  for (let ix = 0; ix <= 50; ix += 5) {
    for (let iy = 0; iy <= 50; iy += 5) {
      const cx = margin + ix * step;
      const cy = margin + iy * step;
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
    }
  }
  ctx.stroke();

  // 4. Center Workbench Datum Origin Crosshair
  const centerX = size / 2;
  const centerY = size / 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 24, centerY);
  ctx.lineTo(centerX + 24, centerY);
  ctx.moveTo(centerX, centerY - 24);
  ctx.lineTo(centerX, centerY + 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
  ctx.stroke();

  // 5. Engineering Centimeter/Millimeter Ruler along all 4 Borders
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "bold 10px 'SF Mono', Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 1.0;
  for (let i = 0; i <= 50; i++) {
    const x = margin + i * step;
    const isMajor = i % 5 === 0;
    const tickLen = isMajor ? 8 : 4;

    // Top & Bottom border ticks
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, margin - tickLen);
    ctx.moveTo(x, size - margin);
    ctx.lineTo(x, size - margin + tickLen);
    ctx.stroke();

    if (isMajor) {
      const cmVal = (i - 25).toString();
      ctx.fillText(cmVal, x, margin - 13);
      ctx.fillText(cmVal, x, size - margin + 13);
    }
  }

  for (let i = 0; i <= 50; i++) {
    const y = margin + i * step;
    const isMajor = i % 5 === 0;
    const tickLen = isMajor ? 8 : 4;

    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(margin - tickLen, y);
    ctx.moveTo(size - margin, y);
    ctx.lineTo(size - margin + tickLen, y);
    ctx.stroke();

    if (isMajor) {
      const cmVal = (25 - i).toString();
      ctx.fillText(cmVal, margin - 14, y);
      ctx.fillText(cmVal, size - margin + 14, y);
    }
  }

  // 6. Silk-Screened Technical Badges and ESD Warning Logo (Bottom Right)
  const badgeX = size - margin - 240;
  const badgeY = size - margin - 55;

  ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, 225, 45, 4);
  ctx.fill();
  ctx.stroke();

  // ESD Warning Triangle Symbol
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.moveTo(badgeX + 20, badgeY + 10);
  ctx.lineTo(badgeX + 36, badgeY + 36);
  ctx.lineTo(badgeX + 4, badgeY + 36);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#020617";
  ctx.beginPath();
  ctx.moveTo(badgeX + 22, badgeY + 16);
  ctx.lineTo(badgeX + 16, badgeY + 26);
  ctx.lineTo(badgeX + 21, badgeY + 26);
  ctx.lineTo(badgeX + 18, badgeY + 33);
  ctx.lineTo(badgeX + 26, badgeY + 23);
  ctx.lineTo(badgeX + 22, badgeY + 23);
  ctx.closePath();
  ctx.fill();

  // Badge Text
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 9px 'SF Mono', Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillText("ESD PROTECTED WORKBENCH", badgeX + 44, badgeY + 18);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "8px 'SF Mono', Menlo, monospace";
  ctx.fillText("DISSIPATIVE RUBBER • Rg: 10⁶ - 10⁹ Ω • ANSI/ESD S20.20", badgeX + 44, badgeY + 30);

  // 7. Silk-Screened Specification Stamp (Top Left)
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "bold 9px 'SF Mono', Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillText("LABORATORY CAD/SPICE WORKSTATION", margin + 12, margin + 22);
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "7.5px 'SF Mono', Menlo, monospace";
  ctx.fillText("SCALE: 1 UNIT = 1 CM | DISSIPATIVE WORK SURFACE", margin + 12, margin + 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  cachedESDMatTexture = texture;
  return texture;
}

/**
 * Generates an HDR-style Studio Environment Map using PMREMGenerator.
 * Cached per session to avoid re-generating cubemaps on every render.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  if (cachedStudioEnvMap) {
    return cachedStudioEnvMap;
  }

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const roomEnv = new RoomEnvironment();
  const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  roomEnv.dispose();
  pmremGenerator.dispose();
  cachedStudioEnvMap = envMap;

  return envMap;
}

/**
 * Creates an articulated 3D Laboratory Gooseneck Inspection Lamp.
 * Sits at the corner of the workbench and casts an authentic soft warm/cool spotlight
 * onto the active electronics area, complete with frosted lens and metal reflector.
 */
export function createInspectionLampMesh(options?: {
  lampOn?: boolean;
  lightColor?: number;
}): { group: THREE.Group; spotLight: THREE.SpotLight; toggleLamp: (on: boolean) => void } {
  const group = new THREE.Group();
  group.name = "laboratory-inspection-lamp";
  group.position.set(-23.5, 0, -16.5);

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.85,
    roughness: 0.25,
  });
  const chromeMetal = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.12,
  });

  // Heavy circular weighted base
  const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.6, 28);
  const base = new THREE.Mesh(baseGeo, darkMetal);
  base.position.y = 0.3;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Beveled rotary power knob on base
  const knobGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
  const knobMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.2,
  });
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.position.set(1.2, 0.65, 0.8);
  group.add(knob);

  // Vertical lower pivot post
  const postGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.5, 16);
  const post = new THREE.Mesh(postGeo, darkMetal);
  post.position.set(0, 1.6, 0);
  group.add(post);

  // Lower Articulated Arm (twin chrome rods)
  const armRodGeo = new THREE.CylinderGeometry(0.12, 0.12, 14, 12);
  const rod1 = new THREE.Mesh(armRodGeo, chromeMetal);
  rod1.position.set(-0.35, 8.5, 3.2);
  rod1.rotation.x = Math.PI / 7;
  rod1.rotation.y = Math.PI / 12;

  const rod2 = new THREE.Mesh(armRodGeo, chromeMetal);
  rod2.position.set(0.35, 8.5, 3.2);
  rod2.rotation.x = Math.PI / 7;
  rod2.rotation.y = Math.PI / 12;
  group.add(rod1, rod2);

  // Articulated Elbow joint
  const elbowGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const elbow = new THREE.Mesh(elbowGeo, darkMetal);
  elbow.position.set(2.4, 14.5, 6.2);
  group.add(elbow);

  // Upper Cantilever Arm angled over the desk
  const upperRodGeo = new THREE.CylinderGeometry(0.12, 0.12, 16, 12);
  const upperRod = new THREE.Mesh(upperRodGeo, chromeMetal);
  upperRod.position.set(7.5, 17.5, 8.5);
  upperRod.rotation.z = -Math.PI / 3;
  upperRod.rotation.x = -Math.PI / 10;
  group.add(upperRod);

  // Lamp Head Swivel Socket
  const headPos = new THREE.Vector3(14.5, 15.5, 8.5);

  // Lamp Cone Hood (Conical Reflector)
  const coneGeo = new THREE.ConeGeometry(2.5, 3.2, 24, 1, true);
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.8,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.copy(headPos);
  cone.rotation.z = Math.PI * 0.8;
  cone.rotation.x = -Math.PI * 0.25;
  group.add(cone);

  // Frosted LED diffuser bulb
  const bulbGeo = new THREE.SphereGeometry(0.9, 20, 20);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfffaed,
    emissive: 0xfff0cc,
    emissiveIntensity: options?.lampOn !== false ? 2.5 : 0.0,
    roughness: 0.2,
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.copy(headPos).add(new THREE.Vector3(0.6, -0.8, -0.6));
  group.add(bulb);

  // Real Three.js SpotLight projecting downward onto the bench
  const spotLight = new THREE.SpotLight(
    options?.lightColor || 0xfffaed,
    options?.lampOn !== false ? 2.8 : 0.0,
    45,
    Math.PI / 3.2,
    0.65,
    1.2
  );
  spotLight.position.copy(bulb.position);
  spotLight.target.position.set(0, 0, 0);
  group.add(spotLight);
  group.add(spotLight.target);

  const toggleLamp = (on: boolean) => {
    spotLight.intensity = on ? 2.8 : 0.0;
    bulbMat.emissiveIntensity = on ? 2.5 : 0.0;
  };

  return { group, spotLight, toggleLamp };
}

/**
 * Creates a soft Ambient Occlusion Contact Shadow plane.
 * Place under components so they sit firmly on the workbench surface with realistic ground contact.
 * Uses shared 128x128 radial gradient texture and instanced/scaled plane geometry for maximum performance.
 */
export function createContactShadowMesh(width = 4, height = 4, opacity = 0.5): THREE.Mesh {
  if (!cachedContactTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, "rgba(2, 6, 23, 0.75)"); // Dense contact center
      grad.addColorStop(0.35, "rgba(2, 6, 23, 0.4)");
      grad.addColorStop(0.7, "rgba(2, 6, 23, 0.12)");
      grad.addColorStop(1, "rgba(2, 6, 23, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    cachedContactTexture = new THREE.CanvasTexture(canvas);
  }

  if (!cachedContactGeo) {
    cachedContactGeo = new THREE.PlaneGeometry(1, 1);
  }

  const mat = new THREE.MeshBasicMaterial({
    map: cachedContactTexture,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(cachedContactGeo, mat);
  mesh.scale.set(width, height, 1);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02; // Just above the ESD mat surface
  return mesh;
}
