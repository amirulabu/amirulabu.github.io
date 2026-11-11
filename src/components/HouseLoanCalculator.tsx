import { useState, useEffect } from "preact/hooks";
import {
  amortizationSchedule,
  reducingBalanceQuote,
  invertReducingBalance,
  scheduleSeries,
} from "../lib/loan";
import AmortizationChart from "./shared/AmortizationChart";

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

/** Malaysian stamp duty: 1% / 2% / 3% / 4% tiers. */
function calcStampDuty(price: number): number {
  const brackets = [
    { limit: 100000, rate: 0.01 },
    { limit: 400000, rate: 0.02 },
    { limit: 500000, rate: 0.03 },
    { limit: Infinity, rate: 0.04 },
  ];
  let duty = 0;
  let remaining = price;
  for (const bracket of brackets) {
    const tier = Math.min(bracket.limit, Math.max(0, remaining));
    duty += tier * bracket.rate;
    remaining -= tier;
    if (remaining <= 0) break;
  }
  return duty;
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

  const {
    deposit: depositAmount,
    loan: loanAmount,
    interest: totalInterest,
    payable: totalPayable,
    monthly: monthlyPayment,
  } = reducingBalanceQuote({
    price: housePrice,
    depositPercent,
    annualRate: interestRate,
    years: loanYears,
  });

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
        series={scheduleSeries(
          amortizationSchedule(
            loanAmount,
            interestRate,
            monthlyPayment,
            loanYears,
          ),
          loanAmount,
          loanYears,
        )}
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

  const {
    priceAfterRebate: housePrice,
    deposit: depositAmount,
    loan: loanAmount,
    interest: totalInterest,
    payable: totalPayable,
  } = invertReducingBalance({
    monthlyBudget,
    depositPercent,
    annualRate: interestRate,
    years: loanYears,
  });

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
        series={scheduleSeries(
          amortizationSchedule(
            loanAmount,
            interestRate,
            monthlyBudget,
            loanYears,
          ),
          loanAmount,
          loanYears,
        )}
      />

      <p class="note">
        * Uses reducing balance calculation (monthly rest), standard for
        Malaysian housing loans. DSR (Debt Service Ratio) limits may apply —
        banks typically approve up to 70% of net income.
      </p>
    </div>
  );
}
