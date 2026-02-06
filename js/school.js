const School = {
    FOCUS: {
        'study': { name: 'Estudiar mucho', desc: '++Notas, ++Inteligencia, --Diversión' },
        'social': { name: 'Socializar', desc: '++Popularidad, ++Felicidad, --Notas' },
        'hobby': { name: 'Hobby / Deporte', desc: '++Felicidad, ++Salud, -Notas' }
    },

    EVENTS: [
        {
            id: 'exam_surprise',
            text: '¡Examen Sorpresa de Matemáticas!',
            trigger: () => Math.random() < 0.15,
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
        if (state.age >= 18) return;

        const s = state.school;
        const focus = s.focus;

        // 1. Focus Effects
        if (focus === 'study') {
            s.grades += 2;
            Game.updateStat('intelligence', 0.5);
            Game.updateStat('happiness', -2);
            s.popularity -= 1;
        } else if (focus === 'social') {
            s.grades -= 2;
            s.popularity += 2;
            Game.updateStat('happiness', 2);
            Game.updateStat('intelligence', -0.1);
        } else if (focus === 'hobby') {
            s.grades -= 1;
            Game.updateStat('happiness', 3);
            Game.updateStat('physicalHealth', 1);
        }

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
                UI.log(ev.text, "info");
                ev.effect();
            }
        });

        // Chance of Science Fair or special annual event?
        // Maybe later.
    },

    setFocus(f) {
        if (this.FOCUS[f]) {
            state.school.focus = f;
            UI.renderSchool(); // Re-render logic needed
        }
    }
};
