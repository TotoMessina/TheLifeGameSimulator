const Routine = {
    // Default 24h allocation
    DEFAULT: {
        work: 8,
        sleep: 8,
        study: 0,
        exercise: 0,
        leisure: 8
    },

    UPGRADES: {
        'coffee_machine': { name: 'Cafetera Espresso', cost: 500, desc: 'Recupera energía trabajando.' },
        'ergonomic_bed': { name: 'Cama Ergonomica', cost: 2000, desc: 'Sueño más eficiente (+1h virtual).' },
        'home_gym': { name: 'Gimnasio en Casa', cost: 1500, desc: 'Ejercicio rinde el doble.' },
        'gaming_pc': { name: 'PC Gamer', cost: 3000, desc: 'Ocio recupera más felicidad.' }
    },

    tick() {
        if (!state.routine) return;

        const r = state.routine;
        const ups = state.upgrades || {};

        // 1. Sleep Logic
        let effectiveSleep = r.sleep;
        if (ups.ergonomic_bed) effectiveSleep += 1; // Bonus

        if (effectiveSleep < 6) {
            Game.updateStat('mentalHealth', -5);
            Game.updateStat('energy', -20);
            UI.log("💤 Estás durmiendo muy poco. Tu mente sufre.", "bad");
        } else if (effectiveSleep < 7) {
            Game.updateStat('energy', -10);
            UI.log("💤 Te falta sueño.", "normal");
        } else {
            // Good sleep
            Game.updateStat('mentalHealth', 2);
        }

        // 2. Work Logic (Burnout check handled by job usually, but hours matter)
        if (r.work > 10) {
            Game.updateStat('mentalHealth', -3);
            Game.updateStat('stress', 5); // If stress exists, else mentalHealth logic covers it
            UI.log("💼 Trabajar tanto te está agotando.", "bad");
        }

        // Coffee helps work energy
        if (ups.coffee_machine && r.work > 0) {
            Game.updateStat('energy', 5);
        }

        // 3. Exercise
        let effectiveExercise = r.exercise;
        if (ups.home_gym) effectiveExercise *= 2;

        if (effectiveExercise === 0) {
            Game.updateStat('physicalHealth', -2); // Decay from sedentary
        } else if (effectiveExercise >= 1) {
            Game.updateStat('physicalHealth', 2 * effectiveExercise);
            Game.updateStat('energy', -5 * r.exercise); // Tires you out
        }

        // 4. Leisure
        let effectiveLeisure = r.leisure;
        if (ups.gaming_pc) effectiveLeisure *= 1.2;

        if (effectiveLeisure < 2) {
            Game.updateStat('happiness', -5);
            UI.log("🥀 Tu vida es solo obligaciones. Necesitas ocio.", "bad");
        } else {
            Game.updateStat('happiness', 1 * effectiveLeisure);
        }

        // 5. Study (Passive Int gain)
        if (r.study > 0) {
            Game.updateStat('intelligence', 0.5 * r.study);
            Game.updateStat('energy', -5 * r.study);
        }
    },

    setHours(key, val) {
        val = parseInt(val);
        if (val < 0) val = 0;
        if (val > 24) val = 24;

        // Auto-balance? 
        // Simple approach: Set value, calculate rem, if rem < 0, warn or force clamp.
        // Better: Allow setting, but show "Invalid Routine" visual if sum != 24.

        state.routine[key] = val;

        // Update UI sum check
        const total = this.calculateTotal();
        const valid = total === 24;

        // Visual feedback in UI
        const sumEl = document.getElementById('routine-total-hours');
        if (sumEl) {
            sumEl.innerText = total + "h";
            sumEl.style.color = valid ? '#4dffea' : '#ff4d4d';
        }
    },

    calculateTotal() {
        if (!state.routine) return 0;
        return Object.values(state.routine).reduce((a, b) => a + b, 0);
    },

    buyUpgrade(id) {
        const item = this.UPGRADES[id];
        if (state.money < item.cost) return;
        if (state.upgrades[id]) return;

        state.money -= item.cost;
        state.upgrades[id] = true;
        UI.log(`Compraste ${item.name}`, "good");
        UI.renderRoutine();
        UI.render();
    }
};
