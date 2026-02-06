
// --- EVENT LISTENERS ---

// Main Buttons - Actions are now dynamic via PhaseManager


UI.els.btns.next.onmousedown = () => {
    // Hold to fast forward? For now just click
    Game.nextMonth();
};
// prevent double fire on touch
UI.els.btns.next.addEventListener('touchstart', (e) => {
    e.preventDefault();
    Game.nextMonth();
}, { passive: false });

// Modal Close Buttons
UI.els.modals.closeJob.onclick = () => UI.els.modals.job.classList.remove('active');
UI.els.modals.closeSettings.onclick = () => UI.els.modals.settings.classList.remove('active');
UI.els.modals.closeShop.onclick = () => UI.els.modals.shop.classList.remove('active');
UI.els.modals.closeAct.onclick = () => UI.els.modals.act.classList.remove('active');

// Modal Triggers
UI.els.jobTrigger.onclick = () => {
    UI.els.modals.job.classList.add('active');
    const container = UI.els.modals.jobList;
    container.innerHTML = '';

    // Career Tracks
    const careers = ['none', 'tech', 'corp', 'sport'];
    const careerNames = { 'none': 'Trabajos Básicos', 'tech': 'Tecnología', 'corp': 'Corporativo', 'sport': 'Deportes' };

    careers.forEach(c => {
        if (c === 'none') return;

        const header = document.createElement('h4');
        header.innerText = careerNames[c];
        header.style.cssText = "color:#aaa; border-bottom:1px solid #333; padding-bottom:5px; margin-top:20px;";
        container.appendChild(header);

        const jobs = JOBS.filter(j => j.career === c).sort((a, b) => a.salary - b.salary);
        jobs.forEach(j => {
            const isQual = state.intelligence >= (j.req.int || 0) &&
                state.experience >= (j.req.exp || 0) &&
                state.physicalHealth >= (j.req.health || 0); // Simplified check

            // Check degree
            const hasDeg = !j.req.deg || state.education.includes(j.req.deg);

            const isCurr = state.currJobId === j.id;

            const el = document.createElement('div');
            el.className = 'job-card';
            if (isCurr) el.classList.add('active');

            el.innerHTML = `
                <div>
                    <div style="font-weight:bold; color:#fff;">${j.title}</div>
                    <div style="font-size:0.8rem; color:#aaa;">Salario: $${j.salary}</div>
                    <div style="font-size:0.8rem; color:#888;">Req: ${j.req.int ? 'Int ' + j.req.int : ''} ${j.req.exp ? 'Exp ' + j.req.exp : ''} ${j.req.deg ? '🎓' : ''}</div>
                </div>
                <button class="btn-select-job" ${(isQual && hasDeg) ? '' : 'disabled'} onclick="Game.promote('${j.id}')">
                    ${isCurr ? 'Actual' : (isQual && hasDeg ? 'Aplicar' : 'No Calificado')}
                </button>
             `;
            container.appendChild(el);
        });
    });
};

// Settings
if (UI.els.btns.settings) {
    UI.els.btns.settings.addEventListener('click', () => {
        if (UI.els.modals.settings) {
            UI.renderTrophies(); // Populate trophies when opening settings
            UI.els.modals.settings.classList.add('active');
            DB.init(); // Retry init if needed
        }
    });
}

// Trophy Trigger (Opens Settings > Trophies)
if (UI.els.btns.trophy) {
    UI.els.btns.trophy.addEventListener('click', () => {
        if (UI.els.modals.settings) {
            UI.renderTrophies();
            UI.els.modals.settings.classList.add('active');
            // Optionally scroll to trophies?
            setTimeout(() => {
                const tSection = document.getElementById('trophies-section');
                if (tSection) tSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    });
}

// Shop Trigger
UI.els.modals.shopBtn.onclick = () => {
    UI.els.modals.shop.classList.add('active');
    UI.renderShop();
};

// Auth Buttons
UI.els.auth.loginBtn.onclick = () => {
    const e = UI.els.auth.emailInput.value;
    const p = UI.els.auth.passInput.value;
    if (e && p) DB.login(e, p);
};
UI.els.auth.logoutBtn.onclick = () => DB.logout();
UI.els.auth.saveBtn.onclick = () => DB.saveGame();
UI.els.auth.loadBtn.onclick = () => DB.loadGame();

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
window.onload = () => {
    AudioSys.init();

    // Init Logic
    setTimeout(() => {
        DB.init();
        Game.init();

        // Splash Screen Removal
        const splash = document.getElementById('splash-screen');
        if (splash) {
            setTimeout(() => {
                splash.classList.add('hidden');
                setTimeout(() => splash.remove(), 1000);
            }, 1500);
        }
    }, 500);

    // Initial render
    UI.render();

    // Dev Mode
    DevMode.init();
    console.log('🔧 Dev Mode initialized.');

    // PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
};

// Global click for sound (careful with this one, might be annoying)
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        // AudioSys.playClick(); // Already handled in specific actions mostly
    }
});
