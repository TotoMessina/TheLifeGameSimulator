
const Game = {
    _tempChar: null, // For char gen

    /**
     * Initializes the game state and UI
     * Handles character generation screen for new games
     * Applies legacy bonuses and migrates old save data
     */
    init() {
        if (state.totalMonths === 0 && (!state.traits || state.traits.length === 0)) {
            console.log("Showing Char Gen Screen (Init Check)");
            document.getElementById('char-gen-screen').classList.remove('hidden');
            document.getElementById('char-gen-screen').classList.add('active');
            const appContainer = document.getElementById('app-container');
            if (appContainer) appContainer.classList.add('hidden');
            document.getElementById('char-gen-screen').style.display = 'flex';
            this.generateCharacter();
        } else if (!state.traits || state.traits.length === 0) {
            // Fallback for legacy saves or issues
            if (state.totalMonths < 12) {
                console.log("Force showing Char Gen Screen (Legacy Fix)");
                document.getElementById('char-gen-screen').classList.remove('hidden');
                document.getElementById('char-gen-screen').classList.add('active');
                const appContainer = document.getElementById('app-container');
                if (appContainer) appContainer.classList.add('hidden');
                document.getElementById('char-gen-screen').style.display = 'flex';
                this.generateCharacter();
            } else {
                console.log("Assigning random traits for existing save");
                // Random fallback
                const pool = [...TRAITS];
                state.traits = [];
                for (let i = 0; i < 3; i++) {
                    if (pool.length === 0) break;
                    const idx = Math.floor(Math.random() * pool.length);
                    state.traits.push(pool[idx].id);
                    pool.splice(idx, 1);
                }
                const appContainer = document.getElementById('app-container');
                if (appContainer) appContainer.classList.remove('hidden');
            }
        } else {
            document.getElementById('char-gen-screen').classList.add('hidden');
            document.getElementById('char-gen-screen').classList.remove('active');
            document.getElementById('char-gen-screen').style.display = 'none';
            const appContainer = document.getElementById('app-container');
            if (appContainer) appContainer.classList.remove('hidden');
        }

        // Apply dark mode immediately if needed (or other init preferences)
        // ...

        DB.saveGame(); // Auto-save on init just to be safe/sync

        // State Migration / Safety Checks
        if (!state.school) {
            state.school = { grades: 70, popularity: 50, pressure: 0, focus: 'study' };
        }
        if (!state.work_relations) {
            state.work_relations = { boss: 50, colleagues: 50, performance: 50 };
        }
        if (!state.careerExperience) state.careerExperience = {};
        if (!state.companyBlacklist) state.companyBlacklist = {};
        if (!state.sectorReputation) state.sectorReputation = {};
        if (!state.fame) {
            state.fame = {
                followers: 0,
                channel: null,
                status: 'active',
                revenue: 0,
                perks: []
            };
        }

        // Init Freelancer State
        if (typeof Freelancer !== 'undefined') {
            Freelancer.init();
        }

        UI.render();

        // Generate initial welcome message at the start
        setTimeout(() => {
            const eventLog = document.getElementById('event-log');
            if (eventLog && state.traits && state.traits.length > 0) {
                const age = Math.floor(state.totalMonths / 12);
                const traitNames = state.traits.map(t => {
                    const trait = TRAITS.find(tr => tr.id === t);
                    return trait ? trait.name : t;
                }).join(', ');

                // Create welcome message
                const welcomeDiv = document.createElement('div');
                welcomeDiv.className = 'event-card info';
                welcomeDiv.innerHTML = `
                    <span class="event-date">INICIO</span>
                    Bienvenido. Tienes ${age} años. Tus rasgos son: ${traitNames}. Comienza tu historia.
                `;

                // Prepend as first message
                if (eventLog.firstChild) {
                    eventLog.insertBefore(welcomeDiv, eventLog.firstChild);
                } else {
                    eventLog.appendChild(welcomeDiv);
                }
            }
        }, 100);
    },

    generateCharacter() {
        let available = [...TRAITS];
        let picks = [];
        for (let i = 0; i < 2; i++) {
            const idx = Math.floor(Math.random() * available.length);
            picks.push(available[idx]);
            available.splice(idx, 1);
        }

        const rand = Math.random();
        let bg = 'normal';
        let bgText = "Normal: Ahorros modestos ($1,000)";

        if (rand < 0.3) {
            bg = 'debt'; // -$5000
            bgText = "Deuda Estudiantil: Comienzas debiendo $5,000";
        } else if (rand > 0.8) {
            bg = 'rich'; // $5000
            bgText = "Pequeña Herencia: Recibes $5,000";
        }

        this._tempChar = { traits: picks.map(t => t.id), bg: bg };

        document.getElementById('char-traits').innerHTML = picks.map(t => `
            <div style="background:#333; padding:10px; border-radius:5px;">
                <div style="color:#fff; font-weight:bold;">${t.name}</div>
                <div style="font-size:0.8rem; color:#ccc;">${t.desc}</div>
            </div>
        `).join('');

        const bgContainer = document.getElementById('char-bg');
        bgContainer.innerHTML = bgText;
        bgContainer.style.color = bg === 'debt' ? '#ff5555' : (bg === 'rich' ? '#4dffea' : '#fff');
    },

    confirmStart() {
        if (!this._tempChar) return;
        state.traits = this._tempChar.traits;
        state.background = this._tempChar.bg;
        if (state.background === 'debt') state.money = -5000;
        else if (state.background === 'rich') state.money = 5000;
        else state.money = 1000;

        document.getElementById('char-gen-screen').style.display = 'none';
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.classList.remove('hidden');

        // Create welcome message with age and traits
        const age = Math.floor(state.totalMonths / 12);
        const traitNames = state.traits.map(t => {
            const trait = TRAITS.find(tr => tr.id === t);
            return trait ? trait.name : t;
        }).join(', ');

        UI.log(`Bienvenido. Tienes ${age} años. Tus rasgos son: ${traitNames}. Comienza tu historia.`, "info");
        UI.render();
        DB.saveGame();
    },

    /**
     * Checks all trophy conditions and awards new achievements
     * Called after significant game events (stat changes, job changes, etc.)
     */
    checkAchievements() {
        if (!state.unlockedTrophies) state.unlockedTrophies = [];
        TROPHIES.forEach(t => {
            if (!state.unlockedTrophies.includes(t.id)) {
                if (t.condition(state)) {
                    this.awardTrophy(t.id);
                }
            }
        });

        // JOB PERFORMANCE BONUS
        if (state.currJobId !== 'unemployed' && state.work_relations.performance > 90) {
            const job = JOBS.find(j => j.id === state.currJobId);
            const level = JOB_LEVELS[state.jobLevel || 0];
            const baseSalary = job ? job.salary : 0;
            const currentSalary = baseSalary * level.salaryMult;

            const bonus = Math.floor(currentSalary * 0.15);
            Game.updateStat('money', bonus);
            state.lastMonthBonus = true;
            UI.log(`¡Bono de Alto Rendimiento! +$${bonus.toLocaleString()}`, "good");
        } else {
            state.lastMonthBonus = false;
        }

        // Reset work flag
        state.workedThisMonth = false;
    },

    /**
     * Awards a trophy to the player
     * @param {string} id - Trophy ID from TROPHIES config
     */
    awardTrophy(id) {
        if (state.unlockedTrophies.includes(id)) return;
        state.unlockedTrophies.push(id);

        const trophy = TROPHIES.find(t => t.id === id);
        if (trophy) {
            this.showTrophyNotification(trophy);
            UI.log(`🏆 Logro Desbloqueado: ${trophy.name}`, 'good');
            AudioSys.playClick();
        }
        DB.saveGame();
    },

    showTrophyNotification(trophy) {
        const div = document.createElement('div');
        div.className = 'trophy-notification';
        div.innerHTML = `<div style="font-size:2rem;">${trophy.icon}</div><div><b>${trophy.name}</b><br><span style="font-size:0.8rem">${trophy.desc}</span></div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 4000);
        this.updateStat('happiness', 5); // bonus
    },

    checkGameOver() {
        if (state.physicalHealth <= 0) {
            this.showEndGame('Muerte por Mala Salud');
            return true;
        }
        if (state.mentalHealth <= 0) {
            this.showEndGame('Colapso Mental');
            return true;
        }
        if (state.totalMonths >= 1200) { // 100 years
            this.showEndGame('Muerte Natural (Vejez)');
            return true;
        }
        return false;
    },

    // --- Survival Mechanics ---

    /**
     * Emergency Sell Option
     * Allows player to liquidate assets at 30% value for quick cash
     * @param {string} type - 'items', 'vehicle', 'properties'
     */
    emergencySell(type) {
        if (!confirm("⚠️ VENTA DE EMERGENCIA\nEstás a punto de vender tus pertenencias por solo el 30% de su valor.\n¿Estás realmente desesperado?")) return;

        let gain = 0;
        let soldCount = 0;

        if (type === 'items') {
            if (!state.items || state.items.length === 0) return UI.showAlert("Nada que vender", "No tienes objetos de valor.");

            state.items.forEach(itemId => {
                const item = ITEMS.find(i => i.id === itemId);
                if (item) gain += Math.floor(item.price * 0.3);
            });
            soldCount = state.items.length;
            state.items = [];
            UI.log(`📦 Vendiste ${soldCount} objetos por $${gain}.`, "bad");
        }
        else if (type === 'vehicle') {
            if (!state.vehicle) return UI.showAlert("Nada que vender", "No tienes vehículo.");

            const vehicle = VEHICLES.find(v => v.id === state.vehicle);
            if (vehicle) gain += Math.floor(vehicle.price * 0.3);
            soldCount = 1;
            state.vehicle = null;
            UI.log(`🚗 Vendiste tu vehículo por $${gain}.`, "bad");
        }
        else if (type === 'properties') {
            if (!state.realEstate || state.realEstate.length === 0) return UI.showAlert("Nada que vender", "No tienes propiedades.");

            state.realEstate.forEach(propId => {
                const prop = REAL_ESTATE.find(p => p.id === propId);
                if (prop) gain += Math.floor(prop.price * 0.3);
            });
            soldCount = state.realEstate.length;
            state.realEstate = [];
            UI.log(`🏠 Vendiste ${soldCount} propiedades por $${gain}.`, "bad");
        }

        if (gain > 0) {
            this.updateStat('money', gain);
            this.updateStat('happiness', -10); // Painful to sell
            this.updateStat('stress', 5);
            AudioSys.playMoney();
            UI.showAlert("Liquidación Completada", `Has obtenido $${gain} vendiendo tus activos de emergencia.`);
            UI.render();
        }
    },

    calculateScore() {
        let score = 0;
        // Money
        const fins = this.calculateFinancials();
        score += Math.floor(fins.netWorth / 1000); // 1 pt per $1k
        // Happiness average? No just current for now
        score += state.happiness * 10;
        // Trophies
        score += state.unlockedTrophies.length * 500;
        // Age
        score += state.totalMonths;
        // Legacy
        score += state.children.length * 200;

        return score;
    },

    /**
     * Calculates all financial metrics for the player
     * @returns {Object} Financial summary with income, expenses, and net worth
     * @property {number} activeIncome - Monthly salary from job
     * @property {number} passiveIncome - Income from investments, real estate, royalties
     * @property {number} expenses - Monthly expenses (living costs, children, loans)
     * @property {number} netWorth - Total assets (cash + investments + real estate + business)
     */
    calculateFinancials() {
        let activeIncome = 0;
        let passiveIncome = 0;
        let expenses = 50 + (state.age * 5); // Base COL

        // 1. Active Income (Job)
        if (state.currJobId !== 'unemployed') {
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) {
                // Apply Level Multiplier
                const level = JOB_LEVELS[state.jobLevel || 0];
                let salary = job.salary * level.salaryMult;

                // Apply Custom Modifier (Headhunting/Negotiation)
                if (state.jobCustomModifier) salary *= state.jobCustomModifier;

                activeIncome += Math.floor(salary);
            }
        }

        // 2. Passive Income
        // Real Estate (Rent approx 0.5% of value)
        let reVal = 0;
        if (state.realEstate) {
            state.realEstate.forEach(id => {
                const price = state.rePrices[id] || 0;
                reVal += price;
                passiveIncome += Math.floor(price * 0.005);
            });
        }

        // Business (Dividends? 10% of profit?)
        let bizVal = 0;
        if (state.business && state.business.active) {
            passiveIncome += Math.floor(state.business.revenue * 0.2); // 20% take home
            bizVal = state.business.revenue * 12; // Val
        }

        // Portfolio Dividends? (Simplified 0.2% monthly)
        let invVal = 0;
        if (state.portfolio) {
            Object.keys(state.portfolio).forEach(k => {
                const p = state.portfolio[k];
                const price = state.marketPrices[k] || 0;
                invVal += p.qty * price;
                if (k === 'stock') passiveIncome += Math.floor((p.qty * price) * 0.002);
            });
        }

        // Creations (Royalties)
        if (state.creations) {
            state.creations.forEach(c => passiveIncome += c.royalty);
        }

        // Fame Revenue (Sponsors)
        if (state.fame && state.fame.revenue) {
            passiveIncome += state.fame.revenue;
        }


        // 3. Expenses
        if (state.children) expenses += state.children.length * 400;
        if (state.partner && state.partner.status === 'living') expenses += 200;

        // Loans?
        if (state.loans > 0) expenses += Math.ceil(state.loans * 0.01); // 1% interest

        // TRAVEL SYSTEM: Fix Net Worth (Convert Local Cash to HOME)
        let cashInHome = state.money;
        if (typeof Travel !== 'undefined') {
            cashInHome = Travel.getTotalMoney();
        }

        const netWorth = cashInHome + reVal + bizVal + invVal;

        return {
            activeIncome,
            passiveIncome,
            expenses,
            netWorth,
            cash: state.money, // Display raw local cash
            investments: invVal,
            realEstate: reVal
        };
    },
    showEndGame(reason) {
        UI.els.modals.endGame.classList.add('active');
        const score = this.calculateScore();
        UI.els.modals.endSummary.innerText = `Causa: ${reason}`;
        UI.els.modals.endScore.innerText = score.toLocaleString();

        DB.submitScore(score);

        // Prep legacy for next run
        const legacy = {
            val: Math.floor(state.money * 0.1), // pass 10% money
            type: 'money'
        };
        // Or if high int, pass genetics
        if (state.intelligence > 90) {
            legacy.val = 10; // +10 int start
            legacy.type = 'genetics';
        }
        localStorage.setItem('lifeSim_legacy', JSON.stringify(legacy));
    },


    /**
     * Sets the legacy bonus for the next playthrough
     * Called when player chooses inheritance type at end of game
     * @param {string} choice - Either 'money' (10% of current money) or 'genetics' (20% of intelligence)
     */
    claimLegacy(choice) {
        let legacy = {};
        if (choice === 'money') {
            legacy = { type: 'money', val: Math.floor(state.money * 0.1) };
            UI.log("Legado Guardado: Dinero", "good");
        } else if (choice === 'genetics') {
            legacy = { type: 'genetics', val: Math.floor(state.intelligence * 0.2) };
            UI.log("Legado Guardado: Genética", "good");
        }

        localStorage.setItem('lifeSim_legacy', JSON.stringify(legacy));
        UI.showAlert("Legado Confirmado", "Tu próxima vida comenzará con esta bonificación.\nRecarga la página para empezar de nuevo.");
    },

    /**
     * Updates a player stat with trait modifiers and clamping
     * @param {string} key - Stat name (e.g., 'money', 'intelligence', 'physicalHealth')
     * @param {number} amount - Amount to add/subtract (can be negative)
     */
    updateStat(key, amount) {
        // Trait modifiers
        if (state.traits) {
            if (state.traits.includes('genius') && key === 'intelligence' && amount > 0) amount *= 1.5;
            if (state.traits.includes('athlete') && key === 'physicalHealth' && amount > 0) amount *= 1.2;
            if (state.traits.includes('sickly') && key === 'physicalHealth' && amount > 0) amount *= 0.5;
        }

        state[key] += amount;

        // Clamping & Limits
        let maxHealth = 100;
        let maxHappy = 100;
        if (state.traits) {
            if (state.traits.includes('sickly')) maxHealth = 80;
            if (state.traits.includes('genius')) maxHappy = 90;
        }

        if (key === 'physicalHealth') {
            if (state[key] > maxHealth) state[key] = maxHealth;
            if (state[key] < 0) state[key] = 0;
        } else if (key === 'happiness') {
            if (state[key] > maxHappy) state[key] = maxHappy;
            if (state[key] < 0) state[key] = 0;
        } else if (key === 'mentalHealth') {
            if (state[key] > 100) state[key] = 100;
            if (state[key] < 0) state[key] = 0;
        } else if (key === 'energy') {
            if (state[key] > 100) state[key] = 100;
            if (state[key] < 0) state[key] = 0;
        } else if (key === 'intelligence') {
            if (state[key] > 100) state[key] = 100; // Cap int at 100 for now
        } else if (key === 'stress') {
            if (state[key] > 100) state[key] = 100;
            if (state[key] < 0) state[key] = 0;
        }

        if (state[key] < 0 && key !== 'money') state[key] = 0;

        // Visuals
        if (key === 'money') {
            UI.flashMoney(amount);
            if (amount > 0) {
                AudioSys.playMoney();
                Haptics.success();
            }

            // Maybe float text relative to the bar? 
            // We don't have screen coords easily here without passing element.
        }
        this.checkAchievements();
    },



    // --- Actions ---

    commitCrime(type) {
        // Penalty for even trying: Stress/Guilt
        this.updateStat('mentalHealth', -5);

        if (type === 'shoplift') {
            if (Math.random() > 0.7) { // 30% fail (increased risk)
                this.goToPrison(4);
                UI.log("❌ Te atraparon robando. Fuiste a prisión.", "bad");
            } else {
                this.updateStat('happiness', 5);
                UI.log("🥷 Robaste algo sin que te vieran. +$80", "good");
            }
        } else if (type === 'hack') {
            if (Math.random() > 0.5) { // 50% fail
                this.goToPrison(12);
                UI.log("🚔 El FBI te rastreó. Prisión Federal.", "bad");
            } else {
                this.updateStat('money', 3500);
                this.updateStat('intelligence', 1); // Learn from hacking
                UI.log("💻 Hackeo exitoso. Transferencia completada. +$3500", "good");
            }
        }
        // Add more crimes here...
        if (UI.closeModal) UI.closeModal('activity-modal');
        UI.render();
    },

    goToPrison(months) {
        // Skip time logic simplified for now
        state.totalMonths += months;
        state.happiness -= 20;
        state.reputation = 0; // if we had it
        // Reset job
        state.currJobId = 'unemployed';

        // REALISM: Deportation Risk
        if (typeof Travel !== 'undefined' && state.currentCountry !== 'home') {
            const country = Travel.getCurrentCountry();
            // Strict countries always deport. Others have a chance.
            let chance = 0.5;
            if (country.lawStrictness === 'extreme') chance = 1.0;
            if (country.lawStrictness === 'high') chance = 0.8;
            if (country.lawStrictness === 'low') chance = 0.2;

            if (Math.random() < chance) {
                UI.showAlert("DEPORTADO", `Has sido deportado de ${country.name} por antecedentes penales.`);
                UI.log(`👮 Deportado de ${country.name}. Visa revocada.`, "bad");
                state.visaStatus = null; // Revoke visa
                Travel.relocate('home'); // Force move home
                return; // Stop further processing
            }
        }
        state.jobXP = 0;
        UI.showAlert("PRISIÓN", `Pasaste ${months} meses en la cárcel. Perdiste tu empleo.`);
    },

    takeVacationDays(days) {
        if (!state.vacationDays || state.vacationDays < days) {
            return UI.log("No tienes suficientes días de vacaciones.", "warning");
        }

        state.vacationDays -= days;

        // Effects
        // 7 days = -15 stress, +10 happy
        const stressRed = days * 2.5; // 7 days ~ 17 stress
        const happyGain = days * 1.5;

        this.updateStat('stress', -stressRed);
        this.updateStat('happiness', happyGain);
        this.updateStat('energy', 100); // Fully rested

        UI.log(`Disfrutaste de ${days} días libres.`, "good");
        UI.render(); // Refreshes dashboard        UI.render();
        UI.renderJobDashboard();
    },

    // --- NEW JOB ACTIONS (Command Station) ---

    workHard() {
        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        // Apply Level Multiplier to Costs
        const level = JOB_LEVELS[state.jobLevel || 0];
        const energyCost = (job.energyCost || 20) * 1.5 * level.energyMult;
        const stressGain = (job.stress || 5) * 1.5 * level.stressMult;

        if (state.energy < energyCost) return UI.showAlert("Agotado", "No tienes energía para trabajar intenso.");

        Game.updateStat('energy', -energyCost);
        Game.updateStat('stress', stressGain);

        // Performance Boost
        state.work_relations.performance = Math.min(100, state.work_relations.performance + 5);
        state.jobXP += (job.xpGain || 1) * 1.5;

        // Money Bonus (Overtime?)
        const overtimePay = Math.floor((job.salary * level.salaryMult) / 20); // 1 day approx of scaled salary
        Game.updateStat('money', overtimePay);

        UI.log(`Trabajo Intenso: +Rendimiento, +$${overtimePay}. Estrés aumentado.`, "good");
        if (Math.random() < 0.1) this.triggerWorkEvent();

        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    slackOff() {
        if (state.energy < 5) return UI.showAlert("Zzz...", "Estás demasiado cansado incluso para fingir trabajar.");

        Game.updateStat('energy', -5); // Minimal cost
        Game.updateStat('stress', -5); // Relax

        // Performance Hit
        state.work_relations.performance = Math.max(0, state.work_relations.performance - 5);

        UI.log("Te tomaste el día con calma. -Estrés, -Rendimiento.", "normal");
        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    socializeBoss() {
        if (state.energy < 15) return UI.showAlert("Cansado", "Necesitas energía para adular al jefe.");

        Game.updateStat('energy', -15);

        if (Math.random() > 0.3) {
            state.work_relations.boss = Math.min(100, state.work_relations.boss + 5);
            UI.log("Jefe: 'Buen trabajo equipo'. (+Relación)", "good");
        } else {
            UI.log("Jefe: 'Ahora no tengo tiempo'. (Sin efecto)", "normal");
        }

        // Chance of random work event (10%)
        if (Math.random() < 0.1) this.triggerWorkEvent();

        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    socializeColleagues() {
        if (state.energy < 15) return UI.showAlert("Cansado", "Demasiado cansado para socializar.");
        Game.updateStat('energy', -15);
        state.work_relations.colleagues = Math.min(100, state.work_relations.colleagues + 4);
        Game.updateStat('stress', -5); // Venting helps
        UI.log("Charla en la máquina de café. +Colegas, -Estrés.", "good");

        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    takeBreak() {
        Game.updateStat('energy', 10);
        Game.updateStat('stress', -5);
        // Costs time? assume instant for now or minimal
        UI.log("Breve descanso. +10E, -5 Estrés.", "good");
        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    askForRaise() {
        const p = state.work_relations.performance;
        const b = state.work_relations.boss;

        if (p > 90 && b > 80) {
            // Success
            // Increase salary multiplier? Or one time cash?
            // Let's implement salary raise logic later or simple bonus now
            Game.updateStat('money', 5000);
            UI.showAlert("¡Aumento Aprobado!", "Tu jefe valora tu excelencia. Tienes un bono de $5,000.");
        } else {
            state.work_relations.boss -= 10;
            UI.showAlert("Denegado", "Tu jefe se molestó por pedir un aumento sin merecerlo. -Relación.");
        }
        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    askForPromotion() {
        const currentLevel = state.jobLevel || 0;
        if (currentLevel >= JOB_LEVELS.length - 1) {
            return UI.showAlert("Techo de Cristal", "Has alcanzado el nivel más alto posible en esta jerarquía.");
        }

        const nextLevel = JOB_LEVELS[currentLevel + 1];
        const req = nextLevel.req;

        // Check Requirements
        const hasXP = state.jobMonths >= req.xp;
        const hasRep = state.work_relations.boss >= req.rep;
        const hasInt = state.intelligence >= req.int;

        if (hasXP && hasRep && hasInt) {
            state.jobLevel++;
            state.jobMonths = 0; // Optional: Reset months or keep accum? better keep specific level months? Simpler to keep total time.
            // Actually, req.xp is usually "total experience" or "time in grade"?
            // Let's assume time in current job is enough for now, or total career xp.
            // Config said "xp: 6", likely months.

            Game.updateStat('happiness', 10);
            Game.updateStat('status', 15);
            AudioSys.playSuccess();
            UI.showAlert("¡ASCENSO CONCEDIDO! 🌟", `Has sido promovido a ${nextLevel.name}. Tu salario ha aumentado considerablemente.`);
        } else {
            state.work_relations.boss -= 5;
            state.work_relations.happiness -= 5;
            let missing = [];
            if (!hasXP) missing.push(`Tiempo (${state.jobMonths}/${req.xp} meses)`);
            if (!hasRep) missing.push(`Reputación (${state.work_relations.boss}/${req.rep})`);
            if (!hasInt) missing.push(`Inteligencia (${state.intelligence}/${req.int})`);

            UI.showAlert("Solicitud Rechazada", `Aún no estás listo para ser ${nextLevel.name}.\nTe falta: ${missing.join(', ')}.`);
        }
        UI.render();
        // UI.renderJobDashboard();
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
    },

    // --- WORK EVENTS & NETWORKING ---

    attendAfterOffice() {
        if (state.energy < 25) return UI.showAlert("Agotado", "Demasiado cansado para ir al After Office.");
        if (state.money < 50) return UI.showAlert("Sin Fondos", "Necesitas $50 para las bebidas.");

        Game.updateStat('energy', -25);
        Game.updateStat('money', -50);
        Game.updateStat('stress', -10); // Relaxing
        state.work_relations.colleagues = Math.min(100, state.work_relations.colleagues + 8);

        // Network Gain
        const netGain = 5 + (state.charisma * 0.1);
        if (!state.network) state.network = 0;
        state.network += netGain;

        UI.log(`🍺 After Office: +Colegas, -Estrés, +Red de Contactos (${Math.floor(netGain)}).`, "good");

        // Headhunting Chance
        this.checkHeadhunting();

        UI.render();
        UI.renderJobDashboard();
    },

    checkHeadhunterEvent() {
        // Vibe Check: Recessions make headhunters more aggressive
        let baseChance = 0.2; // 20% base chance per month after streak
        if (state.world && state.world.economicState === 'recession') {
            baseChance = 0.4;
        }

        if (Math.random() < baseChance) {
            const currentJob = JOBS.find(j => j.id === state.currJobId);
            if (!currentJob) return;

            // Select a rival company
            const rivalCompanies = COMPANIES.filter(c => c.id !== currentJob.companyId && c.sector === (currentJob.sector || 'fastfood'));
            if (rivalCompanies.length === 0) return;
            const rival = rivalCompanies[Math.floor(Math.random() * rivalCompanies.length)];

            const level = JOB_LEVELS[state.jobLevel || 0];
            const offerSalary = Math.floor(currentJob.salary * level.salaryMult * 1.2); // 20% more
            const signingBonus = offerSalary * 2;

            const offer = {
                id: 'headhunt_' + Date.now(),
                companyId: rival.id,
                companyName: rival.name,
                companyLogo: rival.logo,
                title: currentJob.title,
                salary: offerSalary,
                bonus: signingBonus,
                desc: `¡Hola! Hemos visto tu increíble desempeño en ${currentJob.companyId}. En **${rival.name}** valoramos el talento y queremos ofrecerte el puesto de **${currentJob.title}** con un **20% más de salario** y un bono de contratación.`
            };

            UI.showHeadhunterModal(offer);
        }
    },

    acceptHeadhuntOffer(offer) {
        state.currJobId = offer.id; // Or however jobs are indexed? Wait, JOBS are templates.
        // Actually, we need to find the job template and assign the companyId.
        const template = JOB_TEMPLATES.find(t => t.title === offer.title);
        if (template) {
            // Logic for switching job (similar to applyJob but forced)
            state.currJobId = template.id + '_' + offer.companyId;
            // Create the job if it doesn't exist in global list? 
            // Better: just set state and update totals.

            // Apply bonus
            Game.updateStat('money', offer.bonus);
            Game.updateStat('happiness', 15);
            Game.updateStat('status', 10);

            // Rivalry penalty? (Reputation with old company resets)
            state.work_relations.boss = 50;
            state.work_relations.performance = 50;
            state.work_relations.performanceStreak = 0;

            UI.log(`Te has unido a ${offer.companyName}. +$${offer.bonus} de bono.`, "good");
            UI.showAlert("NUEVO COMIENZO", `Bienvenido a ${offer.companyName}. Tu nuevo salario es de $${offer.salary}/mes.`);
        }
        if (UI.closeModal) UI.closeModal('headhunter-modal');
        UI.render();
    },

    counterHeadhuntOffer(offer) {
        // Skill check: Intelligence + Experience + Charisma
        const successChance = (state.intelligence + (state.careerExperience[offer.career] || 0) + state.charisma) / 300;

        if (Math.random() < successChance) {
            // Success: Raise current salary + Reputation
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) {
                const raise = Math.floor(job.salary * 0.15);
                job.salary += raise; // Permanente for this instance
                state.work_relations.boss = Math.min(100, state.work_relations.boss + 15);
                UI.showAlert("NEGOCIACIÓN EXITOSA", `Tu empresa actual ha igualado la oferta para retenerte. +$${raise} de salario base.`);
            }
        } else {
            // Fail: Boss gets annoyed
            state.work_relations.boss = Math.max(0, state.work_relations.boss - 20);
            UI.showAlert("NEGOCIACIÓN FALLIDA", `A tu jefe no le gustó que usaras otra oferta como palanca. -20 Relación con el Jefe.`);
        }

        if (UI.closeModal) UI.closeModal('headhunter-modal');
        UI.render();
    },

    rejectHeadhuntOffer(offer) {
        // Sube Lealtad/Reputación
        state.work_relations.boss = Math.min(100, state.work_relations.boss + 10);
        UI.log(`Has rechazado la oferta de ${offer.companyName}. Tu lealtad ha sido notada.`, "good");
        if (UI.closeModal) UI.closeModal('headhunter-modal');
        UI.render();
    },

    triggerWorkEvent() {
        if (!WORK_EVENTS || WORK_EVENTS.length === 0) return;

        const event = WORK_EVENTS[Math.floor(Math.random() * WORK_EVENTS.length)];

        // UI for Event choice - Using specific modal structure or fallback
        const modal = document.getElementById('event-modal');
        if (modal) {
            // Fallback if specific IDs don't exist, just blast innerHTML of body
            const body = modal.querySelector('.modal-body');
            if (body) {
                let html = `<h3>${event.title}</h3><p>${event.desc}</p><div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">`;
                event.choices.forEach((c, idx) => {
                    html += `<button class="act-btn" onclick="Game.handleWorkEventChoice('${event.id}', ${idx})">${c.text}</button>`;
                });
                html += `</div>`;
                body.innerHTML = html;
                modal.classList.add('active');
            }
        }
    },

    handleWorkEventChoice(eventId, choiceIdx) {
        const event = WORK_EVENTS.find(e => e.id === eventId);
        if (!event) return;
        const choice = event.choices[choiceIdx];
        const effect = choice.effect;

        // Close Modal
        document.getElementById('event-modal').classList.remove('active');

        // Apply Effects
        if (effect.bossRep) state.work_relations.boss = Math.max(0, Math.min(100, state.work_relations.boss + effect.bossRep));
        if (effect.colleagueRep) state.work_relations.colleagues = Math.max(0, Math.min(100, state.work_relations.colleagues + effect.colleagueRep));

        if (effect.stress) Game.updateStat('stress', effect.stress);
        if (effect.energy) Game.updateStat('energy', effect.energy);

        // Complex effects (Probabilistic)
        if (effect.chance) {
            if (Math.random() < effect.chance) {
                if (effect.success && effect.success.bossRep) state.work_relations.boss += effect.success.bossRep;
                if (effect.success && effect.success.money) Game.updateStat('money', effect.success.money);
                UI.log("Resultado: Éxito. " + choice.text, "good");
            } else {
                if (effect.fail && effect.fail.bossRep) state.work_relations.boss += effect.fail.bossRep;
                UI.log("Resultado: Fallo.", "bad");
            }
        } else {
            UI.log(`Decisión: ${choice.text}`, "normal");
        }

        UI.render();
        UI.renderJobDashboard();
    },

    // ----------------------------

    // --- WORK FOCUS TIMER ---

    startWorkSession(isHard) {
        // 1. Checks
        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        const energyCost = isHard ? (job.energyCost || 20) * 1.5 : 20;
        if (state.energy < energyCost) return UI.showAlert("Agotado", "No tienes energía para trabajar.");

        if (state.consecutiveWork > 2 && !isHard) { // Allow hard work to bypass? No, generally strict.
            // Actually, work() has this check.
            if (state.consecutiveWork > 2) {
                Haptics.error();
                return UI.log("¡Estás agotado! Descansa.", "bad");
            }
        }

        // 2. Initialize Timer
        // Check Flow State
        const flowBonus = (state.workStreak >= 3);
        const duration = flowBonus ? 4000 : 5000;

        state.workTimer = {
            active: true,
            duration: duration,
            startTime: Date.now(),
            isHard: isHard,
            progress: 0
        };

        // 3. Start Loop
        this._workInterval = setInterval(() => {
            if (!state.workTimer.active) return clearInterval(this._workInterval);

            const elapsed = Date.now() - state.workTimer.startTime;
            const progress = Math.min(100, (elapsed / state.workTimer.duration) * 100);
            state.workTimer.progress = progress;

            if (elapsed >= state.workTimer.duration) {
                clearInterval(this._workInterval);
                this.completeWorkSession(isHard);
            } else {
                UI.renderWorkTimer(); // Updates just the button
            }
        }, 50); // 20fps update for smooth enough bar

        // 4. Anti-Cheat / Focus Check
        this._focusHandler = () => {
            if (document.hidden && state.workTimer.active) {
                this.failWorkSession();
            }
        };
        document.addEventListener('visibilitychange', this._focusHandler);

        // Update UI to show timer state
        UI.renderWorkTimer();
    },

    completeWorkSession(isHard) {
        state.workTimer.active = false;
        clearInterval(this._workInterval);
        document.removeEventListener('visibilitychange', this._focusHandler);

        // Execute Actual Work
        if (isHard) {
            this.workHard();
        } else {
            this.work();
        }

        // Streak Logic
        if (!state.workStreak) state.workStreak = 0;
        state.workStreak++;

        if (state.workStreak === 3) {
            UI.log("🌊 ¡FLOW STATE! Tu trabajo es más eficiente (Timer rápido).", "good");
        }

        // Reset UI
        // Reset UI
        // UI.renderJobDashboard(); // Return to home
        if (UI.closeModal) UI.closeModal('job-dashboard-modal');
        UI.render();
    },

    failWorkSession() {
        state.workTimer.active = false;
        clearInterval(this._workInterval);
        document.removeEventListener('visibilitychange', this._focusHandler);

        // Penalty
        Game.updateStat('energy', -10);
        Game.updateStat('stress', 5);
        state.workStreak = 0; // Break streak

        UI.showAlert("¡DISTRAÍDO!", "Te has distraído y perdiste el hilo. Perdiste tiempo y energía.");
        UI.renderJobDashboard();
    },

    work() {
        if (state.consecutiveWork > 2) {
            Haptics.error();
            UI.log("¡Estás agotado! Descansa.", "bad");
            return; // Prevent working too much without rest?
        }

        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        // --- SECTOR MECHANICS ---

        // 1. CONSTRUCTION / TRADE: Injury Risk & Health Gate
        if (job.career === 'trade') {
            if (state.physicalHealth < 30) {
                return UI.showAlert("Salud Baja", "Estás demasiado herido para trabajar en la obra. Descansa.");
            }
            // Injury Chance 10%
            if (Math.random() < 0.10) {
                const dmg = 15;
                Game.updateStat('physicalHealth', -dmg);
                Game.updateStat('stress', 10);
                UI.log("🤕 ¡ACCIDENTE! Te golpeaste en el trabajo. -Salud", "bad");
            }
        }

        // 2. TECH: Bugs & Debugging
        if (job.career === 'tech') {
            // 15% Chance of Bug
            if (Math.random() < 0.15) {
                Game.updateStat('energy', -25); // Extra draining
                Game.updateStat('intelligence', 2); // Learned a lot
                Game.updateStat('stress', 15);

                UI.showAlert("🐛 BUG CRÍTICO", "El sistema colapsó. Pasaste el día arreglando código.\nNo cobraste, pero aprendiste mucho (+2 Int).");
                state.consecutiveWork++;
                this.checkAchievements();
                UI.render();
                UI.renderJobDashboard();
                return; // NO SALARY
            }
        }

        let wage = job.salary;

        // 3. SERVICE / EDUCATION: Weather Effects
        if (job.career === 'service' || job.career === 'education') {
            if (state.world && state.world.weather === 'storm') {
                wage *= 3.0;
                Game.updateStat('physicalHealth', -10);
                Game.updateStat('stress', 10);
                UI.log("⛈️ Tarifa Tormenta: ¡Triple Paga! (Pero te empapaste)", "good");
            } else if (state.world && state.world.weather === 'rain') {
                wage *= 1.5;
                Game.updateStat('physicalHealth', -5);
                UI.log("🌧️ Tarifa Lluvia: +50% Paga.", "good");
            }
        }

        // 4. CORPORATE: KPI & Stress
        if (job.career === 'corp') {
            Game.updateStat('stress', 5); // Extra stress on top of normal
            if (!state.corp) state.corp = { monthsSinceReview: 0, kpiScore: 50 };
            state.corp.monthsSinceReview++;

            // Check Review
            if (state.corp.monthsSinceReview >= 3) {
                this.kpiReview();
            }
        }

        // Suit bonus
        if (state.inventory.includes('suit')) wage *= 1.1;
        // Laptop bonus for tech
        if (job.career === 'tech' && state.inventory.includes('laptop')) wage *= 1.2;

        if (job.career === 'tech' && state.inventory.includes('laptop')) wage *= 1.2;

        // TRAVEL SYSTEM: Apply country salary multiplier & exchange rate
        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            if (country) {
                if (country.salaryMultiplier) wage *= country.salaryMultiplier;
                if (country.exchangeRate) wage /= country.exchangeRate;
            }
        }

        // EDUCATION EFFECTS: Elite School Bonus
        if (state.school && state.school.universityPrestige === 'elite_private') {
            wage *= 1.20; // +20% Salary for Elite Grads
            // Visual indicator of bonus? Maybe in log.
        }

        // STUDENT DEBT DEDUCTION
        let debtPayment = 0;
        if (state.loans > 0) {
            debtPayment = Math.floor(wage * 0.15); // 15% of monthly wage
            if (debtPayment > state.loans) debtPayment = state.loans;

            state.loans -= debtPayment;
            wage -= debtPayment; // Deduct from payout
        }

        // WORLD EFFECTS: Salary
        const effects = World.getEffects();
        if (effects.jobSalary && job.career === 'tech') wage *= effects.jobSalary;
        // Note: For now only tech boom logic in World.trends matches 'tech'.
        if (effects.jobSalary) {
            // If trend is tech specific logic:
            if (World.getTrendName(state.world.currentTrend.id) === 'Auge de la IA' && job.career === 'tech') {
                wage *= effects.jobSalary;
            }
            // Logic in my specific World.js implementation was {jobSalary: 1.3} for tech type.
            // I'll simplify: if (effects.jobSalary) apply generally or check context?
            // Let's apply generally if defined, assuming World config is source of truth.
            // Except AI Boom specifically targets tech. 
            // Okay, let's check specific condition:
            if (state.world.currentTrend.type === 'tech' && job.career === 'tech') wage *= effects.jobSalary;
        }

        this.updateStat('money', wage);
        this.updateStat('energy', -20);

        // Track Attendance
        state.workedThisMonth = true;

        // XP Gain (Dead-end check)
        if (!job.deadEnd) {
            let xpGain = 2;
            if (state.traits.includes('ambitious')) xpGain = 4;
            state.jobXP += xpGain;
        } else {
            UI.log("Este trabajo no ofrece oportunidades de crecimiento.", "normal");
        }

        state.consecutiveWork++;

        AudioSys.playClick(); // Work sound?
        UI.log(`Trabajaste como ${job.title}. Ganaste $${Math.floor(wage)}.${debtPayment > 0 ? ` (Pago Deuda: -$${debtPayment})` : ''}`, "normal");

        this.checkAchievements();

        // Promotion check
        if (!job.deadEnd && state.jobXP >= 100) {
            this.applyPerformanceReview();
        }

        // Update Real Performance
        if (!state.work_relations) state.work_relations = { boss: 50, colleagues: 50, performance: 50 };

        // Working increases performance but adds stress
        const perfGain = 2 + (state.intelligence * 0.05); // Smarter = efficient
        state.work_relations.performance = Math.min(100, state.work_relations.performance + perfGain);

        // Decay logic is handled in nextMonth (neglect)

        // Chance of random work event (5%)
        if (Math.random() < 0.05) this.triggerWorkEvent();

        UI.render();
        UI.renderJobDashboard();
    },

    promote(arg) {
        // Alias to applyJob for manual job selection, but handle logic if it's an auto-promotion
        // If arg is a string (jobId), use applyJob
        if (typeof arg === 'string') {
            this.applyJob(arg);
            return;
        }

        const isPolitical = arg === true;

        // Logic for auto-promotion (Dev Mode or in-game)
        const currentJob = JOBS.find(j => j.id === state.currJobId);
        if (!currentJob || currentJob.career === 'none') return;

        // Find next job in the same career with higher salary
        const careerPath = JOBS.filter(j => j.career === currentJob.career).sort((a, b) => a.salary - b.salary);
        const currentIndex = careerPath.findIndex(j => j.id === currentJob.id);

        if (currentIndex !== -1 && currentIndex < careerPath.length - 1) {
            const nextJob = careerPath[currentIndex + 1];
            state.currJobId = nextJob.id;
            state.jobXP = 0; // Reset XP for new role
            state.promotions++;

            let title = isPolitical ? "¡ASCENSO POLÍTICO! 🤝" : "¡ASCENSO! 📈";
            let msg = isPolitical ?
                `Tu jefe te adora. Te ha ascendido a ${nextJob.title} saltándose las reglas.` :
                `Te han promovido a ${nextJob.title}.`;

            UI.showAlert(title, msg);
            UI.log(msg, "good");
            AudioSys.playSuccess();
            UI.render();
        } else {
            UI.log("Ya estás en la cima de tu carrera.", "info");
        }
    },

    applyPerformanceReview() {
        const rand = Math.random();

        // EDUCATION EFFECTS: Public School Promotion Boost
        let promoChance = 0.2;
        if (state.school && state.school.universityPrestige === 'public') {
            promoChance += 0.15; // +15% chance (Total 35%)
        }

        if (rand < promoChance) {
            this.promote();
        } else if (rand < 0.5) {
            const job = JOBS.find(j => j.id === state.currJobId);
            const salary = job ? job.salary : 0;
            const bonus = Math.floor(salary * 0.5);
            state.money += bonus;
            UI.log(`¡Bono de desempeño! +$${bonus}`, "good");
            AudioSys.playMoney();
        } else {
            UI.log("Buen trabajo hoy. Sigues ganando experiencia.", "normal");
        }
    },

    quitJob() {
        if (state.currJobId === 'unemployed') return;

        if (!confirm("¿Estás seguro de que quieres renunciar a tui trabajo? Perderás tu progreso de antigüedad.")) return;

        UI.log(`Renunciaste a tu puesto de ${state.currJobId}.`, "normal");

        // Blacklist current company
        const currentJob = JOBS.find(j => j.id === state.currJobId);
        if (currentJob && currentJob.companyId) {
            state.companyBlacklist[currentJob.companyId] = state.totalMonths + 24; // 2 years ban
            UI.log(`Has sido vetado de ${currentJob.companyId} por 24 meses.`, "warning");
        }

        state.currJobId = 'unemployed';
        state.jobXP = 0;
        state.jobMonths = 0;
        state.work_relations = { boss: 50, colleagues: 50, performance: 50 };
        UI.renderJob();
        UI.showAlert("Renuncia", "Has renunciado a tu empleo.");

        UI.render();
        UI.renderJobDashboard();
    },

    applyJob(jobId, targetCompanyId = null) {
        const job = JOBS.find(j => j.id === jobId);
        if (!job) return;

        // Save Company ID (explicit or target)
        state.currentCompanyId = targetCompanyId || job.companyId || null;

        // AGE RESTRICTION: Must be 18+ to work (except unemployed)
        if (state.age < 18 && jobId !== 'unemployed') {
            return UI.showAlert("Muy Joven", "Debes tener al menos 18 años para trabajar. Enfócate en tus estudios.");
        }

        // Restriction: Students can only take Part-Time jobs
        if (state.isStudent && job.type !== 'part_time' && jobId !== 'unemployed') {
            return UI.showAlert("Estudiante", "No puedes tener un empleo a tiempo completo mientras estudias. Acepta un trabajo de medio tiempo.");
        }

        // CORPORATE LOGIC
        if (job.companyId) {
            const company = COMPANIES.find(c => c.id === job.companyId);

            // 1. Blacklist Check
            if (state.companyBlacklist[job.companyId] && state.companyBlacklist[job.companyId] > state.totalMonths) {
                const remaining = state.companyBlacklist[job.companyId] - state.totalMonths;
                return UI.showAlert("Lista Negra", `Esta empresa te ha vetado. Podrás volver a postularte en ${remaining} meses.`);
            }

            // 2. Reputation Check
            // MODIFIED: Entry-level jobs (Salary < 3000 or Intern/Junior) don't require reputation
            const isEntryLevel = job.salary < 3000 ||
                /trainee|intern|junior|assist|jr|student/i.test(job.id) ||
                /trainee|intern|junior|assist|jr|student/i.test(job.title);

            const requiredRep = isEntryLevel ? 0 : Math.floor(company.prestige / 2);
            const currentRep = state.sectorReputation[company.sector] || 0;

            if (currentRep < requiredRep) {
                return UI.showAlert("Reputación Insuficiente", `Necesitas ${requiredRep} de Reputación en el sector ${company.sector.toUpperCase()} (Tienes: ${currentRep}).`);
            }

            // 3. Sector Blacklist (Espionage)
            if (state.sectorBlacklist && state.sectorBlacklist[company.sector]) {
                return UI.showAlert("VETADO DEL SECTOR", `Tu historial de espionaje te impide trabajar en el sector ${company.sector.toUpperCase()} de por vida.`);
            }
        }

        // TRAVEL CHECK: Visa Requirements
        if (typeof Travel !== 'undefined' && state.currentCountry !== 'home') {
            const visa = state.visaStatus;
            if (!visa) {
                return UI.showAlert('Sin Visa', 'No tienes permiso para trabajar aquí.');
            }
            if (!visa.allowWork) {
                return UI.showAlert('Visa Restrictiva', `Tu ${VISA_TYPES[visa.type].name} no permite trabajar.`);
            }
        }

        // Check reqs
        if (state.intelligence < (job.req.int || 0) ||
            state.physicalHealth < (job.req.health || 0) ||
            state.happiness < (job.req.happy || 0)) {
            UI.showAlert("Requisitos no cumplidos", "No estás calificado para este trabajo.");
            return;
        }

        if (job.req.deg) {
            // Check if user has specific degree OR if user has 'university_degree' but job requires specific one?
            // Logic: strict match if job requires specific major.
            // But 'university_degree' is the generic one.
            // If job.req.deg is 'university_degree', any degree works? 
            // Let's assume strict checking for now based on user request.

            // Allow if player has EXACT degree OR if player has degree and job requires generic 'university_degree'
            const hasExact = state.education.includes(job.req.deg);
            const hasGeneric = state.education.includes('university_degree') && job.req.deg === 'university_degree';

            if (!hasExact && !hasGeneric) {
                // Formatting for display
                const degName = (job.req.deg === 'business') ? 'Negocios' :
                    (job.req.deg === 'engineering') ? 'Ingeniería' :
                        (job.req.deg === 'med_school') ? 'Medicina' :
                            (job.req.deg === 'law_school') ? 'Derecho' : 'Título Universitario';

                UI.showAlert("Falta Título", `Necesitas un título en ${degName} para este puesto.`);
                return;
            }
        }

        // NEW: Check career experience requirements
        if (job.req.careerExp) {
            for (const [career, requiredMonths] of Object.entries(job.req.careerExp)) {
                const currentExp = state.careerExperience[career] || 0;
                if (currentExp < requiredMonths) {
                    const yearsNeeded = Math.ceil(requiredMonths / 12);
                    UI.showAlert("Falta Experiencia", `Necesitas al menos ${yearsNeeded} año(s) de experiencia en ${career}.`);
                    return;
                }
            }
        }



        // RIVALRY & SWITCHING LOGIC
        if (state.currJobId !== 'unemployed') {
            const prevJob = JOBS.find(j => j.id === state.currJobId);
            if (prevJob && prevJob.companyId) {
                const prevCompany = COMPANIES.find(c => c.id === prevJob.companyId);

                if (prevJob.companyId === job.companyId) {
                    // Internal Promotion (No penalty)
                }
                else if (prevCompany && prevCompany.rivals && prevCompany.rivals.includes(job.companyId)) {
                    // TRAITOR! Rival Jump
                    state.companyBlacklist[prevJob.companyId] = state.totalMonths + 48; // 4 years ban

                    // Reputation Hit
                    if (state.sectorReputation[prevCompany.sector]) {
                        state.sectorReputation[prevCompany.sector] = Math.floor(state.sectorReputation[prevCompany.sector] * 0.5);
                    }

                    // SIGNING BONUS
                    const bonus = prevJob.salary * 3;
                    state.money += bonus;

                    UI.showAlert("¡Traición Corporativa!", `Has saltado a la competencia.\n\nRecibes un Bono de Fichaje de $${bonus.toLocaleString()}.\nPero tu reputación en el sector ha caído y ${prevCompany.name} te ha vetado por 4 años.`);
                    AudioSys.playMoney();
                }
                else {
                    // Standard Switch
                    state.companyBlacklist[prevJob.companyId] = state.totalMonths + 24; // 2 years ban
                    UI.log(`Te fuiste de ${prevCompany.name}. Vetado por 24 meses.`, "normal");
                }
            }
        }

        // Apply
        state.currJobId = jobId;
        state.jobXP = 0;
        state.promotions = 0;
        state.consecutiveWork = 0;
        state.jobMonths = 0; // Reset job months for new job

        // Vacation Days Init
        const tier = job.salary > 5000 ? 30 : job.salary > 2000 ? 14 : 7;
        state.vacationDays = tier;

        UI.log(`¡Contratado! Ahora eres ${job.title}.`, "good");
        UI.showAlert("¡Felicidades!", `Has conseguido el puesto de ${job.title}.`);

        // Close modal
        UI.els.modals.job.classList.remove('active');
        UI.render();
    },

    // ⚠️ DUPLICATE REMOVED - Using implementation at lines 113-135

    // --- Actions ---
    doActivity(type) {
        if (state.energy < 10) return UI.showAlert("Agotado", "Estás demasiado cansado.");

        let cost = 0;
        let msg = "";

        if (type === 'gym') {
            cost = 50;
            // TRAVEL SYSTEM: Apply COL & Exchange Rate
            if (typeof Travel !== 'undefined' && state.currentCountry) {
                const country = Travel.getCurrentCountry();
                if (country) {
                    if (country.costOfLiving) cost *= country.costOfLiving;
                    if (country.exchangeRate) cost /= country.exchangeRate;
                }
            }
            if (state.money < cost) return UI.log(`No tienes dinero para el Gym ($${Math.floor(cost)}).`, "bad");
            this.updateStat('money', -cost);
            this.updateStat('physicalHealth', 2);
            this.updateStat('energy', -15);
            this.updateStat('happiness', 1);
            msg = "Fuiste al gimnasio. +Salud";
        } else if (type === 'library') {
            cost = 0;
            this.updateStat('intelligence', 1);
            this.updateStat('energy', -10);
            msg = "Leíste en la biblioteca. +Inteligencia";
        } else if (type === 'meditate') {
            this.updateStat('mentalHealth', 3);
            this.updateStat('stress', -10); // Updated: Stress relief
            this.updateStat('energy', -5);
            this.updateStat('happiness', 2);
            msg = "Meditaste un rato. +Salud Mental, -Estrés";
        } else if (type === 'park') {
            this.updateStat('stress', -8);
            this.updateStat('happiness', 2);
            this.updateStat('energy', -15);
            msg = "Un paseo refrescante. -Estrés";
        }

        if (UI.closeModal) UI.closeModal('activity-modal');
        UI.log(msg, "normal");
        UI.render();
    },

    party() {
        let cost = 100;
        // TRAVEL SYSTEM: Apply COL & Exchange Rate
        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            if (country) {
                if (country.costOfLiving) cost *= country.costOfLiving;
                if (country.exchangeRate) cost /= country.exchangeRate;
            }
        }

        if (state.money < cost) return UI.log(`No tienes dinero para salir ($${Math.floor(cost)}).`, "bad");
        if (state.energy < 20) return UI.log("Estás muy cansado.", "bad");

        this.updateStat('money', -cost);
        this.updateStat('energy', -30);
        this.updateStat('happiness', 10);
        this.updateStat('mentalHealth', 2);

        // Social Logic
        if (Math.random() < 0.3) {
            // New Friend?
            if (state.friends.length < 5) {
                const names = ["Carlos", "Ana", "Miguel", "Lucía", "Pedro", "Sofia"];
                const newName = names[Math.floor(Math.random() * names.length)];
                state.friends.push({ name: newName, relation: 50 });
                UI.showAlert("Nuevo Amigo", `Conociste a ${newName} en la fiesta.`);
            }
        }

        if (UI.closeModal) UI.closeModal('activity-modal');
        UI.log("¡Qué buena fiesta! +Felicidad", "good");
        UI.render();
    },

    startProject(typeId) {
        const type = PROJECT_TYPES.find(t => t.id === typeId);
        if (state.money < type.cost) return UI.showAlert("Fondos Insuficientes", "Necesitas $" + type.cost);
        if (state.intelligence < (type.req.intelligence || 0)) return UI.showAlert("Requisitos", "Necesitas más inteligencia.");

        this.updateStat('money', -type.cost);
        state.activeProject = {
            id: typeId,
            name: type.name,
            progress: 0,
            duration: type.duration,
            penalty: type.penalty
        };

        UI.log(`Comenzaste proyecto: ${type.name}`, "good");
        UI.render();
    },

    processProjects() {
        if (!state.activeProject) return;
        state.activeProject.progress++;

        if (state.activeProject.progress >= state.activeProject.duration) {
            this.completeProject();
        }
    },

    completeProject() {
        if (!state.activeProject) return;
        const p = state.activeProject;

        // Rewards
        state.creations.push({
            id: p.id,
            name: p.name,
            income: 0, // Placeholder for passive income logic if any
            date: state.totalMonths
        });

        // Royalties / Passive Income logic?
        // For now, prompt lump sum or passive
        if (p.id === 'youtube') {
            this.updateStat('status', 10);
            UI.showAlert("Proyecto Completado", "Tu canal de YouTube está activo.\nGanarás suscriptores e ingresos pasivos.");
        } else if (p.id === 'book') {
            this.updateStat('money', 5000); // Advance
            UI.showAlert("Libro Publicado", "Tu libro es un éxito moderado.\nRecibiste un adelanto de $5,000.");
        }

        state.activeProject = null;
        UI.log(`¡Completaste ${p.name}!`, "good");
        AudioSys.playSuccess();
    },

    startCourse(courseId) {
        if (state.activeCourse) return UI.showAlert("Ocupado", "Ya estás estudiando un curso.");
        const course = COURSES.find(c => c.id === courseId);
        if (state.money < course.cost) return UI.showAlert("Fondos Insuficientes", "No puedes pagar el curso.");

        this.updateStat('money', -course.cost);
        state.activeCourse = {
            id: course.id,
            monthsLeft: course.duration
        };

        UI.log(`Inscrito en: ${course.title}`, "good");
        UI.render();
    },

    socializeColleagues() {
        if (state.currJobId === 'unemployed') return UI.log("No tienes colegas, estás desempleado.", "bad");
        if (state.energy < 15) return UI.log("Muy cansado.", "bad");

        this.updateStat('energy', -15);
        this.updateStat('jobXP', 2); // Networking helps
        this.updateStat('happiness', 5);

        // Boost all colleague relations
        let count = 0;
        if (state.friends) {
            state.friends.forEach(f => {
                if (f.isColleague) {
                    f.relation = Math.min(100, f.relation + 5);
                    count++;
                }
            });
        }

        if (count === 0) {
            // Generate a colleague if none
            this.generateColleague();
            UI.log("Conociste a un nuevo colega en la máquina de café.", "good");
        } else {
            UI.log("Charlaste con tus compañeros de trabajo.", "good");
        }
        UI.render();
    },

    generateColleague() {
        const names = ["Diego", "Laura", "Fernando", "Camila", "Javier"];
        const name = names[Math.floor(Math.random() * names.length)];
        if (!state.friends) state.friends = [];
        state.friends.push({
            name: name,
            relation: 50,
            isColleague: true,
            jobTitle: 'Colega'
        });
    },

    triggerBurnoutCollapse() {
        UI.showAlert("🔥 COLAPSO POR BURNOUT 🔥", "Tu cuerpo y mente no pueden más. Has colapsado y has estado en recuperación durante 3 meses.");

        // Skip 3 months (Visual + Logic)
        // We simulate the passage of time without full interactivity
        state.totalMonths += 3;
        state.age = Math.floor(state.totalMonths / 12);

        // Penalties
        this.updateStat('physicalHealth', -30);
        this.updateStat('mentalHealth', -30);
        this.updateStat('happiness', -20);
        this.updateStat('money', -1000); // Medical bills

        // Reset Stress
        state.stress = 50; // Not 0, you're still recovering

        UI.render();
        Haptics.error();
    },

    takeVacation(type) {
        let cost = 0;
        let stressRelief = 0;
        let msg = "";

        if (type === 'relax') {
            cost = 200; stressRelief = 15; msg = "Fin de semana de relax.";
        } else if (type === 'trip') {
            cost = 1000; stressRelief = 40; msg = "Viaje a la playa.";
        } else if (type === 'luxury') {
            cost = 5000; stressRelief = 100; msg = "Vuelta al mundo de lujo.";
        }

        if (state.money < cost) return UI.log("No tienes suficiente dinero.", "bad");

        this.updateStat('money', -cost);
        this.updateStat('stress', -stressRelief);
        this.updateStat('happiness', 10);
        this.updateStat('energy', 100); // Recharged

        if (UI.closeModal) UI.closeModal('activity-modal');
        UI.showAlert("✈️ Vacaciones", `${msg} Te sientes renovado.`);
        UI.render();
    },

    evolveFriends() {
        // Called at age 18 to transition childhood friends?
        // Or just cleanup?
        UI.log("Tus amistades de la infancia han madurado.", "info");

        if (state.friends) {
            state.friends.forEach(f => {
                f.relation = Math.max(20, f.relation - 10); // Drift apart slightly
            });
        }
    },

    triggerReunion() {
        UI.showEventChoices("Reunión de Ex-alumnos", "Tus compañeros de secundaria se reúnen.", [
            { text: "Ir (-$50)", onClick: () => { Game.updateStat('money', -50); Game.updateStat('happiness', 10); UI.log("Fue nostálgico.", "good"); } },
            { text: "No ir", onClick: () => UI.log("Mejor dejar el pasado atrás.", "normal") }
        ]);
    },

    triggerMillionaireOffer() {
        UI.showEventChoices("Propuesta Indecente", "Un millonario te ofrece dinero por... compañía.", [
            { text: "Aceptar (+$10,000, -Dignidad)", onClick: () => { Game.updateStat('money', 10000); Game.updateStat('happiness', -20); UI.log("Te sientes sucio pero rico.", "bad"); } },
            { text: "Rechazar", onClick: () => UI.log("Tu dignidad no tiene precio.", "good") }
        ]);
    },

    triggerAlumniEvent() {
        // Find a job better than current, or just a high tier one
        // Sim: Offer a random high tier job without interview
        const eliteJobs = JOBS.filter(j => j.salary > 5000 && j.id !== state.currJobId);
        if (eliteJobs.length === 0) return;

        const offer = eliteJobs[Math.floor(Math.random() * eliteJobs.length)];

        UI.showEventChoices("Red de Alumni 🎓", `Un compañero de la universidad te ofrece un puesto de ${offer.title}.`, [
            {
                text: `Aceptar Oferta ($${offer.salary})`,
                onClick: () => {
                    state.currJobId = offer.id;
                    state.jobXP = 0;
                    UI.showAlert("¡Contratado!", `Gracias a tus contactos, ahora eres ${offer.title}.`);
                    UI.log(`Aceptaste la oferta de alumni: ${offer.title}`, "good");
                    UI.render();
                }
            },
            { text: "Rechazar", onClick: () => UI.log("Rechazaste la oferta de tu ex-compañero.", "normal") }
        ]);
    },

    rest() {
        state.consecutiveWork = 0;
        this.updateStat('energy', 40);
        this.updateStat('physicalHealth', 2);
        this.updateStat('happiness', 3);
        UI.log("Tomaste un descanso y te relajaste.", "normal");
        UI.render();
    },

    // --- FAME SYSTEM ---

    startFameCareer(channelId) {
        if (state.energy < 20) return UI.showAlert("Agotado", "Necesitas energía para iniciar esto.");

        const channel = FAME_CHANNELS[channelId];
        state.fame.channel = channelId;
        state.fame.followers = 0;
        state.fame.status = 'active';

        UI.showAlert(`¡Canal de ${channel.name} Iniciado!`, `Has comenzado tu carrera como ${channel.name}. \nRequiere: ${channel.stat}.`);
        UI.log(`Comenzaste tu camino como ${channel.name}.`, "good");
        this.updateStat('energy', -20);

        UI.renderSocialMedia();
        UI.render();
    },

    postContent() {
        if (!state.fame.channel) return;
        const ch = FAME_CHANNELS[state.fame.channel];

        if (state.energy < ch.cost) return UI.log("Muy cansado para crear contenido.", "bad");

        this.updateStat('energy', -ch.cost);

        // Success Calculation
        // Base 10% + (Stat / 2)%
        // Example: 50 Charisma = 35% chance of "Viral/Good" post
        const statVal = state[ch.stat] || 0;
        let successChance = 0.1 + (statVal * 0.005);
        if (state.traits.includes('creative') && ch.stat === 'creativity') successChance += 0.2;
        if (state.traits.includes('charming') && ch.stat === 'charisma') successChance += 0.2;

        const roll = Math.random();

        // RISK CHECK (Cancellation)
        // Scales with followers: more fame = more scrutiny
        // 0.1% base, up to 5% with 1M followers
        let cancelRisk = FAME_RISKS.find(r => r.id === 'cancellation').prob;
        if (state.fame.followers > 100000) cancelRisk = 0.02;
        if (state.fame.followers > 1000000) cancelRisk = 0.05;

        if (Math.random() < cancelRisk) {
            return this.triggerFameRisk('cancellation');
        }

        // Bad Post Risk
        if (Math.random() < 0.05) {
            return this.triggerFameRisk('bad_post');
        }

        if (roll < successChance) {
            // VIRAL
            const multiplier = 1.5 + (Math.random() * 2); // 1.5x - 3.5x
            const baseGain = 10 + Math.floor(state.fame.followers * 0.1);
            const gain = Math.floor(baseGain * multiplier);

            state.fame.followers += gain;
            UI.log(`🔥 ¡Tu post se hizo viral! +${UI.formatFollowers(gain)} seguidores.`, "good");
            this.updateStat('happiness', 5);
        } else if (roll < successChance + 0.4) {
            // NORMAL
            const gain = 5 + Math.floor(state.fame.followers * 0.02);
            state.fame.followers += gain;
            UI.log(`Publicaste contenido. +${gain} seguidores.`, "normal");
        } else {
            // FLOP
            UI.log("Tu post pasó desapercibido.", "normal");
            this.updateStat('stress', 2);
        }

        this.checkFameMilestones();
        UI.renderSocialMedia();
        UI.render();
    },

    collab() {
        if (state.energy < 30) return UI.log("Necesitas energía.", "bad");
        if (state.money < 100) return UI.log("Necesitas $100 para la colaboración.", "bad");

        this.updateStat('energy', -30);
        this.updateStat('money', -100);

        const gain = Math.floor(state.fame.followers * 0.15);
        state.fame.followers += gain;

        UI.log(`🤝 Colaboración exitosa. +${UI.formatFollowers(gain)} seguidores.`, "good");
        UI.renderSocialMedia();
        UI.render();
    },

    triggerFameRisk(typeId) {
        const risk = FAME_RISKS.find(r => r.id === typeId);
        if (!risk) return;

        // Apply effects
        if (risk.effect.followers) state.fame.followers = Math.floor(state.fame.followers * risk.effect.followers);
        if (risk.effect.stress) this.updateStat('stress', risk.effect.stress);
        if (risk.effect.reputation) this.updateStat('status', risk.effect.reputation);

        UI.showAlert("⚠️ ESCÁNDALO", `${risk.name}: ${risk.desc}`);
        UI.log(`📉 ${risk.name}. Perdiste seguidores.`, "bad");

        state.happiness -= 20;
        UI.renderSocialMedia();
        UI.render();
    },

    checkFameMilestones() {
        FAME_LEVELS.forEach(level => {
            // Check if already unlocked (persist unlocked perks in state.fame.perks strings)
            // Simplified: just check if followers >= level.followers
            if (state.fame.followers >= level.followers) {
                // Determine revenue
                let rev = 0;
                if (level.followers === 10000) rev = 500;
                if (level.followers === 100000) rev = 2000;
                if (level.followers === 1000000) rev = 10000;

                // Update revenue if higher
                if (rev > state.fame.revenue) state.fame.revenue = rev;

                // Add perks description if not present
                if (!state.fame.perks.includes(level.perks)) {
                    state.fame.perks.push(level.perks);
                    UI.log(`🎉 ¡Nuevo Hito de Fama! ${level.title}`, "good");
                    UI.showAlert(level.title, `¡Has alcanzado ${UI.formatFollowers(level.followers)} seguidores!\nNuevo Beneficio: ${level.perks}`);
                }
            }
        });
    },

    processWorkEvents() {
        if (state.currJobId === 'unemployed') return;

        // Sabotage & Help Logic
        if (state.friends && state.friends.length > 0) {
            state.friends.forEach(f => {
                if (f.isColleague) {
                    // Sabotage Chance (Low Relation)
                    if (f.relation < 30 && Math.random() < 0.05) {
                        UI.log(`${f.name} intentó culparte de un error.`, "bad");
                        this.updateStat('jobXP', -10);
                        this.updateStat('mentalHealth', -5);
                    }
                    // Help Chance (High Relation)
                    else if (f.relation > 80 && Math.random() < 0.05) {
                        UI.log(`${f.name} te ayudó con un informe.`, "good");
                        this.updateStat('jobXP', 5);
                    }
                }
            });
        }
    },

    workHard() {
        if (state.energy < 30) return UI.log("Demasiado cansado para esforzarte extra.", "bad");

        this.updateStat('energy', -30);
        this.updateStat('jobXP', 5);
        this.updateStat('happiness', -2); // Stress

        // Mark that player worked this month (prevents firing)
        state.workedThisMonth = true;

        // Bonus Chance
        if (Math.random() < 0.4) {
            UI.log("Tu esfuerzo extra impresionó a tu jefe. +XP", "good");
            this.updateStat('jobXP', 5);
        } else {
            UI.log("Trabajaste duro, pero nadie lo notó.", "normal");
        }
        UI.render();
    },


    // --- WORK FOCUS TIMER ---

    startWorkSession() {
        if (state.currJobId === 'unemployed') return UI.log("No tienes empleo.", "bad");
        if (state.energy < 20) return UI.log("Demasiado cansado para trabajar.", "bad");

        // UI Setup
        state.isWorking = true;
        const overlay = document.getElementById('focus-overlay');
        const circle = document.getElementById('focus-circle');
        const text = document.getElementById('focus-text');
        const sub = document.getElementById('focus-sub');

        if (overlay) overlay.classList.add('active');

        // Flow check
        const isFlow = state.workStreak >= 3;
        const duration = isFlow ? 4000 : 5000;

        if (isFlow) {
            if (circle) circle.classList.add('flow');
            if (text) text.innerText = "⚡ MODO FLOW ⚡";
            if (sub) sub.innerText = "¡Estás en racha! (4s)";
        } else {
            if (circle) circle.classList.remove('flow');
            if (text) text.innerText = "TRABAJANDO...";
            if (sub) sub.innerText = "Mantén la app abierta (5s)";
        }

        // Visibility Listener
        this._visibilityHandler = () => {
            if (document.hidden && state.isWorking) {
                this.failWorkSession();
            }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);

        // Timer
        this._workTimer = setTimeout(() => {
            this.completeWorkSession(isFlow);
        }, duration);
    },

    completeWorkSession(isFlow) {
        state.isWorking = false;
        document.removeEventListener('visibilitychange', this._visibilityHandler);

        const overlay = document.getElementById('focus-overlay');
        if (overlay) overlay.classList.remove('active');

        state.workStreak++;

        // Execute actual work logic
        this.performWork(isFlow); // Extracted logic
    },

    failWorkSession() {
        if (!state.isWorking) return;
        state.isWorking = false;

        clearTimeout(this._workTimer);
        document.removeEventListener('visibilitychange', this._visibilityHandler);

        const overlay = document.getElementById('focus-overlay');
        if (overlay) overlay.classList.remove('active');

        // Penalty
        this.updateStat('energy', -10);
        state.workStreak = 0;

        UI.showAlert("⚠️ ¡Distracción!", "Perdiste el enfoque al salir de la app.\nPerdiste energía y no cobraste.");
        UI.log("Te distrajiste y no trabajaste nada.", "bad");
        Haptics.error();
        UI.render();
    },

    performWork(isFlow) {
        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        // Calculate gains
        const level = JOB_LEVELS[state.jobLevel || 0];
        let xpGain = (job.xpGain || 2) * level.xpMult;
        let salary = (job.salary / 22); // Day rate approx

        // Flow Bonus
        if (isFlow) {
            xpGain *= 1.2;
            this.updateStat('stress', 3); // More stress in flow? Or less? Request said "stress increases a bit more"
        }

        this.updateStat('energy', -20);
        this.updateStat('jobXP', xpGain);
        this.updateStat('money', Math.floor(salary));

        // Boss/Perf impact
        state.work_relations.performance = Math.min(100, state.work_relations.performance + 1);
        state.workedThisMonth = true;

        UI.log(`Trabajo completado. +$${Math.floor(salary)}`, "good");
        if (isFlow) UI.log("⚡ Racha de trabajo: Flow!", "good");

        UI.render();
        UI.renderJob();
    },

    flatterBoss() {
        if (state.currJobId === 'unemployed') return;

        // Find boss (simplification: stored in special relation or just implicit?)
        // Assuming we update a hidden 'bossRelation' or chance of promo?
        // Let's assume we update a generic hidden stat or just give small XP/Reputation?
        // User requirements mentioned "Political Promotions".
        // Let's add a `bossRelation` to state if missing, or just check `promote(true)` chance.

        if (!state.bossRelation) state.bossRelation = 50;

        this.updateStat('energy', -10);
        this.updateStat('status', -1); // Some dignity lost?

        if (Math.random() < 0.7) {
            state.bossRelation += 5;
            UI.log("Le reíste los chistes al jefe. Le caes mejor.", "good");
            if (state.bossRelation > 90) {
                // Change to political promotion trigger?
                // Let's just boost it.
            }
        } else {
            state.bossRelation -= 5;
            UI.log("Tu halago sonó falso. El jefe te miró raro.", "bad");
        }

        // Check for Political Promotion immediately?
        if (state.bossRelation >= 100) {
            this.promote(true); // Political promotion
            state.bossRelation = 50; // Reset
        }

        UI.render();
    },

    // MERGED nextMonth
    /**
     * Main monthly game tick - processes all game systems and updates
     * 
     * @description
     * Execution order:
     * 1. Advance time (age, months)
     * 2. Process employment (firing, boredom)
     * 3. Process health and sickness
     * 4. Tick all game systems (Business, Athletics, etc.)
     * 5. Process finances (income, expenses)
     * 6. Process relationships (partner, children)
     * 7. Trigger random events
     * 8. Update UI and save
     */
    nextMonth() {
        if (this.checkGameOver()) return;

        // 1. Advance time
        this.advanceTime();

        // 2. Process employment
        this.processEmployment();

        // Headhunting check
        if (typeof Headhunting !== 'undefined') Headhunting.update();
        if (typeof MarketCompetition !== 'undefined') MarketCompetition.update();

        // 3. Process health
        this.processHealthAndSickness();

        // 4. Tick all systems
        this.processSystemTicks();
        this.processProjects(); // Personal Projects

        // 5. Process finances
        FinanceManager.processMonthlyFinances();

        // 6. Process relationships
        this.processRelationships();

        // 7. Random events
        this.triggerRandomEvents();

        // 8. Finalize month
        this.finalizeMonth();
    },

    /**
     * Advance game time and reset monthly flags
     */
    advanceTime() {
        state.totalMonths++;
        state.age = Math.floor(state.totalMonths / 12);
        state.consecutiveWork = 0;
        state.workedThisMonth = false;
    },

    /**
     * Process employment status
     * Handles firing logic and boredom penalties
     */
    processEmployment() {
        if (state.currJobId === 'unemployed') return;

        // Firing logic
        const lowMental = state.mentalHealth < 20;
        // FIX: Absenteeism system not fully ready, disabling firing for it
        const skippedWork = false; // !state.workedThisMonth && !state.onVacation;

        if ((skippedWork || lowMental) && Math.random() < 0.15) {
            const reason = skippedWork ? "por ausentismo" : "por inestabilidad mental";
            UI.showAlert("¡DESPEDIDO!", `Te han despedido ${reason}.`);
            UI.log(`Has perdido tu empleo ${reason}.`, "bad");
            state.currJobId = 'unemployed';
            state.jobXP = 0;
            this.updateStat('happiness', -20);
            return;
        }

        // Boredom penalty
        const job = JOBS.find(j => j.id === state.currJobId);
        if (job && job.boredom && job.boredom > 50) {
            const borePenalty = Math.floor((job.boredom - 40) / 10);
            this.updateStat('happiness', -borePenalty);
            if (Math.random() < 0.2) {
                UI.log("Tu trabajo es realmente aburrido...", "normal");
            }
        }

        // Auto XP gain
        let xpGain = 2;
        if (state.work_relations && state.work_relations.performance > 80) {
            xpGain += 2;
            state.work_relations.performanceStreak = (state.work_relations.performanceStreak || 0) + 1;

            // Trigger Headhunter if streak >= 6
            if (state.work_relations.performanceStreak >= 6) {
                this.checkHeadhunterEvent();
            }
        } else {
            state.work_relations.performanceStreak = 0;
        }
        this.updateStat('jobXP', xpGain);

        // Auto promotion check
        if (state.jobXP >= 100) {
            this.applyPerformanceReview();
        }

        // Work events (sabotage, promotion opportunities)
        this.processWorkEvents();

        // ALUMNI NETWORK EVENT (Elite Private Only)
        // Offers once a year (modulo 12)
        if (state.school && state.school.universityPrestige === 'elite_private' && state.totalMonths % 12 === 0) {
            this.triggerAlumniEvent();
        }
    },

    /**
     * Process health, sickness, and age-related decay
     */
    processHealthAndSickness() {
        // Natural fluctuations
        this.applyNaturalFluctuations();

        // Passive energy recovery
        this.updateStat('energy', 5);

        // Age-related decay
        if (state.age > 40) this.updateStat('physicalHealth', -1);
        if (state.age > 60) this.updateStat('intelligence', -1);

        // World effects
        const effects = World.getEffects ? World.getEffects() : {};
        if (effects.healthDecay) {
            this.updateStat('physicalHealth', -effects.healthDecay);
        }

        // Sickness system
        if (state.sickDuration > 0) {
            state.sickDuration--;
            UI.log("Sigues enfermo... (-5 Salud)", "bad");
            this.updateStat('physicalHealth', -5);

            // REALISM: Healthcare Costs
            if (typeof Travel !== 'undefined' && state.currentCountry) {
                const country = Travel.getCurrentCountry();
                // If country has 'free' healthcare, no cost.
                // If 'subsidized', small cost.
                // If 'insurance', high cost unless insured (not implemented yet, so just high cost).

                let medicalCost = 0;
                if (country.healthcare === 'insurance') medicalCost = 200; // Daily cost
                if (country.healthcare === 'subsidized') medicalCost = 50;

                // Adjust for currency
                // medicalCost is in HOME currency baseline, apply COL?
                medicalCost *= country.costOfLiving;

                if (medicalCost > 0) {
                    // Convert to local currency for payment
                    const localCost = Travel.convertCurrency(medicalCost, 'HOME', country.currency);
                    if (state.money >= localCost) {
                        state.money -= localCost;
                        UI.log(`Gastos médicos: -$${localCost.toFixed(0)} ${country.currency}`, 'expense');
                    } else {
                        // Debt? Or just suffer?
                        UI.log("No puedes pagar el médico. La salud empeora.", "bad");
                        this.updateStat('physicalHealth', -2);
                    }
                }
            }

        } else if (state.physicalHealth < 20) {
            // Risk of getting sick with low health
            if (Math.random() < 0.3) {
                state.sickDuration = 3;
                UI.log("¡Te has enfermado por defensas bajas!", "bad");
                Haptics.error();
            }
        }

        // Diet effects
        if (state.diet === 'fast_food') {
            this.updateStat('physicalHealth', -1);
            this.updateStat('energy', 2);
        } else if (state.diet === 'balanced') {
            this.updateStat('physicalHealth', 1);
        } else if (state.diet === 'chef') {
            this.updateStat('physicalHealth', 2);
            this.updateStat('happiness', 2);
        }
    },

    /**
     * Tick all game systems (Business, Athletics, School, etc.)
     */
    processSystemTicks() {
        // World tick (economic trends, events)
        World.tick();

        // Travel system tick (adaptation, visa expiry)
        if (typeof Travel !== 'undefined') {
            Travel.updateAdaptation();
        }

        // Business tick
        if (state.business && state.business.active) {
            Business.tick();
        }

        // Athletics tick
        if (typeof Athletics !== 'undefined') {
            Athletics.tick();
        }

        // Routine tick
        if (typeof Routine !== 'undefined') {
            Routine.tick();
        }

        // Freelancer tick
        if (typeof Freelancer !== 'undefined') {
            Freelancer.generateMonthlyGigs();
            // Refresh UI if projects tab is open
            const projectsTab = document.getElementById('act-tab-projects');
            if (projectsTab && !projectsTab.classList.contains('hidden')) {
                UI.renderProjects();
            }
        }

        // School tick (for students)
        if ((state.age < 18 || state.isStudent) && typeof School !== 'undefined') {
            School.tick();
        }

        // Aguinaldo (semi-annual bonus)
        const monthIdx = state.totalMonths % 12;
        if ((monthIdx === 5 || monthIdx === 11) && state.currJobId !== 'unemployed') {
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) {
                const bonus = Math.floor(job.salary * 0.5);
                this.updateStat('money', bonus);
                UI.log(`¡Aguinaldo! Recibiste un bono de medio sueldo: +$${bonus}`, 'money');
                UI.showAlert("¡AGUINALDO!", `Has recibido tu bono semestral de $${bonus}.`);
            }
        }

        // Graduation trigger
        const graduationMonth = (state.school && state.school.skippedGrade) ? 204 : 216;
        if (state.totalMonths >= graduationMonth && !state.graduationHandled) {
            School.triggerGraduation();
            this.evolveFriends();
            return; // Stop processing to wait for user choice
        }

        // Phase transitions
        if (typeof PhaseManager !== 'undefined') {
            PhaseManager.checkTransition();
        }

        // Active project processing
        if (state.activeProject) {
            this.processProjects();
            if (state.activeProject) {
                this.updateStat('energy', -state.activeProject.penalty);
            }
        }
    },

    /**
     * Process relationships (partner, children, friends)
     */
    processRelationships() {
        // Partner relationship decay
        if (state.partner && state.partner.name) {
            if (Math.random() < 0.1) {
                state.partner.relation = Math.max(0, state.partner.relation - 5);
                UI.log(`${state.partner.name} siente que no le dedicas tiempo.`, "bad");
            }
        }

        // Friend events at specific ages
        if (state.totalMonths === 336) { // Age 28
            this.triggerReunion();
        }

        if (state.totalMonths === 360) { // Age 30
            this.triggerMillionaireOffer();
        }
    },

    /**
     * Trigger random events and market fluctuations
     */
    triggerRandomEvents() {
        const effects = World.getEffects ? World.getEffects() : {};

        // Burnout check
        if (state.currJobId && state.currJobId !== 'unemployed') {
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job && job.stress) {
                this.updateStat('stress', job.stress);
            }
        }

        // Unemployment stress
        if (state.currJobId === 'unemployed' && state.money < 1000) {
            this.updateStat('stress', 2);
        }

        // Burnout collapse
        if (state.stress >= 100) {
            this.triggerBurnoutCollapse();
            return;
        }

        // Stress warning
        if (state.stress > 80) {
            UI.log("⚠️ ¡ESTRÉS CRÍTICO! Tu productividad ha caído 50%.", "bad");
        }

        // Market fluctuations
        ASSETS.forEach(a => {
            let change = (Math.random() - 0.5) * a.vol;

            // World-specific market effects
            if (effects.stockMarket && a.id === 'stock') change += 0.05;
            if (effects.cryptoPrice && a.id === 'crypto') change -= 0.1;

            state.marketPrices[a.id] *= (1 + change);
            if (state.marketPrices[a.id] < 1) state.marketPrices[a.id] = 1;
        });

        // Real estate appreciation
        Object.keys(state.rePrices).forEach(id => {
            let chance = 0.1;
            let mult = 0.05;

            if (effects.realEstatePrice) {
                chance = 0.3;
                mult = 0.1;
            }

            if (Math.random() < chance) {
                state.rePrices[id] *= (1 + (Math.random() * mult));
            }
        });

        // Random events (15% chance)
        if (Math.random() < 0.15) {
            this.randomEvent();
        }

        // Elite events (5% chance)
        if (Math.random() < 0.05) {
            this.triggerEliteEvent();
        }

        // Natural energy recovery
        state.energy = Math.min(100, state.energy + 10);

        // World happiness bonus
        if (effects.happinessGain) {
            state.happiness += 2;
        }
    },

    /**
     * Finalize month - save game and update UI
     */
    finalizeMonth() {
        const fin = this.calculateFinancials();

        DB.saveGame();
        DB.logHistory(state.totalMonths, fin);
        UI.render();

        this.checkAchievements();
    },


    applyNaturalFluctuations() {
        const stats = ['physicalHealth', 'mentalHealth', 'happiness', 'energy'];
        stats.forEach(key => {
            // Random change between -2 and +2
            const delta = Math.floor(Math.random() * 5) - 2;

            // We use updateStat but we MIGHT want to suppress logs for these small natural changes
            // logic in updateStat logs if <= -6. Since delta is >= -2, it won't trigger BAD logs.
            this.updateStat(key, delta);
        });

        // Property Value Fluctuations
        if (state.realEstate && state.realEstate.length > 0) {
            state.realEstate.forEach(id => {
                // +/- 2% change
                const changePct = 1 + ((Math.random() * 0.04) - 0.02);
                if (state.rePrices[id]) {
                    state.rePrices[id] = Math.floor(state.rePrices[id] * changePct);
                }
            });
        }
    },

    randomEvent() {
        const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];

        // Condition check
        if (ev.condition && !ev.condition(state)) return this.randomEvent(); // Retry

        if (ev.type === 'instant') {
            UI.showAlert("Evento", ev.text);
            const res = ev.effect(state);
            this.applyEventResult(res);
        } else if (ev.type === 'choice') {
            // Show Modal with choices
            UI.els.modals.eventText.innerText = ev.text;
            UI.els.modals.eventChoices.innerHTML = '';

            ev.choices.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'act-btn';
                btn.innerHTML = `<div class="act-info"><h4>${c.text}</h4><p>${c.sub}</p></div>`;
                btn.onclick = () => {
                    const res = c.action(state);
                    this.applyEventResult(res);
                    UI.els.modals.event.classList.remove('active');
                };
                UI.els.modals.eventChoices.appendChild(btn);
            });
            UI.els.modals.event.classList.add('active');
        }
    },

    triggerEliteEvent() {
        const ev = ELITE_EVENTS[Math.floor(Math.random() * ELITE_EVENTS.length)];
        if (state.status >= ev.minStatus) {
            UI.showAlert("🌟 Evento Élite", ev.text);
            const res = ev.effect(state);
            this.applyEventResult(res);
        }
    },

    applyEventResult(res) {
        if (res.money) this.updateStat('money', res.money);
        if (res.happiness) this.updateStat('happiness', res.happiness);
        if (res.health) this.updateStat('physicalHealth', res.health);
        if (res.mentalHealth) this.updateStat('mentalHealth', res.mentalHealth);
        if (res.energy) this.updateStat('energy', res.energy);
        if (res.intelligence) this.updateStat('intelligence', res.intelligence);
        if (res.experience) {
            state.experience += res.experience;
            UI.log(`Ganaste ${res.experience} experiencia de vida.`, 'good');
        }

        UI.log(res.msg, res.type);
    },

    // --- Items & Assets ---

    buyItem(id) {
        if (state.inventory.includes(id)) return;
        const item = SHOP_ITEMS.find(i => i.id === id);
        if (state.money < item.price) return UI.log("No te alcanza.", "bad");

        this.updateStat('money', -item.price);
        state.inventory.push(id);
        UI.log(`Compraste ${item.name}!`, "good");
        UI.renderShop(); // Refresh shop UI
        UI.render();
    },

    buyRareItem(id) {
        if (state.inventory.includes(id)) return;
        const item = RARE_ITEMS.find(i => i.id === id);
        if (state.money < item.price) return UI.log("Muy caro para ti.", "bad");

        this.updateStat('money', -item.price);
        state.inventory.push(id);
        // Apply immediate effect if any
        if (item.effect && item.effect.type === 'status') {
            state.status += item.effect.val;
        }
        UI.log(`¡Adquiriste ${item.name}! Estatus +${item.effect.val}`, "good");
        UI.renderShop();
        UI.render();
    },

    trade(assetId, action) {
        if (state.age < 18) return UI.showAlert("Restricción de Edad", "Debes tener 18 años para invertir en la bolsa.");
        const price = state.marketPrices[assetId];
        const holding = state.portfolio[assetId];

        // Simple logic: Trade 1 unit or max? 
        // Original code likely had a prompt or fixed amount. Let's assume 1 unit for simplicity or look at chunk logic.
        // Chunk didn't show details. Assuming 1 unit logic or confirm.
        // Let's implement buy/sell 1 unit for MVP safety.

        if (action === 'buy') {
            if (state.money < price) return UI.log("No tienes dinero.", "bad");
            this.updateStat('money', -price);

            // Avg cost calc
            const totalVal = (holding.qty * holding.avg) + price;
            holding.qty++;
            holding.avg = totalVal / holding.qty;

        } else {
            if (holding.qty <= 0) return UI.log("No tienes acciones.", "bad");
            this.updateStat('money', price);
            holding.qty--;
            if (holding.qty === 0) holding.avg = 0;

            const profit = price - holding.avg; // realized per unit somewhat
            // Just basic tracking
        }
        UI.renderInvestments();
        UI.render();
    },

    buyPet(petId) {
        if (state.pets.some(p => p.id === petId)) return;
        const pet = PETS.find(p => p.id === petId);
        if (state.money < pet.cost) return UI.showAlert("Fondos Insuficientes", "No puedes pagar la adopción.");

        this.updateStat('money', -pet.cost);
        state.pets.push({ id: pet.id, name: pet.name.split(' ')[0] }); // Store simplified
        UI.log(`¡Has adoptado un ${pet.name}!`, "good");
        UI.showAlert("¡Nueva Mascota!", `Has adoptado un ${pet.name}.\nTe dará compañía y felicidad.`);

        // Refresh UI
        UI.populatePetsCards();
        UI.render();
    },

    buyRealEstate(id) {
        if (state.age < 18) return UI.showAlert("Restricción de Edad", "Debes tener 18 años para comprar propiedades.");
        const prop = REAL_ESTATE.find(p => p.id === id);
        const price = state.rePrices[id];

        if (state.money < price) return UI.showAlert("Fondos Insuficientes", `El precio es $${price.toLocaleString()}`);

        this.updateStat('money', -price);
        state.realEstate.push(id);

        UI.log(`Compraste ${prop.name}!`, "good");
        UI.renderRealEstate();
        UI.render();
    },

    sellRealEstate(id) {
        // Find first one
        const idx = state.realEstate.indexOf(id);
        if (idx === -1) return;

        const price = state.rePrices[id];
        this.updateStat('money', price);
        state.realEstate.splice(idx, 1);

        UI.log(`Vendiste propiedad por $${price.toLocaleString()}`, "normal");
        UI.renderRealEstate();
        UI.render();
    },

    // --- Lifestyle ---

    buyHousing(id) {
        const house = HOUSING.find(h => h.id === id);
        if (state.money < house.cost) return; // UI handles check but logic double check

        if (house.cost > 0) this.updateStat('money', -house.cost);
        state.housing = id;
        UI.log(`Te mudaste a: ${house.name}`, "good");
        UI.render();
    },

    // Wrapper for Modal interaction (kept for UI compatibility)
    buyHousingFromModal(id) {
        this.buyHousing(id);
        UI.updateLifestyleModalStatus(); // Assuming method exists or ignores
        UI.populateHousingCards();
        UI.populateVehicleCards();
    },

    buyVehicle(id) {
        const v = VEHICLES.find(h => h.id === id);
        if (state.money < v.cost) return;

        if (v.cost > 0) this.updateStat('money', -v.cost);
        state.vehicle = id;
        UI.log(`Conduces: ${v.name}`, "good");
        UI.render();
    },

    buyVehicleFromModal(id) {
        this.buyVehicle(id);
        UI.updateLifestyleModalStatus();
        UI.populateHousingCards();
        UI.populateVehicleCards();
    },

    // --- Helpers ---
    calculateFinancials() {
        // 1. Assets
        let cash = state.money;
        let investments = 0;
        ASSETS.forEach(a => {
            investments += state.portfolio[a.id].qty * state.marketPrices[a.id];
        });

        // RE
        let realEstate = 0;
        let passiveIncome = 0;
        let reMaint = 0;

        state.realEstate.forEach(id => {
            const price = state.rePrices[id];
            const prop = REAL_ESTATE.find(p => p.id === id);
            if (prop) {
                realEstate += price;
                passiveIncome += prop.rent;
                reMaint += prop.maint;
            }
        });
        passiveIncome -= reMaint;

        // 2. Expenses
        const itemEffects = this.calculateItemEffects();
        const totalMaint = itemEffects.maint;
        let baseLiving = CONFIG.costOfLiving;

        // Partner
        let partnerIncome = 0;
        if (state.partner && (state.partner.status === 'living' || state.partner.status === 'married')) {
            baseLiving /= 2;
            partnerIncome = state.partner.salary || 0;
        }

        // Student Cost Reduction (University)
        if (state.isStudent) {
            // User requested extremely low cost of living.
            baseLiving = 0; // Housing completely subsidized/free for students
        }

        // Diet
        let dietCost = 0;
        if (state.diet === 'fast_food') dietCost = 100;
        else if (state.diet === 'balanced') dietCost = 300;
        else if (state.diet === 'chef') dietCost = 1000;

        // Student "Meal Plan" Discount (50% off food)
        if (state.isStudent) {
            dietCost = Math.floor(dietCost * 0.5);
        }

        let expenses = baseLiving + totalMaint + dietCost;

        // Family
        let petCost = 0;
        state.pets.forEach(p => {
            const def = PETS.find(x => x.id === p.id);
            if (def) petCost += def.maint;
        });

        let childCost = 0;
        state.children.forEach(c => {
            if (c.ageMonths < 216) {
                childCost += CHILD_COST;
            }
        });

        let totalExpenses = expenses + petCost + childCost;

        // AGE EXEMPTION: Minors don't pay expenses
        // STUDENT EXEMPTION: Students don't pay living expenses
        if (state.age < 18 || state.isStudent) {
            totalExpenses = 0;
            expenses = 0;
            petCost = 0;
            childCost = 0;
        }

        // Creation Income (Royalties/Ads)
        let royalties = 0;
        if (state.creations) {
            state.creations.forEach(c => royalties += (c.income || c.royalty || 0));
        }
        passiveIncome += royalties;

        // Active Income (Job)
        let activeIncome = 0;

        if (state.currJobId === 'custom_partner') {
            activeIncome = 15000; // Fixed high salary for Partner
        } else {
            const job = JOBS.find(j => j.id === state.currJobId);
            activeIncome = job ? job.salary : 0;
        }

        if (state.inventory.includes('suit')) activeIncome *= 1.1; // Suit Bonus
        activeIncome += partnerIncome;

        return {
            cash,
            investments,
            realEstate,
            netWorth: cash + investments + realEstate,
            passiveIncome,
            activeIncome,
            expenses: totalExpenses,
            breakdown: { base: expenses, pets: petCost, children: childCost }
        };
    },

    calculateItemEffects() {
        let maint = 0;
        // Inventory Maint
        state.inventory.forEach(id => {
            const i = SHOP_ITEMS.find(x => x.id === id) || RARE_ITEMS.find(x => x.id === id);
            if (i) maint += i.maint;
        });
        // Housing Maint
        const h = HOUSING.find(x => x.id === state.housing);
        if (h) maint += h.maint;
        // Vehicle Maint
        const v = VEHICLES.find(x => x.id === state.vehicle);
        if (v) maint += v.maint;

        return { maint };
    },

    // UI Wrappers
    renderCourses() {
        UI.els.modals.act.classList.add('active');
        UI.switchActTab('courses');
    },

    enrollCourse(id) {
        if (state.education.includes(id)) return;
        const course = COURSES.find(c => c.id === id);

        if (state.money < course.cost) return UI.log("No tienes suficiente dinero.", "bad");

        this.updateStat('money', -course.cost);
        // Instant completion for MVP, or we can make it a project.
        // Let's make it instant but with logging.
        state.education.push(id);
        Game.updateStat('intelligence', 10);

        UI.log(`¡Completaste ${course.title}!`, "good");
        UI.renderCoursesContent(); // Refresh list to show completed
        UI.render();
    },

    // Social Logic (Simplified)
    findLove() {
        if (state.money < 100) return UI.log("No tienes $100.", "bad");
        this.updateStat('money', -100);

        if (Math.random() > 0.6) {
            const names = ["Ana", "Sofia", "Lucia", "Maria", "Elena", "Carlos", "Juan", "Pedro", "Luis", "Diego"];
            const jobs = ["Doctora", "Ingeniera", "Maestra", "Artista", "Abogada", "Chef"];
            const name = names[Math.floor(Math.random() * names.length)];
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            state.partner = {
                name: name,
                jobTitle: job,
                salary: 1000 + Math.floor(Math.random() * 4000),
                relation: 50,
                status: 'dating'
            };
            UI.showAlert("¡Has encontrado el amor!", `Conociste a ${name}, ${job}.`);
            UI.renderSocialTab();
        } else {
            UI.log("No tuviste suerte en la cita.", "normal");
        }
    },

    datePartner() {
        if (!state.partner) return;
        if (state.money < 80) return UI.log("No tienes dinero.", "bad");
        this.updateStat('money', -80);
        state.partner.relation = Math.min(100, state.partner.relation + 10);
        this.updateStat('happiness', 10);
        UI.log("Cita romántica. ❤️", "good");
        UI.renderSocialTab();
    },

    advanceRel() {
        if (!state.partner) return;
        if (state.partner.status === 'dating') {
            state.partner.status = 'living';
            state.partner.relation += 10;
            UI.showAlert("Convivencia", "Ahora viven juntos. Gastos compartidos.");
        } else if (state.partner.status === 'living') {
            if (state.money < 2000) return UI.showAlert("Anillo", "Necesitas $2000 para el anillo.");
            this.updateStat('money', -2000);
            state.partner.status = 'married';
            state.partner.relation = 100;
            state.happiness += 50;
            UI.showAlert("¡BODA!", "¡Se han casado! Felicidades.");
            this.awardTrophy('famous_spouse'); // Check inside
        }
        UI.renderSocialTab();
    },

    breakup() {
        state.partner = null;
        state.happiness -= 30;
        UI.log("Rompiste con tu pareja.", "bad");
        UI.renderSocialTab();
    },

    maintainFriend(id) {
        const f = state.friends.find(x => x.id === id);
        if (!f) return;
        if (state.money < 50) return UI.log("Sin dinero.", "bad");
        this.updateStat('money', -50);
        f.relation = Math.min(100, f.relation + 10);
        this.updateStat('happiness', 5);
        UI.log(`Llamaste a ${f.name}.`, "good");
        UI.renderSocialTab();
    },

    donateCharity(amount) {
        if (state.money < amount) return UI.log("No tienes suficiente.", "bad");
        this.updateStat('money', -amount);
        // Karma is hidden stat or just mental health?
        this.updateStat('mentalHealth', amount > 500 ? 5 : 1);
        UI.log(`Donaste $${amount}. Te sientes bien.`, "good");
    },

    showLifestyleShop() {
        const btn = document.getElementById('home-trigger');
        if (btn) btn.click();
    },

    // --- PROJECTS SYSTEM ---

    startProject(typeId, name) {
        const existingDev = state.projects.find(p => p.status === 'dev');
        if (existingDev) return UI.showAlert("Proyecto en curso", "Termina tu proyecto actual antes de empezar otro.");

        const type = PROJECT_TYPES.find(t => t.id === typeId);
        if (!type) return;

        state.projects.push({
            id: Date.now().toString(),
            typeId: typeId,
            name: name || type.name,
            loc: 0,
            targetLoc: type.targetLoc || 1000,
            status: 'dev',
            users: 0,
            reviews: 5.0,
            lastWorkedMonth: state.totalMonths,
            income: 0
        });

        UI.showAlert("Proyecto Iniciado", `Has comenzado a desarrollar: ${name}. \nObjetivo: ${type.targetLoc || 1000} Líneas de Código.`);
        UI.render();
        if (UI.renderProjects) UI.renderProjects();
    },

    workOnProject(projectId) {
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;

        const energyCost = 25;
        if (state.energy < energyCost) return UI.showAlert("Agotado", "Necesitas más energía para trabajar en tu proyecto.");

        // Update Last Worked
        project.lastWorkedMonth = state.totalMonths;

        if (project.status === 'dev') {
            // CODING PHASE
            // LOC Gain formula
            let baseLoc = 20 + (state.intelligence * 0.5);
            // Random flux
            let locGain = Math.floor(baseLoc * (0.8 + Math.random() * 0.5));

            project.loc += locGain;
            this.updateStat('energy', -energyCost);
            this.updateStat('stress', 3);
            this.updateStat('intelligence', 0.1); // Coding makes you smarter

            UI.log(`Escribiste ${locGain} líneas de código.`, "action");

            if (project.loc >= project.targetLoc) {
                UI.showAlert("¡Código Completado!", `Has alcanzado las ${project.targetLoc} líneas de código. \n¡El proyecto está listo para lanzarse!`);
            }

        } else if (project.status === 'live') {
            // MAINTENANCE PHASE
            this.updateStat('energy', -energyCost);
            this.updateStat('stress', 2);

            // Improve reviews/minimize churn
            const reviewBoost = 0.2;
            project.reviews = Math.min(5.0, project.reviews + reviewBoost);

            // Fix bugs / small feature
            UI.log("Realizaste mantenimiento y mejoras.", "action");
        }

        UI.render();
        if (UI.renderProjects) UI.renderProjects();
    },

    launchProject(projectId) {
        const project = state.projects.find(p => p.id === projectId);
        if (!project || project.status !== 'dev') return;

        if (project.loc < project.targetLoc) {
            return UI.showAlert("Código Incompleto", `Necesitas ${project.targetLoc} líneas de código. Tienes ${project.loc}.`);
        }

        project.status = 'live';
        project.launchDate = state.totalMonths;
        project.users = 50; // Initial users
        project.reviews = 5.0; // Fresh app feeling
        project.lastWorkedMonth = state.totalMonths;

        UI.showAlert("🚀 ¡Lanzamiento!", `¡${project.name} está en vivo! \nEmpieza con 50 usuarios. \n¡No olvides darle mantenimiento mensual!`);
        UI.log(`Lanzaste ${project.name}.`, "success");
        UI.render();
        if (UI.renderProjects) UI.renderProjects();
    },

    kpiReview() {
        if (!state.corp) return;
        state.corp.monthsSinceReview = 0;

        const perf = state.work_relations.performance;
        let title = "REUNIÓN DE KPI";
        let msg = "";
        let type = "normal";

        if (perf > 85) {
            const bonus = 2000;
            Game.updateStat('money', bonus);
            Game.updateStat('stress', -10);
            state.work_relations.boss += 10;
            title = "¡EXCELENTE DESEMPEÑO! 📈";
            msg = "Tu revisión trimestral fue un éxito absoluto. Recibes un bono de $2,000 y felicitaciones de la gerencia.";
            type = "good";
            AudioSys.playSuccess();
        } else if (perf < 40) {
            // Risk of Firing
            if (Math.random() < 0.4) {
                // Fired
                state.currJobId = 'unemployed';
                state.jobXP = 0;
                title = "DESPEDIDO 📉";
                msg = "Tu rendimiento ha estado por debajo de los estándares corporativos. Has sido desvinculado de la empresa.";
                type = "bad";
                Haptics.error();
            } else {
                // Warning
                Game.updateStat('stress', 20);
                state.work_relations.boss -= 15;
                title = "ADVERTENCIA DE RENDIMIENTO ⚠️";
                msg = "Estás en la cuerda floja. Mejora tus números o serás despedido en la próxima revisión.";
                type = "warning";
                Haptics.warning();
            }
        } else {
            // Average
            Game.updateStat('stress', 5);
            msg = "Tu desempeño es adecuado, pero se espera más iniciativa si quieres ascender.";
        }

        UI.showAlert(title, msg);
        UI.log(`KPI Review: ${msg}`, type);
    },



    processProjects() {
        if (!state.projects) return;

        let totalIncome = 0;

        state.projects.forEach(p => {
            if (p.status === 'live') {
                const type = PROJECT_TYPES.find(t => t.id === p.typeId);

                // 1. Check Maintenance (Neglect)
                const monthsSinceWork = state.totalMonths - p.lastWorkedMonth;
                if (monthsSinceWork > 1) {
                    // Decay
                    p.reviews = Math.max(1.0, p.reviews - 0.5); // Drops fast
                    UI.log(`Reseñas de ${p.name} caen por falta de updates.`, "bad");
                }

                // 2. User Growth / Churn
                // Growth depends on reviews
                let growthRate = 0;
                if (p.reviews >= 4.0) growthRate = 0.10 + (Math.random() * 0.1); // +10-20%
                else if (p.reviews >= 3.0) growthRate = 0.02; // Stagnant
                else growthRate = -0.10; // Churn if bad reviews

                // Apply growth
                p.users = Math.floor(p.users * (1 + growthRate));
                if (p.users < 0) p.users = 0;

                // 3. Income Calc
                // Avg revenue per user (ARPU) - vary by type?
                // Delivery App: High volume, low margin ($0.50 per user/mo?)
                // CRM: Low volume, high margin ($10 per user/mo?)
                let arpu = 0.5;
                if (p.typeId === 'crm_system') arpu = 5.0;

                let income = Math.floor(p.users * arpu);
                p.income = income;
                totalIncome += income;

                // 4. Investor Event Logic
                if (p.users > 5000 && Math.random() < 0.05) { // 5% chance if >5k users
                    const offer = income * 24; // 2 years revenue valuation
                    UI.showEventChoices("💼 Oferta de Inversor",
                        `Un fondo de inversión quiere comprar "${p.name}". \nOferta: $${offer.toLocaleString()}`, [
                        {
                            text: "Vender (Jubilarse de este proyecto)",
                            onClick: () => {
                                Game.updateStat('money', offer);
                                p.status = 'sold';
                                p.income = 0; // No more passive
                                UI.showAlert("¡Vendido!", `Has vendido ${p.name} por $${offer.toLocaleString()}.`);
                                UI.render();
                            }
                        },
                        {
                            text: "Rechazar (Seguir creciendo)",
                            onClick: () => UI.log("Rechazaste la oferta de compra.", "normal")
                        }
                    ]);
                }
            }
        });

        if (totalIncome > 0) {
            this.updateStat('money', totalIncome);
            UI.log(`Proyectos: +$${totalIncome.toLocaleString()} (Pasivo)`, "money");
        }
    }
};

window.Game = Game; // Expose
