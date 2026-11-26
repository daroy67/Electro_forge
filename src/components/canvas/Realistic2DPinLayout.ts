import { PlacedComponent, PinDefinition } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";

export interface PinPositionInfo {
  pinId: string;
  name: string;
  type: string;
  x: number; // offset in px relative to component center
  y: number; // offset in px relative to component center
  isPrimaryPower?: boolean;
  isPrimaryGnd?: boolean;
}

/**
 * Returns exact physical coordinates of pins for realistic 2D rendering.
 * Relative to the center of the component (0, 0).
 */
export function getRealisticPinOffsets(comp: PlacedComponent): PinPositionInfo[] {
  const def = COMPONENTS_CATALOG[comp.type];
  const type = comp.type.toLowerCase();
  const pins: PinDefinition[] = def?.pins || [
    { id: "pin1", name: "Контакт 1", type: "PASSIVE", offset: [-1, 0, 0] },
    { id: "pin2", name: "Контакт 2", type: "PASSIVE", offset: [1, 0, 0] },
  ];

  // 0. Complex Device Modules (TV, Laptop, SmartHome, Smartphone, Drone) — preserve exact catalog pin IDs
  if (
    type.startsWith("tv_") ||
    type.startsWith("laptop_") ||
    type.startsWith("smarthome_") ||
    type.startsWith("phone_") ||
    type.startsWith("drone_")
  ) {
    const rawPins = def?.pins || [];
    const count = Math.max(1, rawPins.length);
    const spacing = Math.min(34, 130 / count);
    return rawPins.map((p, idx) => ({
      pinId: p.id,
      name: p.name || p.id,
      type: p.type || "PASSIVE",
      x: -((count - 1) * spacing) / 2 + idx * spacing,
      y: 38,
      isPrimaryPower: p.type === "POWER_VCC" || p.id === "pos" || p.id.includes("v12") || p.id.includes("5v") || p.id.includes("ac_"),
      isPrimaryGnd: p.type === "POWER_GND" || p.id === "neg" || p.id.includes("gnd"),
    }));
  }

  // 1. Resistor (Axial package: leads on left and right)
  if (type === "resistor" || type.includes("resistor")) {
    return [
      { pinId: "pin1", name: "Вывод 1 (L)", type: "PASSIVE", x: -68, y: 0 },
      { pinId: "pin2", name: "Вывод 2 (R)", type: "PASSIVE", x: 68, y: 0 },
    ];
  }

  // 2. Diode 1N4007 (Axial: Anode on Left, Cathode on Right with silver stripe)
  if (type === "diode" || type.includes("diode") || type.includes("1n4007")) {
    return [
      { pinId: "anode", name: "Анод (+)", type: "PASSIVE", x: -64, y: 0, isPrimaryPower: true },
      { pinId: "cathode", name: "Катод (-)", type: "PASSIVE", x: 64, y: 0, isPrimaryGnd: true },
    ];
  }

  // 3. LED (Radial: Anode + left, Cathode - right)
  if (type === "led" || type.includes("led")) {
    return [
      { pinId: "anode", name: "Анод (+ Длинная ножка)", type: "PASSIVE", x: -14, y: 44, isPrimaryPower: true },
      { pinId: "cathode", name: "Катод (- Срез линзы)", type: "PASSIVE", x: 14, y: 40, isPrimaryGnd: true },
    ];
  }

  // 4. 9V Battery (PP3 / Крона: Top terminals)
  if (type === "battery_9v" || type.includes("battery_9v")) {
    return [
      { pinId: "pos", name: "🔴 Плюс (+9V)", type: "POWER_VCC", x: -22, y: -48, isPrimaryPower: true },
      { pinId: "neg", name: "⚫ Минус (GND)", type: "POWER_GND", x: 22, y: -48, isPrimaryGnd: true },
    ];
  }

  // 5. Li-Po Battery (Top wires)
  if (type === "battery_lipo" || type.includes("lipo")) {
    return [
      { pinId: "pos", name: "🔴 Плюс (+3.7V)", type: "POWER_VCC", x: -18, y: -46, isPrimaryPower: true },
      { pinId: "neg", name: "⚫ Минус (GND)", type: "POWER_GND", x: 18, y: -46, isPrimaryGnd: true },
    ];
  }

  // 6. 18650 Battery (Top button + and bottom -)
  if (type === "battery_18650" || type.includes("18650")) {
    return [
      { pinId: "pos", name: "🔴 Плюс (+3.7V)", type: "POWER_VCC", x: 0, y: -54, isPrimaryPower: true },
      { pinId: "neg", name: "⚫ Минус (GND)", type: "POWER_GND", x: 0, y: 54, isPrimaryGnd: true },
    ];
  }

  // 7. USB Power / USB-C
  if (type.includes("usb")) {
    return [
      { pinId: "vbus", name: "VBUS (+5V)", type: "POWER_VCC", x: -24, y: 26, isPrimaryPower: true },
      { pinId: "gnd", name: "GND (Земля)", type: "POWER_GND", x: 24, y: 26, isPrimaryGnd: true },
    ];
  }

  // 8. Bench Power Supply
  if (type.includes("bench_power") || type.includes("power_supply")) {
    return [
      { pinId: "pos", name: "🔴 Выход (+)", type: "POWER_VCC", x: -28, y: 38, isPrimaryPower: true },
      { pinId: "neg", name: "⚫ Выход (-)", type: "POWER_GND", x: 28, y: 38, isPrimaryGnd: true },
    ];
  }

  // 9. Tactile Push Button (4 pins)
  if (type === "push_button" || type === "pushbutton" || type.includes("button")) {
    return [
      { pinId: "pin1a", name: "Контакт 1A", type: "PASSIVE", x: -36, y: -16 },
      { pinId: "pin1b", name: "Контакт 1B", type: "PASSIVE", x: -36, y: 16 },
      { pinId: "pin2a", name: "Контакт 2A", type: "PASSIVE", x: 36, y: -16 },
      { pinId: "pin2b", name: "Контакт 2B", type: "PASSIVE", x: 36, y: 16 },
    ];
  }

  // 10. Slide Switch
  if (type.includes("switch")) {
    return [
      { pinId: "pin1", name: "Контакт 1", type: "PASSIVE", x: -28, y: 28 },
      { pinId: "common", name: "Общий (COM)", type: "PASSIVE", x: 0, y: 28 },
      { pinId: "pin2", name: "Контакт 2", type: "PASSIVE", x: 28, y: 28 },
    ];
  }

  // 11. Potentiometer (3 lugs)
  if (type.includes("potentiometer") || type.includes("pot")) {
    return [
      { pinId: "pin1", name: "Вывод 1", type: "PASSIVE", x: -26, y: 44 },
      { pinId: "wiper", name: "Ползунок (Wiper)", type: "ANALOG_IN", x: 0, y: 46 },
      { pinId: "pin2", name: "Вывод 2", type: "PASSIVE", x: 26, y: 44 },
    ];
  }

  // 12. Electrolytic Capacitor
  if (type.includes("capacitor_electrolytic") || type.includes("electrolytic")) {
    return [
      { pinId: "anode", name: "Анод (+)", type: "PASSIVE", x: -14, y: 42, isPrimaryPower: true },
      { pinId: "cathode", name: "Катод (- Полоса)", type: "PASSIVE", x: 14, y: 42, isPrimaryGnd: true },
    ];
  }

  // 13. Ceramic Capacitor
  if (type.includes("capacitor")) {
    return [
      { pinId: "pin1", name: "Вывод 1", type: "PASSIVE", x: -12, y: 38 },
      { pinId: "pin2", name: "Вывод 2", type: "PASSIVE", x: 12, y: 38 },
    ];
  }

  // 14. DC Motor / Motor
  if (type.includes("motor") && !type.includes("servo") && !type.includes("driver")) {
    return [
      { pinId: "pos", name: "Клемма (+)", type: "PASSIVE", x: -20, y: 44, isPrimaryPower: true },
      { pinId: "neg", name: "Клемма (-)", type: "PASSIVE", x: 20, y: 44, isPrimaryGnd: true },
    ];
  }

  // 15. Servo Motor
  if (type.includes("servo")) {
    return [
      { pinId: "gnd", name: "⚫ GND (Коричневый)", type: "POWER_GND", x: -18, y: 42, isPrimaryGnd: true },
      { pinId: "vcc", name: "🔴 VCC +5V (Красный)", type: "POWER_VCC", x: 0, y: 42, isPrimaryPower: true },
      { pinId: "signal", name: "🟡 PWM Сигнал (Желтый)", type: "PWM", x: 18, y: 42 },
    ];
  }

  // 16. Buzzer / Piezo
  if (type.includes("buzzer") || type.includes("piezo")) {
    return [
      { pinId: "pos", name: "🔴 Плюс (+)", type: "PASSIVE", x: -16, y: 38, isPrimaryPower: true },
      { pinId: "neg", name: "⚫ Минус (-)", type: "PASSIVE", x: 16, y: 38, isPrimaryGnd: true },
    ];
  }

  // 17. HC-SR04 Ultrasonic Sensor
  if (type.includes("ultrasonic") || type.includes("hcsr04") || type.includes("sensor_ultrasonic")) {
    return [
      { pinId: "vcc", name: "VCC (+5V)", type: "POWER_VCC", x: -27, y: 36, isPrimaryPower: true },
      { pinId: "trig", name: "TRIG (Импульс)", type: "DIGITAL_IO", x: -9, y: 36 },
      { pinId: "echo", name: "ECHO (Эхо)", type: "DIGITAL_IO", x: 9, y: 36 },
      { pinId: "gnd", name: "GND (Земля)", type: "POWER_GND", x: 27, y: 36, isPrimaryGnd: true },
    ];
  }

  // 18. DHT11 / DHT22 Sensor
  if (type.includes("dht")) {
    return [
      { pinId: "vcc", name: "VCC (+3.3-5V)", type: "POWER_VCC", x: -18, y: 38, isPrimaryPower: true },
      { pinId: "data", name: "DATA (Сигнал)", type: "DIGITAL_IO", x: 0, y: 38 },
      { pinId: "gnd", name: "GND (Земля)", type: "POWER_GND", x: 18, y: 38, isPrimaryGnd: true },
    ];
  }

  // 19. Photoresistor (LDR)
  if (type.includes("photoresistor") || type.includes("ldr")) {
    return [
      { pinId: "pin1", name: "Вывод 1", type: "PASSIVE", x: -14, y: 34 },
      { pinId: "pin2", name: "Вывод 2", type: "PASSIVE", x: 14, y: 34 },
    ];
  }

  // 20. OLED / LCD Display I2C (4 pins at top)
  if (type.includes("oled") || type.includes("display") || type.includes("lcd")) {
    return [
      { pinId: "gnd", name: "GND (Земля)", type: "POWER_GND", x: -30, y: -42, isPrimaryGnd: true },
      { pinId: "vcc", name: "VCC (+5V)", type: "POWER_VCC", x: -10, y: -42, isPrimaryPower: true },
      { pinId: "sda", name: "SDA (Данные I2C)", type: "I2C_SDA", x: 10, y: -42 },
      { pinId: "scl", name: "SCL (Такты I2C)", type: "I2C_SCL", x: 30, y: -42 },
    ];
  }

  // 21. Transistor / MOSFET (TO-220: Gate, Drain, Source)
  if (type.includes("mosfet") || type.includes("transistor")) {
    return [
      { pinId: "gate", name: "G (Затвор)", type: "PASSIVE", x: -18, y: 44 },
      { pinId: "drain", name: "D (Сток)", type: "PASSIVE", x: 0, y: 44 },
      { pinId: "source", name: "S (Исток)", type: "PASSIVE", x: 18, y: 44, isPrimaryGnd: true },
    ];
  }

  // 22. Arduino Uno: Header positions (Upper row: Digital D0..D13, Lower row: Power + Analog)
  if (type.includes("arduino")) {
    const unoPins: PinPositionInfo[] = [];
    // If pins exist in definition, distribute nicely on top and bottom headers
    pins.forEach((p, idx) => {
      const isTop = p.id.startsWith("d") || p.id.includes("pwm") || idx < pins.length / 2;
      const totalInRow = Math.ceil(pins.length / 2);
      const rowIdx = isTop ? idx : idx - totalInRow;
      const x = -60 + (rowIdx * 120) / Math.max(1, totalInRow - 1);
      const y = isTop ? -56 : 56;
      unoPins.push({
        pinId: p.id,
        name: p.name || p.id,
        type: p.type || "DIGITAL_IO",
        x,
        y,
        isPrimaryPower: p.id.includes("5v") || p.id.includes("vcc"),
        isPrimaryGnd: p.id.includes("gnd"),
      });
    });
    return unoPins;
  }

  // 23. ESP32 DevKit: Left and Right headers
  if (type.includes("esp32") || type.includes("mcu")) {
    const espPins: PinPositionInfo[] = [];
    const half = Math.ceil(pins.length / 2);
    pins.forEach((p, idx) => {
      const isRight = idx >= half;
      const sideIdx = isRight ? idx - half : idx;
      const y = -58 + (sideIdx * 116) / Math.max(1, half - 1);
      const x = isRight ? 48 : -48;
      espPins.push({
        pinId: p.id,
        name: p.name || p.id,
        type: p.type || "DIGITAL_IO",
        x,
        y,
        isPrimaryPower: p.id.includes("3v3") || p.id.includes("5v") || p.id.includes("vcc"),
        isPrimaryGnd: p.id.includes("gnd"),
      });
    });
    return espPins;
  }

  // Default fallback: distribute along bottom edge evenly
  const count = Math.max(1, pins.length);
  const spacing = Math.min(28, 120 / count);
  return pins.map((p, idx) => {
    const x = -((count - 1) * spacing) / 2 + idx * spacing;
    return {
      pinId: p.id,
      name: p.name || p.id,
      type: p.type || "PASSIVE",
      x,
      y: 36,
      isPrimaryPower: p.id === "pos" || p.id.includes("vcc") || p.id.includes("5v"),
      isPrimaryGnd: p.id === "neg" || p.id.includes("gnd"),
    };
  });
}
