import * as THREE from "three";
import { PlacedComponent } from "../../types";
import { COMPONENTS_CATALOG } from "../../data/componentsCatalog";

// Color band codes for resistors
const RESISTOR_BAND_COLORS: Record<number, number> = {
  0: 0x000000, // Black
  1: 0x8b4513, // Brown
  2: 0xff0000, // Red
  3: 0xff8c00, // Orange
  4: 0xffd700, // Yellow
  5: 0x008000, // Green
  6: 0x0000ff, // Blue
  7: 0x800080, // Violet
  8: 0x808080, // Gray
  9: 0xffffff, // White
};

export function createComponentMesh(
  comp: PlacedComponent,
  interactivePinsRef?: Map<string, THREE.Vector3>
): THREE.Group {
  const group = new THREE.Group();
  group.name = `comp-${comp.id}`;
  group.userData = { componentId: comp.id, type: comp.type };

  const def = COMPONENTS_CATALOG[comp.type];
  const state = comp.state || {};

  switch (comp.type) {
    case "arduino_uno":
      buildArduinoUnoMesh(group, comp, state);
      break;
    case "esp32_devkit":
      buildEsp32Mesh(group, comp, state);
      break;
    case "breadboard_half":
      buildBreadboardMesh(group, comp);
      break;
    case "led":
      buildLedMesh(group, comp, state);
      break;
    case "fuse":
      buildFuseMesh(group, comp, state);
      break;
    case "resistor":
      buildResistorMesh(group, comp);
      break;
    case "pushbutton":
      buildPushbuttonMesh(group, comp, state);
      break;
    case "servo_motor":
      buildServoMesh(group, comp, state);
      break;
    case "dc_motor":
      buildDcMotorMesh(group, comp, state);
      break;
    case "ultrasonic_sensor":
      buildUltrasonicMesh(group, comp);
      break;
    case "lcd_1602_i2c":
      buildLcdMesh(group, comp, state);
      break;
    case "battery_9v":
      buildBatteryMesh(group, comp);
      break;
    case "potentiometer":
      buildPotentiometerMesh(group, comp);
      break;
    case "temp_sensor":
      buildTempSensorMesh(group, comp);
      break;
    case "photoresistor_ldr":
      buildLdrMesh(group, comp);
      break;
    case "battery_lipo":
      buildLipoBatteryMesh(group, comp);
      break;
    case "battery_18650":
      build18650BatteryMesh(group, comp);
      break;
    case "usb_power":
      buildUsbPowerMesh(group, comp);
      break;
    case "bench_power_supply":
      buildBenchSupplyMesh(group, comp);
      break;
    case "solar_panel":
      buildSolarPanelMesh(group, comp);
      break;
    case "capacitor_ceramic":
      buildCeramicCapMesh(group, comp);
      break;
    case "capacitor_electrolytic":
      buildElectrolyticCapMesh(group, comp);
      break;
    case "diode_1n4007":
      buildDiodeMesh(group, comp);
      break;
    case "mosfet_n":
    case "voltage_regulator_7805":
      buildTo220Mesh(group, comp);
      break;
    case "transistor_npn":
      buildTempSensorMesh(group, comp); // TO-92 case
      break;
    case "timer_555":
      buildDip8Mesh(group, comp);
      break;
    case "piezo_buzzer":
      buildBuzzerMesh(group, comp, state);
      break;
    case "relay_5v":
      buildRelayMesh(group, comp);
      break;
    case "pir_sensor":
      buildPirSensorMesh(group, comp, state);
      break;
    case "sound_sensor":
      buildSoundSensorMesh(group, comp, state);
      break;
    case "fan_cooler":
      buildFanCoolerMesh(group, comp, state);
      break;
    // Drone Subsystem Parts
    case "drone_frame":
      buildDroneFrameMesh(group, comp);
      break;
    case "drone_battery":
      buildDroneBatteryMesh(group, comp);
      break;
    case "drone_pdb":
      buildDronePdbMesh(group, comp);
      break;
    case "drone_fc":
      buildDroneFcMesh(group, comp, state);
      break;
    case "drone_esc":
      buildDroneEscMesh(group, comp);
      break;
    case "drone_motor":
    case "drone_motor_cw":
    case "drone_motor_ccw":
      buildDroneMotorMesh(group, comp, state);
      break;
    case "drone_prop":
    case "drone_prop_cw":
    case "drone_prop_ccw":
      buildDronePropMesh(group, comp, state);
      break;
    case "drone_rx":
      buildDroneRxMesh(group, comp);
      break;
    case "drone_gps":
      buildDroneGpsMesh(group, comp);
      break;
    case "drone_camera":
      buildDroneCameraMesh(group, comp);
      break;
    case "drone_vtx":
      buildDroneVtxMesh(group, comp);
      break;
    // Smartphone Subsystem Parts
    case "phone_frame":
      buildPhoneFrameMesh(group, comp);
      break;
    case "phone_backcover":
      buildPhoneBackCoverMesh(group, comp);
      break;
    case "phone_display":
      buildPhoneDisplayMesh(group, comp, state);
      break;
    case "phone_battery":
      buildPhoneBatteryMesh(group, comp);
      break;
    case "phone_motherboard":
      buildPhoneMotherboardMesh(group, comp, state);
      break;
    case "phone_camera":
      buildPhoneCameraMesh(group, comp);
      break;
    case "phone_speaker":
      buildPhoneSpeakerMesh(group, comp, state);
      break;
    case "phone_usbc":
      buildPhoneUsbcMesh(group, comp);
      break;
    case "phone_flash":
      buildPhoneFlashMesh(group, comp, state);
      break;
    // Granular Sub-Components & Natural Materials
    case "raw_fr4_substrate":
      buildRawFr4SubstrateMesh(group, comp);
      break;
    case "smd_soc_chip":
      buildSmdSocChipMesh(group, comp);
      break;
    case "raw_gold_wire":
      buildRawGoldWireMesh(group, comp);
      break;
    case "smd_pmic_chip":
      buildSmdPmicChipMesh(group, comp);
      break;
    case "smd_memory_chip":
      buildSmdMemoryChipMesh(group, comp);
      break;
    case "smd_passives_pack":
      buildSmdPassivesPackMesh(group, comp);
      break;
    case "flashlight_led":
      buildFlashlightLedMesh(group, comp, state);
      break;
    case "flash_lens":
      buildFlashLensMesh(group, comp);
      break;
    case "mini_substrate":
      buildMiniSubstrateMesh(group, comp);
      break;
    case "camera_sensor_cmos":
      buildCameraSensorCmosMesh(group, comp);
      break;
    case "camera_lens_group":
      buildCameraLensGroupMesh(group, comp);
      break;
    case "camera_ois_actuator":
      buildCameraOisActuatorMesh(group, comp);
      break;
    case "camera_flex_cable":
      buildCameraFlexCableMesh(group, comp);
      break;
    case "raw_lithium_pouch":
      buildRawLithiumPouchMesh(group, comp);
      break;
    case "bms_protection_board":
      buildBmsProtectionBoardMesh(group, comp);
      break;
    case "nickel_tabs":
      buildNickelTabsMesh(group, comp);
      break;
    // PC ATX & Smart TV Motherboard Components
    case "pc_socket_lga1700":
      buildPcLgaSocketMesh(group, comp);
      break;
    case "pc_vrm_drmos_stage":
      buildPcVrmStageMesh(group, comp);
      break;
    case "pc_ddr5_dimm_slot":
      buildPcDdr5SlotMesh(group, comp);
      break;
    case "pc_pcie5_steel_slot":
      buildPcPcieSlotMesh(group, comp);
      break;
    case "pc_pch_chipset":
    case "tv_soc_4k8k":
      buildPcPchChipsetMesh(group, comp);
      break;
    case "pc_m2_nvme_slot":
      buildPcM2SlotMesh(group, comp);
      break;
    case "pc_audio_supremefx":
    case "tv_audio_class_d":
    case "audio_dac_chip":
      buildAudioCodecMesh(group, comp);
      break;
    case "smd_storage_ufs4":
    case "smd_rf_fem_wifi7":
    case "modem_5g_chip":
    case "gyro_imu_sensor":
    case "pc_lan_controller":
    case "tv_wifi_module":
    case "iron_inductor_sensor":
    case "hall_effect_sensor":
    case "vrm_power_inductor":
      buildGenericMicroIcMesh(group, comp);
      break;
    case "pc_cmos_battery":
      buildBatteryMesh(group, comp);
      break;
    case "pc_nichicon_caps":
      buildElectrolyticCapMesh(group, comp);
      break;
    case "pc_eps8_power":
    case "tv_optical_spdif":
      buildPhoneUsbcMesh(group, comp);
      break;
    case "smd_crystal_38mhz":
      buildCrystalMesh(group, comp);
      break;
    case "smd_usbc_120w":
      buildPhoneUsbcMesh(group, comp);
      break;
    case "tv_tuner_shielded":
      buildTvTunerMesh(group, comp);
      break;
    // Robot Subsystem Parts
    case "robot_chassis":
      buildRobotChassisMesh(group, comp);
      break;
    case "robot_battery":
      buildRobotBatteryMesh(group, comp);
      break;
    // Drone Attachments
    case "drone_shooter":
    case "drone_laser":
    case "drone_dart":
      buildDroneShooterMesh(group, comp, state);
      break;
    case "drone_gimbal_camera":
    case "drone_camera_mod":
      buildDroneGimbalCameraMesh(group, comp, state);
      break;
    // Humanoid Robot Bipedal Parts
    case "humanoid_head":
      buildHumanoidHeadMesh(group, comp, state);
      break;
    case "humanoid_torso":
      buildHumanoidTorsoMesh(group, comp, state);
      break;
    case "humanoid_arm_left":
    case "humanoid_arm_right":
    case "humanoid_leg_left":
    case "humanoid_leg_right":
      buildHumanoidLimbMesh(group, comp, comp.type);
      break;
    // Robot Dog Quadruped Parts
    case "robodog_body":
      buildRoboDogBodyMesh(group, comp, state);
      break;
    case "robodog_leg_fl":
    case "robodog_leg_fr":
    case "robodog_leg_rl":
    case "robodog_leg_rr":
      buildRoboDogLegMesh(group, comp, comp.type);
      break;
    // 3D Custom Part Builder Items
    case "custom_part":
      buildCustomPartMesh(group, comp);
      break;
    // Advanced Computing & System Boards
    case "atx_server_motherboard":
      buildAtxServerMotherboardMesh(group, comp);
      break;
    case "rpi5_sbc":
      buildRpi5SbcMesh(group, comp);
      break;
    case "drone_flight_controller":
      buildDroneFlightControllerMesh(group, comp);
      break;
    case "automotive_ecu_board":
      buildAutomotiveEcuMesh(group, comp);
      break;
    // Smart 4K Television Parts
    case "tv_chassis":
      buildTvChassisMesh(group, comp);
      break;
    case "tv_bezel":
      buildTvBezelMesh(group, comp);
      break;
    case "tv_ac_inlet":
      buildTvAcInletMesh(group, comp);
      break;
    case "tv_smps":
      buildTvSmpsMesh(group, comp, state);
      break;
    case "tv_mainboard":
    case "tv_motherboard":
      buildTvMainboardMesh(group, comp, state);
      break;
    case "tv_tcon":
      buildTvTconMesh(group, comp, state);
      break;
    case "tv_backlight":
      buildTvBacklightMesh(group, comp, state);
      break;
    case "tv_panel":
      buildTvPanelMesh(group, comp, state);
      break;
    case "tv_speaker":
      buildTvSpeakerMesh(group, comp, state);
      break;
    // Laptop / Ultrabook Parts
    case "laptop_chassis":
      buildLaptopChassisMesh(group, comp);
      break;
    case "laptop_topcase":
      buildLaptopTopcaseMesh(group, comp);
      break;
    case "laptop_battery":
      buildLaptopBatteryMesh(group, comp);
      break;
    case "laptop_pmic":
      buildLaptopPmicMesh(group, comp);
      break;
    case "laptop_motherboard":
      buildLaptopMotherboardMesh(group, comp, state);
      break;
    case "laptop_cpu":
      buildLaptopCpuMesh(group, comp);
      break;
    case "laptop_ssd":
      buildLaptopSsdMesh(group, comp);
      break;
    case "laptop_heatsink":
      buildLaptopHeatsinkMesh(group, comp);
      break;
    case "laptop_fan":
      buildLaptopFanMesh(group, comp, state);
      break;
    case "laptop_screen":
      buildLaptopScreenMesh(group, comp, state);
      break;
    // Smart Home IoT Hub Parts
    case "smarthome_psu":
      buildSmartHomePsuMesh(group, comp, state);
      break;
    case "smarthome_controller":
      buildSmartHomeControllerMesh(group, comp, state);
      break;
    case "smarthome_relay":
      buildSmartHomeRelayMesh(group, comp, state);
      break;
    case "smarthome_sensor":
      buildSmartHomeSensorMesh(group, comp);
      break;
    case "smarthome_pir":
      buildSmartHomePirMesh(group, comp, state);
      break;
    case "smarthome_oled":
      buildSmartHomeOledMesh(group, comp, state);
      break;
    default:
      if (comp.params?.customConfig) {
        buildCustomPartMesh(group, comp);
      } else {
        // Generic block
        const boxGeo = new THREE.BoxGeometry(2, 1, 2);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        group.add(new THREE.Mesh(boxGeo, boxMat));
      }
  }

  // Build interactive pin contact points (supporting both catalog def and custom config)
  const pinList = comp.params?.customConfig?.pins || def?.pins || [];
  if (pinList.length > 0) {
    pinList.forEach((pin: any) => {
      const pinOffset = new THREE.Vector3(...pin.offset);
      const isPos = pin.id === "pos" || pin.id.includes("vcc") || pin.id.includes("5v") || pin.id.includes("anode");
      const isNeg = pin.id === "neg" || pin.id.includes("gnd") || pin.id.includes("cathode");

      // Realistic metallic solder pad / header pin (brass for power, silver for gnd/signals)
      const isArduino = comp.type === "arduino_uno";
      const pinMat = new THREE.MeshStandardMaterial({
        color: isArduino ? 0xf59e0b : isPos ? 0xd97706 : isNeg ? 0x94a3b8 : 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.2,
      });
      const pinMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(isArduino ? 0.13 : 0.11, isArduino ? 0.13 : 0.11, isArduino ? 0.24 : 0.16, 12),
        pinMat
      );
      pinMesh.position.copy(pinOffset);
      if (isArduino) {
        pinMesh.position.y = 0.65; // Place right at top of female socket
      }
      pinMesh.name = `pin-${comp.id}-${pin.id}`;
      pinMesh.userData = {
        isPin: true,
        componentId: comp.id,
        pinId: pin.id,
        pinDef: pin,
      };
      group.add(pinMesh);

      // Solder/socket rim ring for distinct connector visibility
      if (isArduino) {
        const rim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
        );
        rim.position.set(pinOffset.x, 0.76, pinOffset.z);
        group.add(rim);
      }

      // Subtle realistic base washer ring flush with surface (Red for +, Dark for -)
      if (isPos || isNeg) {
        const washerGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
        const washerMat = new THREE.MeshStandardMaterial({
          color: isPos ? 0xdc2626 : 0x1e293b,
          roughness: 0.4,
          metalness: 0.1,
        });
        const washer = new THREE.Mesh(washerGeo, washerMat);
        washer.position.set(pinOffset.x, pinOffset.y - 0.06, pinOffset.z);
        group.add(washer);
      }

      if (interactivePinsRef) {
        interactivePinsRef.set(`${comp.id}:${pin.id}`, pinOffset.clone());
      }
    });
  }

  // Universal visual consequences of short circuit / overload failure
  if (state.isBlown || comp.params?.isBlown) {
    // Scorched dark soot mark
    const charGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.12, 12);
    const charMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.95,
      metalness: 0.05,
    });
    const charMesh = new THREE.Mesh(charGeo, charMat);
    charMesh.position.set(0, 0.35, 0);
    group.add(charMesh);

    // Heat discoloration glow/soot puff
    const sootGeo = new THREE.SphereGeometry(0.28, 8, 8);
    const sootMat = new THREE.MeshBasicMaterial({
      color: 0x27272a,
      transparent: true,
      opacity: 0.85,
    });
    const soot = new THREE.Mesh(sootGeo, sootMat);
    soot.position.set(0, 0.5, 0);
    group.add(soot);
  }

  // Set initial position and rotation
  group.position.set(comp.position.x, comp.position.y, comp.position.z);
  group.rotation.set(comp.rotation.x, comp.rotation.y, comp.rotation.z);

  return group;
}

// 0. Glass Cartridge Fuse (5x20mm) with visible fusible link and blown state
function buildFuseMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  const isBlown = Boolean(state?.isBlown || comp.params?.isBlown);

  // Glass cylindrical body
  const glassGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.4, 16);
  glassGeo.rotateZ(Math.PI / 2);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: isBlown ? 0x27272a : 0xf8fafc,
    transparent: true,
    opacity: isBlown ? 0.9 : 0.45,
    roughness: 0.15,
    metalness: 0.1,
    transmission: isBlown ? 0.2 : 0.85,
    ior: 1.5,
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 0.3, 0);
  group.add(glass);

  // Chrome nickel-plated end caps
  const capGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.38, 16);
  capGeo.rotateZ(Math.PI / 2);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.9,
    roughness: 0.2,
  });

  const leftCap = new THREE.Mesh(capGeo, capMat);
  leftCap.position.set(-0.85, 0.3, 0);
  group.add(leftCap);

  const rightCap = new THREE.Mesh(capGeo, capMat);
  rightCap.position.set(0.85, 0.3, 0);
  group.add(rightCap);

  // Axial contact pins
  const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
  pinGeo.rotateZ(Math.PI / 2);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xa1a1aa, metalness: 0.8, roughness: 0.3 });

  const leftPin = new THREE.Mesh(pinGeo, pinMat);
  leftPin.position.set(-1.15, 0.3, 0);
  group.add(leftPin);

  const rightPin = new THREE.Mesh(pinGeo, pinMat);
  rightPin.position.set(1.15, 0.3, 0);
  group.add(rightPin);

  // Internal fusible wire
  if (!isBlown) {
    const wireGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    wireGeo.rotateZ(Math.PI / 2);
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, 0.3, 0);
    group.add(wire);
  } else {
    // Melted severed wire stubs
    const stubGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8);
    stubGeo.rotateZ(Math.PI / 2);
    const stubMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.4, roughness: 0.9 });

    const leftStub = new THREE.Mesh(stubGeo, stubMat);
    leftStub.position.set(-0.45, 0.3, 0);
    group.add(leftStub);

    const rightStub = new THREE.Mesh(stubGeo, stubMat);
    rightStub.position.set(0.45, 0.3, 0);
    group.add(rightStub);

    // Blown internal arc soot deposit
    const sootGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const sootMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const sootMesh = new THREE.Mesh(sootGeo, sootMat);
    sootMesh.position.set(0, 0.3, 0);
    group.add(sootMesh);
  }
}

// 1. Arduino Uno R3 Texture Cache & Generator
let cachedArduinoSilkTexture: THREE.CanvasTexture | null = null;

function getArduinoUnoPcbTexture(): THREE.CanvasTexture {
  if (cachedArduinoSilkTexture) return cachedArduinoSilkTexture;
  if (typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background Arduino classic teal solder mask
  ctx.fillStyle = "#00787d";
  ctx.fillRect(0, 0, 2048, 1600);

  // Copper ground plane fills & trace contours
  ctx.fillStyle = "rgba(0, 85, 88, 0.5)";
  ctx.fillRect(60, 60, 1928, 1480);

  // Silkscreen Outer Border Line (White)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 12;
  ctx.strokeRect(36, 36, 1976, 1528);

  // Corner Mounting Holes with Solder Rings
  const holes = [
    { x: 380, y: 150 },
    { x: 1950, y: 390 },
    { x: 1950, y: 1380 },
    { x: 450, y: 1470 },
  ];
  holes.forEach((h) => {
    ctx.fillStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.arc(h.x, h.y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#090d16";
    ctx.beginPath();
    ctx.arc(h.x, h.y, 28, 0, Math.PI * 2);
    ctx.fill();
  });

  // ================= TOP HEADER MARKINGS (D0 - D13, GND, AREF) =================
  // Header Housing Guide Border
  ctx.fillStyle = "#090d16";
  ctx.fillRect(230, 40, 1640, 140);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 5;
  ctx.strokeRect(230, 40, 1640, 140);

  // Title Banner
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("◄ DIGITAL IO (PWM ~) ►", 1050, 240);

  // Digital Pins mapping: u = ((x + 3.4) / 6.8) * 2048
  const topPins = [
    { label: "AREF", x: -2.4, isPwm: false, color: "#94a3b8" },
    { label: "GND", x: -2.1, isPwm: false, color: "#38bdf8" },
    { label: "D13", x: -1.8, isPwm: false, color: "#fbbf24" },
    { label: "D12", x: -1.5, isPwm: false, color: "#ffffff" },
    { label: "~D11", x: -1.2, isPwm: true, color: "#38bdf8" },
    { label: "~D10", x: -0.9, isPwm: true, color: "#38bdf8" },
    { label: "~D9", x: -0.6, isPwm: true, color: "#38bdf8" },
    { label: "D8", x: -0.3, isPwm: false, color: "#ffffff" },
    { label: "D7", x: 0.2, isPwm: false, color: "#ffffff" },
    { label: "~D6", x: 0.5, isPwm: true, color: "#38bdf8" },
    { label: "~D5", x: 0.8, isPwm: true, color: "#38bdf8" },
    { label: "D4", x: 1.1, isPwm: false, color: "#ffffff" },
    { label: "~D3", x: 1.4, isPwm: true, color: "#38bdf8" },
    { label: "D2", x: 1.7, isPwm: false, color: "#ffffff" },
    { label: "D1", x: 2.0, isPwm: false, color: "#ffffff" },
    { label: "D0", x: 2.3, isPwm: false, color: "#ffffff" },
  ];

  topPins.forEach((p) => {
    const u = ((p.x + 3.4) / 6.8) * 2048;

    // Distinct Socket Cavity Box
    ctx.fillStyle = "#05070a";
    ctx.fillRect(u - 20, 60, 40, 95);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.strokeRect(u - 20, 60, 40, 95);

    // Inner Gold/Brass Pin Contact
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(u - 9, 85, 18, 45);

    // Indicator Tick Line
    ctx.strokeStyle = p.isPwm ? "#38bdf8" : "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(u, 175);
    ctx.lineTo(u, 280);
    ctx.stroke();

    // High-contrast Badge Background for instant readability
    ctx.fillStyle = "#030712";
    ctx.fillRect(u - 42, 290, 84, 56);
    ctx.strokeStyle = p.isPwm ? "#38bdf8" : "#64748b";
    ctx.lineWidth = 3;
    ctx.strokeRect(u - 42, 290, 84, 56);

    // Bold High-Contrast Text Label (D13, D12, ... D0)
    ctx.fillStyle = p.color || (p.isPwm ? "#38bdf8" : "#ffffff");
    ctx.font = "bold 44px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.label, u, 332);
  });

  // ================= BOTTOM HEADER MARKINGS (POWER & ANALOG) =================
  ctx.fillStyle = "#090d16";
  ctx.fillRect(350, 1420, 1500, 140);
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 5;
  ctx.strokeRect(350, 1420, 1500, 140);

  // Power & Analog Banners
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("◄ POWER ►", 630, 1340);
  ctx.fillText("◄ ANALOG IN ►", 1460, 1340);

  const bottomPins = [
    { label: "IOREF", x: -2.1, color: "#fbbf24" },
    { label: "RESET", x: -1.8, color: "#f87171" },
    { label: "3.3V", x: -1.5, color: "#fbbf24" },
    { label: "5V", x: -1.2, color: "#ef4444" },
    { label: "GND", x: -0.9, color: "#38bdf8" },
    { label: "GND", x: -0.6, color: "#38bdf8" },
    { label: "VIN", x: -0.3, color: "#f97316" },
    { label: "A0", x: 0.5, color: "#34d399" },
    { label: "A1", x: 0.8, color: "#34d399" },
    { label: "A2", x: 1.1, color: "#34d399" },
    { label: "A3", x: 1.4, color: "#34d399" },
    { label: "A4", x: 1.7, color: "#34d399" },
    { label: "A5", x: 2.0, color: "#34d399" },
  ];

  bottomPins.forEach((p) => {
    const u = ((p.x + 3.4) / 6.8) * 2048;

    // Socket Cavity Box
    ctx.fillStyle = "#05070a";
    ctx.fillRect(u - 20, 1445, 40, 95);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.strokeRect(u - 20, 1445, 40, 95);

    // Inner Gold/Brass Pin Contact
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(u - 9, 1470, 18, 45);

    // Indicator Tick Line
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(u, 1420);
    ctx.lineTo(u, 1320);
    ctx.stroke();

    // High-contrast Badge Background
    ctx.fillStyle = "#030712";
    ctx.fillRect(u - 46, 1235, 92, 56);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(u - 46, 1235, 92, 56);

    // Text Label above bottom header
    ctx.fillStyle = p.color;
    ctx.font = "bold 44px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.label, u, 1277);
  });

  // Central Branding & Markings
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 110px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("ARDUINO", 580, 680);
  ctx.font = "800 76px 'JetBrains Mono', monospace";
  ctx.fillText("UNO", 580, 770);

  ctx.font = "bold 32px 'JetBrains Mono', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("MADE IN ITALY", 580, 830);

  // Microcontroller Silkscreen Outline
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.strokeRect(960, 890, 860, 260);
  ctx.font = "bold 42px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("ATmega328P-PU", 1020, 1020);

  cachedArduinoSilkTexture = new THREE.CanvasTexture(canvas);
  cachedArduinoSilkTexture.anisotropy = 8;
  return cachedArduinoSilkTexture;
}

// 1. Arduino Uno R3
function buildArduinoUnoMesh(group: THREE.Group, _comp: PlacedComponent, state: any) {
  // Main PCB with Arduino Teal Solder Mask
  const pcbGeo = new THREE.BoxGeometry(6.8, 0.3, 5.3);
  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x005c5f,
    roughness: 0.35,
    metalness: 0.12,
  });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.15;
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  group.add(pcb);

  // High-Resolution Top Silkscreen with Razor-Sharp Pin Numbers (D0 - D13, A0 - A5, 5V, GND)
  const silkGeo = new THREE.PlaneGeometry(6.8, 5.3);
  const silkMat = new THREE.MeshStandardMaterial({
    map: getArduinoUnoPcbTexture(),
    roughness: 0.4,
    metalness: 0.1,
  });
  const silk = new THREE.Mesh(silkGeo, silkMat);
  silk.rotation.x = -Math.PI / 2;
  silk.position.y = 0.305;
  group.add(silk);

  // ATmega328P DIP-28 IC Socket & Package
  const socketGeo = new THREE.BoxGeometry(3.6, 0.2, 1.1);
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.9 });
  const socket = new THREE.Mesh(socketGeo, socketMat);
  socket.position.set(0.5, 0.25, 0.6);
  group.add(socket);

  const chipGeo = new THREE.BoxGeometry(3.4, 0.28, 0.95);
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.08 });
  const chip = new THREE.Mesh(chipGeo, chipMat);
  chip.position.set(0.5, 0.42, 0.6);
  group.add(chip);

  // ATmega328P DIP-28 Metallic Pins (14 per side)
  const icPinMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.16 });
  const icPinGeo = new THREE.BoxGeometry(0.08, 0.22, 0.14);
  for (let i = 0; i < 14; i++) {
    const px = -1.0 + i * 0.23;
    const pTop = new THREE.Mesh(icPinGeo, icPinMat);
    pTop.position.set(px, 0.36, 0.06);
    const pBot = new THREE.Mesh(icPinGeo, icPinMat);
    pBot.position.set(px, 0.36, 1.14);
    group.add(pTop, pBot);
  }

  // AMS1117-5.0 Linear Voltage Regulator (SOT-223 near Barrel Jack)
  const regBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.18, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 })
  );
  regBody.position.set(-1.55, 0.39, 1.55);
  const regTab = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.08, 0.24),
    icPinMat
  );
  regTab.position.set(-1.55, 0.35, 1.82);
  group.add(regBody, regTab);

  // Two Electrolytic Decoupling Capacitors next to power section
  const smdCapMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.2 });
  const smdCapTopMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  [-1.9, -1.35].forEach((cx) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.36, 16), smdCapMat);
    cap.position.set(cx, 0.48, 0.72);
    const capMark = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.06, 16, 1, false, 0, Math.PI), smdCapTopMat);
    capMark.position.set(cx, 0.64, 0.72);
    group.add(cap, capMark);
  });

  // ATmega328P Pin 1 Notch & Dimple
  const notchGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12, 1, false, 0, Math.PI);
  const notch = new THREE.Mesh(notchGeo, new THREE.MeshBasicMaterial({ color: 0x0f172a }));
  notch.position.set(-1.15, 0.56, 0.6);
  notch.rotation.y = Math.PI / 2;
  group.add(notch);

  // 16.000 MHz Crystal Oscillator (HC-49/S Silver Metal Can)
  const crystalGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.1, 16);
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.rotation.z = Math.PI / 2;
  crystal.position.set(-1.1, 0.42, 0.6);
  group.add(crystal);

  // USB Type-B Port (Shielded Metal Casing with Inner Tongue)
  const usbGeo = new THREE.BoxGeometry(1.4, 1.1, 1.2);
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.92, roughness: 0.18 });
  const usb = new THREE.Mesh(usbGeo, metalMat);
  usb.position.set(-2.8, 0.7, -1.8);
  usb.castShadow = true;
  group.add(usb);

  const usbInnerGeo = new THREE.BoxGeometry(0.2, 0.7, 0.8);
  const usbInnerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
  const usbInner = new THREE.Mesh(usbInnerGeo, usbInnerMat);
  usbInner.position.set(-3.45, 0.7, -1.8);
  group.add(usbInner);

  // DC Barrel Jack with Inner Conductor Center Pin
  const jackGeo = new THREE.BoxGeometry(1.5, 1.1, 1.0);
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 });
  const jack = new THREE.Mesh(jackGeo, blackMat);
  jack.position.set(-2.7, 0.7, 1.8);
  jack.castShadow = true;
  group.add(jack);

  const centerPin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
  );
  centerPin.rotation.z = Math.PI / 2;
  centerPin.position.set(-3.4, 0.7, 1.8);
  group.add(centerPin);

  // ICSP 2x3 Gold-Plated Header
  const icspMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8), icspMat);
      pin.position.set(2.6 + c * 0.25, 0.45, 0.4 + r * 0.25);
      group.add(pin);
    }
  }

  // Female Header Housings (Realistic black plastic strips with socket cavities)
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.65 });
  const goldContactMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 });

  // 1. Digital Top Header Left (10-pin: AREF, GND, D13 - D8)
  const dHeader10Geo = new THREE.BoxGeometry(2.7, 0.65, 0.38);
  const dHeader10 = new THREE.Mesh(dHeader10Geo, headerMat);
  dHeader10.position.set(-1.35, 0.5, -2.3);
  dHeader10.castShadow = true;
  group.add(dHeader10);

  // 2. Digital Top Header Right (8-pin: D7 - D0)
  const dHeader8Geo = new THREE.BoxGeometry(2.4, 0.65, 0.38);
  const dHeader8 = new THREE.Mesh(dHeader8Geo, headerMat);
  dHeader8.position.set(1.25, 0.5, -2.3);
  dHeader8.castShadow = true;
  group.add(dHeader8);

  // 3. Power Bottom Header (8-pin: IOREF - VIN)
  const pHeaderGeo = new THREE.BoxGeometry(2.4, 0.65, 0.38);
  const pHeader = new THREE.Mesh(pHeaderGeo, headerMat);
  pHeader.position.set(-1.2, 0.5, 2.3);
  pHeader.castShadow = true;
  group.add(pHeader);

  // 4. Analog Bottom Header (6-pin: A0 - A5)
  const aHeaderGeo = new THREE.BoxGeometry(1.8, 0.65, 0.38);
  const aHeader = new THREE.Mesh(aHeaderGeo, headerMat);
  aHeader.position.set(1.25, 0.5, 2.3);
  aHeader.castShadow = true;
  group.add(aHeader);

  // Built-in 'ON' LED (Emerald Green with Bloom)
  const onLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.1, 0.18),
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.9,
    })
  );
  onLed.position.set(-1.0, 0.35, -0.6);
  group.add(onLed);

  // Built-in 'L' LED (Pin 13) - Amber/Orange
  const isPin13Active = state.isPowered;
  const lLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.1, 0.18),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: isPin13Active ? 0xf59e0b : 0x000000,
      emissiveIntensity: isPin13Active ? 1.2 : 0.0,
    })
  );
  lLed.position.set(-0.6, 0.35, -0.6);
  group.add(lLed);

  // Reset button with tactile metal rim
  const btnBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.15, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 })
  );
  btnBase.position.set(-2.8, 0.35, -0.8);
  const resetBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
  );
  resetBtn.position.set(-2.8, 0.48, -0.8);
  group.add(btnBase, resetBtn);
}

// 2. ESP32 DevKit V1
function buildEsp32Mesh(group: THREE.Group, _comp: PlacedComponent, _state: any) {
  // Matte Black PCB
  const pcbGeo = new THREE.BoxGeometry(5.2, 0.2, 2.8);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.6 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.1;
  pcb.castShadow = true;
  pcb.receiveShadow = true;
  group.add(pcb);

  // Metal RF Shield Can (ESP-WROOM-32) with Laser Stamp
  const shieldGeo = new THREE.BoxGeometry(1.8, 0.25, 1.8);
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.92, roughness: 0.2 });
  const shield = new THREE.Mesh(shieldGeo, shieldMat);
  shield.position.set(0.6, 0.25, 0);
  shield.castShadow = true;
  group.add(shield);

  // PCB Meandered Inverted-F Antenna (Gold traces)
  const antGeo = new THREE.BoxGeometry(0.9, 0.05, 1.6);
  const antMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  const ant = new THREE.Mesh(antGeo, antMat);
  ant.position.set(2.0, 0.22, 0);
  group.add(ant);

  // Micro USB Port
  const usbGeo = new THREE.BoxGeometry(0.8, 0.4, 0.9);
  const usb = new THREE.Mesh(usbGeo, shieldMat);
  usb.position.set(-2.4, 0.3, 0);
  group.add(usb);

  // Dual pin headers
  const headerGeo = new THREE.BoxGeometry(4.6, 0.4, 0.25);
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
  const topH = new THREE.Mesh(headerGeo, headerMat);
  topH.position.set(0, 0.3, -1.2);
  const botH = new THREE.Mesh(headerGeo, headerMat);
  botH.position.set(0, 0.3, 1.2);
  group.add(topH, botH);
}

let cachedBreadboardTexture: THREE.CanvasTexture | null = null;

function getBreadboardTopTexture(): THREE.CanvasTexture {
  if (cachedBreadboardTexture) return cachedBreadboardTexture;
  if (typeof document === "undefined") {
    return new THREE.Texture() as THREE.CanvasTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 1024, 640);

  // Top & Bottom red (+) and blue (-) distribution stripes
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(60, 42, 904, 10);
  ctx.fillRect(60, 588, 904, 10);
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(60, 108, 904, 10);
  ctx.fillRect(60, 522, 904, 10);

  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ef4444";
  ctx.fillText("+", 34, 48);
  ctx.fillText("+", 34, 594);
  ctx.fillStyle = "#2563eb";
  ctx.fillText("−", 34, 114);
  ctx.fillText("−", 34, 528);

  // Center DIP channel
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(50, 298, 924, 44);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 298, 924, 44);

  // Row letters (A-E, F-J)
  ctx.fillStyle = "#64748b";
  ctx.font = "bold 18px monospace";
  ["A", "B", "C", "D", "E"].forEach((l, i) => ctx.fillText(l, 32, 165 + i * 28));
  ["F", "G", "H", "I", "J"].forEach((l, i) => ctx.fillText(l, 32, 368 + i * 28));

  // Column numbers
  [1, 5, 10, 15, 20, 25, 30].forEach((col) => {
    const x = 68 + ((col - 1) / 29) * 888;
    ctx.fillText(String(col), x, 138);
    ctx.fillText(String(col), x, 502);
  });

  // Realistic 30-column contact cavities
  for (let c = 0; c < 30; c++) {
    const x = 68 + (c / 29) * 888;
    // Main Tie Points
    for (let r = 0; r < 5; r++) {
      const yTop = 165 + r * 28;
      const yBot = 368 + r * 28;
      [yTop, yBot].forEach((y) => {
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(x - 6, y - 6, 12, 12);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x - 4, y - 4, 8, 8);
      });
    }
    // Power rail groups of 5
    if (c % 6 !== 5) {
      [78, 558].forEach((y) => {
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(x - 6, y - 6, 12, 12);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x - 4, y - 4, 8, 8);
      });
    }
  }

  cachedBreadboardTexture = new THREE.CanvasTexture(canvas);
  cachedBreadboardTexture.colorSpace = THREE.SRGBColorSpace;
  cachedBreadboardTexture.anisotropy = 4;
  return cachedBreadboardTexture;
}

// 3. Half-Size Solderless Breadboard
function buildBreadboardMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Off-white ABS plastic base with crisp printed top face
  const baseGeo = new THREE.BoxGeometry(8.6, 0.7, 5.6);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6, metalness: 0.04 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.35;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const topFace = new THREE.Mesh(
    new THREE.PlaneGeometry(8.52, 5.52),
    new THREE.MeshStandardMaterial({ map: getBreadboardTopTexture(), roughness: 0.55, metalness: 0.05 })
  );
  topFace.rotation.x = -Math.PI / 2;
  topFace.position.y = 0.706;
  topFace.receiveShadow = true;
  group.add(topFace);

  // Recessed center division trench for DIP IC clearance
  const grooveGeo = new THREE.BoxGeometry(7.9, 0.14, 0.42);
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.75 });
  const groove = new THREE.Mesh(grooveGeo, grooveMat);
  groove.position.set(0, 0.66, 0);
  group.add(groove);

  // Side interlocking dovetail tabs
  const tabGeo = new THREE.BoxGeometry(0.18, 0.45, 0.75);
  [-1.6, 1.6].forEach((z) => {
    const tab = new THREE.Mesh(tabGeo, baseMat);
    tab.position.set(4.36, 0.28, z);
    group.add(tab);
  });
}

let cachedLedFloorGlowTexture: THREE.CanvasTexture | null = null;
function getLedFloorGlowTexture(): THREE.CanvasTexture {
  if (cachedLedFloorGlowTexture) return cachedLedFloorGlowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.75)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.22)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  cachedLedFloorGlowTexture = new THREE.CanvasTexture(canvas);
  return cachedLedFloorGlowTexture;
}

// 4. 5mm Through-Hole LED (Optical Epoxy Clearcoat with Internal Leadframe & Emitter Die)
function buildLedMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  const colorStr = comp.params?.color || "red";
  const colorMap: Record<string, number> = {
    red: 0xef4444,
    green: 0x22c55e,
    blue: 0x3b82f6,
    yellow: 0xeab308,
    amber: 0xf97316,
    white: 0xf8fafc,
  };
  const baseColor = colorMap[colorStr] || 0xef4444;

  const isBlown = Boolean(state.isBlown);
  const rawBrightness =
    state.isPowered && !isBlown
      ? typeof state.activeValue === "number"
        ? Math.max(0, Math.min(1, state.activeValue))
        : 1.0
      : 0.0;
  const isGlowing = rawBrightness > 0.01 && !isBlown;
  const brightness = isGlowing ? Math.max(0.12, rawBrightness) : 0;

  const offColor = new THREE.Color(baseColor).multiplyScalar(0.32);
  const onColor = new THREE.Color(baseColor).lerp(new THREE.Color(0xffffff), 0.35 * brightness);

  // High-Grade Optical Epoxy Lens Material with dramatic OFF vs ON contrast
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: isBlown ? 0x18181b : isGlowing ? onColor : offColor,
    roughness: isGlowing ? 0.06 : 0.25,
    metalness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity: isBlown ? 0.94 : isGlowing ? 0.94 : 0.56,
    emissive: isGlowing ? baseColor : 0x000000,
    emissiveIntensity: isGlowing ? 1.5 + 4.0 * brightness : 0.0,
  });

  group.userData.ledBaseColor = baseColor;

  const cylinderGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.8, 24);
  const cylinder = new THREE.Mesh(cylinderGeo, domeMat);
  cylinder.name = "led-dome";
  cylinder.position.y = 1.25;
  cylinder.castShadow = true;
  group.add(cylinder);

  const domeGeo = new THREE.SphereGeometry(0.36, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.name = "led-cap";
  dome.position.y = 1.65;
  group.add(dome);

  // Base rim flange with flat cathode side notch
  const rimGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 24, 1, false, 0, Math.PI * 1.85);
  const rim = new THREE.Mesh(rimGeo, domeMat);
  rim.name = "led-rim";
  rim.position.y = 0.85;
  rim.rotation.y = Math.PI * 0.55;
  group.add(rim);

  // Internal Leadframe (Cathode Anvil Cup, Anode Post & Semiconductor Die)
  const anvilMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
  const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.08), anvilMat);
  anvil.position.set(-0.09, 1.2, 0);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8), anvilMat);
  post.position.set(0.09, 1.15, 0);
  const die = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.08, 0.11),
    new THREE.MeshStandardMaterial({
      color: isGlowing ? 0xffffff : 0x475569,
      emissive: isGlowing ? 0xffffff : 0x000000,
      emissiveIntensity: isGlowing ? 2.5 + 5.0 * brightness : 0.0,
    })
  );
  die.name = "led-die";
  die.position.set(-0.05, 1.38, 0);
  group.add(anvil, post, die);

  // Metal lead pins (anode longer, cathode shorter)
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.14 });
  const anodeLead = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.82, 8), leadMat);
  anodeLead.position.set(0.2, 0.45, 0);
  const cathodeLead = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.72, 8), leadMat);
  cathodeLead.position.set(-0.2, 0.5, 0);
  group.add(anodeLead, cathodeLead);

  // Volumetric Dual-Layer Additive Glow Halo, Floor Spill & Dynamic Point Light when illuminated
  if (isGlowing) {
    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55 * brightness,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    innerCore.position.set(0, 1.48, 0);
    group.add(innerCore);

    const haloInner = new THREE.Mesh(
      new THREE.SphereGeometry(0.62 * (0.75 + 0.35 * brightness), 20, 20),
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.48 * brightness,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    haloInner.position.set(0, 1.48, 0);
    group.add(haloInner);

    const haloOuter = new THREE.Mesh(
      new THREE.SphereGeometry(1.18 * (0.7 + 0.5 * brightness), 20, 20),
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.22 * brightness,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    haloOuter.position.set(0, 1.48, 0);
    group.add(haloOuter);

    const floorPool = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6 * (0.65 + 0.55 * brightness), 3.6 * (0.65 + 0.55 * brightness)),
      new THREE.MeshBasicMaterial({
        map: getLedFloorGlowTexture(),
        color: baseColor,
        transparent: true,
        opacity: 0.52 * brightness,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    floorPool.rotation.x = -Math.PI / 2;
    floorPool.position.set(0, 0.04, 0);
    group.add(floorPool);

    const pointLight = new THREE.PointLight(baseColor, 4.8 * brightness, 12, 1.3);
    pointLight.position.set(0, 2.0, 0);
    group.add(pointLight);
  }

  // Smoked burned core (always attached so 3D burnout animation can toggle visibility smoothly)
  const charGeo = new THREE.SphereGeometry(0.28, 12, 12);
  const charMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const charMesh = new THREE.Mesh(charGeo, charMat);
  charMesh.name = "led-burn-char";
  charMesh.position.set(0, 1.45, 0);
  charMesh.visible = isBlown;
  group.add(charMesh);
}

// 5. Axial Resistor (Authentic Contoured Ceramic Body with Smooth Bent Tinned Leads)
function buildResistorMesh(group: THREE.Group, comp: PlacedComponent) {
  // Ceramic Main Body (Glossy Enamel Lacquer)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.28, 24);
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6d5b8,
    roughness: 0.25,
    metalness: 0.05,
    clearcoat: 0.65,
    clearcoatRoughness: 0.2,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.45;
  body.castShadow = true;
  group.add(body);

  // Smooth Rounded Bulging End Caps (Dog-bone shoulders)
  const capGeo = new THREE.CylinderGeometry(0.29, 0.25, 0.22, 24);
  const endCapL = new THREE.Mesh(capGeo, bodyMat);
  endCapL.rotation.z = Math.PI / 2;
  endCapL.position.set(-0.64, 0.45, 0);
  const endCapR = new THREE.Mesh(capGeo, bodyMat);
  endCapR.rotation.z = -Math.PI / 2;
  endCapR.position.set(0.64, 0.45, 0);
  const domeL = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), bodyMat);
  domeL.scale.set(0.65, 1, 1);
  domeL.position.set(-0.74, 0.45, 0);
  const domeR = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), bodyMat);
  domeR.scale.set(0.65, 1, 1);
  domeR.position.set(0.74, 0.45, 0);
  group.add(endCapL, endCapR, domeL, domeR);

  // Color bands based on resistance value (4-band standard)
  const ohms = Number(comp.params?.resistance || 220);
  const ohmsStr = ohms.toString();
  const digit1 = parseInt(ohmsStr[0]) || 2;
  const digit2 = parseInt(ohmsStr[1]) || 2;
  const multiplier = Math.max(0, ohmsStr.length - 2);

  const bandColors = [
    RESISTOR_BAND_COLORS[digit1] ?? 0xff0000,
    RESISTOR_BAND_COLORS[digit2] ?? 0xff0000,
    RESISTOR_BAND_COLORS[multiplier] ?? 0x8b4513,
  ];

  const bandGeo = new THREE.CylinderGeometry(0.252, 0.252, 0.12, 24);
  const bandPositions = [-0.4, -0.16, 0.12];

  bandColors.forEach((color, i) => {
    const bandMesh = new THREE.Mesh(
      bandGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.08 })
    );
    bandMesh.rotation.z = Math.PI / 2;
    bandMesh.position.set(bandPositions[i], 0.45, 0);
    group.add(bandMesh);
  });

  // Metallic Gold 5% Tolerance Band
  const goldBandMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.92, roughness: 0.18 });
  const goldBand = new THREE.Mesh(bandGeo, goldBandMat);
  goldBand.rotation.z = Math.PI / 2;
  goldBand.position.set(0.42, 0.45, 0);
  group.add(goldBand);

  // Smooth Curved Continuous Tinned Copper Wire Leads (left & right)
  const leadMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.14 });
  [-1, 1].forEach((dir) => {
    const leadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(dir * 0.78, 0.45, 0),
      new THREE.Vector3(dir * 1.32, 0.45, 0),
      new THREE.Vector3(dir * 1.48, 0.36, 0),
      new THREE.Vector3(dir * 1.5, 0.08, 0),
    ]);
    const leadMesh = new THREE.Mesh(new THREE.TubeGeometry(leadCurve, 12, 0.045, 8, false), leadMat);
    leadMesh.castShadow = true;
    group.add(leadMesh);
  });
}

// 6. Tactile Pushbutton (6x6mm Metal Dome Switch)
function buildPushbuttonMesh(group: THREE.Group, comp: PlacedComponent, _state: any) {
  // Square base housing
  const baseGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.25;
  base.castShadow = true;
  group.add(base);

  // Metal top bracket plate with corner rivets
  const plateGeo = new THREE.BoxGeometry(1.22, 0.06, 1.22);
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.52;
  group.add(plate);

  const rivetMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.35 });
  [
    [-0.48, -0.48],
    [0.48, -0.48],
    [-0.48, 0.48],
    [0.48, 0.48],
  ].forEach(([rx, rz]) => {
    const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), rivetMat);
    rivet.position.set(rx, 0.55, rz);
    group.add(rivet);
  });

  // Raised bezel collar
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.38, 0.08, 20),
    new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 })
  );
  collar.position.y = 0.56;
  group.add(collar);

  // 4 Metallic gullwing terminal pins
  const legMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.16 });
  [
    [-0.72, -0.35],
    [-0.72, 0.35],
    [0.72, -0.35],
    [0.72, 0.35],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.12), legMat);
    leg.position.set(lx, 0.12, lz);
    group.add(leg);
  });

  // Center tactile actuator plunger (depresses slightly when pressed)
  const isPressed = comp.params?.isPressed;
  const plungerGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.36, 20);
  const plungerMat = new THREE.MeshStandardMaterial({
    color: isPressed ? 0x0284c7 : 0x09090b,
    roughness: 0.35,
  });
  const plunger = new THREE.Mesh(plungerGeo, plungerMat);
  plunger.position.y = isPressed ? 0.58 : 0.68;
  group.add(plunger);
}

// 7. SG90 Micro Servo Motor
function buildServoMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  // Translucent dark-blue plastic casing with side mounting tabs
  const caseGeo = new THREE.BoxGeometry(2.3, 2.4, 1.2);
  const caseMat = new THREE.MeshPhysicalMaterial({
    color: 0x1d4ed8,
    roughness: 0.25,
    clearcoat: 0.6,
    transparent: true,
    opacity: 0.92,
  });
  const body = new THREE.Mesh(caseGeo, caseMat);
  body.position.y = 1.2;
  body.castShadow = true;
  group.add(body);

  const ears = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 1.2), caseMat);
  ears.position.set(0, 1.85, 0);
  group.add(ears);

  // Top gear output hub
  const hubGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.position.set(-0.4, 2.55, 0);
  group.add(hub);

  // Rotating Horn / Arm (Rotates dynamically to servoAngle!)
  const angleDeg = state.servoAngle ?? comp.params?.angleDeg ?? 90;
  const hornGroup = new THREE.Group();
  hornGroup.position.set(-0.4, 2.7, 0);
  hornGroup.rotation.y = (angleDeg * Math.PI) / 180;

  const armGeo = new THREE.BoxGeometry(1.6, 0.1, 0.35);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const arm = new THREE.Mesh(armGeo, armMat);
  arm.position.x = 0.6;
  hornGroup.add(arm);
  group.add(hornGroup);
}

// 8. DC Motor with cooling vents, endbell & dual-blade propeller
function buildDcMotorMesh(group: THREE.Group, _comp: PlacedComponent, state: any) {
  // Brushed steel motor can
  const canGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.75, 24);
  const canMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.24 });
  const can = new THREE.Mesh(canGeo, canMat);
  can.position.y = 1.05;
  can.castShadow = true;
  group.add(can);

  // Black nylon lower endbell cap
  const endbell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.88, 0.36, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 })
  );
  endbell.position.y = 0.18;
  group.add(endbell);

  // Brass top shaft bearing bushing
  const bushing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
  );
  bushing.position.y = 1.98;
  group.add(bushing);

  // Rotating axle & dual-blade propeller
  const rotorGroup = new THREE.Group();
  rotorGroup.position.y = 2.05;

  const shaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12);
  const shaft = new THREE.Mesh(shaftGeo, canMat);
  rotorGroup.add(shaft);

  const hubSpinner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.26, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
  );
  hubSpinner.position.y = 0.32;
  rotorGroup.add(hubSpinner);

  // Propeller blades (Blue)
  const isSpinning = state.isPowered;
  const propMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.25, metalness: 0.1 });
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.38), propMat);
  blade1.position.set(0.65, 0.32, 0);
  blade1.rotation.x = 0.18;
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.38), propMat);
  blade2.position.set(-0.65, 0.32, 0);
  blade2.rotation.x = -0.18;
  rotorGroup.add(blade1, blade2);

  if (isSpinning) {
    rotorGroup.rotation.y = Date.now() * 0.02;
  }
  group.add(rotorGroup);
}

// 9. HC-SR04 Ultrasonic Sensor
function buildUltrasonicMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Blue sensor board
  const boardGeo = new THREE.BoxGeometry(4.5, 2.0, 0.2);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.y = 1.0;
  group.add(board);

  // Dual ultrasound transmitter & receiver cylinders
  const hornGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.8, 16);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.8, roughness: 0.2 });

  const hornT = new THREE.Mesh(hornGeo, hornMat);
  hornT.rotation.x = Math.PI / 2;
  hornT.position.set(-1.2, 1.0, 0.4);

  const hornR = new THREE.Mesh(hornGeo, hornMat);
  hornR.rotation.x = Math.PI / 2;
  hornR.position.set(1.2, 1.0, 0.4);

  group.add(hornT, hornR);
}

// 10. LCD 1602 Display (I2C)
function buildLcdMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  // Main green PCB
  const pcbGeo = new THREE.BoxGeometry(8.0, 3.6, 0.2);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 1.8;
  group.add(pcb);

  // Bezel frame
  const bezelGeo = new THREE.BoxGeometry(7.0, 2.4, 0.3);
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.set(0, 1.8, 0.15);
  group.add(bezel);

  // Blue LCD screen
  const isLit = state.isPowered;
  const screenGeo = new THREE.BoxGeometry(6.4, 1.8, 0.05);
  const screenMat = new THREE.MeshStandardMaterial({
    color: isLit ? 0x1d4ed8 : 0x0f172a,
    emissive: isLit ? 0x1e40af : 0x000000,
    emissiveIntensity: isLit ? 0.7 : 0.0,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 1.8, 0.32);
  group.add(screen);
}

// Helper: Generate realistic CanvasTexture for 9V Battery Front Label with prominent Polarity
function getBatteryFrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Matte dark casing (Zinc-Carbon / Alkaline industrial housing)
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 512, 512);

  // Copper / Brass metallic upper shoulder band (authentic industrial look)
  const copperGrad = ctx.createLinearGradient(0, 0, 512, 0);
  copperGrad.addColorStop(0, "#9a3412");
  copperGrad.addColorStop(0.3, "#d97706");
  copperGrad.addColorStop(0.7, "#f59e0b");
  copperGrad.addColorStop(1, "#b45309");
  ctx.fillStyle = copperGrad;
  ctx.fillRect(0, 0, 512, 110);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PROCELL 9V", 256, 48);
  ctx.font = "600 17px monospace";
  ctx.fillText("6F22 INDUSTRIAL ALKALINE", 256, 82);

  // Central 9V Block
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px sans-serif";
  ctx.fillText("9 VOLT", 256, 185);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 16px sans-serif";
  ctx.fillText("HEAVY DUTY POWER CELL", 256, 220);

  // High-contrast Polarity Header Bar
  // Left Column (directly below POSITIVE + terminal): Solid Red with clear symbols
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.roundRect(32, 245, 204, 185, 14);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 84px monospace";
  ctx.fillText("+", 134, 325);
  ctx.font = "900 24px sans-serif";
  ctx.fillText("ПЛЮС (+)", 134, 368);
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("▲ ВЫХОД ТОКА", 134, 400);

  // Right Column (directly below NEGATIVE - terminal): Solid Slate with clear symbols
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(276, 245, 204, 185, 14);
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 90px monospace";
  ctx.fillText("—", 378, 325);
  ctx.font = "900 24px sans-serif";
  ctx.fillText("МИНУС (-)", 378, 368);
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("▲ ЗЕМЛЯ (GND)", 378, 400);

  // Bottom technical footer
  ctx.fillStyle = "#64748b";
  ctx.font = "14px monospace";
  ctx.fillText("0.0% Hg • 9.0V DC • CONNECT (+) TO RESISTOR", 256, 475);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// Helper: Realistic 9V Battery Top Cap Texture with stamped + and -
function getBatteryTopTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 180;
  const ctx = canvas.getContext("2d")!;

  // Black textured plastic cap
  ctx.fillStyle = "#18181b";
  ctx.fillRect(0, 0, 256, 180);

  // Left side (+) - Bright Red Circle Pad with bold '+'
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(64, 90, 46, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px monospace";
  ctx.textAlign = "center";
  ctx.fillText("+", 64, 107);

  // Right side (-) - Dark Blue/Slate Circle Pad with bold '—'
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.arc(192, 90, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px monospace";
  ctx.fillText("—", 192, 105);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 11. 9V Battery (Realistic Industrial Finish with Clear Physical Polarity)
function buildBatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Battery rectangular body (Matte industrial casing)
  const bodyGeo = new THREE.BoxGeometry(2.6, 4.8, 1.75);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.45,
    metalness: 0.15,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 2.4;
  body.castShadow = true;
  group.add(body);

  // Copper/Gold upper jacket band (authentic Duracell/GP style)
  const copperBandGeo = new THREE.BoxGeometry(2.62, 1.35, 1.77);
  const copperBandMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.75,
    roughness: 0.35,
  });
  const copperBand = new THREE.Mesh(copperBandGeo, copperBandMat);
  copperBand.position.y = 4.0;
  group.add(copperBand);

  // Front Label with realistic high-contrast markings
  const labelGeo = new THREE.PlaneGeometry(2.55, 4.65);
  const frontMat = new THREE.MeshBasicMaterial({
    map: getBatteryFrontTexture(),
    side: THREE.FrontSide,
  });
  const frontLabel = new THREE.Mesh(labelGeo, frontMat);
  frontLabel.position.set(0, 2.4, 0.89);
  group.add(frontLabel);

  // Duplicate Back Label so markings are visible from reverse angle
  const backLabel = new THREE.Mesh(labelGeo, frontMat);
  backLabel.rotation.y = Math.PI;
  backLabel.position.set(0, 2.4, -0.89);
  group.add(backLabel);

  // Top Surface Black Plastic Cap with stamped + and -
  const topGeo = new THREE.PlaneGeometry(2.5, 1.68);
  const topMat = new THREE.MeshBasicMaterial({
    map: getBatteryTopTexture(),
    side: THREE.FrontSide,
  });
  const topPlate = new THREE.Mesh(topGeo, topMat);
  topPlate.rotation.x = -Math.PI / 2;
  topPlate.position.set(0, 4.81, 0);
  group.add(topPlate);

  const termMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });

  // ================= POSITIVE TERMINAL (Left, x = -0.6) =================
  // Prominent Red Insulator Ring Collar under male stud
  const posCollarGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.1, 24);
  const posCollarMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.25,
  });
  const posCollar = new THREE.Mesh(posCollarGeo, posCollarMat);
  posCollar.position.set(-0.6, 4.86, 0);

  // Octagonal Nickel-Plated Steel Male Stud
  const posStud = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.35, 12), termMat);
  posStud.position.set(-0.6, 5.03, 0);

  group.add(posCollar, posStud);

  // ================= NEGATIVE TERMINAL (Right, x = +0.6) =================
  // Dark Insulator Ring Collar under female socket
  const negCollarGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.1, 24);
  const negCollarMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
  });
  const negCollar = new THREE.Mesh(negCollarGeo, negCollarMat);
  negCollar.position.set(0.6, 4.86, 0);

  // Hexagonal Nickel-Plated Steel Female Snap Socket
  const negSnap = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.35, 6), termMat);
  negSnap.position.set(0.6, 5.03, 0);

  // Receptacle hole in snap socket
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.36, 8),
    new THREE.MeshBasicMaterial({ color: 0x09090b })
  );
  hole.position.set(0.6, 5.04, 0);

  group.add(negCollar, negSnap, hole);
}

// 12. 10k Rotary Potentiometer (Brushed Canister, Hex Nut, Knurled Knob & 3 Brass Lugs)
function buildPotentiometerMesh(group: THREE.Group, comp: PlacedComponent) {
  const canMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.25 });
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.56, 24), canMat);
  can.position.y = 0.28;
  can.castShadow = true;
  group.add(can);

  // Dark phenolic terminal wafer
  const wafer = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.18, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
  );
  wafer.position.set(0, 0.16, 0.78);
  group.add(wafer);

  // 3 Brass solder terminals
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.2 });
  [-0.42, 0, 0.42].forEach((tx) => {
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.38), brassMat);
    lug.position.set(tx, 0.14, 1.02);
    group.add(lug);
  });

  // Hex mounting nut + threaded collar
  const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.14, 6), canMat);
  nut.position.y = 0.62;
  group.add(nut);

  // Rotating knurled dial knob rotated to valuePct
  const valuePct = comp.params?.valuePct ?? 50;
  const knobAngle = ((-135 + (valuePct / 100) * 270) * Math.PI) / 180;
  const knobGroup = new THREE.Group();
  knobGroup.position.y = 1.05;
  knobGroup.rotation.y = -knobAngle;

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.58, 0.76, 24),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
  );
  knob.castShadow = true;
  knobGroup.add(knob);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  cap.position.y = 0.4;
  knobGroup.add(cap);

  const notch = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.44, 0.46),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  notch.position.set(0, 0.24, 0.25);
  knobGroup.add(notch);

  group.add(knobGroup);
}

// 13. TMP36 Temperature Sensor
function buildTempSensorMesh(group: THREE.Group, _comp: PlacedComponent) {
  // TO-92 plastic head
  const headGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.7, 16, 1, false, 0, Math.PI);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 0.5;
  group.add(head);

  // 3 wire pins
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
  [-0.3, 0, 0.3].forEach((x) => {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8), pinMat);
    pin.position.set(x, -0.15, 0);
    group.add(pin);
  });
}

// 14. Photoresistor LDR
function buildLdrMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Ceramic disc
  const discGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 16);
  const discMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = 0.3;
  group.add(disc);

  // Red CdS serpentine pattern
  const trackGeo = new THREE.TorusGeometry(0.25, 0.04, 4, 8);
  const trackMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
  const track = new THREE.Mesh(trackGeo, trackMat);
  track.rotation.x = Math.PI / 2;
  track.position.y = 0.38;
  group.add(track);
}

// 15. Li-Po Flat Battery & Multi-cell Pack with Balance Wire & XT60 Connector
function buildLipoBatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Silver Foil Heat-sealed Aluminum Pouch
  const pouchGeo = new THREE.BoxGeometry(4.8, 0.65, 6.8);
  const pouchMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.22,
  });
  const pouch = new THREE.Mesh(pouchGeo, pouchMat);
  pouch.position.y = 0.325;
  pouch.castShadow = true;

  // Blue PVC Shrink-wrap Perimeter Band
  const bandGeo = new THREE.BoxGeometry(4.84, 0.68, 5.0);
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.3,
  });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.position.y = 0.325;

  // High-contrast Warning and Rating Label
  const labelGeo = new THREE.PlaneGeometry(3.8, 4.4);
  const labelMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.rotation.x = -Math.PI / 2;
  label.position.y = 0.67;

  // XT60 Yellow Power Connector Block
  const xt60Geo = new THREE.BoxGeometry(0.8, 0.45, 1.1);
  const xt60Mat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35 });
  const xt60 = new THREE.Mesh(xt60Geo, xt60Mat);
  xt60.position.set(-1.0, 0.35, 3.8);

  // Red & Black High-Current Silicone Wires
  const redWireGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
  const redWireMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
  const redWire = new THREE.Mesh(redWireGeo, redWireMat);
  redWire.rotation.x = Math.PI / 2;
  redWire.position.set(-1.2, 0.35, 3.4);

  const blackWireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const blackWire = new THREE.Mesh(redWireGeo, blackWireMat);
  blackWire.rotation.x = Math.PI / 2;
  blackWire.position.set(-0.8, 0.35, 3.4);

  // White JST-XH Balance Connector with 4 tiny multi-colored wires
  const jstGeo = new THREE.BoxGeometry(0.5, 0.3, 0.7);
  const jstMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const jst = new THREE.Mesh(jstGeo, jstMat);
  jst.position.set(1.2, 0.3, 3.7);

  group.add(pouch, band, label, xt60, redWire, blackWire, jst);
}

// 15.1 High-Drain Li-ion 18650 Cylindrical Battery Cell (Realistic Engineering Finish)
function build18650BatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Main Cylinder: Authentic Emerald Green Heat-Shrink Sleeve
  const cellGeo = new THREE.CylinderGeometry(0.9, 0.9, 3.25, 32);
  const cellMat = new THREE.MeshStandardMaterial({
    color: 0x059669, // Samsung 25R emerald sleeve
    metalness: 0.15,
    roughness: 0.35,
  });
  const cell = new THREE.Mesh(cellGeo, cellMat);
  cell.rotation.z = Math.PI / 2;
  cell.position.y = 0.9;
  cell.castShadow = true;

  // Negative Flat Terminal Nickel Cap (Left side, x = -1.64)
  const negCapGeo = new THREE.CylinderGeometry(0.82, 0.82, 0.08, 32);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });
  const negCap = new THREE.Mesh(negCapGeo, metalMat);
  negCap.rotation.z = Math.PI / 2;
  negCap.position.set(-1.64, 0.9, 0);

  // Positive Terminal White/Red Insulator Washer Ring (Right side, x = 1.63)
  const ringGeo = new THREE.CylinderGeometry(0.84, 0.84, 0.04, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.4,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.z = Math.PI / 2;
  ring.position.set(1.63, 0.9, 0);

  // Positive Button Top Stud (Anode contact, x = 1.72)
  const posStudGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.16, 24);
  const posStud = new THREE.Mesh(posStudGeo, metalMat);
  posStud.rotation.z = Math.PI / 2;
  posStud.position.set(1.72, 0.9, 0);

  // Factory Printed Spec Code on cell sleeve (laser printed look)
  const codeCanvas = document.createElement("canvas");
  codeCanvas.width = 512;
  codeCanvas.height = 64;
  const cctx = codeCanvas.getContext("2d")!;
  cctx.fillStyle = "#059669";
  cctx.fillRect(0, 0, 512, 64);
  cctx.fillStyle = "#022c22";
  cctx.font = "bold 20px monospace";
  cctx.fillText("INR18650-25R 3.7V 2500mAh  [ - ] ──────── [ + ]", 20, 40);

  const codeTex = new THREE.CanvasTexture(codeCanvas);
  const stripeGeo = new THREE.CylinderGeometry(0.905, 0.905, 2.6, 32, 1, false, 0, Math.PI);
  const stripeMat = new THREE.MeshBasicMaterial({ map: codeTex, transparent: true });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.rotation.z = Math.PI / 2;
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, 0.9, 0);

  group.add(cell, negCap, ring, posStud, stripe);
}

// 16. USB-C Power Block (Breakout PCB + Metallic USB-C Receptacle + Power LED)
function buildUsbPowerMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.24, 1.9),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.15 })
  );
  pcb.position.y = 0.12;
  pcb.castShadow = true;
  group.add(pcb);

  // Stainless Steel USB Type-C Port Shell
  const shellMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.94, roughness: 0.16 });
  const port = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.44, 0.95), shellMat);
  port.position.set(0, 0.46, -0.42);
  port.castShadow = true;
  const cavity = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.24, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x020617 })
  );
  cavity.position.set(0, 0.46, -0.84);
  group.add(port, cavity);

  // Power regulator chip & emerald indicator LED
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.16, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
  );
  chip.position.set(0.45, 0.32, 0.35);
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.1, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.4 })
  );
  led.position.set(-0.75, 0.29, 0.35);
  group.add(chip, led);
}

// 17. Bench Power Supply
function buildBenchSupplyMesh(group: THREE.Group, _comp: PlacedComponent) {
  const caseGeo = new THREE.BoxGeometry(4.8, 3.8, 5.8);
  const caseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 });
  const casing = new THREE.Mesh(caseGeo, caseMat);
  casing.position.y = 1.9;

  const screenGeo = new THREE.BoxGeometry(2.5, 1.2, 0.1);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 2.5, 2.91);

  group.add(casing, screen);
}

// 18. Solar Panel
function buildSolarPanelMesh(group: THREE.Group, _comp: PlacedComponent) {
  const frameGeo = new THREE.BoxGeometry(7.8, 0.3, 5.8);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 0.15;

  const cellGeo = new THREE.PlaneGeometry(7.2, 5.2);
  const cellMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
  const cell = new THREE.Mesh(cellGeo, cellMat);
  cell.rotation.x = -Math.PI / 2;
  cell.position.y = 0.31;

  group.add(frame, cell);
}

// 19. Ceramic Disc Capacitor (Authentic Dipped Polymer Coating & "104" Marking)
function buildCeramicCapMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Orange-Tan Dipped Ceramic Disc
  const capGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.16, 24);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Burnt-orange / tan ceramic
    roughness: 0.38,
    metalness: 0.08,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.y = 0.55;
  cap.castShadow = true;
  group.add(cap);

  // Black laser marking dot & text plate
  const markGeo = new THREE.PlaneGeometry(0.3, 0.15);
  const markMat = new THREE.MeshBasicMaterial({ color: 0x451a03, side: THREE.DoubleSide });
  const mark = new THREE.Mesh(markGeo, markMat);
  mark.position.set(0, 0.55, 0.09);
  group.add(mark);

  // Tinned copper wire leads
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
  [-0.2, 0.2].forEach((x) => {
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), leadMat);
    lead.position.set(x, 0.25, 0);
    group.add(lead);
  });
}

// Helper: Realistic Electrolytic Capacitor Sleeve Texture
function getCapacitorSleeveTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Deep industrial blue PVC sleeve
  ctx.fillStyle = "#1e40af";
  ctx.fillRect(0, 0, 512, 256);

  // Negative Polarity Stripe (Runs directly down negative lead side)
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(20, 0, 75, 256);

  // High-contrast black minus signs along negative stripe
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 64px monospace";
  ctx.textAlign = "center";
  for (let y = 60; y < 256; y += 70) {
    ctx.fillText("—", 57, y);
  }

  // Capacitor Rating & Technical Silkscreen in crisp white
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("470 µF", 130, 80);
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("25V  105°C", 130, 130);

  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 18px monospace";
  ctx.fillText("POLARIZED • VENTED", 130, 180);
  ctx.fillText("CONNECT (—) TO GND", 130, 215);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// 20. Electrolytic Capacitor (Aluminum Can, PVC Shrink, Negative Stripe & Top Safety Vent)
function buildElectrolyticCapMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Main Cylindrical Body with printed sleeve texture
  const canGeo = new THREE.CylinderGeometry(0.62, 0.62, 1.8, 28);
  const canMat = new THREE.MeshStandardMaterial({
    map: getCapacitorSleeveTexture(),
    roughness: 0.35,
    metalness: 0.12,
  });
  const can = new THREE.Mesh(canGeo, canMat);
  can.position.y = 0.95;
  can.rotation.y = Math.PI * 0.85; // Align negative stripe with x = -0.25 negative lead
  can.castShadow = true;
  group.add(can);

  // Top Aluminum Metal Disc
  const topDiscGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 24);
  const topDiscMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.18 });
  const topDisc = new THREE.Mesh(topDiscGeo, topDiscMat);
  topDisc.position.y = 1.86;
  group.add(topDisc);

  // Top Safety Relief Vent Score Lines ('+' Cross stamped into aluminum)
  const ventGeo = new THREE.BoxGeometry(0.7, 0.02, 0.06);
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const vent1 = new THREE.Mesh(ventGeo, ventMat);
  vent1.position.y = 1.89;
  const vent2 = new THREE.Mesh(ventGeo, ventMat);
  vent2.position.y = 1.89;
  vent2.rotation.y = Math.PI / 2;
  group.add(vent1, vent2);

  // Top Anode (+) Red Indicator Dot above positive lead (x = +0.25)
  const posIndicatorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12);
  const posIndicatorMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
  const posIndicator = new THREE.Mesh(posIndicatorGeo, posIndicatorMat);
  posIndicator.position.set(0.25, 1.9, 0);
  group.add(posIndicator);

  // Two Axial Lead Pins extending down (Cathode shorter at -0.25, Anode longer at +0.25)
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.12 });
  const leadNeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), leadMat);
  leadNeg.position.set(-0.25, 0.1, 0);
  const leadPos = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), leadMat);
  leadPos.position.set(0.25, 0.18, 0);
  group.add(leadNeg, leadPos);
}

// Helper: Realistic DO-41 Diode Body Texture
function getDiodeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 256, 128);

  // Cathode Silver Stripe on the right side
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(195, 0, 36, 128);

  // Laser etched "1N4007" part number in silver
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("1N4007", 100, 72);

  // Directional diode symbol indicator
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 20px monospace";
  ctx.fillText("►|", 155, 71);

  // Anode (+) marker on left
  ctx.fillStyle = "#ef4444";
  ctx.font = "900 28px sans-serif";
  ctx.fillText("+", 28, 73);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// 21. Diode 1N4007 (DO-41 Molded Epoxy Case with Metallic Silver Cathode Band)
function buildDiodeMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Molded Matte Black Epoxy Cylinder with laser marking texture
  const bodyGeo = new THREE.CylinderGeometry(0.26, 0.26, 1.4, 24);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: getDiodeTexture(),
    roughness: 0.55,
    metalness: 0.15,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.z = Math.PI / 2;
  body.rotation.y = -Math.PI / 2;
  body.position.y = 0.35;
  body.castShadow = true;
  group.add(body);

  // Cathode Ring Band (Silver Metallic Sheen at x = +0.44)
  const bandGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.24, 20);
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.rotation.z = Math.PI / 2;
  band.position.set(0.44, 0.35, 0);
  group.add(band);

  // Axial Leads and bent legs (matching catalog pin terminals at x = -1.5 and x = +1.5)
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.12 });
  const lead1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), leadMat);
  lead1.rotation.z = Math.PI / 2;
  lead1.position.set(-1.1, 0.35, 0);
  const lead2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), leadMat);
  lead2.rotation.z = Math.PI / 2;
  lead2.position.set(1.1, 0.35, 0);

  const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), leadMat);
  leg1.position.set(-1.5, 0.18, 0);
  const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), leadMat);
  leg2.position.set(1.5, 0.18, 0);

  group.add(lead1, lead2, leg1, leg2);
}

// 22. TO-220 Package (MOSFET / LM7805 with Brushed Aluminum Tab & Mounting Hole)
function buildTo220Mesh(group: THREE.Group, comp: PlacedComponent) {
  // Metal Heatsink Tab (Brushed Aluminum / Nickel)
  const tabGeo = new THREE.BoxGeometry(1.02, 1.6, 0.14);
  const tabMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.22 });
  const tab = new THREE.Mesh(tabGeo, tabMat);
  tab.position.y = 0.8;
  tab.castShadow = true;
  group.add(tab);

  // Mounting Screw Hole Rim
  const holeRingGeo = new THREE.RingGeometry(0.14, 0.22, 16);
  const holeRingMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const holeRing = new THREE.Mesh(holeRingGeo, holeRingMat);
  holeRing.position.set(0, 1.25, 0.075);
  group.add(holeRing);

  // Chamfered Molded Epoxy Body
  const bodyGeo = new THREE.BoxGeometry(1.02, 0.95, 0.42);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.72 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 0.48, 0.18);
  body.castShadow = true;
  group.add(body);

  // Silkscreen part number plate on face
  const labelText = comp.type === "voltage_regulator_7805" ? "LM7805" : "IRLZ44N";
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 128;
  labelCanvas.height = 64;
  const lctx = labelCanvas.getContext("2d")!;
  lctx.fillStyle = "#18181b";
  lctx.fillRect(0, 0, 128, 64);
  lctx.fillStyle = "#cbd5e1";
  lctx.font = "bold 20px monospace";
  lctx.textAlign = "center";
  lctx.fillText(labelText, 64, 32);
  lctx.fillStyle = "#38bdf8";
  lctx.font = "bold 13px monospace";
  lctx.fillText(comp.type === "voltage_regulator_7805" ? "IN  GND OUT" : " G   D   S ", 64, 52);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.45),
    new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
  );
  labelMesh.position.set(0, 0.48, 0.395);
  group.add(labelMesh);

  // 3 Stepped Copper/Tin Leads (Gate, Drain, Source / In, GND, Out)
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.15 });
  [-0.32, 0, 0.32].forEach((x) => {
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), leadMat);
    lead.position.set(x, -0.15, 0.18);
    group.add(lead);
  });
}

// 23. DIP-8 Package (NE555 Precision Timer with Pin-1 Dimple & Laser Text)
function buildDip8Mesh(group: THREE.Group, _comp: PlacedComponent) {
  // Matte Epoxy IC Body with Chamfered Edges
  const chipGeo = new THREE.BoxGeometry(1.0, 0.46, 1.25);
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75 });
  const chip = new THREE.Mesh(chipGeo, chipMat);
  chip.position.y = 0.25;
  chip.castShadow = true;
  group.add(chip);

  // Top Index Half-Circle Notch
  const notchGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12, 1, false, 0, Math.PI);
  const notchMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const notch = new THREE.Mesh(notchGeo, notchMat);
  notch.rotation.x = Math.PI / 2;
  notch.position.set(0, 0.49, -0.62);
  group.add(notch);

  // Pin 1 Circular Dimple
  const dotGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x3f3f46 });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(-0.35, 0.49, -0.42);
  group.add(dot);

  // Laser Etched Marking ("NE555")
  const textPlateGeo = new THREE.PlaneGeometry(0.65, 0.25);
  const textPlateMat = new THREE.MeshBasicMaterial({
    color: 0x71717a,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const textPlate = new THREE.Mesh(textPlateGeo, textPlateMat);
  textPlate.rotation.x = -Math.PI / 2;
  textPlate.position.set(0, 0.49, 0.05);
  group.add(textPlate);

  // 8 Gullwing Nickel-Plated Contact Pins
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
  [-0.45, -0.15, 0.15, 0.45].forEach((z) => {
    // Left side pins
    const pL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.08), pinMat);
    pL.position.set(-0.62, 0.12, z);
    // Right side pins
    const pR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.08), pinMat);
    pR.position.set(0.62, 0.12, z);
    group.add(pL, pR);
  });
}

// Helper: Realistic Piezo Buzzer Top Face Texture
function getBuzzerTopTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Matte black circular plastic body
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.arc(128, 128, 126, 0, Math.PI * 2);
  ctx.fill();

  // Central acoustic emission cavity
  ctx.fillStyle = "#09090b";
  ctx.beginPath();
  ctx.arc(128, 128, 40, 0, Math.PI * 2);
  ctx.fill();

  // Red circle pad directly above the POSITIVE pin (x = -0.3 -> canvas x = 58)
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(58, 128, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 46px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", 58, 127);

  // Technical label in crisp slate
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("ACTIVE 5V", 128, 205);
  ctx.font = "12px monospace";
  ctx.fillText("REMOVE SEAL", 128, 46);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// 24. Piezo Buzzer
function buildBuzzerMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  // Cylindrical black housing
  const cylGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 28);
  const cylMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.65 });
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.position.y = 0.4;
  cyl.castShadow = true;
  group.add(cyl);

  // Top Cap with stamped (+) polarity texture
  const topGeo = new THREE.PlaneGeometry(1.2, 1.2);
  const topMat = new THREE.MeshStandardMaterial({
    map: getBuzzerTopTexture(),
    roughness: 0.5,
    transparent: true,
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.805;
  group.add(top);

  // Center Acoustic Hole Depth Rim
  const holeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 16);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
  const hole = new THREE.Mesh(holeGeo, holeMat);
  hole.position.y = 0.81;
  group.add(hole);

  // Two Through-Hole Leads (matching catalog pins at x = -0.3 for (+) and x = +0.3 for (-))
  const leadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.12 });
  const posLead = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), leadMat);
  posLead.position.set(-0.3, 0.05, 0);
  const negLead = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), leadMat);
  negLead.position.set(0.3, 0.1, 0);
  group.add(posLead, negLead);

  if (state?.isPowered) {
    const waveGeo = new THREE.RingGeometry(0.7, 0.95, 24);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = 0.92;
    group.add(wave);
  }
}

// 25. 5V Relay Module
function buildRelayMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcbGeo = new THREE.BoxGeometry(2.3, 0.15, 3.3);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.08;

  const cubeGeo = new THREE.BoxGeometry(1.8, 1.4, 1.8);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.set(0, 0.8, 0.2);

  group.add(pcb, cube);
}

// 25b. PIR Motion Sensor HC-SR501
function buildPirSensorMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  // Green PCB base
  const pcbGeo = new THREE.BoxGeometry(2.8, 0.15, 3.2);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.08;
  group.add(pcb);

  // White Fresnel lens dome
  const domeGeo = new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const isTriggered = state.isPowered || comp.params?.motionDetected;
  const domeMat = new THREE.MeshStandardMaterial({
    color: isTriggered ? 0xfef08a : 0xf8fafc,
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
    emissive: isTriggered ? 0xeab308 : 0x000000,
    emissiveIntensity: isTriggered ? 0.35 : 0.0,
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.set(0, 0.15, -0.2);
  group.add(dome);

  // Two orange trimmer potentiometers
  const potGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.3, 10);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
  const pot1 = new THREE.Mesh(potGeo, potMat);
  pot1.position.set(-0.9, 0.25, 1.1);
  const pot2 = new THREE.Mesh(potGeo, potMat);
  pot2.position.set(0.9, 0.25, 1.1);
  group.add(pot1, pot2);

  // 3-pin Header block
  const hdrGeo = new THREE.BoxGeometry(1.2, 0.4, 0.35);
  const hdrMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const hdr = new THREE.Mesh(hdrGeo, hdrMat);
  hdr.position.set(0, 0.25, 1.3);
  group.add(hdr);

  // Detection halo wave
  if (isTriggered) {
    const ringGeo = new THREE.RingGeometry(1.2, 1.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.2;
    group.add(ring);
  }
}

// 25c. KY-038 Sound Sensor Microphone Module
function buildSoundSensorMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  // Blue PCB
  const pcbGeo = new THREE.BoxGeometry(1.5, 0.15, 3.4);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.08;
  group.add(pcb);

  // Cylindrical metallic microphone capsule
  const micGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.65, 16);
  const micMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
  const mic = new THREE.Mesh(micGeo, micMat);
  mic.position.set(0, 0.42, -1.1);
  group.add(mic);

  // Felt top of mic
  const feltGeo = new THREE.CircleGeometry(0.35, 12);
  const feltMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const felt = new THREE.Mesh(feltGeo, feltMat);
  felt.rotation.x = -Math.PI / 2;
  felt.position.set(0, 0.75, -1.1);
  group.add(felt);

  // Blue rectangular trimmer pot
  const potGeo = new THREE.BoxGeometry(0.65, 0.45, 0.65);
  const potMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.set(0, 0.32, 0.2);
  group.add(pot);

  // LM393 chip
  const icGeo = new THREE.BoxGeometry(0.55, 0.18, 0.9);
  const icMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  const ic = new THREE.Mesh(icGeo, icMat);
  ic.position.set(0, 0.2, 0.8);
  group.add(ic);

  // Acoustic trigger pulse
  const isHearing = state.isPowered || comp.params?.soundDetected;
  if (isHearing) {
    const pulseGeo = new THREE.RingGeometry(0.6, 0.9, 16);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.set(0, 0.8, -1.1);
    group.add(pulse);
  }
}

// 25d. 5V Fan Cooler (Axial computer fan)
function buildFanCoolerMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  // Black square fan housing
  const frameGeo = new THREE.BoxGeometry(3.6, 0.6, 3.6);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.2 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = 0.3;
  group.add(frame);

  // Circular inner bore hole
  const boreGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.62, 24);
  const boreMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const bore = new THREE.Mesh(boreGeo, boreMat);
  bore.position.y = 0.3;
  group.add(bore);

  // Center motor hub
  const hubGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.65, 16);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.4 });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.position.y = 0.32;
  group.add(hub);

  // 7 Aerodynamic fan blades
  const isSpinning = Boolean(state.isPowered || comp.params?.isSpinning || comp.params?.rpm > 0);
  const bladesGroup = new THREE.Group();
  bladesGroup.position.y = 0.32;

  const bladeCount = 7;
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const bladeGeo = new THREE.BoxGeometry(0.9, 0.08, 0.45);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: isSpinning ? 0x0284c7 : 0x1e293b,
      roughness: 0.3,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(Math.cos(angle) * 1.05, 0, Math.sin(angle) * 1.05);
    blade.rotation.y = -angle;
    blade.rotation.z = 0.35; // Aerodynamic pitch angle
    bladesGroup.add(blade);
  }
  group.add(bladesGroup);

  // Rotating airflow ring when active
  if (isSpinning) {
    const flowGeo = new THREE.RingGeometry(0.8, 1.5, 20);
    const flowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const flow = new THREE.Mesh(flowGeo, flowMat);
    flow.rotation.x = -Math.PI / 2;
    flow.position.y = 0.65;
    group.add(flow);
  }
}

// =========================================================================
// DRONE 3D SUBSYSTEM BUILDERS (Section 3-17 ТЗ)
// =========================================================================

// 26. Carbon Fiber Drone Frame 220mm
function buildDroneFrameMesh(group: THREE.Group, _comp: PlacedComponent) {
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1e2229,
    roughness: 0.4,
    metalness: 0.6,
  });
  const metalStandoffMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Bottom Center Plate
  const bottomPlate = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 3.0), carbonMat);
  bottomPlate.position.y = 0.1;

  // Top Center Plate
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 2.8), carbonMat);
  topPlate.position.y = 1.0;

  // 4 Aluminum Standoffs (Orange/Gold Anodized)
  const standoffGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8);
  const standoffOffsets = [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, 1.0],
  ];
  standoffOffsets.forEach(([sx, sz]) => {
    const s = new THREE.Mesh(standoffGeo, metalStandoffMat);
    s.position.set(sx, 0.55, sz);
    group.add(s);
  });

  // 4 Booms / Arms extending outward at 45 degrees
  const armAngles = [Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4, -Math.PI / 4];
  armAngles.forEach((angle) => {
    const armGroup = new THREE.Group();
    armGroup.rotation.y = angle;

    // Arm beam (carbon fiber 5mm)
    const armBeam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 3.2), carbonMat);
    armBeam.position.set(0, 0.12, 1.8);

    // Motor mounting pad at the tip of the arm
    const motorPad = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.25, 16), carbonMat);
    motorPad.position.set(0, 0.12, 3.4);

    armGroup.add(armBeam, motorPad);
    group.add(armGroup);
  });

  group.add(bottomPlate, topPlate);
}

// 27. Drone 3S LiPo Battery Pack
function buildDroneBatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  const packGeo = new THREE.BoxGeometry(3.6, 1.2, 1.8);
  const packMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 }); // High-tech blue wrap
  const pack = new THREE.Mesh(packGeo, packMat);
  pack.position.y = 0.6;

  // Yellow label
  const labelGeo = new THREE.BoxGeometry(2.6, 0.02, 1.2);
  const labelMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, 1.21, 0);

  // Red/Black 12AWG Silicone Power Leads with XT60 Connector
  const wireRed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 })
  );
  wireRed.rotation.z = Math.PI / 3;
  wireRed.position.set(1.9, 0.8, -0.3);

  const wireBlack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x09090b })
  );
  wireBlack.rotation.z = Math.PI / 3;
  wireBlack.position.set(1.9, 0.8, 0.3);

  // XT60 Housing
  const xt60 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.4, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2 })
  );
  xt60.position.set(2.4, 1.1, 0);

  group.add(pack, label, wireRed, wireBlack, xt60);
}

// 28. Drone PDB (Power Distribution Board)
function buildDronePdbMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.15, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  pcb.position.y = 0.08;

  // Gold copper power tabs on corners
  const tabGeo = new THREE.BoxGeometry(0.5, 0.18, 0.4);
  const tabMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  [
    [-1.0, -1.0],
    [1.0, -1.0],
    [-1.0, 1.0],
    [1.0, 1.0],
  ].forEach(([tx, tz]) => {
    const tab = new THREE.Mesh(tabGeo, tabMat);
    tab.position.set(tx, 0.09, tz);
    group.add(tab);
  });

  // Bulk low-ESR electrolytic capacitor
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 1.0, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
  );
  cap.rotation.z = Math.PI / 2;
  cap.position.set(0, 0.4, 0);

  group.add(pcb, cap);
}

// 29. Drone Flight Controller (STM32 + IMU)
function buildDroneFcMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // Sky blue PCB
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 2.4), pcbMat);
  pcb.position.y = 0.08;

  // STM32 MCU Chip
  const mcuMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 });
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.9), mcuMat);
  mcu.position.set(0, 0.2, 0);

  // IMU 6-axis Gyro IC
  const imuMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const imu = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), imuMat);
  imu.position.set(0.6, 0.18, -0.6);

  // Micro USB Port
  const usbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9 });
  const usb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.6), usbMat);
  usb.position.set(-1.1, 0.22, 0);

  // Status LED (flashing when active/powered)
  const ledColor = state?.isPowered ? 0x22c55e : 0xef4444;
  const led = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.1, 0.12),
    new THREE.MeshBasicMaterial({ color: ledColor })
  );
  led.position.set(0.8, 0.2, 0.8);

  group.add(pcb, mcu, imu, usb, led);
}

// 30. Drone 4-in-1 ESC Board
function buildDroneEscMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.15, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.3 }) // Deep purple/navy
  );
  pcb.position.y = 0.08;

  // Rows of MOSFET power switches (8 per quadrant)
  const mosfetMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2 });
  const mosfetGeo = new THREE.BoxGeometry(0.3, 0.1, 0.2);
  [-0.7, 0.7].forEach((mx) => {
    [-0.7, -0.4, 0.4, 0.7].forEach((mz) => {
      const m = new THREE.Mesh(mosfetGeo, mosfetMat);
      m.position.set(mx, 0.18, mz);
      group.add(m);
    });
  });

  group.add(pcb);
}

// 31. Drone Brushless Motor (2306 2400KV)
function buildDroneMotorMesh(group: THREE.Group, comp: PlacedComponent, state?: any) {
  // Stator Base (Fixed to frame)
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.75, 0.25, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
  );
  base.position.y = 0.12;

  // Copper coil windings glimpse
  const coils = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.6 })
  );
  coils.position.y = 0.4;

  // Rotating Outrunner Bell (Anodized blue/titanium)
  const isCW = comp.type.includes("cw") && !comp.type.includes("ccw");
  const bellColor = isCW ? 0x0284c7 : 0xe11d48;
  const bell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.6, 20),
    new THREE.MeshStandardMaterial({ color: bellColor, metalness: 0.8, roughness: 0.2 })
  );
  bell.position.y = 0.7;

  // Motor Shaft (5mm steel prop adapter)
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 })
  );
  shaft.position.y = 1.1;

  group.add(base, coils, bell, shaft);
}

// 32. Drone Propeller (5045x3 aerodynamic tri-blade)
function buildDronePropMesh(group: THREE.Group, comp: PlacedComponent, state?: any) {
  const isCW = comp.type.includes("cw") && !comp.type.includes("ccw");
  const propMat = new THREE.MeshStandardMaterial({
    color: isCW ? 0x38bdf8 : 0xf43f5e,
    transparent: true,
    opacity: state?.isPowered ? 0.65 : 0.9,
    roughness: 0.3,
  });

  const rotorGroup = new THREE.Group();
  rotorGroup.name = "rotor-blades";
  rotorGroup.userData = { isCW };

  // Central Hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16), propMat);
  hub.position.y = 0.12;
  rotorGroup.add(hub);

  // 3 Aerodynamic blades
  const bladeGeo = new THREE.BoxGeometry(0.4, 0.06, 2.0);
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const blade = new THREE.Mesh(bladeGeo, propMat);
    blade.position.set(0, 0.12, 0);
    blade.rotation.y = angle;
    blade.position.x = Math.sin(angle) * 0.9;
    blade.position.z = Math.cos(angle) * 0.9;
    blade.rotation.z = isCW ? 0.25 : -0.25; // Blade pitch angle
    rotorGroup.add(blade);
  }

  // Top lock nut (silver/black M5)
  const nut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9 })
  );
  nut.position.y = 0.3;
  rotorGroup.add(nut);

  group.add(rotorGroup);
}

// 33. Drone Radio Receiver (ELRS 2.4GHz)
function buildDroneRxMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.15, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x166534 })
  );
  pcb.position.y = 0.08;

  // Dual Dipole Antennas
  const antMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
  const ant1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), antMat);
  ant1.rotation.z = Math.PI / 4;
  ant1.position.set(0.6, 0.5, 0.5);

  const ant2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6), antMat);
  ant2.rotation.z = -Math.PI / 4;
  ant2.position.set(-0.6, 0.5, 0.5);

  group.add(pcb, ant1, ant2);
}

// 34. Drone GPS Puck Module
function buildDroneGpsMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Stalk Mast
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
  );
  stalk.position.y = 0.8;

  // Ceramic Patch Antenna Disc
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  disc.position.y = 1.65;

  group.add(stalk, disc);
}

// 35. Drone FPV Camera
function buildDroneCameraMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Body case
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }) // Orange FPV case
  );
  body.position.y = 0.6;

  // Camera Optical Lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.45, 0.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.1 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.6, -0.6);

  group.add(body, lens);
}

// 36. Drone VTX (Video Transmitter 5.8GHz)
function buildDroneVtxMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.3, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
  );
  pcb.position.y = 0.15;

  // Cloverleaf / Pagoda Antenna
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x09090b })
  );
  mast.position.set(0, 0.8, 0.6);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xdc2626 })
  );
  head.position.set(0, 1.4, 0.6);

  group.add(pcb, mast, head);
}

// =========================================================================
// SMARTPHONE 3D SUBSYSTEM BUILDERS (Section 18-33 ТЗ)
// =========================================================================

// 37. Smartphone Aluminum Midframe
function buildPhoneFrameMesh(group: THREE.Group, _comp: PlacedComponent) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 8.4), mat);
  frame.position.y = 0.15;

  // Battery compartment cutout visually modeled
  const battPocket = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.15, 5.0),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  battPocket.position.set(0, 0.25, -0.6);

  group.add(frame, battPocket);
}

// 38. Smartphone Rear Glass Cover
function buildPhoneBackCoverMesh(group: THREE.Group, _comp: PlacedComponent) {
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.3,
    roughness: 0.1,
  });
  const back = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 8.4), glassMat);
  back.position.y = 0.08;

  // Brand logo badge in center
  const logo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9 })
  );
  logo.position.set(0, 0.16, 0);

  group.add(back, logo);
}

// 39. Smartphone AMOLED Display Panel
function buildPhoneDisplayMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1 });
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.1, 8.2), bezelMat);
  bezel.position.y = 0.05;

  // Active glowing OLED Screen
  const screenColor = state?.isPowered ? 0x0ea5e9 : 0x0f172a;
  const screenMat = new THREE.MeshBasicMaterial({ color: screenColor });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.05, 7.8), screenMat);
  screen.position.set(0, 0.12, 0);

  // Front camera hole-punch
  const punch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  punch.position.set(0, 0.16, -3.4);

  group.add(bezel, screen, punch);
}

// 40. Smartphone Li-Ion Pouch Battery
function buildPhoneBatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  const battMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  const cell = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 4.8), battMat);
  cell.position.y = 0.18;

  // Battery Flex Ribbon Cable
  const ribbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.08, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xd97706 })
  );
  ribbon.position.set(1.2, 0.25, 2.6);

  group.add(cell, ribbon);
}

// 41. Smartphone Motherboard with SoC BGA
function buildPhoneMotherboardMesh(group: THREE.Group, comp: PlacedComponent, state?: any) {
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 }); // Dense green/black HDI PCB
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.2, 3.0), pcbMat);
  pcb.position.y = 0.1;

  // Octa-Core SoC Processor with Gold Text
  const socMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.8 });
  const soc = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 1.2), socMat);
  soc.position.set(0, 0.22, 0);

  // Metal RF/EMI Shielding Cans
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 });
  const shield1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.0), shieldMat);
  shield1.position.set(-1.0, 0.22, 0.6);

  const shield2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.0), shieldMat);
  shield2.position.set(1.0, 0.22, 0.6);

  group.add(pcb, soc, shield1, shield2);

  // If customized by user in Motherboard Assembly Studio, add micro-chips and gold wire bonds
  if (comp.params?.customMotherboardAssembly) {
    addCustomMotherboardChipsAndGoldWires(group, comp.params.customMotherboardAssembly);
  }
}

// 42. Smartphone Camera Module Bump
function buildPhoneCameraMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Raised Camera Bump
  const bump = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 })
  );
  bump.position.y = 0.2;

  // 3 Lenses with Sapphire Glass rings
  const lensGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
  [-0.4, 0.4].forEach((lz, idx) => {
    const l = new THREE.Mesh(lensGeo, lensMat);
    l.position.set(-0.3, 0.45, lz);
    group.add(l);
  });
  const l3 = new THREE.Mesh(lensGeo, lensMat);
  l3.position.set(0.4, 0.45, 0);

  // LED Flash
  const flash = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.1, 10),
    new THREE.MeshBasicMaterial({ color: 0xfef08a })
  );
  flash.position.set(0.4, 0.42, 0.6);

  group.add(bump, l3, flash);
}

// 43. Smartphone Speaker Box
function buildPhoneSpeakerMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.35, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x18181b })
  );
  box.position.y = 0.18;

  // Speaker Grille Mesh
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.05, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
  );
  grille.position.set(0, 0.36, 0);

  group.add(box, grille);
}

// 44. Smartphone USB-C Receptacle
function buildPhoneUsbcMesh(group: THREE.Group, _comp: PlacedComponent) {
  const port = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.3, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 })
  );
  port.position.y = 0.15;

  // Port Opening
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.12, 0.4),
    new THREE.MeshBasicMaterial({ color: 0x020617 })
  );
  slot.position.set(0, 0.15, 0.2);

  group.add(port, slot);
}

// =========================================================================
// ROBOT 3D SUBSYSTEM BUILDERS (Section 34 ТЗ)
// =========================================================================

// 45. Robot Dual-Tier Chassis + Caster
function buildRobotChassisMesh(group: THREE.Group, _comp: PlacedComponent) {
  const acrylicMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75,
    roughness: 0.2,
  });

  // Lower Plate
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.2, 24), acrylicMat);
  lower.position.y = 0.6;

  // Upper Plate
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.2, 24), acrylicMat);
  upper.position.y = 2.0;

  // Brass Standoff Pillars
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 });
  const pillarGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8);
  [-1.5, 1.5].forEach((px) => {
    [-1.2, 1.2].forEach((pz) => {
      const p = new THREE.Mesh(pillarGeo, brassMat);
      p.position.set(px, 1.3, pz);
      group.add(p);
    });
  });

  // Front Swivel Caster Wheel
  const casterMount = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0x64748b })
  );
  casterMount.position.set(0, 0.4, 2.2);

  const casterBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 })
  );
  casterBall.position.set(0, 0.25, 2.2);

  group.add(lower, upper, casterMount, casterBall);
}

// 46. Robot 2S 7.4V Battery Pack
function buildRobotBatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  const batt = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.0, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 }) // Green shrinkwrap
  );
  batt.position.y = 0.5;

  group.add(batt);
}

// 47. Smartphone Dual-LED Flash Module
function buildPhoneFlashMesh(group: THREE.Group, comp: PlacedComponent, state?: any) {
  const isLit = Boolean(state?.isPowered || comp.params?.torchOn);

  // Substrate
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.15, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 })
  );
  base.position.y = 0.08;

  // Warm LED
  const warmLedMat = new THREE.MeshStandardMaterial({
    color: isLit ? 0xfffaed : 0xfef08a,
    emissive: isLit ? 0xfde047 : 0x000000,
    emissiveIntensity: isLit ? 2.5 : 0,
    roughness: 0.2,
  });
  const warmLed = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), warmLedMat);
  warmLed.position.set(-0.16, 0.18, 0);

  // Cool LED
  const coolLedMat = new THREE.MeshStandardMaterial({
    color: isLit ? 0xffffff : 0xe0f2fe,
    emissive: isLit ? 0xbae6fd : 0x000000,
    emissiveIntensity: isLit ? 2.5 : 0,
    roughness: 0.2,
  });
  const coolLed = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), coolLedMat);
  coolLed.position.set(0.16, 0.18, 0);

  // Lens frame
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 })
  );
  ring.position.y = 0.14;

  group.add(base, ring, warmLed, coolLed);

  if (isLit) {
    const light = new THREE.PointLight(0xfff8db, 1.8, 14);
    light.position.set(0, 0.5, 0);
    group.add(light);
  }
}

// Helper: Render custom chips and gold arched micro-wires for user-assembled motherboards
function addCustomMotherboardChipsAndGoldWires(group: THREE.Group, assembly: any) {
  const placedKeys: string[] = assembly.placedPartKeys || [];
  const bondedWireIds: string[] = assembly.bondedWireIds || [];

  // 1. SoC Processor (Si 4nm)
  if (placedKeys.includes("soc") || assembly.isAssembled) {
    const socDie = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.12, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.15 })
    );
    socDie.position.set(-0.2, 0.22, -0.2);
    const socLabel = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.02, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 })
    );
    socLabel.position.set(-0.2, 0.29, -0.2);
    group.add(socDie, socLabel);
  }

  // 2. RAM LPDDR5X (12GB)
  if (placedKeys.includes("ram") || assembly.isAssembled) {
    const ramChip = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.1, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    ramChip.position.set(0.9, 0.21, -0.5);
    group.add(ramChip);
  }

  // 3. Storage UFS 4.0
  if (placedKeys.includes("storage") || assembly.isAssembled) {
    const ufsChip = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.1, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.25 })
    );
    ufsChip.position.set(0.9, 0.21, 0.5);
    group.add(ufsChip);
  }

  // 4. PMIC
  if (placedKeys.includes("pmic") || assembly.isAssembled) {
    const pmicChip = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.08, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x1e1e24, metalness: 0.75, roughness: 0.2 })
    );
    pmicChip.position.set(-1.1, 0.2, -0.7);
    group.add(pmicChip);
  }

  // 5. VRM Inductor (Ferrite Choke)
  if (placedKeys.includes("vrm_inductor") || assembly.isAssembled) {
    const choke = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.25, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 })
    );
    choke.position.set(-1.1, 0.28, 0.1);
    group.add(choke);
  }

  // 6. USB-C Port
  if (placedKeys.includes("usbc") || assembly.isAssembled) {
    const usbcPort = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.22, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 })
    );
    usbcPort.position.set(-0.2, 0.24, 1.35);
    group.add(usbcPort);
  }

  // 7. Crystal TCXO 38.4MHz (Metal can package)
  if (placedKeys.includes("crystal") || assembly.isAssembled) {
    const crystal = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.15, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    crystal.position.set(-1.0, 0.2, 0.8);
    group.add(crystal);
  }

  // 8. MLCC Decoupling Capacitors (0402 Arrays)
  if (placedKeys.includes("smd_passives") || assembly.isAssembled) {
    const mlccMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    for (let c = 0; c < 4; c++) {
      const mlcc = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.12), mlccMat);
      mlcc.position.set(-0.5 + c * 0.25, 0.18, 0.7);
      group.add(mlcc);
    }
  }

  // 9. Wi-Fi 7 / BT RF Front-End (Teal module)
  if (placedKeys.includes("rf_fem") || assembly.isAssembled) {
    const rfChip = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.8, roughness: 0.25 })
    );
    rfChip.position.set(0.9, 0.21, -1.05);
    group.add(rfChip);
  }

  // 10. Display Socket MIPI DSI
  if (placedKeys.includes("mipi_disp") || assembly.isAssembled) {
    const dispSocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.14, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
    );
    dispSocket.position.set(0.9, 0.22, 1.1);
    group.add(dispSocket);
  }

  // 11. Gold Wire Bonding (3D Arched Gold Wires)
  const goldWireMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.98,
    roughness: 0.1,
    emissive: 0x78350f,
    emissiveIntensity: 0.2,
  });

  const wireCount = bondedWireIds.length > 0 ? bondedWireIds.length : (assembly.isAssembled ? 8 : 0);
  if (wireCount > 0) {
    for (let i = 0; i < Math.min(10, wireCount); i++) {
      const angle = (i / 10) * Math.PI * 2;
      const r1 = 0.5;
      const r2 = 0.85;
      const x1 = -0.2 + Math.cos(angle) * r1;
      const z1 = -0.2 + Math.sin(angle) * r1;
      const x2 = -0.2 + Math.cos(angle) * r2;
      const z2 = -0.2 + Math.sin(angle) * r2;

      // Small gold arc cylinder
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x1, 0.28, z1),
        new THREE.Vector3((x1 + x2) / 2, 0.42, (z1 + z2) / 2),
        new THREE.Vector3(x2, 0.18, z2)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 8, 0.015, 6, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, goldWireMat);
      group.add(tubeMesh);
    }
  }
}

// 48. Raw FR-4 PCB Substrate with Copper Traces
function buildRawFr4SubstrateMesh(group: THREE.Group, comp: PlacedComponent) {
  // Deep emerald green FR-4 laminate
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.15, 3.0),
    new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.35 })
  );
  board.position.y = 0.08;

  // Gold-plated pads and copper traces
  const traceMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 });
  const trace1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.02, 0.1), traceMat);
  trace1.position.set(0, 0.16, 0.6);
  const trace2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 2.0), traceMat);
  trace2.position.set(-0.8, 0.16, 0);
  const padGrid = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 1.4), traceMat);
  padGrid.position.set(0.5, 0.16, -0.4);

  group.add(board, trace1, trace2, padGrid);

  // If assembled by user, show the mounted chips and gold wire bonding
  if (comp.params?.customMotherboardAssembly) {
    addCustomMotherboardChipsAndGoldWires(group, comp.params.customMotherboardAssembly);
  }
}

// 49. Silicon 4nm SoC Die with Gold Wire Bonding
function buildSmdSocChipMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Dark silicon die with iridescent shine
  const die = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.15, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9, roughness: 0.15 })
  );
  die.position.y = 0.08;

  // Gold laser-etched heat spreader
  const label = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.02, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95, roughness: 0.1 })
  );
  label.position.set(0, 0.16, 0);

  group.add(die, label);
}

// 50. Pure Gold Wire Spool (Au 99.99%)
function buildRawGoldWireMesh(group: THREE.Group, _comp: PlacedComponent) {
  const spool = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
  );
  spool.position.y = 0.2;

  const wireCoil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 })
  );
  wireCoil.position.y = 0.2;

  group.add(spool, wireCoil);
}

// 51. PMIC Power Management IC
function buildSmdPmicChipMesh(group: THREE.Group, _comp: PlacedComponent) {
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.15, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
  );
  chip.position.y = 0.08;

  // Metal thermal pad on top
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.02, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
  );
  pad.position.set(0, 0.16, 0);

  group.add(chip, pad);
}

// 52. LPDDR5X RAM Memory Chip
function buildSmdMemoryChipMesh(group: THREE.Group, _comp: PlacedComponent) {
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.15, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
  );
  chip.position.y = 0.08;

  group.add(chip);
}

// 53. SMD Passives Tray (Capacitors and Resistors 0402)
function buildSmdPassivesPackMesh(group: THREE.Group, _comp: PlacedComponent) {
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.08, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
  );
  tray.position.y = 0.04;

  const capMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 }); // Ceramic brown
  [-0.2, 0.2].forEach((x) => {
    [-0.2, 0.2].forEach((z) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), capMat);
      c.position.set(x, 0.1, z);
      group.add(c);
    });
  });

  group.add(tray);
}

// 54. Flashlight High-Power LED Chip
function buildFlashlightLedMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const isPowered = Boolean(state?.isPowered);
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.1, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  base.position.y = 0.05;

  const domeMat = new THREE.MeshStandardMaterial({
    color: isPowered ? 0xfffbeb : 0xfef08a,
    emissive: isPowered ? 0xfef08a : 0x000000,
    emissiveIntensity: isPowered ? 2.0 : 0,
    roughness: 0.2,
  });
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), domeMat);
  dome.position.y = 0.12;

  group.add(base, dome);
}

// 55. Flash Fresnel Lens
function buildFlashLensMesh(group: THREE.Group, _comp: PlacedComponent) {
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    })
  );
  lens.position.y = 0.1;
  group.add(lens);
}

// 56. Mini Copper Substrate
function buildMiniSubstrateMesh(group: THREE.Group, _comp: PlacedComponent) {
  const sub = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.08, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.95, roughness: 0.25 })
  );
  sub.position.y = 0.04;
  group.add(sub);
}

// 57. Camera Silicon CMOS Sensor Die
function buildCameraSensorCmosMesh(group: THREE.Group, _comp: PlacedComponent) {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.15, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 })
  );
  base.position.y = 0.08;

  // Iridescent active area
  const sensorMat = new THREE.MeshStandardMaterial({
    color: 0x065f46,
    metalness: 0.8,
    roughness: 0.1,
  });
  const activeArea = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.85), sensorMat);
  activeArea.position.set(0, 0.16, 0);

  group.add(base, activeArea);
}

// 58. Optical Lens Group (Glass)
function buildCameraLensGroupMesh(group: THREE.Group, _comp: PlacedComponent) {
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  barrel.position.y = 0.2;

  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
    })
  );
  glass.position.set(0, 0.35, 0);

  group.add(barrel, glass);
}

// 59. Camera OIS Voice Coil Actuator
function buildCameraOisActuatorMesh(group: THREE.Group, _comp: PlacedComponent) {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.25, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
  );
  frame.position.y = 0.13;

  const coilMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9 });
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 16), coilMat);
  coil.rotation.x = Math.PI / 2;
  coil.position.set(0, 0.25, 0);

  group.add(frame, coil);
}

// 60. Camera Flex Ribbon Cable
function buildCameraFlexCableMesh(group: THREE.Group, _comp: PlacedComponent) {
  const flex = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.04, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }) // Polyimide amber
  );
  flex.position.y = 0.02;

  const connector = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.1, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x020617 })
  );
  connector.position.set(0.6, 0.06, 0);

  group.add(flex, connector);
}

// 61. Raw Lithium Pouch Cell
function buildRawLithiumPouchMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pouch = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.35, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 }) // Silver foil
  );
  pouch.position.y = 0.18;

  group.add(pouch);
}

// 62. BMS Protection PCB
function buildBmsProtectionBoardMesh(group: THREE.Group, _comp: PlacedComponent) {
  const bms = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.12, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4 })
  );
  bms.position.y = 0.06;

  const ic = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.08, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x09090b })
  );
  ic.position.set(-0.6, 0.12, 0);

  group.add(bms, ic);
}

// 63. Nickel Terminals
function buildNickelTabsMesh(group: THREE.Group, _comp: PlacedComponent) {
  const tabGeo = new THREE.BoxGeometry(0.25, 0.04, 0.4);
  const tabMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.95, roughness: 0.2 });
  const t1 = new THREE.Mesh(tabGeo, tabMat);
  t1.position.set(-0.25, 0.02, 0);
  const t2 = new THREE.Mesh(tabGeo, tabMat);
  t2.position.set(0.25, 0.02, 0);

  group.add(t1, t2);
}

// 63b. Motherboard & Computing Parts Meshes
function buildPcLgaSocketMesh(group: THREE.Group, _comp: PlacedComponent) {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.2, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
  );
  base.position.y = 0.1;
  const pinsArea = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.04, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 })
  );
  pinsArea.position.y = 0.21;
  const lever = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
  );
  lever.rotation.z = Math.PI / 2;
  lever.position.set(0, 0.22, 1.15);
  group.add(base, pinsArea, lever);
}

function buildPcVrmStageMesh(group: THREE.Group, _comp: PlacedComponent) {
  const heatsink = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
  );
  heatsink.position.y = 0.3;
  const choke = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.4, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
  );
  choke.position.set(0, 0.2, 0.6);
  group.add(heatsink, choke);
}

function buildPcDdr5SlotMesh(group: THREE.Group, _comp: PlacedComponent) {
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.45, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 })
  );
  slot.position.y = 0.22;
  const clips = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.3, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 })
  );
  clips.position.set(0, 0.3, 1.75);
  group.add(slot, clips);
}

function buildPcPcieSlotMesh(group: THREE.Group, _comp: PlacedComponent) {
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.4, 3.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
  );
  slot.position.y = 0.2;
  const steelArmor = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.38, 3.85),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 })
  );
  steelArmor.position.y = 0.19;
  group.add(steelArmor, slot);
}

function buildPcPchChipsetMesh(group: THREE.Group, _comp: PlacedComponent) {
  const die = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.15, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9, roughness: 0.1 })
  );
  die.position.y = 0.08;
  const heatsink = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.25, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
  );
  heatsink.position.y = 0.2;
  group.add(die, heatsink);
}

function buildPcM2SlotMesh(group: THREE.Group, _comp: PlacedComponent) {
  const shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.15, 2.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 })
  );
  shield.position.y = 0.08;
  group.add(shield);
}

function buildAudioCodecMesh(group: THREE.Group, _comp: PlacedComponent) {
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.15, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 })
  );
  chip.position.y = 0.08;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.35, 12),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 })
  );
  cap.position.set(0.6, 0.18, 0);
  group.add(chip, cap);
}

function buildGenericMicroIcMesh(group: THREE.Group, _comp: PlacedComponent) {
  const ic = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.12, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 })
  );
  ic.position.y = 0.06;
  const dot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
  );
  dot.position.set(-0.25, 0.13, -0.25);
  group.add(ic, dot);
}

function buildCrystalMesh(group: THREE.Group, _comp: PlacedComponent) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.15, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.1 })
  );
  body.position.y = 0.08;
  group.add(body);
}

function buildTvTunerMesh(group: THREE.Group, _comp: PlacedComponent) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 })
  );
  box.position.y = 0.4;
  const fConn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.4, 16),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95 })
  );
  fConn.rotation.x = Math.PI / 2;
  fConn.position.set(-0.95, 0.4, 0);
  group.add(box, fConn);
}

// =========================================================================
// 64. Custom 3D Part Builder Primitive Renderer (Optimized & High-Tech)
// =========================================================================
export function buildCustomPartMesh(group: THREE.Group, comp: PlacedComponent) {
  const config = comp.params?.customConfig;
  if (!config || !Array.isArray(config.primitives) || config.primitives.length === 0) {
    // Fallback minimal technological block
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
    );
    block.position.y = 0.4;
    group.add(block);
    return;
  }

  // Render each user-defined primitive from JSON configuration
  config.primitives.forEach((prim: any) => {
    let geo: THREE.BufferGeometry;
    const dims = prim.dimensions || [1, 1, 1];

    switch (prim.shape) {
      case "cylinder":
      case "lens":
        geo = new THREE.CylinderGeometry(dims[0] || 0.5, dims[2] || dims[0] || 0.5, dims[1] || 1, 16);
        break;
      case "sphere":
        geo = new THREE.SphereGeometry((dims[0] || 1) / 2, 16, 12);
        break;
      case "pin_leg":
        geo = new THREE.BoxGeometry(dims[0] || 0.15, dims[1] || 0.8, dims[2] || 0.15);
        break;
      case "heatsink":
        geo = new THREE.BoxGeometry(dims[0] || 1.2, dims[1] || 0.8, dims[2] || 1.2);
        break;
      case "chip_die":
        geo = new THREE.BoxGeometry(dims[0] || 0.8, dims[1] || 0.1, dims[2] || 0.8);
        break;
      case "box":
      default:
        geo = new THREE.BoxGeometry(dims[0] || 1, dims[1] || 1, dims[2] || 1);
        break;
    }

    // Material with technological parameters
    let matColor = 0x475569;
    if (prim.color) {
      try {
        matColor = parseInt(prim.color.replace("#", "0x"), 16);
      } catch {
        matColor = 0x475569;
      }
    }

    const materialMetalPbr: Record<string, { metalness: number; roughness: number }> = {
      gold: { metalness: 0.96, roughness: 0.14 },
      gold_plated: { metalness: 0.96, roughness: 0.14 },
      copper: { metalness: 0.92, roughness: 0.18 },
      silver: { metalness: 0.97, roughness: 0.12 },
      solder: { metalness: 0.86, roughness: 0.24 },
      nickel: { metalness: 0.88, roughness: 0.22 },
      aluminum: { metalness: 0.85, roughness: 0.25 },
      silicon: { metalness: 0.5, roughness: 0.35 },
      fr4: { metalness: 0.15, roughness: 0.55 },
      fr4_pcb: { metalness: 0.15, roughness: 0.55 },
      abs_plastic: { metalness: 0.08, roughness: 0.5 },
      glass: { metalness: 0.1, roughness: 0.08 },
    };
    const pbrFallback = materialMetalPbr[prim.material || ""] || { metalness: 0.6, roughness: 0.35 };

    const mat = new THREE.MeshStandardMaterial({
      color: matColor,
      metalness: prim.metallic !== undefined ? prim.metallic : pbrFallback.metalness,
      roughness: prim.roughness !== undefined ? prim.roughness : pbrFallback.roughness,
      transparent: (prim.opacity || 1) < 1,
      opacity: prim.opacity !== undefined ? prim.opacity : 1,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `custom-prim-${prim.id || Math.random()}`;

    if (prim.position) {
      mesh.position.set(prim.position[0], prim.position[1], prim.position[2]);
    }
    if (prim.rotation) {
      mesh.rotation.set(prim.rotation[0], prim.rotation[1], prim.rotation[2]);
    }

    group.add(mesh);
  });
}

// 65. Drone Tactical Shooter / Laser Pod
function buildDroneShooterMesh(group: THREE.Group, comp: PlacedComponent, state: any) {
  // Main Rail Mount Housing
  const mount = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
  );
  mount.position.set(0, 0.2, 0);

  // Twin Barrels / Laser Collimator Tubes
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
  const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 12), barrelMat);
  b1.rotation.x = Math.PI / 2;
  b1.position.set(-0.35, 0.1, 0.8);

  const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 12), barrelMat);
  b2.rotation.x = Math.PI / 2;
  b2.position.set(0.35, 0.1, 0.8);

  // Muzzle Flash / Laser Focus Element
  const isFiring = state?.activeValue || comp.params?.firing;
  const lensMat = new THREE.MeshStandardMaterial({
    color: isFiring ? 0xef4444 : 0x06b6d4,
    emissive: isFiring ? 0xef4444 : 0x0284c7,
    emissiveIntensity: isFiring ? 1.5 : 0.4,
    roughness: 0.1,
  });
  const lens1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), lensMat);
  lens1.rotation.x = Math.PI / 2;
  lens1.position.set(-0.35, 0.1, 1.62);

  const lens2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12), lensMat);
  lens2.rotation.x = Math.PI / 2;
  lens2.position.set(0.35, 0.1, 1.62);

  // Rear Solenoid Actuator Box
  const solenoid = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.5, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.7, roughness: 0.3 })
  );
  solenoid.position.set(0, 0.2, -0.8);

  group.add(mount, b1, b2, lens1, lens2, solenoid);
}

// 66. Drone Gimbal FPV Camera
function buildDroneGimbalCameraMesh(group: THREE.Group, _comp: PlacedComponent, _state: any) {
  // Gimbal base mount
  const mount = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.25, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
  );
  mount.position.set(0, 0.5, 0);

  // Gimbal Pitch/Yaw Arm
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
  );
  arm.position.set(-0.4, 0.2, 0);

  // Camera Housing
  const camHousing = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.3 })
  );
  camHousing.position.set(0, 0, 0.1);

  // High-Grade Optical Glass Lens
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.85 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0, 0.48);

  group.add(mount, arm, camHousing, lens);
}

// 67. Humanoid Robot Head
// 67. Humanoid Robot Head (Sensory Bionic Head)
function buildHumanoidHeadMesh(group: THREE.Group, _comp: PlacedComponent, _state: any) {
  const darkShellMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 });
  const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.85, roughness: 0.1 });
  const glowBarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.9 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });

  // Main Bionic Cranium (Aerodynamic contoured head shell)
  const skull = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.3), darkShellMat);
  skull.position.set(0, 0.85, 0);
  skull.castShadow = true;

  // Faceplate Visor Shield (Gunmetal with chamfer)
  const faceplate = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.1, 0.25), darkShellMat);
  faceplate.position.set(0, 0.8, 0.72);

  // Dual Stereoscopic Vision Cameras (Left & Right 4K Optical Sensor Eyes)
  [-0.38, 0.38].forEach((eyeX) => {
    // Outer metallic bezel
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20), titaniumMat);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(eyeX, 0.88, 0.82);
    // Inner optical lens
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 20), lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(eyeX, 0.88, 0.83);
    group.add(bezel, lens);
  });

  // Center 360° Solid-State LiDAR Sensor Dome
  const lidarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.18, 16), titaniumMat);
  lidarBase.position.set(0, 1.62, 0);
  const lidarDome = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), lensMat);
  lidarDome.position.set(0, 1.7, 0);

  // Forehead Cognitive Status LED Matrix
  const statusLight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.08), glowBarMat);
  statusLight.position.set(0, 1.32, 0.78);

  // Acoustic Sensor Microphone Arrays (Left & Right Ears)
  [-0.8, 0.8].forEach((earX) => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 14), titaniumMat);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(earX, 0.85, 0);
    group.add(ear);
  });

  // Neck 2-DoF Yaw-Pitch Gimbal with dual hydraulic damper pistons
  const neckCore = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.45, 16), titaniumMat);
  neckCore.position.set(0, 0.05, 0);

  [-0.32, 0.32].forEach((nx) => {
    const damper = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), titaniumMat);
    damper.position.set(nx, 0.05, -0.15);
    group.add(damper);
  });

  // Rear braided harness conduit
  const harness = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), cableMat);
  harness.position.set(0, 0.1, -0.45);

  group.add(skull, faceplate, lidarBase, lidarDome, statusLight, neckCore, harness);
}

// 68. Humanoid Robot Torso (Exoskeleton, Core Arc Reactor, Actuator Mounts)
function buildHumanoidTorsoMesh(group: THREE.Group, _comp: PlacedComponent, _state: any) {
  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
  const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.15 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 });
  const reactorMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9, roughness: 0.1 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 });

  // Main Contoured Chest Chassis
  const chest = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 1.5), carbonMat);
  chest.position.set(0, 2.3, 0);
  chest.castShadow = true;

  // Left and Right Pectoral Armor Plates
  [-0.65, 0.65].forEach((px) => {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.18), carbonMat);
    plate.position.set(px, 2.35, 0.82);
    group.add(plate);
  });

  // Center Arc Reactor Power Core
  const reactorOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.15, 24), titaniumMat);
  reactorOuter.rotation.x = Math.PI / 2;
  reactorOuter.position.set(0, 2.35, 0.82);

  const reactorRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 24), ringMat);
  reactorRing.position.set(0, 2.35, 0.91);

  const reactorCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 20), reactorMat);
  reactorCore.rotation.x = Math.PI / 2;
  reactorCore.position.set(0, 2.35, 0.88);

  // Articulated Spine Column (4 Titanium Vertebrae)
  for (let v = 0; v < 4; v++) {
    const vertebra = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 0.9), titaniumMat);
    vertebra.position.set(0, 1.15 - v * 0.32, -0.2);
    group.add(vertebra);
  }

  // Dual Abdominal Hydraulic Dampers
  [-0.65, 0.65].forEach((ax) => {
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 10), titaniumMat);
    piston.position.set(ax, 0.85, 0.2);
    group.add(piston);
  });

  // Left & Right Shoulder Cycloidal Actuator Housings with Copper Windings
  [-1.55, 1.55].forEach((sx) => {
    const actuatorHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.55, 20), titaniumMat);
    actuatorHousing.rotation.z = Math.PI / 2;
    actuatorHousing.position.set(sx, 2.8, 0);

    const coilRing = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 10, 20), copperMat);
    coilRing.rotation.y = Math.PI / 2;
    coilRing.position.set(sx, 2.8, 0);

    group.add(actuatorHousing, coilRing);
  });

  // Pelvic Chassis Lower Base
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 1.4), carbonMat);
  pelvis.position.set(0, 0.15, 0);

  // Heavy-duty spine cable harness
  const spineHarness = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), cableMat);
  spineHarness.position.set(0, 1.4, -0.65);

  group.add(chest, reactorOuter, reactorRing, reactorCore, pelvis, spineHarness);
}

// 69. Humanoid Limb (Articulated Bionic Arm or Bipedal Leg with 5 Fingers / Tread Soles)
function buildHumanoidLimbMesh(group: THREE.Group, _comp: PlacedComponent, type: string) {
  const isLeg = type.includes("leg");
  const length = isLeg ? 3.2 : 2.6;
  const radius = isLeg ? 0.38 : 0.26;

  const carbonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
  const titaniumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
  const goldEncoderMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.1 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9, metalness: 0.1 });

  // 1. Upper Limb Segment (Femur / Bicep)
  const upper = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.95, radius * 0.85, length * 0.45, 16),
    carbonMat
  );
  upper.position.y = length * 0.74;
  upper.castShadow = true;

  // Upper segment reinforcement truss
  const upperTruss = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 2.2, length * 0.4, radius * 0.5),
    titaniumMat
  );
  upperTruss.position.set(0, length * 0.74, 0);

  // 2. High-Torque QDD Rotary Joint (Elbow or Knee)
  const joint = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.35, radius * 1.35, isLeg ? 0.8 : 0.6, 20),
    titaniumMat
  );
  joint.rotation.z = Math.PI / 2;
  joint.position.y = length * 0.5;

  // Optical Encoder Ring (Gold)
  const encoder = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.38, 0.04, 10, 24),
    goldEncoderMat
  );
  encoder.rotation.y = Math.PI / 2;
  encoder.position.y = length * 0.5;

  // 3. Lower Limb Segment (Tibia / Forearm)
  const lower = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.85, radius * 0.7, length * 0.45, 16),
    carbonMat
  );
  lower.position.y = length * 0.26;

  // Linear Hydraulic Assist Cylinder
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, length * 0.35, 10),
    titaniumMat
  );
  cylinder.position.set(0, length * 0.26, isLeg ? -radius * 0.9 : radius * 0.9);

  group.add(upper, upperTruss, joint, encoder, lower, cylinder);

  // 4. End-Effector: Hand or Foot
  if (isLeg) {
    // Ankle 2-Axis Universal Gimbal
    const ankle = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.8, 12, 10), titaniumMat);
    ankle.position.y = 0.25;

    // Articulated Bipedal Foot with High-Grip Tread
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 1.8), carbonMat);
    foot.position.set(0, 0.11, 0.3);

    // Sole rubber traction pad with tread ribs
    const sole = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.08, 1.82), rubberMat);
    sole.position.set(0, 0.04, 0.3);

    // Toe flex joint
    const toe = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.18, 0.5), carbonMat);
    toe.position.set(0, 0.09, 1.3);

    group.add(ankle, foot, sole, toe);
  } else {
    // Wrist Roll-Pitch Gimbal
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, 0.25, 16), titaniumMat);
    wrist.position.y = 0.2;

    // Palm Chassis
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.3, 0.75), carbonMat);
    palm.position.set(0, 0.05, 0);
    group.add(wrist, palm);

    // Articulated 5-Finger Bionic Hand (Thumb + 4 Fingers with phalanges)
    const fingerPositions = [
      { x: -0.24, z: 0.42, isThumb: false },
      { x: -0.08, z: 0.45, isThumb: false },
      { x: 0.08, z: 0.45, isThumb: false },
      { x: 0.24, z: 0.42, isThumb: false },
      { x: -0.38, z: 0.15, isThumb: true }, // Thumb on side
    ];

    fingerPositions.forEach(({ x, z, isThumb }) => {
      // Proximal phalanx
      const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 8), titaniumMat);
      p1.position.set(x, isThumb ? 0.0 : -0.1, z);
      p1.rotation.x = isThumb ? 0.4 : 0.2;

      // Distal phalanx with silicone grip pad
      const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.18, 8), titaniumMat);
      p2.position.set(x, isThumb ? -0.15 : -0.28, z + 0.05);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), rubberMat);
      tip.position.set(x, isThumb ? -0.24 : -0.38, z + 0.06);

      group.add(p1, p2, tip);
    });
  }
}

// 70. RoboDog Chassis Body
function buildRoboDogBodyMesh(group: THREE.Group, _comp: PlacedComponent, _state: any) {
  // Sleek Monocoque Chassis
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.2, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
  );
  body.position.y = 1.2;

  // Top Lidar Sensor Dome
  const lidar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.3, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 })
  );
  lidar.position.set(0, 1.95, 0.8);

  // Front Stereo Vision Sensor Bar
  const frontVisor = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.3, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0284c7, emissiveIntensity: 0.6 })
  );
  frontVisor.position.set(0, 1.4, 2.15);

  group.add(body, lidar, frontVisor);
}

// 71. RoboDog Quadruped Leg
function buildRoboDogLegMesh(group: THREE.Group, _comp: PlacedComponent, legType: string) {
  // Hip Abduction/Adduction Actuator
  const hip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 })
  );
  hip.rotation.z = Math.PI / 2;
  hip.position.y = 1.2;

  // Upper Leg Link (Thigh)
  const thigh = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 1.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 })
  );
  thigh.position.set(0, 0.7, 0.2);
  thigh.rotation.x = -0.2;

  // Knee Joint Actuator
  const knee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.45, 14),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 })
  );
  knee.rotation.z = Math.PI / 2;
  knee.position.set(0, 0.05, 0.4);

  // Lower Leg Link (Shank)
  const shank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.1, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
  );
  shank.position.set(0, -0.6, 0.2);
  shank.rotation.x = 0.2;

  // High-Friction Rubber Foot Contact Pad
  const foot = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.95, metalness: 0.1 })
  );
  foot.position.set(0, -1.3, 0);

  group.add(hip, thigh, knee, shank, foot);
}

// 72. ATX Server Motherboard (Lightweight Workbench Mesh)
function buildAtxServerMotherboardMesh(group: THREE.Group, _comp: PlacedComponent) {
  // Green PCB base
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.18, 7.2),
    new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.35 })
  );
  pcb.position.y = 0.09;

  // CPU Socket with yellow cap
  const socket = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.12, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
  );
  socket.position.set(0.1, 0.2, -0.4);

  // 4 RAM DIMM slots
  const ramGroup = new THREE.Group();
  for (let d = 0; d < 4; d++) {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.3, 3.2),
      new THREE.MeshStandardMaterial({ color: d % 2 === 0 ? 0x0f172a : 0x1d4ed8 })
    );
    slot.position.set(1.9 + d * 0.38, 0.25, -0.4);
    ramGroup.add(slot);
  }

  // VRM Heatsink
  const vrmHs = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.35, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
  );
  vrmHs.position.set(0.1, 0.3, -1.9);

  // Chipset PCH
  const pch = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.3, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  pch.position.set(-1.8, 0.25, 1.8);

  // PCIe Slots
  const pcie1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.35, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  pcie1.position.set(-1.6, 0.25, -1.8);

  // 24-Pin ATX
  const atx = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  atx.position.set(3.2, 0.35, -1.8);

  group.add(pcb, socket, ramGroup, vrmHs, pch, pcie1, atx);
}

// 73. Raspberry Pi 5 SBC (Lightweight Workbench Mesh)
function buildRpi5SbcMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.15, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 })
  );
  pcb.position.y = 0.08;

  // Broadcom SoC
  const soc = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 })
  );
  soc.position.set(-0.5, 0.18, 0);

  // 40-Pin GPIO
  const gpio = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.35, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x0f172a })
  );
  gpio.position.set(0, 0.25, -1.2);

  // Ethernet & USB block
  const eth = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.7, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
  );
  eth.position.set(1.6, 0.45, 0.8);

  group.add(pcb, soc, gpio, eth);
}

// 74. Drone Flight Controller (Lightweight Workbench Mesh)
function buildDroneFlightControllerMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.12, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  pcb.position.y = 0.06;

  // MCU STM32
  const mcu = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.08, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 })
  );
  mcu.position.set(0, 0.12, 0);

  // 4 Solder Pad corners (Gold)
  const padGeo = new THREE.BoxGeometry(0.3, 0.05, 0.3);
  const padMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.95 });
  [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].forEach(([px, pz]) => {
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(px, 0.1, pz);
    group.add(pad);
  });

  // USB-C port
  const usb = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.18, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
  );
  usb.position.set(-0.9, 0.12, 0);

  group.add(pcb, mcu, usb);
}

// 75. Automotive Engine ECU (Lightweight Workbench Mesh)
function buildAutomotiveEcuMesh(group: THREE.Group, _comp: PlacedComponent) {
  const caseBox = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.6, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 })
  );
  caseBox.position.y = 0.3;

  // Heavy Duty Multi-Pin Automotive Header
  const header = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.5, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
  );
  header.position.set(0, 0.35, -2.1);

  group.add(caseBox, header);
}

// =========================================================================
// SMART 4K TELEVISION 3D BUILDERS (Flat on Workbench XZ Plane)
// =========================================================================

// 76. TV SECC Steel Backplate Chassis
function buildTvChassisMesh(group: THREE.Group, _comp: PlacedComponent) {
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 0.18, 6.2),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.35 })
  );
  plate.position.y = 0.09;

  // Stamped stiffening ribs
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.28 });
  [-2.0, 0, 2.0].forEach((rz) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.06, 0.25), ribMat);
    rib.position.set(0, 0.2, rz);
    group.add(rib);
  });

  // Brass VESA / PCB standoffs
  const standoffGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.14, 10);
  const standoffMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
  [[-4.5, -2.5], [4.5, -2.5], [-4.5, 2.5], [4.5, 2.5]].forEach(([sx, sz]) => {
    const st = new THREE.Mesh(standoffGeo, standoffMat);
    st.position.set(sx, 0.24, sz);
    group.add(st);
  });

  group.add(plate);
}

// 77. TV Hollow Brushed-Aluminum Front Bezel
function buildTvBezelMesh(group: THREE.Group, _comp: PlacedComponent) {
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.22 });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.22, 0.35), bezelMat);
  topBar.position.set(0, 0.11, -3.08);
  const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.24, 0.45), bezelMat);
  bottomBar.position.set(0, 0.11, 3.05);
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 6.5), bezelMat);
  leftBar.position.set(-5.22, 0.11, 0);
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 6.5), bezelMat);
  rightBar.position.set(5.22, 0.11, 0);

  // Standby IR indicator LED on bottom chin
  const irLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
  );
  irLed.position.set(0, 0.18, 3.24);

  group.add(topBar, bottomBar, leftBar, rightBar, irLed);
}

// 78. TV AC Mains Inlet + T2A Ceramic Fuse
function buildTvAcInletMesh(group: THREE.Group, _comp: PlacedComponent) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.45, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45 })
  );
  body.position.y = 0.22;

  // Blue EMI X2 Filter Capacitor
  const x2Cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.32, 0.32),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
  );
  x2Cap.position.set(-0.25, 0.5, -0.2);

  // Ceramic T2A Fuse Tube
  const fuse = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.7, 12),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25 })
  );
  fuse.rotation.z = Math.PI / 2;
  fuse.position.set(0.15, 0.52, 0.25);

  group.add(body, x2Cap, fuse);
}

// 79. TV SMPS Power Supply Board (230V AC -> 12V & 95V LED Driver)
function buildTvSmpsMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.14, 3.8),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 }) // Classic amber phenolic SMPS PCB
  );
  pcb.position.y = 0.07;

  // Yellow Ferrite Isolation Transformer EER35
  const xfmr = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.75, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 })
  );
  xfmr.position.set(0, 0.52, -0.2);

  // Primary High-Voltage Electrolytic Capacitors (450V)
  const capGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.65, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25 });
  const c1 = new THREE.Mesh(capGeo, capMat);
  c1.position.set(-0.9, 0.46, -0.9);
  const c2 = new THREE.Mesh(capGeo, capMat);
  c2.position.set(-0.9, 0.46, -0.1);

  // Aluminum Switching MOSFET Heatsink
  const heatsink = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.65, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 })
  );
  heatsink.position.set(-0.3, 0.46, 0.9);

  // Power Good Green LED
  const pwrLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x22c55e : 0x14532d,
      emissive: state?.isPowered ? 0x22c55e : 0x000000,
      emissiveIntensity: state?.isPowered ? 2.0 : 0,
    })
  );
  pwrLed.position.set(1.2, 0.2, 1.4);

  group.add(pcb, xfmr, c1, c2, heatsink, pwrLed);
}

// 80. TV Smart Mainboard (4K SoC + HDMI + Tuner)
function buildTvMainboardMesh(group: THREE.Group, comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.14, 3.8),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35 })
  );
  pcb.position.y = 0.07;

  // 4K Video SoC with Brushed Heatsink
  const socHs = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.26, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.25 })
  );
  socHs.position.set(0, 0.27, -0.2);

  // Shielded DVB-T2 RF Tuner Can
  const tuner = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.35, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.15 })
  );
  tuner.position.set(1.0, 0.32, -1.0);

  // HDMI 2.1 Ports Bank on Right Edge
  const hdmiMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.92, roughness: 0.2 });
  [-0.2, 0.4, 1.0].forEach((hz) => {
    const hdmi = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.45), hdmiMat);
    hdmi.position.set(1.35, 0.25, hz);
    group.add(hdmi);
  });

  // Status Indicator LED
  const statusLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x38bdf8 : 0x0f172a,
      emissive: state?.isPowered ? 0x0ea5e9 : 0x000000,
      emissiveIntensity: state?.isPowered ? 2.0 : 0,
    })
  );
  statusLed.position.set(-1.2, 0.2, 1.4);

  group.add(pcb, socHs, tuner, statusLed);

  if (comp.params?.customMotherboardAssembly) {
    addCustomMotherboardChipsAndGoldWires(group, comp.params.customMotherboardAssembly);
  }
}

// 81. TV T-Con Timing Controller Board
function buildTvTconMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.12, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.32 })
  );
  pcb.position.y = 0.06;

  // Timing Controller ASIC
  const asic = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.12, 0.75),
    new THREE.MeshStandardMaterial({
      color: 0x09090b,
      emissive: state?.isPowered ? 0x0284c7 : 0x000000,
      emissiveIntensity: state?.isPowered ? 0.35 : 0,
      metalness: 0.7,
    })
  );
  asic.position.set(0, 0.16, 0);

  // Dual COF ribbon connectors
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
  const rLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.32), ribbonMat);
  rLeft.position.set(-0.9, 0.14, 0.35);
  const rRight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.32), ribbonMat);
  rRight.position.set(0.9, 0.14, 0.35);

  group.add(pcb, asic, rLeft, rRight);
}

// 82. TV Direct-LED Backlight Array
function buildTvBacklightMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const isLit = Boolean(state?.isPowered);
  const reflector = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 0.08, 5.2),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  reflector.position.y = 0.04;
  group.add(reflector);

  // 4 horizontal LED strips with diffusing lenses
  const ledMat = new THREE.MeshStandardMaterial({
    color: isLit ? 0xffffff : 0xfef08a,
    emissive: isLit ? 0xf8fafc : 0x000000,
    emissiveIntensity: isLit ? 2.4 : 0,
  });
  [-1.8, -0.6, 0.6, 1.8].forEach((sz) => {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.04, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc })
    );
    strip.position.set(0, 0.09, sz);
    group.add(strip);

    [-3.6, -1.8, 0, 1.8, 3.6].forEach((lx) => {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), ledMat);
      dome.position.set(lx, 0.13, sz);
      group.add(dome);
    });
  });

  if (isLit) {
    const glowLight = new THREE.PointLight(0xe0f2fe, 1.8, 16);
    glowLight.position.set(0, 0.9, 0);
    group.add(glowLight);
  }
}

// 83. TV 4K IPS LCD Glass Panel
function buildTvPanelMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const isPowered = Boolean(state?.isPowered);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(10.0, 0.12, 5.8),
    new THREE.MeshStandardMaterial({
      color: isPowered ? 0x38bdf8 : 0x0f172a,
      emissive: isPowered ? 0x0284c7 : 0x000000,
      emissiveIntensity: isPowered ? 0.95 : 0,
      transparent: true,
      opacity: isPowered ? 0.65 : 0.38,
      roughness: 0.1,
      metalness: 0.15,
    })
  );
  glass.position.y = 0.06;

  // Color HDR test bar overlay when TV is powered
  if (isPowered) {
    const hdrBar = new THREE.Mesh(
      new THREE.BoxGeometry(8.6, 0.03, 4.4),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.45 })
    );
    hdrBar.position.y = 0.13;
    group.add(hdrBar);
  }

  group.add(glass);
}

// 84. TV Stereo Speaker Bar 2x15W
function buildTvSpeakerMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const enclosure = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.42, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 })
  );
  enclosure.position.y = 0.21;

  const coneMat = new THREE.MeshStandardMaterial({
    color: state?.isPowered ? 0x38bdf8 : 0x334155,
    metalness: 0.4,
    roughness: 0.4,
  });
  [-2.1, 2.1].forEach((cx) => {
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16), coneMat);
    cone.position.set(cx, 0.44, 0);
    group.add(cone);
  });

  group.add(enclosure);
}

// =========================================================================
// LAPTOP & SMART HOME 3D BUILDERS
// =========================================================================

function buildLaptopChassisMesh(group: THREE.Group, _comp: PlacedComponent) {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.22, 5.8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 })
  );
  base.position.y = 0.11;
  group.add(base);
}

function buildLaptopTopcaseMesh(group: THREE.Group, _comp: PlacedComponent) {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.16, 5.8),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0.45 })
  );
  frame.position.y = 0.08;
  const kb = new THREE.Mesh(
    new THREE.BoxGeometry(6.6, 0.08, 2.6),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  kb.position.set(0, 0.16, -0.4);
  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.04, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2 })
  );
  trackpad.position.set(0, 0.16, 1.8);
  group.add(frame, kb, trackpad);
}

function buildLaptopBatteryMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pack = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.28, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  pack.position.y = 0.14;
  group.add(pack);
}

function buildLaptopPmicMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.15, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.35 })
  );
  pcb.position.y = 0.08;
  const chip = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.12, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.7 })
  );
  chip.position.y = 0.18;
  group.add(pcb, chip);
}

function buildLaptopMotherboardMesh(group: THREE.Group, comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(7.0, 0.16, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 })
  );
  pcb.position.y = 0.08;
  const vrm = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.22, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 })
  );
  vrm.position.set(-1.5, 0.2, -0.6);
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x22c55e : 0x14532d,
      emissive: state?.isPowered ? 0x22c55e : 0x000000,
      emissiveIntensity: state?.isPowered ? 2 : 0,
    })
  );
  led.position.set(2.8, 0.2, 1.1);
  group.add(pcb, vrm, led);
  if (comp.params?.customMotherboardAssembly) {
    addCustomMotherboardChipsAndGoldWires(group, comp.params.customMotherboardAssembly);
  }
}

function buildLaptopCpuMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pkg = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.12, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 })
  );
  pkg.position.y = 0.06;
  const die = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.08, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.08 })
  );
  die.position.y = 0.14;
  group.add(pkg, die);
}

function buildLaptopSsdMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.1, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
  );
  pcb.position.y = 0.05;
  const nand = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.08, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x18181b })
  );
  nand.position.set(-0.4, 0.12, 0);
  group.add(pcb, nand);
}

function buildLaptopHeatsinkMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pipe = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.14, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.92, roughness: 0.2 })
  );
  pipe.position.y = 0.1;
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.18, 1.3),
    new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.25 })
  );
  plate.position.set(-1.1, 0.1, 0);
  group.add(pipe, plate);
}

function buildLaptopFanMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const housing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.28, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 })
  );
  housing.position.y = 0.14;
  const rotor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 0.3, 12),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x38bdf8 : 0x334155,
      metalness: 0.5,
    })
  );
  rotor.position.y = 0.16;
  group.add(housing, rotor);
}

function buildLaptopScreenMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 5.2, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.25 })
  );
  const display = new THREE.Mesh(
    new THREE.BoxGeometry(8.0, 4.7, 0.05),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x0ea5e9 : 0x020617,
      emissive: state?.isPowered ? 0x0369a1 : 0x000000,
      emissiveIntensity: state?.isPowered ? 1.1 : 0,
    })
  );
  display.position.z = 0.12;
  group.add(lid, display);
}

function buildSmartHomePsuMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.16, 3.5),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35 })
  );
  pcb.position.y = 0.08;
  const cell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 2.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.6 })
  );
  cell.rotation.x = Math.PI / 2;
  cell.position.set(-0.4, 0.48, 0);
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x22c55e : 0x14532d,
      emissive: state?.isPowered ? 0x22c55e : 0x000000,
      emissiveIntensity: 2,
    })
  );
  led.position.set(1.1, 0.2, 1.2);
  group.add(pcb, cell, led);
}

function buildSmartHomeControllerMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.16, 4.0),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
  );
  pcb.position.y = 0.08;
  const rfShield = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.2, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.92, roughness: 0.2 })
  );
  rfShield.position.set(0, 0.22, 0);
  const zigbeeLed = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x38bdf8 : 0x1e293b,
      emissive: state?.isPowered ? 0x38bdf8 : 0x000000,
      emissiveIntensity: state?.isPowered ? 2 : 0,
    })
  );
  zigbeeLed.position.set(1.4, 0.22, -1.4);
  group.add(pcb, rfShield, zigbeeLed);
}

function buildSmartHomeRelayMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.15, 3.5),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 })
  );
  pcb.position.y = 0.08;
  const relayMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
  [-1.05, -0.35, 0.35, 1.05].forEach((rz) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 0.55), relayMat);
    r.position.set(0.3, 0.36, rz);
    group.add(r);
  });
  if (state?.isPowered) {
    const ind = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2 })
    );
    ind.position.set(-1.0, 0.22, -1.2);
    group.add(ind);
  }
  group.add(pcb);
}

function buildSmartHomeSensorMesh(group: THREE.Group, _comp: PlacedComponent) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.12, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.35 })
  );
  pcb.position.y = 0.06;
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.14, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
  );
  cap.position.y = 0.16;
  group.add(pcb, cap);
}

function buildSmartHomePirMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.12, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.35 })
  );
  pcb.position.y = 0.06;
  const fresnel = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: state?.isPowered ? 0xfef08a : 0x000000,
      emissiveIntensity: state?.isPowered ? 0.5 : 0,
      roughness: 0.2,
    })
  );
  fresnel.position.y = 0.12;
  group.add(pcb, fresnel);
}

function buildSmartHomeOledMesh(group: THREE.Group, _comp: PlacedComponent, state?: any) {
  const pcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.14, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 })
  );
  pcb.position.y = 0.07;
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.08, 0.95),
    new THREE.MeshStandardMaterial({
      color: state?.isPowered ? 0x06b6d4 : 0x020617,
      emissive: state?.isPowered ? 0x0891b2 : 0x000000,
      emissiveIntensity: state?.isPowered ? 1.5 : 0,
    })
  );
  screen.position.y = 0.16;
  group.add(pcb, screen);
}





