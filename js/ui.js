
const UI = {
    els: {
        date: document.getElementById('date-display'),
        money: document.getElementById('money-display'),
        jobTitle: document.getElementById('job-title-display'),
        jobTrigger: document.getElementById('job-trigger'),
        bars: {
            health: document.getElementById('health-bar'),
            happy: document.getElementById('happiness-bar'),
            energy: document.getElementById('energy-bar'),
            intel: document.getElementById('intel-bar'),
            mhealth: document.getElementById('mhealth-bar')
        },
        vals: {
            health: document.getElementById('health-val'),
            happy: document.getElementById('happiness-val'),
            energy: document.getElementById('energy-val'),
            intel: document.getElementById('intel-val'),
            mhealth: document.getElementById('mhealth-val')
        },
        log: document.getElementById('event-log'),
        btns: {
            work: document.getElementById('btn-work'),
            study: document.getElementById('btn-study'),
            rest: document.getElementById('btn-rest'),
            next: document.getElementById('btn-next'),
            settings: document.getElementById('settings-trigger'),
            trophy: document.getElementById('trophy-trigger')
        },
        modals: {
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
        },
        auth: {
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
        }
    },

    render() {
        // Date
        const totalM = (CONFIG.startAge * 12) + state.totalMonths;
        const yrs = Math.floor(totalM / 12);
        const mos = (totalM % 12) + 1;
        this.els.date.innerText = `Año ${yrs} - Mes ${mos}`;

        // Money Animation
        this.animateNumber(this.els.money, parseInt(this.els.money.innerText.replace(/[^0-9-]/g, '')) || 0, state.money);

        // Finance Panel
        const fin = Game.calculateFinancials();
        document.getElementById('networth-val').innerText = `$${Math.floor(fin.netWorth).toLocaleString()}`;

        // Color passive income
        const piEl = document.getElementById('income-passive');
        piEl.innerText = `$${Math.floor(fin.passiveIncome)}/m`;

        const aiEl = document.getElementById('income-active');
        aiEl.innerText = `$${Math.floor(fin.activeIncome)}/m`;

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
        if (fin.passiveIncome >= fin.expenses && !state.financialFreedom) {
            state.financialFreedom = true;
            this.showAlert("¡LIBERTAD FINANCIERA! 🚀", "Tus ingresos pasivos superan tus gastos. ¡Eres libre!");
        }

        // Job
        const job = JOBS.find(j => j.id === state.currJobId) || JOBS[0];
        this.els.jobTitle.innerText = `${job.title} ($${job.salary}/mes)`;
        // XP Bar
        document.getElementById('job-xp-bar').style.width = `${state.jobXP}%`;

        // Calculate Energy Cost for display (optional, but good for UX)
        let energyCost = Math.max(10, 30 - (state.promotions * 2));
        const workBtnIcon = this.els.btns.work.querySelector('.btn-icon');

        // Diploma Display
        const diploContainer = document.getElementById('diploma-display');
        if (state.education && state.education.length > 0) {
            diploContainer.innerHTML = '🎓 ' + state.education.map(d => COURSES.find(c => c.id === d)?.degree || d).join(', ');
        } else {
            diploContainer.innerHTML = '';
        }

        // Bars
        const setBar = (type, val, max = 100) => {
            const pct = Math.min(100, Math.max(0, (val / max) * 100));
            this.els.bars[type].style.width = `${pct}%`;
            this.els.vals[type].innerText = type === 'intel' ? val : `${Math.floor(val)}%`;
        };

        setBar('health', state.physicalHealth);
        if (state.physicalHealth < 20) this.els.bars.health.classList.add('critical');
        else this.els.bars.health.classList.remove('critical');

        setBar('mhealth', state.mentalHealth);
        if (state.mentalHealth < 20) this.els.bars.mhealth.classList.add('critical');
        else this.els.bars.mhealth.classList.remove('critical');

        setBar('happy', state.happiness);
        setBar('energy', state.energy);
        setBar('intel', state.intelligence, 100);

        // Button States (Energy Check)
        const hasEnergy = state.energy >= 20;
        const isSick = state.sickDuration > 0;

        this.els.btns.work.disabled = !hasEnergy || isSick;
        this.els.btns.study.disabled = !hasEnergy; // This is now 'Mejorar' btn
        this.els.btns.rest.disabled = state.energy >= 100;

        if (isSick) {
            this.els.btns.work.innerHTML = '<span class="btn-icon">🤒</span>Enfermo';
        } else {
            this.els.btns.work.innerHTML = '<span class="btn-icon">💼</span>Trabajar';
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

        // Remove class then re-add to restart animation
        el.classList.remove('gain', 'loss');
        void el.offsetWidth; // Force reflow
        el.classList.add(isGain ? 'gain' : 'loss');

        const color = isGain ? '#39FF14' : '#FF3939';
        const sign = isGain ? '+' : '';
        this.floatText(`${sign}$${Math.abs(amount)}`, color);

        if (isGain && amount >= 100) {
            this.spawnParticles('💸', 3);
            if (amount >= 1000) Haptics.medium();
        } else if (!isGain) {
            Haptics.pulse(); // Small haptic on loss
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
            Game.renderCourses(); // Helper to re-render courses
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
        const container = document.getElementById('projects-container');
        container.innerHTML = '';

        // 1. Active Project
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
            // Start New Project List
            const header = document.createElement('h4');
            header.innerText = "Iniciar Nuevo Proyecto";
            header.style.cssText = "color:#aaa; border-bottom:1px solid #333; padding-bottom:5px; margin-top:0;";
            container.appendChild(header);

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
                container.appendChild(btn);
            });
        }

        // 2. Creations List
        if (state.creations.length > 0) {
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

    renderSocialTab() {
        const list = document.getElementById('friends-list');
        list.innerHTML = '';

        // --- PARTNER SECTION ---
        const pSection = document.createElement('div');
        pSection.style.cssText = "border-bottom: 1px solid #444; margin-bottom: 15px; padding-bottom: 10px;";

        if (!state.partner) {
            pSection.innerHTML = `
                <h4 style="color:#aaa; margin-top:0;">Situación Sentimental</h4>
                <div class="market-card" style="justify-content:center; padding: 20px;">
                    <button class="act-btn" style="width:100%;" onclick="Game.findLove()">
                        Buscar Pareja ♥ ($100)
                    </button>
                </div>
            `;
        } else {
            const p = state.partner;
            const statusLabels = { 'dating': 'Saliendo', 'living': 'Conviviendo', 'married': 'Casados' };
            let nextStepBtn = '';

            if (p.status === 'dating' && p.relation > 60) {
                nextStepBtn = `<button class="act-btn" style="flex:1; background:#00bcd4;" onclick="Game.advanceRel()">Mudarse Juntos</button>`;
            } else if (p.status === 'living' && p.relation > 90) {
                nextStepBtn = `<button class="act-btn" style="flex:1; background:#ff9800;" onclick="Game.advanceRel()">Proponer Matrimonio ($2k)</button>`;
            }

            pSection.innerHTML = `
                <h4 style="color:#aaa; margin-top:0;">💕 Pareja: ${statusLabels[p.status]}</h4>
                <div class="market-card" style="display:block;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <div>
                            <div style="font-weight:bold; color:#ff69b4;">${p.name}</div>
                            <div style="font-size:0.8rem; color:#aaa;">${p.jobTitle} ($${p.salary}/m)</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.9rem;">Relación: ${p.relation}%</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="act-btn" style="flex:1;" onclick="Game.datePartner()">Cita ($80)</button>
                        ${nextStepBtn}
                        <button class="act-btn" style="flex:1; background:#552222;" onclick="Game.breakup()">Romper</button>
                    </div>
                </div>
            `;
        }
        list.appendChild(pSection);

        // --- CHARITY ---
        const charity = document.createElement('div');
        charity.style.marginTop = "20px";
        charity.innerHTML = `
            <h4 style="color:#aaa; border-bottom:1px solid #333; padding-bottom:5px;">Filantropía</h4>
             <button class="act-btn" onclick="Game.donateCharity(100)">
                <div class="act-info">
                    <h4>Donar $100</h4>
                    <p>Ayuda a los necesitados.</p>
                </div>
                <div class="act-cost">+1 Karma</div>
            </button>
            <button class="act-btn" onclick="Game.donateCharity(1000)">
                <div class="act-info">
                    <h4>Donar $1,000</h4>
                    <p>Haz una gran diferencia.</p>
                </div>
                <div class="act-cost">+10 Karma</div>
            </button>
        `;
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
                el.innerHTML = `
               <div>
                   <div style="font-weight:bold; color:#fff;">${f.name} ${isNet ? '⭐' : ''}</div>
                   <div style="font-size:0.8rem; color:#aaa;">${f.jobTitle}</div>
                   <div style="font-size:0.75rem; color:${isNet ? '#4dffea' : '#888'};">Relación: ${f.relation}/100</div>
               </div>
               <button class="act-btn" style="width:auto; min-height:auto; padding:5px 10px; font-size:0.8rem;" onclick="Game.maintainFriend('${f.id}')">
                   Llamar ($50)
               </button>
            `;
                list.appendChild(el);
            });
        }
    },

    renderRealEstate() {
        const container = document.getElementById('realestate-list-container');
        container.innerHTML = '';

        REAL_ESTATE.forEach(prop => {
            const ownedCount = state.realEstate.filter(id => id === prop.id).length;
            const currentPrice = state.rePrices[prop.id];

            // Net Income calc
            const net = prop.rent - prop.maint;

            const el = document.createElement('div');
            el.className = 'market-card';
            el.style.cssText = "display:flex; flex-direction:column; align-items:flex-start; margin-bottom:10px; padding:10px; background:#1e1e1e; border:1px solid #444; border-radius:6px;";

            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center; margin-bottom:5px;">
                    <span style="font-weight:bold; color:#fff; font-size:1rem;">${prop.name}</span>
                    <span style="color:var(--accent-color); font-weight:bold;">$${currentPrice.toLocaleString()}</span>
                </div>
                <div style="display:flex; justify-content:space-between; width:100%; font-size:0.8rem; color:#aaa; margin-bottom:8px;">
                    <span>Renta: $${prop.rent} | Mant: $${prop.maint}</span>
                    <span>Neto: <span style="color:#${net > 0 ? '4dffea' : 'ff3939'}">+$${net}/mes</span></span>
                </div>
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <span style="font-size:0.8rem; color:#888;">Propiedad: ${ownedCount}</span>
                    <div style="display:flex; gap:5px;">
                        <button class="act-btn" style="padding:4px 10px; min-height:auto; width:auto; font-size:0.8rem;" onclick="Game.buyRealEstate('${prop.id}')">Comprar</button>
                        ${ownedCount > 0 ? `<button class="act-btn" style="padding:4px 10px; min-height:auto; width:auto; font-size:0.8rem; background:#552222;" onclick="Game.sellRealEstate('${prop.id}')">Vender</button>` : ''}
                    </div>
                </div>
            `;
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
            const profitTxt = profit !== 0 ? `<br><span class="${profitClass}">P/L: $${profit.toFixed(0)}</span>` : '';

            const el = document.createElement('div');
            el.className = 'market-card';
            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#fff;">${asset.name}</div>
                    <div style="font-size:0.8rem; color:#aaa;">Precio: $${price.toFixed(2)}</div>
                    <div style="font-size:0.8rem;">Posees: ${holding.qty} (Media: $${holding.avg.toFixed(0)})${profitTxt}</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                     <button class="act-btn" style="padding:5px 10px; font-size:0.8rem; min-height:auto;" onclick="Game.trade('${asset.id}', 'buy')">Comprar</button>
                     <button class="act-btn" style="padding:5px 10px; font-size:0.8rem; min-height:auto; background:#552222;" onclick="Game.trade('${asset.id}', 'sell')">Vender</button>
                </div>
            `;
            container.appendChild(el);
        });
    },

    renderShop() {
        const list = this.els.modals.shopList;
        list.innerHTML = ''; // Start fresh

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

                el.innerHTML = `
                    <div>
                        <div style="font-weight:bold; color:#FFD700;">${item.icon} ${item.name}</div>
                        <div style="font-size:0.8rem; color:#aaa;">${item.desc}</div>
                        <div style="font-size:0.8rem; color:#aaa;">Mant: $${item.maint}/mes</div>
                    </div>
                    <button class="btn-select-job" style="border-color:#FFD700; color:#FFD700;" ${owned ? 'disabled' : ''} onclick="Game.buyRareItem('${item.id}')">
                        ${owned ? 'Comprado' : '$' + item.price.toLocaleString()}
                    </button>
                `;
                list.appendChild(el);
            });
        }

        // Render Goods
        SHOP_ITEMS.forEach(item => {
            const owned = state.inventory.includes(item.id);
            const el = document.createElement('div');
            // Style inline for simplicity as requested
            el.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; margin-bottom:8px; border-radius:6px; border:1px solid #333;";

            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:var(--text-color);">${item.name}</div>
                    <div style="font-size:0.8rem; color:#888;">${item.desc}</div>
                    <div style="font-size:0.8rem; color:#aaa;">Mant: $${item.maint}/mes</div>
                </div>
                <button class="btn-select-job" ${owned ? 'disabled' : ''} onclick="Game.buyItem('${item.id}')">
                    ${owned ? 'Comprado' : '$' + item.price}
                </button>
            `;
            list.appendChild(el);
        });
    },

    renderMyHome() {
        const list = document.getElementById('family-list');
        list.innerHTML = '';

        // Summary of expenses
        const fins = Game.calculateFinancials();
        const totalFam = (fins.breakdown.pets || 0) + (fins.breakdown.children || 0);
        document.getElementById('home-total-expenses').innerText = `-$${totalFam}/mes`;

        // Partner
        if (state.partner && (state.partner.status === 'living' || state.partner.status === 'married')) {
            const p = state.partner;
            const el = document.createElement('div');
            el.className = 'family-card';
            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#ff69b4;">${p.name} (Pareja)</div>
                    <div style="font-size:0.8rem; color:#aaa;">Ingreso: +$${p.salary}</div>
                </div>
                <div style="font-size:1.2rem;">❤️</div>
            `;
            list.appendChild(el);
        }

        // Children
        state.children.forEach(child => {
            const isIndep = child.ageMonths >= 216;
            const el = document.createElement('div');
            el.className = 'family-card';
            el.style.borderLeftColor = isIndep ? '#aaa' : '#39FF14';
            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#fff;">${child.name} (${Math.floor(child.ageMonths / 12)} años)</div>
                    <div style="font-size:0.8rem; color:#aaa;">${isIndep ? 'Independiente' : `Costo: -$${CHILD_COST}/mes`}</div>
                </div>
                <div style="font-size:1.2rem;">${isIndep ? '🎓' : '👶'}</div>
            `;
            list.appendChild(el);
        });

        // Pets
        state.pets.forEach(pet => {
            const el = document.createElement('div');
            el.className = 'family-card';
            el.style.borderLeftColor = '#FFA500';
            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#fff;">${pet.name}</div>
                    <div style="font-size:0.8rem; color:#aaa;">${PETS.find(p => p.id === pet.id)?.desc || ''}</div>
                </div>
                <div style="font-size:1.2rem;">🐾</div>
            `;
            list.appendChild(el);
        });

        if (state.children.length === 0 && state.pets.length === 0 && (!state.partner || (state.partner.status !== 'living' && state.partner.status !== 'married'))) {
            list.innerHTML = '<div style="text-align:center; color:#666; padding:20px;">Vives solo. ¡Consigue pareja o adopta una mascota!</div>';
        }
    },

    // Additional missing methods from the gap read? 
    // Checking lines 4550-4595 from view 1163 which are UI methods.
    // Ah, lines 4550+ in View 1163 seem to be inside `renderVehicleCards` or similar?
    // Let's check view 1163 again.
    // Line 4550 is `const card ...`. It's inside a loop.
    // Line 4583 is `buyHousingFromModal`.
    // Line 4590 is `buyVehicleFromModal`.
    // Line 4597 is `renderCourses`.
    // Line 4601 is `calculateFinancials`. THIS IS GAME LOGIC.
    // Wait, `calculateFinancials` is usually on `Game`.
    // Let's check if it is `UI` or `Game`.
    // In view 1163, line 4601 is `calculateFinancials() {`.
    // Is it inside `UI` or `Game`?
    // `Game` started at 2978. `DB` starts at 4697.
    // So `calculateFinancials` is inside `Game`.

    // What about `renderVehicleCards`?
    // I need to find where `populateHousingCards` and `populateVehicleCards` act.
    // They are likely in `UI`.
    // I need to ensure I include all UI methods.

    populateHousingCards() {
        const grid = document.getElementById('housing-grid');
        if (!grid) return;
        grid.innerHTML = '';
        HOUSING.forEach(house => {
            const isCurrent = state.housing === house.id;
            const card = document.createElement('div');
            card.className = `lifestyle-card ${isCurrent ? 'current' : ''}`;
            card.innerHTML = `
                 <div class="lifestyle-card-title">${house.name}</div>
                 <div class="lifestyle-card-desc">${house.desc}</div>
                 <div class="lifestyle-card-stats">
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Costo:</span><span class="lifestyle-card-stat-value">$${house.cost.toLocaleString()}</span></div>
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Mant:</span><span class="lifestyle-card-stat-value">$${house.maint.toLocaleString()}</span></div>
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Felicidad:</span><span class="lifestyle-card-stat-value positive">+${house.happiness}</span></div>
                 </div>
                 <button class="lifestyle-card-btn" ${isCurrent ? 'disabled' : ''} onclick="Game.buyHousingFromModal('${house.id}')">
                     ${isCurrent ? '✓ Actual' : (state.money >= house.cost ? 'Comprar/Mudar' : 'Sin Fondos')}
                 </button>
             `;
            grid.appendChild(card);
        });
    },

    populateVehicleCards() {
        // ... (existing vehicle logic) ...
        const grid = document.getElementById('vehicles-grid');
        if (!grid) return;
        grid.innerHTML = '';
        VEHICLES.forEach(vehicle => {
            const isCurrent = state.vehicle === vehicle.id;
            const canAfford = state.money >= vehicle.cost;
            const card = document.createElement('div');
            card.className = `lifestyle-card ${isCurrent ? 'current' : ''}`;
            card.innerHTML = `
                 <div class="lifestyle-card-title">${vehicle.name}</div>
                 <div class="lifestyle-card-desc">${vehicle.desc}</div>
                 <div class="lifestyle-card-stats">
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Costo:</span><span class="lifestyle-card-stat-value">${vehicle.cost === 0 ? 'Gratis' : '$' + vehicle.cost.toLocaleString()}</span></div>
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Mant:</span><span class="lifestyle-card-stat-value">$${vehicle.maint.toLocaleString()}</span></div>
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Estatus:</span><span class="lifestyle-card-stat-value positive">+${vehicle.status}</span></div>
                 </div>
                 <button class="lifestyle-card-btn" ${isCurrent || !canAfford ? 'disabled' : ''} onclick="Game.buyVehicleFromModal('${vehicle.id}')">
                     ${isCurrent ? '✓ Actual' : (canAfford ? 'Comprar' : 'Sin Fondos')}
                 </button>
             `;
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
            card.className = `lifestyle-card ${owned ? 'current' : ''}`;
            card.innerHTML = `
                 <div class="lifestyle-card-title">${pet.name}</div>
                 <div class="lifestyle-card-desc">${pet.desc}</div>
                 <div class="lifestyle-card-stats">
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Costo:</span><span class="lifestyle-card-stat-value">$${pet.cost}</span></div>
                     <div class="lifestyle-card-stat"><span class="lifestyle-card-stat-label">Mant:</span><span class="lifestyle-card-stat-value">$${pet.maint}/m</span></div>
                 </div>
                 <button class="lifestyle-card-btn" ${owned || !canAfford ? 'disabled' : ''} onclick="Game.buyPet('${pet.id}')">
                     ${owned ? 'Adoptado' : (canAfford ? 'Adoptar' : 'Sin Fondos')}
                 </button>
             `;
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
            if (job.req.int) reqText.push(`Int: ${job.req.int}`);
            if (job.req.health) reqText.push(`Salud: ${job.req.health}`);
            if (job.req.deg) reqText.push(`Título: ${job.req.deg}`);

            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#fff;">${job.title} ${isCurrent ? '(Actual)' : ''}</div>
                    <div style="font-size:0.8rem; color:#aaa;">Salario: $${job.salary}/mes</div>
                    <div style="font-size:0.75rem; color:#888;">Req: ${reqText.join(', ') || 'Ninguno'}</div>
                </div>
                <button class="act-btn" style="min-height:30px; width:auto; font-size:0.8rem; padding: 5px 10px;" 
                    ${isCurrent ? 'disabled' : ''} 
                    onclick="Game.applyJob('${job.id}')">
                    ${isCurrent ? 'Tuy' : 'Aplicar'}
                </button>
            `;
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
                el.style.cssText = `background:${unlocked ? '#222' : '#111'}; padding:10px; border:1px solid ${unlocked ? '#FFD700' : '#333'}; opacity:${unlocked ? 1 : 0.5}; border-radius:6px;`;
                el.innerHTML = `
                    <div style="font-size:1.5rem;">${t.icon}</div>
                    <div style="font-weight:bold; color:${unlocked ? '#FFD700' : '#888'}; font-size:0.9rem;">${t.name}</div>
                    <div style="font-size:0.75rem; color:#aaa;">${t.desc}</div>
                `;
                grid.appendChild(el);
            });
        }
    }
};
window.GameUI = UI;
window.UI = UI;
