
const UI = {
    els: {
        bars: {},
        vals: {},
        btns: {},
        modals: {},
        auth: {}
    },

    /**
     * Initializes UI element references
     * Caches DOM elements for better performance
     */
    init() {
        this.cacheElements();
    },

    showEventChoices(title, text, choices) {
        const modal = document.getElementById('event-modal');
        const titleEl = modal.querySelector('.modal-header span');
        const textEl = document.getElementById('event-text');
        const choicesEl = document.getElementById('event-choices');

        if (titleEl) titleEl.innerText = title;
        if (textEl) textEl.innerText = text;
        choicesEl.innerHTML = '';

        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'btn-choice';
            btn.style.width = '100%';
            btn.style.marginBottom = '10px';
            btn.style.padding = '10px';
            btn.style.cursor = 'pointer';
            btn.innerText = c.text;
            btn.onclick = () => {
                c.onClick();
                modal.classList.remove('active');
            };
            choicesEl.appendChild(btn);
        });

        modal.classList.add('active');
    },

    cacheElements() {
        this.els.date = document.getElementById('date-display');
        this.els.money = document.getElementById('money-display');
        this.els.jobTitle = document.getElementById('job-title-display');
        this.els.jobTrigger = document.getElementById('job-trigger');
        this.els.log = document.getElementById('event-log');

        this.els.bars = {
            health: document.getElementById('health-bar'),
            happy: document.getElementById('happiness-bar'),
            energy: document.getElementById('energy-bar'),
            intel: document.getElementById('intel-bar'),
            mhealth: document.getElementById('mhealth-bar'),
            stress: document.getElementById('stress-bar')
        };
        console.log("UI Caching Debug:", {
            health: this.els.bars.health,
            stress: this.els.bars.stress,
            domStress: document.getElementById('stress-bar')
        });

        this.els.vals = {
            health: document.getElementById('health-val'),
            happy: document.getElementById('happiness-val'),
            energy: document.getElementById('energy-val'),
            intel: document.getElementById('intel-val'),
            mhealth: document.getElementById('mhealth-val'),
            stress: document.getElementById('stress-val')
        };

        this.els.btns = {
            next: document.getElementById('btn-next'),
            settings: document.getElementById('settings-trigger'),
            trophy: document.getElementById('trophy-trigger')
        };

        this.els.modals = {
            job: document.getElementById('job-modal'),
            jobList: document.getElementById('job-list-container'),
            closeJob: document.getElementById('close-job-modal'),
            settings: document.getElementById('settings-modal'),
            closeSettings: document.getElementById('close-settings-modal'),
            event: document.getElementById('event-modal'),
            eventText: document.getElementById('event-text'),
            eventChoices: document.getElementById('event-choices'),
            shop: document.getElementById('shop-modal'),
            shopList: document.getElementById('shop-list-container'),
            closeShop: document.getElementById('close-shop-modal'),
            shopBtn: document.getElementById('shop-trigger'),
            act: document.getElementById('activity-modal'),
            closeAct: document.getElementById('close-act-modal'),
            endGame: document.getElementById('end-game-modal'),
            endSummary: document.getElementById('end-game-summary'),
            endScore: document.getElementById('end-game-score'),
            alert: document.getElementById('alert-modal'),
            alertTitle: document.getElementById('alert-title'),
            alertMsg: document.getElementById('alert-msg'),
            alertBtn: document.getElementById('alert-ok-btn')
        };

        this.els.auth = {
            section: document.getElementById('auth-section'),
            form: document.getElementById('auth-form'),
            userInfo: document.getElementById('user-info'),
            email: document.getElementById('user-email'),
            msg: document.getElementById('auth-msg'),
            loginBtn: document.getElementById('btn-login'),
            logoutBtn: document.getElementById('btn-logout'),
            emailInput: document.getElementById('email-input'),
            passInput: document.getElementById('pass-input'),
            saveBtn: document.getElementById('btn-save'),
            loadBtn: document.getElementById('btn-load'),
            saveMsg: document.getElementById('save-msg')
        };
    },

    /**
     * Main render function - updates all UI elements
     * Called after any state change
     */
    render() {
        // Date
        // Start age is 12 (144 months). But wait, state.totalMonths IS the age in months?
        // Or is it elapsed months?
        // Let's assume state.totalMonths = Age in Months. 
        // If state starts at 144, then Math.floor(144/12) = 12 years. Correct.
        const totalM = state.totalMonths;
        const yrs = Math.floor(totalM / 12);
        const mos = (totalM % 12) + 1;

        // Economic Indicator
        const econState = state.world && state.world.economicState ? World.ECON_STATES[state.world.economicState] : World.ECON_STATES.stable;
        const econIcon = econState ? (econState.id === 'boom' ? '📈' : (econState.id === 'recession' ? '📉' : (econState.id === 'depression' ? '⚠️' : (econState.id === 'hyperinflation' ? '💸' : '⚖️')))) : '⚖️';
        const econName = econState ? econState.name : 'Estable';

        this.els.date.innerHTML = `
            <div>Año ${yrs} - Mes ${mos}</div>
            <div style="font-size: 0.8rem; color: #aaa; margin-top: 4px; display: flex; align-items: center; gap: 5px;">
                <span>${econIcon}</span>
                <span style="color: ${econState.id === 'boom' ? '#4dffea' : (econState.id === 'stable' ? '#aaa' : '#ff5555')}">${econName}</span>
            </div>
        `;

        // Money Animation
        this.animateNumber(this.els.money, parseInt(this.els.money.innerText.replace(/[^0-9-]/g, '')) || 0, state.money);

        // EMERGENCY BUTTON
        const existingPanic = document.getElementById('panic-btn');
        if (state.money < 500) {
            if (!existingPanic) {
                const btn = document.createElement('button');
                btn.id = 'panic-btn';
                btn.innerText = '🆘 Liquidar';
                btn.className = 'panic-btn'; // Needs CSS
                btn.style.cssText = "background:#ff3333; color:white; border:none; padding:5px 10px; border-radius:5px; margin-left:10px; cursor:pointer; font-weight:bold; font-size:0.8rem; animation: pulse 1s infinite;";
                btn.onclick = () => {
                    // Show options
                    const opts = [
                        { text: "📦 Vender Objetos (30%)", onClick: () => Game.emergencySell('items') },
                        { text: "🚗 Vender Vehículo (30%)", onClick: () => Game.emergencySell('vehicle') },
                        { text: "🏠 Vender Propiedades (30%)", onClick: () => Game.emergencySell('properties') }
                    ];
                    UI.showEventChoices("VENTA DE EMERGENCIA", "Elige qué activos liquidar por el 30% de su valor.", opts);
                };
                this.els.money.parentNode.appendChild(btn); // Append to header container
            }
        } else {
            if (existingPanic) existingPanic.remove();
        }

        // Finance Panel
        const fin = Game.calculateFinancials();
        document.getElementById('networth-val').innerText = `$${Math.floor(fin.netWorth).toLocaleString()}`;

        // Income / Expenses / Net
        const totalInc = fin.activeIncome + fin.passiveIncome;
        const netFlow = totalInc - fin.expenses;

        const incTotalEl = document.getElementById('income-total');
        if (incTotalEl) incTotalEl.innerText = `+$${Math.floor(totalInc).toLocaleString()}`;

        const expTotalEl = document.getElementById('expense-total');
        if (expTotalEl) expTotalEl.innerText = `-$${Math.floor(fin.expenses).toLocaleString()}`;

        // Update Job UI Title override
        if (state.currJobId === 'custom_partner') {
            const jobTitle = document.getElementById('job-title-display');
            if (jobTitle) jobTitle.innerText = "Socio Empresarial";
        }

        const flowEl = document.getElementById('net-flow');
        if (flowEl) {
            flowEl.innerText = `${netFlow >= 0 ? '+' : ''}$${Math.floor(netFlow).toLocaleString()}/m`;
            flowEl.style.color = netFlow >= 0 ? '#39FF14' : '#ff4d4d';
        }

        // Bars
        const safeNet = Math.max(1, fin.netWorth); // Avoid /0
        const cashPct = Math.max(0, (fin.cash / safeNet) * 100);
        const invPct = Math.max(0, (fin.investments / safeNet) * 100);
        const rePct = Math.max(0, (fin.realEstate / safeNet) * 100);

        const bar = document.getElementById('fn-asset-bar');
        bar.children[0].style.width = `${cashPct}%`;
        bar.children[1].style.width = `${invPct}%`;
        bar.children[2].style.width = `${rePct}%`;

        // Achievement Check
        if (fin.passiveIncome >= fin.expenses && !state.financialFreedom && state.age >= 18) {
            state.financialFreedom = true;
            this.showAlert("¡LIBERTAD FINANCIERA! 🚀", "Tus ingresos pasivos superan tus gastos. ¡Eres libre!");
        }

        // Job
        const job = JOBS.find(j => j.id === state.currJobId) || JOBS[0];
        this.els.jobTitle.innerHTML = `${job.title} ($${job.salary}/mes)`;
        // XP Bar
        document.getElementById('job-xp-bar').style.width = `${state.jobXP}%`;

        // HIDE JOB SECTION FOR CHILDREN (Under 18)
        const jobTrigger = document.getElementById('job-trigger');
        if (jobTrigger) {
            if (state.age < 18) {
                jobTrigger.style.display = 'none';
            } else {
                jobTrigger.style.display = 'block';
            }
        }

        // XP Bar

        // Diploma Display
        const diploContainer = document.getElementById('diploma-display');
        if (state.education && state.education.length > 0) {
            diploContainer.innerHTML = '🎓 ' + state.education.map(d => COURSES.find(c => c.id === d)?.degree || d).join(', ');
        } else {
            diploContainer.innerHTML = '';
        }

        // Bars
        const setBar = (type, val, max = 100) => {
            if (!this.els.bars[type]) {
                console.warn(`UI Warning: Bar element for '${type}' not found.`);
                return;
            }
            const pct = Math.min(100, Math.max(0, (val / max) * 100));
            this.els.bars[type].style.width = `${pct}%`;
            if (this.els.vals[type]) {
                this.els.vals[type].innerText = type === 'intel' ? val : `${Math.floor(val)}%`;
            }
        };

        setBar('health', state.physicalHealth);
        if (state.physicalHealth < 20) this.els.bars.health.classList.add('critical');
        else this.els.bars.health.classList.remove('critical');

        setBar('mhealth', state.mentalHealth);
        if (state.mentalHealth < 20) this.els.bars.mhealth.classList.add('critical');
        else this.els.bars.mhealth.classList.remove('critical');

        setBar('happy', state.happiness);
        setBar('energy', state.energy);
        setBar('happy', state.happiness);
        setBar('energy', state.energy);
        setBar('intel', state.intelligence, 100);
        setBar('stress', state.stress, 100);

        // Button States (Energy Check) - Moved to dynamic renderActions logic
        // const hasEnergy = state.energy >= 20;
        // const isSick = state.sickDuration > 0;

    },

    updateTheme(baseTheme) {
        // preserve base theme if passed, otherwise check body class
        let currentTheme = baseTheme || document.body.className;

        // If Adulthood, check wealth for dynamic overrides
        if (state.phase === 'adulthood') {
            const netWorth = Game.calculateFinancials().netWorth;
            if (netWorth > 1000000) {
                document.body.className = 'theme-adult theme-rich';
            } else if (netWorth < 0) {
                document.body.className = 'theme-adult theme-poor';
            } else {
                document.body.className = 'theme-adult';
            }
        }
    },

    renderNews(headline, type, desc) {
        const div = document.createElement('div');
        div.className = `event-card news ${type}`;
        div.innerHTML = `
            <div class="news-header">📰 EXTRA EXTRA</div>
            <div class="news-headline">${headline}</div>
            <div class="news-body">${desc}</div>
        `;
        this.els.log.appendChild(div);
        // Animate
        setTimeout(() => div.classList.add('visible'), 50);
        setTimeout(() => {
            this.els.log.scrollTop = this.els.log.scrollHeight;
        }, 60);
    },

    renderAthletics() {
        const container = document.getElementById('athletics-container');
        if (!container) return; // safety

        const ath = state.athletics;

        let html = `
            <div class="stats-row">
                <h3>🏃 Carrera Atlética</h3>
                <span class="money-display ${ath.stamina > 50 ? 'gain' : 'loss'}">Resistencia: ${ath.stamina}/150</span>
            </div>
            
            <div style="margin-bottom:20px; text-align:center;">
                <h4 style="color:#aaa; font-size:0.9rem;">ENTRENAMIENTO MENSUAL</h4>
                <div style="display:flex; justify-content:center; gap:5px;">
                    <button class="choice-btn ${ath.training === 'none' ? 'active-job' : ''}" 
                            data-action="set-training" 
                            data-params='{"level":"none"}'>Nada</button>
                    <button class="choice-btn ${ath.training === 'low' ? 'active-job' : ''}" 
                            data-action="set-training" 
                            data-params='{"level":"low"}'>Suave</button>
                    <button class="choice-btn ${ath.training === 'med' ? 'active-job' : ''}" 
                            data-action="set-training" 
                            data-params='{"level":"med"}'>Medio</button>
                    <button class="choice-btn ${ath.training === 'high' ? 'active-job' : ''}" 
                            data-action="set-training" 
                            data-params='{"level":"high"}'>Intenso</button>
                </div>
                <div style="font-size:0.8rem; margin-top:5px; color:#888;">
                    ${ath.training === 'none' ? 'Descanso total.' :
                ath.training === 'low' ? '+2 Stamina, -10 Energía' :
                    ath.training === 'med' ? '+5 Stamina, -20 Energía (Riesgo Bajo)' :
                        '+10 Stamina, -40 Energía (Riesgo Alto)'}
                </div>
            </div>

            <div style="background:#252525; padding:10px; border-radius:6px; margin-bottom:15px;">
                 <h4 style="margin:0 0 10px 0; border-bottom:1px solid #444; padding-bottom:5px;">📅 Próxima Carrera</h4>
                 ${ath.race ?
                `<div>
                        <div style="font-size:1.1rem; color:#4dffea">${ath.race.name}</div>
                        <div style="font-size:0.9rem;">Faltan: ${ath.race.monthsLeft} meses</div>
                    </div>` :
                `<div style="font-size:0.9rem; color:#888;">No estás inscrito.</div>`}
            </div>

            <h4 style="margin-bottom:10px;">🏆 Inscripciones</h4>
        `;

        Object.keys(Athletics.RACES).forEach(key => {
            const race = Athletics.RACES[key];
            const completed = ath.medals.includes(key);
            html += `
                <div class="job-item ${completed ? 'completed-item' : ''}">
                    <div class="job-details">
                        <h4>${race.name} ${completed ? '✅' : ''}</h4>
                        <div class="job-req">Dist: ${race.dist}km | Req: ${race.reqStam} Stam</div>
                    </div>
                    ${!ath.race && !completed ?
                    `<button class="btn-buy" 
                             data-action="register-race" 
                             data-params='{"raceType":"${key}"}'>Inscribir</button>` :
                    ''
                }
                </div>
            `;
        });

        html += `<h4 style="margin-top:20px;">👟 Equipamiento</h4>`;

        // Shop
        Object.keys(Athletics.GEAR).forEach(key => {
            const item = Athletics.GEAR[key];
            const owned = ath.gear[key];
            html += `
                <div class="job-item">
                     <div class="job-details">
                        <h4>${item.name}</h4>
                        <div class="job-req">$${item.cost} - ${item.effect}</div>
                    </div>
                    ${owned ? '<span style="color:#4dffea; fontSize:0.8rem">ADQUIRIDO</span>' :
                    `<button class="btn-buy" 
                             data-action="buy-gear" 
                             data-params='{"gearId":"${key}"}'>Comprar</button>`}
                </div>
            `;
        });

        container.innerHTML = html;
    },

    renderBusiness() {
        const container = document.getElementById('business-container');
        container.innerHTML = '';

        if (!state.business || !state.business.active) {
            // Founding Screen
            container.innerHTML = `<h3>Fundar Startup</h3>
            <p>Inicia tu propio camino emprendedor.</p>`;

            Object.keys(Business.TYPES).forEach(key => {
                const type = Business.TYPES[key];
                const btn = document.createElement('div');
                btn.className = 'job-item';
                btn.innerHTML = `
                    <div class="job-details">
                        <h4>${type.name}</h4>
                        <p>Costo: <span style="color:#ff6b6b">$${type.cost}</span></p>
                        <div class="job-req">Potencial: ${type.pot}x | Dif: ${type.diff}/5</div>
                    </div>
                `;

                const startBtn = document.createElement('button');
                startBtn.className = 'btn-buy';
                startBtn.innerText = 'Iniciar';
                if (state.money < type.cost) startBtn.disabled = true;

                startBtn.onclick = () => {
                    if (Business.startCompany(key, `My ${type.name}`)) {
                        this.renderBusiness();
                        this.render(); // update money
                    }
                };

                btn.appendChild(startBtn);
                container.appendChild(btn);
            });
            return;
        }

        // Dashboard
        const biz = state.business;
        const html = `
            <div class="stats-row">
                <h3>${biz.name}</h3>
                <span class="money-display ${biz.cash < 0 ? 'loss' : 'gain'}">Based: $${Math.floor(biz.cash)}</span>
            </div>
            
            <div class="stat-grid" style="margin-bottom:15px; background:#252525; padding:10px; border-radius:6px;">
                <div style="text-align:center">
                    <div style="font-size:0.8rem; color:#aaa">Revenue (MRR)</div>
                    <div style="font-size:1.2rem; color:#4dffea">$${biz.revenue}</div>
                    <div style="font-size:0.7rem; color:${biz.growth >= 0 ? '#39FF14' : '#ff4d4d'}">${biz.growth.toFixed(1)}% MoM</div>
                </div>
                <div style="text-align:center">
                    <div style="font-size:0.8rem; color:#aaa">Users</div>
                    <div style="font-size:1.2rem;">${biz.users.toLocaleString()}</div>
                </div>
            </div>

            <div style="margin-bottom:15px;">
                <h4 style="margin:0 0 5px 0; color:#aaa; font-size:0.9rem;">Asignación de Esfuerzo (Total: 10)</h4>
                
                <div class="bar-group">
                   <div class="bar-label">Producto (Calidad) <span id="val-prod">${biz.alloc.prod}</span></div>
                   <input type="range" min="0" max="10" value="${biz.alloc.prod}" class="slider" 
                        onchange="UI.updateBizAlloc('prod', this.value)">
                </div>
                
                <div class="bar-group">
                   <div class="bar-label">Marketing (Crecimiento) <span id="val-mkt">${biz.alloc.mkt}</span></div>
                   <input type="range" min="0" max="10" value="${biz.alloc.mkt}" class="slider" 
                        onchange="UI.updateBizAlloc('mkt', this.value)">
                </div>

                <div class="bar-group">
                   <div class="bar-label">Ventas (Monetización) <span id="val-sales">${biz.alloc.sales}</span></div>
                   <input type="range" min="0" max="10" value="${biz.alloc.sales}" class="slider" 
                        onchange="UI.updateBizAlloc('sales', this.value)">
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button class="choice-btn" data-action="raise-funds">
                    <span class="choice-text">💸 Buscar Inversión</span>
                    <span class="choice-sub">Vender 10% Equity</span>
                </button>
                 <button class="choice-btn" style="background:#442222;" data-action="close-business">
                    <span class="choice-text">🔒 Cerrar</span>
                </button>
            </div>
        `;
        container.innerHTML = html;
    },

    updateBizAlloc(type, val) {
        // Simple logic: allow any setting, update state directly
        // Better logic would be to cap total at 10, but let's keep it simple for MVP or enforce total in Business logic validation?
        // Let's rely on user to be honest? No, let's enforce sum logic conceptually or just let them max out corresponding to cost?
        // Business logic uses them to calculate Burn Rate. So high stats = High Cost. Perfectly balanced.
        state.business.alloc[type] = parseInt(val);
        document.getElementById(`val-${type}`).innerText = val;
    },

    raiseFunds() {
        if (Math.random() > 0.7) {
            Business.injectCash(10000 + (state.business.users * 2), 10);
        } else {
            UI.log('Los inversores no están interesados por ahora.', 'info');
        }
        this.renderBusiness();
    },

    /**
     * Adds an event to the game timeline
     * @param {string} msg - Event message to display
     * @param {string} type - Event type: 'info', 'good', 'bad', 'normal'
     */
    log(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `event-card ${type}`;
        div.innerHTML = `
            <span class="event-date">${this.els.date.innerText}</span>
            ${msg}
        `;
        this.els.log.appendChild(div); // Newest bottom

        if (type === 'bad') {
            AudioSys.playBad();
            Haptics.error();
        }

        // Auto Scroll
        setTimeout(() => {
            this.els.log.scrollTop = this.els.log.scrollHeight;
        }, 50);
    },

    floatText(text, color) {
        const el = document.createElement('div');
        el.className = 'float-text';
        el.innerText = text;
        el.style.color = color;
        el.style.left = (50 + (Math.random() * 20 - 10)) + '%';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1300);
    },

    spawnParticles(emoji, count = 5) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'particle';
            el.innerText = emoji;
            el.style.left = (50 + (Math.random() * 40 - 20)) + '%';
            el.style.top = (40 + (Math.random() * 20 - 10)) + '%';
            // Random delay
            el.style.animationDelay = (Math.random() * 0.5) + 's';
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        }
    },

    flashMoney(amount) {
        const el = this.els.money;
        const isGain = amount > 0;

        // Get current value
        const currentText = el.innerText.replace(/[$,]/g, '');
        const currentValue = parseInt(currentText) || 0;
        const newValue = state.money;

        // Use Juice for smooth counter animation
        if (typeof Juice !== 'undefined' && Juice.animateCounter) {
            Juice.animateCounter(el, currentValue, newValue, 500, true);
        } else {
            // Fallback
            el.innerText = `$${newValue.toLocaleString()}`;
        }

        // Visual flash effect
        el.classList.remove('gain', 'loss', 'animating');
        void el.offsetWidth; // Force reflow
        el.classList.add(isGain ? 'gain' : 'loss', 'animating');

        // Float text
        const color = isGain ? '#39FF14' : '#FF3939';
        const sign = isGain ? '+' : '';
        this.floatText(`${sign}$${Math.abs(amount)}`, color);

        // Confetti and haptic for gains
        if (typeof Juice !== 'undefined') {
            if (isGain) {
                Juice.moneyGained(amount, el);
            } else {
                Juice.negativeEvent();
            }
        } else {
            // Fallback haptic
            if (isGain && amount >= 100) {
                this.spawnParticles('💸', 3);
                if (amount >= 1000) Haptics.medium();
            } else if (!isGain) {
                Haptics.pulse();
            }
        }
    },

    checkCriticalState() {
        const overlay = document.getElementById('critical-overlay');
        if (!overlay) return;

        const isCritical = state.energy <= 20 || state.physicalHealth <= 20 || state.mentalHealth <= 20;
        if (isCritical) {
            overlay.classList.add('active');
            if (state.energy <= 10) overlay.style.boxShadow = "inset 0 0 200px rgba(0,0,0,0.95)";
            else overlay.style.boxShadow = "";
        } else {
            overlay.classList.remove('active');
        }
    },

    updateAuthUI(user) {
        if (user) {
            this.els.auth.form.classList.add('hidden');
            this.els.auth.userInfo.classList.remove('hidden');
            this.els.auth.email.innerText = user.email;
            this.els.auth.saveBtn.disabled = false;
            this.els.auth.loadBtn.disabled = false;
            this.els.auth.saveMsg.innerText = "Sesión activa.";
            this.els.auth.saveMsg.style.color = "#4dffea";
        } else {
            this.els.auth.form.classList.remove('hidden');
            this.els.auth.userInfo.classList.add('hidden');
            this.els.auth.email.innerText = "";
            this.els.auth.saveBtn.disabled = true;
            this.els.auth.loadBtn.disabled = true;
            this.els.auth.saveMsg.innerText = "Inicia sesión para guardar.";
            this.els.auth.saveMsg.style.color = "#888";
        }
    },

    animateNumber(el, start, end) {
        if (start === end) return;
        const duration = 500;
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(start + (end - start) * ease);
            el.innerText = `$${current.toLocaleString()}`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.innerText = `$${end.toLocaleString()}`; // Ensure final value
            }
        };
        requestAnimationFrame(step);
    },

    showAlert(title, msg, callback) {
        this.els.modals.alertTitle.innerText = title;
        this.els.modals.alertMsg.innerText = msg;
        this.els.modals.alert.classList.add('active');
        this.els.modals.alertBtn.onclick = () => {
            this.els.modals.alert.classList.remove('active');
            if (callback) callback();
        };
    },

    /**
     * Opens a modal by ID
     * @param {string} id - Modal element ID
     */
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            // If it's activity modal, maybe default to first tab if not specified?
            // For now just open.
        } else {
            console.error(`Modal ${id} not found.`);
        }
    },

    /**
     * Closes a modal by ID
     * @param {string} id - Modal element ID
     */
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    },

    renderJobMarket(category = null) {
        const modal = document.getElementById('job-modal');
        const container = document.getElementById('job-list-container');
        if (!modal || !container) return;

        // AGE RESTRICTION: Must be 18+ to access job market
        if (state.age < 18) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#888;">
                    <div style="font-size:3rem; margin-bottom:20px;">🎓</div>
                    <h3 style="color:#fff; margin-bottom:10px;">Demasiado Joven</h3>
                    <p>Debes tener al menos 18 años para acceder al mercado laboral.</p>
                    <p style="color:#666; margin-top:10px;">Enfócate en tus estudios por ahora.</p>
                </div>
            `;
            return;
        }

        // ECONOMIC RESTRICTION: Hiring Freeze in Depression/Recession
        const econState = state.world.economicState || 'stable';
        const isCrisis = econState === 'depression' || (econState === 'recession' && Math.random() < 0.3); // 30% chance to see freeze in recession

        if (econState === 'depression') {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#ff5555;">
                    <div style="font-size:3rem; margin-bottom:20px;">⚠️</div>
                    <h3 style="color:#ff5555; margin-bottom:10px;">Crisis Económica</h3>
                    <p>Debido a la Gran Depresión, las empresas han congelado las contrataciones.</p>
                    <p style="color:#aaa; margin-top:10px;">Intenta buscar trabajos independientes o espera a que mejore la economía.</p>
                </div>
            `;
            return;
        }

        const filter = category || 'all';
        container.innerHTML = '';

        // --- 1. TABS ---
        const cats = [
            { id: 'all', name: '📋 Todos', icon: '📋' },
            { id: 'service', name: '🧹 Servicios', icon: '🧹' },
            { id: 'product', name: '🎯 Product', icon: '🎯' },
            { id: 'trade', name: '🛠️ Oficios', icon: '🛠️' },
            { id: 'corp', name: '💼 Corporativo', icon: '💼' },
            { id: 'tech', name: '💻 Tech', icon: '💻' },
            { id: 'creative', name: '🎨 Creativo', icon: '🎨' },
            { id: 'medical', name: '🏥 Salud', icon: '🏥' },
            { id: 'law', name: '⚖️ Leyes', icon: '⚖️' },
            { id: 'sport', name: '⚽ Deportes', icon: '⚽' },
            { id: 'education', name: '🎓 Educación', icon: '🎓' }
        ];

        const tabContainer = document.createElement('div');
        tabContainer.style.cssText = "display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px; border-bottom:2px solid #333;";

        cats.forEach(c => {
            const btn = document.createElement('button');
            btn.innerText = c.name;
            btn.className = `filter-btn ${filter === c.id ? 'active' : ''}`;
            btn.style.cssText = `
                padding: 8px 14px;
                border: 2px solid ${filter === c.id ? '#4dffea' : '#444'};
                background: ${filter === c.id ? 'rgba(77, 255, 234, 0.15)' : '#1a1a1a'};
                color: ${filter === c.id ? '#4dffea' : '#999'};
                border-radius: 20px;
                cursor: pointer;
                white-space: nowrap;
                font-size: 0.9rem;
                font-weight: ${filter === c.id ? 'bold' : 'normal'};
                transition: all 0.2s;
            `;
            btn.onmouseover = () => {
                if (filter !== c.id) {
                    btn.style.background = '#222';
                    btn.style.color = '#ccc';
                }
            };
            btn.onmouseout = () => {
                if (filter !== c.id) {
                    btn.style.background = '#1a1a1a';
                    btn.style.color = '#999';
                }
            };
            btn.onclick = () => this.renderJobMarket(c.id);
            tabContainer.appendChild(btn);
        });
        container.appendChild(tabContainer);

        // --- 2. JOBS LIST ---
        let jobs = JOBS.filter(j => j.id !== 'unemployed');
        if (filter !== 'all') {
            jobs = jobs.filter(j => j.career === filter);
        }

        // Sort: Salary Ascending
        jobs.sort((a, b) => a.salary - b.salary);

        jobs.forEach(j => {
            // Check qualifications
            const isQual = state.intelligence >= (j.req.int || 0) &&
                state.physicalHealth >= (j.req.health || 0) &&
                state.happiness >= (j.req.happy || 0) &&
                (!j.req.deg || state.education.includes(j.req.deg)) &&
                (!j.req.isStudent || state.isStudent);

            // Check career experience
            let hasCareerExp = true;
            let expMessage = '';
            if (j.req.careerExp) {
                for (const [career, requiredMonths] of Object.entries(j.req.careerExp)) {
                    const currentExp = state.careerExperience[career] || 0;
                    if (currentExp < requiredMonths) {
                        hasCareerExp = false;
                        const yearsNeeded = Math.ceil(requiredMonths / 12);
                        expMessage = `Requiere ${yearsNeeded} año(s) en ${career}`;
                    }
                }
            }

            const isFullyQual = isQual && hasCareerExp;
            const isCurr = state.currJobId === j.id;

            const card = document.createElement('div');
            card.className = 'job-card';
            card.style.cssText = `
                background: ${isCurr ? 'linear-gradient(135deg, rgba(0, 255, 204, 0.1), rgba(77, 255, 234, 0.05))' : '#1a1a1a'};
                border: 2px solid ${isCurr ? '#00ffcc' : (isFullyQual ? '#333' : '#222')};
                padding: 16px;
                margin-bottom: 12px;
                border-radius: 12px;
                opacity: ${isFullyQual ? 1 : 0.5};
                transition: all 0.3s;
            `;

            if (isFullyQual && !isCurr) {
                card.onmouseover = () => {
                    card.style.borderColor = '#4dffea';
                    card.style.background = 'rgba(77, 255, 234, 0.05)';
                };
                card.onmouseout = () => {
                    card.style.borderColor = '#333';
                    card.style.background = '#1a1a1a';
                };
            }

            // Calculate net salary
            const salaryData = FinanceManager.calculateNetSalary(j.salary);

            // Build requirement badges
            const reqBadges = [];
            if (j.req.int) {
                const hasInt = state.intelligence >= j.req.int;
                reqBadges.push(`<span style="color:${hasInt ? '#4dffea' : '#ff5555'};">🧠 ${j.req.int}</span>`);
            }
            if (j.req.health) {
                const hasHealth = state.physicalHealth >= j.req.health;
                reqBadges.push(`<span style="color:${hasHealth ? '#4dffea' : '#ff5555'};">💪 ${j.req.health}</span>`);
            }
            if (j.req.deg) {
                const hasDeg = state.education.includes(j.req.deg);
                reqBadges.push(`<span style="color:${hasDeg ? '#4dffea' : '#ff5555'};">🎓 Título</span>`);
            }
            if (j.req.isStudent) {
                reqBadges.push(`<span style="color:${state.isStudent ? '#4dffea' : '#ff5555'};">📚 Estudiante</span>`);
            }
            if (!hasCareerExp) {
                reqBadges.push(`<span style="color:#ff5555;">⏱️ ${expMessage}</span>`);
            }

            // Build benefits/warnings
            const benefits = [];
            if (j.bonusChance) {
                benefits.push(`💰 ${Math.floor(j.bonusChance * 100)}% bono ($${j.bonusAmount})`);
            }
            if (j.xpGain === 0) {
                benefits.push(`<span style="color:#ff5555;">⚠️ Sin progresión</span>`);
            }
            if (j.deadEnd) {
                benefits.push(`<span style="color:#ff5555;">🚫 Callejón sin salida</span>`);
            }
            if (j.boredom >= 8) {
                benefits.push(`<span style="color:#ff9955;">😴 Muy aburrido (${j.boredom}/10)</span>`);
            }
            if (j.type === 'part_time') {
                benefits.push(`<span style="color:#4dffea;">⏰ Medio tiempo</span>`);
            }

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                    <div style="flex:1;">
                        <div style="font-weight:bold; color:${isCurr ? '#00ffcc' : '#fff'}; font-size:1.1rem; margin-bottom:4px;">
                            ${j.title} ${isCurr ? '✓' : ''}
                        </div>
                        ${j.desc ? `<div style="color:#888; font-size:0.85rem; margin-bottom:8px; font-style:italic;">${j.desc}</div>` : ''}
                        
                        <div style="display:flex; gap:15px; margin-bottom:8px;">
                            <div>
                                <span style="color:#666; font-size:0.75rem;">BRUTO</span>
                                <div style="color:#aaa; font-size:0.95rem; text-decoration:line-through;">$${j.salary.toLocaleString()}</div>
                            </div>
                            <div>
                                <span style="color:#666; font-size:0.75rem;">NETO (${salaryData.taxRate}% imp.)</span>
                                <div style="color:#4dffea; font-size:1.1rem; font-weight:bold;">$${salaryData.net.toLocaleString()}/mes</div>
                            </div>
                        </div>

                        ${reqBadges.length > 0 ? `
                            <div style="margin-bottom:6px;">
                                <span style="color:#666; font-size:0.75rem;">REQUISITOS:</span>
                                <div style="font-size:0.85rem; margin-top:2px;">${reqBadges.join(' • ')}</div>
                            </div>
                        ` : ''}

                        ${benefits.length > 0 ? `
                            <div>
                                <span style="color:#666; font-size:0.75rem;">DETALLES:</span>
                                <div style="font-size:0.85rem; margin-top:2px;">${benefits.join(' • ')}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div style="display:flex; gap:10px; align-items:center;">
                    <div style="flex:1; display:flex; gap:8px; font-size:0.8rem;">
                        <div style="background:#222; padding:4px 8px; border-radius:4px;">
                            <span style="color:#666;">Estrés:</span> 
                            <span style="color:${(j.stressPerMonth || j.stress || 0) > 15 ? '#ff5555' : '#4dffea'};">${j.stressPerMonth || j.stress || 0}/mes</span>
                        </div>
                        <div style="background:#222; padding:4px 8px; border-radius:4px;">
                            <span style="color:#666;">Energía:</span> 
                            <span style="color:${(j.energyCost || 0) > 30 ? '#ff5555' : '#4dffea'};">-${j.energyCost || 0}/mes</span>
                        </div>
                        <div style="background:#222; padding:4px 8px; border-radius:4px;">
                            <span style="color:#666;">XP:</span> 
                            <span style="color:${(j.xpGain || 1) === 0 ? '#ff5555' : '#4dffea'};">${(j.xpGain || 1)}x</span>
                        </div>
                    </div>
                    <button id="apply-btn-${j.id}" style="
                        background: ${isCurr ? '#222' : (isFullyQual ? 'linear-gradient(135deg, #007bff, #0056b3)' : '#333')};
                        color: ${isFullyQual || isCurr ? '#fff' : '#666'};
                        border:none;
                        padding: 10px 20px;
                        border-radius:6px;
                        cursor: ${isFullyQual && !isCurr ? 'pointer' : 'not-allowed'};
                        font-weight:bold;
                        font-size:0.9rem;
                        min-width:120px;
                        transition: all 0.2s;
                    ">${isCurr ? '✓ Trabajando' : (isFullyQual ? 'Aplicar' : '🔒 Bloqueado')}</button>
                </div>
            `;

            const applyBtn = card.querySelector(`#apply-btn-${j.id}`);
            if (isFullyQual && !isCurr) {
                applyBtn.onmouseover = () => {
                    applyBtn.style.background = 'linear-gradient(135deg, #0056b3, #003d82)';
                    applyBtn.style.transform = 'scale(1.05)';
                };
                applyBtn.onmouseout = () => {
                    applyBtn.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
                    applyBtn.style.transform = 'scale(1)';
                };
                applyBtn.onclick = () => {
                    // TRAVEL CHECK: Visa Requirements
                    if (typeof Travel !== 'undefined' && state.currentCountry !== 'home') {
                        const visa = state.visaStatus;
                        // 1. Check if we HAVE a visa (should be true if we are here, but safety check)
                        if (!visa) {
                            UI.showAlert('Sin Visa', 'No tienes permiso para trabajar aquí.');
                            return;
                        }
                        // 2. Check if visa allows work
                        if (!visa.allowWork) {
                            UI.showAlert('Visa Restrictiva', `Tu ${VISA_TYPES[visa.type].name} no permite trabajar.`);
                            return;
                        }
                    }

                    Game.applyJob(j.id);
                    this.renderJobMarket(filter);
                };
            }

            container.appendChild(card);
        });

        if (jobs.length === 0) {
            container.innerHTML += `
                <div style="text-align:center; color:#666; padding:40px;">
                    <div style="font-size:3rem; margin-bottom:10px;">📭</div>
                    <p>No hay trabajos disponibles en esta categoría.</p>
                </div>
            `;
        }
    },

    renderJobDashboard() {
        const modal = document.getElementById('job-dashboard-modal');
        if (!modal) return;

        const job = JOBS.find(j => j.id === state.currJobId) || JOBS[0];
        const isUnemployed = job.id === 'unemployed';

        // 1. Header Stats
        // 1. Header Stats
        document.getElementById('jd-role').innerText = job.title;

        // Net Salary Calc (Assuming 15% Tax for now)
        const netSalary = Math.floor(job.salary * 0.85);
        const boredomVal = job.boredom || 0;

        document.getElementById('jd-salary').innerHTML = `$${job.salary}/mes <span style="font-size:0.8rem; color:#aaa;">(Neto: ~$${netSalary})</span><br>
            <span style="font-size:0.8rem; color:${boredomVal > 50 ? '#ff4d4d' : '#8BC34A'}">Aburrimiento: ${boredomVal}%</span>`;

        document.getElementById('jd-performance').innerText = isUnemployed ? '-' : `${state.work_relations?.performance || 50}%`;
        document.getElementById('jd-stress').innerText = `${state.stress}%`;

        // 2. Procedural Benefits
        const benefitsContainer = document.getElementById('jd-benefits-list');
        benefitsContainer.innerHTML = '';

        if (isUnemployed) {
            benefitsContainer.innerHTML = '<div style="color:#888; grid-column:span 2; text-align:center;">Sin beneficios activos.</div>';
        } else {
            // Logic: Better jobs = better benefits
            const tier = job.salary > 5000 ? 3 : job.salary > 2000 ? 2 : 1;

            const benefits = [
                { name: 'Seguro Médico', tier: 1, val: 'Básico' },
                { name: 'Seguro Médico', tier: 2, val: 'Completo' },
                { name: 'Seguro Médico', tier: 3, val: 'Premium Familiar' },
                { name: 'Vacaciones', tier: 1, val: '7 días' },
                { name: 'Vacaciones', tier: 2, val: '14 días' },
                { name: 'Vacaciones', tier: 3, val: '30 días' },
                { name: 'Aguinaldo', tier: 1, val: 'Si' },
                { name: 'Bono Anual', tier: 2, val: 'Hasta 10%' },
                { name: 'Acciones (Stock)', tier: 3, val: 'Vesting 4 años' }
            ];

            // Filter benefits applicable to this job tier
            // We just show one per category for simplicity, or just valid ones
            const myBenefits = [
                benefits.find(b => b.name === 'Seguro Médico' && b.tier === tier),
                benefits.find(b => b.name === 'Vacaciones' && b.tier === tier),
                tier >= 1 ? benefits.find(b => b.name === 'Aguinaldo') : null,
                tier >= 2 ? benefits.find(b => b.name === 'Bono Anual') : null,
                tier >= 3 ? benefits.find(b => b.name === 'Acciones (Stock)') : null
            ].filter(b => b);

            myBenefits.forEach(b => {
                const el = document.createElement('div');
                el.className = 'lifestyle-card';
                el.style.padding = '10px';

                let extraHtml = '';
                if (b.name === 'Vacaciones') {
                    const daysLeft = state.vacationDays || 0;
                    // Overwrite value to show days left / total
                    b.val = `${daysLeft} / ${b.val} disponibles`;
                    if (daysLeft > 0) {
                        extraHtml = `<div style="margin-top:5px; display:flex; gap:5px;">
                            <button style="font-size:0.7rem; background:#4CAF50; border:none; color:white; padding:3px 8px; border-radius:3px; cursor:pointer;" data-action="take-vacation" data-params='{"days":1}'>-1 Día</button>
                            ${daysLeft >= 7 ? '<button style="font-size:0.7rem; background:#2196F3; border:none; color:white; padding:3px 8px; border-radius:3px; cursor:pointer;" data-action="take-vacation" data-params=\'{"days":7}\'>-7 Días</button>' : ''}
                        </div>`;
                    }
                }

                el.innerHTML = `
                    <div style="font-size:0.8rem; color:#aaa;">${b.name}</div>
                    <div style="font-weight:bold; color:#fff;">${b.val}</div>
                    ${extraHtml}
                `;
                benefitsContainer.appendChild(el);
            });
        }
    },

    switchActTab(tabId) {
        // Tabs: courses, projects, crime, social
        const tabs = ['courses', 'projects', 'crime', 'social'];
        tabs.forEach(t => {
            const el = document.getElementById('act-tab-' + t);
            if (el) {
                if (t === tabId) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });

        // Update buttons state
        // Assuming buttons have onclick="GameUI.switchActTab('x')"
        // We can't easily query buttons by ID unless we gave them IDs.
        // But visual toggle relies on 'active' class on .tab-btn
        // Let's brute force valid buttons if we can select them.
        const btns = document.querySelectorAll('.act-tabs .tab-btn');
        btns.forEach(btn => {
            if (btn.innerText.toLowerCase().includes(tabId === 'courses' ? 'educación' : tabId === 'projects' ? 'proyectos' : tabId === 'crime' ? 'crimen' : 'social')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Special render if needed
        if (tabId === 'social') this.renderSocialTab();
        if (tabId === 'projects') this.renderProjects();
    },

    renderProjects() {
        const container = document.getElementById('act-tab-projects');
        if (!container) return;

        if (!state.freelancer) {
            container.innerHTML = '<div class="status-msg">Función no disponible aún.</div>';
            return;
        }

        let html = '<div class="market-card" style="background:var(--bg-card); display:block; text-align:center;">';
        html += '<h3 style="color:var(--gold-color); margin-bottom:5px;">💻 Freelancer Dashboard</h3>';
        html += '<div style="display:flex; justify-content:space-around; font-size:0.9rem; color:#aaa;">';
        html += `<div>Reputación: <span style="color:#fff; font-weight:bold;">${state.freelancer.reputation}</span></div>`;
        html += `<div>Completados: <span style="color:#fff; font-weight:bold;">${state.freelancer.completed}</span></div>`;
        html += `<div>Ganancias: <span style="color:#4dffea; font-weight:bold;">$${state.freelancer.earnings.toLocaleString()}</span></div>`;
        html += '</div></div>';

        html += '<h4 style="margin-top:20px; border-bottom:1px solid #333; padding-bottom:5px;">Changuitas Disponibles</h4>';

        if (state.freelancer.activeGigs.length === 0) {
            html += '<div class="status-msg">No hay trabajos disponibles este mes. Vuelve luego.</div>';
        } else {
            html += '<div class="lifestyle-grid">'; // Reuse grid layout
            state.freelancer.activeGigs.forEach(gig => {
                const canAfford = state.energy >= gig.energy;
                html += `
                <div class="lifestyle-card">
                    <div class="lifestyle-card-title">${gig.title}</div>
                    <div class="lifestyle-card-desc" style="font-size:0.8rem; color:#aaa;">
                        <span style="background:#333; padding:2px 6px; border-radius:4px; margin-right:5px;">${gig.type.toUpperCase()}</span>
                    </div>
                    <div class="lifestyle-card-stats">
                        <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Pago:</span><span class="lifestyle-card-stat-value positive">$${gig.reward}</span></div>
                        <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Energía:</span><span class="lifestyle-card-stat-value" style="color:#ff5555">-${gig.energy}</span></div>
                    </div>
                    <button class="lifestyle-card-btn" ${canAfford ? '' : 'disabled'} data-action="accept-gig" data-params='{"gigId":${gig.pk}}'>
                        ${canAfford ? 'Realizar Trabajo' : 'Muy Cansado'}
                    </button>
                </div>`;
            });
            html += '</div>';
        }

        container.innerHTML = html;
    },

    switchLifestyleTab(tab) {
        const housingTab = document.getElementById('lifestyle-tab-housing');
        const vehiclesTab = document.getElementById('lifestyle-tab-vehicles');
        const housingBtn = document.getElementById('tab-housing');
        const vehiclesBtn = document.getElementById('tab-vehicles');

        // Hide all tabs
        housingTab.classList.add('hidden');
        vehiclesTab.classList.add('hidden');

        // Remove active from all buttons
        housingBtn.classList.remove('active');
        vehiclesBtn.classList.remove('active');

        // Show selected tab
        if (tab === 'housing') {
            housingTab.classList.remove('hidden');
            housingBtn.classList.add('active');
        } else if (tab === 'vehicles') {
            vehiclesTab.classList.remove('hidden');
            vehiclesBtn.classList.add('active');
        } else if (tab === 'pets') {
            document.getElementById('lifestyle-tab-pets').classList.remove('hidden');
            document.getElementById('tab-pets').classList.add('active');
            this.populatePetsCards();
        }
    },

    renderCoursesContent() {
        const container = document.getElementById('act-tab-courses');
        container.innerHTML = '';

        COURSES.forEach(course => {
            const hasDegree = state.education.includes(course.id);
            const el = document.createElement('div');
            el.className = 'job-item';
            el.innerHTML = `
                <div class="job-details">
                    <h4>${course.title} ${hasDegree ? '✅' : ''}</h4>
                    <p>Costo: $${course.cost.toLocaleString()} | Duración: ${course.duration}m</p>
                    <div class="job-req">${course.degree}</div>
                </div>
                ${hasDegree ? '<span class="owned-tag">COMPLETADO</span>' :
                    `<button class="btn-buy" data-action="enroll-course" data-params='{"courseId":"${course.id}"}'>Inscribirse</button>`}
            `;
            container.appendChild(el);
        });
    },

    switchActTab(tab) {
        const courses = document.getElementById('act-tab-courses');
        const projects = document.getElementById('act-tab-projects');
        const crime = document.getElementById('act-tab-crime');
        const social = document.getElementById('act-tab-social');
        const actBtns = document.getElementById('activity-modal').querySelectorAll('.tab-btn');

        courses.classList.add('hidden');
        projects.classList.add('hidden');
        crime.classList.add('hidden');
        social.classList.add('hidden');
        actBtns.forEach(b => b.classList.remove('active'));

        if (tab === 'courses') {
            courses.classList.remove('hidden');
            actBtns[0].classList.add('active');
            this.renderCoursesContent(); // Fixed: render content, don't call Game.renderCourses
        } else if (tab === 'projects') {
            projects.classList.remove('hidden');
            actBtns[1].classList.add('active');
            this.renderProjects();
        } else if (tab === 'crime') {
            crime.classList.remove('hidden');
            actBtns[2].classList.add('active');
            // No dynamic render needed for now, static buttons
        } else {
            social.classList.remove('hidden');
            actBtns[3].classList.add('active');
            this.renderSocialTab();
        }
    },

    switchShopTab(tab) {
        const goods = document.getElementById('shop-tab-goods');
        const invest = document.getElementById('shop-tab-invest');
        const re = document.getElementById('shop-tab-realestate');
        const tabs = document.getElementById('shop-modal').querySelectorAll('.tab-btn');

        goods.classList.add('hidden');
        invest.classList.add('hidden');
        re.classList.add('hidden');
        tabs.forEach(t => t.classList.remove('active'));

        if (tab === 'goods') {
            goods.classList.remove('hidden');
            tabs[0].classList.add('active');
            this.renderShop();
        } else if (tab === 'invest') {
            invest.classList.remove('hidden');
            tabs[1].classList.add('active');
            this.renderInvestments();
        } else if (tab === 'realestate') {
            re.classList.remove('hidden');
            tabs[2].classList.add('active');
            this.renderRealEstate();
        }
    },

    renderProjects() {
        const container = document.getElementById('act-tab-projects');
        if (!container) return;
        container.innerHTML = '';

        // --- SECTION 1: FREELANCER DASHBOARD (New) ---
        if (state.freelancer) {
            let html = '<div class="market-card" style="background:var(--bg-card); display:block; text-align:center; margin-bottom:20px;">';
            html += '<h3 style="color:var(--gold-color); margin-bottom:5px;">💻 Freelancer Dashboard</h3>';
            html += '<div style="display:flex; justify-content:space-around; font-size:0.9rem; color:#aaa;">';
            html += `<div>Reputación: <span style="color:#fff; font-weight:bold;">${state.freelancer.reputation}</span></div>`;
            html += `<div>Completados: <span style="color:#fff; font-weight:bold;">${state.freelancer.completed}</span></div>`;
            html += `<div>Ganancias: <span style="color:#4dffea; font-weight:bold;">$${state.freelancer.earnings.toLocaleString()}</span></div>`;
            html += '</div></div>';

            html += '<h4 style="border-bottom:1px solid #333; padding-bottom:5px;">Changuitas Disponibles</h4>';

            if (state.freelancer.activeGigs.length === 0) {
                html += '<div class="status-msg">No hay trabajos disponibles este mes. Vuelve luego.</div>';
            } else {
                html += '<div class="lifestyle-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); margin-bottom: 30px;">';
                state.freelancer.activeGigs.forEach(gig => {
                    const canAfford = state.energy >= gig.energy;
                    html += `
                    <div class="lifestyle-card">
                        <div class="lifestyle-card-title">${gig.title}</div>
                        <div class="lifestyle-card-desc" style="font-size:0.8rem; color:#aaa;">
                            <span style="background:#333; padding:2px 6px; border-radius:4px; margin-right:5px;">${gig.type.toUpperCase()}</span>
                        </div>
                        <div class="lifestyle-card-stats">
                            <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Pago:</span><span class="lifestyle-card-stat-value positive">$${gig.reward}</span></div>
                            <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Energía:</span><span class="lifestyle-card-stat-value" style="color:#ff5555">-${gig.energy}</span></div>
                        </div>
                        <button class="lifestyle-card-btn" ${canAfford ? '' : 'disabled'} data-action="accept-gig" data-params='{"gigId":${gig.pk}}'>
                            ${canAfford ? 'Realizar Trabajo' : 'Muy Cansado'}
                        </button>
                    </div>`;
                });
                html += '</div>';
            }
            container.innerHTML += html;
        }

        // --- SECTION 2: LONG TERM PROJECTS (Legacy/Advanced) ---
        // Only show if user has key skills or items? Or always?
        // Let's hide it if no active project and low intelligence to simplify? 
        // No, keep it accessible.

        const ltHeader = document.createElement('h4');
        ltHeader.innerText = "Proyectos a Largo Plazo (Libros, Apps, Arte)";
        ltHeader.style.cssText = "margin-top:20px; color:#aaa; border-bottom:1px solid #333; padding-bottom:5px;";
        container.appendChild(ltHeader);

        if (state.activeProject) {
            const p = state.activeProject;
            const el = document.createElement('div');
            el.className = 'project-card active';
            el.style.cssText = "background:#222; padding:15px; border-radius:8px; border:1px solid #FFD700; margin-bottom:20px;";

            const progressPct = (p.progress / p.duration) * 100;

            el.innerHTML = `
                <div style="font-weight:bold; color:#FFD700; margin-bottom:5px;">Proyecto Activo: ${p.name}</div>
                <div style="font-size:0.9rem; color:#aaa; margin-bottom:10px;">Progreso: ${p.progress}/${p.duration} meses</div>
                <div style="background:#444; height:10px; border-radius:5px; overflow:hidden;">
                    <div style="background:#FFD700; height:100%; width:${progressPct}%"></div>
                </div>
                <div style="font-size:0.8rem; color:#888; margin-top:5px;">Penalización Energía: -${p.penalty}</div>
             `;
            container.appendChild(el);
        } else {
            // New Project Buttons
            const btnContainer = document.createElement('div');
            if (typeof PROJECT_TYPES !== 'undefined') {
                PROJECT_TYPES.forEach(type => {
                    const btn = document.createElement('button');
                    btn.className = 'act-btn';
                    btn.onclick = () => Game.startProject(type.id);
                    btn.innerHTML = `
                        <div class="act-info">
                            <h4>${type.name}</h4>
                            <p>${type.desc}</p>
                            <p style="font-size:0.8rem; color:#aaa;">Req: ${type.req.intelligence || 0} Int</p>
                        </div>
                        <div class="act-cost">
                            -$${type.cost}<br>
                            -${type.penalty} E/m
                        </div>
                    `;
                    btnContainer.appendChild(btn);
                });
            }
            container.appendChild(btnContainer);
        }

        // 3. Creations List
        if (state.creations && state.creations.length > 0) {
            const header = document.createElement('h4');
            header.innerText = "Tus Creaciones 🎨";
            header.style.cssText = "margin-top:20px; color:#aaa; border-bottom:1px solid #333; padding-bottom:5px;";
            container.appendChild(header);

            state.creations.forEach(c => {
                const el = document.createElement('div');
                el.className = 'creation-item';
                el.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; margin-bottom:5px; border-radius:5px;";
                el.innerHTML = `
                    <div>
                        <div style="color:#fff; font-weight:bold;">${c.name}</div>
                        <div style="font-size:0.8rem; color:#888;">${c.quality} | ${c.type}</div>
                    </div>
                    <div style="color:#4dffea; font-family:monospace;">+$${c.royalty}/mes</div>
                 `;
                container.appendChild(el);
            });
        }
    },

    renderRoutine() {
        const container = document.getElementById('routine-container');
        if (!container) return;

        const r = state.routine;
        const total = Routine.calculateTotal();
        const valid = total === 24;

        // Helper to create slider
        const mkSlider = (key, label, emoji) => `
            <div class="bar-group">
                <div class="bar-label">${emoji} ${label} <span id="val-${key}">${r[key]}h</span></div>
                <input type="range" min="0" max="24" value="${r[key]}" class="slider" 
                    oninput="Routine.setHours('${key}', this.value); UI.renderRoutine()">
            </div>
        `;

        let html = `
            <div style="text-align:center; margin-bottom:20px;">
                <h3>⏰ Distribución del Día</h3>
                <div style="font-size:2rem; color:${valid ? '#4dffea' : '#ff4d4d'}; font-weight:bold;" id="routine-total-hours">${total}h</div>
                <div style="font-size:0.8rem; color:#aaa;">Debe sumar exactamente 24h</div>
            </div>

            ${mkSlider('work', 'Trabajo', '💼')}
            ${mkSlider('sleep', 'Sueño', '💤')}
            ${mkSlider('study', 'Estudio', '📚')}
            ${mkSlider('exercise', 'Ejercicio', '💪')}
            ${mkSlider('leisure', 'Ocio', '🎮')}

            <h4 style="margin-top:20px;">⚡ Mejoras de Hogar</h4>
            <div class="job-list">
        `;

        Object.keys(Routine.UPGRADES).forEach(key => {
            const up = Routine.UPGRADES[key];
            const owned = state.upgrades && state.upgrades[key];

            html += `
                <div class="job-item">
                    <div class="job-details">
                        <h4>${up.name}</h4>
                        <p>${up.desc}</p>
                        <div class="job-req">$${up.cost}</div>
                    </div>
                    ${owned ? '<span style="color:#4dffea; fontSize:0.8rem">ADQUIRIDO</span>' :
                    `<button class="btn-buy" data-action="buy-upgrade" data-params='{"upgradeId":"${key}"}'>Comprar</button>`}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    renderSchool() {
        const container = document.getElementById('school-container');
        if (!container) return; // Need to add to index.html if not present, or reuse an existing modal

        const s = state.school;

        let focusHtml = '';
        Object.keys(School.FOCUS).forEach(key => {
            const f = School.FOCUS[key];
            const active = s.focus === key ? 'active' : '';
            focusHtml += `
                <button class="choice-btn ${active}" data-action="set-focus" data-params='{"subject":"${key}"}'>
                    <div style="font-weight:bold;">${f.name}</div>
                    <div style="font-size:0.8rem; opacity:0.8;">${f.desc}</div>
                </button>
            `;
        });

        const html = `
            <div style="text-align:center; margin-bottom:20px;">
                <div style="font-size:3rem;">🎒</div>
                <h3>Ciclo Escolar (Edad: ${state.age})</h3>
                <p>Gestiona tu tiempo hasta los 18 años.</p>
            </div>

            <div class="stats-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                <div class="stat-box">
                    <div class="label">Notas (Promedio)</div>
                    <div class="value" style="color:${s.grades > 60 ? '#4dffea' : '#ff4d4d'}">${s.grades.toFixed(1)}</div>
                </div>
                <div class="stat-box">
                    <div class="label">Popularidad</div>
                    <div class="value">${s.popularity.toFixed(0)}</div>
                </div>
                <div class="stat-box">
                    <div class="label">Presión Parental</div>
                    <div class="value" style="color:${s.pressure > 50 ? '#ff4d4d' : '#aaa'}">${s.pressure.toFixed(0)}%</div>
                </div>
            </div>

            <h4>📅 Enfoque Mensual</h4>
            <div class="choices-list">
                ${focusHtml}
            </div>`;
        container.innerHTML = html;
        // Update Dashboard GPA if element exists
        const gpaEl = document.getElementById('gpa-display');
        if (gpaEl) gpaEl.innerText = s.grades.toFixed(1);
    },

    renderActions() {
        const container = document.getElementById('actions-container');
        if (!container) return;
        container.innerHTML = '';

        if (typeof PhaseManager === 'undefined') return;

        const phase = PhaseManager.getCurrentPhase();

        if (phase && phase.actions) {
            phase.actions.forEach(act => {
                const btn = document.createElement('button');
                btn.className = 'act-btn';
                btn.id = act.id;
                btn.style.borderBottom = '2px solid ' + (act.color || '#444');
                btn.innerText = act.label;

                btn.onclick = () => {
                    act.onClick();
                };

                container.appendChild(btn);
            });
        }

        // Always add Airport button (available from age 18+)
        if (state.age >= 18 && typeof Travel !== 'undefined') {
            const airportBtn = document.createElement('button');
            airportBtn.className = 'act-btn';
            airportBtn.id = 'act-airport';
            airportBtn.style.borderBottom = '2px solid #667eea';
            airportBtn.innerText = '✈️ Aeropuerto';

            airportBtn.onclick = () => {
                Travel.openAirport();
            };

            container.appendChild(airportBtn);
        }
    },

    renderProfile() {
        const container = document.getElementById('profile-container');
        if (!container) return;

        // Avatar
        let avatar = "👶";
        if (state.age > 4) avatar = "👦";
        if (state.age > 18) avatar = "👨";
        if (state.age > 60) avatar = "👴";
        if (state.gender === 'female') {
            if (state.age > 4) avatar = "👧";
            if (state.age > 18) avatar = "👩";
            if (state.age > 60) avatar = "👵";
        }

        // Traits
        let traitsHtml = '<span style="color:#777;">Sin rasgos especiales</span>';
        if (state.traits && state.traits.length > 0) {
            traitsHtml = state.traits.map(function (t) {
                return '<span class="badge" style="background:#555; margin:2px;">' + t + '</span>';
            }).join('');
        }

        // Financials
        const fin = Game.calculateFinancials();
        const nw = Math.floor(fin.netWorth).toLocaleString();

        let statusDesc = "Clase Baja";
        if (state.money > 10000) statusDesc = "Clase Media";
        if (state.money > 100000) statusDesc = "Rico";
        if (state.money > 1000000) statusDesc = "Multimillonario";

        const html =
            '<div style="font-size:4rem; margin-bottom:10px;">' + avatar + '</div>' +
            '<h2 style="margin:0; color:var(--primary-color)">' + (state.name || 'Jugador') + '</h2>' +
            '<p style="color:#aaa; margin-top:5px;">Edad: ' + state.age + ' años</p>' +

            '<div style="background:var(--card-bg); padding:15px; border-radius:8px; margin:20px 0; border:1px solid #333;">' +
            '<div style="display:flex; justify-content:space-around; margin-bottom:10px;">' +
            '<div>' +
            '<div style="font-size:0.8rem; color:#888;">Patrimonio</div>' +
            '<div style="font-size:1.2rem; font-weight:bold; color:var(--accent-color)">$' + nw + '</div>' +
            '</div>' +
            '<div>' +
            '<div style="font-size:0.8rem; color:#888;">Estatus</div>' +
            '<div style="font-size:1.2rem; font-weight:bold;">' + statusDesc + '</div>' +
            '</div>' +
            '</div>' +
            '<hr style="border:0; border-top:1px solid #333; margin:10px 0;">' +
            '<div style="text-align:left;">' +
            '<div style="font-size:0.9rem; color:#ccc; margin-bottom:5px;">Rasgos:</div>' +
            '<div>' + traitsHtml + '</div>' +
            '</div>' +
            '</div>' +

            '<div style="text-align:left; font-size:0.9rem; color:#aaa;">' +
            '<p>🎓 Educación: ' + (state.education.length > 0 ? state.education.map(e => e.degree).join(', ') : 'Ninguna') + '</p>' +
            '<p>💼 Trabajo Actual: ' + (state.currJobId !== 'unemployed' ? state.currJobId : 'Desempleado') + '</p>' +
            '<p>🏠 Vivienda: ' + (state.housing || 'Sofá de un amigo') + '</p>' +
            '</div>';

        container.innerHTML = html;
    },

    renderSocialTab() {
        const list = document.getElementById('friends-list');
        list.innerHTML = '';

        // --- PARTNER SECTION ---
        const pSection = document.createElement('div');
        pSection.style.cssText = "border-bottom: 1px solid #444; margin-bottom: 15px; padding-bottom: 10px;";

        if (!state.partner) {
            pSection.innerHTML =
                '<h4 style="color:#aaa; margin-top:0;">Situación Sentimental</h4>' +
                '<div class="market-card" style="justify-content:center; padding: 20px;">' +
                '<button class="act-btn" style="width:100%;" data-action="find-love">' +
                'Buscar Pareja ♥ ($100)' +
                '</button>' +
                '</div>';
        } else {
            const p = state.partner;
            const statusLabels = { 'dating': 'Saliendo', 'living': 'Conviviendo', 'married': 'Casados' };
            let nextStepBtn = '';

            if (p.status === 'dating' && p.relation > 60) {
                nextStepBtn = '<button class="act-btn" style="flex:1; background:#00bcd4;" data-action="advance-relationship">Mudarse Juntos</button>';
            } else if (p.status === 'living' && p.relation > 90) {
                nextStepBtn = '<button class="act-btn" style="flex:1; background:#ff9800;" data-action="advance-relationship">Proponer Matrimonio ($2k)</button>';
            }

            pSection.innerHTML =
                '<h4 style="color:#aaa; margin-top:0;">💕 Pareja: ' + statusLabels[p.status] + '</h4>' +
                '<div class="market-card" style="display:block;">' +
                '<div style="display:flex; justify-content:space-between; margin-bottom:10px;">' +
                '<div>' +
                '<div style="font-weight:bold; color:#ff69b4;">' + p.name + '</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">' + p.jobTitle + ' ($' + p.salary + '/m)</div>' +
                '</div>' +
                '<div style="text-align:right;">' +
                '<div style="font-size:0.9rem;">Relación: ' + p.relation + '%</div>' +
                '</div>' +
                '</div>' +
                '<div style="display:flex; gap:10px;">' +
                '<button class="act-btn" style="flex:1;" data-action="date-partner">Cita ($80)</button>' +
                nextStepBtn +
                '<button class="act-btn" style="flex:1; background:#552222;" data-action="breakup">Romper</button>' +
                '</div>' +
                '</div>';
        }
        list.appendChild(pSection);

        // --- CHARITY ---
        const charity = document.createElement('div');
        charity.style.marginTop = "20px";
        charity.innerHTML =
            '<h4 style="color:#aaa; border-bottom:1px solid #333; padding-bottom:5px;">Filantropía</h4>' +
            '<button class="act-btn" data-action="donate-charity" data-params=\'{"amount":100}\'>' +
            '<div class="act-info">' +
            '<h4>Donar $100</h4>' +
            '<p>Ayuda a los necesitados.</p>' +
            '</div>' +
            '<div class="act-cost">+1 Karma</div>' +
            '</button>' +
            '<button class="act-btn" data-action="donate-charity" data-params=\'{"amount":1000}\'>' +
            '<div class="act-info">' +
            '<h4>Donar $1,000</h4>' +
            '<p>Haz una gran diferencia.</p>' +
            '</div>' +
            '<div class="act-cost">+10 Karma</div>' +
            '</button>';
        list.appendChild(charity);

        // --- FRIENDS SECTION ---
        const fHeader = document.createElement('h4');
        fHeader.innerText = "Amigos & Contactos";
        fHeader.style.color = "#aaa";
        list.appendChild(fHeader);

        if (state.friends.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'status-msg';
            empty.innerText = 'No tienes amigos. ¡Sal de fiesta!';
            list.appendChild(empty);
        } else {
            state.friends.forEach(f => {
                const isNet = f.relation > 80;

                const el = document.createElement('div');
                el.className = 'market-card';
                el.innerHTML =
                    '<div>' +
                    '<div style="font-weight:bold; color:#fff;">' + f.name + ' ' + (isNet ? '⭐' : '') + '</div>' +
                    '<div style="font-size:0.8rem; color:#aaa;">' + f.jobTitle + '</div>' +
                    '<div style="font-size:0.75rem; color:' + (isNet ? '#4dffea' : '#888') + ';">Relación: ' + f.relation + '/100</div>' +
                    '</div>' +
                    '<button class="act-btn" style="width:auto; min-height:auto; padding:5px 10px; font-size:0.8rem;" data-action="maintain-friend" data-params=\'{"friendId":"' + f.id + '"}\'>' +
                    'Llamar ($50)' +
                    '</button>';
                list.appendChild(el);
            });
        }
    },

    renderRealEstate() {
        const container = document.getElementById('realestate-list-container');
        container.innerHTML = '';

        REAL_ESTATE.forEach(prop => {
            const ownedCount = state.realEstate.filter(id => id === prop.id).length;
            const currentPrice = state.rePrices[prop.id] || prop.price;

            // Net Income calc
            const net = prop.rent - prop.maint;

            // Value change indicator (vs base price)
            const priceDiff = currentPrice - prop.price;
            const priceColor = priceDiff > 0 ? '#39FF14' : (priceDiff < 0 ? '#ff3939' : '#fff');
            const arrow = priceDiff > 0 ? '▲' : (priceDiff < 0 ? '▼' : '');

            const el = document.createElement('div');
            el.className = 'market-card';
            el.style.cssText = "display:flex; flex-direction:column; align-items:flex-start; margin-bottom:10px; padding:10px; background:#1e1e1e; border:1px solid #444; border-radius:6px;";

            const buyBtn = `<button class="act-btn" style="padding:4px 10px; min-height:auto; width:auto; font-size:0.8rem;" data-action="buy-real-estate" data-params='{"propertyId":"${prop.id}"}'>Comprar ($${currentPrice.toLocaleString()})</button>`;
            const sellBtn = ownedCount > 0 ? `<button class="act-btn" style="padding:4px 10px; min-height:auto; width:auto; font-size:0.8rem; background:#552222;" data-action="sell-real-estate" data-params='{"propertyId":"${prop.id}"}'>Vender</button>` : '';

            el.innerHTML =
                '<div style="display:flex; justify-content:space-between; width:100%; align-items:center; margin-bottom:5px;">' +
                '<span style="font-weight:bold; color:#fff; font-size:1rem;">' + prop.name + '</span>' +
                '<span style="color:' + priceColor + '; font-weight:bold;">$' + currentPrice.toLocaleString() + ' ' + arrow + '</span>' +
                '</div>' +
                '<div style="display:flex; justify-content:space-between; width:100%; font-size:0.8rem; color:#aaa; margin-bottom:8px;">' +
                '<span>Renta: $' + prop.rent + ' | Mant: $' + prop.maint + '</span>' +
                '<span>Neto: <span style="color:#' + (net > 0 ? '4dffea' : 'ff3939') + '">+$' + net + '/mes</span></span>' +
                '</div>' +
                '<div style="display:flex; justify-content:space-between; width:100%; align-items:center;">' +
                '<span style="font-size:0.8rem; color:#888;">Propiedad: ' + ownedCount + '</span>' +
                '<div style="display:flex; gap:5px;">' +
                buyBtn +
                sellBtn +
                '</div>' +
                '</div>';
            container.appendChild(el);
        });
    },

    renderInvestments() {
        const container = document.getElementById('invest-list-container');
        container.innerHTML = '';

        ASSETS.forEach(asset => {
            const price = state.marketPrices[asset.id];
            const holding = state.portfolio[asset.id];
            const profit = (price - holding.avg) * holding.qty;
            const profitClass = profit >= 0 ? 'good' : 'bad';
            const profitTxt = profit !== 0 ? '<br><span class="' + profitClass + '">P/L: $' + profit.toFixed(0) + '</span>' : '';

            const el = document.createElement('div');
            el.className = 'market-card';
            el.innerHTML =
                '<div>' +
                '<div style="font-weight:bold; color:#fff;">' + asset.name + '</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">Precio: $' + price.toFixed(2) + '</div>' +
                '<div style="font-size:0.8rem;">Posees: ' + holding.qty + ' (Media: $' + holding.avg.toFixed(0) + ')' + profitTxt + '</div>' +
                '</div>' +
                '<div style="display:flex; flex-direction:column; gap:5px;">' +
                '<button class="act-btn" style="padding:5px 10px; font-size:0.8rem; min-height:auto;" data-action="trade" data-params=\'{"assetId":"' + asset.id + '","type":"buy"}\'>Comprar</button>' +
                '<button class="act-btn" style="padding:5px 10px; font-size:0.8rem; min-height:auto; background:#552222;" data-action="trade" data-params=\'{"assetId":"' + asset.id + '","type":"sell"}\'>Vender</button>' +
                '</div>';
            container.appendChild(el);
        });
    },

    renderShop() {
        const list = this.els.modals.shopList;
        list.innerHTML = '';

        // If tab is Invest, re-render invest
        const investTab = document.getElementById('shop-tab-invest');
        if (investTab && !investTab.classList.contains('hidden')) {
            this.renderInvestments();
            return;
        }

        // Render Rare Items
        if (state.shopRare && state.shopRare.length > 0) {
            const rareHeader = document.createElement('h4');
            rareHeader.innerText = "🌟 Objetos Raros";
            rareHeader.style.cssText = "color:#FFD700; border-bottom:1px solid #FFD700; margin-bottom:10px;";
            list.appendChild(rareHeader);

            state.shopRare.forEach(item => {
                const owned = state.inventory.includes(item.id);
                const el = document.createElement('div');
                el.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:linear-gradient(45deg, #332a00, #1a1a1a); padding:10px; margin-bottom:8px; border-radius:6px; border:1px solid #FFD700;";

                el.innerHTML =
                    '<div>' +
                    '<div style="font-weight:bold; color:#FFD700;">' + item.icon + ' ' + item.name + '</div>' +
                    '<div style="font-size:0.8rem; color:#aaa;">' + item.desc + '</div>' +
                    '<div style="font-size:0.8rem; color:#aaa;">Mant: $' + item.maint + '/mes</div>' +
                    '</div>' +
                    '<button class="btn-select-job" style="border-color:#FFD700; color:#FFD700;" ' + (owned ? 'disabled' : '') + ' data-action="buy-rare-item" data-params=\'{"itemId":"' + item.id + '"}\'>' +
                    (owned ? 'Comprado' : '$' + item.price.toLocaleString()) +
                    '</button>';
                list.appendChild(el);
            });
        }

        // Render Goods
        SHOP_ITEMS.forEach(item => {
            const owned = state.inventory.includes(item.id);
            const el = document.createElement('div');
            el.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; margin-bottom:8px; border-radius:6px; border:1px solid #333;";

            el.innerHTML =
                '<div>' +
                '<div style="font-weight:bold; color:var(--text-color);">' + item.name + '</div>' +
                '<div style="font-size:0.8rem; color:#888;">' + item.desc + '</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">Mant: $' + item.maint + '/mes</div>' +
                '</div>' +
                '<button class="btn-select-job" ' + (owned ? 'disabled' : '') + ' data-action="buy-item" data-params=\'{"itemId":"' + item.id + '"}\'>' +
                (owned ? 'Comprado' : '$' + item.price) +
                '</button>';
            list.appendChild(el);
        });
    },

    renderMyHome() {
        const list = document.getElementById('family-list');
        list.innerHTML = '';

        // Summary of expenses
        const fins = Game.calculateFinancials();
        const totalFam = (fins.breakdown.pets || 0) + (fins.breakdown.children || 0);
        document.getElementById('home-total-expenses').innerText = '- $' + totalFam + '/mes';

        // Partner
        if (state.partner && (state.partner.status === 'living' || state.partner.status === 'married')) {
            const p = state.partner;
            const el = document.createElement('div');
            el.className = 'family-card';
            el.innerHTML =
                '<div>' +
                '<div style="font-weight:bold; color:#ff69b4;">' + p.name + ' (Pareja)</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">Ingreso: +$' + p.salary + '</div>' +
                '</div>' +
                '<div style="font-size:1.2rem;">❤️</div>';
            list.appendChild(el);
        }

        // Children
        state.children.forEach(child => {
            const isIndep = child.ageMonths >= 216;
            const el = document.createElement('div');
            el.className = 'family-card';
            el.style.borderLeftColor = isIndep ? '#aaa' : '#39FF14';
            el.innerHTML =
                '<div>' +
                '<div style="font-weight:bold; color:#fff;">' + child.name + ' (' + Math.floor(child.ageMonths / 12) + ' años)</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">' + (isIndep ? 'Independiente' : 'Costo: -$' + CHILD_COST + '/mes') + '</div>' +
                '</div>' +
                '<div style="font-size:1.2rem;">' + (isIndep ? '🎓' : '👶') + '</div>';
            list.appendChild(el);
        });

        // Pets
        state.pets.forEach(pet => {
            const el = document.createElement('div');
            el.className = 'family-card';
            el.style.borderLeftColor = '#FFA500';
            const petDesc = PETS.find(p => p.id === pet.id)?.desc || '';
            el.innerHTML =
                '<div>' +
                '<div style="font-weight:bold; color:#fff;">' + pet.name + '</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">' + petDesc + '</div>' +
                '</div>' +
                '<div style="font-size:1.2rem;">🐾</div>';
            list.appendChild(el);
        });

        if (state.children.length === 0 && state.pets.length === 0 && (!state.partner || (state.partner.status !== 'living' && state.partner.status !== 'married'))) {
            list.innerHTML = '<div style="text-align:center; color:#666; padding:20px;">Vives solo. ¡Consigue pareja o adopta una mascota!</div>';
        }
    },

    populateHousingCards() {
        const grid = document.getElementById('housing-grid');
        if (!grid) return;
        grid.innerHTML = '';
        HOUSING.forEach(house => {
            const isCurrent = state.housing === house.id;
            const card = document.createElement('div');
            card.className = 'lifestyle-card ' + (isCurrent ? 'current' : '');
            card.innerHTML =
                '<div class="lifestyle-card-title">' + house.name + '</div>' +
                '<div class="lifestyle-card-desc">' + house.desc + '</div>' +
                '<div class="lifestyle-card-stats">' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Costo:</span><span class="lifestyle-card-stat-value">$' + house.cost.toLocaleString() + '</span></div>' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Mant:</span><span class="lifestyle-card-stat-value">$' + house.maint.toLocaleString() + '</span></div>' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Felicidad:</span><span class="lifestyle-card-stat-value positive">+' + house.happiness + '</span></div>' +
                '</div>' +
                '<button class="lifestyle-card-btn" ' + (isCurrent ? 'disabled' : '') + ' data-action="buy-housing" data-params=\'{"housingId":"' + house.id + '"}\'>' +
                (isCurrent ? '✓ Actual' : (state.money >= house.cost ? 'Comprar/Mudar' : 'Sin Fondos')) +
                '</button>';
            grid.appendChild(card);
        });
    },

    populateVehicleCards() {
        const grid = document.getElementById('vehicles-grid');
        if (!grid) return;
        grid.innerHTML = '';
        VEHICLES.forEach(vehicle => {
            const isCurrent = state.vehicle === vehicle.id;
            const canAfford = state.money >= vehicle.cost;
            const card = document.createElement('div');
            card.className = 'lifestyle-card ' + (isCurrent ? 'current' : '');
            card.innerHTML =
                '<div class="lifestyle-card-title">' + vehicle.name + '</div>' +
                '<div class="lifestyle-card-desc">' + vehicle.desc + '</div>' +
                '<div class="lifestyle-card-stats">' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Costo:</span><span class="lifestyle-card-stat-value">' + (vehicle.cost === 0 ? 'Gratis' : '$' + vehicle.cost.toLocaleString()) + '</span></div>' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Mant:</span><span class="lifestyle-card-stat-value">$' + vehicle.maint.toLocaleString() + '</span></div>' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Estatus:</span><span class="lifestyle-card-stat-value positive">+' + vehicle.status + '</span></div>' +
                '</div>' +
                '<button class="lifestyle-card-btn" ' + (isCurrent || !canAfford ? 'disabled' : '') + ' data-action="buy-vehicle" data-params=\'{"vehicleId":"' + vehicle.id + '"}\'>' +
                (isCurrent ? '✓ Actual' : (canAfford ? 'Comprar' : 'Sin Fondos')) +
                '</button>';
            grid.appendChild(card);
        });
    },

    populatePetsCards() {
        const grid = document.getElementById('pets-grid');
        if (!grid) return;
        grid.innerHTML = '';
        PETS.forEach(pet => {
            const owned = state.pets.some(p => p.id === pet.id);
            const canAfford = state.money >= pet.cost;
            const card = document.createElement('div');
            card.className = 'lifestyle-card ' + (owned ? 'current' : '');
            card.innerHTML =
                '<div class="lifestyle-card-title">' + pet.name + '</div>' +
                '<div class="lifestyle-card-desc">' + pet.desc + '</div>' +
                '<div class="lifestyle-card-stats">' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Costo:</span><span class="lifestyle-card-stat-value">$' + pet.cost + '</span></div>' +
                '<div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Mant:</span><span class="lifestyle-card-stat-value">$' + pet.maint + '/m</span></div>' +
                '</div>' +
                '<button class="lifestyle-card-btn" ' + (owned || !canAfford ? 'disabled' : '') + ' data-action="buy-pet" data-params=\'{"petId":"' + pet.id + '"}\'>' +
                (owned ? 'Adoptado' : (canAfford ? 'Adoptar' : 'Sin Fondos')) +
                '</button>';
            grid.appendChild(card);
        });
    },

    updateLifestyleModalStatus() {
        // ...
    },

    renderJobMarket() {
        const list = this.els.modals.jobList;
        list.innerHTML = '';

        JOBS.forEach(job => {
            // FILTER: Students can only see Part-Time jobs
            if (state.isStudent) {
                if (job.type !== 'part_time' && job.id !== 'unemployed') return;
            }

            // Check requirements logic for display
            const hasInt = state.intelligence >= (job.req.int || 0);
            const hasHealth = state.physicalHealth >= (job.req.health || 0);
            const hasDeg = !job.req.deg || state.education.includes(job.req.deg);

            const canApply = hasInt && hasHealth && hasDeg;
            const isCurrent = state.currJobId === job.id;

            const el = document.createElement('div');
            el.className = 'market-card';
            if (isCurrent) el.style.borderColor = '#4dffea';

            let reqText = [];
            if (job.req.int) reqText.push('Int: ' + job.req.int);
            if (job.req.health) reqText.push('Salud: ' + job.req.health);
            if (job.req.deg) reqText.push('Título: ' + job.req.deg);

            el.innerHTML =
                '<div>' +
                '<div style="font-weight:bold; color:#fff;">' + job.title + (isCurrent ? ' (Actual)' : '') + '</div>' +
                '<div style="font-size:0.8rem; color:#aaa;">Salario: $' + job.salary + '/mes</div>' +
                '<div style="font-size:0.75rem; color:#888;">Req: ' + (reqText.join(', ') || 'Ninguno') + '</div>' +
                '</div>' +
                '<button class="act-btn" style="min-height:30px; width:auto; font-size:0.8rem; padding: 5px 10px;" ' + (isCurrent ? 'disabled' : '') + ' data-action="apply-job" data-params=\'{"jobId":"' + job.id + '"}\'>' +
                (isCurrent ? 'Tuy' : 'Aplicar') +
                '</button>';
            list.appendChild(el);
        });
    },

    renderTrophies() {
        // Target settings-modal .modal-body
        const modal = document.getElementById('settings-modal');
        if (!modal) return;
        const body = modal.querySelector('.modal-body');
        if (!body) return;

        // Check if we already added trophies to avoid dupes or full wipe
        let trophySection = document.getElementById('trophies-section');
        if (!trophySection) {
            trophySection = document.createElement('div');
            trophySection.id = 'trophies-section';
            trophySection.style.cssText = "margin-top:20px; padding-top:20px; border-top:1px solid #444;";
            body.appendChild(trophySection);
        }

        trophySection.innerHTML = '<h3>🏆 Logros</h3><div class="trophy-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>';
        const grid = trophySection.querySelector('.trophy-grid');

        if (typeof TROPHIES !== 'undefined') {
            TROPHIES.forEach(t => {
                const unlocked = state.unlockedTrophies.includes(t.id);
                const el = document.createElement('div');
                el.style.cssText = 'background: ' + (unlocked ? '#222' : '#111') + '; padding: 10px; border: 1px solid ' + (unlocked ? '#FFD700' : '#333') + '; opacity:' + (unlocked ? 1 : 0.5) + '; border-radius: 6px;';
                el.innerHTML =
                    '<div style="font-size:1.5rem;">' + t.icon + '</div>' +
                    '<div style="font-weight:bold; color:' + (unlocked ? '#FFD700' : '#888') + '; font-size:0.9rem;">' + t.name + '</div>' +
                    '<div style="font-size:0.75rem; color:#aaa;">' + t.desc + '</div>';
                grid.appendChild(el);
            });
        }
    }
};
window.GameUI = UI;
window.UI = UI;
