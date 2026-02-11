// --- EVENT LISTENERS ---

// RESCUE SCRIPT & ERROR HANDLER
window.onerror = function (msg, url, line) {
    const splash = document.getElementById('splash-screen');
    if (splash && getComputedStyle(splash).display !== 'none') {
        alert("CRITICAL ERROR: " + msg + "\nLine: " + line);
    }
};

setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash && getComputedStyle(splash).display !== 'none' && !splash.classList.contains('hidden')) {
        console.warn("⚠️ Rescue: Force hiding splash screen after timeout.");
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 500);
    }
}, 4000);

const App = {
    setupEventListeners() {
        // Main Buttons
        if (UI.els.btns.next) {
            UI.els.btns.next.onclick = (e) => {
                Game.nextMonth();
            };
        }

        // Modal Close Buttons
        if (UI.els.modals.closeJob) UI.els.modals.closeJob.onclick = () => UI.els.modals.job.classList.remove('active');
        // New Dashboard Close
        const closeJd = document.getElementById('close-job-dashboard');
        if (closeJd) closeJd.onclick = () => document.getElementById('job-dashboard-modal').classList.remove('active');

        // New Dashboard Open (Static Button) - Handled inline in HTML or UI.js
        // Removed conflicting listener that broke the UI


        if (UI.els.modals.closeSettings) UI.els.modals.closeSettings.onclick = () => UI.els.modals.settings.classList.remove('active');
        if (UI.els.modals.closeShop) UI.els.modals.closeShop.onclick = () => UI.els.modals.shop.classList.remove('active');
        if (UI.els.modals.closeAct) UI.els.modals.closeAct.classList.remove('active') ? UI.els.modals.closeAct.onclick = () => UI.els.modals.act.classList.remove('active') : null;
        // Fix for closeAct null check if needed
        if (UI.els.modals.closeAct) UI.els.modals.closeAct.onclick = () => UI.els.modals.act.classList.remove('active');


        // Modal Triggers
        // Modal Triggers
        if (UI.els.jobTrigger) {
            UI.els.jobTrigger.onclick = () => {
                // Now opens Dashboard instead of Market
                UI.openModal('job-modal');
                UI.renderJob();
            };
        }

        // Settings
        if (UI.els.btns.settings) {
            UI.els.btns.settings.addEventListener('click', () => {
                if (UI.els.modals.settings) {
                    UI.renderTrophies();
                    UI.els.modals.settings.classList.add('active');
                    DB.init();
                }
            });
        }

        // Trophy Trigger
        if (UI.els.btns.trophy) {
            UI.els.btns.trophy.addEventListener('click', () => {
                if (UI.els.modals.settings) {
                    UI.renderTrophies();
                    UI.els.modals.settings.classList.add('active');
                    setTimeout(() => {
                        const tSection = document.getElementById('trophies-section');
                        if (tSection) tSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        }

        // Shop Trigger
        if (UI.els.modals.shopBtn) {
            UI.els.modals.shopBtn.onclick = () => {
                UI.els.modals.shop.classList.add('active');
                UI.renderShop();
            };
        }

        // Auth Buttons
        if (UI.els.auth.loginBtn) {
            UI.els.auth.loginBtn.onclick = () => {
                const e = UI.els.auth.emailInput.value;
                const p = UI.els.auth.passInput.value;
                if (e && p) DB.login(e, p);
            };
        }
        if (UI.els.auth.logoutBtn) UI.els.auth.logoutBtn.onclick = () => DB.logout();
        if (UI.els.auth.saveBtn) UI.els.auth.saveBtn.onclick = () => DB.saveGame();
        if (UI.els.auth.loadBtn) UI.els.auth.loadBtn.onclick = () => DB.loadGame();
    }
};


// ... (Keep existing ID-based listeners below if they don't use UI.els) ...

// Social trigger (special case - opens activity modal with tab switch)
const socialBtn = document.getElementById('social-trigger');
if (socialBtn) {
    socialBtn.onclick = () => {
        UI.openModal('activity-modal');
        UI.switchActTab('social');
    };
}


// Tab switchers
// Tab switchers removed to allow inline HTML handlers to work (GameUI.switch...)


// Initialization sequence
// Initialization sequence
App.init = async () => {
    try {
        AudioSys.init();

        // Init Logic
        await new Promise(resolve => setTimeout(resolve, 500)); // Small visual delay

        try {
            await DB.init();
        } catch (e) {
            console.warn("Supabase Init Warning (Offline?):", e);
        }

        UI.init(); // Initialize UI first (cache elements)

        // --- VERSION CHECK ---
        const lastVersion = localStorage.getItem('app_version');
        const currentVersion = CONFIG.version || '1.0.0';

        if (lastVersion !== currentVersion) {
            console.log(`🚀 New Version Detected: ${lastVersion} -> ${currentVersion}`);
            console.log("🧹 Cleaning old cache...");

            // Clear version-specific storage if needed, but keep save data
            // localStorage.clear(); // Too aggressive, deletes save

            // Update version
            localStorage.setItem('app_version', currentVersion);

            // Force SW update
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                    console.log("Service Workers Unregistered. Reloading...");
                    window.location.reload(true);
                });
            } else {
                window.location.reload(true);
            }
            return; // Stop execution to reload
        }
        // ---------------------

        EventManager.init(); // Initialize event system
        PerformanceManager.init(); // Initialize performance optimizations
        KeyboardManager.init(); // Initialize keyboard navigation
        A11yManager.init(); // Initialize accessibility features
        PWAManager.init(); // Initialize PWA features
        AnalyticsManager.init(); // Initialize analytics
        LeaderboardsManager.init(); // Initialize leaderboards

        // Register all modals using EventManager
        EventManager.registerModals([
            { modalId: 'business-modal', triggerId: 'business-trigger', renderFn: UI.renderBusiness },
            { modalId: 'athletics-modal', triggerId: 'athletics-trigger', renderFn: UI.renderAthletics },
            { modalId: 'routine-modal', triggerId: 'routine-trigger', renderFn: UI.renderRoutine },
            { modalId: 'profile-modal', triggerId: 'profile-trigger', renderFn: UI.renderProfile },
            { modalId: 'school-modal', triggerId: 'school-trigger', renderFn: UI.renderSchool },
            {
                modalId: 'lifestyle-modal', triggerId: 'home-trigger', renderFn: () => {
                    UI.populateHousingCards();
                    UI.populateVehicleCards();
                    UI.renderMyHome();
                }
            },
            { modalId: 'social-media-modal', triggerId: 'social-media-trigger', renderFn: UI.renderSocialMedia }
        ]);

        Game.init(); // Then initialize Game logic (which calls UI.render)
        // UI.render() is called by Game.init, which calls UI.init, which caches elements.
        // So UI.els should be populated now.

        // Initialize Travel System
        if (typeof Travel !== 'undefined') {
            Travel.init();
        }

        App.setupEventListeners();

        // Welcome Modal & Character Creation
        const welcomeModal = document.getElementById('welcome-modal');
        const startLifeBtn = document.getElementById('start-life-btn');
        const nameInput = document.getElementById('character-name-input');
        const genderMaleBtn = document.getElementById('gender-male-btn');
        const genderFemaleBtn = document.getElementById('gender-female-btn');
        const formError = document.getElementById('form-error');
        const appContainer = document.getElementById('app-container');

        let selectedGender = null;

        // Check if character hasn't been created yet (first time playing)
        // Show modal only if name is still default 'Jugador' and hasn't been customized
        const isFirstTime = !localStorage.getItem('gameState') || state.characterName === 'Jugador';

        if (isFirstTime) {
            // Show welcome modal for new game
            if (welcomeModal) {
                welcomeModal.classList.add('active');
                // Block main UI
                if (appContainer) appContainer.style.pointerEvents = 'none';
            }

            // Gender button handlers
            const genderButtons = [genderMaleBtn, genderFemaleBtn];
            genderButtons.forEach(btn => {
                if (btn) {
                    btn.onclick = () => {
                        selectedGender = btn.dataset.gender;

                        // Update button styles
                        genderButtons.forEach(b => {
                            b.style.background = '#1a1a1a';
                            b.style.borderColor = '#333';
                            b.style.color = '#aaa';
                        });

                        btn.style.background = 'rgba(77, 255, 234, 0.15)';
                        btn.style.borderColor = '#4dffea';
                        btn.style.color = '#4dffea';

                        validateForm();
                    };
                }
            });

            // Name input handler
            if (nameInput) {
                nameInput.oninput = () => {
                    validateForm();
                };

                // Focus on name input
                setTimeout(() => nameInput.focus(), 500);
            }

            // Form validation
            function validateForm() {
                const name = nameInput ? nameInput.value.trim() : '';
                const hasName = name.length >= 2;
                const hasGender = selectedGender !== null;

                if (formError) {
                    if (!hasName && name.length > 0) {
                        formError.textContent = '⚠️ El nombre debe tener al menos 2 caracteres';
                    } else if (hasName && !hasGender) {
                        formError.textContent = '⚠️ Selecciona un sexo';
                    } else {
                        formError.textContent = '';
                    }
                }

                // Enable button if form is valid
                if (startLifeBtn) {
                    if (hasName && hasGender) {
                        startLifeBtn.disabled = false;
                        startLifeBtn.style.background = 'linear-gradient(135deg, #4dffea, #00d4aa)';
                        startLifeBtn.style.color = '#000';
                        startLifeBtn.style.cursor = 'pointer';
                        startLifeBtn.style.boxShadow = '0 4px 15px rgba(77, 255, 234, 0.4)';
                    } else {
                        startLifeBtn.disabled = true;
                        startLifeBtn.style.background = 'linear-gradient(135deg, #666, #444)';
                        startLifeBtn.style.color = '#888';
                        startLifeBtn.style.cursor = 'not-allowed';
                        startLifeBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
                    }
                }
            }

            // Start Life button handler
            if (startLifeBtn) {
                startLifeBtn.onclick = () => {
                    const name = nameInput ? nameInput.value.trim() : '';

                    if (name.length >= 2 && selectedGender) {
                        // Save character data to state
                        state.characterName = name;
                        state.gender = selectedGender;

                        // Close modal
                        if (welcomeModal) {
                            welcomeModal.classList.remove('active');
                        }

                        // Unblock main UI
                        if (appContainer) appContainer.style.pointerEvents = 'auto';

                        // Hide splash screen now that character is created
                        const splash = document.getElementById('splash-screen');
                        if (splash) {
                            splash.style.opacity = '0';
                            setTimeout(() => {
                                splash.classList.add('hidden');
                                setTimeout(() => splash.remove(), 500);
                            }, 300);
                        }

                        // Save state
                        DB.saveLocal();

                        // Render UI elements (CRITICAL: ensures action buttons appear)
                        UI.render();
                        if (typeof UI.renderActions === 'function') {
                            UI.renderActions();
                        }

                        // Show welcome message
                        UI.log(`¡Bienvenido/a, ${name}! Tu vida comienza ahora.`, 'good');
                        UI.showAlert('¡Naciste!', `Hola ${name}, acabas de nacer. ¡Buena suerte en tu vida!`);
                    }
                };
                // Hover effects (only when enabled)
                startLifeBtn.onmouseover = () => {
                    if (!startLifeBtn.disabled) {
                        startLifeBtn.style.transform = 'scale(1.05)';
                        startLifeBtn.style.boxShadow = '0 6px 20px rgba(77, 255, 234, 0.6)';
                    }
                };
                startLifeBtn.onmouseout = () => {
                    if (!startLifeBtn.disabled) {
                        startLifeBtn.style.transform = 'scale(1)';
                        startLifeBtn.style.boxShadow = '0 4px 15px rgba(77, 255, 234, 0.4)';
                    }
                };
            }
        } else {
            // Hide for existing games
            if (welcomeModal) welcomeModal.classList.remove('active');
            if (appContainer) appContainer.style.pointerEvents = 'auto';
        }

        UI.render();

        // Dev Mode
        if (typeof DevMode !== 'undefined') {
            DevMode.init();
            console.log('🔧 Dev Mode initialized.');
        }

        // PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }

    } catch (e) {
        console.error("Critical Init Error:", e);
        const splash = document.getElementById('splash-screen');
        if (splash) {
            const err = document.createElement('div');
            err.style.color = '#ff5555';
            err.style.padding = '20px';
            err.style.zIndex = '9999';
            err.innerText = "Error cargando: " + e.message;
            splash.appendChild(err);
        }
    } finally {
        // Splash Screen - Only hide if not a new game
        // For new games, it will be hidden when character creation completes
        const splash = document.getElementById('splash-screen');
        const isFirstTime = !localStorage.getItem('gameState') || state.characterName === 'Jugador';

        if (splash && !isFirstTime) {
            setTimeout(() => {
                splash.classList.add('hidden');
                setTimeout(() => splash.remove(), 1000);
            }, 1000);
        }
    }
};

// Global click for sound and haptic feedback
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        // Add haptic feedback for all buttons
        if (typeof Juice !== 'undefined' && Juice.hapticFeedback) {
            Juice.hapticFeedback('short');
        }
        // AudioSys.playClick(); // Already handled in specific actions mostly
    }
});

// Init Game
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
