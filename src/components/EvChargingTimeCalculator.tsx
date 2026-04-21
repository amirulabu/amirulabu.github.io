import { useState, useEffect } from "preact/hooks";
import { CAR_MODELS, CHARGER_TYPES, formatRM, loadSaved } from "../data/evData";

// Shared key for fields that persist across both cost & time tabs
const SHARED_KEY = "evChargingShared";
const OWN_KEY = "evChargingTime";

const SHARED_DEFAULTS = {
  modelIndex: 0,
  batteryCapacity: CAR_MODELS[0].kWh,
  currentPercent: 20,
  targetPercent: 80,
  useCustomCapacity: false,
};

const OWN_DEFAULTS = {
  chargerIndex: 0,
};

function formatTime(hours: number): string {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// Simple charging time model:
// - Below 80%: charge at ~90% of max power (real-world losses)
// - Above 80%: power tapers linearly from 90% down to ~30% at 100%
// This gives a realistic estimate for DC fast charging taper
function estimateChargeTime(
  batteryKWh: number,
  fromPercent: number,
  toPercent: number,
  maxKw: number,
): number {
  const from80 = Math.min(fromPercent, 80);
  const to80 = Math.min(toPercent, 80);
  const maxEfficiency = 0.9;

  let totalHours = 0;

  // Phase 1: fromPercent to 80% (or toPercent if < 80%)
  if (to80 > from80) {
    const kWh1 = batteryKWh * ((to80 - from80) / 100);
    totalHours += kWh1 / (maxKw * maxEfficiency);
  }

  // Phase 2: 80% to toPercent (taper phase)
  if (toPercent > 80 && toPercent > fromPercent) {
    const from = Math.max(fromPercent, 80);
    const to = toPercent;
    // Split taper into small steps for more accuracy
    const steps = 20;
    const stepPercent = (to - from) / steps;
    for (let i = 0; i < steps; i++) {
      const pct = from + stepPercent * (i + 0.5);
      // Taper: at 80% → 90% power, at 100% → ~30% power
      const taperFactor =
        maxEfficiency - (maxEfficiency - 0.3) * ((pct - 80) / 20);
      const kWh = batteryKWh * (stepPercent / 100);
      totalHours += kWh / (maxKw * taperFactor);
    }
  }

  return totalHours;
}

export default function EvChargingTimeCalculator() {
  const [shared] = useState(() => loadSaved(SHARED_KEY, SHARED_DEFAULTS));
  const [own] = useState(() => loadSaved(OWN_KEY, OWN_DEFAULTS));

  const [modelIndex, setModelIndex] = useState(shared.modelIndex);
  const [batteryCapacity, setBatteryCapacity] = useState(
    shared.batteryCapacity,
  );
  const [currentPercent, setCurrentPercent] = useState(shared.currentPercent);
  const [targetPercent, setTargetPercent] = useState(shared.targetPercent);
  const [useCustomCapacity, setUseCustomCapacity] = useState(
    shared.useCustomCapacity,
  );
  const [chargerIndex, setChargerIndex] = useState(own.chargerIndex);

  // Persist shared fields to shared key
  useEffect(() => {
    try {
      localStorage.setItem(
        SHARED_KEY,
        JSON.stringify({
          modelIndex,
          batteryCapacity,
          currentPercent,
          targetPercent,
          useCustomCapacity,
        }),
      );
    } catch {}
  }, [
    modelIndex,
    batteryCapacity,
    currentPercent,
    targetPercent,
    useCustomCapacity,
  ]);

  // Persist own fields to own key
  useEffect(() => {
    try {
      localStorage.setItem(OWN_KEY, JSON.stringify({ chargerIndex }));
    } catch {}
  }, [chargerIndex]);

  const effectiveTarget = Math.max(targetPercent, currentPercent);
  const kWhNeeded =
    batteryCapacity * ((effectiveTarget - currentPercent) / 100);
  const selectedCharger = CHARGER_TYPES[chargerIndex];

  const estimatedTime = estimateChargeTime(
    batteryCapacity,
    currentPercent,
    effectiveTarget,
    selectedCharger.maxKw,
  );

  // Average charging power (actual)
  const avgPower = kWhNeeded / estimatedTime;

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
              {car.name} ({car.kWh} kWh · AC {car.maxAcKw}kW · DC {car.maxDcKw}
              kW)
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
        <label>Charger Type</label>
        <select
          class="select-input"
          value={chargerIndex}
          onChange={(e) =>
            setChargerIndex(parseInt((e.target as HTMLSelectElement).value))
          }
        >
          {CHARGER_TYPES.map((c, i) => (
            <option key={i} value={i}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div class="results">
        <div class="result-row monthly">
          <span>Estimated Time</span>
          <span class="value">{formatTime(estimatedTime)}</span>
        </div>
        <div class="result-row">
          <span>Energy Needed</span>
          <span class="value">{kWhNeeded.toFixed(1)} kWh</span>
        </div>
        <div class="result-row">
          <span>Charger Power</span>
          <span class="value">{selectedCharger.maxKw} kW</span>
        </div>
        <div class="result-row">
          <span>Avg. Charging Power</span>
          <span class="value">{avgPower.toFixed(1)} kW</span>
        </div>
        <div class="result-row">
          <span>Avg. Charging Speed</span>
          <span class="value">
            {batteryCapacity > 0
              ? ((avgPower / batteryCapacity) * 100).toFixed(1)
              : "0"}
            %/h
          </span>
        </div>
      </div>

      <div class="comparison">
        <h3 class="comparison-title">Time Comparison</h3>
        <p class="comparison-subtitle">
          Same charge ({kWhNeeded.toFixed(1)} kWh, {currentPercent}% →{" "}
          {effectiveTarget}
          %) across all charger types
        </p>
        <div class="comparison-table">
          {CHARGER_TYPES.map((c, i) => {
            const time = estimateChargeTime(
              batteryCapacity,
              currentPercent,
              effectiveTarget,
              c.maxKw,
            );
            const isSelected = i === chargerIndex;
            return (
              <div
                key={i}
                class={`comparison-row ${isSelected ? "selected" : ""}`}
              >
                <span class="comparison-name">{c.name}</span>
                <span class="comparison-cost">{formatTime(time)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p class="note">
        * Times are estimates. Actual charging speed depends on battery
        temperature, state of charge, vehicle onboard charger limits, and
        charger derating. DC charging tapers significantly above 80%.
      </p>
    </div>
  );
}
