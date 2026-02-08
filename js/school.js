const School = {
    FOCUS: {
        'study': { name: 'Estudiar mucho', desc: '++Notas, ++Inteligencia, --Diversión' },
        'social': { name: 'Socializar', desc: '++Popularidad, ++Felicidad, --Notas' },
        'hobby': { name: 'Hobby / Deporte', desc: '++Felicidad, ++Salud, -Notas' }
    },

    EVENTS: [
        {
            id: 'grade_skip',
            text: 'Muestras un nivel muy superior al resto.',
            trigger: () => state.school.isProdigy && !state.school.skippedGrade && state.age >= 7 && Math.random() < 0.3,
            effect: () => {
                UI.showEventChoices('Promoción Acelerada', 'Tus profesores creen que deberías saltar un grado. ¿Qué dices?', [
                    {
                        text: '¡Sí! (Saltar año, +Inteligencia, -Social)',
                        onClick: () => {
                            state.age += 1;
                            state.school.skippedGrade = true;
                            Game.updateStat('intelligence', 5);
                            state.school.popularity -= 15;
                            UI.log("Saltaste de grado. Eres el más joven del curso.", "good");
                            UI.render();
                        }
                    },
                    {
                        text: 'No, prefiero estar con mis amigos. (+Felicidad)',
                        onClick: () => {
                            Game.updateStat('happiness', 5);
                            UI.log("Decidiste quedarte con tu grupo.", "normal");
                            UI.render();
                        }
                    }
                ]);
            }
        },
        {
            id: 'academic_award',
            text: '¡Ganaste las Olimpiadas de Matemáticas!',
            trigger: () => state.school.isProdigy && Math.random() < 0.1,
            effect: () => {
                const prize = 500;
                Game.updateStat('money', prize);
                state.school.popularity += 5;
                state.unlockedTrophies.includes('nerd_king') || Game.awardTrophy('nerd_king'); // Example
                UI.showAlert("¡Premio Académico!", `Ganaste el primer lugar. Recibes $${prize} y reconocimiento.`);
            }
        },
        {
            id: 'exam_surprise',
            text: '¡Examen Sorpresa de Matemáticas!',
            trigger: () => Math.random() < 0.15 && state.age < 18,
            effect: () => {
                const grade = state.school.grades;
                if (grade > 80) {
                    UI.log("¡Aprobaste fácil! +Confianza", "good");
                    Game.updateStat('happiness', 5);
                } else if (grade > 50) {
                    UI.log("Zafaste con lo justo.", "normal");
                } else {
                    UI.log("Te fue horrible. Tus padres están furiosos.", "bad");
                    state.school.pressure += 10;
                    Game.updateStat('mentalHealth', -5);
                }
            }
        },
        {
            id: 'bullying',
            text: 'Unos chicos te molestan en el recreo.',
            trigger: () => Math.random() < 0.05 && state.school.popularity < 40,
            effect: () => {
                UI.showAlert("Bullying", "Te robaron el almuerzo y se burlaron de ti.");
                Game.updateStat('mentalHealth', -10);
                Game.updateStat('happiness', -10);
                state.school.pressure += 5;
            }
        },
        {
            id: 'first_love',
            text: 'Alguien te dejó una nota en tu casillero... ❤️',
            trigger: () => Math.random() < 0.02 && state.age >= 14,
            effect: () => {
                UI.showAlert("Primer Amor", "Sientes mariposas en el estómago.");
                Game.updateStat('happiness', 20);
                state.school.popularity += 5;
            }
        }
    ],

    tick() {
        // Run if Under 18 OR if Student (Uni)
        if (state.age >= 18 && !state.isStudent) return;

        const s = state.school;
        const focus = s.focus;

        // 1. Focus Effects - NEW LOGIC: GRADES DECAY BY DEFAULT
        // Requires active study to maintain high grades.

        let gradeChange = -2; // Base decay (hard mode)

        if (focus === 'study') {
            gradeChange = 2; // Only positive if focused
            Game.updateStat('intelligence', 0.2);
            Game.updateStat('happiness', -2);
            s.popularity -= 1;
            s.pressure -= 1;
        } else if (focus === 'normal') {
            gradeChange = -0.5; // Slight decay if just "normal"
        } else if (focus === 'social') {
            gradeChange = -3;
            s.popularity += 2;
            Game.updateStat('happiness', 2);
            Game.updateStat('intelligence', -0.1);
        } else if (focus === 'hobby') {
            gradeChange = -2;
            Game.updateStat('happiness', 3);
            Game.updateStat('physicalHealth', 1);
        }

        s.grades += gradeChange;

        // Clamp Stats
        if (s.grades > 100) s.grades = 100;
        if (s.grades < 0) s.grades = 0;
        if (s.popularity > 100) s.popularity = 100;
        if (s.popularity < 0) s.popularity = 0;

        // 2. Parental Pressure logic
        if (s.grades < 60) {
            s.pressure += 2;
            UI.log("Tus padres te exigen mejores notas.", "bad");
        } else if (s.grades > 90) {
            s.pressure -= 2;
            if (s.pressure < 0) s.pressure = 0;
        }

        if (s.pressure > 80) {
            Game.updateStat('mentalHealth', -5);
            UI.log("⚠️ La presión parental te está estresando.", "bad");
        }

        // 3. Events
        this.EVENTS.forEach(ev => {
            if (ev.trigger()) {
                // UI.log(ev.text, "info"); // Removing duplicate log if effect handles it, but ok for now
                if (ev.id !== 'grade_skip') UI.log(ev.text, "info"); // Skip generic log for interactive
                ev.effect();
            }
        });

        this.checkProdigy();
    },

    checkProdigy() {
        if (state.age > 15) return; // Only early Years

        // Become prodigy
        if (state.intelligence > 80 && !state.school.isProdigy) {
            state.school.isProdigy = true;
            UI.showAlert("¡Prodigio!", "Tu inteligencia destaca sobremanera. Se te abren nuevas puertas, pero tus compañeros podrían envidiarte.");
        }

        // Penalty if prodigy and NOT helping
        if (state.school.isProdigy) {
            if (!state.school.helpedThisMonth) {
                state.school.popularity = Math.max(0, state.school.popularity - 2);
                // UI.log("Tus compañeros te ven arrogante. (-2 Pop)", "bad"); // Too spammy? Maybe just silent
            }
            state.school.helpedThisMonth = false; // Reset for next month
        }
    },

    setFocus(f) {
        if (this.FOCUS[f]) {
            state.school.focus = f;
            UI.renderSchool();
        }
    },

    // --- Immediate Actions ---
    studyNow() {
        if (state.energy < 20) return UI.log("Estás demasiado cansado para estudiar.", "bad");

        Game.updateStat('energy', -20);
        state.school.grades = Math.min(100, state.school.grades + 3);
        Game.updateStat('intelligence', 1);
        Game.updateStat('happiness', -2); // Boring

        UI.log("Estudiaste duro. +Notas +Inteligencia", "good");
        UI.render();
    },

    playNow() {
        if (state.energy < 15) return UI.log("Estás muy cansado.", "bad");

        Game.updateStat('energy', -15);
        state.school.grades = Math.max(0, state.school.grades - 1);
        Game.updateStat('happiness', 5);
        Game.updateStat('physicalHealth', 1);

        UI.log("Jugaste un rato. +Diversión -Notas", "good");
        UI.render();
    },

    socializeNow() {
        if (state.energy < 20) return UI.log("Estás muy cansado.", "bad");

        Game.updateStat('energy', -20);
        state.school.grades = Math.max(0, state.school.grades - 1);
        state.school.popularity = Math.min(100, state.school.popularity + 2);
        Game.updateStat('happiness', 3);

        UI.log("Charlaste con amigos. +Popularidad", "good");
        UI.render();
    },

    helpClassmates() {
        if (state.energy < 20) return UI.log("Estás muy cansado.", "bad");

        Game.updateStat('energy', -20);
        state.school.helpedThisMonth = true;
        state.school.popularity = Math.min(100, state.school.popularity + 2);
        Game.updateStat('happiness', 2);

        UI.log("Ayudaste a tus compañeros. +Respeto", "good");
        UI.render();
    },

    triggerGraduation() {
        // Exam Calculation
        const examScore = Math.floor((state.intelligence * 0.6) + (state.school.grades * 0.4));
        let scholarship = null;

        // Requires Excellence AND High Intelligence to prevent "dumb genius" exploit
        if (state.school.grades >= 95 && state.intelligence >= 85) scholarship = 'academic';
        else if (state.physicalHealth >= 90 && state.school.grades >= 60) scholarship = 'sports';

        let text = `Examen Nacional: ${examScore}/100. `;
        if (scholarship === 'academic') text += "¡Beca de Excelencia Disponible! (Notas > 95, Int > 85)";
        else if (scholarship === 'sports') text += "¡Beca Deportiva Disponible!";
        else text += "Resultados normales.";

        const choices = [
            {
                text: scholarship === 'academic' ? 'Universidad de Élite (Gratis + Estipendio)' : 'Universidad de Élite ($50,000 Deuda)',
                onClick: () => {
                    this.enrollUniversity('elite', scholarship);
                }
            },
            {
                text: scholarship ? 'Universidad Pública (Gratis)' : 'Universidad Pública ($5,000 Deuda)',
                onClick: () => {
                    this.enrollUniversity('public', scholarship);
                }
            },
            {
                text: 'Directo al Trabajo (Adultez)',
                onClick: () => {
                    state.graduationHandled = true;
                    state.isStudent = false;
                    Game.nextMonth(); // Force next tick to transition
                }
            }
        ];

        UI.showEventChoices("🎓 Graduación", text, choices);
    },

    enrollUniversity(type, scholarship) {
        state.graduationHandled = true;
        state.isStudent = true;
        state.educationLevel = 'university';

        // TRAVEL SYSTEM: Localize Costs
        let baseCost = 0;
        if (type === 'elite' && scholarship !== 'academic') baseCost = 50000;
        if (type === 'public' && !scholarship) baseCost = 5000;

        let finalCost = baseCost;
        let currency = 'HOME';

        if (typeof Travel !== 'undefined' && state.currentCountry) {
            const country = Travel.getCurrentCountry();
            if (country) {
                currency = country.currency;
                // Apply COL (Higher COL = More expensive education)
                finalCost *= country.costOfLiving;
                // Convert to local currency
                if (country.exchangeRate) finalCost /= country.exchangeRate;
            }
        }

        if (type === 'elite') {
            if (scholarship === 'academic') {
                // Stipend also localized? Let's say yes.
                let stipend = 5000;
                if (typeof Travel !== 'undefined' && state.currentCountry) {
                    const country = Travel.getCurrentCountry();
                    stipend *= country.costOfLiving;
                    if (country.exchangeRate) stipend /= country.exchangeRate;
                }

                state.money += Math.floor(stipend);
                UI.log(`Beca Élite aceptada. +$${Math.floor(stipend).toLocaleString()}`, "good");
            } else {
                state.money -= Math.floor(finalCost); // Debt usually taken as cash then paid? 
                // Wait, loans logic in this game seems to be "Negative Money" or implicit? 
                // Line 281 says: state.loans = (state.loans || 0) + 50000;
                // It doesn't subtract from state.money, it adds to state.loans.
                // So we should add to state.loans.

                // Let's keep loans in HOME currency for simplicity? 
                // If we convert loans to local, then moving countries messes up debt value.
                // BETTER: Keep Loans in HOME currency always. 
                // But the COST is paid in local value? 
                // If I take a loan in Japan, I owe YEN.
                // Complexity Alert. 
                // SIMPLIFICATION: Loans are always tracked in HOME currency (USD).
                // So we add 'baseCost' (adjusted for COL) to loans.

                // Re-calculating for Loan (HOME Currency adjusted for COL only)
                let loanAmount = baseCost;
                if (typeof Travel !== 'undefined' && state.currentCountry) {
                    const country = Travel.getCurrentCountry();
                    loanAmount *= country.costOfLiving;
                }

                state.loans = (state.loans || 0) + Math.floor(loanAmount);
                UI.log(`Préstamo estudiantil tomado: -$${Math.floor(loanAmount).toLocaleString()} (Valor Base)`, "bad");
            }
            state.network = (state.network || 0) + 50;
        } else {
            if (!scholarship) {
                // Public Uni cost is usually direct payment or small loan? 
                // Original code: state.money -= 5000; state.loans += 5000; -> This assumes you pay it AND take a loan? 
                // Or maybe it means "You lose money, if negative, it's debt"? 
                // The original code was:
                // state.money -= 5000;
                // state.loans = (state.loans || 0) + 5000;
                // This seems to double count? You lose the cash AND get debt? 
                // Likely a bug or misunderstanding of legacy code.
                // Let's assume it means "Cost is 5000". If you have it, pay it. If not, debt.
                // But `state.loans` implies permanent debt tracking.
                // Let's just add to Loans for consistency with Elite logic above.

                let costHome = 5000;
                if (typeof Travel !== 'undefined' && state.currentCountry) {
                    const country = Travel.getCurrentCountry();
                    costHome *= country.costOfLiving;
                }
                state.loans = (state.loans || 0) + Math.floor(costHome);
                UI.log(`Costo Universitario: $${Math.floor(costHome)} (Agregado a Deuda)`, "normal");
            }
        }

        PhaseManager.transitionTo(PhaseManager.PHASES.UNIVERSITY);
    }
};
