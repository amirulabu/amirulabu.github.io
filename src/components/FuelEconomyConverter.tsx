import { useState, useCallback } from "preact/hooks";

// Conversion constants
const KMPL_TO_US_MPG = 2.35214583;
const KMPL_TO_UK_MPG = 2.8248094;

type UnitKey = "kmpl" | "lp100km" | "usMpg" | "ukMpg";

interface UnitDef {
  label: string;
  unit: string;
  desc: string;
}

const UNITS: Record<UnitKey, UnitDef> = {
  kmpl: { label: "km/L", unit: "km/L", desc: "Kilometers per liter" },
  lp100km: { label: "L/100km", unit: "L/100km", desc: "Liters per 100 km" },
  usMpg: { label: "MPG (US)", unit: "mpg", desc: "US miles per gallon" },
  ukMpg: { label: "MPG (UK)", unit: "mpg", desc: "Imperial miles per gallon" },
};

function toKmpl(value: number, source: UnitKey): number {
  switch (source) {
    case "kmpl":
      return value;
    case "lp100km":
      return 100 / value;
    case "usMpg":
      return value / KMPL_TO_US_MPG;
    case "ukMpg":
      return value / KMPL_TO_UK_MPG;
  }
}

function fmt(v: number): string {
  if (!isFinite(v) || v <= 0) return "";
  // Use sensible precision: 2 decimals for most, 3 for very small values
  if (v < 1) return v.toFixed(3);
  if (v > 1000) return Math.round(v).toString();
  return v.toFixed(2);
}

export default function FuelEconomyConverter() {
  const initKmpl = 15;
  const [values, setValues] = useState<Record<UnitKey, string>>(() => ({
    kmpl: String(initKmpl),
    lp100km: fmt(100 / initKmpl),
    usMpg: fmt(initKmpl * KMPL_TO_US_MPG),
    ukMpg: fmt(initKmpl * KMPL_TO_UK_MPG),
  }));
  const [activeField, setActiveField] = useState<UnitKey>("kmpl");

  const recalculate = useCallback((source: UnitKey, raw: string) => {
    const trimmed = raw.replace(/^0+(?=\d)/, ""); // strip leading zeros
    const num = parseFloat(trimmed);

    if (isNaN(num) || num <= 0) {
      setValues((prev) => ({ ...prev, [source]: raw }));
      return;
    }

    const kmpl = toKmpl(num, source);
    if (!isFinite(kmpl) || kmpl <= 0) return;

    setValues({
      kmpl: source === "kmpl" ? raw : fmt(kmpl),
      lp100km: source === "lp100km" ? raw : fmt(100 / kmpl),
      usMpg: source === "usMpg" ? raw : fmt(kmpl * KMPL_TO_US_MPG),
      ukMpg: source === "ukMpg" ? raw : fmt(kmpl * KMPL_TO_UK_MPG),
    });
  }, []);

  const handleInput = (key: UnitKey, value: string) => {
    setActiveField(key);
    recalculate(key, value);
  };

  const handleExample = (example: { kmpl: number; label: string }) => {
    setActiveField("kmpl");
    setValues({
      kmpl: example.kmpl.toString(),
      lp100km: fmt(100 / example.kmpl),
      usMpg: fmt(example.kmpl * KMPL_TO_US_MPG),
      ukMpg: fmt(example.kmpl * KMPL_TO_UK_MPG),
    });
  };

  const order: UnitKey[] = ["kmpl", "lp100km", "usMpg", "ukMpg"];

  const unitLabels: Record<string, string> = {
    en: "English",
    ms: "Bahasa Malaysia",
    ja: "日本語",
  };

  const examples = [
    { kmpl: 5, label: "SUV / truck" },
    { kmpl: 8, label: "Old city car" },
    { kmpl: 12, label: "Family sedan" },
    { kmpl: 15, label: "Compact car" },
    { kmpl: 20, label: "Hybrid" },
    { kmpl: 25, label: "Efficient hybrid" },
  ];

  return (
    <div class="converter">
      <div class="calc">
        {order.map((key) => {
          const def = UNITS[key];
          const val = values[key];
          const num = parseFloat(val);
          const isValid = !isNaN(num) && num > 0;

          return (
            <div
              class={`field ${activeField === key ? "active" : ""}`}
              key={key}
            >
              <label>
                <strong>{def.label}</strong>
                <span class="unit-desc">{def.desc}</span>
              </label>
              <div class="input-wrap">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="—"
                  value={val}
                  onInput={(e) =>
                    handleInput(key, (e.target as HTMLInputElement).value)
                  }
                  onFocus={() => setActiveField(key)}
                />
                <span class="unit-suffix">{def.unit}</span>
                {isValid && activeField !== key && (
                  <span class="derived-indicator" title="Auto-converted">
                    ↻
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <details class="examples-section">
        <summary class="examples-summary">Quick examples</summary>
        <div class="examples-grid">
          {examples.map((ex) => (
            <button
              class="example-chip"
              onClick={() => handleExample(ex)}
              key={ex.label}
            >
              <span class="ex-label">{ex.label}</span>
              <span class="ex-value">{ex.kmpl} km/L</span>
            </button>
          ))}
        </div>
      </details>

      {values.kmpl !== "" && parseFloat(values.kmpl) > 0 && (
        <div class="ecosystem">
          {(() => {
            const kmpl = parseFloat(values.kmpl);
            const rating =
              kmpl < 8
                ? {
                    band: "thirsty",
                    label: "Thirsty",
                    desc: "High fuel consumption",
                  }
                : kmpl < 12
                  ? {
                      band: "moderate",
                      label: "Moderate",
                      desc: "Average for larger vehicles",
                    }
                  : kmpl < 16
                    ? {
                        band: "efficient",
                        label: "Efficient",
                        desc: "Good fuel economy",
                      }
                    : {
                        band: "very-efficient",
                        label: "Very Efficient",
                        desc: "Excellent fuel economy",
                      };
            return (
              <div class={`eco-tag ${rating.band}`}>
                <span class="eco-label">{rating.label}</span>
                <span class="eco-desc">{rating.desc}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
