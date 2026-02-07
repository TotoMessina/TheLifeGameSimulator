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
                    id: 'act-uni-study',
                    label: '📚 Estudiar',
                    desc: 'Mejora Notas (-20 E)',
                    color: '#673AB7',
                    onClick: () => { School.studyNow(); Game.updateStat('stress', 8); }
                },
                {
                    id: 'act-uni-work',
                    label: '☕ Cafetería',
                    desc: 'Trabajo Medio Tiempo (+$)',
                    color: '#795548',
                    onClick: () => {
                        if (state.currJobId === 'unemployed') Game.applyJob('pt_barista');
                        else UI.log("Ya tienes empleo.", "info");
                        Game.updateStat('stress', 5);
                    }
                },
                {
                    id: 'act-uni-job',
                    label: '💼 Buscar Empleo',
                    desc: 'Medio tiempo',
                    color: '#2196F3',
                    onClick: () => {
                        UI.openModal('job-modal');
                        UI.renderJobMarket();
                    }
                },
                {
                    id: 'act-uni-party',
                    label: '🎉 Fiesta',
                    desc: 'Socializa (-Energy)',
                    color: '#E91E63',
                    onClick: () => { School.socializeNow(); Game.updateStat('stress', -10); }
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
                    onClick: () => Game.rest()
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
        if (state.age === 18 && !state.graduationHandled) return;

        // Force Graduation at 23 if still student
        if (state.age >= 23 && state.isStudent) {
            state.isStudent = false;
            state.education.push('university_degree'); // Generic degree if they survived
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
        const splash = document.getElementById('critical-overlay');
        splash.innerHTML = `
            <div style="text-align:center; color:white; animation: fadeIn 2s;">
                <h1 style="font-size:3rem; margin-bottom:10px;">${phase.name}</h1>
                <p style="font-size:1.5rem;">Una nueva etapa comienza...</p>
            </div>
        `;
        splash.style.display = 'flex';
        splash.style.opacity = '1';

        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 1000);
        }, 3000);
    }
};
