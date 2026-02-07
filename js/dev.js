
const DevMode = {
    active: false,
    isAuthenticated: false,
    konami: ['d', 'e', 'v'],
    konamiIndex: 0,
    currentTab: 'general',
    longPressTimer: null,

    init() {
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

        // Expose to window for console access
        window.DevMode = this;
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
        panel.innerHTML = `
            <div class="dev-header">
                <h3>⚡ GOD MODE 2.0</h3>
                <button id="dev-close-btn" class="close-btn">X</button>
            </div>
            
            <div class="dev-tabs">
                <button class="tab-btn active" data-tab="general">General</button>
                <button class="tab-btn" data-tab="economy">Economy</button>
                <button class="tab-btn" data-tab="career">Career</button>
                <button class="tab-btn" data-tab="assets">Assets</button>
                <button class="tab-btn" data-tab="world">World</button>
            </div>

            <div class="dev-content-scroll" id="dev-content">
                ${this.renderGeneralTab()}
            </div>
        `;
        document.body.appendChild(panel);

        // Attach Events
        document.getElementById('dev-close-btn').addEventListener('click', () => this.close());

        panel.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab'); // Use currentTarget
                this.switchTab(tab);
            });
        });

        // Make draggable
        this.makeDraggable(panel);
    },

    switchTab(tab) {
        this.currentTab = tab;
        const content = document.getElementById('dev-content');
        if (!content) return;

        // Update tab buttons
        document.querySelectorAll('#dev-panel .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`#dev-panel .tab-btn[data-tab="${tab}"]`)?.classList.add('active');

        // Render content
        try {
            switch (tab) {
                case 'general': content.innerHTML = this.renderGeneralTab(); break;
                case 'economy': content.innerHTML = this.renderEconomyTab(); break;
                case 'career': content.innerHTML = this.renderCareerTab(); break;
                case 'assets': content.innerHTML = this.renderAssetsTab(); break;
                case 'world': content.innerHTML = this.renderWorldTab(); break;
            }
        } catch (err) {
            console.error(err);
            content.innerHTML = `<div style="color:red; padding:20px;">Error rendering tab: ${err.message}</div>`;
        }
    },

    renderGeneralTab() {
        // Safety checks
        const traits = state.traits || [];

        return `
            <div class="dev-section">
                <h4>📊 Player Stats</h4>
                ${this.renderSlider('Health', 'physicalHealth', state.physicalHealth || 50, 0, 100)}
                ${this.renderSlider('Happiness', 'happiness', state.happiness || 50, 0, 100)}
                ${this.renderSlider('Intelligence', 'intelligence', state.intelligence || 10, 0, 100)}
                ${this.renderSlider('Energy', 'energy', state.energy || 100, 0, 100)}
                ${this.renderSlider('Stress', 'stress', state.stress || 0, 0, 100)}
            </div>
            <div class="dev-section">
                <h4>💰 Quick Money</h4>
                <div class="btn-group">
                    <button onclick="DevMode.addMoney(1000)">+$1k</button>
                    <button onclick="DevMode.addMoney(10000)">+$10k</button>
                    <button onclick="DevMode.addMoney(1000000)">+$1M</button>
                    <button onclick="DevMode.addMoney(-5000)">-$5k</button>
                </div>
            </div>
             <div class="dev-section">
                <h4>🧬 Traits</h4>
                <div class="trait-grid">
                    ${typeof TRAITS !== 'undefined' ? TRAITS.map(t => `
                        <label class="dev-checkbox">
                            <input type="checkbox" onchange="DevMode.toggleTrait('${t.id}')" ${traits.includes(t.id) ? 'checked' : ''}> 
                            ${t.name}
                        </label>
                    `).join('') : '<p style="color:#666">No Traits Loaded</p>'}
                </div>
            </div>
             <div class="dev-section">
                <button onclick="DevMode.unlockAll()" style="width:100%; background:#ffd700; color:#000;">🏆 Unlock All Trophies</button>
            </div>
        `;
    },

    renderEconomyTab() {
        const econState = state.world?.economicState || 'stable';
        const inflation = state.world?.inflation || 1.0;

        return `
            <div class="dev-section">
                <h4>🌍 Economic State</h4>
                <div class="btn-group-wrap">
                    <button onclick="DevMode.setEconState('boom')" class="${econState === 'boom' ? 'active-state' : ''}">📈 Boom</button>
                    <button onclick="DevMode.setEconState('stable')" class="${econState === 'stable' ? 'active-state' : ''}">⚖️ Stable</button>
                    <button onclick="DevMode.setEconState('recession')" class="${econState === 'recession' ? 'active-state' : ''}">📉 Recession</button>
                    <button onclick="DevMode.setEconState('depression')" class="${econState === 'depression' ? 'active-state' : ''}">⚠️ Depression</button>
                    <button onclick="DevMode.setEconState('hyperinflation')" class="${econState === 'hyperinflation' ? 'active-state' : ''}">💸 Hyper</button>
                </div>
            </div>
            <div class="dev-section">
                <h4>📈 Inflation Multiplier</h4>
                ${this.renderSlider('Inflation x', 'inflation', inflation, 0.5, 5.0, 0.1, true)}
                <button onclick="DevMode.resetInflation()" style="margin-top:5px; width:100%">Reset Inflation</button>
            </div>
             <div class="dev-section">
                <h4>🔥 Financial Triggers</h4>
                <button onclick="DevMode.triggerEvent('firing')" style="width:100%; margin-bottom:5px; color:#ff5555; border-color:#ff5555">🔥 Force Firing (Test Layoff)</button>
                <button onclick="DevMode.triggerEvent('aguinaldo')" style="width:100%; color:#4dffea; border-color:#4dffea">💰 Force Aguinaldo</button>
            </div>
        `;
    },

    renderCareerTab() {
        const jobs = typeof JOBS !== 'undefined' ? JOBS : [];
        const jobOpts = jobs.map(j => `<option value="${j.id}" ${state.currJobId === j.id ? 'selected' : ''}>${j.title} ($${j.salary})</option>`).join('');

        return `
            <div class="dev-section">
                <h4>💼 Current Job</h4>
                <select onchange="DevMode.forceJob(this.value)">
                    <option value="unemployed">Unemployed</option>
                    ${jobOpts}
                </select>
            </div>
            <div class="dev-section">
                <h4>📈 Job Stats</h4>
                ${this.renderSlider('Job XP', 'jobXP', state.jobXP || 0, 0, 500)}
                ${this.renderSlider('Performance', 'performance', state.work_relations?.performance || 50, 0, 100)}
                ${this.renderSlider('Boss Relation', 'boss', state.work_relations?.boss || 50, 0, 100)}
                 ${this.renderSlider('Colleagues', 'colleagues', state.work_relations?.colleagues || 50, 0, 100)}
            </div>
            <div class="dev-section">
                <h4>🎓 Career XP</h4>
                ${Object.keys(state.careerExperience || {}).map(k =>
            this.renderSlider(k.charAt(0).toUpperCase() + k.slice(1), `career_${k}`, state.careerExperience[k], 0, 240)
        ).join('')}
            </div>
            <div class="dev-section">
                 <button onclick="DevMode.forcePromotion()" style="width:100%; margin-bottom:5px; background:#4dffea; color:#000;">🚀 Force Promotion Check</button>
            </div>
        `;
    },

    renderAssetsTab() {
        const houses = typeof HOUSING !== 'undefined' ? HOUSING : [];
        const vehicles = typeof VEHICLES !== 'undefined' ? VEHICLES : [];
        const realEstate = state.realEstate || [];

        return `
            <div class="dev-section">
                <h4>🏠 Real Estate</h4>
                <select onchange="DevMode.giveAsset('housing', this.value)">
                    <option value="">-- Set Active Housing --</option>
                    ${houses.map(h => `<option value="${h.id}" ${state.housing === h.id ? 'selected' : ''}>${h.name}</option>`).join('')}
                </select>
                 <div style="margin-top:5px; font-size:0.8rem; color:#aaa">Owned: ${realEstate.join(', ')}</div>
            </div>
             <div class="dev-section">
                <h4>🚗 Vehicles</h4>
                <select onchange="DevMode.giveAsset('vehicle', this.value)">
                    <option value="">-- Set Active vehicle --</option>
                    ${vehicles.map(v => `<option value="${v.id}" ${state.vehicle === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                </select>
            </div>
            <div class="dev-section">
                <h4>📉 Investments</h4>
                <div class="btn-group">
                    <button onclick="DevMode.addAsset('stock', 10)">+10 Stocks</button>
                    <button onclick="DevMode.addAsset('crypto', 1)">+1 BTC</button>
                    <button onclick="DevMode.addAsset('gold', 5)">+5 Gold</button>
                </div>
            </div>
        `;
    },

    renderWorldTab() {
        const trends = typeof World !== 'undefined' ? World.trends : [];

        return `
            <div class="dev-section">
                <h4>⏳ Time Travel</h4>
                <div class="btn-group">
                    <button onclick="DevMode.addTime(1)">+1 Month</button>
                    <button onclick="DevMode.addTime(12)">+1 Year</button>
                    <button onclick="DevMode.addTime(60)">+5 Years</button>
                </div>
            </div>
            <div class="dev-section">
                <h4>📰 Force Trend</h4>
                <select onchange="DevMode.forceTrend(this.value)">
                    <option value="">-- Start Trend --</option>
                    ${trends.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
            </div>
            <div class="dev-section">
                <h4>⚡ Events</h4>
                <button onclick="DevMode.forceOpp()" style="width:100%; margin-bottom:5px">Spawn Opportunity</button>
                <button onclick="DevMode.triggerDisruption()" style="width:100%; color:#ff5555; border-color:#ff5555">⚠️ Trigger Disruption</button>
            </div>
        `;
    },

    // --- Components ---

    renderSlider(label, key, val, min, max, step = 1, isFloat = false) {
        // Special handling for nested keys like 'career_tech' or 'performance'
        const fn = key.startsWith('career_') ? `DevMode.setCareerXP('${key.split('_')[1]}', this.value)` :
            (key === 'inflation' ? `DevMode.setInflation(this.value)` :
                (key === 'performance' || key === 'boss' || key === 'colleagues' ? `DevMode.setJobStat('${key}', this.value)` :
                    `DevMode.setStat('${key}', this.value)`));

        return `
            <div class="stat-slider">
                <label>${label}: <span id="dev-val-${key}">${isFloat ? parseFloat(val).toFixed(2) : Math.floor(val)}</span></label>
                <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" oninput="${fn}">
            </div>
        `;
    },

    // --- Actions ---

    close() {
        const panel = document.getElementById('dev-panel');
        if (panel) panel.remove();
        this.active = false;
    },

    addTime(months) {
        for (let i = 0; i < months; i++) Game.nextMonth();
        UI.log(`[DEV] Skipped ${months} months.`, 'info');
    },

    setStat(key, val) {
        state[key] = parseInt(val);
        const el = document.getElementById(`dev-val-${key}`);
        if (el) el.innerText = val;
        UI.render();
    },

    setJobStat(key, val) {
        if (!state.work_relations) state.work_relations = { performance: 50, boss: 50, colleagues: 50 };
        state.work_relations[key] = parseInt(val);
        const el = document.getElementById(`dev-val-${key}`);
        if (el) el.innerText = val;

        // Also update state variable if it exists (for backward compatibility or simpler access)
        if (key === 'jobXP') state.jobXP = parseInt(val);

        UI.render();
    },

    setCareerXP(career, val) {
        if (!state.careerExperience) state.careerExperience = {};
        state.careerExperience[career] = parseInt(val);
        const el = document.getElementById(`dev-val-career_${career}`);
        if (el) el.innerText = val;
    },

    setEconState(id) {
        if (!state.world) state.world = { economicState: 'stable', inflation: 1.0 }; // Force init
        state.world.economicState = id;
        state.world.econTimer = 24; // Reset timer
        World.updateEconomy(); // Update multipliers
        UI.render();
        this.switchTab('economy'); // Re-render tab to show active state
        UI.log(`[DEV] Economy set to ${id}`, 'warning');
    },

    setInflation(val) {
        if (!state.world) state.world = { economicState: 'stable', inflation: 1.0 }; // Force init
        state.world.inflation = parseFloat(val);
        const el = document.getElementById('dev-val-inflation');
        if (el) el.innerText = state.world.inflation.toFixed(2);
    },

    resetInflation() {
        this.setInflation(1.0);
        UI.render();
    },

    addMoney(amount) {
        state.money += amount;
        UI.render();
    },

    forceJob(id) {
        if (id === 'unemployed') {
            state.currJobId = 'unemployed';
            state.jobXP = 0;
            UI.log("[DEV] Set to Unemployed", 'info');
        } else {
            state.currJobId = id;
            state.jobXP = 0; // Reset XP new job
            const job = JOBS.find(j => j.id === id);
            UI.log(`[DEV] Job Set to: ${job.title}`, 'good');
        }
        UI.render();
    },

    forcePromotion() {
        if (typeof JobSystem !== 'undefined' && JobSystem.checkPromotion) {
            JobSystem.checkPromotion(true); // Assuming checkPromotion handles logic
            UI.log("[DEV] Promotion Check Triggered", 'info');
        } else {
            UI.log("[DEV] JobSystem not found", 'bad');
        }
    },

    giveAsset(type, id) {
        if (type === 'housing') {
            state.housing = id;
            if (!state.realEstate) state.realEstate = [];
            if (id && !state.realEstate.includes(id)) state.realEstate.push(id);
        }
        if (type === 'vehicle') state.vehicle = id;
        UI.log(`[DEV] Set ${type} to ${id}`, 'good');
        UI.render();
    },

    addAsset(type, qty) {
        if (!state.portfolio) state.portfolio = {};
        if (!state.portfolio[type]) state.portfolio[type] = { qty: 0, avg: 0 };
        state.portfolio[type].qty += qty;
        UI.log(`[DEV] Added ${qty} ${type}`, 'good');
        UI.render();
    },

    forceTrend(id) {
        if (!id || !window.World) return;
        const t = World.trends.find(x => x.id === id);
        if (t) {
            if (!state.world) state.world = {};
            state.world.currentTrend = { id: t.id, monthsLeft: t.duration };
            UI.renderNews(t.headline, t.type, t.desc);
            UI.log(`[DEV] Trend Forced: ${t.name}`, 'info');
        }
    },

    forceOpp() { if (window.World) World.spawnOpp(); },

    triggerDisruption() { if (window.World) World.triggerDisruption(); },

    triggerEvent(type) {
        if (type === 'firing') {
            if (window.FinanceManager) FinanceManager.checkFiring();
            else {
                // Fallback if checkedFiring relies on random chance, force it here
                UI.log("Forcing 100% Layoff Chance...", "bad");
                Game.loseJob("DEV ORDER: You're fired!");
            }
        } else if (type === 'aguinaldo') {
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) {
                const bonus = Math.floor(job.salary * 0.5);
                state.money += bonus;
                UI.showAlert("DEV AGUINALDO", `+$${bonus}`);
            } else {
                UI.log("No job for aguinaldo", "bad");
            }
            UI.render();
        }
    },

    toggleTrait(id) {
        if (!state.traits) state.traits = [];
        if (state.traits.includes(id)) {
            state.traits = state.traits.filter(t => t !== id);
        } else {
            state.traits.push(id);
        }
        UI.log(`[DEV] Toggled ${id}`, 'info');
    },

    unlockAll() {
        if (!state.unlockedTrophies) state.unlockedTrophies = [];
        TROPHIES.forEach(t => {
            if (!state.unlockedTrophies.includes(t.id)) state.unlockedTrophies.push(t.id);
        });
        UI.log("[DEV] Trophies Unlocked", 'good');
        DB.saveGame();
    },

    makeDraggable(el) {
        const header = el.querySelector('.dev-header');
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const startDrag = (clientX, clientY) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            initialLeft = el.offsetLeft;
            initialTop = el.offsetTop;
            header.style.cursor = 'grabbing';
        };

        header.onmousedown = (e) => {
            startDrag(e.clientX, e.clientY);
            e.preventDefault();
        };

        header.ontouchstart = (e) => {
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
            e.preventDefault();
        };

        const moveDrag = (clientX, clientY) => {
            if (!isDragging) return;
            const dx = clientX - startX;
            const dy = clientY - startY;
            el.style.left = `${initialLeft + dx}px`;
            el.style.top = `${initialTop + dy}px`;
            el.style.transform = 'none';
        };

        document.onmousemove = (e) => moveDrag(e.clientX, e.clientY);

        document.ontouchmove = (e) => {
            const touch = e.touches[0];
            moveDrag(touch.clientX, touch.clientY);
        };

        const stopDrag = () => {
            isDragging = false;
            if (header) header.style.cursor = 'grab';
        };

        document.onmouseup = stopDrag;
        document.ontouchend = stopDrag;
    },

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            #dev-panel {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 90vw; max-width: 450px; max-height: 85vh;
                background: rgba(14, 14, 14, 0.98);
                border: 1px solid #444; color: #fff;
                z-index: 10000; font-family: 'Segoe UI', sans-serif;
                box-shadow: 0 10px 40px rgba(0,0,0,0.8);
                border-radius: 12px; display: flex; flex-direction: column;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            .dev-header { padding: 15px; background: #000; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; cursor: grab; }
            #dev-panel h3 { margin: 0; color: #00ffcc; font-size: 1.1rem; font-weight: 700; letter-spacing: 1px; text-shadow: 0 0 10px rgba(0,255,204,0.3); }
            
            .dev-tabs { display: flex; background: #111; border-bottom: 1px solid #333; overflow-x: auto; -webkit-overflow-scrolling: touch; }
            .tab-btn { flex: 1; padding: 12px 5px; background: transparent; color: #888; border: none; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; font-size: 0.85rem; white-space: nowrap; font-weight: 600; min-width: 70px; }
            .tab-btn:hover { color: #ccc; background: #1a1a1a; }
            .tab-btn.active { color: #fff; border-bottom-color: #00ffcc; background: #1a1a1a; }

            .dev-content-scroll { overflow-y: auto; padding: 20px; flex: 1; -webkit-overflow-scrolling: touch; }
            .dev-section { margin-bottom: 25px; border-bottom: 1px solid #2a2a2a; padding-bottom: 20px; }
            .dev-section:last-child { border: none; padding-bottom: 0; }
            .dev-section h4 { margin: 0 0 12px 0; color: #555; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }

            #dev-panel button:not(.tab-btn):not(.close-btn) {
                background: #252525; color: #ccc; border: 1px solid #333;
                padding: 10px; cursor: pointer; border-radius: 6px; font-size: 0.9rem; transition: 0.2s; font-weight: 500;
            }
            #dev-panel button:not(.tab-btn):not(.close-btn):hover { background: #333; border-color: #666; color: #fff; transform: translateY(-1px); }
            #dev-panel button:not(.tab-btn):not(.close-btn):active { transform: translateY(1px); }
            
            .btn-group { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
            .btn-group button { flex: 1; min-width: 70px; }
            
            .btn-group-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
            .btn-group-wrap button { flex: 1 1 30%; }

            #dev-panel select, #dev-panel input[type="range"] { width: 100%; background: #0a0a0a; color: #fff; border: 1px solid #333; padding: 8px; border-radius: 6px; margin-bottom: 8px; font-size: 0.9rem; }
            #dev-panel select:focus { border-color: #00ffcc; outline: none; }
            
            .stat-slider { display: flex; flex-direction: column; margin-bottom: 15px; }
            .stat-slider label { font-size: 0.85rem; color: #aaa; display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: 500; }
            .stat-slider input[type="range"] { height: 6px; -webkit-appearance: none; background: #333; border-radius: 3px; padding: 0; border: none; }
            .stat-slider input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #00ffcc; border-radius: 50%; cursor: pointer; box-shadow: 0 0 5px rgba(0,255,204,0.5); }

            .trait-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
            .dev-checkbox { font-size: 0.85rem; color:#ccc; display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; background: #1a1a1a; padding: 8px; border-radius: 6px; border: 1px solid #333; transition: 0.2s; }
            .dev-checkbox:hover { border-color: #555; background: #222; }
            .dev-checkbox input { accent-color: #00ffcc; width: 16px; height: 16px; }

            .close-btn { background: #333 !important; color: #aaa !important; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; padding: 0 !important; border-radius: 50% !important; border: 1px solid #444 !important; }
            .close-btn:hover { background: #cc0000 !important; color: #fff !important; border-color: #ff0000 !important; }
            
            .active-state { border: 1px solid #4dffea !important; color: #4dffea !important; background: rgba(77, 255, 234, 0.15) !important; box-shadow: 0 0 10px rgba(77, 255, 234, 0.1); }
            
            /* Responsive Mobile */
            @media (max-width: 480px) {
                #dev-panel { width: 95vw; height: 90vh; max-height: 90vh; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 0; }
                .dev-tabs { flex-wrap: nowrap; overflow-x: auto; }
                .tab-btn { padding: 15px 10px; font-size: 0.9rem; }
                .dev-header h3 { font-size: 1rem; }
            }

            /* Scrollbar */
            .dev-content-scroll::-webkit-scrollbar { width: 5px; }
            .dev-content-scroll::-webkit-scrollbar-track { background: #0a0a0a; }
            .dev-content-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
            .dev-content-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
        `;
        document.head.appendChild(style);
    }
};
