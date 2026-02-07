import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FinanceManager', () => {
    beforeEach(() => {
        // Reset state before each test
        state.money = 1000;
        state.currJobId = 'developer';
        state.business = null;
        state.realEstate = [];
        state.investments = 0;
        state.partner = null;
        state.children = [];
        state.housing = null;
        state.vehicle = null;
        state.items = [];
    });

    describe('calculateCostOfLiving', () => {
        it('should return base cost when no housing or vehicle', () => {
            const cost = FinanceManager.calculateCostOfLiving();
            expect(cost).toBe(500); // Base survival cost
        });

        it('should include housing upkeep', () => {
            state.housing = 'apartment';
            global.HOUSING = [{ id: 'apartment', upkeep: 200 }];

            const cost = FinanceManager.calculateCostOfLiving();
            expect(cost).toBe(700); // 500 + 200
        });

        it('should include vehicle upkeep', () => {
            state.vehicle = 'car';
            global.VEHICLES = [{ id: 'car', upkeep: 100 }];

            const cost = FinanceManager.calculateCostOfLiving();
            expect(cost).toBe(600); // 500 + 100
        });

        it('should include lifestyle inflation from items', () => {
            state.items = ['item1', 'item2', 'item3'];

            const cost = FinanceManager.calculateCostOfLiving();
            expect(cost).toBe(650); // 500 + (3 * 50)
        });
    });

    describe('calculateFamilyExpenses', () => {
        it('should return 0 when no partner or children', () => {
            const cost = FinanceManager.calculateFamilyExpenses();
            expect(cost).toBe(0);
        });

        it('should include partner expenses', () => {
            state.partner = { name: 'Test Partner' };

            const cost = FinanceManager.calculateFamilyExpenses();
            expect(cost).toBe(300);
        });

        it('should include child expenses (under 18)', () => {
            state.age = 40;
            state.children = [{ birthYear: 30 }]; // Child is 10 years old

            const cost = FinanceManager.calculateFamilyExpenses();
            expect(cost).toBe(800);
        });

        it('should include young adult expenses (18-25)', () => {
            state.age = 45;
            state.children = [{ birthYear: 25 }]; // Child is 20 years old

            const cost = FinanceManager.calculateFamilyExpenses();
            expect(cost).toBe(400);
        });

        it('should not include adult children expenses (25+)', () => {
            state.age = 50;
            state.children = [{ birthYear: 20 }]; // Child is 30 years old

            const cost = FinanceManager.calculateFamilyExpenses();
            expect(cost).toBe(0);
        });
    });

    describe('checkBankruptcy', () => {
        it('should not trigger bankruptcy above threshold', () => {
            state.money = -5000;
            FinanceManager.checkBankruptcy();

            expect(state.money).toBe(-5000); // Unchanged
        });

        it('should trigger bankruptcy below threshold', () => {
            state.money = -15000;
            state.housing = 'mansion';
            state.vehicle = 'luxury_car';

            FinanceManager.checkBankruptcy();

            expect(state.money).toBeGreaterThan(-15000); // Liquidated assets
            expect(state.housing).toBe('apartment'); // Reset to minimal
            expect(state.vehicle).toBe(null);
        });
    });

    describe('getFinancialSummary', () => {
        it('should calculate net worth correctly', () => {
            state.money = 5000;
            state.investments = 10000;
            state.realEstate = ['property1'];
            global.REAL_ESTATE = [{ id: 'property1', price: 50000 }];

            const summary = FinanceManager.getFinancialSummary();

            expect(summary.cash).toBe(5000);
            expect(summary.investments).toBe(10000);
            expect(summary.realEstate).toBe(50000);
            expect(summary.netWorth).toBe(65000);
        });

        it('should calculate monthly cash flow', () => {
            state.currJobId = 'developer';
            state.money = 1000;

            const summary = FinanceManager.getFinancialSummary();

            expect(summary.activeIncome).toBeGreaterThan(0);
            expect(summary.netFlow).toBeDefined();
        });
    });
});
