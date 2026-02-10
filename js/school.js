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
            trigger: () => Math.random() < 0.02 && state.age >= 14 && state.age < 19,
            effect: () => {
                UI.showAlert("Primer Amor", "Sientes mariposas en el estómago.");
                Game.updateStat('happiness', 20);
                state.school.popularity += 5;
            }
        },
        // --- University Events ---
        {
            id: 'career_fair',
            text: 'Feria de Empleos en el Campus',
            trigger: () => state.isStudent && Math.random() < 0.15,
            effect: () => {
                UI.showEventChoices('Feria de Empleos', 'Muchas empresas buscan talento joven.', [
                    {
                        text: 'Repartir CVs (+Network)',
                        onClick: () => {
                            state.network += 5;
                            UI.log("Conociste a varios reclutadores.", "good");
                        }
                    },
                    {
                        text: 'Asistir a charlas (+Int, +Exp)',
                        onClick: () => {
                            Game.updateStat('intelligence', 2);
                            state.jobXP += 5;
                            UI.log("Aprendiste sobre la industria.", "good");
                        }
                    }
                ]);
            }
        },
        {
            id: 'party_night',
            text: '¡Fiesta Universitaria!',
            trigger: () => state.isStudent && Math.random() < 0.2,
            effect: () => {
                UI.showEventChoices('Noche de Joda', 'Tus amigos organizan una gran fiesta antes de los parciales.', [
                    {
                        text: '¡Ir de fiesta! (++Happy, --Grades, -Energy)',
                        onClick: () => {
                            Game.updateStat('happiness', 15);
                            Game.updateStat('energy', -30);
                            state.school.grades -= 5;
                            state.school.popularity += 5;
                            UI.log("¡Qué noche! Pero te duele la cabeza.", "normal");
                        }
                    },
                    {
                        text: 'Quedarse a estudiar (++Grades)',
                        onClick: () => {
                            state.school.grades += 3;
                            Game.updateStat('stress', 5);
                            UI.log("Decidiste ser responsable.", "good");
                        }
                    }
                ]);
            }
        },
        {
            id: 'research_project',
            text: 'Oportunidad de Investigación',
            trigger: () => state.isStudent && state.intelligence > 80 && Math.random() < 0.1,
            effect: () => {
                state.school.grades += 5;
                state.network += 3;
                UI.showAlert("Proyecto de Investigación", "Un profesor te invitó a su equipo. Gran prestigio académico (+Grades +Network).");
            }
        }
    ],

    tick() {
        // Run if Under 18 OR if Student (Uni)
        if (state.age >= 18 && !state.isStudent) return;

        if (state.isStudent) {
            this.universityTick();
            return;
        }

        const s = state.school;
        const focus = s.focus;
        // ... (rest of k-12 tick logic)

        // 1. Focus Effects - NEW LOGIC: GRADES DECAY BY DEFAULT
        let gradeChange = -2;

        if (focus === 'study') {
            gradeChange = 2;
            Game.updateStat('intelligence', 0.2);
            Game.updateStat('happiness', -2);
            s.popularity -= 1;
            s.pressure -= 1;
        } else if (focus === 'normal') {
            gradeChange = -0.5;
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
        this.clampStats();

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
                if (ev.id !== 'grade_skip') UI.log(ev.text, "info");
                ev.effect();
            }
        });

        this.checkProdigy();
    },

    universityTick() {
        const s = state.school;

        // Decay
        s.grades -= 1.5; // University is harder
        s.pressure += 0.5;

        // Exams every 6 months (Month 6 and 12 of the year? state.totalMonths % 6 === 0?)
        // Assuming totalMonths starts at 144 (12yo). 
        if ((state.totalMonths - 216) % 6 === 0 && (state.totalMonths > 216)) {
            this.triggerSemesterExams();
        }

        this.clampStats();
    },

    triggerSemesterExams() {
        const s = state.school;
        const grade = s.grades;

        UI.showAlert("📝 Exámenes Semestrales", `Has rendido tus finales. Tu promedio fue: ${Math.floor(grade)}`);

        if (grade < 50) {
            // Fail
            s.pressure += 20;
            Game.updateStat('happiness', -20);
            UI.log("❌ Reprobaste el semestre. Debes recursar (+6 meses).", "bad");
            state.totalMonths += 6; // Penalty delay? Or just wasted time?
            // Actually, adding to totalMonths might mess up age. 
            // Better to track "semesters passed" or just delay graduation logic if we had it.
            // For now, let's just penalty stats.
        } else {
            Game.updateStat('intelligence', 2);
            Game.updateStat('happiness', 5);
            UI.log("✅ Aprobaste el semestre.", "good");
        }
    },

    clampStats() {
        const s = state.school;
        if (s.grades > 100) s.grades = 100;
        if (s.grades < 0) s.grades = 0;
        if (s.popularity > 100) s.popularity = 100;
        if (s.popularity < 0) s.popularity = 0;
        if (s.pressure < 0) s.pressure = 0;
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

    // --- University Actions ---
    studyFinals() {
        if (state.energy < 40) return UI.log("Necesitas mucha energía (40) para esto.", "bad");

        Game.updateStat('energy', -40);
        state.school.grades = Math.min(100, state.school.grades + 8);
        Game.updateStat('intelligence', 2);
        Game.updateStat('happiness', -5);

        UI.log("📚 Estudiaste toda la noche para los finales. (+Grades ++Int)", "good");
        UI.render();
    },

    networkCampus() {
        if (state.money < 50) return UI.log("Necesitas $50 para invitar tragos/café.", "bad");
        if (state.energy < 20) return UI.log("Estás muy cansado.", "bad");

        Game.updateStat('energy', -20);
        state.money -= 50;
        state.network = (state.network || 0) + 2;
        state.school.popularity = Math.min(100, state.school.popularity + 3);

        UI.log("🤝 Hiciste networking en el campus. (+Network +Pop)", "good");
        UI.render();
    },

    doInternship() {
        if (state.energy < 30) return UI.log("Estás muy cansado.", "bad");

        Game.updateStat('energy', -30);
        Game.updateStat('stress', 10);
        const pay = 200; // Low pay
        state.money += pay;

        // Add XP to relevant career if possible, otherwise generic generic 'jobXP'
        // For now generic:
        state.jobXP += 10;

        // Also boost specific major XP if we had it mapped. 
        // Let's assume 'internship' boosts 'jobXP' generally which helps getting hired.

        UI.log(`💼 Completaste tus horas de pasantía. Ganaste $${pay} y experiencia.`, "good");
        UI.render();
    },

    triggerGraduation() {
        // Exam Calculation
        const examScore = Math.floor((state.intelligence * 0.6) + (state.school.grades * 0.4));
        let scholarship = null;

        // Scholarship Logic
        if (state.school.grades >= 90) scholarship = 'academic';
        else if ((state.physicalHealth + state.athletics?.stamina) / 2 > 80) scholarship = 'sports'; // Approx check

        let text = `Examen Nacional: ${examScore}/100.\n`;
        if (scholarship === 'academic') text += "¡Beca Académica Disponible! (Notas > 90)\n";
        else if (scholarship === 'sports') text += "¡Beca Deportiva Disponible! (Alto rendimiento físico)\n";
        else text += "Resultados normales.\n";

        text += "\nElige tu camino:";

        const choices = [
            {
                text: '🏫 Universidad Pública (Examen de Ingreso)',
                onClick: () => {
                    if (state.intelligence < 70) {
                        UI.showAlert("Examen Fallido", "No alcanzaste el puntaje mínimo de inteligencia (70) para la pública.");
                    } else {
                        this.enrollUniversity('public', scholarship);
                    }
                }
            },
            {
                text: scholarship ? '💎 Universidad de Élite (Becado - Gratis)' : '💎 Universidad de Élite ($50,000/año)',
                onClick: () => {
                    if (!scholarship && state.money < 50000 && state.loans > 10000) {
                        UI.showAlert("Fondos Insuficientes", "No puedes costear la universidad de élite sin beca.");
                    } else {
                        this.enrollUniversity('elite', scholarship);
                    }
                }
            },
            {
                text: '💻 Universidad Online (Flexible - $5,000/año)',
                onClick: () => {
                    this.enrollUniversity('online', null);
                }
            },
            {
                text: '🛠️ Directo al Trabajo (Full-time)',
                onClick: () => {
                    state.graduationHandled = true;
                    state.graduationTriggered = false;
                    state.isStudent = false;
                    Game.nextMonth();
                }
            }
        ];

        UI.showEventChoices("🎓 Graduación", text, choices);
    },

    enrollUniversity(type, scholarship) {
        // Define available majors mapping to degree IDs
        const majors = [
            { id: 'business', name: 'Administración de Empresas', degree: 'university_degree' }, // General degree but focused
            { id: 'med_school', name: 'Medicina (Dr.)', degree: 'med_school' },
            { id: 'law_school', name: 'Derecho (Abogado)', degree: 'law_school' },
            { id: 'engineering', name: 'Ingeniería', degree: 'university_degree' },
            { id: 'arts', name: 'Artes y Humanidades', degree: 'university_degree' }
        ];

        const choices = majors.map(m => ({
            text: m.name,
            onClick: () => {
                this.processEnrollment(type, scholarship, m.id);
            }
        }));

        // FIX: Wrap in setTimeout to prevent UI.js from closing this new modal immediately 
        // after the previous button click handler finishes.
        setTimeout(() => {
            UI.showEventChoices("Elige tu Carrera", "Selecciona tu especialidad universitaria.\nEsto determinará a qué trabajos podrás postularte.", choices);
        }, 100);
    },

    processEnrollment(type, scholarship, majorId) {
        state.graduationHandled = true;
        state.graduationTriggered = false; // Reset for future use if needed
        state.isStudent = true;
        state.educationLevel = 'university';
        state.school.major = majorId;
        state.school.universityPrestige = type; // 'public', 'elite', 'online'
        state.school.scholarship = scholarship;

        // TRAVEL SYSTEM: Localize Costs
        let baseCost = 0;
        if (type === 'elite' && scholarship !== 'academic') baseCost = 50000;
        if (type === 'public' && !scholarship) baseCost = 2000; // Small fee
        if (type === 'online') baseCost = 5000;

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
                // Loans logic
                let loanAmount = baseCost;
                if (typeof Travel !== 'undefined' && state.currentCountry) {
                    const country = Travel.getCurrentCountry();
                    loanAmount *= country.costOfLiving;
                }

                state.loans = (state.loans || 0) + Math.floor(loanAmount);
                UI.log(`Préstamo estudiantil tomado: -$${Math.floor(loanAmount).toLocaleString()} (Valor Base)`, "bad");
            }
            state.network = (state.network || 0) + 50;
        } else if (type === 'online') {
            state.loans = (state.loans || 0) + Math.floor(finalCost);
            UI.log(`Universidad Online: $${Math.floor(finalCost)} (Deuda)`, "normal");
        } else {
            // Public
            if (!scholarship) {
                state.loans = (state.loans || 0) + Math.floor(finalCost);
                UI.log(`Costo Universidad Pública: $${Math.floor(finalCost)}`, "normal");
            } else {
                UI.log("Universidad Pública (Becado - Gratis)", "good");
            }
        }

        // Ensure state is updated before transition
        state.phase = PhaseManager.PHASES.UNIVERSITY.id;
        PhaseManager.transitionTo(PhaseManager.PHASES.UNIVERSITY);

        // Force render to ensure UI updates immediately
        UI.render();
    }
};
