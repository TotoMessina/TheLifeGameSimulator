/**
 * PWA Manager - Progressive Web App features
 * Handles service worker, offline support, and installation
 */

const PWAManager = {
    /**
     * Service worker registration
     */
    swRegistration: null,

    /**
     * Initialize PWA features
     */
    async init() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered');

                this.setupUpdateListener();
                this.setupInstallPrompt();
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    },

    /**
     * Setup service worker update listener
     */
    setupUpdateListener() {
        if (!this.swRegistration) return;

        this.swRegistration.addEventListener('updatefound', () => {
            const newWorker = this.swRegistration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    this.showUpdateNotification();
                }
            });
        });
    },

    /**
     * Show update notification
     */
    showUpdateNotification() {
        if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
            window.location.reload();
        }
    },

    /**
     * Setup install prompt
     */
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install button
            this.showInstallButton(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            deferredPrompt = null;
        });
    },

    /**
     * Show install button
     */
    showInstallButton(deferredPrompt) {
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('install-btn');

        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'install-btn';
            installBtn.textContent = '📱 Instalar App';
            installBtn.className = 'install-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                z-index: 9999;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(installBtn);
        }

        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('User accepted install');
            }

            deferredPrompt = null;
            installBtn.remove();
        });
    }
};

/**
 * Analytics Manager - Event tracking and telemetry
 */
const AnalyticsManager = {
    /**
     * Session ID
     */
    sessionId: null,

    /**
     * Analytics endpoint (replace with your own)
     */
    endpoint: null, // Set to your analytics endpoint

    /**
     * Event queue for offline support
     */
    eventQueue: [],

    /**
     * Initialize analytics
     */
    init() {
        this.sessionId = this.generateSessionId();
        this.loadQueue();
        this.setupListeners();
        this.trackEvent('session_start');
        console.log('✅ AnalyticsManager initialized');
    },

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Setup event listeners
     */
    setupListeners() {
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('session_pause');
            } else {
                this.trackEvent('session_resume');
            }
        });

        // Track session duration on unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('session_end');
            this.flush();
        });
    },

    /**
     * Track an event
     * @param {string} eventName - Name of the event
     * @param {Object} data - Additional event data
     */
    trackEvent(eventName, data = {}) {
        const event = {
            sessionId: this.sessionId,
            eventName,
            timestamp: Date.now(),
            data: {
                ...data,
                age: state?.age || 0,
                money: state?.money || 0,
                job: state?.currJobId || 'unemployed',
                totalMonths: state?.totalMonths || 0
            }
        };

        // Add to queue
        this.eventQueue.push(event);
        this.saveQueue();

        // Try to send if online
        if (navigator.onLine && this.endpoint) {
            this.flush();
        }
    },

    /**
     * Send events to server
     */
    async flush() {
        if (!this.endpoint || this.eventQueue.length === 0) return;

        const eventsToSend = [...this.eventQueue];

        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: eventsToSend })
            });

            // Clear sent events
            this.eventQueue = [];
            this.saveQueue();
        } catch (error) {
            console.warn('Analytics send failed:', error);
        }
    },

    /**
     * Save queue to localStorage
     */
    saveQueue() {
        try {
            localStorage.setItem('analytics-queue', JSON.stringify(this.eventQueue));
        } catch (e) {
            console.warn('Failed to save analytics queue:', e);
        }
    },

    /**
     * Load queue from localStorage
     */
    loadQueue() {
        try {
            const saved = localStorage.getItem('analytics-queue');
            if (saved) {
                this.eventQueue = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load analytics queue:', e);
        }
    },

    /**
     * Get analytics summary
     */
    getSummary() {
        return {
            sessionId: this.sessionId,
            queuedEvents: this.eventQueue.length,
            events: this.eventQueue
        };
    }
};

/**
 * Leaderboards Manager - Multiplayer leaderboards
 */
const LeaderboardsManager = {
    /**
     * Initialize leaderboards
     */
    init() {
        console.log('✅ LeaderboardsManager initialized');
    },

    /**
     * Get top players for a category
     * @param {string} category - Category ('wealth', 'age', 'achievements')
     * @param {number} limit - Number of players to fetch
     */
    async getTopPlayers(category = 'wealth', limit = 100) {
        if (!supabase) {
            console.warn('Supabase not initialized');
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('leaderboards')
                .select('*')
                .eq('category', category)
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to fetch leaderboards:', error);
            return [];
        }
    },

    /**
     * Submit score to leaderboard
     * @param {string} category - Category
     * @param {number} score - Score to submit
     * @param {Object} metadata - Additional metadata
     */
    async submitScore(category, score, metadata = {}) {
        if (!supabase) {
            console.warn('Supabase not initialized');
            return null;
        }

        try {
            const user = supabase.auth.user();
            if (!user) {
                console.warn('User not authenticated');
                return null;
            }

            const { data, error } = await supabase
                .from('leaderboards')
                .insert({
                    user_id: user.id,
                    username: user.email?.split('@')[0] || 'Anonymous',
                    category,
                    score,
                    metadata
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to submit score:', error);
            return null;
        }
    },

    /**
     * Get player rank
     * @param {string} category - Category
     */
    async getPlayerRank(category) {
        if (!supabase) return null;

        try {
            const user = supabase.auth.user();
            if (!user) return null;

            const { data, error } = await supabase
                .rpc('get_player_rank', {
                    p_user_id: user.id,
                    p_category: category
                });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to get rank:', error);
            return null;
        }
    },

    /**
     * Render leaderboards UI
     */
    async renderLeaderboards() {
        const categories = [
            { id: 'wealth', name: 'Riqueza', icon: '💰' },
            { id: 'age', name: 'Longevidad', icon: '👴' },
            { id: 'achievements', name: 'Logros', icon: '🏆' }
        ];

        let html = '<div class="leaderboards-container">';

        for (const cat of categories) {
            const players = await this.getTopPlayers(cat.id, 10);
            const rank = await this.getPlayerRank(cat.id);

            html += `
                <div class="leaderboard-section">
                    <h3>${cat.icon} ${cat.name}</h3>
                    ${rank ? `<p class="your-rank">Tu posición: #${rank}</p>` : ''}
                    <table class="leaderboard-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Jugador</th>
                                <th>Puntuación</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${players.map((p, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${p.username}</td>
                                    <td>${p.score.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }
};
