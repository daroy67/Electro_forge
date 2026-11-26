import { CareerChallenge } from "../types";

export const CAREER_CHALLENGES: CareerChallenge[] = [
  {
    id: "challenge-1-first-light",
    level: 1,
    title: "Project 01: First Light & Ohm's Law",
    subtitle: "Safely illuminate an LED without thermal runaway",
    category: "Fundamentals",
    description:
      "Welcome, Engineer! Your first mission is to light an LED from a 5V power source. But beware: semiconductor diodes have virtually zero internal resistance once forward-biased. Connecting an LED directly across 5V will burn it out within milliseconds! You must calculate and insert a suitable current-limiting resistor using Ohm's Law (V = I × R).",
    objectives: [
      { id: "obj1", text: "Place a 5V power source (Arduino Uno) and an LED on the bench", completed: false },
      { id: "obj2", text: "Wire a 220Ω resistor in series between 5V/D13 and the LED Anode (+)", completed: false },
      { id: "obj3", text: "Connect the LED Cathode (-) back to GND to complete the circuit loop", completed: false },
      { id: "obj4", text: "Run simulation: verify LED is safely glowing without blowing up", completed: false },
    ],
    starterComponents: [
      { type: "arduino_uno", position: [-3.5, 0, 0] },
      { type: "led", position: [2.5, 0, 0], params: { color: "green" } },
      { type: "resistor", position: [0, 0, 0], params: { resistance: 220 } },
    ],
    starterCode: `// Project 01: First Light
void setup() {
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH); // Turn LED ON
}

void loop() {
  // Continuous illumination
}`,
    constraints: {
      maxBudget: 25.0,
      maxPowerMw: 150,
      requiredComponents: ["arduino_uno", "led", "resistor"],
    },
    hints: [
      "Ohm's Law is V = I × R. For 5V supply and a 2.0V red/green LED drop, V_resistor = 5V - 2V = 3V.",
      "To limit current to a safe 15mA (0.015A): R = 3V / 0.015A = 200Ω. A 220Ω resistor is the standard match!",
      "The Anode is the positive (longer) terminal, and Cathode is negative (ground).",
    ],
    xpReward: 100,
    badgeReward: {
      id: "badge-first-light",
      name: "Photon Awakener",
      icon: "Lightbulb",
    },
  },

  {
    id: "challenge-2-tactile-switch",
    level: 2,
    title: "Project 02: The Pushbutton Interrupter",
    subtitle: "Digital inputs, contact bounce & pull-down logic",
    category: "Fundamentals",
    description:
      "Mechanical switches let humans control electronic systems. In this challenge, wire a tactile pushbutton to control an indicator LED. Learn how digital inputs work and why floating microcontroller pins cause unpredictable erratic behavior without pull-up or pull-down references.",
    objectives: [
      { id: "obj1", text: "Connect pushbutton switch between 5V power and Digital Pin D2", completed: false },
      { id: "obj2", text: "Connect an LED with series 220Ω resistor to Pin D13", completed: false },
      { id: "obj3", text: "Run simulation and click the pushbutton in 3D to toggle the LED", completed: false },
    ],
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "pushbutton", position: [0, 0, 0] },
      { type: "resistor", position: [2, 0, -1], params: { resistance: 220 } },
      { type: "led", position: [3.5, 0, -1], params: { color: "red" } },
    ],
    starterCode: `// Project 02: Pushbutton Read
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP); // Use internal pull-up resistor!
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState == LOW) { // Pressed (pulled to GND)
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
    constraints: {
      maxBudget: 30.0,
      maxPowerMw: 200,
    },
    hints: [
      "In modern microcontrollers like the ATmega328P, you can use INPUT_PULLUP in code to avoid needing an external pull-up resistor!",
      "When using INPUT_PULLUP, wire one pin of the button to D2 and the other directly to GND.",
    ],
    xpReward: 150,
    badgeReward: {
      id: "badge-button-master",
      name: "Gate Keeper",
      icon: "ToggleLeft",
    },
  },

  {
    id: "challenge-3-ultrasonic-radar",
    level: 3,
    title: "Project 03: Ultrasonic Proximity Radar",
    subtitle: "Acoustic time-of-flight distance calculation",
    category: "Sensors & Logic",
    description:
      "Robots navigate their environment using sensors. The HC-SR04 ultrasonic sensor transmits a 40kHz sonic burst and measures the echo return time. Calculate the distance using the speed of sound in air (343 m/s) and trigger an alert when an obstacle is closer than 20cm!",
    objectives: [
      { id: "obj1", text: "Place HC-SR04 sensor and connect VCC to 5V and GND to GND", completed: false },
      { id: "obj2", text: "Connect Trig to Pin D9 and Echo to Pin D10", completed: false },
      { id: "obj3", text: "Connect warning LED to Pin D13", completed: false },
      { id: "obj4", text: "Test simulation: adjust obstacle slider under 20cm to trigger warning", completed: false },
    ],
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "ultrasonic_sensor", position: [1.5, 0, 0], params: { distanceCm: 45 } },
      { type: "led", position: [4, 0, 0], params: { color: "blue" } },
      { type: "resistor", position: [3, 0, 1], params: { resistance: 220 } },
    ],
    starterCode: `// Project 03: Ultrasonic Distance Monitor
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int ALERT_LED = 13;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(ALERT_LED, OUTPUT);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distanceCm = duration * 0.034 / 2.0;

  Serial.print("Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  if (distanceCm < 20.0) {
    digitalWrite(ALERT_LED, HIGH); // Danger: Obstacle too close!
  } else {
    digitalWrite(ALERT_LED, LOW);
  }
  delay(100);
}`,
    constraints: {
      maxBudget: 35.0,
      maxPowerMw: 300,
    },
    hints: [
      "The pulse travel time is round-trip (sensor -> target -> sensor), so divide time by 2!",
      "Speed of sound is 343 m/s = 0.0343 cm/microsecond.",
    ],
    xpReward: 250,
    badgeReward: {
      id: "badge-sonar-scout",
      name: "Sonar Navigator",
      icon: "Radar",
    },
  },

  {
    id: "challenge-4-servo-positioning",
    level: 4,
    title: "Project 04: Precision Robotic Arm Joint",
    subtitle: "Pulse-Width Modulation (PWM) angle positioning",
    category: "Automation & Robotics",
    description:
      "Servos are essential for robotic joints, steering linkages, and camera gimbals. Unlike standard DC motors that spin continuously, servos lock into a commanded angular position (0° to 180°) via precise 50Hz PWM timing. Wire an SG90 servo and command it through smooth sweeping motions.",
    objectives: [
      { id: "obj1", text: "Wire Servo VCC to 5V and GND to GND", completed: false },
      { id: "obj2", text: "Connect Servo Signal wire to PWM pin D9", completed: false },
      { id: "obj3", text: "Run simulation and verify the servo horn rotates to the commanded target angle", completed: false },
    ],
    starterComponents: [
      { type: "arduino_uno", position: [-3.5, 0, 0] },
      { type: "servo_motor", position: [2.5, 0, 0], params: { angleDeg: 0 } },
    ],
    starterCode: `#include <Servo.h>

Servo myJoint;
const int SERVO_PIN = 9;

void setup() {
  myJoint.attach(SERVO_PIN);
}

void loop() {
  // Sweep from 0 to 180 degrees
  for (int pos = 0; pos <= 180; pos += 45) {
    myJoint.write(pos);
    delay(500);
  }
  for (int pos = 180; pos >= 0; pos -= 45) {
    myJoint.write(pos);
    delay(500);
  }
}`,
    constraints: {
      maxBudget: 32.0,
      maxPowerMw: 500,
    },
    hints: [
      "Servos draw sudden surge currents during rapid acceleration. In real physical prototypes, decoupling capacitors (100uF) prevent brownout resets on the Arduino!",
      "A 1.0ms pulse corresponds to 0°, 1.5ms to 90°, and 2.0ms to 180°.",
    ],
    xpReward: 300,
    badgeReward: {
      id: "badge-servo-mechanic",
      name: "Kinematic Architect",
      icon: "Cpu",
    },
  },

  {
    id: "challenge-5-smart-watering",
    level: 5,
    title: "Project 05: Smart Botanical Hydration",
    subtitle: "Closed-loop automated irrigation with strict power budget",
    category: "Automation & Robotics",
    description:
      "Design an automated plant irrigation system! Measure soil dryness using an analog moisture/potentiometer transducer. When moisture drops below 30%, activate the water pump motor while flashing an LED indicator. You must stay under a $40 total component budget and 450mA peak current!",
    objectives: [
      { id: "obj1", text: "Connect soil sensor / potentiometer wiper to Analog In A0", completed: false },
      { id: "obj2", text: "Connect DC pump motor to digital driver pin D7 and GND", completed: false },
      { id: "obj3", text: "Connect green hydration status LED to D13 with 220Ω resistor", completed: false },
      { id: "obj4", text: "Demonstrate closed-loop pumping when soil sensor drops below threshold", completed: false },
    ],
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "potentiometer", position: [0, 0, -2], params: { positionPercent: 20 } },
      { type: "dc_motor", position: [3, 0, -1] },
      { type: "led", position: [2, 0, 2], params: { color: "yellow" } },
      { type: "resistor", position: [0.5, 0, 2], params: { resistance: 220 } },
    ],
    starterCode: `// Project 05: Closed-Loop Smart Irrigation
const int MOISTURE_PIN = A0;
const int PUMP_PIN = 7;
const int STATUS_LED = 13;

const int DRY_THRESHOLD = 350; // ADC value under which soil is dry

void setup() {
  Serial.begin(9600);
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
}

void loop() {
  int moisture = analogRead(MOISTURE_PIN);
  Serial.print("Soil Moisture Level: ");
  Serial.println(moisture);

  if (moisture < DRY_THRESHOLD) {
    // Soil is parched: activate pump!
    digitalWrite(STATUS_LED, HIGH);
    digitalWrite(PUMP_PIN, HIGH);
  } else {
    // Soil is hydrated: standby
    digitalWrite(STATUS_LED, LOW);
    digitalWrite(PUMP_PIN, LOW);
  }
  delay(200);
}`,
    constraints: {
      maxBudget: 40.0,
      maxPowerMw: 450,
      requiredComponents: ["arduino_uno", "dc_motor", "potentiometer", "led"],
    },
    hints: [
      "In physical hardware, DC inductive motors should never be powered directly from an MCU GPIO pin because of the 40mA absolute pin limit and reverse inductive kickback (flyback). Always use a transistor switch or relay!",
    ],
    xpReward: 450,
    badgeReward: {
      id: "badge-green-thumb",
      name: "Bio-Automation Pioneer",
      icon: "Sprout",
    },
  },

  {
    id: "challenge-6-weather-telemetry",
    level: 6,
    title: "Project 06: Smart Weather Telemetry Station",
    subtitle: "I2C protocol communication & environmental monitoring",
    category: "IoT & Systems",
    description:
      "Modern engineering relies heavily on digital bus protocols like I2C (Inter-Integrated Circuit) to reduce wiring complexity. Connect an alphanumeric 16x2 LCD display via I2C (SDA and SCL) and a temperature sensor to construct a real-time environmental monitor.",
    objectives: [
      { id: "obj1", text: "Wire LCD 1602 SDA to Arduino Pin A4 and SCL to Pin A5", completed: false },
      { id: "obj2", text: "Power LCD with 5V and GND", completed: false },
      { id: "obj3", text: "Connect TMP36 temperature sensor Vout to Pin A0", completed: false },
      { id: "obj4", text: "Flash code and verify temperature telemetry displays on the 3D LCD screen", completed: false },
    ],
    starterComponents: [
      { type: "arduino_uno", position: [-4, 0, 0] },
      { type: "lcd_1602_i2c", position: [2.5, 0, -1] },
      { type: "temp_sensor", position: [0, 0, 2], params: { temperatureC: 26.5 } },
    ],
    starterCode: `// Project 06: I2C Weather Station
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
const int TEMP_PIN = A0;

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("ElectroForge Lab");
}

void loop() {
  int sensorVal = analogRead(TEMP_PIN);
  float voltage = (sensorVal / 1024.0) * 5.0;
  float tempC = (voltage - 0.5) * 100.0;

  lcd.setCursor(0, 1);
  lcd.print("Temp: ");
  lcd.print(tempC, 1);
  lcd.print((char)223); // Degree symbol
  lcd.print("C");
  
  delay(1000);
}`,
    constraints: {
      maxBudget: 50.0,
      maxPowerMw: 600,
    },
    hints: [
      "On the Arduino Uno, I2C lines are multiplexed on analog pins: A4 is SDA (Serial Data) and A5 is SCL (Serial Clock).",
      "I2C allows up to 127 unique sensors and displays to communicate over just two shared data wires!",
    ],
    xpReward: 600,
    badgeReward: {
      id: "badge-iot-master",
      name: "Telemetry Wizard",
      icon: "CloudSun",
    },
  },
];
