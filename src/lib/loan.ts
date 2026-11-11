export interface LoanTerms {
  price: number;
  depositPercent: number;
  annualRate: number;
  years: number;
  rebate?: number;
}

export interface LoanQuote {
  priceAfterRebate: number;
  deposit: number;
  loan: number;
  interest: number;
  payable: number;
  monthly: number;
}

export interface BudgetTerms {
  monthlyBudget: number;
  depositPercent: number;
  annualRate: number;
  years: number;
  rebate?: number;
}

export interface AmortPoint {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

export type LoanKind = "flat" | "reducing";

const months = (years: number) => Math.max(1, Math.round(years * 12));

/** Flat-rate hire purchase, the Malaysian car loan method. */
export function flatRateQuote({
  price,
  depositPercent,
  annualRate,
  years,
  rebate = 0,
}: LoanTerms): LoanQuote {
  const priceAfterRebate = Math.max(0, price - rebate);
  const deposit = priceAfterRebate * (depositPercent / 100);
  const loan = priceAfterRebate - deposit;
  const interest = loan * (annualRate / 100) * years;
  const payable = loan + interest;
  return {
    priceAfterRebate,
    deposit,
    loan,
    interest,
    payable,
    monthly: payable / months(years),
  };
}

/** Price you can afford from a monthly budget, flat-rate. */
export function invertFlatRate({
  monthlyBudget,
  depositPercent,
  annualRate,
  years,
  rebate = 0,
}: BudgetTerms): LoanQuote {
  const totalMonths = months(years);
  const loan = (monthlyBudget * totalMonths) / (1 + (annualRate / 100) * years);
  const priceAfterRebate = loan / (1 - depositPercent / 100);
  return {
    priceAfterRebate,
    deposit: priceAfterRebate * (depositPercent / 100),
    loan,
    interest: loan * (annualRate / 100) * years,
    payable: loan * (1 + (annualRate / 100) * years),
    monthly: monthlyBudget,
  };
}

/**
 * Total outlay per ringgit of price under flat rate:
 * price + interest = price × multiplier.
 */
export function totalCostMultiplier(
  depositPercent: number,
  annualRate: number,
  years: number,
): number {
  return 1 + (1 - depositPercent / 100) * (annualRate / 100) * years;
}

function reducingMonthly(loan: number, annualRate: number, term: number) {
  if (annualRate === 0) return loan / term;
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, term);
  return (loan * r * factor) / (factor - 1);
}

/** Reducing balance (monthly rest), the Malaysian housing loan method. */
export function reducingBalanceQuote({
  price,
  depositPercent,
  annualRate,
  years,
  rebate = 0,
}: LoanTerms): LoanQuote {
  const priceAfterRebate = Math.max(0, price - rebate);
  const deposit = priceAfterRebate * (depositPercent / 100);
  const loan = priceAfterRebate - deposit;
  const term = months(years);
  const monthly = reducingMonthly(loan, annualRate, term);
  const payable = monthly * term;
  return {
    priceAfterRebate,
    deposit,
    loan,
    interest: payable - loan,
    payable,
    monthly,
  };
}

/** Price you can afford from a monthly budget, reducing balance. */
export function invertReducingBalance({
  monthlyBudget,
  depositPercent,
  annualRate,
  years,
  rebate = 0,
}: BudgetTerms): LoanQuote {
  const term = months(years);
  let loan: number;
  if (annualRate === 0) {
    loan = monthlyBudget * term;
  } else {
    const r = annualRate / 100 / 12;
    const factor = Math.pow(1 + r, term);
    loan = (monthlyBudget * (factor - 1)) / (r * factor);
  }
  const priceAfterRebate = loan / (1 - depositPercent / 100);
  return {
    priceAfterRebate,
    deposit: priceAfterRebate * (depositPercent / 100),
    loan,
    interest: monthlyBudget * term - loan,
    payable: monthlyBudget * term,
    monthly: monthlyBudget,
  };
}

export function quote(kind: LoanKind, terms: LoanTerms): LoanQuote {
  return kind === "flat" ? flatRateQuote(terms) : reducingBalanceQuote(terms);
}

export interface ScheduleEntry {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export function amortizationSchedule(
  loan: number,
  annualRate: number,
  monthlyPayment: number,
  years: number,
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = [];
  const term = months(years);
  const r = annualRate / 100 / 12;
  let balance = loan;

  for (let i = 1; i <= term && balance > 0; i++) {
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

/** Straight-line split used by flat-rate loans, where interest accrues evenly. */
export function flatRateSeries(
  loan: number,
  interest: number,
  years: number,
): AmortPoint[] {
  const payable = loan + interest;
  return Array.from({ length: Math.max(1, years) + 1 }, (_, year) => {
    const principal = (loan / Math.max(1, years)) * year;
    const paidInterest = (interest / Math.max(1, years)) * year;
    return {
      year,
      principal,
      interest: paidInterest,
      balance: payable - principal - paidInterest,
    };
  });
}

/** Aggregate a monthly schedule into year-end points. */
export function scheduleSeries(
  schedule: ScheduleEntry[],
  loan: number,
  years: number,
): AmortPoint[] {
  const points: AmortPoint[] = [
    { year: 0, principal: 0, interest: 0, balance: loan },
  ];
  let interestToDate = 0;
  for (let year = 1; year <= years; year++) {
    const monthEnd = Math.min(year * 12, schedule.length);
    const entry = schedule[monthEnd - 1];
    if (!entry) break;
    for (let i = (year - 1) * 12; i < monthEnd; i++) {
      interestToDate += schedule[i].interest;
    }
    points.push({
      year,
      principal: loan - entry.balance,
      interest: interestToDate,
      balance: entry.balance,
    });
  }
  return points;
}
