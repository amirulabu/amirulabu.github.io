import { useState, useEffect } from "preact/hooks";
import { flatRateQuote, flatRateSeries, invertFlatRate } from "../lib/loan";
import AmortizationChart from "./shared/AmortizationChart";

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

  const {
    priceAfterRebate,
    deposit: depositAmount,
    loan: loanAmount,
    interest: totalInterest,
    payable: totalPayable,
    monthly: monthlyPayment,
  } = flatRateQuote({
    price: carPrice,
    rebate,
    depositPercent,
    annualRate: interestRate,
    years: loanYears,
  });

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
        series={flatRateSeries(loanAmount, totalInterest, loanYears)}
      />

      <p class="note">
        * Rebate is subtracted before calculating the down payment and loan.
        Uses the flat rate hire purchase method common for Malaysian car loans.
      </p>
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

  const {
    priceAfterRebate,
    deposit: depositAmount,
    loan: loanAmount,
    interest: totalInterest,
    payable: totalPayable,
  } = invertFlatRate({
    monthlyBudget,
    depositPercent,
    annualRate: interestRate,
    years: loanYears,
    rebate,
  });
  const carPrice = priceAfterRebate + rebate;

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
