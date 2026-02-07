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
     * - Special bonuses (aguinaldo handled separately in Game.js)
     */
    processIncome() {
        let totalIncome = 0;

        // 1. Job Salary (if employed)
        if (state.currJobId !== 'unemployed') {
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
            const bizIncome = state.business.revenue || 0;
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
            if (rentalIncome > 0) {
                totalIncome += rentalIncome;
                UI.log(`Ingresos por alquiler: +$${Math.floor(rentalIncome)}`, 'money');
            }
        }

        // 4. Investment Returns (simplified - could be expanded)
        if (state.investments && state.investments > 0) {
            // Average 0.5% monthly return (6% annual)
            const returns = state.investments * 0.005;
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
     */
    processExpenses() {
        // CHILDREN DON'T PAY EXPENSES - Skip entirely for under 18
        if (state.age < 18) {
            return; // Exit early - no expenses for children
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

        // Apply total expenses
        state.money -= totalExpenses;
    },

    /**
     * Check for layoffs based on economic state
     */
    checkFiring() {
        if (state.currJobId === 'unemployed') return;

        const econ = World.getEconMultipliers ? World.getEconMultipliers() : { layoffChance: 0 };
        const baseChance = econ.layoffChance || 0;

        // Roll for layoff
        if (Math.random() < baseChance) {
            Game.loseJob(`Debido a la situación económica (${state.world.economicState}), tu empresa ha reducido personal.`);
        }
    },

    /**
     * Calculate base cost of living based on lifestyle
     * Factors: housing, vehicle, general lifestyle
     */
    calculateCostOfLiving() {
        let cost = 500; // Base survival cost

        // Housing costs
        if (state.housing) {
            const housing = HOUSING.find(h => h.id === state.housing);
            if (housing) {
                cost += housing.upkeep || 0;
            }
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

        return cost;
    },

    /**
     * Calculate family-related expenses
     * Partner and children costs
     */
    calculateFamilyExpenses() {
        let cost = 0;

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

        return cost;
    },

    /**
     * Process loan payments and interest
     */
    processLoans() {
        if (!state.loans || state.loans.length === 0) return;

        let totalPayment = 0;

        state.loans.forEach((loan, index) => {
            // Calculate monthly payment (simplified)
            const monthlyPayment = loan.amount / loan.months;
            const interest = loan.amount * (loan.rate / 12);

            totalPayment += monthlyPayment + interest;

            // Reduce loan amount
            loan.amount -= monthlyPayment;
            loan.months -= 1;

            // Remove if paid off
            if (loan.months <= 0 || loan.amount <= 0) {
                UI.log(`¡Préstamo pagado! 🎉`, 'good');
                state.loans.splice(index, 1);
            }
        });

        if (totalPayment > 0) {
            Game.updateStat('money', -totalPayment);
            UI.log(`Pago de préstamos: -$${Math.floor(totalPayment)}`, 'bad');
        }
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
