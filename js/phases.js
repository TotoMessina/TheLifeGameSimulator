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
                    onClick: () => School.setFocus('study')
                },
                {
                    id: 'act-school-play',
                    label: '🎮 Jugar',
                    desc: 'Aumenta felicidad, baja notas',
                    color: '#ff9800',
                    onClick: () => School.setFocus('hobby')
                },
                {
                    id: 'act-school-social',
                    label: '👫 Socializar',
                    desc: 'Aumenta popularidad',
                    color: '#e91e63',
                    onClick: () => School.setFocus('social')
                }
            ]
        },
        UNIVERSITY: {
            id: 'university',
            name: 'Universidad',
            startAge: 18,
            endAge: 23, // Can end earlier if dropout
            theme: 'theme-uni',
            actions: [
                {
                    id: 'act-uni-class',
                    label: '🎓 Ir a Clases',
                    desc: 'Necesario para graduarse',
                    color: '#9c27b0',
                    onClick: () => UI.log("Asististe a clase. +Conocimiento", "good")
                },
                {
                    id: 'act-uni-party',
                    label: '🍻 Fiesta',
                    desc: 'Cuidado con la resaca',
                    color: '#e91e63',
                    onClick: () => UI.log("¡Qué fiesta! -Salud +Felicidad", "normal")
                },
                {
                    id: 'act-uni-work',
                    label: '☕ Trabajo en Cafetería',
                    desc: 'Gana algo de dinero extra',
                    color: '#795548',
                    onClick: () => Game.work() // Modified work logic needed
                }
            ]
        },
        ADULTHOOD: {
            id: 'adulthood',
            name: 'Adultez',
            startAge: 23,
            endAge: 65,
            theme: 'theme-adult', // Dynamic based on wealth (handled by updateTheme)
            actions: [
                {
                    id: 'act-work',
                    label: '💼 Trabajar',
                    desc: 'Gana dinero y experiencia',
                    color: '#2196F3',
                    onClick: () => Game.work()
                },
                {
                    id: 'act-study',
                    label: '📚 Estudiar / Cursos',
                    desc: 'Mejora tus habilidades',
                    color: '#673AB7',
                    onClick: () => Game.study()
                },
                {
                    id: 'act-projects',
                    label: '🚀 Proyectos',
                    desc: 'Emprende o crea algo',
                    color: '#FFC107',
                    onClick: () => UI.openModal('activity-modal')
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
                    desc: 'Disfruta de tus ahorros',
                    color: '#00BCD4',
                    onClick: () => UI.log("Disfrutas de la vida. +Salud", "good")
                },
                {
                    id: 'act-retire-doctor',
                    label: '💊 Ir al Médico',
                    desc: 'Cuida tu salud',
                    color: '#F44336',
                    onClick: () => UI.log("Chequeo médico realizado.", "info")
                }
            ]
        }
    },

    getCurrentPhase() {
        const age = state.age;
        if (age < 18) return this.PHASES.CHILDHOOD;
        if (age < 23 && state.isStudent) return this.PHASES.UNIVERSITY; // Flag needed
        if (age < 65) return this.PHASES.ADULTHOOD;
        return this.PHASES.RETIREMENT;
    },

    checkTransition() {
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
