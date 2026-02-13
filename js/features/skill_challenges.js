console.log("SkillChallenges Module Loaded");
window.SkillChallenges = {
    timer: null,
    timeLeft: 0,
    currentType: null,
    score: 0,
    targetScore: 0,
    gameData: null, // For intervals like Market or Sport

    // --- CONFIG ---
    TYPES: {
        tech: { title: '🧠 MEMORIA INVERSA', desc: 'Memoriza la secuencia. ¡Repítela al REVÉS!', time: 10 },
        finance: { title: '📉 TIMING DE MERCADO', desc: '¡Compra en la zona VERDE (Precio Bajo)!', time: 10 },
        management: { title: '📋 PRIORIDADES', desc: 'Completa tareas: Primero IMPORTANCIA, luego URGENCIA.', time: 8 },
        // Keeping legacy ones as fallbacks or variants if needed, but per request focusing on these 3
        trade: { title: '📦 LOGÍSTICA', desc: 'Carga el camión. Peso exacto.', time: 20 },
        sport: { title: '⚡ REFLEJOS', desc: '¡Detén el indicador en la zona verde!', time: 10 },
        general: { title: '🧩 LÓGICA', desc: 'Selecciona la opción lógica correcta.', time: 15 }
    },

    // --- DATA (Legacy/General) ---
    DATA: {
        general: [
            { q: "Si A > B y B > C...", opts: ["A > C", "C > A"], ans: 0 },
            { q: "Continúa: 2, 4, 8...", opts: ["12", "16"], ans: 1 },
            { q: "Sinónimo de Efímero", opts: ["Eterno", "Breve"], ans: 1 },
            { q: "Opuesto de Altruista", opts: ["Egoísta", "Solidario"], ans: 0 }
        ]
    },

    // --- TRIGGER ---
    trigger() {
        if (!state.currJobId || state.currJobId === 'unemployed') return;

        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        let type = 'general';
        // Map Careers to New Minigames
        if (['tech', 'science', 'engineering'].includes(job.career)) type = 'tech';
        else if (['finance', 'business', 'corp'].includes(job.career)) type = 'finance'; // Market Hit
        else if (['law', 'politics', 'management'].includes(job.career)) type = 'management'; // Priority
        else if (['trade', 'service', 'transport'].includes(job.career)) type = 'trade';
        else if (['sport', 'medical', 'military'].includes(job.career)) type = 'sport';

        this.start(type);
    },

    // --- START ---
    // --- PROJECT MODE ---
    startProjectRound(phase) {
        if (!state.currJobId || state.currJobId === 'unemployed') return;
        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        // Determine type based on Career (Same mapping)
        let type = 'general';
        if (['tech', 'science', 'engineering'].includes(job.career)) type = 'tech';
        else if (['finance', 'business', 'corp'].includes(job.career)) type = 'finance';
        else if (['law', 'politics', 'management'].includes(job.career)) type = 'management';
        else if (['trade', 'service', 'transport'].includes(job.career)) type = 'trade';
        else if (['sport', 'medical', 'military'].includes(job.career)) type = 'sport';

        this.start(type, true, phase);
    },

    resolveProject() {
        const p = state.activeProject;
        p.active = false;

        let msg = "";
        if (p.wins >= 3) {
            // PROMOTION
            msg = "¡Has completado el Proyecto Anual con éxito ROTUNDO (3/3)!\n\nLa directiva está impresionada.";
            Game.gameLog("¡Ascenso obtenido tras Proyecto Anual!", "good");

            // Trigger Promotion Logic
            if (state.jobXP < 100) state.jobXP = 100;
            Game.applyPerformanceReview(); // This triggers promotion if XP=100

            Game.updateStat('reputation', 50);
            Game.updateStat('money', state.salary * 2); // Big Bonus
            AudioSys.playSuccess();
        } else if (p.losses >= 3) {
            // FIRED
            msg = "El Proyecto Anual ha sido un DESASTRE (0/3).\n\nLa empresa ha entrado en crisis y tú eres el responsable.";
            Game.gameLog("Despedido por negligencia en Proyecto Anual.", "bad");

            Game.quitJob("por incompetencia grave");
            AudioSys.playBad();
        } else {
            // MIXED
            msg = `Proyecto Anual finalizado. Resultado: ${p.wins} Éxitos, ${p.losses} Fallos.\n\nNo hubo consecuencias graves, pero tampoco gloria.`;
            Game.gameLog(`Proyecto Anual: ${p.wins}/${p.losses}`, "normal");
            Game.updateStat('money', state.salary * 0.5); // Small bonus
        }

        UI.showAlert("REPORTE DE PROYECTO", msg);
    },

    // --- START ---
    start(type, isProject = false, phase = 0) {
        this.active = true;
        this.currentType = type;
        this.timeLeft = this.TYPES[type].time;
        this.score = 0;
        this.isProject = isProject;
        this.projectPhase = phase;

        const modal = document.getElementById('event-modal');
        const titleEl = modal.querySelector('.modal-header span');
        const textEl = document.getElementById('event-text');
        const choicesEl = document.getElementById('event-choices');

        if (isProject) {
            titleEl.innerText = `PROYECTO ANUAL: FASE ${phase}/3`;
            titleEl.style.color = '#ffd700'; // Gold
        } else {
            titleEl.innerText = this.TYPES[type].title;
            titleEl.style.color = '#ff5555';
        }

        const desc = isProject ? `[FASE ${phase}] ${this.TYPES[type].desc}` : this.TYPES[type].desc;

        textEl.innerHTML = `
            <div style="text-align:center;">
                <p>${desc}</p>
                <div id="sc-timer" style="font-size:2rem; font-weight:bold; color:#fff; margin:5px 0;">${this.timeLeft}s</div>
                <div id="sc-score" style="display:none; font-size:1rem; color:#aaa;">Puntaje: 0</div>
            </div>
            <div id="sc-game-area" style="background:#222; padding:15px; border-radius:8px; margin-top:10px; min-height:180px; display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative;">
                <!-- Game Content -->
            </div>
        `;

        choicesEl.innerHTML = '';
        modal.classList.add('active');

        this.initGameRound(type);
    },

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                const el = document.getElementById('sc-timer');
                if (el) el.innerText = this.timeLeft + 's';
                if (this.timeLeft <= 0) this.end(false);
            }
        }, 1000);
    },

    // --- GAME LOGIC ---
    // ... (unchanged methods: initGameRound, renderTech, etc.) ...
    initGameRound(type) {
        const area = document.getElementById('sc-game-area');
        if (!area) return;
        area.innerHTML = '';
        if (this.gameData) { clearInterval(this.gameData); this.gameData = null; }

        if (type === 'tech') this.renderTechMemory(area);
        else if (type === 'finance') this.renderFinanceMarket(area);
        else if (type === 'management') this.renderManagementPriority(area);
        else if (type === 'trade') { this.startTimer(); this.renderTrade(area); }
        else if (type === 'sport') { this.startTimer(); this.renderSport(area); }
        else { this.startTimer(); this.renderGeneral(area); }
    },
    // Repeats: renderTechMemory, startTechInput, renderFinanceMarket, handleFinClick, renderManagementPriority, renderTrade, renderSport, renderGeneral, end...
    // Wait, I need to keep the unchanged methods. replace_file_content replaces the BLOCK.
    // I need to be careful not to delete the renderer functions.
    // I will use startLine/endLine carefully or replace the top and bottom separately.
    // Actually, I'll just match the structure in previous view_file output.

    // START: 49, END: 83 is start().
    // We also need to insert startProjectRound and resolveProject before start().

    // Let's do this:
    // 1. Replace start() (lines 50-83) with new start() + new methods above it.
    // 2. Replace end() (lines 331-356) with new end().

    // NO, 'resolveProject' should probably go after 'trigger'.
    // 'start' is at line 50.
    // I will replace `start` function and insert `startProjectRound` and `resolveProject` before it.

    // ... (renderers remain) ...

    // then replace `end`.


    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                const el = document.getElementById('sc-timer');
                if (el) el.innerText = this.timeLeft + 's';
                if (this.timeLeft <= 0) this.end(false);
            }
        }, 1000);
    },

    // --- GAME LOGIC ---
    initGameRound(type) {
        const area = document.getElementById('sc-game-area');
        if (!area) return;
        area.innerHTML = '';
        if (this.gameData) { clearInterval(this.gameData); this.gameData = null; }

        if (type === 'tech') this.renderTechMemory(area);
        else if (type === 'finance') this.renderFinanceMarket(area);
        else if (type === 'management') this.renderManagementPriority(area);
        else if (type === 'trade') { this.startTimer(); this.renderTrade(area); }
        else if (type === 'sport') { this.startTimer(); this.renderSport(area); }
        else { this.startTimer(); this.renderGeneral(area); }
    },

    // 1. TECH: Reverse Memory Sequence
    renderTechMemory(area) {
        this.targetScore = 1; // Just 1 perfect sequence to win

        // Symbols
        const symbols = ['🔴', '🔵', '🟢', '🟡']; // Red, Blue, Green, Yellow
        const sequence = [];
        const length = 4 + Math.floor(state.intelligence / 50); // 4 or 5

        for (let i = 0; i < length; i++) sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);

        // Phase 1: Show
        area.innerHTML = `<div id="sc-seq" style="font-size:3rem; letter-spacing:10px;">${sequence.join('')}</div>
                          <div style="margin-top:20px; color:#aaa;">Memoriza...</div>`;

        // Timer for viewing
        let viewTime = 3;
        const viewTimer = setInterval(() => {
            viewTime--;
            if (viewTime <= 0) {
                clearInterval(viewTimer);
                this.startTechInput(area, sequence);
            }
        }, 1000);
    },

    startTechInput(area, sequence) {
        this.startTimer(); // Timer starts only when input is active
        area.innerHTML = `<div style="color:#fff; margin-bottom:15px;">¡Ingresa al REVÉS!</div>
                          <div id="sc-input-display" style="font-size:2rem; min-height:40px; margin-bottom:15px; border-bottom:1px solid #555;"></div>
                          <div id="sc-keypad" style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px;"></div>`;

        const keypad = area.querySelector('#sc-keypad');
        const display = area.querySelector('#sc-input-display');
        const userSeq = [];
        const correctRev = [...sequence].reverse();

        ['🔴', '🔵', '🟢', '🟡'].forEach(sym => {
            const btn = document.createElement('button');
            btn.innerText = sym;
            btn.className = 'act-btn';
            btn.style.fontSize = '2rem';
            btn.style.padding = '10px';
            btn.onclick = () => {
                userSeq.push(sym);
                display.innerText = userSeq.join(' ');

                // Check immediate failure or completion
                const idx = userSeq.length - 1;
                if (userSeq[idx] !== correctRev[idx]) {
                    UI.log("¡Secuencia incorrecta!", "bad");
                    this.end(false);
                } else if (userSeq.length === correctRev.length) {
                    this.end(true);
                }
            };
            keypad.appendChild(btn);
        });
    },

    // 2. FINANCE: Market Hit (Buy the Dip)
    renderFinanceMarket(area) {
        this.targetScore = 1;
        this.startTimer();

        area.innerHTML = `
            <div style="position:relative; width:100%; height:150px; background:#111; border:1px solid #333; overflow:hidden;">
                <div id="sc-market-zone" style="position:absolute; bottom:10%; left:0; width:100%; height:30%; background:rgba(0,184,148, 0.2); border-top:1px dashed #00b894; border-bottom:1px dashed #00b894;"></div>
                <div style="position:absolute; bottom:15%; right:5px; color:#00b894; font-size:0.8rem;">ZONA COMPRA</div>
                <div id="sc-market-line" style="position:absolute; left:0; bottom:50%; width:100%; height:2px; background:#fff; box-shadow:0 0 5px #fff;"></div>
                <div id="sc-market-val" style="position:absolute; top:5px; left:5px; font-family:monospace; color:#ccc;">$0.00</div>
            </div>
            <button id="sc-buy-btn" class="act-btn" style="margin-top:15px; width:100%; justify-content:center; background:#00b894; font-weight:bold;">¡COMPRAR!</button>
        `;

        const line = area.querySelector('#sc-market-line');
        const valDisp = area.querySelector('#sc-market-val');
        const btn = area.querySelector('#sc-buy-btn');

        let pos = 50; // % from bottom
        let t = 0;

        this.gameData = setInterval(() => {
            t += 0.1;
            // Sine wave + Random noise
            const noise = (Math.random() - 0.5) * 10;
            const wave = Math.sin(t * 2) * 35; // Amplitude
            pos = 50 + wave + noise;

            // Clamp
            pos = Math.max(5, Math.min(95, pos));

            line.style.bottom = `${pos}%`;
            valDisp.innerText = `$${(100 - pos).toFixed(2)}`; // Higher pos = Lower price (inverted visual for "price"? No, usually visuals: Line up = Price up. "Buy Dip" means buy LOW line.)
            // Wait, "Zona Compra" is at BOTTOM -> Buy Low Price.
            // If line is at bottom, pos is low.
        }, 30);

        btn.onclick = () => {
            clearInterval(this.gameData);
            // Check if pos is within 10% and 40% (Zone definition)
            if (pos >= 10 && pos <= 40) {
                this.end(true);
            } else {
                const msg = pos < 10 ? "¡Muy bajo! (Crash)" : "¡Muy caro!";
                UI.log(msg, "bad");
                this.end(false);
            }
        };
    },

    // 3. MANAGEMENT: Priority Sort
    renderManagementPriority(area) {
        this.targetScore = 1;
        this.startTimer();

        // Generate 3 Tasks
        // We need clear correct order.
        // Rule: High Imp > Med Imp. If Imp equal -> High Urg > Low Urg.

        const tasks = [
            { id: 1, imp: 3, urg: 3, label: "🔥 Crisis Servidor" }, // Imp 3 (High)
            { id: 2, imp: 3, urg: 1, label: "📅 Plan Anual" },     // Imp 3
            { id: 3, imp: 2, urg: 3, label: "📧 Email Cliente" },  // Imp 2
            { id: 4, imp: 1, urg: 3, label: "☕ Comprar Café" },   // Imp 1
        ];

        // Select 3 random distinct
        const pool = [...tasks].sort(() => Math.random() - 0.5).slice(0, 3);

        // Determine Correct Order
        // Sort DESC by Imp, then DESC by Urg
        const correctOrder = [...pool].sort((a, b) => {
            if (a.imp !== b.imp) return b.imp - a.imp;
            return b.urg - a.urg;
        });

        area.innerHTML = `
            <div style="color:#aaa; font-size:0.9rem; margin-bottom:10px;">Click en orden: IMPORTANCIA > URGENCIA</div>
            <div id="sc-tasks" style="display:flex; flex-direction:column; gap:8px; width:100%;"></div>
        `;

        const container = area.querySelector('#sc-tasks');
        let currentStep = 0;

        // Render shuffled in UI (already randomized by pool slice, but let's unnecessary shuffle again or use pool order)
        pool.forEach(task => {
            const btn = document.createElement('button');
            const impColor = task.imp === 3 ? 'red' : (task.imp === 2 ? 'orange' : 'green');
            btn.innerHTML = `<span style="color:${impColor}">●</span> ${task.label}`;
            btn.className = 'act-btn';
            btn.style.justifyContent = 'flex-start';

            btn.onclick = () => {
                if (btn.disabled) return;

                // Check if this is the correct next item
                if (task.id === correctOrder[currentStep].id) {
                    // Correct
                    btn.disabled = true;
                    btn.style.opacity = 0.3;
                    btn.innerHTML += ' ✅';
                    currentStep++;
                    if (currentStep === 3) this.end(true);
                } else {
                    // Wrong
                    UI.log("¡Prioridad Incorrecta!", "bad");
                    this.end(false);
                }
            };
            container.appendChild(btn);
        });
    },

    // --- LEGACY MINIGAMES (Simplified) ---
    renderTrade(area) {
        // ... (Keep existing or simplified version if needed, forcing simplified for now to save space/time)
        // Re-implementing basic logic to keep file self-contained
        this.targetScore = 3;
        const target = 30;
        let current = 0;
        area.innerHTML = `<div style="margin-bottom:10px;">Meta: ${target}kg | Actual: <span id="sc-val">0</span>kg</div><div id="sc-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:5px;"></div>`;
        [5, 10, 15, 7, 3].forEach(w => {
            const btn = document.createElement('button'); btn.className = 'act-btn'; btn.innerText = `+${w}kg`;
            btn.onclick = () => {
                current += w;
                area.querySelector('#sc-val').innerText = current;
                if (current === target) { this.score++; if (this.score >= 1) this.end(true); else { current = 0; this.initGameRound('trade'); } }
                else if (current > target) { UI.log("Pasaste el peso", "bad"); current = 0; area.querySelector('#sc-val').innerText = 0; }
            };
            area.querySelector('#sc-grid').appendChild(btn);
        });
    },

    renderSport(area) {
        this.targetScore = 1;
        area.innerHTML = `<div style="position:relative; width:100%; height:30px; background:#333;"><div style="position:absolute; left:40%; width:20%; height:100%; background:#0f0; opacity:0.5;"></div><div id="sc-needle" style="position:absolute; left:0; width:5px; height:100%; background:#fff;"></div></div><button class="act-btn" style="margin-top:10px; width:100%; justify-content:center;" onclick="SkillChallenges.checkSport()">¡YA!</button>`;
        let pos = 0, dir = 2;
        this.gameData = setInterval(() => {
            pos += dir; if (pos > 100 || pos < 0) dir *= -1;
            const el = document.getElementById('sc-needle'); if (el) el.style.left = pos + '%';
        }, 16);
        this.checkSport = () => {
            clearInterval(this.gameData);
            if (pos >= 40 && pos <= 60) this.end(true); else this.end(false);
        };
    },

    renderGeneral(area) {
        const q = this.DATA.general[Math.floor(Math.random() * this.DATA.general.length)];
        area.innerHTML = `<div style="margin-bottom:10px;">${q.q}</div>`;
        q.opts.forEach((o, i) => {
            const btn = document.createElement('button'); btn.className = 'act-btn'; btn.innerText = o;
            btn.onclick = () => i === q.ans ? this.end(true) : this.end(false);
            area.appendChild(btn);
        });
    },

    // --- END ---
    end(win) {
        clearInterval(this.timer);
        if (this.gameData) clearInterval(this.gameData);
        this.active = false;

        const modal = document.getElementById('event-modal');
        modal.classList.remove('active');

        // PROJECT MODE LOGIC
        if (this.isProject) {
            if (win) state.activeProject.wins++;
            else state.activeProject.losses++;

            Game.updateStat('stress', win ? -10 : 10); // Minor stress update per phase

            if (this.projectPhase >= 3) {
                setTimeout(() => this.resolveProject(), 500); // Slight delay for effect
            } else {
                UI.log(`Proyecto Fase ${this.projectPhase}: ${win ? "Éxito" : "Fallo"}`, win ? "good" : "bad");
            }
            return; // Skip standard rewards
        }

        // STANDARD LOGIC
        if (win) {
            const bonus = Math.floor(state.money * 0.10) + 800; // Higher reward for harder games
            Game.updateStat('money', bonus);
            Game.updateStat('stress', -20);
            Game.updateStat('reputation', 10);
            if (!state.sectorReputation) state.sectorReputation = {};
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) {
                state.sectorReputation[job.career] = (state.sectorReputation[job.career] || 0) + 5;
            }

            AudioSys.playSuccess();
            UI.showAlert("¡EXCELENTE!", `Has demostrado gran habilidad.\n\n💰 Bono: $${bonus}\n😌 Estrés: -20\n⭐ Reputación: +10`);
        } else {
            Game.updateStat('stress', 20);
            Game.updateStat('reputation', -5);
            if (state.work_relations) state.work_relations.performance -= 15;

            AudioSys.playBad();
            UI.showAlert("ERROR CRÍTICO", `No lograste el objetivo.\n\n😰 Estrés: +20\n📉 Desempeño: -15\n🔻 Reputación: -5`);
        }
        UI.render();
    }
};
