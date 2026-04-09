import { useState, useEffect } from "preact/hooks";

const STORAGE_KEY_PRICE = "carLoanCalc_price";
const STORAGE_KEY_MONTHLY = "carLoanCalc_monthly";

const PRICE_DEFAULTS = {
  carPrice: 100000,
  interestRate: 3,
  loanYears: 9,
  depositPercent: 10,
};

const MONTHLY_DEFAULTS = {
  monthlyBudget: 1500,
  interestRate: 3,
  loanYears: 9,
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

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_PRICE,
        JSON.stringify({ carPrice, interestRate, loanYears, depositPercent }),
      );
    } catch {}
  }, [carPrice, interestRate, loanYears, depositPercent]);

  const depositAmount = carPrice * (depositPercent / 100);
  const loanAmount = carPrice - depositAmount;
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
            const v = parseFloat((e.target as HTMLInputElement).value);
            if (!isNaN(v) && v >= 0) setCarPrice(v);
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
              const v = parseFloat((e.target as HTMLInputElement).value);
              if (!isNaN(v) && v >= 0 && carPrice > 0) {
                setDepositPercent(
                  Math.min(50, Math.round((v / carPrice) * 100)),
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

      <p class="note">
        * Uses flat rate calculation (hire purchase), common for Malaysian car
        loans.
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

  // monthly = loanAmt * (1 + rate * years) / (years * 12)
  // loanAmt = monthly * years * 12 / (1 + rate * years)
  // carPrice = loanAmt / (1 - depositPct)
  const totalMonths = loanYears * 12;
  const loanAmount =
    (monthlyBudget * totalMonths) / (1 + (interestRate / 100) * loanYears);
  const carPrice = loanAmount / (1 - depositPercent / 100);
  const depositAmount = carPrice * (depositPercent / 100);
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
            const v = parseFloat((e.target as HTMLInputElement).value);
            if (!isNaN(v) && v >= 0) setMonthlyBudget(v);
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
              const v = parseFloat((e.target as HTMLInputElement).value);
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
        * Uses flat rate calculation (hire purchase), common for Malaysian car
        loans.
      </p>
    </div>
  );
}
