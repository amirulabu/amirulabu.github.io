import { useState, useEffect, useMemo } from "preact/hooks";

const STORAGE_KEY_PRICE = "houseLoanCalc_price";
const STORAGE_KEY_MONTHLY = "houseLoanCalc_monthly";

const PRICE_DEFAULTS = {
  housePrice: 500000,
  interestRate: 3.5,
  loanYears: 30,
  depositPercent: 10,
};

const MONTHLY_DEFAULTS = {
  monthlyBudget: 2500,
  interestRate: 3.5,
  loanYears: 30,
  depositPercent: 10,
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

const formatShort = (n: number) => {
  if (n >= 1_000_000) {
    const val = n / 1_000_000;
    return `RM ${val.toFixed(val % 1 === 0 ? 0 : 1)} mil`;
  }
  if (n >= 1_000) {
    const val = n / 1_000;
    return `RM ${val.toFixed(val % 1 === 0 ? 0 : 1)}k`;
  }
  return formatRM(n);
};

// Reducing balance monthly payment
function calcMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  months: number,
): number {
  if (annualRate === 0) return loanAmount / months;
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, months);
  return (loanAmount * r * factor) / (factor - 1);
}

// Generate amortization schedule
function generateAmortSchedule(
  loanAmount: number,
  annualRate: number,
  months: number,
  monthlyPayment: number,
) {
  const schedule: {
    month: number;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
  }[] = [];
  let balance = loanAmount;
  const r = annualRate / 100 / 12;

  for (let i = 1; i <= months && balance > 0; i++) {
    const interest = balance * r;
    let principal = monthlyPayment - interest;
    if (principal > balance) principal = balance;
    balance -= principal;

    schedule.push({
      month: i,
      payment: monthlyPayment,
      interest,
      principal,
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }
  return schedule;
}

/* ---------- Price → Monthly ---------- */

export function PriceToMonthlyCalc() {
  const [init] = useState(() => loadSaved(STORAGE_KEY_PRICE, PRICE_DEFAULTS));
  const [housePrice, setHousePrice] = useState(init.housePrice);
  const [interestRate, setInterestRate] = useState(init.interestRate);
  const [loanYears, setLoanYears] = useState(init.loanYears);
  const [depositPercent, setDepositPercent] = useState(init.depositPercent);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PRICE,
        JSON.stringify({ housePrice, interestRate, loanYears, depositPercent }),
      );
    } catch {}
  }, [housePrice, interestRate, loanYears, depositPercent]);

  const depositAmount = housePrice * (depositPercent / 100);
  const loanAmount = housePrice - depositAmount;
  const months = loanYears * 12;
  const monthlyPayment = calcMonthlyPayment(loanAmount, interestRate, months);
  const totalPayable = monthlyPayment * months;
  const totalInterest = totalPayable - loanAmount;

  // Stamp duty (Malaysian: first 100k @1%, next 400k @2%, next 500k @3%, rest @4%)
  const calcStampDuty = (price: number) => {
    let duty = 0;
    let remaining = price;
    const brackets = [
      { limit: 100000, rate: 0.01 },
      { limit: 400000, rate: 0.02 },
      { limit: 500000, rate: 0.03 },
      { limit: Infinity, rate: 0.04 },
    ];
    let prev = 0;
    for (const b of brackets) {
      const tier = Math.min(b.limit, Math.max(0, remaining));
      duty += tier * b.rate;
      remaining -= tier;
      if (remaining <= 0) break;
    }
    return duty;
  };
  const stampDuty = calcStampDuty(housePrice);

  return (
    <div class="calc">
      <div class="field">
        <label>House Price (RM)</label>
        <input
          type="number"
          value={housePrice}
          min={0}
          step={10000}
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            const v = parseFloat(sanitizeNum(raw));
            if (!isNaN(v) && v >= 0) setHousePrice(v);
          }}
        />
      </div>

      <div class="field">
        <label>
          Interest Rate (p.a.): <strong>{interestRate.toFixed(2)}%</strong>
        </label>
        <input
          type="range"
          min={2}
          max={7}
          step={0.05}
          value={interestRate}
          onInput={(e) =>
            setInterestRate(parseFloat((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>2%</span>
          <span>7%</span>
        </div>
      </div>

      <div class="field">
        <label>
          Loan Tenure: <strong>{loanYears} years</strong>
        </label>
        <input
          type="range"
          min={5}
          max={35}
          step={1}
          value={loanYears}
          onInput={(e) =>
            setLoanYears(parseInt((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>5 yrs</span>
          <span>35 yrs</span>
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
            max={30}
            step={1}
            value={depositPercent}
            onInput={(e) =>
              setDepositPercent(parseInt((e.target as HTMLInputElement).value))
            }
          />
          <div class="range-labels">
            <span>0%</span>
            <span>30%</span>
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
              if (!isNaN(v) && v >= 0 && housePrice > 0) {
                setDepositPercent(
                  Math.min(30, Math.round((v / housePrice) * 100)),
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

      <div class="results" style="margin-top: 0.75rem;">
        <div class="result-row">
          <span>Stamp Duty (approx.)</span>
          <span class="value">{formatRM(stampDuty)}</span>
        </div>
        <div
          class="result-row"
          style="border-top: 1px solid #d6e2f2; padding-top: 0.5rem; font-style: italic;"
        >
          <span>Upfront cost</span>
          <span class="value">{formatRM(depositAmount + stampDuty)}</span>
        </div>
      </div>

      <AmortizationChart
        loanAmount={loanAmount}
        annualRate={interestRate}
        loanYears={loanYears}
        monthlyPayment={monthlyPayment}
      />

      <p class="note">
        * Uses reducing balance calculation (monthly rest), standard for
        Malaysian housing loans. Stamp duty follows Malaysian tiered rates
        (1–4%).
      </p>
    </div>
  );
}

/* ---------- Monthly → Price ---------- */

export function MonthlyToPriceCalc() {
  const [init] = useState(() =>
    loadSaved(STORAGE_KEY_MONTHLY, MONTHLY_DEFAULTS),
  );
  const [monthlyBudget, setMonthlyBudget] = useState(init.monthlyBudget);
  const [interestRate, setInterestRate] = useState(init.interestRate);
  const [loanYears, setLoanYears] = useState(init.loanYears);
  const [depositPercent, setDepositPercent] = useState(init.depositPercent);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_MONTHLY,
        JSON.stringify({
          monthlyBudget,
          interestRate,
          loanYears,
          depositPercent,
        }),
      );
    } catch {}
  }, [monthlyBudget, interestRate, loanYears, depositPercent]);

  // Solve for loan amount from monthly payment (reducing balance)
  // P = M * ((1+r)^n - 1) / (r * (1+r)^n)
  const months = loanYears * 12;
  const r = interestRate / 100 / 12;

  let loanAmount = 0;
  if (interestRate === 0) {
    loanAmount = monthlyBudget * months;
  } else {
    const factor = Math.pow(1 + r, months);
    loanAmount = (monthlyBudget * (factor - 1)) / (r * factor);
  }

  const housePrice = loanAmount / (1 - depositPercent / 100);
  const depositAmount = housePrice * (depositPercent / 100);
  const totalPayable = monthlyBudget * months;
  const totalInterest = totalPayable - loanAmount;

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
        <label>
          Interest Rate (p.a.): <strong>{interestRate.toFixed(2)}%</strong>
        </label>
        <input
          type="range"
          min={2}
          max={7}
          step={0.05}
          value={interestRate}
          onInput={(e) =>
            setInterestRate(parseFloat((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>2%</span>
          <span>7%</span>
        </div>
      </div>

      <div class="field">
        <label>
          Loan Tenure: <strong>{loanYears} years</strong>
        </label>
        <input
          type="range"
          min={5}
          max={35}
          step={1}
          value={loanYears}
          onInput={(e) =>
            setLoanYears(parseInt((e.target as HTMLInputElement).value))
          }
        />
        <div class="range-labels">
          <span>5 yrs</span>
          <span>35 yrs</span>
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
            max={30}
            step={1}
            value={depositPercent}
            onInput={(e) =>
              setDepositPercent(parseInt((e.target as HTMLInputElement).value))
            }
          />
          <div class="range-labels">
            <span>0%</span>
            <span>30%</span>
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
              if (!isNaN(v) && v >= 0 && housePrice > 0) {
                setDepositPercent(
                  Math.min(30, Math.round((v / housePrice) * 100)),
                );
              }
            }}
          />
        </div>
      </div>

      <div class="results">
        <div class="result-row monthly">
          <span>Max House Price</span>
          <span class="value">{formatRM(housePrice)}</span>
        </div>
        <div class="result-row">
          <span>Loan Amount</span>
          <span class="value">{formatRM(loanAmount)}</span>
        </div>
        <div class="result-row">
          <span>Down Payment</span>
          <span class="value">{formatRM(depositAmount)}</span>
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
        annualRate={interestRate}
        loanYears={loanYears}
        monthlyPayment={monthlyBudget}
      />

      <p class="note">
        * Uses reducing balance calculation (monthly rest), standard for
        Malaysian housing loans. DSR (Debt Service Ratio) limits may apply —
        banks typically approve up to 70% of net income.
      </p>
    </div>
  );
}

/* ---------- Amortization Chart ---------- */

function AmortizationChart({
  loanAmount,
  annualRate,
  loanYears,
  monthlyPayment,
}: {
  loanAmount: number;
  annualRate: number;
  loanYears: number;
  monthlyPayment: number;
}) {
  const months = loanYears * 12;

  const data = useMemo(() => {
    if (loanAmount <= 0 || monthlyPayment <= 0) {
      return {
        years: [] as number[],
        cumPrincipal: [] as number[],
        cumInterest: [] as number[],
        balanceRemaining: [] as number[],
      };
    }
    const schedule = generateAmortSchedule(
      loanAmount,
      annualRate,
      months,
      monthlyPayment,
    );

    // Aggregate by year
    const years: number[] = [];
    const cumPrincipal: number[] = [];
    const cumInterest: number[] = [];
    const balanceRemaining: number[] = [];

    // Year 0: start
    years.push(0);
    cumPrincipal.push(0);
    cumInterest.push(0);
    balanceRemaining.push(loanAmount);

    for (let y = 1; y <= loanYears; y++) {
      const monthEnd = Math.min(y * 12, schedule.length);
      const entry = schedule[monthEnd - 1];
      if (!entry) break;
      years.push(y);
      cumPrincipal.push(loanAmount - entry.balance);
      cumInterest.push(
        schedule.slice(0, monthEnd).reduce((sum, m) => sum + m.interest, 0),
      );
      balanceRemaining.push(entry.balance);
    }

    return { years, cumPrincipal, cumInterest, balanceRemaining };
  }, [loanAmount, annualRate, months, monthlyPayment, loanYears]);

  const w = 480;
  const h = 260;
  const pad = { top: 20, right: 16, bottom: 34, left: 62 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const maxY = loanAmount * (1 + (annualRate / 100) * (loanYears / 2)); // approximate max
  const actualMax = Math.max(
    loanAmount,
    ...data.balanceRemaining,
    ...data.cumPrincipal.map((v, i) => v + data.cumInterest[i]),
  );
  const chartMax = actualMax * 1.08;

  const xScale = (year: number) =>
    pad.left + (year / Math.max(loanYears, 1)) * plotW;
  const yScale = (val: number) => pad.top + plotH - (val / chartMax) * plotH;

  const n = data.years.length;
  const principals = data.cumPrincipal;
  const interests = data.cumInterest;

  // Stacked area: principal (bottom)
  let principalArea = `M ${xScale(0)} ${yScale(0)}`;
  for (let i = 0; i < n; i++) {
    principalArea += ` L ${xScale(data.years[i])} ${yScale(principals[i])}`;
  }
  principalArea += ` L ${xScale(data.years[n - 1])} ${yScale(0)} Z`;

  // Stacked area: interest (top of principal)
  let interestArea = `M ${xScale(0)} ${yScale(principals[0])}`;
  for (let i = 0; i < n; i++) {
    interestArea += ` L ${xScale(data.years[i])} ${yScale(principals[i] + interests[i])}`;
  }
  interestArea += ` L ${xScale(data.years[n - 1])} ${yScale(principals[n - 1])} Z`;

  // Balance remaining line
  let balanceLine = `M ${xScale(0)} ${yScale(data.balanceRemaining[0])}`;
  for (let i = 1; i < n; i++) {
    balanceLine += ` L ${xScale(data.years[i])} ${yScale(data.balanceRemaining[i])}`;
  }

  const gridLines = 5;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) =>
    Math.round((chartMax / gridLines) * i),
  );

  const fmtK = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}mil`;
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return String(n);
  };

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const getIndexFromX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left;
    const svgX = (x / rect.width) * w;
    const dataX = ((svgX - pad.left) / plotW) * loanYears;
    const idx = Math.round(dataX);
    if (idx >= 0 && idx <= loanYears && idx < n) return idx;
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

  const handleTouchEnd = () => setHoverIdx(null);

  const hoverX = hoverIdx !== null ? xScale(data.years[hoverIdx]) : null;

  if (n <= 1) {
    return null;
  }

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
              y === 0 ||
              y === loanYears ||
              y % Math.max(1, Math.ceil(loanYears / 5)) === 0,
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
      {hoverIdx !== null && data.years[hoverIdx] !== undefined && (
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
