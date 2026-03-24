import { describe, it, expect } from 'vitest';
import { runSimulation, formatCurrency, formatMan } from '../lib/simulation';
import { defaultLifePlan } from '../lib/storage';
import { LifePlan } from '../lib/types';

describe('runSimulation', () => {
  it('returns correct number of years based on input', () => {
    const results = runSimulation(defaultLifePlan, 10);
    expect(results).toHaveLength(10);
  });

  it('limits years to 100 minus self age', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      household: {
        ...defaultLifePlan.household,
        self: { ...defaultLifePlan.household.self, age: 95 },
      },
    };
    const results = runSimulation(plan, 30);
    expect(results).toHaveLength(5);
  });

  it('first year starts at current year', () => {
    const results = runSimulation(defaultLifePlan, 5);
    const currentYear = new Date().getFullYear();
    expect(results[0].year).toBe(currentYear);
  });

  it('ages increment each year', () => {
    const results = runSimulation(defaultLifePlan, 5);
    const baseAge = defaultLifePlan.household.self.age;
    results.forEach((row, i) => {
      expect(row.age).toBe(baseAge + i);
    });
  });

  it('spouse ages increment each year', () => {
    const results = runSimulation(defaultLifePlan, 5);
    const baseSpouseAge = defaultLifePlan.household.spouse.age;
    results.forEach((row, i) => {
      expect(row.spouseAge).toBe(baseSpouseAge + i);
    });
  });

  it('calculates annual income correctly', () => {
    const results = runSimulation(defaultLifePlan, 1);
    const expectedIncome =
      defaultLifePlan.income.selfAnnualIncome +
      defaultLifePlan.income.spouseAnnualIncome +
      defaultLifePlan.income.selfBonus +
      defaultLifePlan.income.spouseBonus +
      defaultLifePlan.income.sideJobIncome +
      defaultLifePlan.income.otherIncome;
    expect(results[0].annualIncome).toBe(expectedIncome);
  });

  it('investments grow with compound interest', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { ...defaultLifePlan.income, selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 0, securities: 1000000, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 10, nisaMonthly: 0, idecoMonthly: 0 },
    };
    const results = runSimulation(plan, 2);
    // Year 1: 1000000 * 1.10 = 1100000
    expect(results[0].investments).toBeCloseTo(1100000, 0);
    // Year 2: 1100000 * 1.10 = 1210000
    expect(results[1].investments).toBeCloseTo(1210000, 0);
  });

  it('debt decreases over time', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 10000000, mortgageMonthly: 100000, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0 },
    };
    const results = runSimulation(plan, 3);
    // mortgageMonthly * 12 = 1200000/year
    expect(results[0].totalDebt).toBe(10000000 - 1200000);
    expect(results[1].totalDebt).toBe(10000000 - 2400000);
  });

  it('debt does not go below zero', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { selfAnnualIncome: 10000000, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 0, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 500000, mortgageMonthly: 100000, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0 },
    };
    const results = runSimulation(plan, 3);
    expect(results[0].totalDebt).toBe(0);
    expect(results[1].totalDebt).toBe(0);
  });

  it('handles zero income and expenses', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      income: { selfAnnualIncome: 0, spouseAnnualIncome: 0, selfBonus: 0, spouseBonus: 0, sideJobIncome: 0, otherIncome: 0 },
      expense: { housing: 0, food: 0, utilities: 0, communication: 0, insurance: 0, car: 0, dailyGoods: 0, entertainment: 0, travel: 0, otherFixed: 0, otherVariable: 0 },
      assets: { savings: 1000000, securities: 0, nisa: 0, ideco: 0, cash: 0, other: 0 },
      debt: { mortgageLoan: 0, mortgageMonthly: 0, carLoan: 0, studentLoan: 0, otherDebt: 0 },
      investment: { monthlyInvestment: 0, expectedReturn: 0, nisaMonthly: 0, idecoMonthly: 0 },
    };
    const results = runSimulation(plan, 5);
    expect(results.length).toBe(5);
    results.forEach((row) => {
      expect(row.totalAssets).toBe(1000000);
      expect(row.annualSavings).toBe(0);
    });
  });

  it('returns empty array if maxYears is zero', () => {
    const plan: LifePlan = {
      ...defaultLifePlan,
      household: {
        ...defaultLifePlan.household,
        self: { ...defaultLifePlan.household.self, age: 100 },
      },
    };
    const results = runSimulation(plan, 10);
    expect(results).toHaveLength(0);
  });

  it('net assets equals total assets minus total debt', () => {
    const results = runSimulation(defaultLifePlan, 5);
    results.forEach((row) => {
      expect(row.netAssets).toBeCloseTo(row.totalAssets - row.totalDebt, 0);
    });
  });
});

describe('formatCurrency', () => {
  it('formats oku (100M+) amounts', () => {
    expect(formatCurrency(100000000)).toBe('1.0億円');
    expect(formatCurrency(250000000)).toBe('2.5億円');
  });

  it('formats man (10K+) amounts', () => {
    expect(formatCurrency(10000)).toBe('1万円');
    expect(formatCurrency(50000)).toBe('5万円');
    expect(formatCurrency(10000000)).toBe('1,000万円');
  });

  it('formats small amounts in yen', () => {
    expect(formatCurrency(5000)).toBe('5,000円');
    expect(formatCurrency(100)).toBe('100円');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-200000000)).toBe('-2.0億円');
    expect(formatCurrency(-50000)).toBe('-5万円');
  });
});

describe('formatMan', () => {
  it('formats amounts in man-yen', () => {
    expect(formatMan(10000)).toBe('1万円');
    expect(formatMan(5000000)).toBe('500万円');
    expect(formatMan(10000000)).toBe('1,000万円');
  });

  it('rounds to nearest man', () => {
    expect(formatMan(15000)).toBe('2万円');
    expect(formatMan(14999)).toBe('1万円');
  });
});
