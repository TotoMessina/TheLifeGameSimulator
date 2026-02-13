/**
 * Feature Name Template
 * Copy this file to create a new feature module (e.g., `stock_market.js`).
 * 
 * Usage:
 * 1. Rename object to FeatureName (e.g., StockMarket)
 * 2. Implement init(), update(), render()
 * 3. Add <script src="js/features/your_feature.js"></script> to index.html
 * 4. Call FeatureName.init() in Game.init() or via event
 */

const FeatureTemplate = {
    // Configuration & State
    config: {
        id: 'feature_id',
        name: 'Feature Name',
        enabled: true
    },
    
    state: {
        // Feature-specific state
        initialized: false
    },

    /**
     * Called once on game start
     */
    init() {
        console.log(`[${this.config.name}] Initializing...`);
        this.cacheDOM();
        this.bindEvents();
        this.state.initialized = true;
    },

    /**
     * Cache DOM elements specific to this feature
     */
    cacheDOM() {
        // this.dom = { container: document.getElementById('feature-container') };
    },

    /**
     * Set up event listeners
     */
    bindEvents() {
        // document.addEventListener('game-tick', () => this.update());
    },

    /**
     * Called every game month/tick
     */
    update() {
        if (!this.state.initialized) return;
        // Logic here
    },

    /**
     * Update UI
     */
    render() {
        if (!this.state.initialized) return;
        // DOM manipulation here
    },

    /**
     * Helper to integrate with global State safely
     * @param {string} key 
     * @param {any} value 
     */
    updateGlobalState(key, value) {
        if (typeof Game !== 'undefined' && Game.updateStat) {
            Game.updateStat(key, value);
        } else {
            console.warn(`[${this.config.name}] Game execution context missing.`);
        }
    }
};

// Expose to window
window.FeatureTemplate = FeatureTemplate;
