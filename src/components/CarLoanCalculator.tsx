import { useState, useEffect } from "preact/hooks";

const STORAGE_KEY = "carLoanCalc";

const DEFAULTS = {
  tab: "price" as "price" | "monthly",
  carPrice: 100000,
  interestRate: 3,
  loanYears: 9,
  depositPercent: 10,
  monthlyBudget: 1500,
  revInterestRate: 3,
  revLoanYears: 9,
  revDepositPercent: 10,
};

function loadSaved() {
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

export default function CarLoanCalculator() {
  const [init] = useState(loadSaved);
  const [tab, setTab] = useState<"price" | "monthly">(init.tab);

  // Price -> Monthly tab
  const [carPrice, setCarPrice] = useState(init.carPrice);
  const [interestRate, setInterestRate] = useState(init.interestRate);
  const [loanYears, setLoanYears] = useState(init.loanYears);
  const [depositPercent, setDepositPercent] = useState(init.depositPercent);

  // Monthly -> Price tab
  const [monthlyBudget, setMonthlyBudget] = useState(init.monthlyBudget);
  const [revInterestRate, setRevInterestRate] = useState(init.revInterestRate);
  const [revLoanYears, setRevLoanYears] = useState(init.revLoanYears);
  const [revDepositPercent, setRevDepositPercent] = useState(
    init.revDepositPercent,
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tab,
          carPrice,
          interestRate,
          loanYears,
          depositPercent,
          monthlyBudget,
          revInterestRate,
          revLoanYears,
          revDepositPercent,
        }),
      );
    } catch {}
  }, [
    tab,
    carPrice,
    interestRate,
    loanYears,
    depositPercent,
    monthlyBudget,
    revInterestRate,
    revLoanYears,
    revDepositPercent,
  ]);

  // Price -> Monthly calculation
  const depositAmount = carPrice * (depositPercent / 100);
  const loanAmount = carPrice - depositAmount;
  const totalInterest = loanAmount * (interestRate / 100) * loanYears;
  const totalPayable = loanAmount + totalInterest;
  const monthlyPayment = totalPayable / (loanYears * 12);

  // Monthly -> Price calculation
  // monthly = (loanAmt + loanAmt * rate * years) / (years * 12)
  // monthly = loanAmt * (1 + rate * years) / (years * 12)
  // loanAmt = monthly * years * 12 / (1 + rate * years)
  // carPrice = loanAmt / (1 - depositPct)
  const revTotalMonths = revLoanYears * 12;
  const revLoanAmount =
    (monthlyBudget * revTotalMonths) /
    (1 + (revInterestRate / 100) * revLoanYears);
  const revCarPrice = revLoanAmount / (1 - revDepositPercent / 100);
  const revDepositAmount = revCarPrice * (revDepositPercent / 100);
  const revTotalInterest =
    revLoanAmount * (revInterestRate / 100) * revLoanYears;
  const revTotalPayable = revLoanAmount + revTotalInterest;

  return (
    <div class="calc">
      <div class="tabs">
        <button
          class={`tab ${tab === "price" ? "active" : ""}`}
          onClick={() => setTab("price")}
        >
          Price &rarr; Monthly
        </button>
        <button
          class={`tab ${tab === "monthly" ? "active" : ""}`}
          onClick={() => setTab("monthly")}
        >
          Monthly &rarr; Price
        </button>
      </div>

      {tab === "price" ? (
        <>
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
                setInterestRate(
                  parseFloat((e.target as HTMLInputElement).value),
                )
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
              Down Payment: <strong>{depositPercent}%</strong> (
              {formatRM(depositAmount)})
            </label>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={depositPercent}
              onInput={(e) =>
                setDepositPercent(
                  parseInt((e.target as HTMLInputElement).value),
                )
              }
            />
            <div class="range-labels">
              <span>0%</span>
              <span>50%</span>
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
        </>
      ) : (
        <>
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
              Interest Rate (flat):{" "}
              <strong>{revInterestRate.toFixed(2)}%</strong>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              step={0.1}
              value={revInterestRate}
              onInput={(e) =>
                setRevInterestRate(
                  parseFloat((e.target as HTMLInputElement).value),
                )
              }
            />
            <div class="range-labels">
              <span>1%</span>
              <span>6%</span>
            </div>
          </div>

          <div class="field">
            <label>
              Loan Tenure: <strong>{revLoanYears} years</strong>
            </label>
            <input
              type="range"
              min={1}
              max={9}
              step={1}
              value={revLoanYears}
              onInput={(e) =>
                setRevLoanYears(parseInt((e.target as HTMLInputElement).value))
              }
            />
            <div class="range-labels">
              <span>1 yr</span>
              <span>9 yrs</span>
            </div>
          </div>

          <div class="field">
            <label>
              Down Payment: <strong>{revDepositPercent}%</strong> (
              {formatRM(revDepositAmount)})
            </label>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={revDepositPercent}
              onInput={(e) =>
                setRevDepositPercent(
                  parseInt((e.target as HTMLInputElement).value),
                )
              }
            />
            <div class="range-labels">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>

          <div class="results">
            <div class="result-row monthly">
              <span>Car Price You Can Afford</span>
              <span class="value">{formatRM(revCarPrice)}</span>
            </div>
            <div class="result-row">
              <span>Down Payment</span>
              <span class="value">{formatRM(revDepositAmount)}</span>
            </div>
            <div class="result-row">
              <span>Loan Amount</span>
              <span class="value">{formatRM(revLoanAmount)}</span>
            </div>
            <div class="result-row">
              <span>Total Interest</span>
              <span class="value">{formatRM(revTotalInterest)}</span>
            </div>
            <div class="result-row">
              <span>Total Payable</span>
              <span class="value">{formatRM(revTotalPayable)}</span>
            </div>
          </div>
        </>
      )}

      <p class="note">
        * Uses flat rate calculation (hire purchase), common for Malaysian car
        loans.
      </p>
    </div>
  );
}
