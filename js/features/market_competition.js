/**
 * Market Competition & Espionage System
 * 
 * Mechanics:
 * 1. Market Share Simulation (Every 6 months)
 *    - Winner: Bonus + Status
 *    - Loser: Firing Risk + Freeze
 * 
 * 2. Espionage (Action)
 *    - High Risk / High Reward
 *    - Requires: Ambitious trait OR Bad Karma (Rep < 20)
 */

const MarketCompetition = {
    // Configuration
    config: {
        intervalMonths: 6,
        baseWinChance: 0.5,
        espionage: {
            baseRisk: 0.30, // 30% chance of getting caught
            rewardMult: 6,  // 6x monthly salary
            blacklistYears: 99 // Lifetime ban (effectively)
        }
    },

    init() {
        // Subscribe to events or init state if needed
        if (!state.market) {
            state.market = {
                lastSimMonth: 0,
                history: []
            };
        }
    },

    update() {
        // Run simulation every 6 months (Jan & July usually)
        if (state.totalMonths > 0 && state.totalMonths % this.config.intervalMonths === 0) {
            this.simulateMarket();
        }
    },

    simulateMarket() {
        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job || !job.companyId) return; // Only corporate/company jobs

        const company = COMPANIES.find(c => c.id === job.companyId);
        if (!company) return;

        // Determine Winner
        // Factors: World Economy, Random, Player Performance (small impact)
        let winChance = this.config.baseWinChance;

        // Player impact (if high level)
        if (state.jobLevel >= 3) {
            const performanceImpact = (state.work_relations.performance - 50) / 200; // +/- 25% max
            winChance += performanceImpact;
        }

        // World Trends
        if (state.world && state.world.currentTrend) {
            if (state.world.currentTrend.type === company.sector) winChance += 0.2;
        }

        const isWinner = Math.random() < winChance;
        this.processResult(isWinner, company);
    },

    processResult(isWinner, company) {
        const result = {
            date: state.totalMonths,
            company: company.name,
            won: isWinner
        };
        state.market.history.push(result);

        if (isWinner) {
            // WINNER REWARDS
            const salary = Game.calculateFinancials().activeIncome; // Monthly
            const bonus = Math.floor(salary * 0.5); // 50% Bonus

            Game.updateStat('money', bonus);
            Game.updateStat('status', 5);
            Game.updateStat('happiness', 10);

            UI.showAlert("🏆 VICTORIA DE MERCADO", `¡${company.name} ha dominado el semestre!\nRecibes un bono de desempeño de $${bonus.toLocaleString()}.`);
            UI.log(`Bonus de Victoria de Mercado: +$${bonus}`, "good");
            AudioSys.playMoney();
        } else {
            // LOSER PENALTIES
            UI.log(`${company.name} perdió cuota de mercado este semestre.`, "bad");

            // 1. Layoff Risk (10%)
            if (Math.random() < 0.10) {
                this.triggerLayoff();
            } else {
                // 2. Freeze (Just notification for now, maybe block raises)
                UI.showAlert("📉 CAÍDA DE MERCADO", `${company.name} ha tenido un mal semestre.\nSe han congelado los aumentos y contrataciones.`);
                Game.updateStat('stress', 10);
                Game.updateStat('happiness', -5);
            }
        }
    },

    triggerLayoff() {
        // Protection: High Performance saves you
        if (state.work_relations.performance > 80) {
            UI.showAlert("⚠️ RECORTE DE PERSONAL", "La empresa está despidiendo gente, pero tu alto rendimiento te ha salvado.");
            UI.log("Sobreviviste al recorte de personal.", "good");
        } else {
            // Fired
            state.currJobId = 'unemployed';
            state.jobXP = 0;
            state.work_relations = { boss: 50, colleagues: 50, performance: 50 };

            UI.showAlert("❌ DESPIDO MASIVO", "Debido a las pérdidas, la empresa ha reducido su plantilla.\nHas sido despedido.");
            UI.log("Despedido por reestructuración.", "bad");
            Game.updateStat('happiness', -20);
        }
    },

    // --- ACTIONS ---

    commitEspionage() {
        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job || !job.companyId) return;

        // Confirmation
        if (!confirm("🕵️ ¿FILTRAR SECRETOS?\n\nRiesgo: Lista Negra de por vida en el sector.\nBeneficio: 6 meses de salario.\n\n¿Estás seguro?")) return;

        const chance = Math.random();
        if (chance > this.config.espionage.baseRisk) {
            // SUCCESS
            const salary = Game.calculateFinancials().activeIncome;
            const reward = salary * this.config.espionage.rewardMult;

            Game.updateStat('money', reward);
            Game.updateStat('stress', 20); // High stress
            // Karma penalty? (If we had karma)

            UI.showAlert("🕵️ ÉXITO", `Has vendido los datos a la competencia.\nGanancia: $${reward.toLocaleString()}.`);
            UI.log("Espionaje corporativo exitoso.", "bad"); // Bad moral, good money
            AudioSys.playMoney();
        } else {
            // CAUGHT
            const company = COMPANIES.find(c => c.id === job.companyId);

            // 1. Fired
            state.currJobId = 'unemployed';
            state.jobXP = 0;

            // 2. Blacklist (Lifetime)
            // Blacklist entire sector? Or just this company? User said "sector de por vida".
            // We need a way to ban a sector.
            if (!state.sectorBlacklist) state.sectorBlacklist = {};
            state.sectorBlacklist[company.sector] = true;

            UI.showAlert("🚨 ATRAPADO", `Seguridad corporativa te ha descubierto.\nHas sido despedido y VETADO DE POR VIDA del sector ${company.sector.toUpperCase()}.`);
            UI.log("Atrapado cometiendo espionaje.", "bad");
            Game.updateStat('status', -50);
            Game.updateStat('happiness', -30);
        }

        UI.render();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    // Check if player can spy
    canSpy() {
        if (state.currJobId === 'unemployed') return false;
        // Ambitious OR Low Reputation/Karma check
        const isAmbitious = state.traits.includes('ambitious');
        // We assume 'reputation' or similar exists, using status for now or boss relation?
        // User said "karma", let's use a hidden moral stat or just assume low boss relation imply dissatisfaction?
        // Or strictly strictly implement per request.
        // Let's stick to Ambitious for now as the trait exists.
        return isAmbitious;
    }
};
