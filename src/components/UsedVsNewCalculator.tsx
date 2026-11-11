import { useEffect, useState } from "preact/hooks";
import { flatRateQuote, totalCostMultiplier } from "../lib/loan";

const STORAGE_KEY = "usedVsNewCar";

const DEFAULTS = {
  newPrice: 100000,
  usedPrice: 80000,
  downNew: 10,
  downUsed: 10,
  rateNew: 2.5,
  rateUsed: 3.5,
  years: 9,
  maintNew: 0,
  maintUsed: 8000,
  resaleNew: 0,
  resaleUsed: 0,
};

type Saved = typeof DEFAULTS;

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

const formatRM = (n: number) =>
  "RM " +
  n.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatRM0 = (n: number) => "RM " + Math.round(n).toLocaleString("en-MY");

const sanitize = (raw: string) => raw.replace(/[,\s]/g, "");

function numField(
  value: number,
  set: (v: number) => void,
  opts?: {
    min?: number;
    step?: number;
    placeholder?: string;
    allowEmpty?: boolean;
  },
) {
  return (
    <input
      type="number"
      value={value || (opts?.allowEmpty ? "" : 0)}
      min={opts?.min ?? 0}
      step={opts?.step ?? 1000}
      placeholder={opts?.placeholder ?? "0"}
      onInput={(e) => {
        const v = parseFloat(sanitize((e.target as HTMLInputElement).value));
        if (!isNaN(v) && v >= 0) set(v);
      }}
    />
  );
}

export default function UsedVsNewCalculator() {
  const [init] = useState<Saved>(() => loadSaved());
  const [newPrice, setNewPrice] = useState(init.newPrice);
  const [usedPrice, setUsedPrice] = useState(init.usedPrice);
  const [downNew, setDownNew] = useState(init.downNew);
  const [downUsed, setDownUsed] = useState(init.downUsed);
  const [rateNew, setRateNew] = useState(init.rateNew);
  const [rateUsed, setRateUsed] = useState(init.rateUsed);
  const [years, setYears] = useState(init.years);
  const [maintNew, setMaintNew] = useState(init.maintNew);
  const [maintUsed, setMaintUsed] = useState(init.maintUsed);
  const [resaleNew, setResaleNew] = useState(init.resaleNew);
  const [resaleUsed, setResaleUsed] = useState(init.resaleUsed);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          newPrice,
          usedPrice,
          downNew,
          downUsed,
          rateNew,
          rateUsed,
          years,
          maintNew,
          maintUsed,
          resaleNew,
          resaleUsed,
        }),
      );
    } catch {}
  }, [
    newPrice,
    usedPrice,
    downNew,
    downUsed,
    rateNew,
    rateUsed,
    years,
    maintNew,
    maintUsed,
    resaleNew,
    resaleUsed,
  ]);

  const newQuote = flatRateQuote({
    price: newPrice,
    depositPercent: downNew,
    annualRate: rateNew,
    years,
  });
  const usedQuote = flatRateQuote({
    price: usedPrice,
    depositPercent: downUsed,
    annualRate: rateUsed,
    years,
  });

  const intN = newQuote.interest;
  const intU = usedQuote.interest;
  const monthlyN = newQuote.monthly;
  const monthlyU = usedQuote.monthly;

  const netN = newPrice + intN + maintNew - resaleNew;
  const netU = usedPrice + intU + maintUsed - resaleUsed;
  const delta = netN - netU;
  const usedWins = delta > 0;
  const tie = Math.abs(delta) < 100;

  const denomN = totalCostMultiplier(downNew, rateNew, years);
  const denomU = totalCostMultiplier(downUsed, rateUsed, years);
  const breakEvenFin = newPrice > 0 ? (newPrice * denomN) / denomU : 0;
  const breakEvenFull = Math.max(0, (netN - maintUsed + resaleUsed) / denomU);
  const ratio = newPrice > 0 ? (usedPrice / newPrice) * 100 : 0;
  const maxRatio = newPrice > 0 ? (breakEvenFin / newPrice) * 100 : 0;

  const maxNet = Math.max(netN, netU, 1);

  const threshold = (yy: number) =>
    (totalCostMultiplier(downNew, rateNew, yy) /
      totalCostMultiplier(downUsed, rateUsed, yy)) *
    100;

  return (
    <div>
      <div class="calc">
        <h2 class="section-title">Car prices</h2>
        <div class="cars-grid">
          <div class="car-card">
            <div class="field">
              <label>New car OTR price (RM)</label>
              {numField(newPrice, setNewPrice)}
            </div>
            <div class="field">
              <label>
                Down payment: <strong>{downNew}%</strong>
              </label>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={downNew}
                onInput={(e) =>
                  setDownNew(parseInt((e.target as HTMLInputElement).value))
                }
              />
            </div>
            <div class="field">
              <label>
                Flat rate: <strong>{rateNew.toFixed(2)}%</strong>
              </label>
              <input
                type="range"
                min={0.5}
                max={8}
                step={0.1}
                value={rateNew}
                onInput={(e) =>
                  setRateNew(parseFloat((e.target as HTMLInputElement).value))
                }
              />
            </div>
          </div>
          <div class="car-card">
            <div class="field">
              <label>Used car price (RM)</label>
              {numField(usedPrice, setUsedPrice)}
            </div>
            <div class="field">
              <label>
                Down payment: <strong>{downUsed}%</strong>
              </label>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={downUsed}
                onInput={(e) =>
                  setDownUsed(parseInt((e.target as HTMLInputElement).value))
                }
              />
            </div>
            <div class="field">
              <label>
                Flat rate: <strong>{rateUsed.toFixed(2)}%</strong>
              </label>
              <input
                type="range"
                min={0.5}
                max={8}
                step={0.1}
                value={rateUsed}
                onInput={(e) =>
                  setRateUsed(parseFloat((e.target as HTMLInputElement).value))
                }
              />
            </div>
          </div>
        </div>

        <div class="field tenure-field">
          <label>
            Loan tenure: <strong>{years} years</strong>
          </label>
          <input
            type="range"
            min={1}
            max={9}
            step={1}
            value={years}
            onInput={(e) =>
              setYears(parseInt((e.target as HTMLInputElement).value))
            }
          />
          <div class="range-labels">
            <span>1 yr</span>
            <span>9 yrs</span>
          </div>
        </div>

        <details class="advanced">
          <summary>Running costs and resale (optional)</summary>
          <p class="advanced-hint">
            Totals over the full {years}-year loan period, not per year.
          </p>
          <div class="advanced-grid">
            <div class="field">
              <label>New car repairs and upkeep (RM)</label>
              {numField(maintNew, setMaintNew, { allowEmpty: true })}
            </div>
            <div class="field">
              <label>Used car repairs and upkeep (RM)</label>
              {numField(maintUsed, setMaintUsed, { allowEmpty: true })}
            </div>
            <div class="field">
              <label>New car resale after {years} yrs (RM)</label>
              {numField(resaleNew, setResaleNew, { allowEmpty: true })}
            </div>
            <div class="field">
              <label>Used car resale after {years} yrs (RM)</label>
              {numField(resaleUsed, setResaleUsed, { allowEmpty: true })}
            </div>
          </div>
        </details>
      </div>

      <div class="calc results-section">
        <h2 class="section-title">Result</h2>

        <div class={`verdict ${tie ? "tie" : usedWins ? "used" : "new"}`}>
          {tie
            ? "About even. Pick on condition and warranty."
            : usedWins
              ? `Used car wins by ${formatRM0(Math.abs(delta))} overall.`
              : `New car wins by ${formatRM0(Math.abs(delta))} overall.`}
        </div>

        <div class="bar-chart">
          <div class="bar-row">
            <span class="bar-label">New</span>
            <div class="bar-track">
              <div
                class="bar-fill car-a"
                style={{ width: `${Math.min(100, (netN / maxNet) * 100)}%` }}
              />
            </div>
            <span class="bar-value">{formatRM0(netN)}</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">Used</span>
            <div class="bar-track">
              <div
                class="bar-fill car-b"
                style={{ width: `${Math.min(100, (netU / maxNet) * 100)}%` }}
              />
            </div>
            <span class="bar-value">{formatRM0(netU)}</span>
          </div>
          <p class="bar-caption">Total net cost over {years} years</p>
        </div>

        <div class="results-table">
          <div class="results-header">
            <span></span>
            <span>New</span>
            <span>Used</span>
          </div>
          <div class="results-row">
            <span class="period">Price</span>
            <span>{formatRM0(newPrice)}</span>
            <span>{formatRM0(usedPrice)}</span>
          </div>
          <div class="results-row">
            <span class="period">Total interest</span>
            <span>{formatRM0(intN)}</span>
            <span>{formatRM0(intU)}</span>
          </div>
          <div class="results-row">
            <span class="period">Monthly</span>
            <span>{formatRM(monthlyN)}</span>
            <span>{formatRM(monthlyU)}</span>
          </div>
          <div class="results-row">
            <span class="period">Net cost</span>
            <span>
              <strong>{formatRM0(netN)}</strong>
            </span>
            <span>
              <strong>{formatRM0(netU)}</strong>
            </span>
          </div>
        </div>
        <p class="table-note">
          Net cost is price plus flat-rate interest plus upkeep minus resale.
        </p>

        <h2 class="section-title break-title">Break-even check</h2>
        <p class="break-text">
          This used car is <strong>{ratio.toFixed(1)}%</strong> of the new
          price. On financing alone it stays cheaper below{" "}
          <strong>{maxRatio.toFixed(1)}%</strong> ({formatRM0(breakEvenFin)}).
          {(maintUsed !== 0 ||
            maintNew !== 0 ||
            resaleNew !== 0 ||
            resaleUsed !== 0) && (
            <span>
              {" "}
              With your upkeep and resale figures, the full break-even is{" "}
              <strong>{formatRM0(breakEvenFull)}</strong>.
            </span>
          )}
        </p>

        <div class="threshold-table">
          <div class="threshold-row threshold-head">
            <span>Tenure</span>
            <span>Used must be below</span>
          </div>
          {[5, 7, 9].map((yy) => (
            <div class="threshold-row" key={yy}>
              <span>{yy} years</span>
              <span>{threshold(yy).toFixed(1)}% of new</span>
            </div>
          ))}
        </div>
      </div>

      <p class="note">
        Uses the flat rate hire purchase method common in Malaysia. Total
        interest is loan amount times rate times years. This is a money
        comparison only. Check accident history, mileage, service records, and
        remaining warranty before buying used.
      </p>
    </div>
  );
}
