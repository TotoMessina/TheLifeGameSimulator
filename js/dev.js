
const DevMode = {
    active: false,
    isAuthenticated: false,
    konami: ['d', 'e', 'v'],
    konamiIndex: 0,
    longPressTimer: null,

    init() {
        // checks
        if (sessionStorage.getItem('devModeAuth') === 'true') {
            this.isAuthenticated = true;
        }

        // Keyboard sequence
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Long press on money
        const moneyEl = document.getElementById('money-display');
        if (moneyEl) {
            moneyEl.addEventListener('mousedown', () => {
                this.longPressTimer = setTimeout(() => this.activate(), 2000);
            });
            moneyEl.addEventListener('mouseup', () => clearTimeout(this.longPressTimer));
            moneyEl.addEventListener('mouseleave', () => clearTimeout(this.longPressTimer));
            moneyEl.addEventListener('touchstart', () => {
                this.longPressTimer = setTimeout(() => this.activate(), 2000);
            });
            moneyEl.addEventListener('touchend', () => clearTimeout(this.longPressTimer));
        }

        this.injectStyles();
    },

    handleKeyPress(e) {
        if (e.key === this.konami[this.konamiIndex]) {
            this.konamiIndex++;
            if (this.konamiIndex === this.konami.length) {
                this.activate();
                this.konamiIndex = 0;
            }
        } else {
            this.konamiIndex = 0;
        }
    },

    activate() {
        if (this.isAuthenticated) {
            this.showPanel();
        } else {
            this.showAuthPrompt();
        }
    },

    showAuthPrompt() {
        const pass = prompt("🔧 Developer Code:");
        if (pass === '777') {
            this.isAuthenticated = true;
            sessionStorage.setItem('devModeAuth', 'true');
            UI.log("God Mode Enabled", "good");
            this.showPanel();
        } else if (pass !== null) {
            alert("Acceso Denegado");
        }
    },

    showPanel() {
        if (this.active) return;
        this.active = true;

        const panel = document.createElement('div');
        panel.id = 'dev-panel';

        // Build Selectors
        let trendOpts = '<option value="">-- Start Trend --</option>';
        if (typeof World !== 'undefined' && World.trends) {
            trendOpts += World.trends.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        }

        let jobOpts = '<option value="">-- Set Job --</option>';
        if (typeof JOBS !== 'undefined') {
            jobOpts += JOBS.map(j => `<option value="${j.id}">${j.title} ($${j.salary})</option>`).join('');
        }

        let houseOpts = '<option value="">-- Set Housing --</option>';
        if (typeof HOUSING !== 'undefined') {
            houseOpts += HOUSING.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
        }

        let carOpts = '<option value="">-- Set Vehicle --</option>';
        if (typeof VEHICLES !== 'undefined') {
            carOpts += VEHICLES.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
        }

        // Traits Checkboxes
        let traitList = '';
        if (typeof TRAITS !== 'undefined') {
            traitList = TRAITS.map(t => {
                const checked = state.traits.includes(t.id) ? 'checked' : '';
                return `<label class="dev-checkbox"><input type="checkbox" onchange="DevMode.toggleTrait('${t.id}')" ${checked}> ${t.name}</label>`;
            }).join('');
        }

        panel.innerHTML = `
            <div class="dev-header">
                <h3>⚡ GOD MODE</h3>
                <button onclick="DevMode.close()" class="close-btn">X</button>
            </div>

            <div class="dev-content-scroll">
                <!-- Time & World -->
                <div class="dev-section">
                    <h4>⏳ Time & World</h4>
                    <div class="btn-group">
                        <button onclick="DevMode.addTime(1)">+1 M</button>
                        <button onclick="DevMode.addTime(12)">+1 Y</button>
                        <button onclick="DevMode.addTime(60)">+5 Y</button>
                    </div>
                    <select onchange="DevMode.forceTrend(this.value)" style="margin-top:5px">${trendOpts}</select>
                    <button onclick="DevMode.forceOpp()" style="margin-top:5px; width:100%">Spawn Opportunity</button>
                </div>

                <!-- Stats -->
                <div class="dev-section">
                    <h4>📊 Stats Control</h4>
                    <div class="stat-slider">
                        <label>Health: <span id="dev-val-health">${state.physicalHealth}</span></label>
                        <input type="range" min="0" max="100" value="${state.physicalHealth}" oninput="DevMode.setStat('physicalHealth', this.value)">
                    </div>
                    <div class="stat-slider">
                        <label>Happiness: <span id="dev-val-happy">${state.happiness}</span></label>
                        <input type="range" min="0" max="100" value="${state.happiness}" oninput="DevMode.setStat('happiness', this.value)">
                    </div>
                    <div class="stat-slider">
                        <label>Smarts: <span id="dev-val-intel">${state.intelligence}</span></label>
                        <input type="range" min="0" max="100" value="${state.intelligence}" oninput="DevMode.setStat('intelligence', this.value)">
                    </div>
                     <div class="stat-slider">
                        <label>Energy: <span id="dev-val-energy">${state.energy}</span></label>
                        <input type="range" min="0" max="100" value="${state.energy}" oninput="DevMode.setStat('energy', this.value)">
                    </div>
                    <div class="btn-group" style="margin-top:5px">
                        <button onclick="DevMode.addMoney(10000)">+$10k</button>
                        <button onclick="DevMode.addMoney(1000000)">+$1M</button>
                    </div>
                </div>

                <!-- Career & Assets -->
                <div class="dev-section">
                    <h4>💼 Career & Assets</h4>
                    <select onchange="DevMode.forceJob(this.value)">${jobOpts}</select>
                    <select onchange="DevMode.giveAsset('housing', this.value)" style="margin-top:5px">${houseOpts}</select>
                    <select onchange="DevMode.giveAsset('vehicle', this.value)" style="margin-top:5px">${carOpts}</select>
                </div>

                <!-- Traits -->
                <div class="dev-section">
                    <h4>🧬 Traits</h4>
                    <div class="trait-grid">${traitList}</div>
                </div>

                <!-- Relationships -->
                <div class="dev-section">
                    <h4>❤️ Relationships</h4>
                    <div class="btn-group">
                        <button onclick="DevMode.forcePartner()">Force Partner</button>
                        <button onclick="DevMode.maxRelation()">Max Love</button>
                    </div>
                </div>

                 <div class="dev-section">
                    <button onclick="DevMode.unlockAll()">🏆 Unlock All Trophies</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    },

    close() {
        const panel = document.getElementById('dev-panel');
        if (panel) panel.remove();
        this.active = false;
    },

    // --- Actions ---

    addTime(months) {
        for (let i = 0; i < months; i++) Game.nextMonth();
        UI.log(`[DEV] Skipped ${months} months.`, 'info');
    },

    forceTrend(id) {
        if (!id || !window.World) return;
        const t = World.trends.find(x => x.id === id);
        if (t) {
            state.world.currentTrend = { id: t.id, monthsLeft: t.duration };
            UI.renderNews(t.headline, t.type, t.desc);
            UI.log(`[DEV] Trend Forced: ${t.name}`, 'info');
        }
    },

    forceOpp() { if (window.World) World.spawnOpp(); },

    setStat(key, val) {
        state[key] = parseInt(val);
        document.getElementById(`dev-val-${key === 'physicalHealth' ? 'health' : (key === 'intelligence' ? 'intel' : key)}`).innerText = val;
        UI.render();
    },

    addMoney(amount) {
        state.money += amount;
        UI.render();
    },

    forceJob(id) {
        if (!id) return;
        state.currJobId = id;
        state.jobXP = 0;
        const job = JOBS.find(j => j.id === id);
        UI.showAlert("GOD MODE", `Job Set to: ${job.title}`);
        UI.render();
    },

    giveAsset(type, id) {
        if (!id) return;
        if (type === 'housing') state.housing = id;
        if (type === 'vehicle') state.vehicle = id;
        UI.log(`[DEV] Set ${type} to ${id}`, 'good');
        UI.render();
    },

    toggleTrait(id) {
        if (state.traits.includes(id)) {
            state.traits = state.traits.filter(t => t !== id);
            UI.log(`[DEV] Trait Removed: ${id}`, 'info');
        } else {
            state.traits.push(id);
            UI.log(`[DEV] Trait Added: ${id}`, 'good');
        }
    },

    forcePartner() {
        state.partner = {
            name: "Dev Soulmate",
            salary: 5000,
            relation: 100,
            status: 'married',
            jobTitle: 'Model'
        };
        UI.log("[DEV] Partner Created.", 'good');
        UI.render();
    },

    maxRelation() {
        if (state.partner) {
            state.partner.relation = 100;
            UI.log("[DEV] Partner Love Maxed.", 'good');
            UI.render();
        } else {
            alert("No partner!");
        }
    },

    unlockAll() {
        TROPHIES.forEach(t => {
            if (!state.unlockedTrophies.includes(t.id)) state.unlockedTrophies.push(t.id);
        });
        UI.log("[DEV] Trophies Unlocked", 'good');
        DB.saveGame();
    },

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            #dev-panel {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 340px; max-height: 85vh;
                background: rgba(10, 10, 10, 0.98);
                border: 2px solid #00ffcc; color: #fff;
                z-index: 10000; font-family: monospace;
                box-shadow: 0 0 40px rgba(0, 255, 204, 0.2);
                border-radius: 12px; display: flex; flex-direction: column;
            }
            .dev-header { padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; background: #111; border-radius: 12px 12px 0 0; }
            #dev-panel h3 { margin: 0; color: #00ffcc; font-size: 1.2rem; }
            .dev-content-scroll { overflow-y: auto; padding: 15px; flex: 1; }
            .dev-section { margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 10px; }
            .dev-section h4 { margin: 0 0 10px 0; color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }

            #dev-panel button {
                background: #222; color: #eee; border: 1px solid #444;
                padding: 8px; cursor: pointer; border-radius: 6px; font-size: 0.85rem; transition: 0.2s;
            }
            #dev-panel button:hover { background: #333; border-color: #00ffcc; color: #fff; }
            #dev-panel select, #dev-panel input[type="range"] { width: 100%; background: #1a1a1a; color: #fff; border: 1px solid #333; padding: 6px; border-radius: 4px; margin-bottom: 5px; }

            .btn-group { display: flex; gap: 8px; margin-bottom: 5px; }
            .btn-group button { flex: 1; }

            .stat-slider { display: flex; flex-direction: column; margin-bottom: 8px; }
            .stat-slider label { font-size: 0.8rem; color: #ccc; display: flex; justify-content: space-between; }

            .trait-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
            .dev-checkbox { font-size: 0.75rem; display: flex; align-items: center; gap: 5px; cursor: pointer; }

            .close-btn { background: #ff3333 !important; border-color: #cc0000 !important; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; padding: 0 !important; }
        `;
        document.head.appendChild(style);
    }
};
