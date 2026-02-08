
// --- INTERNATIONAL TRAVEL SYSTEM ---

const COUNTRIES = {
    home: {
        id: 'home',
        name: '🏠 País de Origen',
        flag: '🏠',
        costOfLiving: 1.0,
        salaryMultiplier: 1.0,
        safety: 70,
        visaDifficulty: 'none',
        currency: 'HOME',
        exchangeRate: 1.0,
        culturalDistance: 0,
        description: 'Tu hogar. Familiar y cómodo.'
    },
    usa: {
        id: 'usa',
        name: '🇺🇸 Estados Unidos',
        flag: '🇺🇸',
        costOfLiving: 1.8,
        salaryMultiplier: 2.5,
        safety: 75,
        visaDifficulty: 'hard',
        currency: 'USD',
        exchangeRate: 1.0,
        culturalDistance: 40,
        description: 'Tierra de oportunidades. Salarios altos, pero caro.',
        travelCost: 1200
    },
    canada: {
        id: 'canada',
        name: '🇨🇦 Canadá',
        flag: '🇨🇦',
        costOfLiving: 1.5,
        salaryMultiplier: 2.0,
        safety: 85,
        visaDifficulty: 'medium',
        currency: 'CAD',
        exchangeRate: 0.75,
        culturalDistance: 35,
        description: 'Amigable y seguro. Excelente calidad de vida.',
        travelCost: 1100
    },
    germany: {
        id: 'germany',
        name: '🇩🇪 Alemania',
        flag: '🇩🇪',
        costOfLiving: 1.6,
        salaryMultiplier: 2.2,
        safety: 90,
        visaDifficulty: 'medium',
        currency: 'EUR',
        exchangeRate: 1.1,
        culturalDistance: 50,
        description: 'Economía fuerte. Excelente infraestructura.',
        travelCost: 900
    },
    japan: {
        id: 'japan',
        name: '🇯🇵 Japón',
        flag: '🇯🇵',
        costOfLiving: 1.7,
        salaryMultiplier: 1.8,
        safety: 95,
        visaDifficulty: 'hard',
        currency: 'JPY',
        exchangeRate: 0.0067,
        culturalDistance: 70,
        description: 'Ultra seguro. Muy diferente culturalmente.',
        travelCost: 1400
    },
    mexico: {
        id: 'mexico',
        name: '🇲🇽 México',
        flag: '🇲🇽',
        costOfLiving: 0.6,
        salaryMultiplier: 0.8,
        safety: 60,
        visaDifficulty: 'easy',
        currency: 'MXN',
        exchangeRate: 0.056,
        culturalDistance: 20,
        description: 'Bajo costo de vida. Clima cálido.',
        travelCost: 500
    },
    spain: {
        id: 'spain',
        name: '🇪🇸 España',
        flag: '🇪🇸',
        costOfLiving: 1.3,
        salaryMultiplier: 1.5,
        safety: 80,
        visaDifficulty: 'medium',
        currency: 'EUR',
        exchangeRate: 1.1,
        culturalDistance: 30,
        description: 'Buen clima mediterráneo. Estilo de vida relajado.',
        travelCost: 850
    }
};

const VISA_TYPES = {
    tourist: {
        id: 'tourist',
        name: 'Visa de Turista',
        description: 'Visita temporal. No puedes trabajar.',
        duration: 6,
        requirements: {
            money: 5000,
            intelligence: 0,
            jobRequired: false
        },
        allowWork: false
    },
    student: {
        id: 'student',
        name: 'Visa de Estudiante',
        description: 'Para estudiar en el país. Trabajo limitado.',
        duration: 24,
        requirements: {
            money: 10000,
            intelligence: 50,
            jobRequired: false,
            studentRequired: true
        },
        allowWork: true,
        workRestriction: 0.5 // 50% salary
    },
    work: {
        id: 'work',
        name: 'Visa de Trabajo',
        description: 'Requiere oferta laboral. Puedes trabajar libremente.',
        duration: 36,
        requirements: {
            money: 8000,
            intelligence: 40,
            jobRequired: true
        },
        allowWork: true
    },
    skilled: {
        id: 'skilled',
        name: 'Migrante Calificado',
        description: 'Para profesionales con experiencia.',
        duration: 60,
        requirements: {
            money: 15000,
            intelligence: 70,
            experience: 1000,
            jobRequired: false
        },
        allowWork: true
    },
    investor: {
        id: 'investor',
        name: 'Visa de Inversión',
        description: 'Para inversionistas con alto capital.',
        duration: 120,
        requirements: {
            money: 100000,
            intelligence: 0,
            jobRequired: false
        },
        allowWork: true
    }
};

const Travel = {
    init() {
        // Initialize travel system if needed
        if (!state.currentCountry) state.currentCountry = 'home';
        if (!state.homeCountry) state.homeCountry = 'home';
        if (!state.monthsInCountry) state.monthsInCountry = 999;
        if (!state.adaptationLevel) state.adaptationLevel = 100;
        if (!state.currencies) {
            state.currencies = {
                HOME: 0,
                USD: 0,
                CAD: 0,
                EUR: 0,
                JPY: 0,
                MXN: 0
            };
            // Ensure state.money isn't zeroed out if it exists
            if (typeof state.money === 'undefined') state.money = 0;
        }

        this.setupOverrides();
    },

    setupOverrides() {
        // MONKEY PATCH: Adjust prices for local currency
        if (Game._travelPatched) return;

        const originalBuyItem = Game.buyItem.bind(Game);
        Game.buyItem = (itemId) => {
            const item = SHOP_ITEMS.find(i => i.id === itemId) || RARE_ITEMS.find(i => i.id === itemId);
            if (!item) return; // Let original handle error

            const country = this.getCurrentCountry();
            // Price is in HOME, convert to Local
            const localPrice = item.price / country.exchangeRate; // CORRECTED: Price * (1/Rate) is wrong.
            // Wait. If Rate is 0.0067 (USD value of 1 JPY). 
            // 1 JPY = 0.0067 USD. 
            // Item Price $500.
            // X JPY * 0.0067 = 500.
            // X = 500 / 0.0067.
            // So Price / Rate.

            // Temporary override item price
            const originalPrice = item.price;
            item.price = localPrice;

            // Call original
            const result = originalBuyItem(itemId);

            // Restore
            item.price = originalPrice;
            return result;
        };

        const originalBuyHousing = Game.buyHousing.bind(Game);
        Game.buyHousing = (id) => {
            const h = HOUSING.find(x => x.id === id);
            if (!h) return;
            const country = this.getCurrentCountry();
            const localCost = h.cost / country.exchangeRate;

            const originalCost = h.cost;
            h.cost = localCost;

            const res = originalBuyHousing(id);
            h.cost = originalCost;
            return res;
        };

        const originalBuyVehicle = Game.buyVehicle.bind(Game);
        Game.buyVehicle = (id) => {
            const v = VEHICLES.find(x => x.id === id);
            if (!v) return;
            const country = this.getCurrentCountry();
            const localCost = v.cost / country.exchangeRate;

            const originalCost = v.cost;
            v.cost = localCost;

            const res = originalBuyVehicle(id);
            v.cost = originalCost;
            return res;
        };

        Game._travelPatched = true;
        console.log('✅ Travel System: Game functions patched for currency compliance.');
    },

    getCurrentCountry() {
        return COUNTRIES[state.currentCountry] || COUNTRIES.home;
    },

    getTotalMoney() {
        const currentCountry = this.getCurrentCountry();
        let total = 0;

        // 1. Current Wallet (Local) -> Convert to Home
        // Local * Rate = Home
        total += state.money * currentCountry.exchangeRate;

        // 2. Reserves -> Convert to Home
        for (const [currency, amount] of Object.entries(state.currencies)) {
            if (amount <= 0) continue;

            if (currency === 'HOME') {
                total += amount;
            } else {
                const country = Object.values(COUNTRIES).find(c => c.currency === currency);
                if (country) {
                    total += amount * country.exchangeRate;
                }
            }
        }
        return Math.floor(total);
    },

    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        let homeAmount = amount;

        // 1. From Source to HOME
        if (fromCurrency !== 'HOME') {
            const fromCountry = Object.values(COUNTRIES).find(c => c.currency === fromCurrency);
            // Amount * Rate = Home Value
            if (fromCountry) homeAmount = amount * fromCountry.exchangeRate;
        }

        // 2. From HOME to Target
        if (toCurrency === 'HOME') return homeAmount;

        const toCountry = Object.values(COUNTRIES).find(c => c.currency === toCurrency);
        if (toCountry) {
            // Home / Rate = Target Amount
            return homeAmount / toCountry.exchangeRate;
        }

        return amount;
    },

    canAfford(amount, currency = 'HOME') {
        const myCurrency = this.getCurrentCountry().currency;
        if (currency === myCurrency) return state.money >= amount;
        return (state.currencies[currency] || 0) >= amount;
    },

    spendMoney(amount, currency = 'HOME') {
        const currentCountry = this.getCurrentCountry();
        const myCurrency = currentCountry.currency;

        if (currency === myCurrency) {
            // Spend from active wallet
            if (state.money >= amount) {
                state.money -= amount;
                return true;
            }
        } else {
            // Spend from reserves
            if ((state.currencies[currency] || 0) >= amount) {
                state.currencies[currency] -= amount;
                return true;
            }
        }
        return false;
    },

    earnMoney(amount, currency = 'HOME') {
        const currentCountry = this.getCurrentCountry();

        if (currency === currentCountry.currency) {
            state.money += amount;
        } else {
            if (!state.currencies[currency]) state.currencies[currency] = 0;
            state.currencies[currency] += amount;
        }
    },

    checkVisaRequirements(countryId, visaType) {
        const visa = VISA_TYPES[visaType];
        const country = COUNTRIES[countryId];

        if (!visa || !country) return { canApply: false, reasons: ['País o visa inválida'] };

        const reasons = [];
        const reqs = visa.requirements;

        // Check money (Total Net Worth in HOME currency)
        const totalMoney = this.getTotalMoney();
        if (totalMoney < reqs.money) {
            reasons.push(`Necesitas $${reqs.money.toLocaleString()} (tienes $${totalMoney.toLocaleString()} eq.)`);
        }

        if (reqs.intelligence && state.intelligence < reqs.intelligence) {
            reasons.push(`Necesitas ${reqs.intelligence} de Inteligencia`);
        }
        if (reqs.experience && state.experience < reqs.experience) {
            reasons.push(`Necesitas ${reqs.experience} de Experiencia`);
        }
        if (reqs.jobRequired && state.currJobId === 'unemployed') {
            reasons.push('Necesitas una oferta laboral');
        }
        if (reqs.studentRequired && !state.isStudent) {
            reasons.push('Debes estar estudiando en universidad');
        }

        return {
            canApply: reasons.length === 0,
            reasons: reasons,
            visa: visa,
            country: country
        };
    },

    applyForVisa(countryId, visaType) {
        const check = this.checkVisaRequirements(countryId, visaType);

        if (!check.canApply) {
            UI.showAlert('Visa Denegada', check.reasons.join('\n'));
            return false;
        }

        const visa = check.visa;
        const country = check.country;

        // Application Fee: 10% of required money (in HOME currency)
        const feeHome = Math.floor(visa.requirements.money * 0.1);
        const currentCountry = this.getCurrentCountry();
        const feeLocal = this.convertCurrency(feeHome, 'HOME', currentCountry.currency);

        // Try paying local first
        if (state.money >= feeLocal) {
            state.money -= feeLocal;
        } else {
            // Try paying from HOME reserves
            if ((state.currencies['HOME'] || 0) >= feeHome) {
                state.currencies['HOME'] -= feeHome;
            } else {
                UI.showAlert('Sin Fondos', `Costo de trámite: $${feeHome} (o ${feeLocal.toFixed(0)} ${currentCountry.currency})`);
                return false;
            }
        }

        state.visaStatus = {
            countryId: countryId,
            type: visaType,
            expiryMonths: visa.duration,
            allowWork: visa.allowWork,
            workRestriction: visa.workRestriction || 1.0
        };

        UI.log(`✅ Visa aprobada para ${country.name}!`, 'good');
        UI.showAlert('¡Visa Aprobada!', `Tu permiso para ${country.name} está listo.`);
        return true;
    },

    relocate(countryId) {
        const country = COUNTRIES[countryId];
        if (!country) return false;

        if (countryId !== 'home') {
            if (!state.visaStatus || state.visaStatus.countryId !== countryId) {
                UI.showAlert('Sin Visa', `Necesitas visa para ${country.name}.`);
                return false;
            }
        }

        const travelCostHome = country.travelCost || 1000;
        const currentCountry = this.getCurrentCountry();
        // FAMILY LOGIC: Calculate total tickets
        let passengers = 1; // Self
        if (state.partner && state.partner.status === 'living' && state.partner.name) passengers++;
        if (state.children) passengers += state.children.length;

        const totalCostHome = travelCostHome * passengers;
        const totalCostLocal = this.convertCurrency(totalCostHome, 'HOME', currentCountry.currency);

        if (state.money < totalCostLocal) {
            UI.showAlert('Falta Dinero', `Pasaje Total (${passengers} pax): $${totalCostHome} (${totalCostLocal.toFixed(0)} ${currentCountry.currency})`);
            return false;
        }

        // Pay
        state.money -= totalCostLocal;

        // JOB LOGIC: Resign on move (unless remote - future proofing)
        if (state.currJobId !== 'unemployed') {
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job && !job.isRemote) { // Assuming isRemote might be added later
                state.currJobId = 'unemployed';
                state.jobXP = 0;
                state.promotions = 0;
                UI.log(`Renunciaste a tu empleo en ${currentCountry.name}.`, 'info');
            }
        }

        // WALLET SWAP
        const oldCurrency = currentCountry.currency;
        if (!state.currencies[oldCurrency]) state.currencies[oldCurrency] = 0;
        state.currencies[oldCurrency] += state.money;

        const newCurrency = country.currency;
        state.money = state.currencies[newCurrency] || 0;
        state.currencies[newCurrency] = 0;

        // Update State
        state.currentCountry = countryId;
        state.monthsInCountry = 0;
        state.adaptationLevel = (countryId === 'home') ? 100 : 0;
        if (countryId === 'home') state.visaStatus = null;

        UI.log(`✈️ Viajaste a ${country.name}.`, 'good');
        UI.showAlert('¡Bienvenido!', `Has llegado a ${country.name}.\nTu billetera ahora usa ${newCurrency}.`);

        if (countryId !== 'home') state.happiness -= 20;

        if (typeof Juice !== 'undefined') {
            Juice.screenShake(5);
            Juice.hapticFeedback('medium');
        }
        UI.render();
        return true;
    },

    updateAdaptation() {
        if (state.currentCountry === 'home') return;
        state.monthsInCountry++;

        const country = this.getCurrentCountry();
        const speed = Math.max(2, 10 - (country.culturalDistance / 10));

        if (state.adaptationLevel < 100) {
            state.adaptationLevel = Math.min(100, state.adaptationLevel + speed);
        }

        if (state.visaStatus) {
            state.visaStatus.expiryMonths--;
            if (state.visaStatus.expiryMonths === 3) {
                UI.showAlert('Visa por Vencer', 'Te quedan 3 meses de visa.');
            }
            if (state.visaStatus.expiryMonths <= 0) {
                UI.showAlert('Deportado', 'Tu visa expiró. Siendo deportado...');
                this.relocate('home');
            }
        }
    },

    openAirport() {
        this.renderAirportModal();
        UI.openModal('airport-modal');
    },

    renderAirportModal() {
        const currentCountry = this.getCurrentCountry();
        const totalMoney = this.getTotalMoney();

        let html = `
            <div style="padding: 16px; background: var(--mobile-card-bg); border-radius: 12px; margin-bottom: 16px;">
                <div style="font-size: 14px; color: var(--mobile-text-secondary);">Ubicación Actual</div>
                <div style="font-size: 20px; font-weight: 600; margin-top: 4px;">${currentCountry.flag} ${currentCountry.name}</div>
                <div style="margin-top:8px; font-size:14px;">
                    💵 Billetera: <strong>${Math.floor(state.money).toLocaleString()} ${currentCountry.currency}</strong><br>
                    🌎 Patrimonio Total: <strong>$${totalMoney.toLocaleString()}</strong> (Eq. Home)
                </div>
                ${state.visaStatus ? `
                    <div style="font-size: 12px; color: var(--mobile-accent); margin-top: 8px;">
                        📄 ${VISA_TYPES[state.visaStatus.type].name} (${state.visaStatus.expiryMonths} meses restantes)
                    </div>
                ` : ''}
                ${state.adaptationLevel < 100 && state.currentCountry !== 'home' ? `
                    <div style="margin-top: 12px;">
                        <div style="font-size: 12px; color: var(--mobile-text-secondary);">Adaptación</div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 4px; overflow: hidden;">
                            <div style="height: 100%; width: ${state.adaptationLevel}%; background: var(--mobile-accent); transition: width 0.3s;"></div>
                        </div>
                    </div>
                ` : ''}
            </div>

            <h3 style="margin: 20px 0 12px; font-size: 16px;">Destinos Disponibles</h3>
            <div class="countries-grid">
        `;

        for (const [id, country] of Object.entries(COUNTRIES)) {
            if (id === state.currentCountry) continue; // Skip current country

            const isHome = id === 'home';

            html += `
                <div class="country-card" onclick="Travel.showCountryDetails('${id}')">
                    <div class="country-flag">${country.flag}</div>
                    <div class="country-name">${country.name.replace(country.flag + ' ', '')}</div>
                    <div class="country-stats">
                        <div class="country-stat">
                            <span class="stat-label">💰 Costo</span>
                            <span class="stat-value">${(country.costOfLiving * 100).toFixed(0)}%</span>
                        </div>
                        <div class="country-stat">
                            <span class="stat-label">💵 Salario</span>
                            <span class="stat-value">${(country.salaryMultiplier * 100).toFixed(0)}%</span>
                        </div>
                        <div class="country-stat">
                            <span class="stat-label">🛡️ Seguridad</span>
                            <span class="stat-value">${country.safety}</span>
                        </div>
                    </div>
                    ${!isHome ? `<div class="country-cost">✈️ $${country.travelCost}</div>` : '<div class="country-home">🏠 Hogar</div>'}
                </div>
            `;
        }

        html += `</div>`;

        document.querySelector('#airport-modal .modal-body').innerHTML = html;
    },

    showCountryDetails(countryId) {
        const country = COUNTRIES[countryId];
        const isHome = countryId === 'home';

        let detailsHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 12px;">${country.flag}</div>
                <h2 style="font-size: 24px; margin-bottom: 8px;">${country.name.replace(country.flag + ' ', '')}</h2>
                <p style="color: var(--mobile-text-secondary); margin-bottom: 20px;">${country.description}</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                    <div style="background: var(--mobile-card-bg); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--mobile-text-secondary);">Costo de Vida</div>
                        <div style="font-size: 20px; font-weight: 600;">${(country.costOfLiving * 100).toFixed(0)}%</div>
                    </div>
                    <div style="background: var(--mobile-card-bg); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--mobile-text-secondary);">Salarios</div>
                        <div style="font-size: 20px; font-weight: 600;">${(country.salaryMultiplier * 100).toFixed(0)}%</div>
                    </div>
                    <div style="background: var(--mobile-card-bg); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--mobile-text-secondary);">Seguridad</div>
                        <div style="font-size: 20px; font-weight: 600;">${country.safety}/100</div>
                    </div>
                    <div style="background: var(--mobile-card-bg); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--mobile-text-secondary);">Moneda</div>
                        <div style="font-size: 20px; font-weight: 600;">${country.currency}</div>
                    </div>
                </div>

                ${!isHome ? `
                    <h3 style="font-size: 16px; margin: 20px 0 12px;">Tipos de Visa Disponibles</h3>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${Object.values(VISA_TYPES).map(visa => {
            const check = this.checkVisaRequirements(countryId, visa.id);
            return `
                                <button 
                                    class="visa-option ${check.canApply ? '' : 'disabled'}" 
                                    onclick="Travel.selectVisa('${countryId}', '${visa.id}')"
                                    ${!check.canApply ? 'disabled' : ''}
                                >
                                    <div style="flex: 1; text-align: left;">
                                        <div style="font-weight: 600;">${visa.name}</div>
                                        <div style="font-size: 12px; opacity: 0.7;">${visa.description}</div>
                                        <div style="font-size: 11px; margin-top: 4px;">
                                            💰 $${visa.requirements.money.toLocaleString()}
                                            ${visa.requirements.intelligence ? ` | 🧠 ${visa.requirements.intelligence}` : ''}
                                            ${visa.requirements.experience ? ` | 📊 ${visa.requirements.experience} XP` : ''}
                                        </div>
                                    </div>
                                    <div style="color: ${check.canApply ? 'var(--mobile-accent)' : '#ff4444'};">
                                        ${check.canApply ? '✓' : '✗'}
                                    </div>
                                </button>
                            `;
        }).join('')}
                    </div>
                ` : `
                    <button class="btn-primary" onclick="Travel.relocate('home')" style="width: 100%; padding: 16px; margin-top: 20px;">
                        🏠 Regresar a Casa
                    </button>
                `}

                <button class="btn-secondary" onclick="Travel.renderAirportModal()" style="width: 100%; padding: 12px; margin-top: 12px;">
                    ← Volver a Destinos
                </button>
            </div>
        `;

        document.querySelector('#airport-modal .modal-body').innerHTML = detailsHTML;
    },

    selectVisa(countryId, visaType) {
        const visa = VISA_TYPES[visaType];
        const country = COUNTRIES[countryId];

        UI.showAlert(
            `Aplicar ${visa.name}`,
            `¿Deseas aplicar a ${visa.name} para ${country.name}?\n\nCosto de aplicación: $${Math.floor(visa.requirements.money * 0.1).toLocaleString()}\n\nSi es aprobada, podrás mudarte a este país.`,
            () => {
                if (this.applyForVisa(countryId, visaType)) {
                    this.showCountryDetails(countryId);
                }
            }
        );
    }
};
