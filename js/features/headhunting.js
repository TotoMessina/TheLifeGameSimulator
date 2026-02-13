/**
 * Active Headhunting System
 * Proactive job offers based on player performance.
 */

const Headhunting = {
    config: {
        id: 'headhunting',
        name: 'Active Headhunting',
        enabled: true,
        baseChance: 0.15, // 15% chance per month if eligible
        recessionChance: 0.35, // 35% chance during recession
        minKeep: 0.20 // 20% raise
    },

    state: {
        currentOffer: null // Stores the active offer object
    },

    init() {
        console.log("[Headhunting] Initialized");
        // No specific DOM cache needed yet as we inject modal dynamically or use generic
    },

    /**
     * Called monthly by Game.nextMonth()
     * Checks if player is eligible for a headhunter offer
     */
    update() {
        if (!this.config.enabled) return;
        if (state.currJobId === 'unemployed') return;

        // 1. Eligibility Check
        // Needs 6 months tenure in current job (simulated by streak or total months if streak not tracked well yet)
        // Needs High Performance Streak
        if (state.work_relations.performanceStreak < 6) return;

        // 2. Chance Check
        let chance = this.config.baseChance;

        // Vibe Check: Recession = Aggressive Headhunters
        if (state.world && state.world.economicState === 'recession') {
            chance = this.config.recessionChance;
        }

        // Random Roll
        if (Math.random() < chance) {
            this.generateOffer();
        }
    },

    /**
     * Generates a random offer from a rival company
     */
    generateOffer() {
        // Get current job details
        const currentJob = JOBS.find(j => j.id === state.currJobId.split('_')[0]) || JOBS.find(j => j.id === state.currJobId);
        if (!currentJob) return;

        // Find Rivals (Same sector, different company if possible)
        // If no sector defined, use generic
        const sector = currentJob.sector || 'corporate';

        // Mock rival generation for now since we don't have a full Company DB in active memory yet
        const rivalNames = [
            "Apex Corp", "Zenith Systems", "Omicron Tech", "Globex", "Initech", "Massive Dynamic"
        ];
        const rivalName = rivalNames[Math.floor(Math.random() * rivalNames.length)];

        // Calculate Offer
        const level = JOB_LEVELS[state.jobLevel || 0];
        const currentSalary = Math.floor(currentJob.salary * level.salaryMult);
        const raisePct = 0.20 + (Math.random() * 0.15); // 20-35% raise
        const newSalary = Math.floor(currentSalary * (1 + raisePct));

        this.state.currentOffer = {
            id: Date.now(),
            companyName: rivalName,
            title: currentJob.title, // Same role, better pay
            salary: newSalary,
            oldSalary: currentSalary,
            raisePct: Math.floor(raisePct * 100),
            desc: `Hemos notado tu excelente desempeño en tu empresa actual. En ${rivalName} valoramos a los ganadores.`
        };

        this.renderOfferModal();
    },

    /**
     * Renders the interactive Offer Modal
     */
    renderOfferModal() {
        const offer = this.state.currentOffer;
        if (!offer) return;

        // Use generic Event Modal or Create Custom HTML?
        // Let's inject a custom modal structure into the body if it doesn't exist, or reuse a container
        // For integration safety, let's use the existing 'alert-modal' structure but modified, 
        // OR create a dedicated structure in index.html (which we will do).

        const modal = document.getElementById('headhunter-modal');
        if (!modal) {
            console.error("Headhunter modal not found in DOM");
            return;
        }

        const content = document.getElementById('headhunter-content');
        content.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="font-size:3rem; margin-bottom:10px;">🕵️</div>
                <h2 style="color:var(--accent-color); margin-bottom:5px;">OFERTA CONFIDENCIAL</h2>
                <p style="color:#aaa; font-style:italic;">"${offer.desc}"</p>
                
                <div style="background:#222; padding:15px; border-radius:8px; margin:20px 0; border:1px dashed #555;">
                    <div style="font-size:0.9rem; color:#888;">Empresa Rival</div>
                    <div style="font-size:1.5rem; font-weight:bold; color:#fff;">${offer.companyName}</div>
                    <div style="margin-top:10px;">
                        <span style="display:block; font-size:0.8rem; color:#888;">Salario Oferta</span>
                        <span style="font-size:1.8rem; font-weight:bold; color:#39FF14;">$${offer.salary.toLocaleString()}</span>
                        <span style="font-size:0.9rem; color:#39FF14;">(+${offer.raisePct}%)</span>
                    </div>
                     <div style="margin-top:5px; font-size:0.8rem; color:#666;">
                        vs $${offer.oldSalary.toLocaleString()} (Actual)
                    </div>
                </div>

                <div style="display:grid; gap:10px;">
                    <button class="btn-choice" onclick="Headhunting.acceptOffer()" 
                        style="background:linear-gradient(45deg, #2ecc71, #27ae60); border:none;">
                        ✅ Aceptar Oferta (Mudarme)
                    </button>
                    
                    <button class="btn-choice" onclick="Headhunting.negotiate()" 
                        style="background:#f39c12; border:none; color:#111;">
                        ⚖️ Contra-ofertar (Pedir Aumento)
                    </button>
                    
                    <button class="btn-choice" onclick="Headhunting.rejectOffer()" 
                        style="background:#333; border:1px solid #555;">
                        ❌ Rechazar (Lealtad)
                    </button>
                </div>
            </div>
        `;

        UI.openModal('headhunter-modal');
    },

    acceptOffer() {
        if (!this.state.currentOffer) return;
        const offer = this.state.currentOffer;

        // Apply Changes
        // 1. Update Salary? We need to store a "Manual Salary Override" or "Negotiated Bonus" in state 
        // because JOBS are static. 
        // Ideally, we switch 'state.currJobId' to a generic 'rival_company' job OR we add a 'salaryMultiplier' to state.job

        // Let's add a `state.salaryMultiplier` to handle this dynamically without creating new job IDs
        if (!state.jobCustomModifier) state.jobCustomModifier = 1.0;

        // Calculate new modifier
        // Base * LevelMult * CustomMod = NewSalary
        const currentJob = JOBS.find(j => j.id === state.currJobId.split('_')[0]) || JOBS.find(j => j.id === state.currJobId);
        const level = JOB_LEVELS[state.jobLevel || 0];
        const base = currentJob.salary * level.salaryMult;

        // New Mod = Target / Base
        state.jobCustomModifier = offer.salary / base;

        // Reset Reputation but Keep Level?
        // Usually moving companies keeps level but resets "company reputation" (boss relation)
        state.work_relations.boss = 50;
        state.work_relations.colleagues = 50;
        state.work_relations.performance = 50; // New guys have to prove themselves
        state.work_relations.performanceStreak = 0;

        // Penalties/Bonuses
        UI.log(`💼 Te mudaste a ${offer.companyName}. Salario aumentado un ${offer.raisePct}%.`, "good");
        Game.updateStat('stress', 10); // Change is stressful

        UI.closeModal('headhunter-modal');
        UI.render();
        this.state.currentOffer = null;
    },

    negotiate() {
        if (!this.state.currentOffer) return;

        // Difficulty Check: Based on Int + Exp + Charisma
        // Threshold: 150 points total?
        const score = state.intelligence + state.charisma + (state.jobLevel * 10);
        const difficulty = 120; // threshold

        const rng = Math.random() * 50; // variance

        if (score + rng > difficulty) {
            // Success
            UI.log("🗣️ Negociación Éxitosa: Tu jefe igualó la oferta para retenerte.", "good");

            // Match the offer in current company
            const currentJob = JOBS.find(j => j.id === state.currJobId.split('_')[0]) || JOBS.find(j => j.id === state.currJobId);
            const level = JOB_LEVELS[state.jobLevel || 0];
            const base = currentJob.salary * level.salaryMult;
            state.jobCustomModifier = this.state.currentOffer.salary / base;

            Game.updateStat('stress', 5);
        } else {
            // Fail
            UI.log("😡 Jefe: '¿Te crees insustituible?' Negociación fallida.", "bad");
            state.work_relations.boss -= 20;
            state.work_relations.happiness -= 10;
        }

        UI.closeModal('headhunter-modal');
        UI.render();
        this.state.currentOffer = null;
    },

    rejectOffer() {
        UI.log("🛡️ Rechazaste la oferta. Tu lealtad ha sido notada.", "good");
        state.work_relations.boss = Math.min(100, state.work_relations.boss + 15);
        state.reputation += 5;

        UI.closeModal('headhunter-modal');
        UI.render();
        this.state.currentOffer = null;
    }
};

window.Headhunting = Headhunting;
