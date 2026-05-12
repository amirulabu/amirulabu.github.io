import { useState } from "preact/hooks";

interface DoseTime {
  dose: number;
  display: string;
  label: string;
}

function formatTime(hours: number): DoseTime {
  const totalMinutes = (((hours % 24) + 24) % 24) * 60;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);

  let finalH = h;
  let finalM = m;
  if (finalM >= 60) {
    finalH += 1;
    finalM -= 60;
  }
  const normalizedH = ((finalH % 24) + 24) % 24;

  const period = normalizedH >= 12 ? "pm" : "am";
  const display12 = normalizedH % 12 === 0 ? 12 : normalizedH % 12;

  let label = "Night";
  if (normalizedH >= 5 && normalizedH < 12) label = "Morning";
  else if (normalizedH >= 12 && normalizedH < 17) label = "Afternoon";
  else if (normalizedH >= 17 && normalizedH < 21) label = "Evening";

  return {
    dose: 0,
    display: `${display12}:${String(finalM).padStart(2, "0")}${period}`,
    label,
  };
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h + m / 60;
}

export default function MedicineTimer() {
  const [frequency, setFrequency] = useState(3);
  const [startTime, setStartTime] = useState("08:00");

  const startHours = parseTime(startTime);
  const interval = 24 / frequency;

  const doses: DoseTime[] = [];
  for (let i = 0; i < frequency; i++) {
    const raw = startHours + i * interval;
    doses.push({ ...formatTime(raw), dose: i + 1 });
  }

  let intervalText: string;
  if (interval === 24) {
    intervalText = "Once daily — take at your chosen time";
  } else if (interval % 1 === 0) {
    intervalText = `Every ${interval} hours`;
  } else {
    const hrs = Math.floor(interval);
    const mins = Math.round((interval - hrs) * 60);
    intervalText = `Every ${hrs}h ${mins}m`;
  }

  const first = doses[0];
  const last = doses[doses.length - 1];

  const presets = [
    { freq: 1, label: "1×" },
    { freq: 2, label: "2×" },
    { freq: 3, label: "3×" },
    { freq: 4, label: "4×" },
    { freq: 6, label: "6×" },
  ];

  return (
    <div>
      <div class="calc">
        <div class="form-row">
          <div class="field">
            <label>
              <strong>Times per day</strong>
            </label>
            <select
              value={frequency}
              onInput={(e) =>
                setFrequency(
                  parseInt((e.target as HTMLSelectElement).value) || 3,
                )
              }
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div class="field">
            <label>
              <strong>First dose at</strong>
            </label>
            <input
              type="time"
              value={startTime}
              onInput={(e) =>
                setStartTime((e.target as HTMLInputElement).value)
              }
            />
          </div>
        </div>

        <div class="presets">
          {presets.map((p) => (
            <button
              class={`preset-btn ${p.freq === frequency ? "active" : ""}`}
              onClick={() => setFrequency(p.freq)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div class="results">
          <div class="summary">
            <strong>{frequency} doses</strong> &middot; {first.display} –{" "}
            {last.display}
          </div>
          {doses.map((d) => (
            <div class="dose-row">
              <span class="dose-label">
                <span class="dose-num">#{d.dose}</span>
                {d.label}
              </span>
              <span class="dose-time">{d.display}</span>
            </div>
          ))}
        </div>

        <p class="interval">{intervalText}</p>
      </div>
    </div>
  );
}
