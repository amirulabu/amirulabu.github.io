import { useState, useEffect } from "preact/hooks";
import { formatRM, loadSaved } from "../data/evData";

const STORAGE_KEY = "fuelComparison";

const FUEL_PRESETS = [
  { name: "RON95 (Subsidized)", price: 1.99 },
  { name: "RON97", price: 3.47 },
  { name: "Diesel", price: 2.15 },
  { name: "Custom", price: null },
];

const DEFAULTS = {
  carAName: "Car A",
  carAEfficiency: 15,
  carBName: "Car B",
  carBEfficiency: 20,
  unit: "kmpl" as "kmpl" | "lp100km",
  fuelPresetIndex: 0,
  customFuelPrice: 2.5,
  dailyDistance: 50,
};

const loadFuelSaved = () => loadSaved(STORAGE_KEY, DEFAULTS);

export default function FuelComparisonCalculator() {
  const [init] = useState(() => loadFuelSaved());

  const [carAName, setCarAName] = useState(init.carAName);
  const [carAEfficiency, setCarAEfficiency] = useState(init.carAEfficiency);
  const [carBName, setCarBName] = useState(init.carBName);
  const [carBEfficiency, setCarBEfficiency] = useState(init.carBEfficiency);
  const [unit, setUnit] = useState<"kmpl" | "lp100km">(init.unit);
  const [fuelPresetIndex, setFuelPresetIndex] = useState(init.fuelPresetIndex);
  const [customFuelPrice, setCustomFuelPrice] = useState(init.customFuelPrice);
  const [dailyDistance, setDailyDistance] = useState(init.dailyDistance);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          carAName,
          carAEfficiency,
          carBName,
          carBEfficiency,
          unit,
          fuelPresetIndex,
          customFuelPrice,
          dailyDistance,
        })
      );
    } catch {}
  }, [
    carAName,
    carAEfficiency,
    carBName,
    carBEfficiency,
    unit,
    fuelPresetIndex,
    customFuelPrice,
    dailyDistance,
  ]);

  const fuelPrice =
    FUEL_PRESETS[fuelPresetIndex].price ?? customFuelPrice;

  // Convert to km/L for calculation (guard against zero/negative)
  const getKmPerL = (eff: number) => {
    const safeEff = Math.max(eff, 0.01);
    return unit === "kmpl" ? safeEff : 100 / safeEff;
  };

  const effA = getKmPerL(carAEfficiency);
  const effB = getKmPerL(carBEfficiency);

  const calcCost = (eff: number) => {
    const litersPerDay = dailyDistance / eff;
    const daily = litersPerDay * fuelPrice;
    return {
      daily,
      weekly: daily * 7,
      monthly: daily * 30,
      yearly: daily * 365,
    };
  };

  const costA = calcCost(effA);
  const costB = calcCost(effB);

  const savings = {
    daily: Math.abs(costA.daily - costB.daily),
    weekly: Math.abs(costA.weekly - costB.weekly),
    monthly: Math.abs(costA.monthly - costB.monthly),
    yearly: Math.abs(costA.yearly - costB.yearly),
  };

  const cheaperCar = costA.yearly <= costB.yearly ? carAName : carBName;
  const moreExpensiveCar = costA.yearly <= costB.yearly ? carBName : carAName;

  const maxMonthly = Math.max(costA.monthly, costB.monthly) || 1;

  return (
    <div>
      <div class="calc">
        <h2 class="section-title">Fuel Price</h2>
        <div class="field">
          <label>Fuel Type / Price</label>
          <div class="preset-buttons">
            {FUEL_PRESETS.map((p, i) => (
              <button
                key={i}
                class={`preset-btn ${fuelPresetIndex === i ? "active" : ""}`}
                onClick={() => setFuelPresetIndex(i)}
              >
                {p.name}
                {p.price !== null && (
                  <span class="preset-price">{formatRM(p.price)}/L</span>
                )}
              </button>
            ))}
          </div>
          {fuelPresetIndex === 3 && (
            <div class="custom-fuel-row">
              <label>Custom Price (RM/L)</label>
              <input
                type="number"
                value={customFuelPrice}
                min={0.1}
                step={0.01}
                onInput={(e) => {
                  const v = parseFloat((e.target as HTMLInputElement).value);
                  if (!isNaN(v) && v > 0) setCustomFuelPrice(v);
                }}
              />
            </div>
          )}
        </div>

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

        <h2 class="section-title">Efficiency Unit</h2>
        <div class="unit-toggle">
          <button
            class={unit === "kmpl" ? "active" : ""}
            onClick={() => setUnit("kmpl")}
          >
            km/L
          </button>
          <button
            class={unit === "lp100km" ? "active" : ""}
            onClick={() => setUnit("lp100km")}
          >
            L/100km
          </button>
        </div>
      </div>

      <div class="calc cars-section">
        <h2 class="section-title">Compare Two Cars</h2>
        <div class="cars-grid">
          <div class="car-card">
            <div class="field">
              <label>Car Name</label>
              <input
                type="text"
                value={carAName}
                onInput={(e) => setCarAName((e.target as HTMLInputElement).value)}
                class="text-input"
              />
            </div>
            <div class="field">
              <label>
                Efficiency ({unit === "kmpl" ? "km/L" : "L/100km"})
              </label>
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
            {unit === "lp100km" && (
              <p class="converted">
                ≈ {(100 / carAEfficiency).toFixed(1)} km/L
              </p>
            )}
            {unit === "kmpl" && (
              <p class="converted">
                ≈ {(100 / carAEfficiency).toFixed(1)} L/100km
              </p>
            )}
          </div>

          <div class="car-card">
            <div class="field">
              <label>Car Name</label>
              <input
                type="text"
                value={carBName}
                onInput={(e) => setCarBName((e.target as HTMLInputElement).value)}
                class="text-input"
              />
            </div>
            <div class="field">
              <label>
                Efficiency ({unit === "kmpl" ? "km/L" : "L/100km"})
              </label>
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
            {unit === "lp100km" && (
              <p class="converted">
                ≈ {(100 / carBEfficiency).toFixed(1)} km/L
              </p>
            )}
            {unit === "kmpl" && (
              <p class="converted">
                ≈ {(100 / carBEfficiency).toFixed(1)} L/100km
              </p>
            )}
          </div>
        </div>
      </div>

      <div class="calc results-section">
        <h2 class="section-title">Cost Comparison</h2>
        <p class="fuel-price-display">
          Fuel price: <strong>{formatRM(fuelPrice)}</strong> / L
        </p>

        <div class="bar-chart">
          <div class="bar-row">
            <span class="bar-label">{carAName}</span>
            <div class="bar-track">
              <div
                class="bar-fill car-a"
                style={{
                  width: `${Math.min(100, (costA.monthly / maxMonthly) * 100)}%`,
                }}
              />
            </div>
            <span class="bar-value">{formatRM(costA.monthly)}</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">{carBName}</span>
            <div class="bar-track">
              <div
                class="bar-fill car-b"
                style={{
                  width: `${Math.min(100, (costB.monthly / maxMonthly) * 100)}%`,
                }}
              />
            </div>
            <span class="bar-value">{formatRM(costB.monthly)}</span>
          </div>
          <p class="bar-caption">Monthly fuel cost</p>
        </div>

        <div class="savings-banner">
          <svg class="savings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
          <span>
            <strong>{cheaperCar}</strong>{" "}
            saves{" "}
            <strong>{formatRM(savings.monthly)}</strong> per month vs{" "}
            <strong>{moreExpensiveCar}</strong>
          </span>
        </div>

        <div class="results-table">
          <div class="results-header">
            <span>Period</span>
            <span>{carAName}</span>
            <span>{carBName}</span>
            <span>Savings</span>
          </div>
          {[
            { label: "Daily", a: costA.daily, b: costB.daily, s: savings.daily },
            { label: "Weekly", a: costA.weekly, b: costB.weekly, s: savings.weekly },
            { label: "Monthly", a: costA.monthly, b: costB.monthly, s: savings.monthly },
            { label: "Yearly", a: costA.yearly, b: costB.yearly, s: savings.yearly },
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
