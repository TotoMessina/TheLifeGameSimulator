// --- EVENT LISTENERS ---

const App = {
    setupEventListeners() {
        // Main Buttons
        if (UI.els.btns.next) {
            UI.els.btns.next.onmousedown = () => {
                Game.nextMonth();
            };
            UI.els.btns.next.addEventListener('touchstart', (e) => {
                e.preventDefault();
                Game.nextMonth();
            }, { passive: false });
        }

        // Modal Close Buttons
        if (UI.els.modals.closeJob) UI.els.modals.closeJob.onclick = () => UI.els.modals.job.classList.remove('active');
        // New Dashboard Close
        const closeJd = document.getElementById('close-job-dashboard');
        if (closeJd) closeJd.onclick = () => document.getElementById('job-dashboard-modal').classList.remove('active');

        // New Dashboard Open (Static Button)
        const openJd = document.getElementById('btn-job-dashboard');
        if (openJd) {
            openJd.onclick = () => {
                UI.renderJobDashboard();
                document.getElementById('job-dashboard-modal').classList.add('active');
            };
        }

        if (UI.els.modals.closeSettings) UI.els.modals.closeSettings.onclick = () => UI.els.modals.settings.classList.remove('active');
        if (UI.els.modals.closeShop) UI.els.modals.closeShop.onclick = () => UI.els.modals.shop.classList.remove('active');
        if (UI.els.modals.closeAct) UI.els.modals.closeAct.classList.remove('active') ? UI.els.modals.closeAct.onclick = () => UI.els.modals.act.classList.remove('active') : null;
        // Fix for closeAct null check if needed
        if (UI.els.modals.closeAct) UI.els.modals.closeAct.onclick = () => UI.els.modals.act.classList.remove('active');


        // Modal Triggers
        if (UI.els.jobTrigger) {
            UI.els.jobTrigger.onclick = () => {
                UI.els.modals.job.classList.add('active');
                UI.renderJobMarket();
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

// ... existing triggers ...
// Business Trigger
// Note: These ID-based triggers below are safe IF the DOM is ready, but for consistency we should move them?
// Leaving them as they rely on document.getElementById directly, not UI.els.
// However, the script runs before onload. So document.getElementById is SAFE? 
// Yes, app.js is at the end of body.
// The ERROR was accessing UI.els properties which were empty.

// ... (Keep existing ID-based listeners below if they don't use UI.els) ...


// Business Trigger
document.getElementById('business-trigger').onclick = () => {
    document.getElementById('business-modal').classList.add('active');
    UI.renderBusiness();
};
document.getElementById('close-business').onclick = () => {
    document.getElementById('business-modal').classList.remove('active');
};

// Athletics Trigger
document.getElementById('athletics-trigger').onclick = () => {
    document.getElementById('athletics-modal').classList.add('active');
    UI.renderAthletics();
};
document.getElementById('close-athletics').onclick = () => {
    document.getElementById('athletics-modal').classList.remove('active');
};

// Routine Trigger
document.getElementById('routine-trigger').onclick = () => {
    document.getElementById('routine-modal').classList.add('active');
    UI.renderRoutine();
};
document.getElementById('close-routine').onclick = () => {
    document.getElementById('routine-modal').classList.remove('active');
};

// Profile Trigger
document.getElementById('profile-trigger').onclick = () => {
    document.getElementById('profile-modal').classList.add('active');
    UI.renderProfile();
};

// Social Trigger
const socialBtn = document.getElementById('social-trigger');
if (socialBtn) {
    socialBtn.onclick = () => {
        UI.openModal('activity-modal');
        UI.switchActTab('social');
    };
}
document.getElementById('close-profile').onclick = () => {
    document.getElementById('profile-modal').classList.remove('active');
};

// School Trigger
document.getElementById('school-trigger').onclick = () => {
    document.getElementById('school-modal').classList.add('active');
    UI.renderSchool();
};
document.getElementById('close-school').onclick = () => {
    document.getElementById('school-modal').classList.remove('active');
};

// Check Teen Mode in render loop or updateUI
setInterval(() => {
    if (state.age < 18) {
        document.getElementById('school-trigger').style.display = 'inline-block';
        document.getElementById('gpa-box').style.display = 'inline';
        // Hide adult stuff
        document.getElementById('job-trigger').style.display = 'none';
        document.getElementById('business-trigger').style.display = 'none';
    } else {
        document.getElementById('school-trigger').style.display = 'none';
        document.getElementById('gpa-box').style.display = 'none';

        document.getElementById('job-trigger').style.display = 'inline-block';
        document.getElementById('business-trigger').style.display = 'inline-block';
    }
}, 1000);


// Lifestyle Tabs
document.getElementById('home-trigger').onclick = () => {
    // We reuse Shop modal for lifestyle? Or create new one?
    // Original code: There was a lifestyle modal. I missed getting its ID in UI?
    // Let's check UI.els. It doesn't have 'lifestyle'.
    // Wait, original HTML had `lifestyle-modal`. 
    // I need to add this listener.
    const modal = document.getElementById('lifestyle-modal');
    if (modal) {
        modal.classList.add('active');
        UI.populateHousingCards();
        UI.populateVehicleCards();
        UI.renderMyHome();
    }
};

document.getElementById('close-lifestyle').onclick = () => {
    document.getElementById('lifestyle-modal').classList.remove('active');
};

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
        Game.init(); // Then initialize Game logic (which calls UI.render)
        // UI.render() is called by Game.init, which calls UI.init, which caches elements.
        // So UI.els should be populated now.
        App.setupEventListeners();

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
        // Splash Screen Removal - Guaranteed
        const splash = document.getElementById('splash-screen');
        if (splash) {
            setTimeout(() => {
                splash.classList.add('hidden');
                setTimeout(() => splash.remove(), 1000);
            }, 1000);
        }
    }
};

// Global click for sound (careful with this one, might be annoying)
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        // AudioSys.playClick(); // Already handled in specific actions mostly
    }
});

// Init Game
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
