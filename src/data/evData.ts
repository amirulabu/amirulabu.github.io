// EV models available in Malaysia with battery & charging specs
// Sources: Official Malaysian spec sheets, paultan.org, carz.com.my, Zigwheels MY, Wapcar MY
// Last updated: April 2026

export const CAR_MODELS = [
  // === BYD ===
  { name: "BYD Dolphin Dynamic", kWh: 44.92, maxAcKw: 7, maxDcKw: 60 },
  { name: "BYD Dolphin Premium", kWh: 60.48, maxAcKw: 7, maxDcKw: 80 },
  { name: "BYD Atto 2", kWh: 51.13, maxAcKw: 7, maxDcKw: 82 },
  { name: "BYD Atto 3 Standard", kWh: 49.92, maxAcKw: 7, maxDcKw: 70 },
  { name: "BYD Atto 3 Extended", kWh: 60.48, maxAcKw: 7, maxDcKw: 80 },
  { name: "BYD M6 Standard", kWh: 55.4, maxAcKw: 7, maxDcKw: 89 },
  { name: "BYD M6 Extended", kWh: 71.8, maxAcKw: 7, maxDcKw: 115 },
  { name: "BYD Seal Dynamic", kWh: 61.44, maxAcKw: 7, maxDcKw: 110 },
  { name: "BYD Seal Premium", kWh: 82.56, maxAcKw: 7, maxDcKw: 150 },
  { name: "BYD Seal Performance", kWh: 82.56, maxAcKw: 7, maxDcKw: 150 },
  { name: "BYD Seal 6 Dynamic", kWh: 56.64, maxAcKw: 7, maxDcKw: 100 },
  { name: "BYD Seal 6 Premium", kWh: 56.64, maxAcKw: 7, maxDcKw: 100 },

  // === Proton ===
  { name: "Proton e.MAS 5 Prime", kWh: 30.12, maxAcKw: 6.6, maxDcKw: 53 },
  { name: "Proton e.MAS 5 Premium", kWh: 40.16, maxAcKw: 6.6, maxDcKw: 71 },
  { name: "Proton e.MAS 7 Prime", kWh: 49.52, maxAcKw: 11, maxDcKw: 80 },
  { name: "Proton e.MAS 7 Premium", kWh: 60.22, maxAcKw: 11, maxDcKw: 100 },

  // === Tesla ===
  { name: "Tesla Model 3 RWD", kWh: 60, maxAcKw: 11, maxDcKw: 170 },
  { name: "Tesla Model 3 Long Range", kWh: 78.1, maxAcKw: 11, maxDcKw: 250 },
  { name: "Tesla Model 3 Performance", kWh: 78.1, maxAcKw: 11, maxDcKw: 250 },
  { name: "Tesla Model Y RWD", kWh: 60, maxAcKw: 11, maxDcKw: 170 },
  { name: "Tesla Model Y Long Range", kWh: 78.1, maxAcKw: 11, maxDcKw: 250 },

  // === MG ===
  { name: "MG4 Standard", kWh: 51, maxAcKw: 11, maxDcKw: 117 },
  { name: "MG4 Lux", kWh: 64, maxAcKw: 11, maxDcKw: 140 },
  { name: "MG4 Extended Range", kWh: 77, maxAcKw: 11, maxDcKw: 144 },
  { name: "MG ZS EV", kWh: 51.1, maxAcKw: 11, maxDcKw: 76 },

  // === Neta ===
  { name: "Neta V", kWh: 38.5, maxAcKw: 6.6, maxDcKw: 80 },

  // === Chery ===
  { name: "Chery Omoda E5", kWh: 61.06, maxAcKw: 11, maxDcKw: 80 },

  // === GWM ===
  { name: "GWM Ora Good Cat 400", kWh: 47.8, maxAcKw: 11, maxDcKw: 60 },
  { name: "GWM Ora Good Cat 500", kWh: 63.1, maxAcKw: 11, maxDcKw: 80 },
  { name: "GWM Ora 07", kWh: 83, maxAcKw: 11, maxDcKw: 88 },

  // === Deepal ===
  { name: "Deepal S07", kWh: 79.97, maxAcKw: 11, maxDcKw: 90 },

  // === smart ===
  { name: "smart #1", kWh: 66, maxAcKw: 22, maxDcKw: 150 },
  { name: "smart #3", kWh: 66, maxAcKw: 22, maxDcKw: 150 },

  // === Hyundai ===
  { name: "Hyundai Ioniq 5 Lite", kWh: 58, maxAcKw: 11, maxDcKw: 350 },
  { name: "Hyundai Ioniq 5 Plus", kWh: 58, maxAcKw: 11, maxDcKw: 350 },
  { name: "Hyundai Ioniq 5 Max", kWh: 72.6, maxAcKw: 11, maxDcKw: 350 },
  { name: "Hyundai Ioniq 6 Lite", kWh: 53, maxAcKw: 11, maxDcKw: 350 },
  { name: "Hyundai Ioniq 6 Max RWD", kWh: 77.4, maxAcKw: 11, maxDcKw: 350 },
  { name: "Hyundai Ioniq 6 Max AWD", kWh: 77.4, maxAcKw: 11, maxDcKw: 350 },
  { name: "Hyundai Kona Electric", kWh: 39.2, maxAcKw: 7.2, maxDcKw: 100 },

  // === Kia ===
  { name: "Kia EV6 GT-Line AWD", kWh: 77.4, maxAcKw: 11, maxDcKw: 350 },
  { name: "Kia Niro EV", kWh: 64.8, maxAcKw: 11, maxDcKw: 80 },

  // === Nissan ===
  { name: "Nissan Leaf", kWh: 40, maxAcKw: 6.6, maxDcKw: 50 },

  // === BMW ===
  { name: "BMW iX1 eDrive20L", kWh: 66.5, maxAcKw: 11, maxDcKw: 130 },
  { name: "BMW i4 eDrive35", kWh: 70.3, maxAcKw: 11, maxDcKw: 180 },
  { name: "BMW i4 eDrive40", kWh: 83.9, maxAcKw: 11, maxDcKw: 205 },
  { name: "BMW i4 M50", kWh: 83.9, maxAcKw: 11, maxDcKw: 205 },
  { name: "BMW iX xDrive50", kWh: 100.6, maxAcKw: 11, maxDcKw: 200 },

  // === Mercedes-Benz ===
  { name: "Mercedes EQA 250", kWh: 66.5, maxAcKw: 11, maxDcKw: 100 },
  { name: "Mercedes EQB 250+", kWh: 70.5, maxAcKw: 11, maxDcKw: 100 },

  // === Volvo ===
  { name: "Volvo XC40 Recharge", kWh: 82, maxAcKw: 11, maxDcKw: 200 },
  { name: "Volvo EC40", kWh: 82, maxAcKw: 11, maxDcKw: 200 },
] as const;

export type CarModel = (typeof CAR_MODELS)[number];

export const CHARGING_COST_PROVIDERS = [
  { name: "Home - TNB Standard", rate: 0.4443, type: "home" },
  { name: "Home - TNB Off-Peak (ToU)", rate: 0.2443, type: "home" },
  { name: "Gentari AC", rate: 1.0, type: "public-ac" },
  { name: "Gentari DC (Destination)", rate: 1.6, type: "public-dc" },
  { name: "Gentari DC (Highway)", rate: 1.7, type: "public-dc" },
  { name: "DC Handal DC", rate: 1.2, type: "public-dc" },
  { name: "Tesla Supercharger", rate: 1.13, type: "public-dc" },
  { name: "Shell Recharge AC", rate: 1.1, type: "public-ac" },
  { name: "Shell Recharge DC", rate: 2.2, type: "public-dc" },
] as const;

// Charger types for time estimation
// maxKw: maximum power this charger type can deliver
// avgEfficiency: real-world charging efficiency (accounts for losses, taper above 80%)
export const CHARGER_TYPES = [
  {
    name: "Portable / Granny (8A · 1.8 kW)",
    maxKw: 1.84,
    category: "home",
  },
  {
    name: "Portable / Granny (10A · 2.3 kW)",
    maxKw: 2.3,
    category: "home",
  },
  {
    name: "Portable / Granny (12A UK plug max · 2.8 kW)",
    maxKw: 2.76,
    category: "home",
  },
  {
    name: "Portable / Granny (13A · 3.0 kW)",
    maxKw: 2.99,
    category: "home",
  },
  {
    name: "Portable / Granny (16A · 3.7 kW)",
    maxKw: 3.68,
    category: "home",
  },
  { name: "Home Wallbox (7.4 kW AC)", maxKw: 7.4, category: "home" },
  { name: "Home Wallbox (11 kW AC)", maxKw: 11, category: "home" },
  { name: "Home Wallbox (22 kW AC)", maxKw: 22, category: "home" },
  { name: "Public AC (7 kW)", maxKw: 7, category: "public-ac" },
  { name: "Public AC (11 kW)", maxKw: 11, category: "public-ac" },
  { name: "Public AC (22 kW)", maxKw: 22, category: "public-ac" },
  { name: "DC Fast (50 kW)", maxKw: 50, category: "public-dc" },
  { name: "DC Fast (60 kW)", maxKw: 60, category: "public-dc" },
  { name: "DC Fast (80 kW)", maxKw: 80, category: "public-dc" },
  { name: "DC Fast (120 kW)", maxKw: 120, category: "public-dc" },
  { name: "DC Fast (180 kW)", maxKw: 180, category: "public-dc" },
  { name: "DC Ultra-Fast (350 kW)", maxKw: 350, category: "public-dc" },
] as const;

export function formatRM(n: number) {
  return (
    "RM " +
    n.toLocaleString("en-MY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function loadSaved<T extends Record<string, unknown>>(
  key: string,
  defaults: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}
