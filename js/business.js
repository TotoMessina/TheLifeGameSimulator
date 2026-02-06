const Business = {
    TYPES: {
        saas: { name: 'SaaS B2B', cost: 5000, pot: 1.5, diff: 2 },
        ecom: { name: 'E-Commerce', cost: 3000, pot: 1.2, diff: 1 },
        app: { name: 'Mobile App', cost: 2000, pot: 2.0, diff: 3 }
    },

    startCompany(typeKey, name) {
        const type = this.TYPES[typeKey];
        if (state.money < type.cost) return false;

        state.money -= type.cost;
        state.business = {
            active: true,
            name: name,
            type: typeKey,
            cash: type.cost * 0.5, // Seed capital remaining
            revenue: 0,
            users: 0,
            growth: 0,

            // Effort Allocation (0-10)
            alloc: { prod: 4, mkt: 3, sales: 3 },

            // Metrics
            productQual: 10,
            brand: 0,

            history: [] // For graphs later
        };

        UI.log(`Fundaste ${name}! 🚀`, 'good');
        return true;
    },

    tick() {
        if (!state.business || !state.business.active) return;

        const biz = state.business;
        const type = this.TYPES[biz.type];

        // 1. Effort Impact
        // Product: Increases Quality (Retention)
        biz.productQual += (biz.alloc.prod * 0.1);

        // Marketing: Increases Users (Acquisition)
        const newUsers = Math.floor(
            (biz.alloc.mkt * 10 * type.pot) +
            (Math.random() * biz.brand)
        );
        biz.users += newUsers;

        // Sales: Monetization (ARPU)
        const arpu = (biz.alloc.sales * 0.5) + (biz.productQual * 0.05);

        // 2. Churn (Bad product = user loss)
        const churnRate = Math.max(0.05, 1 - (biz.productQual / 100));
        const lostUsers = Math.floor(biz.users * churnRate);
        biz.users -= lostUsers;
        if (biz.users < 0) biz.users = 0;

        // 3. Financials
        biz.revenue = Math.floor(biz.users * arpu);

        // Costs
        const burnRate =
            500 + // Base OpEx
            (biz.alloc.prod * 50) +
            (biz.alloc.mkt * 100) +
            (biz.alloc.sales * 50);

        biz.cash += (biz.revenue - burnRate);

        // 4. Bankruptcy Check
        if (biz.cash < 0) {
            this.bankrupt();
            return;
        }

        // Growth Tracking
        biz.growth = ((newUsers - lostUsers) / (biz.users || 1)) * 100;

        // Log Events
        if (biz.revenue > 10000 && biz.revenue < 15000) {
            UI.log(`¡${biz.name} superó los $10k MRR! 📈`, 'good');
        }
    },

    bankrupt() {
        UI.log(`☠️ ${state.business.name} se quedó sin caja. Game Over para la startup.`, 'bad');
        state.business.active = false;
        // Optionally lose personal reputation or health
        state.happiness -= 20;
    },

    injectCash(amount, equityPct) {
        state.business.cash += amount;
        // Logic for equity dilution to be added if needed
        UI.log(`Inversión recibida: +$${amount}`, 'good');
    }
};
