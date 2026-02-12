
const World = {
    trends: [
        {
            id: 'ai_boom',
            name: 'Auge de la IA',
            headline: '🤖 La IA Transforma la Economía',
            desc: 'Las empresas tecnológicas crecen exponencialmente. Los salarios en tecnología aumentan.',
            type: 'tech',
            duration: 12,
            effects: { jobSalary: 1.3, stockMarket: 1.2 }
        },
        {
            id: 'pandemic',
            name: 'Pandemia Global',
            headline: '😷 Alerta Sanitaria Mundial',
            desc: 'Se recomienda no salir. La salud mental y física decaen más rápido.',
            type: 'bad',
            duration: 8,
            effects: { healthDecay: 1.5, mHealthDecay: 1.5, activityCost: 1.5 }
        },
        {
            id: 'housing_bubble',
            name: 'Burbuja Inmobiliaria',
            headline: '🏠 Precios de Vivienda por las Nubes',
            desc: 'El mercado inmobiliario está sobrevalorado. Comprar casa es más caro.',
            type: 'economy',
            duration: 10,
            effects: { realEstatePrice: 1.5 }
        },
        {
            id: 'crypto_crash',
            name: 'Invierno Cripto',
            headline: '📉 Desplome del Mercado Cripto',
            desc: 'Las criptomonedas pierden valor rápidamente.',
            type: 'bad',
            duration: 6,
            effects: { cryptoPrice: 0.5 }
        },
        {
            id: 'cultural_ren',
            name: 'Renacimiento Cultural',
            headline: '🎨 Explosión Artística',
            desc: 'El arte y la cultura florecen. La felicidad aumenta más fácil.',
            type: 'good',
            duration: 12,
            effects: { happinessGain: 1.3 }
        }
    ],

    opportunities: [
        {
            id: 'garage_sale',
            name: 'Venta de Garage Millonaria',
            headline: '💎 Oportunidad Única: Subasta Privada',
            desc: 'Un millonario excéntrico remata sus bienes. Puedes encontrar tesoros.',
            duration: 3,
            action: (state) => {
                // Logic to buy discounted items usually handled in UI/Game interaction
                // For now just a placeholder effect or unlock
            }
        },
        {
            id: 'startup_inv',
            name: 'Inversión Ángel',
            headline: '🚀 Startup Busca Inversores',
            desc: 'Una pequeña empresa con gran potencial busca capital semilla.',
            duration: 3,
            cost: 5000,
            reward: 50000 // High risk/reward mechanics implemented in Game logic
        }
    ],

    init() {
        if (!state.world) {
            state.world = {
                currentTrend: null, // { id, monthsLeft }
                activeOpps: []      // [{ id, monthsLeft }]
            };
        }
    },

    // --- ECONOMIC SYSTEM ---
    ECON_STATES: {
        boom: {
            id: 'boom',
            name: '📈 Auge Económico',
            desc: 'La economía florece. Hay mucho empleo y sueldos altos.',
            inflationRate: 1.005, // +0.5% monthly
            jobChance: 1.5,
            raiseChance: 2.0
        },
        stable: {
            id: 'stable',
            name: '⚖️ Estabilidad',
            desc: 'La economía avanza a ritmo normal.',
            inflationRate: 1.002, // +0.2% monthly standard
            jobChance: 1.0,
            raiseChance: 1.0
        },
        recession: {
            id: 'recession',
            name: '📉 Recesión',
            desc: 'La economía se contrae. Despidos y pocas contrataciones.',
            inflationRate: 1.001, // Low inflation or deflation
            jobChance: 0.2, // Very hard to get jobs
            raiseChance: 0.1,
            layoffChance: 0.005 // 0.5% chance per month
        },
        depression: {
            id: 'depression',
            name: '⚠️ Gran Depresión',
            desc: 'Colapso económico. Desempleo masivo.',
            inflationRate: 0.998, // Deflation
            jobChance: 0.05,
            raiseChance: 0.0,
            layoffChance: 0.02 // 2% chance per month
        },
        hyperinflation: {
            id: 'hyperinflation',
            name: '💸 Hiperinflación',
            desc: 'El dinero pierde valor rápidamente. ¡Invierte en activos!',
            inflationRate: 1.05, // +5% monthly!!!
            jobChance: 0.8,
            raiseChance: 0.5, // Wages lag behind prices
            layoffChance: 0.005
        }
    },

    tick() {
        this.init();
        const w = state.world;

        // 0. Update Economy
        // 0. Update Economy
        this.updateEconomy();

        // 0.5 Update Weather
        if (this.updateWeather) this.updateWeather();

        // 1. Manage Trend
        if (w.currentTrend) {
            w.currentTrend.monthsLeft--;
            if (w.currentTrend.monthsLeft <= 0) {
                UI.log(`El evento: ${this.getTrendName(w.currentTrend.id)} ha terminado.`, 'info');
                w.currentTrend = null;
            }
        } else {
            // Chance to start new trend (5% per month)
            if (Math.random() < 0.05) {
                this.startRandomTrend();
            }
        }

        // 2. Manage Opportunities
        // Tick down
        if (w.activeOpps.length > 0) {
            w.activeOpps.forEach(op => op.monthsLeft--);
            // Remove expired
            const expired = w.activeOpps.filter(op => op.monthsLeft <= 0);
            w.activeOpps = w.activeOpps.filter(op => op.monthsLeft > 0);
        }

        // Chance to spawn opp (2% per month)
        if (Math.random() < 0.02) {
            this.spawnOpp();
        }
    },

    updateEconomy() {
        if (!state.world.economicState) state.world.economicState = 'stable';
        if (!state.world.inflation) state.world.inflation = 1.0;
        if (!state.world.econTimer) state.world.econTimer = 24;

        // Apply monthly inflation
        const currentState = this.ECON_STATES[state.world.economicState];
        state.world.inflation *= currentState.inflationRate;

        // Countdown to state change
        state.world.econTimer--;

        if (state.world.econTimer <= 0) {
            this.changeEconomicState();
        }

        // Random Disruption Event (very rare: 0.2% monthly)
        if (Math.random() < 0.002) {
            this.triggerDisruption();
        }
    },

    changeEconomicState() {
        const states = Object.keys(this.ECON_STATES);
        // Weighted random could be better, but uniform for now
        const nextStateId = states[Math.floor(Math.random() * states.length)];
        const nextState = this.ECON_STATES[nextStateId];

        state.world.economicState = nextStateId;
        // Reset timer (2-4 years = 24-48 months)
        state.world.econTimer = 24 + Math.floor(Math.random() * 25);

        UI.renderNews(nextState.name, 'economy', nextState.desc);
        UI.log(`La economía ha entrado en: ${nextState.name}`, 'warning');

        // Visual indicator update handled in UI.render()
    },

    triggerDisruption() {
        const events = [
            {
                name: "🤖 La IA Reemplaza Puestos",
                desc: "Avances en IA hacen obsoletos muchos trabajos administrativos.",
                effect: () => {
                    const vulnJobs = ['corp_intern', 'corp_admin', 'service_waiter', 'service_cashier'];
                    if (vulnJobs.includes(state.currJobId)) {
                        Game.loseJob("Tu puesto ha sido automatizado por una IA.");
                    }
                }
            },
            {
                name: "⚡ Crisis Energética",
                desc: "Los costos de energía se disparan. El transporte y servicios suben.",
                effect: () => {
                    state.world.inflation *= 1.1; // Instant 10% inflation jump
                    UI.log("Los costos de vida subieron un 10% de golpe.", "bad");
                }
            },
            {
                name: "📉 Crash Bursátil",
                desc: "Pánico en los mercados. Las acciones se desploman.",
                effect: () => {
                    if (state.marketPrices.stock) {
                        state.marketPrices.stock *= 0.6; // 40% drop
                        UI.log("Tus acciones perdieron 40% de valor.", "bad");
                    }
                }
            }
        ];

        const evt = events[Math.floor(Math.random() * events.length)];
        UI.renderNews(evt.name, 'bad', evt.desc);
        UI.showAlert(evt.name, evt.desc);
        evt.effect();
    },

    startRandomTrend() {
        const t = this.trends[Math.floor(Math.random() * this.trends.length)];
        state.world.currentTrend = { id: t.id, monthsLeft: t.duration };

        // Render News
        UI.renderNews(t.headline, t.type, t.desc);
    },

    spawnOpp() {
        if (state.age < 18) return; // Logic Fix: No investments for kids
        const o = this.opportunities[Math.floor(Math.random() * this.opportunities.length)];
        // Check if already active
        if (state.world.activeOpps.find(x => x.id === o.id)) return;

        state.world.activeOpps.push({ id: o.id, monthsLeft: o.duration });

        // Render News
        UI.renderNews(o.headline, 'opportunity', o.desc);
    },

    getTrendName(id) {
        const t = this.trends.find(x => x.id === id);
        return t ? t.name : id;
    },

    // Get active multipliers
    getEffects() {
        if (!state.world || !state.world.currentTrend) return {};
        const t = this.trends.find(x => x.id === state.world.currentTrend.id);
        return t ? (t.effects || {}) : {};
    },

    // Helper to get current economic multipliers
    getEconMultipliers() {
        if (!state.world.economicState) return this.ECON_STATES.stable;
        return this.ECON_STATES[state.world.economicState];
    }
};
