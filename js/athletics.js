const Athletics = {
    RACES: {
        '10k': { name: '10K Local', dist: 10, reqStam: 20, reward: 50 },
        'half': { name: 'Media Maratón', dist: 21, reqStam: 50, reward: 150 },
        'full': { name: 'Maratón BsAs', dist: 42, reqStam: 90, reward: 500 } // High status reward
    },

    GEAR: {
        'shoes_pro': { name: 'Carbon Shoes', cost: 300, effect: 'speed' },
        'coach': { name: 'Entrenador Personal', cost: 1000, effect: 'safety' }
    },

    tick() {
        if (!state.athletics) return;

        // 1. Training Effects
        const intensity = state.athletics.training;
        let gain = 0;
        let drain = 0;
        let healthRisk = 0;

        if (intensity === 'low') { gain = 2; drain = 10; healthRisk = 0; }
        else if (intensity === 'med') { gain = 5; drain = 20; healthRisk = 0.05; }
        else if (intensity === 'high') { gain = 10; drain = 40; healthRisk = 0.2; }

        // Coach reduces risk and drain
        if (state.athletics.gear.coach) {
            drain *= 0.8;
            healthRisk *= 0.5;
        }

        if (state.energy >= drain) {
            state.athletics.stamina += gain;
            Game.updateStat('energy', -drain);

            // Cap Stamina
            if (state.athletics.stamina > 150) state.athletics.stamina = 150;

            // Injury Check
            if (Math.random() < healthRisk) {
                Game.updateStat('physicalHealth', -10);
                UI.log("🤕 Te lesionaste entrenando. -10 Salud", "bad");
                state.athletics.training = 'none'; // Stop training
            }
        } else {
            // Not enough energy to train
            if (intensity !== 'none') {
                UI.log("Estás muy cansado para entrenar.", "info");
                state.athletics.training = 'none';
            }
        }

        // 2. Race Day Check
        if (state.athletics.race) {
            state.athletics.race.monthsLeft--;
            if (state.athletics.race.monthsLeft <= 0) {
                this.runRace();
            }
        }
    },

    setTraining(level) {
        state.athletics.training = level;
        // UI feedback handled by render
    },

    registerRace(id) {
        if (state.athletics.race) return false; // Already registered

        const race = this.RACES[id];
        // 3 months prep time hardcoded for simplicity? Or variable?
        // Let's say 4 months for everything for now.
        state.athletics.race = {
            id: id,
            name: race.name,
            monthsLeft: 4
        };
        UI.log(`Inscrito en ${race.name}. Falta 4 meses.`, "good");
        return true;
    },

    runRace() {
        const raceId = state.athletics.race.id;
        const race = this.RACES[raceId];
        const stam = state.athletics.stamina;

        // Difficulty Calculation
        // Need Stamina >= reqStam to have good chance
        // Shoes give bonus
        let effectiveStam = stam;
        if (state.athletics.gear.shoes_pro) effectiveStam += 15;

        // Result
        let success = false;
        if (effectiveStam >= race.reqStam) {
            success = true; // Win/Complete
        } else if (effectiveStam >= race.reqStam * 0.7) {
            // 50/50 chance
            if (Math.random() > 0.5) success = true;
        }

        if (success) {
            UI.showAlert("¡CARRERA COMPLETADA! 🥇", `Cruzaste la meta de la ${race.name}.`);
            Game.updateStat('happiness', 20);
            Game.updateStat('status', race.reward);
            Haptics.success();
            if (!state.athletics.medals.includes(raceId)) {
                state.athletics.medals.push(raceId);
            }
        } else {
            UI.showAlert("DNF 😫", `No pudiste terminar la ${race.name}. Te faltó resistencia.`);
            Game.updateStat('happiness', -10);
            Haptics.error();
        }

        state.athletics.race = null;
        // Stamina drain after race?
        state.athletics.stamina = Math.floor(state.athletics.stamina * 0.8);
        UI.renderAthletics();
    },

    buyGear(id) {
        const gear = this.GEAR[id];
        if (state.money < gear.cost) return;

        state.money -= gear.cost;
        state.athletics.gear[id] = true;
        UI.log(`Compraste ${gear.name}`, "good");
        UI.renderAthletics();
        UI.render(); // update money
    }
};
