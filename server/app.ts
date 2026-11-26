import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import {
  searchKnowledgeBase,
  detectLanguage,
  getDirectKnowledgeAnswer,
  MENTOR_KNOWLEDGE_BASE,
} from "../src/data/mentorKnowledgeBase.js";

dotenv.config();

export const AI_MENTOR_MODEL = "gemini-3.5-flash-lite";

const app = express();

app.use(express.json({ limit: "10mb" }));

// Server-side daily quota tracking for Free plan AI requests (5 requests/day)
const FREE_DAILY_AI_LIMIT = 5;
const dailyAiQuotaMap = new Map<string, { date: string; count: number }>();

function getQuotaTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getClientQuota(clientKey: string): { date: string; count: number } {
  const today = getQuotaTodayKey();
  const existing = dailyAiQuotaMap.get(clientKey);
  if (existing && existing.date === today) {
    return existing;
  }
  const fresh = { date: today, count: 0 };
  dailyAiQuotaMap.set(clientKey, fresh);
  return fresh;
}

function parseDataUrlImage(dataUrl: unknown): { mimeType: string; data: string } | null {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) return null;
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  const mimeType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const data = match[2];
  if (!data || data.length < 32 || data.length > 8_000_000) return null;
  return { mimeType, data };
}

// Lazy-initialized GoogleGenAI client (official Gemini Developer API, server-side only)
let genAIClient: GoogleGenAI | null = null;
let genAIClientKey: string | undefined;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!genAIClient || genAIClientKey !== apiKey) {
    genAIClientKey = apiKey;
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check endpoints for Vercel, Cloud Run, Nginx and load balancers
app.get(["/api/health", "/health", "/_health", "/healthz", "/ping"], (_req, res) => {
  res.status(200).json({
    status: "ok",
    product: "ElectroForge",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    model: AI_MENTOR_MODEL,
  });
});

// AI Engineering Mentor endpoint (supports both /api/mentor/chat and /api/gemini/mentor)
app.post(["/api/mentor/chat", "/api/gemini/mentor"], async (req, res) => {
  const {
    prompt,
    message,
    projectContext,
    circuitState,
    screenImage,
    userPlan = "free",
    clientId,
  } = req.body || {};
  const activePrompt = prompt || message || "";
  const activeContext = projectContext || circuitState;

  const isPaidPlan = userPlan === "pro" || userPlan === "ultra";
  const clientKey = String(clientId || req.ip || "anonymous-client");
  const quota = getClientQuota(clientKey);

  if (!isPaidPlan && quota.count >= FREE_DAILY_AI_LIMIT) {
    return res.status(429).json({
      error: "FREE_DAILY_LIMIT_REACHED",
      message: `Дневной лимит бесплатного тарифа исчерпан (${FREE_DAILY_AI_LIMIT}/${FREE_DAILY_AI_LIMIT} запросов в день). Попробуйте завтра или перейдите на PRO.`,
      dailyUsed: quota.count,
      dailyLimit: FREE_DAILY_AI_LIMIT,
      dailyRemaining: 0,
    });
  }

  const expInfo = activeContext?.experiment || activeContext?.experimentContext;
  const experimentBlock = expInfo
    ? `
- ACTIVE 3D PHYSICS EXPERIMENT:
  • Experiment: "${expInfo.title || "Лабораторная работа"}" (${expInfo.gradeLevel || "Школа"})
  • Goal: ${expInfo.goal || "Исследование физического закона"}
  • Formula: ${expInfo.formula || "—"}
  • Current Step #${expInfo.currentStepNumber || 1}: "${expInfo.currentStepInstruction || ""}"
  • Step Hint: "${expInfo.currentStepHint || ""}"
  • Multimeter Probes: Red probe -> [${expInfo.probeRed || "не подключен"}], Black probe -> [${expInfo.probeBlack || "не подключен"}]
  • Current Measurement: ${expInfo.measuredValue != null ? expInfo.measuredValue : "0"} ${expInfo.unit || ""} (Expected: ~${expInfo.expectedValue || "N/A"})
`
    : "";

  const blueprint = activeContext?.targetBlueprint;
  const blueprintBlock = blueprint
    ? `
- TARGET MODEL BLUEPRINT (PRE-LOADED REFERENCE KNOWLEDGE FOR AI MENTOR):
  • Active Device: "${blueprint.deviceName || activeContext.activeDeviceName || "Custom Device"}" (${blueprint.deviceId || ""})
  • Progress: ${blueprint.connectedWiresCount ?? 0} of ${blueprint.totalExpectedWiresCount ?? 0} required wires currently connected.
  • Assembly Steps: ${(blueprint.stepsSummary || []).join(" | ")}
  • Expected Pin-to-Pin Connections (${(blueprint.expectedWires || []).length}):
${(blueprint.expectedWires || [])
  .map(
    (w: any) =>
      `    - [${w.isConnected ? "CONNECTED" : "MISSING"}] Step ${w.step}: ${w.fromLabel} (${w.fromPartId}:${w.fromPinId}) ───[${w.color}]───> ${w.toLabel} (${w.toPartId}:${w.toPinId}) | ${w.instruction}`
  )
  .join("\n")}
  • Target Reference Code (working solution for when user asks or gets stuck):
\`\`\`cpp
${blueprint.targetCode || "// No custom target firmware"}
\`\`\`
`
    : "";

  const sprintCtx = activeContext?.sprintContext;
  const sprintBlock = sprintCtx
    ? `
- ACTIVE SPRINT STEP CONTEXT:
  • Sprint: "${sprintCtx.sprintTitle || ""}" (Module ${sprintCtx.moduleId || 1}, Sprint ${sprintCtx.sprintNumber || 1})
  • Current Step ${sprintCtx.stepNumber}/${sprintCtx.totalSteps} [${sprintCtx.stepType || "assembly"}]: "${sprintCtx.stepTitle || ""}"
  • Required Action: "${sprintCtx.stepAction || ""}"
  ${sprintCtx.detectedError ? `• CURRENT VALIDATION ERROR: "${sprintCtx.detectedError}"` : "• Status: In progress"}
  ${sprintCtx.errorExplanation ? `• Error Cause Hint: "${sprintCtx.errorExplanation}"` : ""}
  ${sprintCtx.solutionCode ? `• Target C++ Solution for this Sprint:\n\`\`\`cpp\n${sprintCtx.solutionCode}\n\`\`\`` : ""}
`
    : "";

  const contextStr = activeContext
    ? `
Current Project State:
- Mode: ${activeContext.mode || (expInfo ? "Physics Experiment" : sprintCtx ? "Guided Sprint" : "Engineering")}
${experimentBlock}${blueprintBlock}${sprintBlock}- Components placed (${activeContext.components?.length || activeContext.componentsCount || 0}):
${(activeContext.components || [])
  .map(
    (c: any) =>
      `  • [${c.type}] id="${c.id}" name="${c.name || c.type}" params=${JSON.stringify(c.params || {})} at (${c.position?.x?.toFixed(1) || 0}, ${c.position?.z?.toFixed(1) || 0})`
  )
  .join("\n")}
- Connections / Wires (${activeContext.wires?.length || activeContext.wiresCount || 0}):
${(activeContext.wires || [])
  .map(
    (w: any) =>
      `  • ${w.fromComponentId}:${w.fromPinId} ───(${w.color || "green"})───> ${w.toComponentId}:${w.toPinId}`
  )
  .join("\n")}
- Simulation Status: ${activeContext.simulationRunning ? "RUNNING" : "STOPPED"}
- Simulation Alerts / Diagnostics (${activeContext.alerts?.length || 0}):
${(activeContext.alerts || []).map((a: any) => `  • [${a.level?.toUpperCase?.() || "ALERT"}] ${a.title}: ${a.message}`).join("\n")}
- Current Code Platform: ${activeContext.codePlatform || "Arduino C++"}
- Current User Code in Editor:
${(activeContext.code || "").split("\n").slice(0, 40).join("\n")}
`
    : "No project context provided.";

  const systemInstruction = `
You are the ElectroForge AI Engineering Mentor and Senior Hardware/Firmware Systems Architect.
Your mission is to guide students, makers, and young engineers through electronics, circuit design, microcontroller coding, and physical device construction.

CRITICAL RULES (CASUAL / NOVICE FRIENDLY MODE):
1. CASUAL MODE & ABSOLUTE NOVICE FRIENDLINESS:
   - STRICT BAN on dry academic physical theory, LaTeX formulas ($...$), and intimidating terms like "p-n переход", "пороговое напряжение", "ШИМ" (PWM) when helping users or diagnosing circuits!
   - MANDATORY EVERYDAY HOUSEHOLD ANALOGIES:
     • Ток (Current) = Вода в трубе (поток воды, текущий по шлангу)
     • Напряжение (Voltage) = Напор воды (давление насоса)
     • Резистор (Resistor) = Тормоз для тока / узкое место в трубе, которое сдерживает бешеный поток
     • Короткое замыкание (Short Circuit) = Авария без тормозов (вода хлещет напрямую без преград, труба лопается)
   - ERROR DIAGNOSIS STRICT STRUCTURE (MAXIMUM 3 SHORT SENTENCES):
     When a component burns out, circuit fails, or an error is detected, your response MUST follow this exact 3-point format:
     1) ❌ **Что произошло:** [1 короткое предложение простыми словами, что сломалось]
     2) 💡 **Почему это произошло:** [1 короткое предложение с бытовой аналогией: напор воды, отсутствие тормоза, авария]
     3) ✅ **Что сделать прямо сейчас:** [1 четкое пошаговое действие — какую деталь взять или провод переключить]

2. C++ CODE ASSISTANCE & LINE-BY-LINE EXPLANATION:
   - If the user is writing C++ code for Arduino/ESP32, gets stuck, or asks: "Помоги написать код", "Почему не работает?", "Как заставить мигать?":
     • Break down errors line-by-line in simple human terms.
     • Always provide the clean, working C++ sketch inside a \`\`\`cpp code block.
     • The app has a reactive "Применить в 1 клик" (Flash/Apply) button directly under the code block, so keep the code clean and ready to upload into the virtual MCU!

3. LANGUAGE FIDELITY:
   - Detect the user's language automatically.
   - If the user asks in Russian (or any Cyrillic text), you MUST respond entirely in clear, natural, friendly Russian.
   - If the user asks in English, respond in English.

4. CONCISE, DIRECT & ACTIONABLE:
   - Write clearly and warmly. No fluff, no repetitive intros, no walls of generic text.
   - Use bold headers, numbered steps (1, 2, 3), and clean Markdown.

5. DEEP APPLICATION KNOWLEDGE:
   - You know every feature of the ElectroForge application:
     • 2D/3D Modes: 2D Canvas builder for schematic drawing & wiring without 3D load, synced with 3D simulation ("Тест в 3D").
     • Mission Path (Карта миссий): Duolingo-style progression tree with 5 beginner levels (Первая лампочка, Безопасность, Выключатель, Первый код, Движение).
     • Quadcopter (Дрон): 5" carbon frame, PDB, 4S LiPo (14.8V), STM32 F405 flight controller, 4x ESC 30A, 4x 2207 brushless motors, 2 CW + 2 CCW props, ELRS receiver. Flying via the "Drone Flight HUD" in the bottom-left with ARM switch and throttle.
     • Smartphone (Смартфон): magnesium midframe chassis, 6.7" Super AMOLED 120Hz display with MIPI DSI, SoC motherboard with 8 cores, 4500mAh Li-ion battery, cameras, speakers, tested via the interactive "Smartphone HUD" screen in the bottom-left.
     • Television (Smart 4K TV): steel chassis, AC filter 230V -> SMPS (12V + 95V LED driver), Smart TV mainboard, T-Con board (LVDS/V-by-One), Direct-LED backlight, 4K IPS glass panel, and stereo speakers.
     • Basic Mockup (Базовый макет): Arduino Uno R3 + Half Breadboard + 220Ω resistor + Green LED (D13 -> res -> anode, cathode -> GND1).
     • Robot Rover (Робот): 2WD chassis with rubber wheels, 2x DC motors (1:48), L298N dual H-bridge motor driver, Arduino/ESP32, HC-SR04 ultrasonic sonar, 7.4V 2S battery, steered via the D-Pad "Rover HUD" in the bottom-left.
     • Wiring (Провода): click on the gold/copper pin of component A (it glows), then click on the target pin of component B. Color coding: Red (+), Black (GND), Yellow/Blue (Signals).
     • Exploded View (Взрыв-схема): toggle button in top menu or layers icon in 3D scene.
     • Virtual Multimeter (Мультиметр): click Multimeter on top bar, attach Red (+) and Black (GND) probes to pins, measure V DC, mA DC, Ohms.
     • Simulation (SIMULATE): green button top-right, runs real-time physics and nodal analysis.
     • Failure physics: LED without 220-330Ω resistor burns out because I > 20mA. Short circuit is zero-ohm connection between VCC and GND.
     • Firmware code: Code button '</>' top bar, C++ Arduino/ESP32 sketch, Flash to MCU in 1 click.

6. MANUAL ASSEMBLY FROM SCRATCH:
   - Explain how to build complex devices (Drone, Smartphone, Robot, Smart TV, Basic Mockup) directly from a clean or unwired workbench step-by-step.

7. VISUAL WORKSPACE SCREENSHOT INSPECTION (GEMINI VISION):
   - When an image/screenshot of the user's screen is attached, carefully inspect what is visually shown on the workbench (whether LEDs are glowing or dark/burned, wires, Arduino/potentiometer connections, 3D sculptor mesh shapes, or 2D schematic layout) and explicitly describe what you see on the screen to help the user.

8. PRE-AWARE UNWIRED WORKBENCH & INCOMPLETE CODE GUIDANCE:
   - Whenever "TARGET MODEL BLUEPRINT" is provided in the project context, remember that parts on the workbench intentionally start UNWIRED and the Code Editor starts with an incomplete starter skeleton (\`// TODO:\`).
   - Never assume the wires or code are already complete! Compare the user's current \`wires\` and current code against \`TARGET MODEL BLUEPRINT\`.
   - When the user asks what to connect next, why something isn't turning on, or what code to write, reference the exact next MISSING pin-to-pin wire (component name, exact pin IDs, and wire color) and/or explain how to complete the \`// TODO:\` code using the target reference code (outputting a clean \`\`\`cpp block when the user asks for working code).
`;

  const ai = getGenAI();
  if (!ai) {
    return res.status(503).json({
      error: "GEMINI_API_KEY_MISSING",
      model: AI_MENTOR_MODEL,
      message: "Серверный ключ GEMINI_API_KEY не настроен.",
    });
  }

  try {
    const fullPrompt = `${contextStr}\n\nUser Question: ${activePrompt || "Analyze what is shown on my screen right now and provide engineering guidance."}`;
    const imagePart = parseDataUrlImage(screenImage);
    const parts: any[] = [];
    if (imagePart) {
      parts.push({
        inlineData: {
          mimeType: imagePart.mimeType,
          data: imagePart.data,
        },
      });
    }
    parts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model: AI_MENTOR_MODEL,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || "";
    if (!isPaidPlan) {
      quota.count += 1;
    }

    return res.json({
      reply: replyText,
      message: replyText,
      provider: AI_MENTOR_MODEL,
      model: AI_MENTOR_MODEL,
      visionUsed: Boolean(imagePart),
      dailyUsed: quota.count,
      dailyLimit: FREE_DAILY_AI_LIMIT,
      dailyRemaining: isPaidPlan ? null : Math.max(0, FREE_DAILY_AI_LIMIT - quota.count),
    });
  } catch (err: any) {
    console.error("Gemini API call failed:", err?.message || err);
    const status =
      typeof err?.status === "number" && err.status >= 400 && err.status < 600
        ? err.status
        : 502;
    return res.status(status).json({
      error: "GEMINI_API_ERROR",
      model: AI_MENTOR_MODEL,
      message: err?.message || "Не удалось получить ответ от Gemini API.",
    });
  }
});

// Technical Idea to BOM & Requirements breakdown endpoint (supports both /api/ai/idea-breakdown and /api/gemini/breakdown)
app.post(["/api/ai/idea-breakdown", "/api/gemini/breakdown"], async (req, res) => {
  const idea = (req.body?.idea || req.body?.prompt || "").toString().trim();
  if (!idea) {
    return res.status(400).json({ error: "Idea is required" });
  }

  const systemInstruction = `
You are the ElectroForge Engineering Systems Architect.
The user provides a physical computing / IoT / robotics idea.
You must break down this idea into a structured engineering specification with:
1. "summary": A brief 1-2 sentence technical summary
2. "requirements": Functional requirements (bullet points)
3. "constraints": Power, voltage, environmental, and cost limits
4. "recommendedComponents": Array of { "type": string, "name": string, "rationale": string, "suggestedPins": string }
5. "physicsPrinciples": Physics and electrical laws applied (e.g. capacitive moisture sensing, PWM duty cycle, ADC sampling)
6. "firmwareOutline": High-level pseudo-algorithm for the microcontroller loop
7. "prototypingTips": Practical advice for breadboard-to-PCB or 3D enclosure printing

Return ONLY valid JSON matching this structure.
`;

  try {
    const ai = getGenAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: AI_MENTOR_MODEL,
        contents: `Break down this idea into an engineering specification: "${idea}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    }
  } catch (err: any) {
    console.warn("Gemini breakdown error, using internal engineering architect fallback:", err?.message);
  }

  // Fallback breakdown
  const fallback = generateHeuristicIdeaBreakdown(idea);
  return res.json(fallback);
});

// =========================================================================
// Robot AI Programmer Endpoint (Gemini 3.5 Flash-Lite)
// Programs the Humanoid Robot's behavior, voice response, and 3D gestures
// =========================================================================
app.post(["/api/robot/program", "/api/gemini/robot-programmer"], async (req, res) => {
  const { prompt } = req.body || {};
  const userGoal = prompt || "хочу чтобы робот говорил на привет привет и махал рукой";

  const systemInstruction = `
You are the Google Gemini Lead Roboticist and Firmware Architect for the Humanoid Robot (CyberHumanoid Apex-1 / Gemini Core Neural SoC).
The user wants to program custom behaviors, voice interactions, and physical robotic gestures into the humanoid robot.

User's Request: "${userGoal}"

Your task is to:
1. Explain in clear, professional, yet engaging Russian how the robot will execute this behavior.
2. CRITICAL HARDWARE ANALYSIS:
   - Always analyze required hardware components for this behavior.
   - If the user wants voice interaction (e.g. speaking, greeting, voice chat), explicitly state what hardware is required:
     * "Микрофон": MEMS I2S микрофонная решетка (для захвата и распознавания речи).
     * "Динамик": звуковой динамик 3W 4Ω с I2S ЦАП MAX98357A (для аппаратного синтеза речи).
   - If the user wants hand gestures (e.g. waving hand, raising arm), state the required actuators:
     * "Сервопривод правого/левого плеча": квази-прямой привод QDD 70 Н·м (подъем руки на 75°).
     * "Привод локтя и кисти": циклоидальные сервоприводы для волнового движения ладони.
3. Generate a structured JSON response matching this schema:
{
  "replyText": "Подробный ответ инженера-программиста Gemini на русском языке...",
  "hardwareStatus": {
    "hasMicrophone": true,
    "hasSpeaker": true,
    "hasArmActuators": true,
    "hardwareNotice": "Для голосового ответа роботу необходим микрофон MEMS I2S (распознавание речи) и звуковой динамик 3W (синтез голоса). Приводы плеча QDD 70 Н·м готовы к выполнению жеста взмаха."
  },
  "behavior": {
    "behaviorName": "Голосовое приветствие со взмахом руки",
    "triggerType": "voice",
    "voiceKeywords": ["привет", "здравствуй", "hello", "хай", "салют"],
    "robotSpeechResponse": "Привет! Рад тебя видеть! Системы робота активны!",
    "robotGesture": "wave_right_arm",
    "armAngleDeg": 75,
    "firmwareSnippet": "// Robot Behavior Routine\\nvoid onVoiceKeywordDetected(String text) {\\n  if (text.indexOf(\\"привет\\") >= 0) {\\n    audioSpeaker.say(\\"Привет! Рад тебя видеть!\\");\\n    rightArm.moveToAngle(75.0);\\n    rightHand.wave(3);\\n  }\\n}"
  }
}
Return ONLY valid JSON.
`;

  try {
    const ai = getGenAI();
    if (ai) {
      const response = await ai.models.generateContent({
        model: AI_MENTOR_MODEL,
        contents: `Пользователь хочет запрограммировать робота: "${userGoal}". Сгенерируй ответ программиста и структуру поведения.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.replyText && parsed.behavior) {
        return res.json({
          ...parsed,
          provider: AI_MENTOR_MODEL,
          model: AI_MENTOR_MODEL,
        });
      }
    }
  } catch (err: any) {
    console.warn("Gemini robot programmer error, using high-fidelity local engine:", err?.message);
  }

  // Fallback intelligent roboticist heuristic
  const fallback = generateRobotProgramFallback(userGoal);
  return res.json(fallback);
});

function generateRobotProgramFallback(prompt: string) {
  const p = prompt.toLowerCase();
  let keywords = ["привет", "здравствуй", "салют", "hello", "хай"];
  let speech = "Привет, создатель! Рад тебя видеть! Все подсистемы работают в штатном режиме.";
  let gesture: "wave_right_arm" | "salute" | "bow" | "both_arms_up" = "wave_right_arm";
  let title = "Голосовое приветствие со взмахом правой руки";

  if (p.includes("кто ты") || p.includes("о себе") || p.includes("имя")) {
    keywords = ["кто ты", "представься", "твое имя", "как тебя зовут"];
    speech = "Я CyberHumanoid Apex-1, антропоморфный робот на базе квантового ИИ-нейрочипа Gemini Neural SoC от Google DeepMind!";
    gesture = "salute";
    title = "Самопрезентация робота и воинское приветствие";
  } else if (p.includes("поклон") || p.includes("поклонись") || p.includes("уважение")) {
    keywords = ["поклон", "поклонись", "добро пожаловать", "здравствуйте"];
    speech = "Приветствую вас с глубочайшим уважением! Готов к выполнению ваших задач.";
    gesture = "bow";
    title = "Вежливое приветствие и поклон";
  } else if (p.includes("обе руки") || p.includes("обеими") || p.includes("танцуй") || p.includes("радость")) {
    keywords = ["радость", "танцуй", "ура", "обе руки"];
    speech = "Ура! Программа успешно запущена! Приветствую обеими руками!";
    gesture = "both_arms_up";
    title = "Торжественный взмах двумя руками";
  }

  return {
    replyText: `Отличная задача! Я сконфигурировал для робота алгоритм «${title}».\n\n⚙️ **Аппаратные требования для этого режима:**\n• **🎤 Микрофонная решетка (MEMS I2S)**: необходима роботу для захвата акустического сигнала и распознавания ключевых слов (${keywords.map(k => `«${k}»`).join(", ")}).\n• **🔊 Звуковой динамик (3W 4Ω с I2S ЦАП)**: необходим для голосового ответа: *«${speech}»*.\n• **🦾 Привод правого плеча QDD (70 Н·м)**: выполняет плавный подъем руки на 75° с волнообразным движением ладони в течение 2.5 секунд.\n\nКод прошивки скомпилирован и загружен в квантовый нейрочип Gemini Neural SoC. Вы можете включить микрофон и протестировать команду прямо сейчас!`,
    hardwareStatus: {
      hasMicrophone: true,
      hasSpeaker: true,
      hasArmActuators: true,
      hardwareNotice: "Для голосового общения роботу необходим микрофон MEMS I2S (распознавание речи) и динамик 3W (голосовой синтез). Для жеста используются сервоприводы плеча и кисти.",
    },
    behavior: {
      behaviorName: title,
      triggerType: "voice",
      voiceKeywords: keywords,
      robotSpeechResponse: speech,
      robotGesture: gesture,
      armAngleDeg: 75,
      firmwareSnippet: `// ================================================\n// Прошивка чипа Gemini Neural SoC (FreeRTOS / C++)\n// ================================================\nvoid onVoiceKeywordEvent(const char* detectedWord) {\n  if (isKeywordMatch(detectedWord, "${keywords[0]}")) {\n    // 1. Активация динамика (TTS синтез)\n    Speaker_SayText("${speech}");\n\n    // 2. Кинематика руки: подъем и взмах\n    ShoulderPitch_SetTargetAngle(75.0f, SPEED_MEDIUM);\n    ElbowFlex_SetTargetAngle(35.0f, SPEED_MEDIUM);\n    BionicHand_PerformWaveGesture(3 /* cycles */);\n  }\n}`,
    },
    provider: "electroforge-engine",
  };
}

// High-fidelity Knowledge-Base powered heuristic generator (kept for offline knowledge reference)
export function generateHeuristicMentorResponse(prompt: string = "", ctx: any): string {
  const lang = detectLanguage(prompt);

  if (prompt && prompt.trim().length > 0) {
    const directAns = getDirectKnowledgeAnswer(prompt);
    if (directAns) return directAns;

    const matches = searchKnowledgeBase(prompt);
    if (matches.length > 0) {
      return lang === "ru" ? matches[0].answerRu : matches[0].answerEn;
    }
  }

  const comps = ctx?.components || [];
  const wires = ctx?.wires || [];
  if (lang === "ru") {
    return `### 💡 Обзор состояния схемы\nНа верстаке размещено: **${comps.length} компонентов** и **${wires.length} соединений проводниками**.`;
  }
  return `### 💡 Circuit Status Review\nCurrent circuit contains **${comps.length} components** and **${wires.length} wire connections**.`;
}

export { MENTOR_KNOWLEDGE_BASE };

function generateHeuristicIdeaBreakdown(idea: string) {
  const lower = idea.toLowerCase();
  const isWatering = lower.includes("water") || lower.includes("plant") || lower.includes("soil");

  if (isWatering) {
    return {
      summary: "Automatic closed-loop botanical hydration system with soil moisture sensing, relay-actuated water pump, and status feedback.",
      requirements: [
        "Read soil moisture percentage periodically using analog resistance or capacitive probe",
        "Compare reading against configurable threshold (e.g. < 30% moisture)",
        "Trigger 5V submersible relay pump for measured burst (e.g. 3 seconds)",
        "Provide visual LED status (Green = optimal, Blue = pumping, Red = reservoir empty)",
      ],
      constraints: [
        "Operating voltage: 5V DC logic; isolate pump motor noise with flyback diode",
        "Power budget: Sleep mode < 15mA, pumping peak ~350mA",
        "Corrosion prevention: pulse moisture sensor power only during ADC reads",
      ],
      recommendedComponents: [
        { type: "arduino_uno", name: "Arduino Uno R3", rationale: "Main MCU controller with 6 ADC channels and 5V native logic", suggestedPins: "A0 for Soil Sensor, D7 for Relay, D13 for Alert LED" },
        { type: "moisture_sensor", name: "Soil Moisture Sensor", rationale: "Detects volumetric water content via conductivity/capacitance", suggestedPins: "Signal -> A0, VCC -> D2 (pulsed), GND -> GND" },
        { type: "relay_module", name: "5V Single Channel Relay", rationale: "Electrically isolates sensitive MCU from inductive 5V-12V water pump", suggestedPins: "IN -> D7, VCC -> 5V, GND -> GND" },
        { type: "dc_motor", name: "Submersible 5V Pump / DC Motor", rationale: "Transfers water from reservoir to plant soil", suggestedPins: "NO & COM relay contacts" },
        { type: "led", name: "Status LEDs (Green/Red)", rationale: "Operator visual confirmation of moisture status", suggestedPins: "D12, D13 with 220Ω series resistors" },
      ],
      physicsPrinciples: [
        "Ohm's law and dielectric permittivity changes in damp vs dry soil",
        "Electromagnetic induction in relay coil and back-EMF suppression",
        "Ohmic loss and voltage drops across power rails under inductive inrush current",
      ],
      firmwareOutline: "setup() configures ADC and GPIOs -> loop() powers sensor, delays 10ms for stabilization, reads analogRead(A0), shuts off sensor power, checks threshold, fires relay digitalWrite(RELAY_PIN, HIGH), delays for watering duration, returns to standby.",
      prototypingTips: "Ensure physical separation between fluid tubing and electronic breadboard. Print a 3D dual-compartment enclosure with a water-sealed partition.",
    };
  }

  return {
    summary: `Engineering prototype architecture for: "${idea}".`,
    requirements: [
      "Capture environmental / user input via appropriate analog or digital transducers",
      "Process signal with microcontroller logic filter and threshold detection",
      "Actuate physical response (motor, servo, display, or audio sounder)",
      "Provide real-time telemetry and error diagnostics",
    ],
    constraints: [
      "Supply voltage: 5V USB or 9V battery with step-down regulator",
      "Current ceiling: < 500mA USB bus limit",
      "Thermal dissipation: Keep driver ICs within < 60°C margin",
    ],
    recommendedComponents: [
      { type: "arduino_uno", name: "Arduino Uno R3", rationale: "Primary digital brain for GPIO logic and timing control", suggestedPins: "Digital pins D2-D13, Analog A0-A5" },
      { type: "breadboard", name: "Half-size Breadboard", rationale: "Solderless prototyping grid with dual power distribution rails", suggestedPins: "+ and - rails connected to 5V and GND" },
      { type: "led", name: "Diagnostic Indicator LEDs", rationale: "State visualizer and debugging indicator", suggestedPins: "Any PWM or digital output with series resistor" },
      { type: "resistor", name: "220Ω Current Limiting Resistors", rationale: "Prevents thermal overcurrent through semiconductor junctions", suggestedPins: "In series with LEDs and inputs" },
    ],
    physicsPrinciples: [
      "Kirchhoff's Voltage Law (KVL) and Current Law (KCL)",
      "Ohm's Law: V = I × R for resistor sizing",
      "Digital logic state transitions and noise margin thresholds",
    ],
    firmwareOutline: "Initialize pinModes in setup(), configure Serial at 9600 baud. In loop(), poll sensors, perform state machine transitions, update actuator outputs, and stream telemetry to Serial Monitor.",
    prototypingTips: "Color-code your wires: Red for VCC, Black/Blue for GND, Yellow/Green for signals. Keep jumper wires short to minimize stray inductance.",
  };
}

// =========================================================================
// Custom Items & Community Marketplace In-Memory / File Backend
// (Uses /tmp on serverless runtimes where process.cwd() is read-only)
// =========================================================================
let serverCustomItems: any[] = [];
const isServerlessRuntime = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const STORAGE_FILE = isServerlessRuntime
  ? path.join("/tmp", "custom_items_store.json")
  : path.join(process.cwd(), "custom_items_store.json");

try {
  if (fs.existsSync(STORAGE_FILE)) {
    const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
    serverCustomItems = JSON.parse(raw);
    console.log(`💾 Loaded ${serverCustomItems.length} custom items from storage.`);
  }
} catch (e) {
  console.log("Could not load custom_items_store.json, starting with empty cache:", e);
}

function persistCustomItems() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(serverCustomItems, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write custom_items_store.json:", e);
  }
}

// GET /api/custom-items
app.get("/api/custom-items", (req, res) => {
  const { public_only, user_id, category, search } = req.query as Record<string, string>;
  let results = [...serverCustomItems];

  if (public_only === "true") {
    results = results.filter((item) => item.is_public === true);
  }
  if (user_id) {
    results = results.filter((item) => item.user_id === user_id);
  }
  if (category && category !== "all") {
    results = results.filter((item) => item.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
        item.author_name?.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: results.length, items: results });
});

// POST /api/custom-items and /api/custom-items/save
app.post(["/api/custom-items", "/api/custom-items/save"], (req, res) => {
  const body = req.body || {};
  if (!body.name) {
    return res.status(400).json({ error: "Missing required item fields (name, config_json)" });
  }

  const newItem = {
    ...body,
    id: body.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };

  const existingIdx = serverCustomItems.findIndex((i) => i.id === newItem.id);
  if (existingIdx >= 0) {
    serverCustomItems[existingIdx] = { ...serverCustomItems[existingIdx], ...newItem };
  } else {
    serverCustomItems.unshift({
      ...newItem,
      downloads: newItem.downloads || 0,
      likes: newItem.likes || 0,
      created_at: newItem.created_at || new Date().toISOString(),
    });
  }

  persistCustomItems();
  res.json({ success: true, item: newItem });
});

// POST /api/custom-items/publish
app.post("/api/custom-items/publish", (req, res) => {
  const { id, price = 0, tags = [], name, config_json, preview_url, author_name, category } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: "Item ID is required to publish" });
  }

  const existingIdx = serverCustomItems.findIndex((i) => i.id === id);
  let publishedItem: any;

  if (existingIdx >= 0) {
    serverCustomItems[existingIdx] = {
      ...serverCustomItems[existingIdx],
      is_public: true,
      price: Number(price) || 0,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : serverCustomItems[existingIdx].tags || [],
    };
    publishedItem = serverCustomItems[existingIdx];
  } else {
    publishedItem = {
      id,
      user_id: req.body.user_id || "guest_engineer",
      name: name || "Custom 3D Engineered Part",
      price: Number(price) || 0,
      is_public: true,
      config_json: config_json || {},
      preview_url: preview_url || "",
      author_name: author_name || "Community Engineer",
      category: category || "custom",
      tags: Array.isArray(tags) ? tags : ["custom", "3d-part"],
      downloads: 1,
      likes: 0,
      created_at: new Date().toISOString(),
    };
    serverCustomItems.unshift(publishedItem);
  }

  persistCustomItems();
  res.json({ success: true, item: publishedItem });
});

// POST /api/custom-items/:id/install
app.post("/api/custom-items/:id/install", (req, res) => {
  const { id } = req.params;
  const item = serverCustomItems.find((i) => i.id === id);
  if (item) {
    item.downloads = (item.downloads || 0) + 1;
    persistCustomItems();
  }
  res.json({ success: true, item });
});

// DELETE /api/custom-items/:id
app.delete("/api/custom-items/:id", (req, res) => {
  const { id } = req.params;
  serverCustomItems = serverCustomItems.filter((i) => i.id !== id);
  persistCustomItems();
  res.json({ success: true, deletedId: id });
});

export default app;
