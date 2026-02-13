/**
 * Professional Profile View
 * Handles rendering of the professional history, reputation, and network.
 */

const ProfileView = {

    open() {
        UI.openModal('professional-profile-modal');
        this.render();
    },

    render() {
        const container = document.getElementById('profile-content');
        if (!container) return;

        container.innerHTML = `
            <div class="profile-header">
                <div class="ph-avatar">👔</div>
                <div class="ph-info">
                    <h2>${state.characterName}</h2>
                    <p style="color:#aaa;">Nivel Profesional: ${this.calculateOverallLevel()}</p>
                </div>
                <div class="ph-stats">
                    <div class="ph-stat-box">
                        <div class="label">Experiencia</div>
                        <div class="value">${Math.floor(this.calculateTotalExp() / 12)} <span style="font-size:0.8rem">años</span></div>
                    </div>
                    <div class="ph-stat-box">
                        <div class="label">Contactos</div>
                        <div class="value">${state.contacts ? state.contacts.length : 0}</div>
                    </div>
                </div>
            </div>

            <div class="profile-tabs">
                <button class="tab-btn active" onclick="ProfileView.switchTab('history', this)">📜 Historial</button>
                <button class="tab-btn" onclick="ProfileView.switchTab('companies', this)">🏢 Mercado</button>
                <button class="tab-btn" onclick="ProfileView.switchTab('network', this)">🤝 Red</button>
            </div>

            <div id="pv-tab-content" class="pv-body">
                ${this.getHistoryHTML()}
            </div>
        `;
    },

    switchTab(tab, btn) {
        // Update tabs
        document.querySelectorAll('#professional-profile-modal .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const content = document.getElementById('pv-tab-content');
        if (tab === 'history') content.innerHTML = this.getHistoryHTML();
        if (tab === 'companies') content.innerHTML = this.getCompaniesHTML();
        if (tab === 'network') content.innerHTML = this.getNetworkHTML();
    },

    getHistoryHTML() {
        if (!state.workHistory || state.workHistory.length === 0) {
            return `<div style="text-align:center; padding:40px; color:#666;">Sin historial laboral aún.</div>`;
        }

        let html = '<div class="history-list">';
        // Reverse to show newest first
        [...state.workHistory].reverse().forEach(entry => {
            const company = COMPANIES.find(c => c.id === entry.companyId);
            const logo = company ? company.logo : '💼';
            const name = company ? company.name : (entry.companyId === 'indep' ? 'Independiente' : entry.companyId);

            const recIcon = entry.recommender ? `<span title="Recomendado por ${entry.recommender}" style="cursor:help">🤝</span> ` : '';

            html += `
                <div class="history-item">
                    <div class="hi-logo">${logo}</div>
                    <div class="hi-details">
                        <h4>${recIcon}${entry.jobTitle} <span style="font-weight:normal; color:#888;">en ${name}</span></h4>
                        <p>${Math.floor(entry.duration)} meses | ${entry.reason === 'fired' ? '<span style="color:#ff4d4d">Despedido</span>' : '<span style="color:#4dffea">Renuncia</span>'}</p>
                    </div>
                    <div class="hi-date">Edad: ${Math.floor((entry.endDate - 1) / 12)}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    getCompaniesHTML() {
        let html = `
            <div class="reputation-section">
                <h4>📊 Reputación por Sector</h4>
                <div class="charts-grid">
        `;

        const sectors = ['tech', 'corp', 'creative', 'medical', 'law', 'service'];
        sectors.forEach(sec => {
            const rep = state.sectorReputation[sec] || 0;
            const width = Math.min(100, rep);
            let color = '#4dffea';
            if (rep < 30) color = '#ff4d4d';
            if (rep > 80) color = 'gold';

            html += `
                <div class="chart-bar">
                    <div class="cb-label">${sec.toUpperCase()}</div>
                    <div class="cb-track">
                        <div class="cb-fill" style="width:${width}%; background:${color};"></div>
                    </div>
                    <div class="cb-val">${rep}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            <h4 style="margin-top:20px; border-bottom:1px solid #333;">🏢 Estatus de Empresas</h4>
            <div class="company-status-list">
        `;

        COMPANIES.forEach(comp => {
            let status = '<span style="color:#4dffea">🟢 Disponible</span>';
            let opacity = 1.0;

            const blacklistEnd = state.companyBlacklist[comp.id] || 0;
            if (blacklistEnd > state.totalMonths) {
                status = `<span style="color:#ff4d4d">🔴 Vetado (${blacklistEnd - state.totalMonths}m)</span>`;
                opacity = 0.6;
            } else if (state.currJobId !== 'unemployed') {
                // Check if current job is this company
                const currJob = JOBS.find(j => j.id === state.currJobId);
                if (currJob && currJob.companyId === comp.id) {
                    status = `<span style="color:gold; font-weight:bold;">🔷 Actual</span>`;
                }
            }

            // Check espionage ban
            if (state.sectorBlacklist && state.sectorBlacklist[comp.sector]) {
                status = `<span style="color:#888;">💀 Veto de Sector</span>`;
                opacity = 0.4;
            }

            html += `
                <div class="company-item" style="opacity:${opacity}">
                    <div class="ci-logo">${comp.logo}</div>
                    <div class="ci-info">
                        <strong>${comp.name}</strong>
                        <div style="font-size:0.75rem; color:#aaa;">${comp.sector.toUpperCase()} | Prestigio: ${comp.prestige}</div>
                    </div>
                    <div class="ci-status">${status}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    },

    getNetworkHTML() {
        if (!state.contacts || state.contacts.length === 0) {
            return `
                <div style="text-align:center; padding:40px;">
                    <div style="font-size:3rem; opacity:0.3;">📇</div>
                    <p style="color:#888;">Tu agenda está vacía.</p>
                    <p style="font-size:0.8rem; color:#666;">Trabaja duro y mantén buenas relaciones para ganar contactos al cambiar de empleo.</p>
                </div>
            `;
        }

        let html = '<div class="contact-grid">';
        state.contacts.forEach(c => {
            html += `
                <div class="contact-card">
                    <div class="cc-header">
                        <div class="cc-icon">👤</div>
                        <div class="cc-role">${c.role}</div>
                    </div>
                    <h3>${c.name}</h3>
                    <p style="font-size:0.8rem; color:#aaa;">Relación: ${c.relationship}%</p>
                    <div style="margin-top:10px; font-size:0.75rem; color:#4dffea;">
                        Influencia: ${c.influence === 'high' ? 'Alta ⭐' : 'Media'}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    },

    calculateOverallLevel() {
        if (state.jobLevel === 0) return 'Novato';
        if (state.jobLevel === 1) return 'Junior';
        if (state.jobLevel === 2) return 'Profesional';
        if (state.jobLevel === 3) return 'Veterano';
        if (state.jobLevel === 4) return 'Experto';
        return 'Leyenda';
    },

    calculateTotalExp() {
        let total = 0;
        Object.values(state.careerExperience).forEach(v => total += v);
        return total;
    }
};

window.ProfileView = ProfileView;
