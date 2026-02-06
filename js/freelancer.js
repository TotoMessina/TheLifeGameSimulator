const Freelancer = {
    init() {
        if (!state.freelancer) {
            state.freelancer = {
                reputation: 0, // 0-100
                completed: 0,
                earnings: 0,
                activeGigs: []
            };
        }
        // Always refresh gigs if empty (e.g. first load)
        if (!state.freelancer.activeGigs || state.freelancer.activeGigs.length === 0) {
            this.generateMonthlyGigs();
        } else {
            // Validate to prevent "undefined" UI bugs
            const invalid = state.freelancer.activeGigs.some(g => !g.title || !g.reward);
            if (invalid) {
                console.log("Freelancer: Found invalid gigs, regenerating.");
                this.generateMonthlyGigs();
            }
        }
        // Force refresh UI in case we are initializing mid-game
        if (typeof UI !== 'undefined' && document.getElementById('act-tab-projects')) {
            // We can't verify if UI is ready, but this is safe
        }
    },

    generateMonthlyGigs() {
        if (!state.freelancer) return;

        // Clear old gigs
        state.freelancer.activeGigs = [];

        // Generate 3-5 random gigs
        const count = 3 + Math.floor(Math.random() * 3);

        let pool;
        if (state.age < 18) {
            pool = typeof SCHOOL_GIGS !== 'undefined' ? [...SCHOOL_GIGS] : [...FREELANCE_GIGS];
        } else {
            pool = [...FREELANCE_GIGS];
        }

        for (let i = 0; i < count; i++) {
            if (pool.length === 0) break;
            const rIdx = Math.floor(Math.random() * pool.length);
            const tmpl = pool[rIdx];

            // Customize Gig
            // Higher reputation = access to better paying variations potentially?
            // For now, raw template.
            state.freelancer.activeGigs.push({
                ...tmpl,
                pk: Date.now() + Math.random(), // Unique ID for this instance
                expires: 1 // Valid for 1 month
            });
            // Don't remove from pool to allow duplicates? Or remove to vary?
            // Let's keep in pool to allow multiple "Fix PC" gigs.
        }
    },

    acceptGig(gigPk) {
        const gigIdx = state.freelancer.activeGigs.findIndex(g => g.pk === gigPk);
        if (gigIdx === -1) {
            UI.log("Ese trabajo ya no está disponible.", "error");
            return;
        }

        const gig = state.freelancer.activeGigs[gigIdx];

        // Check Energy
        if (state.energy < gig.energy) {
            UI.log("Muy cansado para este trabajo.", "warning");
            return;
        }

        // Calculate Rate based on Rep
        // Reputation 0 = 100% pay. Reputation 100 = 200% pay (Double).
        const repBonus = 1 + (state.freelancer.reputation / 100);
        const finalPay = Math.floor(gig.reward * repBonus);

        // Success Check? 
        // Tech gigs need Intelligence? Creative need Happiness (Inspiration)?
        // Simplified: Always succeed for now, but quality varies?
        // Let's just do success.

        Game.updateStat('energy', -gig.energy);
        Game.updateStat('money', finalPay);

        // Update Freelancer Stats
        state.freelancer.completed++;
        state.freelancer.earnings += finalPay;
        // Reputation Gain: 1-3 points
        const repGain = 1 + Math.floor(Math.random() * 3);
        state.freelancer.reputation = Math.min(100, state.freelancer.reputation + repGain);

        // Remove Gig
        state.freelancer.activeGigs.splice(gigIdx, 1);

        UI.log(`Trabajo "${gig.title}" completado. Ganaste $${finalPay}.`, "money");

        // Refresh UI
        UI.render(); // Update Money/Energy bars
        UI.renderProjects(); // Refresh Gig list
    }
};
