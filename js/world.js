
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

    tick() {
        this.init();
        const w = state.world;

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
            expired.forEach(op => {
                // Info log optional, maybe too spammy
            });
            w.activeOpps = w.activeOpps.filter(op => op.monthsLeft > 0);
        }

        // Chance to spawn opp (2% per month)
        if (Math.random() < 0.02) {
            this.spawnOpp();
        }
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
    }
};
