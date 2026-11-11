import assert from "node:assert/strict";
import test from "node:test";
import {
  amortizationSchedule,
  flatRateQuote,
  flatRateSeries,
  invertFlatRate,
  invertReducingBalance,
  reducingBalanceQuote,
  scheduleSeries,
  totalCostMultiplier,
} from "./loan.ts";

const close = (actual: number, expected: number, epsilon = 0.01) =>
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${actual} is not within ${epsilon} of ${expected}`,
  );

test("flat rate quote matches hire purchase maths", () => {
  const q = flatRateQuote({
    price: 100000,
    rebate: 5000,
    depositPercent: 10,
    annualRate: 3,
    years: 9,
  });
  close(q.priceAfterRebate, 95000);
  close(q.deposit, 9500);
  close(q.loan, 85500);
  close(q.interest, 23085);
  close(q.payable, 108585);
  close(q.monthly, 108585 / 108);
});

test("flat rate inversion round-trips the price", () => {
  const terms = {
    price: 87000,
    depositPercent: 12,
    annualRate: 2.8,
    years: 7,
  };
  const q = flatRateQuote(terms);
  const inverted = invertFlatRate({ ...terms, monthlyBudget: q.monthly });
  close(inverted.priceAfterRebate, q.priceAfterRebate);
  close(inverted.loan, q.loan);
});

test("total cost multiplier is price plus interest per price", () => {
  const q = flatRateQuote({
    price: 100000,
    depositPercent: 20,
    annualRate: 4,
    years: 5,
  });
  close(q.deposit + q.payable, 116000);
  close(totalCostMultiplier(20, 4, 5), 1.16);
});

test("reducing balance quote matches mortgage maths", () => {
  const q = reducingBalanceQuote({
    price: 500000,
    depositPercent: 10,
    annualRate: 3.5,
    years: 30,
  });
  close(q.loan, 450000);
  close(q.monthly, 2020.701, 0.01);
  close(q.interest, q.payable - q.loan);
});

test("reducing balance inversion round-trips the price", () => {
  const terms = {
    price: 640000,
    depositPercent: 15,
    annualRate: 4.1,
    years: 25,
  };
  const q = reducingBalanceQuote(terms);
  const inverted = invertReducingBalance({
    ...terms,
    monthlyBudget: q.monthly,
  });
  close(inverted.priceAfterRebate, q.priceAfterRebate);
});

test("schedule pays off the loan and splits it into principal and interest", () => {
  const q = reducingBalanceQuote({
    price: 500000,
    depositPercent: 10,
    annualRate: 3.5,
    years: 30,
  });
  const schedule = amortizationSchedule(q.loan, 3.5, q.monthly, 30);
  assert.equal(schedule.length, 360);
  close(schedule.at(-1)!.balance, 0, 0.01);
  const principal = schedule.reduce((sum, m) => sum + m.principal, 0);
  const interest = schedule.reduce((sum, m) => sum + m.interest, 0);
  close(principal, q.loan, 0.01);
  close(interest, q.interest, 0.01);
});

test("flat rate series ends where the loan starts and closes", () => {
  const points = flatRateSeries(85500, 23085, 9);
  assert.equal(points.length, 10);
  close(points[0].balance, 108585);
  close(points[9].principal, 85500);
  close(points[9].balance, 0);
});

test("schedule series aggregates by year", () => {
  const q = reducingBalanceQuote({
    price: 500000,
    depositPercent: 10,
    annualRate: 3.5,
    years: 30,
  });
  const schedule = amortizationSchedule(q.loan, 3.5, q.monthly, 30);
  const points = scheduleSeries(schedule, q.loan, 30);
  assert.equal(points.length, 31);
  close(points[0].balance, q.loan);
  close(points.at(-1)!.principal, q.loan, 0.5);
  close(points.at(-1)!.interest, q.interest, 0.5);
});
