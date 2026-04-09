import { useState } from "preact/hooks";

function todayString(): string {
  return Temporal.Now.plainDateISO().toString();
}

export default function DateCalculator() {
  const [baseDate, setBaseDate] = useState(todayString());
  const [years, setYears] = useState(0);
  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [mode, setMode] = useState<"add" | "subtract">("subtract");

  let result: string | null = null;
  let error: string | null = null;

  try {
    const date = Temporal.PlainDate.from(baseDate);
    const duration = Temporal.Duration.from({ years, months, days });
    const computed =
      mode === "add" ? date.add(duration) : date.subtract(duration);
    result = computed.toLocaleString("en-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    error = "Invalid date or duration";
  }

  return (
    <div>
      <div class="calc">
        <div class="field">
          <label>
            <strong>Date</strong>
          </label>
          <input
            type="date"
            value={baseDate}
            onInput={(e) => setBaseDate((e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="mode-toggle">
          <button
            class={`mode-btn ${mode === "subtract" ? "active" : ""}`}
            onClick={() => setMode("subtract")}
          >
            Subtract
          </button>
          <button
            class={`mode-btn ${mode === "add" ? "active" : ""}`}
            onClick={() => setMode("add")}
          >
            Add
          </button>
        </div>

        <div class="duration-fields">
          <div class="duration-field">
            <label>Years</label>
            <input
              type="number"
              min={0}
              value={years}
              onInput={(e) =>
                setYears(
                  Math.max(
                    0,
                    parseInt((e.target as HTMLInputElement).value) || 0,
                  ),
                )
              }
            />
          </div>
          <div class="duration-field">
            <label>Months</label>
            <input
              type="number"
              min={0}
              value={months}
              onInput={(e) =>
                setMonths(
                  Math.max(
                    0,
                    parseInt((e.target as HTMLInputElement).value) || 0,
                  ),
                )
              }
            />
          </div>
          <div class="duration-field">
            <label>Days</label>
            <input
              type="number"
              min={0}
              value={days}
              onInput={(e) =>
                setDays(
                  Math.max(
                    0,
                    parseInt((e.target as HTMLInputElement).value) || 0,
                  ),
                )
              }
            />
          </div>
        </div>

        <div class="results">
          <div class="result-row monthly">
            <span>Result</span>
            <span class="value">{error ? "—" : result}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
