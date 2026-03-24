from datetime import datetime

from app.services.simulation import run_simulation


def _base_plan():
    return {
        "household": {
            "self": {"age": 30},
            "spouse": {"age": 28},
        },
        "income": {
            "selfAnnualIncome": 5000000,
            "spouseAnnualIncome": 4000000,
            "selfBonus": 500000,
            "spouseBonus": 400000,
            "sideJobIncome": 0,
            "otherIncome": 0,
        },
        "expense": {
            "housing": 100000,
            "food": 60000,
            "utilities": 15000,
            "communication": 10000,
            "insurance": 20000,
            "car": 0,
            "dailyGoods": 10000,
            "entertainment": 20000,
            "travel": 200000,
            "otherFixed": 10000,
            "otherVariable": 20000,
        },
        "assets": {
            "savings": 3000000,
            "securities": 1000000,
            "nisa": 500000,
            "ideco": 300000,
            "cash": 200000,
            "other": 0,
        },
        "debt": {
            "mortgageLoan": 0,
            "mortgageMonthly": 0,
            "carLoan": 0,
            "studentLoan": 0,
            "otherDebt": 0,
        },
        "investment": {
            "monthlyInvestment": 50000,
            "expectedReturn": 5,
            "nisaMonthly": 30000,
            "idecoMonthly": 23000,
        },
    }


class TestRunSimulation:
    def test_returns_correct_number_of_years(self):
        result = run_simulation(_base_plan(), years=10)
        assert len(result) == 10

    def test_limits_years_to_100_minus_age(self):
        plan = _base_plan()
        plan["household"]["self"]["age"] = 95
        result = run_simulation(plan, years=30)
        assert len(result) == 5

    def test_returns_empty_for_age_100(self):
        plan = _base_plan()
        plan["household"]["self"]["age"] = 100
        result = run_simulation(plan, years=10)
        assert len(result) == 0

    def test_first_year_is_current_year(self):
        result = run_simulation(_base_plan(), years=5)
        assert result[0]["year"] == datetime.now().year

    def test_ages_increment(self):
        plan = _base_plan()
        result = run_simulation(plan, years=5)
        for i, row in enumerate(result):
            assert row["age"] == 30 + i
            assert row["spouseAge"] == 28 + i

    def test_annual_income_calculated_correctly(self):
        plan = _base_plan()
        result = run_simulation(plan, years=1)
        expected = (
            plan["income"]["selfAnnualIncome"]
            + plan["income"]["spouseAnnualIncome"]
            + plan["income"]["selfBonus"]
            + plan["income"]["spouseBonus"]
            + plan["income"]["sideJobIncome"]
            + plan["income"]["otherIncome"]
        )
        assert result[0]["annualIncome"] == expected

    def test_investment_compound_growth(self):
        plan = _base_plan()
        plan["income"]["selfAnnualIncome"] = 10000000
        plan["income"]["spouseAnnualIncome"] = 0
        plan["income"]["selfBonus"] = 0
        plan["income"]["spouseBonus"] = 0
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["assets"]["securities"] = 1000000
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 10

        result = run_simulation(plan, years=2)
        assert abs(result[0]["investments"] - 1100000) < 1
        assert abs(result[1]["investments"] - 1210000) < 1

    def test_debt_decreases(self):
        plan = _base_plan()
        plan["income"]["selfAnnualIncome"] = 10000000
        plan["income"]["spouseAnnualIncome"] = 0
        plan["income"]["selfBonus"] = 0
        plan["income"]["spouseBonus"] = 0
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["debt"]["mortgageLoan"] = 10000000
        plan["debt"]["mortgageMonthly"] = 100000
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 0

        result = run_simulation(plan, years=3)
        assert result[0]["totalDebt"] == 10000000 - 1200000
        assert result[1]["totalDebt"] == 10000000 - 2400000

    def test_debt_does_not_go_below_zero(self):
        plan = _base_plan()
        plan["income"]["selfAnnualIncome"] = 10000000
        plan["income"]["spouseAnnualIncome"] = 0
        plan["income"]["selfBonus"] = 0
        plan["income"]["spouseBonus"] = 0
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["debt"]["mortgageLoan"] = 500000
        plan["debt"]["mortgageMonthly"] = 100000
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 0

        result = run_simulation(plan, years=3)
        assert result[0]["totalDebt"] == 0
        assert result[1]["totalDebt"] == 0

    def test_net_assets_equals_total_minus_debt(self):
        result = run_simulation(_base_plan(), years=5)
        for row in result:
            assert abs(row["netAssets"] - (row["totalAssets"] - row["totalDebt"])) < 1

    def test_zero_income_and_expense(self):
        plan = _base_plan()
        plan["income"] = {k: 0 for k in plan["income"]}
        plan["expense"] = {k: 0 for k in plan["expense"]}
        plan["debt"] = {k: 0 for k in plan["debt"]}
        plan["investment"]["monthlyInvestment"] = 0
        plan["investment"]["expectedReturn"] = 0
        plan["assets"] = {k: 0 for k in plan["assets"]}
        plan["assets"]["savings"] = 1000000

        result = run_simulation(plan, years=5)
        assert len(result) == 5
        for row in result:
            assert row["totalAssets"] == 1000000
            assert row["annualSavings"] == 0
