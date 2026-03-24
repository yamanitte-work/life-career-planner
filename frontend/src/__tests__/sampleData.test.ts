import { describe, it, expect } from 'vitest';
import { sampleLifePlan } from '../lib/sampleData';

describe('sampleLifePlan', () => {
  it('has valid self age', () => {
    expect(sampleLifePlan.household.self.age).toBeGreaterThan(0);
    expect(sampleLifePlan.household.self.age).toBeLessThan(100);
  });

  it('has valid spouse age', () => {
    expect(sampleLifePlan.household.spouse.age).toBeGreaterThan(0);
    expect(sampleLifePlan.household.spouse.age).toBeLessThan(100);
  });

  it('has non-negative income values', () => {
    const { income } = sampleLifePlan;
    expect(income.selfAnnualIncome).toBeGreaterThanOrEqual(0);
    expect(income.spouseAnnualIncome).toBeGreaterThanOrEqual(0);
    expect(income.selfBonus).toBeGreaterThanOrEqual(0);
    expect(income.spouseBonus).toBeGreaterThanOrEqual(0);
    expect(income.sideJobIncome).toBeGreaterThanOrEqual(0);
    expect(income.otherIncome).toBeGreaterThanOrEqual(0);
  });

  it('has non-negative expense values', () => {
    const { expense } = sampleLifePlan;
    Object.values(expense).forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  it('has non-negative asset values', () => {
    const { assets } = sampleLifePlan;
    Object.values(assets).forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  it('has non-negative debt values', () => {
    const { debt } = sampleLifePlan;
    Object.values(debt).forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  it('has valid investment settings', () => {
    const { investment } = sampleLifePlan;
    expect(investment.monthlyInvestment).toBeGreaterThanOrEqual(0);
    expect(investment.expectedReturn).toBeGreaterThanOrEqual(0);
    expect(investment.expectedReturn).toBeLessThanOrEqual(20);
    expect(investment.nisaMonthly).toBeGreaterThanOrEqual(0);
    expect(investment.idecoMonthly).toBeGreaterThanOrEqual(0);
  });

  it('has all required household fields', () => {
    const { household } = sampleLifePlan;
    expect(household.self.name).toBeTruthy();
    expect(household.spouse.name).toBeTruthy();
    expect(household.residenceArea).toBeTruthy();
    expect(household.familyComposition).toBeTruthy();
  });
});
