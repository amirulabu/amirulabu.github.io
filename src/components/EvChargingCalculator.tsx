import { useState, useEffect } from "preact/hooks";

const STORAGE_KEY = "evChargingCalc";

const CAR_MODELS = [
  { name: "BYD Dolphin", kWh: 44.9 },
  { name: "BYD Atto 2", kWh: 51.13 },
  { name: "BYD Atto 3", kWh: 60.48 },
  { name: "BYD M6", kWh: 55.4 },
  { name: "Tesla Model 3", kWh: 60 },
  { name: "Tesla Model Y", kWh: 60 },
  { name: "Proton e.MAS 5", kWh: 49.92 },
  { name: "Neta V", kWh: 38.5 },
  { name: "MG4 Standard", kWh: 49.52 },
  { name: "MG4 Premium", kWh: 60.22 },
] as const;

const PROVIDERS = [
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

const DEFAULTS = {
  modelIndex: 0,
  batteryCapacity: CAR_MODELS[0].kWh,
  currentPercent: 20,
  targetPercent: 80,
  providerIndex: 0,
  useCustomCapacity: false,
};

function loadSaved<T extends Record<string, unknown>>(
  key: string,
  defaults: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return defaults;
}

const formatRM = (n: number) =>
  "RM " +
  n.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function EvChargingCalculator() {
  const [init] = useState(() => loadSaved(STORAGE_KEY, DEFAULTS));
  const [modelIndex, setModelIndex] = useState(init.modelIndex);
  const [batteryCapacity, setBatteryCapacity] = useState(init.batteryCapacity);
  const [currentPercent, setCurrentPercent] = useState(init.currentPercent);
  const [targetPercent, setTargetPercent] = useState(init.targetPercent);
  const [providerIndex, setProviderIndex] = useState(init.providerIndex);
  const [useCustomCapacity, setUseCustomCapacity] = useState(
    init.useCustomCapacity,
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          modelIndex,
          batteryCapacity,
          currentPercent,
          targetPercent,
          providerIndex,
          useCustomCapacity,
        }),
      );
    } catch {}
  }, [
    modelIndex,
    batteryCapacity,
    currentPercent,
    targetPercent,
    providerIndex,
    useCustomCapacity,
  ]);

  const effectiveTarget = Math.max(targetPercent, currentPercent);
  const kWhNeeded =
    batteryCapacity * ((effectiveTarget - currentPercent) / 100);
  const selectedProvider = PROVIDERS[providerIndex];
  const estimatedCost = kWhNeeded * selectedProvider.rate;

  return (
    <div class="calc">
      <div class="field">
        <label>Car Model</label>
        <select
          class="select-input"
          value={useCustomCapacity ? "custom" : String(modelIndex)}
          onChange={(e) => {
            const val = (e.target as HTMLSelectElement).value;
            if (val === "custom") {
              setUseCustomCapacity(true);
            } else {
              setUseCustomCapacity(false);
              const idx = parseInt(val);
              setModelIndex(idx);
              setBatteryCapacity(CAR_MODELS[idx].kWh);
            }
          }}
        >
          {CAR_MODELS.map((car, i) => (
            <option key={i} value={String(i)}>
              {car.name} ({car.kWh} kWh)
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </div>

      {useCustomCapacity && (
        <div class="field">
          <label>Battery Capacity (kWh)</label>
          <input
            type="number"
            value={batteryCapacity}
            min={1}
            max={200}
            step={0.1}
            onInput={(e) => {
              const v = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(v) && v > 0) setBatteryCapacity(v);
            }}
          />
        </div>
      )}

      <div class="field">
        <label>
          Current Battery: <strong>{currentPercent}%</strong>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={currentPercent}
          onInput={(e) =>
            setCurrentPercent(parseInt((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div class="field">
        <label>
          Target Battery: <strong>{effectiveTarget}%</strong>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={effectiveTarget}
          onInput={(e) =>
            setTargetPercent(parseInt((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div class="field">
        <label>Charging Provider</label>
        <select
          class="select-input"
          value={providerIndex}
          onChange={(e) =>
            setProviderIndex(parseInt((e.target as HTMLSelectElement).value))
          }
        >
          {PROVIDERS.map((p, i) => (
            <option key={i} value={i}>
              {p.name} — {formatRM(p.rate)}/kWh
            </option>
          ))}
        </select>
      </div>

      <div class="results">
        <div class="result-row monthly">
          <span>Estimated Cost</span>
          <span class="value">{formatRM(estimatedCost)}</span>
        </div>
        <div class="result-row">
          <span>Energy Needed</span>
          <span class="value">{kWhNeeded.toFixed(1)} kWh</span>
        </div>
        <div class="result-row">
          <span>Rate</span>
          <span class="value">{formatRM(selectedProvider.rate)}/kWh</span>
        </div>
      </div>

      <div class="comparison">
        <h3 class="comparison-title">Cost Comparison</h3>
        <p class="comparison-subtitle">
          Same charge ({kWhNeeded.toFixed(1)} kWh) across all providers
        </p>
        <div class="comparison-table">
          {PROVIDERS.map((p, i) => {
            const cost = kWhNeeded * p.rate;
            const isSelected = i === providerIndex;
            return (
              <div
                key={i}
                class={`comparison-row ${isSelected ? "selected" : ""}`}
              >
                <span class="comparison-name">{p.name}</span>
                <span class="comparison-cost">{formatRM(cost)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p class="note">
        * Prices are approximate and may vary by location. Last updated April
        2026.
      </p>
    </div>
  );
}
