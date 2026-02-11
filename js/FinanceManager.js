/**
 * FinanceManager - Centralized financial calculations and processing
 * Handles all income, expenses, loans, and bankruptcy logic
 */

const FinanceManager = {
    /**
     * Calculate net salary after taxes
     * @param {number} grossSalary - Gross monthly salary
     * @returns {object} - { gross, taxes, net, taxRate }
     */
    calculateNetSalary(grossSalary) {
        let taxRate = 0;

        if (grossSalary < 2000) {
            taxRate = 0.05; // 5%
        } else if (grossSalary < 5000) {
            taxRate = 0.15; // 15%
        } else if (grossSalary < 10000) {
            taxRate = 0.25; // 25%
        } else {
            taxRate = 0.35; // 35%
        }

        const taxes = Math.floor(grossSalary * taxRate);
        const netSalary = grossSalary - taxes;

        return {
            gross: grossSalary,
            taxes: taxes,
            net: netSalary,
            taxRate: Math.floor(taxRate * 100)
        };
    },

    /**
     * Process all monthly financial transactions
     * Called once per month from Game.nextMonth()
     */
    processMonthlyFinances() {
        this.checkFiring(); // Check for firing BEFORE processing income
        this.processIncome();
        this.processExpenses();
        this.processLoans();
        this.checkBankruptcy();
        this.processBoredom();
        this.processJobEffects();
    },

    /**
     * Process all sources of income
     * - Job salary
     * - Passive income (business, investments, real estate)
     * - Unemployment Insurance
     */
    processIncome() {
        let totalIncome = 0;

        // 0. Unemployment Insurance
        if (state.currJobId === 'unemployed' && state.unemployment && state.unemployment.months > 0) {
            totalIncome += state.unemployment.amount;
            state.unemployment.months--;
            UI.log(`🏛️ Seguro de Desempleo: +$${Math.floor(state.unemployment.amount)} (${state.unemployment.months} meses restantes)`, 'money');
            if (state.unemployment.months <= 0) {
                UI.log("⚠️ Tu seguro de desempleo ha expirado.", "warning");
                delete state.unemployment;
            }
        }

        // 1. Job Salary (if employed)
        if (state.currJobId !== 'unemployed') {
            // AUTO-ATTENDANCE: Assume work unless stated otherwise
            state.workedThisMonth = true;

            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) {
                let grossSalary = job.salary;

                // Item bonuses
                if (state.inventory && state.inventory.includes('suit')) {
                    grossSalary *= 1.1; // +10% with suit
                }
                if (job.career === 'tech' && state.inventory && state.inventory.includes('laptop')) {
                    grossSalary *= 1.2; // +20% for tech jobs with laptop
                }

                // World effects (economic trends)
                const effects = World.getEffects ? World.getEffects() : {};
                if (effects.jobSalary && state.world && state.world.currentTrend) {
                    if (state.world.currentTrend.type === 'tech' && job.career === 'tech') {
                        grossSalary *= effects.jobSalary;
                    }
                }

                // TRAVEL SYSTEM: Apply country salary multiplier & exchange rate
                if (typeof Travel !== 'undefined' && state.currentCountry) {
                    const country = Travel.getCurrentCountry();
                    if (country) {
                        if (country.salaryMultiplier) {
                            grossSalary *= country.salaryMultiplier;
                        }
                        // Convert to local currency
                        if (country.exchangeRate) {
                            grossSalary /= country.exchangeRate;
                        }
                    }

                    // Apply visa work restrictions
                    if (state.visaStatus && state.visaStatus.workRestriction) {
                        grossSalary *= state.visaStatus.workRestriction;
                        if (state.visaStatus.workRestriction < 1) {
                            UI.log(`⚠️ Tu visa de estudiante limita tu salario al ${(state.visaStatus.workRestriction * 100)}%`, 'warning');
                        }
                    }
                }

                // Apply taxes
                const salaryData = this.calculateNetSalary(grossSalary);
                const netSalary = salaryData.net;

                totalIncome += netSalary;
                UI.log(`Salario: $${Math.floor(grossSalary)} - Impuestos (${salaryData.taxRate}%): -$${salaryData.taxes} = $${netSalary}`, 'money');

                // Bonus chance (for PM and other jobs)
                if (job.bonusChance && Math.random() < job.bonusChance) {
                    const bonus = job.bonusAmount || 0;
                    totalIncome += bonus;
                    UI.log(`¡Bono por desempeño! +$${bonus}`, 'good');
                }
            }
        }

        // 2. Business Income
        if (state.business && state.business.active) {
            let bizIncome = state.business.revenue || 0;

            // TRAVEL SYSTEM: Convert Business Income (Assumed HOME) to Local
            if (typeof Travel !== 'undefined' && state.currentCountry) {
                const country = Travel.getCurrentCountry();
                if (country && country.exchangeRate) {
                    bizIncome /= country.exchangeRate;
                }
            }

            totalIncome += bizIncome;
            if (bizIncome > 0) {
                UI.log(`Ingresos del negocio: +$${Math.floor(bizIncome)}`, 'money');
            }
        }

        // 3. Real Estate Income
        if (state.realEstate && state.realEstate.length > 0) {
            let rentalIncome = 0;
            state.realEstate.forEach(prop => {
                const property = REAL_ESTATE.find(r => r.id === prop);
                if (property && property.rental) {
                    rentalIncome += property.rental;
                }
            });

            // TRAVEL SYSTEM: Convert Rental Income (Assumed HOME) to Local
            if (typeof Travel !== 'undefined' && state.currentCountry) {
                const country = Travel.getCurrentCountry();
                if (country && country.exchangeRate) {
                    rentalIncome /= country.exchangeRate;
                }
            }

            if (rentalIncome > 0) {
                totalIncome += rentalIncome;
                UI.log(`Ingresos por alquiler: +$${Math.floor(rentalIncome)}`, 'money');
            }
        }

        // 4. Investment Returns (simplified - could be expanded)
        if (state.investments && state.investments > 0) {
            // Average 0.5% monthly return (6% annual)
            let returns = state.investments * 0.005;

            // TRAVEL SYSTEM: Convert Investment Returns (Assumed HOME) to Local
            if (typeof Travel !== 'undefined' && state.currentCountry) {
                const country = Travel.getCurrentCountry();
                if (country && country.exchangeRate) {
                    returns /= country.exchangeRate;
                }
            }

            totalIncome += returns;
            if (returns > 100) {
                UI.log(`Retornos de inversión: +$${Math.floor(returns)}`, 'money');
            }
        }

        // Apply income
        if (totalIncome > 0) {
            Game.updateStat('money', totalIncome);
        }

        return totalIncome;
    },

    /**
     * Process all monthly expenses
     * - Cost of living (housing, food, utilities)
     * - Family expenses (partner, children, pets)
     * - Loan payments
     * - CRISIS LOGGING: Hunger and health penalty if broke
     */
    processExpenses() {
        // CHILDREN DON'T PAY EXPENSES - Skip entirely for under 18
        // CHILDREN DON'T PAY EXPENSES - Skip entirely for under 18
        if (state.age < 18 || state.isStudent) {
            return; // Exit early - no expenses for children or students
        }

        let totalExpenses = 0;
        // Apply Global Inflation
        const inflation = state.world.inflation || 1.0;

        // 1. Cost of Living
        let costOfLiving = this.calculateCostOfLiving();
        costOfLiving *= inflation; // Apply Inflation
        totalExpenses += costOfLiving;

        if (costOfLiving > 0) {
            UI.log(`Gastos de vida (Inflación x${inflation.toFixed(2)}): -$${Math.floor(costOfLiving)}`, 'expense');
        }

        // 2. Family Expenses
        let familyExpenses = this.calculateFamilyExpenses();
        familyExpenses *= inflation; // Apply Inflation
        totalExpenses += familyExpenses;

        if (familyExpenses > 0) {
            UI.log(`Gastos familiares: -$${Math.floor(familyExpenses)}`, 'expense');
        }

        // 3. Property Expenses (maintenance, taxes)
        // Property taxes usually adjust slower, but maintenance follows inflation
        let propertyExpenses = this.calculatePropertyExpenses();
        propertyExpenses *= inflation;
        totalExpenses += propertyExpenses;

        if (propertyExpenses > 0) {
            UI.log(`Gastos de propiedades: -$${Math.floor(propertyExpenses)}`, 'expense');
        }

        // 4. REALISM: Income Tax
        // FIXED: Taxes are already deducted in processIncome() via calculateNetSalary().
        // Removing this second deduction to avoid double taxation.
        /*
        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            const taxRate = country.taxRate || 0.15; // default 15

            // Tax base: Active + Passive Income
            const totalIncome = financeSummary.activeIncome + financeSummary.passiveIncome;

            if (totalIncome > 0) {
                const taxAmount = totalIncome * taxRate;
                totalExpenses += taxAmount;
                UI.log(`Impuestos (${(taxRate * 100).toFixed(0)}% en ${country.name}): -$${Math.floor(taxAmount)}`, 'expense');
            }
        }
        */

        // CRISIS CHECK: Can we pay?
        if (state.money < totalExpenses) {
            // Can't pay full expenses
            const deficit = totalExpenses - state.money; // Amount we go under

            // Allow going into debt via auto-loans later, BUT penalize health immediately due to stress/hunger
            // if deficit is huge relative to needs

            if (state.money < costOfLiving) {
                // EXTREME POVERTY: Hunger
                Game.updateStat('physicalHealth', -20);
                Game.updateStat('happiness', -20);
                Game.updateStat('energy', -50);
                UI.log("💀 Has pasado hambre este mes. Tu salud se deteriora gravemente.", "bad");
                UI.showAlert("HAMBRE EXTREMA", "No tienes dinero suficiente ni para comer. Tu cuerpo está sufriendo.");
            } else {
                // MODERATE POVERTY: Stress
                Game.updateStat('stress', 15);
                Game.updateStat('happiness', -5);
                UI.log("⚠️ Estás viviendo al límite. Las deudas se acumulan.", "warning");
            }
        }

        // Apply total expenses
        state.money -= totalExpenses;
    },

    /**
     * Calculate base cost of living based on lifestyle
     * Factors: housing, vehicle, general lifestyle, COUNTRY
     */
    calculateCostOfLiving() {
        let cost = 500; // Base survival cost

        // Housing
        if (state.housing !== 'couch' && state.housing !== 'parents') {
            const h = HOUSING.find(h => h.id === state.housing);
            if (h) {
                cost += h.rent || 0; // Add rent
                cost += h.upkeep || 0; // Add upkeep
            }
        }

        // University Housing (Overrides standard housing if student)
        if (state.isStudent && state.school && state.school.housing) {
            if (state.school.housing === 'dorm') cost += 500;
            if (state.school.housing === 'shared') cost += 800;
            // 'parents' housing for students means no cost, already handled by not adding rent/upkeep
        }

        // Vehicle costs
        if (state.vehicle) {
            const vehicle = VEHICLES.find(v => v.id === state.vehicle);
            if (vehicle) {
                cost += vehicle.upkeep || 0;
            }
        }

        // Lifestyle inflation based on items owned
        if (state.items && state.items.length > 0) {
            cost += state.items.length * 50; // Each luxury item adds to lifestyle cost
        }

        // TRAVEL SYSTEM: Apply country cost of living multiplier & exchange rate
        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            if (country) {
                if (country.costOfLiving) {
                    cost *= country.costOfLiving;
                }
                // Convert to local currency
                if (country.exchangeRate) {
                    cost /= country.exchangeRate;
                }
            }
        }

        return cost;
    },

    /**
     * Calculate family-related expenses
     * Partner and children costs
     */
    calculateFamilyExpenses() {
        let cost = 0;

        // Base costs are in HOME currency (USD)

        // Partner expenses
        if (state.partner && state.partner.name) {
            cost += 300; // Base partner cost (dates, gifts, etc.)
        }

        // Children expenses
        if (state.children && state.children.length > 0) {
            state.children.forEach(child => {
                const age = state.age - child.birthYear;
                if (age < 18) {
                    cost += 800; // Child under 18
                } else if (age < 25) {
                    cost += 400; // Young adult (college support)
                }
            });
        }

        // TRAVEL SYSTEM: Apply Cost of Living and Exchange Rate to family expenses
        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            if (country) {
                if (country.costOfLiving) cost *= country.costOfLiving;
                if (country.exchangeRate) cost /= country.exchangeRate;
            }
        }

        return cost;
    },

    /**
     * Calculate property maintenance costs
     */
    calculatePropertyExpenses() {
        let cost = 0;

        // Real estate maintenance
        if (state.realEstate && state.realEstate.length > 0) {
            state.realEstate.forEach(prop => {
                const property = REAL_ESTATE.find(r => r.id === prop);
                if (property) {
                    // 1% of property value per year = 0.083% per month
                    cost += (property.price * 0.001);
                }
            });
        }

        // TRAVEL SYSTEM: Apply Exchange Rate to property expenses
        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            if (country && country.exchangeRate) {
                cost /= country.exchangeRate;
            }
        }

        return cost;
    },

    /**
     * Process loan payments and create EMERGENCY LOANS
     */
    processLoans() {
        // Disabled by user request.
        return;

        /* 
        // EMERGENCY LOAN CHECK
        // FIX: Only for adults (18+) AND NOT STUDENTS
        if (state.money < 0 && state.age >= 18 && !state.isStudent) {
            // Need cash to reach 0? Or just cover deficit?
            // "Credit card" debt logic
            const deficit = Math.abs(state.money);

            // Create or update Emergency Loan
            if (!state.loans) state.loans = [];

            let emergencyLoan = state.loans.find(l => l.type === 'emergency');
            if (emergencyLoan) {
                emergencyLoan.amount += deficit;
                UI.log(`⚠️ Sobregiro bancario aumentado en -$${deficit}`, "bad");
            } else {
                UI.showAlert("CRÉDITO DE EMERGENCIA", "Tu cuenta está en rojo. El banco ha activado un crédito de consumo automático con una tasa de interés del 20%.");
                state.loans.push({
                    name: "Crédito Tiburón",
                    amount: deficit,
                    months: 12, // Indefinite really, until paid, but logic uses months
                    rate: 0.20, // 20% monthly!
                    type: 'emergency'
                });
                UI.log(`⚠️ Nuevo Crédito de Emergencia: $${deficit} (20% interés mensual)`, "bad");
            }

            // "Reset" money to 0 because debt moved to loan? 
            // Or keep negative? Usually games reset to 0 and add debt.
            state.money = 0;
        }

        if (!state.loans || state.loans.length === 0) return;

        let totalPayment = 0;

        state.loans.forEach((loan, index) => {
            // Calculate monthly payment
            // For emergency loan, payment is interest + percentage of principal
            let monthlyPayment = 0;
            let interest = 0;

            if (loan.type === 'emergency') {
                interest = Math.ceil(loan.amount * loan.rate); // 20% of total
                monthlyPayment = Math.ceil(loan.amount * 0.05); // Min 5% payment
            } else {
                monthlyPayment = Math.ceil(loan.amount / loan.months);
                interest = Math.ceil(loan.amount * (loan.rate / 12));
            }

            // Cap payment to available cash? No, let them burn.

            totalPayment += monthlyPayment + interest;

            // Reduce loan amount
            loan.amount -= monthlyPayment;
            if (loan.type !== 'emergency') loan.months -= 1; // Emergency loan months don't tick down fixed way

            // Remove if paid off
            if (loan.amount <= 0) {
                UI.log(`¡Préstamo ${loan.name} pagado! 🎉`, 'good');
                state.loans.splice(index, 1);
            }
        });

        if (totalPayment > 0) {
            state.money -= totalPayment; // Can go negative again, triggering loop next month
            UI.log(`Pago de préstamos: -$${Math.floor(totalPayment)}`, 'bad');
        }
        */
    },

    /**
     * Check if player is bankrupt
     * Triggers bankruptcy event if money is too negative
     */
    checkBankruptcy() {
        const BANKRUPTCY_THRESHOLD = -10000;

        if (state.money < BANKRUPTCY_THRESHOLD) {
            // Bankruptcy event
            UI.showAlert(
                "💸 BANCARROTA",
                "Has caído en bancarrota. Tus activos serán liquidados."
            );

            // Liquidate assets
            this.liquidateAssets();

            // Reset to minimal state
            state.money = 100;
            state.housing = 'apartment';
            state.vehicle = null;
            state.items = [];
            state.realEstate = [];
            state.investments = 0;

            UI.log("Tus activos fueron liquidados. Empiezas de nuevo con $100.", 'bad');
            Game.checkAchievements();
        }
    },

    /**
     * Liquidate all assets in case of bankruptcy
     */
    liquidateAssets() {
        let liquidationValue = 0;

        // Sell real estate at 50% value
        if (state.realEstate && state.realEstate.length > 0) {
            state.realEstate.forEach(prop => {
                const property = REAL_ESTATE.find(r => r.id === prop);
                if (property) {
                    liquidationValue += property.price * 0.5;
                }
            });
        }

        // Sell vehicle at 30% value
        if (state.vehicle) {
            const vehicle = VEHICLES.find(v => v.id === state.vehicle);
            if (vehicle) {
                liquidationValue += vehicle.price * 0.3;
            }
        }

        // Sell items at 20% value
        if (state.items && state.items.length > 0) {
            state.items.forEach(itemId => {
                const item = ITEMS.find(i => i.id === itemId);
                if (item) {
                    liquidationValue += item.price * 0.2;
                }
            });
        }

        // Cash out investments at 80% (market penalty)
        if (state.investments) {
            liquidationValue += state.investments * 0.8;
        }

        state.money += liquidationValue;
    },

    /**
     * Get financial summary for UI display
     * Used by Game.calculateFinancials()
     */
    getFinancialSummary() {
        const cash = state.money || 0;
        const investments = state.investments || 0;

        let realEstateValue = 0;
        if (state.realEstate && state.realEstate.length > 0) {
            state.realEstate.forEach(prop => {
                const property = REAL_ESTATE.find(r => r.id === prop);
                if (property) realEstateValue += property.price;
            });
        }

        const netWorth = cash + investments + realEstateValue;

        // Calculate monthly cash flow
        const income = this.calculateMonthlyIncome();
        const expenses = this.calculateMonthlyExpenses();

        return {
            cash,
            investments,
            realEstate: realEstateValue,
            netWorth,
            activeIncome: income.active,
            passiveIncome: income.passive,
            expenses,
            netFlow: income.active + income.passive - expenses
        };
    },

    /**
     * Calculate projected monthly income (for UI display)
     */
    calculateMonthlyIncome() {
        let activeIncome = 0;
        let passiveIncome = 0;

        // Job salary
        if (state.currJobId !== 'unemployed') {
            const job = JOBS.find(j => j.id === state.currJobId);
            if (job) activeIncome = job.salary;
        }

        // Business
        if (state.business && state.business.active) {
            passiveIncome += state.business.revenue || 0;
        }

        // Real estate
        if (state.realEstate && state.realEstate.length > 0) {
            state.realEstate.forEach(prop => {
                const property = REAL_ESTATE.find(r => r.id === prop);
                if (property && property.rental) {
                    passiveIncome += property.rental;
                }
            });
        }

        // Investments
        if (state.investments) {
            passiveIncome += state.investments * 0.005;
        }

        return { active: activeIncome, passive: passiveIncome };
    },

    /**
     * Calculate projected monthly expenses (for UI display)
     */
    calculateMonthlyExpenses() {
        // CHILDREN DON'T PAY EXPENSES - They live with parents
        if (state.age < 18) {
            return 0;
        }

        let total = 0;
        total += this.calculateCostOfLiving();
        total += this.calculateFamilyExpenses();
        total += this.calculatePropertyExpenses();
        return total;
    },

    /**
     * Check for firing based on performance and attendance
     * Called at start of processMonthlyFinances
     */
    checkFiring() {
        if (state.age < 18) return; // No aplica a niños
        if (state.currJobId === 'unemployed') return;

        let firingRisk = 0;

        // 1. Ausencia (no trabajó este mes)
        if (!state.workedThisMonth) {
            firingRisk += 15;
        }

        // 2. Salud Mental Crítica
        if (state.mentalHealth < 20) {
            firingRisk += 15;
        }

        // 3. Bajo Rendimiento (bajo XP)
        if (state.jobXP < 20 && state.jobMonths > 3) {
            firingRisk += 10;
        }

        // 4. Estrés Extremo
        if (state.stress > 90) {
            firingRisk += 10;
        }

        // Roll for firing
        if (Math.random() * 100 < firingRisk) {
            const job = JOBS.find(j => j.id === state.currJobId);
            const jobTitle = job ? job.title : 'tu trabajo';

            // DESPEDIDO
            state.currJobId = 'unemployed';
            state.jobXP = 0;
            state.jobMonths = 0;
            state.workedThisMonth = false;

            Game.updateStat('happiness', -15);
            Game.updateStat('mentalHealth', -10);

            UI.showAlert("😱 ¡DESPEDIDO!", `Perdiste tu trabajo como ${jobTitle}. ${!state.workedThisMonth ? 'Ausencias injustificadas.' :
                state.mentalHealth < 20 ? 'Tu salud mental afectó tu desempeño.' :
                    'Bajo rendimiento.'
                }`);
            UI.log(`⚠️ Fuiste despedido de ${jobTitle}`, 'bad');
        }

        // Reset monthly flag
        state.workedThisMonth = false;
    },

    /**
     * Process boredom effects from current job
     * High boredom reduces happiness and increases stress
     */
    processBoredom() {
        if (state.currJobId === 'unemployed') return;

        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job || !job.boredom) return;

        const boredom = job.boredom;

        // Boredom effects
        if (boredom >= 9) {
            // Extremely boring
            Game.updateStat('happiness', -10);
            Game.updateStat('stress', 5);
            if (Math.random() < 0.1) {
                UI.log("😴 Este trabajo es insoportablemente aburrido.", 'bad');
            }
        } else if (boredom >= 7) {
            // Very boring
            Game.updateStat('happiness', -5);
            Game.updateStat('stress', 3);
        } else if (boredom >= 4) {
            // Somewhat boring
            Game.updateStat('happiness', -2);
        }
        // 0-3: No effect
    },

    /**
     * Calculate financials for tax and summary purposes
     * Returns the raw numbers before expenses are applied
     */
    calculateFinancials() {
        // Calculate monthly cash flow
        const income = this.calculateMonthlyIncome();
        const expenses = this.calculateMonthlyExpenses();

        return {
            activeIncome: income.active,
            passiveIncome: income.passive,
            expenses: expenses,
            netFlow: income.active + income.passive - expenses
        };
    },

    /**
     * Process monthly job effects (stress, energy cost, mental health)
     * Called at end of processMonthlyFinances
     */
    processJobEffects() {
        if (state.currJobId === 'unemployed') return;

        const job = JOBS.find(j => j.id === state.currJobId);
        if (!job) return;

        // Apply monthly stress
        if (job.stressPerMonth) {
            Game.updateStat('stress', job.stressPerMonth);
        }

        // Apply energy cost
        if (job.energyCost) {
            Game.updateStat('energy', -job.energyCost);
        }

        // Apply mental health cost (for dead-end jobs)
        if (job.mentalHealthCost) {
            Game.updateStat('mentalHealth', -job.mentalHealthCost);
        }

        // Increment job months
        state.jobMonths = (state.jobMonths || 0) + 1;

        // Track career experience
        if (job.career && job.career !== 'none' && state.careerExperience) {
            if (!state.careerExperience[job.career]) {
                state.careerExperience[job.career] = 0;
            }

            // Add XP based on xpGain multiplier
            const xpGained = (job.xpGain || 1.0);
            state.careerExperience[job.career] += xpGained;

            // Also add to general job XP
            state.jobXP = Math.min(100, state.jobXP + (xpGained * 5));
        }
    }
};
