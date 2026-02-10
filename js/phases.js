const PhaseManager = {
    PHASES: {
        CHILDHOOD: {
            id: 'childhood',
            name: 'Infancia & Adolescencia',
            startAge: 0,
            endAge: 18,
            theme: 'theme-childhood',
            actions: [
                {
                    id: 'act-school-study',
                    label: '📚 Estudiar',
                    desc: 'Mejora notas e inteligencia',
                    color: '#4da6ff',
                    onClick: () => { School.studyNow(); Game.updateStat('stress', 5); }
                },
                {
                    id: 'act-school-play',
                    label: '🎮 Jugar',
                    desc: 'Aumenta felicidad, baja notas',
                    color: '#ff9800',
                    onClick: () => { School.playNow(); Game.updateStat('stress', -10); }
                },
                {
                    id: 'act-school-social',
                    label: '👫 Socializar',
                    desc: 'Aumenta popularidad',
                    color: '#e91e63',
                    onClick: () => { School.socializeNow(); Game.updateStat('stress', -5); }
                },
                {
                    id: 'act-school-help',
                    label: '🤝 Ayudar',
                    desc: 'Ayuda a compañeros (Prodigio)',
                    color: '#8BC34A',
                    onClick: () => { School.helpClassmates(); Game.updateStat('stress', 5); }
                },
                {
                    id: 'act-rest',
                    label: '😴 Siesta',
                    desc: 'Recupera energía',
                    color: '#9E9E9E',
                    onClick: () => { Game.rest(); Game.updateStat('stress', -15); }
                },
                {
                    id: 'act-projects',
                    label: '🚀 Proyectos',
                    desc: 'Trabajos Escolares y Freelance',
                    color: '#FFD700',
                    onClick: () => {
                        UI.openModal('activity-modal');
                        UI.switchActTab('projects');
                    }
                }
            ]
        },
        UNIVERSITY: {
            id: 'university',
            name: 'Universidad',
            startAge: 18,
            endAge: 23,
            theme: 'theme-university',
            actions: [
                {
                    id: 'act-uni-hub',
                    label: '🏛️ Campus & Vida Uni',
                    desc: 'Estudios, Pasantías, Eventos',
                    color: '#673AB7',
                    onClick: () => {
                        UI.openModal('activity-modal');
                        UI.switchActTab('university');
                    }
                },

                {
                    id: 'act-rest',
                    label: '😴 Descansar',
                    desc: 'Recupera energía y baja estrés',
                    color: '#9E9E9E',
                    onClick: () => { Game.rest(); Game.updateStat('stress', -15); }
                },
                {
                    id: 'act-social-menu',
                    label: '👥 Social & Ocio',
                    desc: 'Amigos, Viajes, Mascotas',
                    color: '#E91E63',
                    onClick: () => {
                        UI.openModal('activity-modal');
                        UI.switchActTab('social');
                    }
                },
                {
                    id: 'act-projects',
                    label: '🚀 Proyectos',
                    desc: 'Freelancer / Emprender',
                    color: '#FFC107',
                    onClick: () => {
                        UI.openModal('activity-modal');
                        UI.switchActTab('projects');
                    }
                }
            ]
        },
        ADULTHOOD: {
            id: 'adulthood',
            name: 'Adultez',
            startAge: 23,
            endAge: 65,
            theme: 'theme-adult', // Dynamic
            actions: [
                {
                    id: 'act-work-hard',
                    label: '🔥 Trabajar Duro',
                    desc: '++Rendimiento --Energía',
                    color: '#FF5722',
                    onClick: () => { Game.workHard(); Game.updateStat('stress', 10); }
                },
                {
                    id: 'act-flatter-boss',
                    label: '👑 Adular Jefe',
                    desc: '++Jefe --Colegas',
                    color: '#9C27B0',
                    onClick: () => { Game.flatterBoss(); Game.updateStat('stress', 5); }
                },
                {
                    id: 'act-social-work',
                    label: '☕ Café con Colegas',
                    desc: '++Colegas --Rendimiento',
                    color: '#795548',
                    onClick: () => { Game.socializeColleagues(); Game.updateStat('stress', -5); }
                },
                {
                    id: 'act-study',
                    label: '📚 Cursos / Skills',
                    desc: 'Mejora tus habilidades',
                    color: '#673AB7',
                    onClick: () => Game.renderCourses()
                },
                {
                    id: 'act-projects',
                    label: '🚀 Proyectos',
                    desc: 'Emprende o crea algo',
                    color: '#FFC107',
                    onClick: () => {
                        UI.openModal('activity-modal');
                        UI.switchActTab('projects');
                    }
                },
                {
                    id: 'act-rest',
                    label: '🛋️ Descansar',
                    desc: 'Recupera energía (+40)',
                    color: '#607D8B',
                    onClick: () => { Game.rest(); Game.updateStat('stress', -10); }
                },
                {
                    id: 'act-social-menu',
                    label: '👥 Social & Ocio',
                    desc: 'Amigos, Viajes, Mascotas',
                    color: '#E91E63',
                    onClick: () => {
                        UI.openModal('activity-modal');
                        UI.switchActTab('social');
                    }
                }
            ]
        },
        RETIREMENT: {
            id: 'retirement',
            name: 'Jubilación',
            startAge: 65,
            endAge: 999,
            theme: 'theme-retired',
            actions: [
                {
                    id: 'act-retire-relax',
                    label: '🏖️ Relajarse',
                    desc: 'Disfruta la vida (+Salud/Felicidad)',
                    color: '#00BCD4',
                    onClick: () => UI.log("Disfrutando del retiro...", "good")
                }
            ]
        }
    },

    getCurrentPhase() {
        const age = state.age;

        // STRICT AGE ENFORCEMENT: Must be 18+ for university or work
        if (age < 18) {
            return this.PHASES.CHILDHOOD;
        }

        // Age 18-22: University phase if student
        if (age >= 18 && age < 23 && state.isStudent) {
            return this.PHASES.UNIVERSITY;
        }

        // Age 18-64: Adulthood (working age)
        if (age >= 18 && age < 65) {
            return this.PHASES.ADULTHOOD;
        }

        // Age 65+: Retirement
        return this.PHASES.RETIREMENT;
    },

    checkTransition() {
        // If pending graduation (Age 18), don't auto transition
        if (state.age === 18 && !state.graduationHandled) {

            // GIFT: Ensure they have some cash for the transition
            if (state.money < 500) {
                state.money += 1000;
                UI.log("🎂 ¡Feliz Cumpleaños #18! Tus padres te regalan $1,000 para tu nueva etapa.", "good");
            }

            // FIX: Force graduation trigger ONCE
            if (!state.graduationTriggered) {
                if (typeof School !== 'undefined' && School.triggerGraduation) {
                    state.graduationTriggered = true;
                    School.triggerGraduation();
                }
            }
            // CRITICAL: Stop here. User choice in modal will decide next phase (Student or Worker).
            // Do NOT fall through to transitionTo(Adulthood) below.
            return;
        }

        // Force Graduation at 23 if still student
        if (state.age >= 23 && state.isStudent) {
            state.isStudent = false;
            state.education.push('university_degree'); // Generic degree

            // Award Major Degree if selected
            if (state.school.major && !state.education.includes(state.school.major)) {
                state.education.push(state.school.major);
            }

            UI.log("¡Te has graduado de la Universidad! Bienvenido al mundo real.", "good");
        }

        const currentPhase = this.getCurrentPhase();
        // If state.currentPhaseId doesn't match calculated phase, transition!
        if (state.phase !== currentPhase.id) {
            this.transitionTo(currentPhase);
        }
    },

    transitionTo(phase) {
        console.log(`Transitioning to ${phase.name}`);
        state.phase = phase.id;

        // Show Splash Screen
        this.showSplashScreen(phase);

        // Update Body Class for Theme (Base theme, wealth overrides later)
        document.body.className = ''; // Reset
        document.body.classList.add(phase.theme);
        UI.updateTheme(); // Re-apply wealth theme if applicable

        // Render Actions
        UI.renderActions();
    },

    showSplashScreen(phase) {
        // Create overlay if not exists
        let overlay = document.getElementById('phase-transition-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'phase-transition-overlay';
            overlay.className = 'phase-transition-overlay';
            document.body.appendChild(overlay);
        }

        // Set Content
        overlay.innerHTML = `
            <div class="phase-content">
                <h1 class="phase-title">${phase.name}</h1>
                <p class="phase-subtitle">Una nueva etapa comienza...</p>
                <div class="phase-loader-bg">
                    <div class="phase-loader-fill"></div>
                </div>
            </div>
        `;

        // Activate (Fade In)
        // Force reflow
        void overlay.offsetWidth;
        overlay.classList.add('active');

        // Play Sound?
        if (typeof AudioSys !== 'undefined') {
            // AudioSys.playPhaseTransition(); // If exists
        }

        // Wait for 3.5 seconds then fade out
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 3500); // 3.5s total
    }
};
