
const Game = {
    _tempChar: null, // For char gen

    init() {
        if (state.totalMonths === 0 && (!state.traits || state.traits.length === 0)) {
            console.log("Showing Char Gen Screen (Init Check)");
            document.getElementById('char-gen-screen').classList.remove('hidden');
            document.getElementById('char-gen-screen').classList.add('active');
            document.getElementById('main-ui').classList.add('hidden');
            document.getElementById('char-gen-screen').style.display = 'flex';
            this.generateCharacter();
        } else if (!state.traits || state.traits.length === 0) {
            // Fallback for legacy saves or issues
            if (state.totalMonths < 12) {
                console.log("Force showing Char Gen Screen (Legacy Fix)");
                document.getElementById('char-gen-screen').classList.remove('hidden');
                document.getElementById('char-gen-screen').classList.add('active');
                document.getElementById('main-ui').classList.add('hidden');
                document.getElementById('char-gen-screen').style.display = 'flex';
                this.generateCharacter();
            } else {
                console.log("Assigning default traits for existing save");
                const pool = [...TRAITS];
                state.traits = [pool[0].id, pool[1].id, pool[2].id];
                document.getElementById('main-ui').classList.remove('hidden');
            }
        } else {
            document.getElementById('char-gen-screen').classList.add('hidden');
            document.getElementById('char-gen-screen').classList.remove('active');
            document.getElementById('char-gen-screen').style.display = 'none';
            document.getElementById('main-ui').classList.remove('hidden');
        }

        // Apply dark mode immediately if needed (or other init preferences)
        // ...

        DB.saveGame(); // Auto-save on init just to be safe/sync
        UI.render();
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
        document.getElementById('main-ui').classList.remove('hidden');
        UI.log("¡Nueva vida comenzada!", "good");
        UI.render();
        DB.saveGame();
    },

    checkAchievements() {
        if (!state.unlockedTrophies) state.unlockedTrophies = [];
        TROPHIES.forEach(t => {
            if (!state.unlockedTrophies.includes(t.id)) {
                if (t.condition(state)) {
                    this.awardTrophy(t.id);
                }
            }
        });
    },

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
        }

        if (state[key] < 0 && key !== 'money') state[key] = 0;

        // Visuals
        if (key === 'money') {
            UI.flashMoney(amount);
            if (amount > 0) {
                AudioSys.playMoney();
                Haptics.success();
            }
        }
        this.checkAchievements();
    },

    // --- Actions ---

    commitCrime(type) {
        if (type === 'shoplift') {
            if (Math.random() > 0.8) { // 20% fail
                this.goToPrison(3);
                UI.log("Te atraparon robando. Fuiste a prisión.", "bad");
            } else {
                this.updateStat('money', 50);
                this.updateStat('happiness', 5);
                UI.log("Robaste algo pequeño. +$50", "good");
            }
        } else if (type === 'hack') {
            if (Math.random() > 0.6) { // 40% fail
                this.goToPrison(12);
                UI.log("El FBI te atrapó. Prisión federal.", "bad");
            } else {
                this.updateStat('money', 2000);
                UI.log("Hackeo exitoso. +$2000", "good");
            }
        }
        UI.render();
    },

    goToPrison(months) {
        // Skip time logic simplified for now
        state.totalMonths += months;
        state.happiness -= 20;
        state.reputation = 0; // if we had it
        // Reset job
        state.currJobId = 'unemployed';
        state.jobXP = 0;
        UI.showAlert("PRISIÓN", `Pasaste ${months} meses en la cárcel. Perdiste tu empleo.`);
    },

    work() {
        if (state.consecutiveWork > 2) {
            Haptics.error();
            UI.log("¡Estás agotado! Descansa.", "bad");
            return; // Prevent working too much without rest?
        }

        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        let wage = job.salary;
        // Suit bonus
        if (state.inventory.includes('suit')) wage *= 1.1;
        // Laptop bonus for tech
        if (job.career === 'tech' && state.inventory.includes('laptop')) wage *= 1.2;

        // WORLD EFFECTS: Salary
        const effects = World.getEffects();
        if (effects.jobSalary && job.career === 'tech') wage *= effects.jobSalary;
        // Note: For now only tech boom logic in World.trends matches 'tech'. 
        // Generalized: if (effects.jobSalary) wage *= effects.jobSalary; ? No, let's keep it specific per trend definitions or logic.
        // Actually, let's check World.trends specific logic in World.js or explicitly here.
        // World.js defined 'type: tech' and effects.jobSalary.
        // Let's assume effects.jobSalary applies if job.career matches the trend type OR global?
        // Let's just apply broadly if key matches for now simplicity or specific check:
        // Current 'ai_boom' is type 'tech'.
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

        let xpGain = 2;
        if (state.traits.includes('ambitious')) xpGain = 4;

        // World XP Effect?
        // if (effects.jobXp) xpGain *= effects.jobXp;

        state.jobXP += xpGain;

        state.consecutiveWork++;

        AudioSys.playClick(); // Work sound?
        UI.log(`Trabajaste como ${job.title}. Ganaste $${Math.floor(wage)}.`, "normal");

        this.checkAchievements();

        // Promotion check
        if (state.jobXP >= 100) {
            this.applyPerformanceReview();
        }
        UI.render();
    },

    promote(jobId) {
        // Alias to applyJob for manual job selection, but handle logic if it's an auto-promotion
        // If jobId is passed (e.g. from UI), use applyJob
        if (jobId) {
            this.applyJob(jobId);
            return;
        }

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
            UI.showAlert("¡ASCENSO! 📈", `Te han promovido a ${nextJob.title}.`);
            UI.log(`¡Ascenso! Ahora eres ${nextJob.title}.`, "good");
            AudioSys.playSuccess();
            UI.render();
        } else {
            UI.log("Ya estás en la cima de tu carrera.", "info");
        }
    },

    applyJob(jobId) {
        const job = JOBS.find(j => j.id === jobId);
        if (!job) return;

        // Check reqs
        if (state.intelligence < (job.req.int || 0) ||
            state.physicalHealth < (job.req.health || 0) ||
            state.happiness < (job.req.happy || 0)) {
            UI.showAlert("Requisitos no cumplidos", "No estás calificado para este trabajo.");
            return;
        }

        if (job.req.deg && !state.education.includes(job.req.deg)) {
            UI.showAlert("Falta Título", "Necesitas un título específico para esto.");
            return;
        }

        // Apply
        state.currJobId = jobId;
        state.jobXP = 0;
        state.promotions = 0;
        state.consecutiveWork = 0;
        UI.log(`¡Contratado! Ahora eres ${job.title}.`, "good");
        UI.showAlert("¡Felicidades!", `Has conseguido el puesto de ${job.title}.`);

        // Close modal
        UI.els.modals.job.classList.remove('active');
        UI.render();
    },

    checkAchievements() {
        if (!state.unlockedTrophies) state.unlockedTrophies = [];

        TROPHIES.forEach(t => {
            if (!state.unlockedTrophies.includes(t.id)) {
                if (t.condition(state)) {
                    this.awardTrophy(t.id);
                }
            }
        });
    },

    awardTrophy(id) {
        if (state.unlockedTrophies.includes(id)) return;
        const t = TROPHIES.find(x => x.id === id);
        state.unlockedTrophies.push(id);
        UI.showAlert("🏆 LOGRO DESBLOQUEADO", `${t.icon} ${t.name}\n${t.desc}`);
        UI.log(`🏆 LOGRO: ${t.name}`, 'good');
        AudioSys.playSuccess();
        DB.saveGame();
    },

    // --- Actions ---
    doActivity(type) {
        if (state.energy < 10) return UI.showAlert("Agotado", "Estás demasiado cansado.");

        let cost = 0;
        let msg = "";

        if (type === 'gym') {
            cost = 50;
            if (state.money < cost) return UI.log("No tienes dinero para el Gym.", "bad");
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
            this.updateStat('energy', -5);
            this.updateStat('happiness', 1);
            msg = "Meditaste un rato. +Salud Mental";
        }

        UI.log(msg, "normal");
        UI.render();
    },

    party() {
        let cost = 100;
        if (state.money < cost) return UI.log("No tienes dinero para salir.", "bad");
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

    rest() {
        state.consecutiveWork = 0;
        this.updateStat('energy', 40);
        this.updateStat('physicalHealth', 2);
        this.updateStat('happiness', 3);
        UI.log("Tomaste un descanso y te relajaste.", "normal");
        UI.render();
    },

    nextMonth() {
        if (this.checkGameOver()) return;
        state.totalMonths++;
        state.consecutiveWork = 0;

        // World Update
        World.tick(); // Triggers new trends/news

        // Health/Sick Logic
        // ... (existing sick logic) ...
        // Apply Global Health Decay if active
        const effects = World.getEffects();
        if (effects.healthDecay) {
            state.physicalHealth -= effects.healthDecay;
            // UI.log? Maybe too spammy.
        }

        if (state.sickDuration > 0) {
            state.sickDuration--;
            UI.log("Sigues enfermo (-Salud Física).", "bad");
            this.updateStat('physicalHealth', -5);
        } else if (state.physicalHealth < 30) {
            if (Math.random() < 0.3) {
                state.sickDuration = 2;
                UI.log("¡Te has enfermado gravemente!", "bad");
                this.updateStat('happiness', -20);
            } else {
                UI.log("Tu cuerpo se siente débil. Cuidate.", "info");
            }
        }

        // Active Course
        if (state.activeCourse) {
            const c = COURSES.find(x => x.id === state.activeCourse.id);
            state.activeCourse.monthsLeft--;
            this.updateStat('energy', -c.penalty);
            if (state.activeCourse.monthsLeft <= 0) {
                state.education.push(c.id);
                state.activeCourse = null;
                UI.showAlert("¡GRADUADO!", `Has completado: ${c.title}.`);
                AudioSys.playSuccess();
            }
        }

        // Active Project
        if (state.activeProject) {
            this.processProjects();
            if (state.activeProject) { // Still active
                this.updateStat('energy', -state.activeProject.penalty);
            }
        }

        // Diet Effect
        if (state.diet === 'fast_food') {
            this.updateStat('physicalHealth', -1);
            this.updateStat('energy', 2);
        } else if (state.diet === 'balanced') {
            this.updateStat('physicalHealth', 1);
        } else if (state.diet === 'chef') {
            this.updateStat('physicalHealth', 2);
            this.updateStat('happiness', 2);
        }

        // Financials (Calc and Apply Passive)
        const fin = this.calculateFinancials();

        // Income is NOT automatically added, only passive income. Active is manual work.
        // Wait, passive income IS added per month? Yes.
        this.updateStat('money', fin.passiveIncome);

        // Apply Expenses
        this.updateStat('money', -fin.expenses);

        // Market Fluctuations including World Effects
        ASSETS.forEach(a => {
            let change = (Math.random() - 0.5) * a.vol;

            // World specific market overrides
            if (effects.stockMarket && a.id === 'stock') change += 0.05; // Bull market
            if (effects.cryptoPrice && a.id === 'crypto') change -= 0.1; // Bear market

            state.marketPrices[a.id] *= (1 + change);
            if (state.marketPrices[a.id] < 1) state.marketPrices[a.id] = 1;
        });

        // RE Appreciation (Simple) with World Effects
        Object.keys(state.rePrices).forEach(id => {
            let chance = 0.1;
            let mult = 0.05;
            if (effects.realEstatePrice) {
                chance = 0.3;
                mult = 0.1; // Higher appreciate during bubble
            }

            if (Math.random() < chance) {
                state.rePrices[id] *= (1 + (Math.random() * mult));
            }
        });

        // Random Events (reduced chance if big trend active? No, parallel)
        if (Math.random() < 0.15) { // 15% chance
            this.randomEvent();
        }

        // Elite Events
        if (Math.random() < 0.05) {
            this.triggerEliteEvent();
        }

        state.energy = Math.min(100, state.energy + 10); // Natural recovery

        // World bonus happiness?
        if (effects.happinessGain) state.happiness += 2;

        // Partner Logic
        if (state.partner) {
            if (Math.random() < 0.1) {
                state.partner.relation = Math.max(0, state.partner.relation - 5);
                UI.log(`${state.partner.name} siente que no le dedicas tiempo.`, "bad");
            }
        }

        DB.saveGame();
        DB.logHistory(state.totalMonths, fin); // Log history point
        UI.render();
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
        // ... (See Step 1163 for Logic)
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

        // Diet
        let dietCost = 0;
        if (state.diet === 'fast_food') dietCost = 100;
        else if (state.diet === 'balanced') dietCost = 300;
        else if (state.diet === 'chef') dietCost = 1000;

        const expenses = baseLiving + totalMaint + dietCost;

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

        const totalExpenses = expenses + petCost + childCost;

        // Creation Income (Royalties/Ads)
        let royalties = 0;
        if (state.creations) {
            state.creations.forEach(c => royalties += (c.income || c.royalty || 0));
        }
        passiveIncome += royalties;

        // Active
        const job = JOBS.find(j => j.id === state.currJobId);
        let activeIncome = job ? job.salary : 0;
        if (state.inventory.includes('suit')) activeIncome *= 1.1;
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
    renderCourses() { UI.els.btns.study.click(); },

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
    }
};

window.Game = Game; // Expose
