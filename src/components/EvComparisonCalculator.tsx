import { useState, useEffect } from "preact/hooks";
import {
  formatRM,
  loadSaved,
  CAR_MODELS,
  CHARGING_COST_PROVIDERS,
} from "../data/evData";

const STORAGE_KEY = "evComparison";

const DEFAULTS = {
  carAModelIndex: 0,
  carAEfficiency: 6.5,
  carBModelIndex: 1,
  carBEfficiency: 6.5,
  providerIndex: 0,
  dailyDistance: 50,
};

const loadEvSaved = () => loadSaved(STORAGE_KEY, DEFAULTS);

export default function EvComparisonCalculator() {
  const [init] = useState(() => loadEvSaved());

  const [carAModelIndex, setCarAModelIndex] = useState(init.carAModelIndex);
  const [carAEfficiency, setCarAEfficiency] = useState(init.carAEfficiency);
  const [carBModelIndex, setCarBModelIndex] = useState(init.carBModelIndex);
  const [carBEfficiency, setCarBEfficiency] = useState(init.carBEfficiency);
  const [providerIndex, setProviderIndex] = useState(init.providerIndex);
  const [dailyDistance, setDailyDistance] = useState(init.dailyDistance);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          carAModelIndex,
          carAEfficiency,
          carBModelIndex,
          carBEfficiency,
          providerIndex,
          dailyDistance,
        }),
      );
    } catch {}
  }, [
    carAModelIndex,
    carAEfficiency,
    carBModelIndex,
    carBEfficiency,
    providerIndex,
    dailyDistance,
  ]);

  const carA = CAR_MODELS[carAModelIndex];
  const carB = CAR_MODELS[carBModelIndex];
  const provider = CHARGING_COST_PROVIDERS[providerIndex];
  const rate = provider.rate;

  const calcCost = (eff: number) => {
    const kWhPerDay = dailyDistance / Math.max(eff, 0.01);
    const daily = kWhPerDay * rate;
    return {
      daily,
      weekly: daily * 7,
      monthly: daily * 30,
      yearly: daily * 365,
    };
  };

  const costA = calcCost(carAEfficiency);
  const costB = calcCost(carBEfficiency);

  const savings = {
    daily: Math.abs(costA.daily - costB.daily),
    weekly: Math.abs(costA.weekly - costB.weekly),
    monthly: Math.abs(costA.monthly - costB.monthly),
    yearly: Math.abs(costA.yearly - costB.yearly),
  };

  const cheaperCar = costA.yearly <= costB.yearly ? carA.name : carB.name;
  const moreExpensiveCar = costA.yearly <= costB.yearly ? carB.name : carA.name;

  const maxMonthly = Math.max(costA.monthly, costB.monthly) || 1;

  // Extra info
  const rangeA = carA.kWh * carAEfficiency;
  const rangeB = carB.kWh * carBEfficiency;
  const fullChargeCostA = carA.kWh * rate;
  const fullChargeCostB = carB.kWh * rate;

  return (
    <div>
      {/* Charging Provider */}
      <div class="calc">
        <h2 class="section-title">Charging Provider</h2>
        <div class="field">
          <label>Provider &amp; Rate</label>
          <select
            value={providerIndex}
            onChange={(e) =>
              setProviderIndex(parseInt((e.target as HTMLSelectElement).value))
            }
          >
            {CHARGING_COST_PROVIDERS.map((p, i) => (
              <option key={i} value={i}>
                {p.name} — {formatRM(p.rate)}/kWh
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Car Selectors */}
      <div class="calc cars-section">
        <h2 class="section-title">Compare Two EVs</h2>
        <div class="cars-grid">
          <div class="car-card">
            <div class="field">
              <label>Car A</label>
              <select
                value={carAModelIndex}
                onChange={(e) =>
                  setCarAModelIndex(
                    parseInt((e.target as HTMLSelectElement).value),
                  )
                }
              >
                {CAR_MODELS.map((m, i) => (
                  <option key={i} value={i}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div class="field">
              <label>Efficiency (km/kWh)</label>
              <input
                type="number"
                value={carAEfficiency}
                min={0.1}
                step={0.1}
                onInput={(e) => {
                  const v = parseFloat((e.target as HTMLInputElement).value);
                  if (!isNaN(v) && v > 0) setCarAEfficiency(v);
                }}
              />
            </div>
            <p class="converted">
              Range: ~{rangeA.toFixed(0)} km &middot; Full charge:{" "}
              {formatRM(fullChargeCostA)}
            </p>
          </div>

          <div class="car-card">
            <div class="field">
              <label>Car B</label>
              <select
                value={carBModelIndex}
                onChange={(e) =>
                  setCarBModelIndex(
                    parseInt((e.target as HTMLSelectElement).value),
                  )
                }
              >
                {CAR_MODELS.map((m, i) => (
                  <option key={i} value={i}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div class="field">
              <label>Efficiency (km/kWh)</label>
              <input
                type="number"
                value={carBEfficiency}
                min={0.1}
                step={0.1}
                onInput={(e) => {
                  const v = parseFloat((e.target as HTMLInputElement).value);
                  if (!isNaN(v) && v > 0) setCarBEfficiency(v);
                }}
              />
            </div>
            <p class="converted">
              Range: ~{rangeB.toFixed(0)} km &middot; Full charge:{" "}
              {formatRM(fullChargeCostB)}
            </p>
          </div>
        </div>
      </div>

      {/* Distance */}
      <div class="calc">
        <h2 class="section-title">Distance Driven</h2>
        <div class="distance-grid">
          <div class="field">
            <label>Daily (km)</label>
            <input
              type="number"
              value={dailyDistance}
              min={0}
              step={1}
              onInput={(e) => {
                const v = parseFloat((e.target as HTMLInputElement).value);
                if (!isNaN(v) && v >= 0) setDailyDistance(v);
              }}
            />
          </div>
          <div class="field">
            <label>Weekly (km)</label>
            <input
              type="number"
              value={Math.round(dailyDistance * 7)}
              min={0}
              step={1}
              onInput={(e) => {
                const v = parseFloat((e.target as HTMLInputElement).value);
                if (!isNaN(v) && v >= 0) setDailyDistance(v / 7);
              }}
            />
          </div>
          <div class="field">
            <label>Monthly (km)</label>
            <input
              type="number"
              value={Math.round(dailyDistance * 30)}
              min={0}
              step={1}
              onInput={(e) => {
                const v = parseFloat((e.target as HTMLInputElement).value);
                if (!isNaN(v) && v >= 0) setDailyDistance(v / 30);
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div class="calc results-section">
        <h2 class="section-title">Cost Comparison</h2>
        <p class="fuel-price-display">
          Charging rate: <strong>{formatRM(rate)}</strong> / kWh (
          {provider.name})
        </p>

        <div class="bar-chart">
          <div class="bar-row">
            <span class="bar-label">{carA.name}</span>
            <div class="bar-track">
              <div
                class="bar-fill car-a"
                style={{
                  width: `${Math.min(
                    100,
                    (costA.monthly / maxMonthly) * 100,
                  )}%`,
                }}
              />
            </div>
            <span class="bar-value">{formatRM(costA.monthly)}</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">{carB.name}</span>
            <div class="bar-track">
              <div
                class="bar-fill car-b"
                style={{
                  width: `${Math.min(
                    100,
                    (costB.monthly / maxMonthly) * 100,
                  )}%`,
                }}
              />
            </div>
            <span class="bar-value">{formatRM(costB.monthly)}</span>
          </div>
          <p class="bar-caption">Monthly charging cost</p>
        </div>

        <div class="savings-banner">
          <svg
            class="savings-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <span>
            <strong>{cheaperCar}</strong> saves{" "}
            <strong>{formatRM(savings.monthly)}</strong> per month vs{" "}
            <strong>{moreExpensiveCar}</strong>
          </span>
        </div>

        <div class="results-table">
          <div class="results-header">
            <span>Period</span>
            <span>{carA.name}</span>
            <span>{carB.name}</span>
            <span>Savings</span>
          </div>
          {[
            {
              label: "Daily",
              a: costA.daily,
              b: costB.daily,
              s: savings.daily,
            },
            {
              label: "Weekly",
              a: costA.weekly,
              b: costB.weekly,
              s: savings.weekly,
            },
            {
              label: "Monthly",
              a: costA.monthly,
              b: costB.monthly,
              s: savings.monthly,
            },
            {
              label: "Yearly",
              a: costA.yearly,
              b: costB.yearly,
              s: savings.yearly,
            },
          ].map((row) => (
            <div class="results-row" key={row.label}>
              <span class="period">{row.label}</span>
              <span>{formatRM(row.a)}</span>
              <span>{formatRM(row.b)}</span>
              <span class="savings">{formatRM(row.s)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
