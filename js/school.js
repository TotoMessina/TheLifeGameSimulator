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
        } else if (state.school.grades > 90) {
            state.intelligence += 0.5;
            state.fame.followers += 5; // Smart kids get some respect?
            s.pressure -= 2;
            if (s.pressure < 0) s.pressure = 0;
        }

        if (s.pressure > 80) {
            Game.updateStat('mentalHealth', -5);
            UI.log("⚠️ La presión parental te está estresando.", "bad");
        }

        // Process Housing Effects
        this.processHousingEffects();

        // 3. Events
        this.EVENTS.forEach(ev => {
            if (ev.trigger()) {
                if (ev.id !== 'grade_skip') UI.log(ev.text, "info");
                ev.effect();
            }
        });

        this.checkProdigy();
    },

    processHousingEffects() {
        if (!state.isStudent) return;

        // Default to parents if not set
        if (!state.school.housing) state.school.housing = 'parents';

        const h = state.school.housing;

        if (h === 'parents') {
            Game.updateStat('happiness', -2); // Lack of independence
            Game.updateStat('energy', -5); // Commute
        } else if (h === 'dorm') {
            Game.updateStat('energy', 5); // Close to class
            state.school.popularity = Math.min(100, (state.school.popularity || 0) + 1);
        } else if (h === 'shared') {
            // Random Roommate Event
            if (Math.random() < 0.2) {
                if (Math.random() > 0.5) {
                    UI.showAlert("Drama de Roommates", "Tus compañeros de departamento tuvieron una pelea a gritos. -5 Salud Mental.");
                    Game.updateStat('mentalHealth', -5);
                    Game.updateStat('stress', 10);
                } else {
                    UI.showAlert("Noche de Películas", "Pasaste una gran noche con tus roommates. +10 Felicidad.");
                    Game.updateStat('happiness', 10);
                    state.network += 2;
                }
            }
        }
    },

    setHousing(type) {
        state.school.housing = type;
        const names = {
            'parents': "Casa de los Padres",
            'dorm': "Dormitorios del Campus",
            'shared': "Departamento Compartido"
        };
        UI.log(`Te has mudado a: ${names[type]}`, "normal");
        UI.render();
        UI.renderUniversityTab();
    },

    universityTick() {
        const s = state.school;

        // Skip normal tick if exam mode?
        // Actually, let standard tick run for housing costs etc,
        // but maybe suppress some random events?
        // For simplicity, let it run.

        const monthsInUni = state.totalMonths - (18 * 12); // Approx
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

    // --- EXAM MODE SYSTEM ---
    triggerSemesterExams() {
        state.school.examMode = true;
        state.school.examStudyHours = 0;
        state.school.examStress = 0;

        UI.showAlert("📚 ¡SEMANA DE EXÁMENES!", "Ha llegado el final del semestre. Todas las actividades de ocio están bloqueadas.\n\nDedícate a ESTUDIAR para aprobar. Tu nota depende de tu Inteligencia y las Horas de Estudio acumuladas.");
        UI.render();
        // Force switch to University tab
        UI.switchActTab('university');
    },

    examAction(action) {
        if (!state.school.examMode) return;

        const s = state.school;

        if (action === 'study') {
            const cost = 20;
            if (state.energy < cost) return UI.showAlert("Agotado", "Necesitas descansar o tomar café.");

            Game.updateStat('energy', -cost);
            Game.updateStat('stress', 5);
            s.examStudyHours = (s.examStudyHours || 0) + 5;

            // Intelligence variance
            const efficiency = 1 + (state.intelligence / 100);

            UI.log(`Estudiaste intensamente (+5 horas).`, "good");

        } else if (action === 'coffee') {
            if (state.money < 5) return UI.showAlert("Sin Dinero", "No te alcanza para el café.");
            Game.updateStat('money', -5);
            Game.updateStat('energy', 25);
            Game.updateStat('physicalHealth', -2); // Too much caffeine
            Game.updateStat('stress', 2);
            UI.log("Café cargado. ¡Energía a tope! (+25 E)", "normal");

        } else if (action === 'rest') {
            Game.updateStat('energy', 30);
            Game.updateStat('stress', -5);
            // Costs time? For simplicty, just action.
            UI.log("Descansaste un poco. (+30 E)", "good");
        }

        UI.render();
        UI.renderUniversityTab();
    },

    takeExams() {
        const s = state.school;
        // Formula: (Int * 0.4) + (Hours * 1.5) + Luck(0-10)
        // Target: 100 Int * 0.4 = 40. Need 60 pts from hours/luck.
        // Hours needed approx: 30-40 hours (30 * 1.5 = 45). 
        // 40 + 45 + 5 = 90 (Honors).

        const luck = Math.random() * 10;
        const score = (state.intelligence * 0.4) + ((s.examStudyHours || 0) * 1.5) + luck;
        const finalGrade = Math.min(100, Math.max(0, score));

        // Update average grades
        s.grades = (s.grades + finalGrade) / 2;

        let honors = false;
        let fail = false;
        let msg = `Tu nota final es: ${finalGrade.toFixed(1)}/100.`;

        if (finalGrade >= 90) {
            honors = true;
            s.honors = true; // Unlock logic
            s.scholarship = 'academic_honors'; // Upgrade scholarship?
            state.careerExperience['education'] = (state.careerExperience['education'] || 0) + 5;
            state.happiness += 10;
            msg += "\n\n¡APROBADO CON HONORES! 🎓🌟\nHas desbloqueado mejores oportunidades.";
            UI.log("Exámenes: HONORES", "good");
        } else if (finalGrade < 50) {
            fail = true;
            s.scholarship = null; // Lose scholarship
            Game.updateStat('money', -1000); // Retake fee
            Game.updateStat('happiness', -20);
            msg += "\n\n❌ REPROBADO.\nPerdiste tu beca y pagas $1000 por cursos de verano.";
            UI.log("Exámenes: REPROBADO", "bad");
        } else {
            msg += "\n\nHas aprobado el semestre.";
            UI.log("Exámenes: Aprobado", "normal");
        }

        s.examMode = false;
        s.examStudyHours = 0;

        UI.showAlert(honors ? "¡HONORES!" : (fail ? "REPROBADO" : "SEMESTRE TERMINADO"), msg);
        UI.render();
        UI.renderUniversityTab();
    },


    // --- SPORTS SYSTEM ---
    joinSport(type) {
        if (state.school.sport && state.school.sport.type !== 'none') {
            return UI.showAlert("Ya tienes equipo", "Debes dejar tu equipo actual antes de unirte a otro.");
        }

        state.school.sport = {
            type: type,
            fitness: 50,
            performance: 50,
            injured: false,
            injuryTimeout: 0,
            scholarship: false
        };

        const sportName = type === 'football' ? 'Fútbol' : 'Atletismo';
        UI.log(`Te uniste al equipo de ${sportName}.`, "good");
        UI.render();
        UI.renderUniversityTab();
    },

    quitSport() {
        if (!state.school.sport) return;
        state.school.sport = null;
        UI.log("Dejaste el equipo universitario.", "normal");
        UI.render();
        UI.renderUniversityTab();
    },

    trainSport() {
        const s = state.school.sport;
        if (!s) return;

        if (s.injured) {
            return UI.showAlert("Lesionado", `Estás lesionado. Tiempo de recuperación: ${s.injuryTimeout} meses.`);
        }

        // Energy Cost
        const energyCost = 30; // High effort
        if (state.energy < energyCost) {
            return UI.showAlert("Agotado", "Estás demasiado cansado para entrenar.");
        }

        // INJURY RISK Check
        // If energy is low (but enough to start), risk increases massively
        let injuryChance = 0.02; // Base 2%
        if (state.energy < 40) injuryChance = 0.15; // 15% if tired
        if (state.energy < 20) injuryChance = 0.40; // 40% if exhausted (shouldn't happen due to check above, but logic safety)

        Game.updateStat('energy', -energyCost);

        if (Math.random() < injuryChance) {
            s.injured = true;
            s.injuryTimeout = 3;
            Game.updateStat('physicalHealth', -15);
            Game.updateStat('happiness', -10);
            Haptics.error();
            UI.showAlert("¡LESIÓN!", "Te has lesionado durante el entrenamiento. Quedas fuera por 3 meses.");
            UI.log("🤕 Te lesionaste entrenando.", "bad");
        } else {
            // Success
            s.fitness = Math.min(100, s.fitness + 5);
            s.performance = Math.min(100, s.performance + 4);
            Game.updateStat('physicalHealth', 2);
            Game.updateStat('stress', -5); // Exercise reduces stress

            // Team camaraderie
            if (s.type === 'football') state.network += 1; // Team sports build network

            UI.log(`Entrenamiento completado via ${s.type === 'football' ? 'Fútbol' : 'Running'}.`, "good");
        }

        UI.render();
    },

    processSports() {
        const s = state.school.sport;
        if (!s || s.type === 'none') return;

        // 1. Injury Recovery
        if (s.injured) {
            s.injuryTimeout--;
            if (s.injuryTimeout <= 0) {
                s.injured = false;
                UI.log("Te has recuperado de tu lesión deportiva.", "good");
            }
            // Performance decay while injured
            s.performance = Math.max(0, s.performance - 10);
            return; // Skip rest
        }

        // 2. Monthly Decay (if not trained this month - assuming this runs after actions)
        // Hard to track specifically "trained this month" without a flag. 
        // Let's just apply small decay always, training offsets it.
        s.performance = Math.max(0, s.performance - 2);
        s.fitness = Math.max(0, s.fitness - 1);

        // 3. Scholarship Check
        // If performance > 80, get stipend
        if (s.performance >= 80) {
            if (!s.scholarship) {
                s.scholarship = true;
                UI.showAlert("Beca Deportiva", "¡Tu rendimiento es excelente! Has obtenido una beca de manutención de $500/mes.");
            }
            Game.updateStat('money', 500);
            UI.log("💰 Beca Deportiva: +$500", "good");
        } else {
            if (s.scholarship) {
                s.scholarship = false;
                UI.log("⚠️ Perdiste tu beca deportiva por bajo rendimiento.", "warning");
            }
        }
    },

    triggerSportCompetition() {
        const s = state.school.sport;
        if (!s || s.type === 'none' || s.injured) return;

        // Calc Win Chance
        // Base 30% + (Fitness * 0.4)% + (Performance * 0.3)%
        // Max stats: 100 fit, 100 perf -> 30 + 40 + 30 = 100% win rate? Maybe too easy.
        // Let's make it: Difficulty check.

        const score = (s.fitness * 0.6) + (s.performance * 0.4); // 0-100 score
        // Random "Opponent" score 50-90
        const opponent = 50 + Math.random() * 40;

        const sportName = s.type === 'football' ? 'Torneo de Fútbol' : 'Competencia de Atletismo';

        if (score > opponent) {
            // WIN
            const reward = 15; // Status
            Game.updateStat('status', reward);
            Game.updateStat('happiness', 10);
            state.network += 5; // Networking boost
            s.performance = Math.min(100, s.performance + 10);
            UI.showAlert("¡VICTORIA! 🏆", `Tu equipo ganó el ${sportName}. \n+${reward} Estatus, +5 Red.`);
            UI.log(`🏆 Ganaste en ${sportName}.`, "good");
        } else {
            // LOSS
            Game.updateStat('stress', 5);
            s.performance = Math.max(0, s.performance - 5);
            UI.log(`Perdieron el ${sportName}. A seguir entrenando.`, "normal");
        }
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
    },

    // --- CLUBS SYSTEM ---
    joinClub(type) {
        if (state.school.club && state.school.club !== 'none') {
            return UI.showAlert("Ya estás en un club", "Debes dejar tu club actual antes de unirte a otro.");
        }

        // Define clubs
        const clubs = {
            'coding': { name: 'Club de Programación 💻', cost: 0 },
            'investment': { name: 'Sociedad de Inversión 📈', cost: 0 },
            'consulting': { name: 'Consultora Estudiantil 📊', cost: 0 },
            'networking': { name: 'Networking de Élite 🥂', cost: 500 } // Initiation fee?
        };

        const fees = clubs[type].cost;
        if (fees > 0) {
            if (state.money < fees) return UI.showAlert("Fondos Insuficientes", `Necesitas $${fees} para unirte a este club exclusivo.`);
            Game.updateStat('money', -fees);
        }

        state.school.club = type;

        UI.log(`Te uniste al ${clubs[type].name}.`, "good");
        UI.render();
        UI.renderUniversityTab();
    },

    quitClub() {
        if (!state.school.club) return;
        state.school.club = null;
        UI.log("Dejaste tu club extracurricular.", "normal");
        UI.render();
        UI.renderUniversityTab();
    },

    performClubActivity() {
        const club = state.school.club;
        if (!club) return;

        const energyCost = 25;
        if (state.energy < energyCost) return UI.showAlert("Cansado", "Necesitas más energía para participar en actividades del club.");

        Game.updateStat('energy', -energyCost);
        Game.updateStat('happiness', 2); // Socializing usually fun

        switch (club) {
            case 'coding':
                // Hackathon
                state.careerExperience['tech'] = (state.careerExperience['tech'] || 0) + 5;
                UI.log("Participaste en un Hackathon. +5 Exp Tech.", "good");
                if (Math.random() < 0.05) {
                    UI.showAlert("Socio Encontrado (Tech)", "Conociste a un programador brillante que quiere armar una startup contigo en el futuro.");
                    // logic to store co-founder?
                    if (!state.network.coFounders) state.network.coFounders = [];
                    state.network.coFounders.push({ type: 'tech', skill: 80 });
                }
                break;
            case 'investment':
                // Market Analysis
                state.intelligence += 1; // Small int boost
                // Market Tips - Reduces investment risk?
                // Let's enable a temporary flag
                state.marketTips = (state.marketTips || 0) + 3; // 3 months of tips
                UI.log("Análisis de Mercado: Inteligencia +1. Has recibido tips de inversión por 3 meses.", "good");
                break;
            case 'consulting':
                // Real Project
                if (Math.random() > 0.5) {
                    state.careerExperience['product'] = (state.careerExperience['product'] || 0) + 5;
                    UI.log("Proyecto de Consultoría: +5 Exp Producto.", "good");
                } else {
                    state.careerExperience['management'] = (state.careerExperience['management'] || 0) + 5; // Assuming mgmt track exists or general
                    UI.log("Proyecto de Consultoría: +5 Exp Gestión.", "good");
                }
                break;
            case 'networking':
                // Elite Gala
                const cost = 100; // Expensive events
                if (state.money < cost) {
                    UI.log("No pudiste pagar la entrada al evento de networking.", "bad");
                    Game.updateStat('energy', 25); // Refund energy
                    return;
                }
                Game.updateStat('money', -cost);
                state.network = (state.network || 0) + 8;
                Game.updateStat('status', 3);
                UI.log("Asististe a una Gala Exclusiva. +8 Red, +3 Estatus.", "good");

                if (Math.random() < 0.1) {
                    UI.showAlert("Contacto VIP", "Conociste al hijo de un CEO importante.");
                    state.network += 15;
                }
                break;
        }

        UI.render();
        UI.renderUniversityTab();
    }
};
