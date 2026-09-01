import { useState, useEffect, useMemo } from "preact/hooks";

const STORAGE_KEY_PRICE = "carLoanCalc_price";
const STORAGE_KEY_MONTHLY = "carLoanCalc_monthly";

const PRICE_DEFAULTS = {
  carPrice: 100000,
  interestRate: 3,
  loanYears: 9,
  depositPercent: 10,
  rebate: 0,
};

const MONTHLY_DEFAULTS = {
  monthlyBudget: 1500,
  interestRate: 3,
  loanYears: 9,
  depositPercent: 10,
  rebate: 0,
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

const sanitizeNum = (raw: string) => raw.replace(/[,\s]/g, "");

const formatRM = (n: number) =>
  "RM " +
  n.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function PriceToMonthlyCalc() {
  const [init] = useState(() => loadSaved(STORAGE_KEY_PRICE, PRICE_DEFAULTS));
  const [carPrice, setCarPrice] = useState(init.carPrice);
  const [interestRate, setInterestRate] = useState(init.interestRate);
  const [loanYears, setLoanYears] = useState(init.loanYears);
  const [depositPercent, setDepositPercent] = useState(init.depositPercent);
  const [rebate, setRebate] = useState(init.rebate);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PRICE,
        JSON.stringify({
          carPrice,
          interestRate,
          loanYears,
          depositPercent,
          rebate,
        }),
      );
    } catch {}
  }, [carPrice, interestRate, loanYears, depositPercent, rebate]);

  const priceAfterRebate = Math.max(0, carPrice - rebate);
  const depositAmount = priceAfterRebate * (depositPercent / 100);
  const loanAmount = priceAfterRebate - depositAmount;
  const totalInterest = loanAmount * (interestRate / 100) * loanYears;
  const totalPayable = loanAmount + totalInterest;
  const monthlyPayment = totalPayable / (loanYears * 12);

  return (
    <div class="calc">
      <div class="field">
        <label>Car Price (RM)</label>
        <input
          type="number"
          value={carPrice}
          min={0}
          step={1000}
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            const v = parseFloat(sanitizeNum(raw));
            if (!isNaN(v) && v >= 0) setCarPrice(v);
          }}
        />
      </div>

      <div class="field">
        <label htmlFor="price-rebate">Rebate (RM, optional)</label>
        <input
          id="price-rebate"
          type="number"
          value={rebate || ""}
          min={0}
          step={1000}
          placeholder="0"
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            const v = parseFloat(sanitizeNum(raw));
            if (!isNaN(v) && v >= 0) setRebate(v);
          }}
        />
      </div>

      <div class="field">
        <label>
          Interest Rate (flat): <strong>{interestRate.toFixed(2)}%</strong>
        </label>
        <input
          type="range"
          min={1}
          max={6}
          step={0.1}
          value={interestRate}
          onInput={(e) =>
            setInterestRate(parseFloat((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>1%</span>
          <span>6%</span>
        </div>
      </div>

      <div class="field">
        <label>
          Loan Tenure: <strong>{loanYears} years</strong>
        </label>
        <input
          type="range"
          min={1}
          max={9}
          step={1}
          value={loanYears}
          onInput={(e) =>
            setLoanYears(parseInt((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>1 yr</span>
          <span>9 yrs</span>
        </div>
      </div>

      <div class="field">
        <label>
          Down Payment: <strong>{depositPercent}%</strong>
        </label>
        <div class="deposit-inputs">
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={depositPercent}
            onInput={(e) =>
              setDepositPercent(parseInt((e.target as HTMLInputElement).value))
            }
          />
          <div class="range-labels">
            <span>0%</span>
            <span>50%</span>
          </div>
          <input
            type="number"
            class="deposit-amount"
            value={Math.round(depositAmount)}
            min={0}
            step={1000}
            onChange={(e) => {
              const raw = (e.target as HTMLInputElement).value;
              const v = parseFloat(sanitizeNum(raw));
              if (!isNaN(v) && v >= 0 && priceAfterRebate > 0) {
                setDepositPercent(
                  Math.min(50, Math.round((v / priceAfterRebate) * 100)),
                );
              }
            }}
          />
        </div>
      </div>

      <div class="results">
        <div class="result-row monthly">
          <span>Monthly Payment</span>
          <span class="value">{formatRM(monthlyPayment)}</span>
        </div>
        <div class="result-row">
          <span>Price After Rebate</span>
          <span class="value">{formatRM(priceAfterRebate)}</span>
        </div>
        <div class="result-row">
          <span>Loan Amount</span>
          <span class="value">{formatRM(loanAmount)}</span>
        </div>
        <div class="result-row">
          <span>Total Interest</span>
          <span class="value">{formatRM(totalInterest)}</span>
        </div>
        <div class="result-row">
          <span>Total Payable</span>
          <span class="value">{formatRM(totalPayable)}</span>
        </div>
      </div>

      <AmortizationChart
        loanAmount={loanAmount}
        totalInterest={totalInterest}
        loanYears={loanYears}
      />

      <p class="note">
        * Rebate is subtracted before calculating the down payment and loan.
        Uses the flat rate hire purchase method common for Malaysian car loans.
      </p>
    </div>
  );
}

/* ---------- Amortization Chart ---------- */

function AmortizationChart({
  loanAmount,
  totalInterest,
  loanYears,
}: {
  loanAmount: number;
  totalInterest: number;
  loanYears: number;
}) {
  const totalPayable = loanAmount + totalInterest;

  const data = useMemo(() => {
    const years: number[] = [];
    const cumPrincipal: number[] = [];
    const cumInterest: number[] = [];
    const balanceRemaining: number[] = [];
    for (let y = 0; y <= loanYears; y++) {
      years.push(y);
      const cp = (loanAmount / loanYears) * y;
      const ci = (totalInterest / loanYears) * y;
      cumPrincipal.push(cp);
      cumInterest.push(ci);
      balanceRemaining.push(totalPayable - cp - ci);
    }
    return { years, cumPrincipal, cumInterest, balanceRemaining };
  }, [loanAmount, totalInterest, loanYears, totalPayable]);

  const w = 480;
  const h = 260;
  const pad = { top: 20, right: 16, bottom: 34, left: 62 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const maxY = totalPayable;
  const xScale = (year: number) => pad.left + (year / loanYears) * plotW;
  const yScale = (val: number) => pad.top + plotH - (val / maxY) * plotH;

  // Build stacked area path strings
  const principals = data.cumPrincipal;
  const interests = data.cumInterest;
  const n = data.years.length;

  // Area: cumulative principal (bottom layer)
  let principalArea = `M ${xScale(0)} ${yScale(0)}`;
  for (let i = 0; i < n; i++) {
    principalArea += ` L ${xScale(data.years[i])} ${yScale(principals[i])}`;
  }
  principalArea += ` L ${xScale(data.years[n - 1])} ${yScale(0)} Z`;

  // Area: cumulative interest (top layer, stacked on principal)
  let interestArea = `M ${xScale(0)} ${yScale(principals[0])}`;
  for (let i = 0; i < n; i++) {
    interestArea += ` L ${xScale(data.years[i])} ${yScale(principals[i] + interests[i])}`;
  }
  interestArea += ` L ${xScale(data.years[n - 1])} ${yScale(principals[n - 1])} Z`;

  // Line: balance remaining
  const balances = data.balanceRemaining;
  let balanceLine = `M ${xScale(0)} ${yScale(balances[0])}`;
  for (let i = 1; i < n; i++) {
    balanceLine += ` L ${xScale(data.years[i])} ${yScale(balances[i])}`;
  }

  // Y-axis gridlines (5 lines)
  const gridLines = 5;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((maxY / gridLines) * i),
  );

  const fmtK = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return String(n);
  };

  // Tooltip state
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const getIndexFromX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left;
    const svgX = (x / rect.width) * w;
    const dataX = ((svgX - pad.left) / plotW) * loanYears;
    const idx = Math.round(dataX);
    if (idx >= 0 && idx <= loanYears) return idx;
    return null;
  };

  const handleMouseMove = (e: JSX.TargetedMouseEvent<SVGSVGElement>) => {
    setHoverIdx(getIndexFromX(e.clientX, e.currentTarget));
  };

  const handleTouchMove = (e: JSX.TargetedTouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    setHoverIdx(getIndexFromX(touch.clientX, e.currentTarget));
  };

  const handleTouchEnd = () => {
    setHoverIdx(null);
  };

  const hoverX = hoverIdx !== null ? xScale(data.years[hoverIdx]) : null;

  return (
    <div class="amort-chart-wrap">
      <div class="amort-chart-title">Interest vs Principal Over Time</div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        class="amort-chart"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            x1={pad.left}
            y1={yScale(tick)}
            x2={w - pad.right}
            y2={yScale(tick)}
            stroke="#e5e5e5"
            stroke-width="1"
          />
        ))}

        {/* X-axis ticks */}
        {data.years
          .filter(
            (y) =>
              y === 0 || y === loanYears || y % Math.ceil(loanYears / 5) === 0,
          )
          .map((y) => (
            <g>
              <line
                x1={xScale(y)}
                y1={pad.top + plotH}
                x2={xScale(y)}
                y2={pad.top + plotH + 4}
                stroke="#999"
                stroke-width="1"
              />
              <text
                x={xScale(y)}
                y={pad.top + plotH + 18}
                text-anchor="middle"
                font-size="11"
                fill="#777"
              >
                {y}yr
              </text>
            </g>
          ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            x={pad.left - 6}
            y={yScale(tick) + 4}
            text-anchor="end"
            font-size="10"
            fill="#777"
          >
            {fmtK(tick)}
          </text>
        ))}

        {/* Stacked areas */}
        <path d={principalArea} fill="#3573C6" opacity="0.85" />
        <path d={interestArea} fill="#E8634A" opacity="0.75" />

        {/* Balance remaining line */}
        <path
          d={balanceLine}
          fill="none"
          stroke="#2E7D32"
          stroke-width="2"
          stroke-dasharray="6 3"
        />

        {/* Hover crosshair */}
        {hoverX !== null && (
          <line
            x1={hoverX}
            y1={pad.top}
            x2={hoverX}
            y2={pad.top + plotH}
            stroke="#333"
            stroke-width="1"
            stroke-dasharray="4 2"
            opacity="0.6"
          />
        )}

        {/* Axes */}
        <line
          x1={pad.left}
          y1={pad.top + plotH}
          x2={w - pad.right}
          y2={pad.top + plotH}
          stroke="#999"
          stroke-width="1"
        />
        <line
          x1={pad.left}
          y1={pad.top}
          x2={pad.left}
          y2={pad.top + plotH}
          stroke="#999"
          stroke-width="1"
        />
      </svg>

      {/* Legend */}
      <div class="amort-legend">
        <span class="amort-legend-item">
          <span class="amort-legend-dot" style="background:#3573C6" />
          Principal
        </span>
        <span class="amort-legend-item">
          <span class="amort-legend-dot" style="background:#E8634A" />
          Interest
        </span>
        <span class="amort-legend-item">
          <span class="amort-legend-line balance-line" />
          Balance
        </span>
      </div>

      {/* Hover tooltip */}
      {hoverIdx !== null && (
        <div class="amort-tooltip">
          <strong>Year {data.years[hoverIdx]}</strong>
          <div class="amort-tooltip-row">
            <span class="amort-tooltip-dot" style="background:#3573C6" />
            <span>Principal paid</span>
            <span class="amort-tooltip-val">
              {formatRM(data.cumPrincipal[hoverIdx])}
            </span>
          </div>
          <div class="amort-tooltip-row">
            <span class="amort-tooltip-dot" style="background:#E8634A" />
            <span>Interest paid</span>
            <span class="amort-tooltip-val">
              {formatRM(data.cumInterest[hoverIdx])}
            </span>
          </div>
          <div class="amort-tooltip-row total">
            <span>Total paid</span>
            <span class="amort-tooltip-val">
              {formatRM(
                data.cumPrincipal[hoverIdx] + data.cumInterest[hoverIdx],
              )}
            </span>
          </div>
          <div class="amort-tooltip-row">
            <span class="amort-tooltip-dot" style="background:#2E7D32" />
            <span>Balance left</span>
            <span class="amort-tooltip-val">
              {formatRM(data.balanceRemaining[hoverIdx])}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MonthlyToPriceCalc() {
  const [init] = useState(() =>
    loadSaved(STORAGE_KEY_MONTHLY, MONTHLY_DEFAULTS),
  );
  const [monthlyBudget, setMonthlyBudget] = useState(init.monthlyBudget);
  const [interestRate, setInterestRate] = useState(init.interestRate);
  const [loanYears, setLoanYears] = useState(init.loanYears);
  const [depositPercent, setDepositPercent] = useState(init.depositPercent);
  const [rebate, setRebate] = useState(init.rebate);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_MONTHLY,
        JSON.stringify({
          monthlyBudget,
          interestRate,
          loanYears,
          depositPercent,
          rebate,
        }),
      );
    } catch {}
  }, [monthlyBudget, interestRate, loanYears, depositPercent, rebate]);

  // monthly = loanAmt * (1 + rate * years) / (years * 12)
  // loanAmt = monthly * years * 12 / (1 + rate * years)
  // priceAfterRebate = loanAmt / (1 - depositPct)
  const totalMonths = loanYears * 12;
  const loanAmount =
    (monthlyBudget * totalMonths) / (1 + (interestRate / 100) * loanYears);
  const priceAfterRebate = loanAmount / (1 - depositPercent / 100);
  const carPrice = priceAfterRebate + rebate;
  const depositAmount = priceAfterRebate * (depositPercent / 100);
  const totalInterest = loanAmount * (interestRate / 100) * loanYears;
  const totalPayable = loanAmount + totalInterest;

  return (
    <div class="calc">
      <div class="field">
        <label>Monthly Budget (RM)</label>
        <input
          type="number"
          value={monthlyBudget}
          min={0}
          step={100}
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            const v = parseFloat(sanitizeNum(raw));
            if (!isNaN(v) && v >= 0) setMonthlyBudget(v);
          }}
        />
      </div>

      <div class="field">
        <label htmlFor="monthly-rebate">Rebate (RM, optional)</label>
        <input
          id="monthly-rebate"
          type="number"
          value={rebate || ""}
          min={0}
          step={1000}
          placeholder="0"
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            const v = parseFloat(sanitizeNum(raw));
            if (!isNaN(v) && v >= 0) setRebate(v);
          }}
        />
      </div>

      <div class="field">
        <label>
          Interest Rate (flat): <strong>{interestRate.toFixed(2)}%</strong>
        </label>
        <input
          type="range"
          min={1}
          max={6}
          step={0.1}
          value={interestRate}
          onInput={(e) =>
            setInterestRate(parseFloat((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>1%</span>
          <span>6%</span>
        </div>
      </div>

      <div class="field">
        <label>
          Loan Tenure: <strong>{loanYears} years</strong>
        </label>
        <input
          type="range"
          min={1}
          max={9}
          step={1}
          value={loanYears}
          onInput={(e) =>
            setLoanYears(parseInt((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>1 yr</span>
          <span>9 yrs</span>
        </div>
      </div>

      <div class="field">
        <label>
          Down Payment: <strong>{depositPercent}%</strong>
        </label>
        <div class="deposit-inputs">
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={depositPercent}
            onInput={(e) =>
              setDepositPercent(parseInt((e.target as HTMLInputElement).value))
            }
          />
          <div class="range-labels">
            <span>0%</span>
            <span>50%</span>
          </div>
          <input
            type="number"
            class="deposit-amount"
            value={Math.round(depositAmount)}
            min={0}
            step={1000}
            onChange={(e) => {
              const raw = (e.target as HTMLInputElement).value;
              const v = parseFloat(sanitizeNum(raw));
              if (!isNaN(v) && v >= 0 && loanAmount > 0) {
                setDepositPercent(
                  Math.min(50, Math.round((v / (loanAmount + v)) * 100)),
                );
              }
            }}
          />
        </div>
      </div>

      <div class="results">
        <div class="result-row monthly">
          <span>Car Price You Can Afford</span>
          <span class="value">{formatRM(carPrice)}</span>
        </div>
        <div class="result-row">
          <span>Price After Rebate</span>
          <span class="value">{formatRM(priceAfterRebate)}</span>
        </div>
        <div class="result-row">
          <span>Down Payment</span>
          <span class="value">{formatRM(depositAmount)}</span>
        </div>
        <div class="result-row">
          <span>Loan Amount</span>
          <span class="value">{formatRM(loanAmount)}</span>
        </div>
        <div class="result-row">
          <span>Total Interest</span>
          <span class="value">{formatRM(totalInterest)}</span>
        </div>
        <div class="result-row">
          <span>Total Payable</span>
          <span class="value">{formatRM(totalPayable)}</span>
        </div>
      </div>

      <p class="note">
        * Rebate is subtracted before calculating the down payment and loan.
        Uses the flat rate hire purchase method common for Malaysian car loans.
      </p>
    </div>
  );
}
