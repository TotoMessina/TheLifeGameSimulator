/**
 * UIHelpers - Utility functions for UI operations
 * Provides helpers for common UI patterns and performance optimizations
 */

const UIHelpers = {
    /**
     * Performance Optimizations
     */

    /**
     * Debounce function - delays execution until after wait time has elapsed
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function - limits execution to once per wait period
     * @param {Function} func - Function to throttle
     * @param {number} wait - Milliseconds to wait between calls
     * @returns {Function} Throttled function
     */
    throttle(func, wait = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, wait);
            }
        };
    },

    /**
     * Memoize function - caches results based on arguments
     * @param {Function} func - Function to memoize
     * @param {Function} keyGenerator - Optional custom key generator
     * @returns {Function} Memoized function
     */
    memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
        const cache = new Map();

        const memoized = function (...args) {
            const key = keyGenerator(...args);

            if (cache.has(key)) {
                return cache.get(key);
            }

            const result = func.apply(this, args);
            cache.set(key, result);

            return result;
        };
        memoized.cache = cache; // Expose cache for clearing
        return memoized;
    },

    /**
     * Clear memoization cache
     * @param {Function} memoizedFunc - The memoized function whose cache should be cleared
     */
    clearMemoCache(memoizedFunc) {
        if (memoizedFunc && memoizedFunc.cache && typeof memoizedFunc.cache.clear === 'function') {
            memoizedFunc.cache.clear();
        }
    },

    /**
     * UI Helper Functions
     */
    /**
     * Check if player can afford an item
     * @param {number} cost - Cost of the item
     * @returns {boolean}
     */
    canAfford(cost) {
        return state.money >= cost;
    },

    /**
     * Check if player owns an item
     * @param {string} itemId - ID of the item
     * @returns {boolean}
     */
    isOwned(itemId) {
        return state.items && state.items.includes(itemId);
    },

    /**
     * Format money with proper separators
     * @param {number} amount - Amount to format
     * @returns {string}
     */
    formatMoney(amount) {
        return `$${Math.floor(amount).toLocaleString()}`;
    },

    /**
     * Format a stat with current/max display
     * @param {number} value - Current value
     * @param {number} max - Maximum value
     * @returns {string}
     */
    formatStat(value, max) {
        return `${Math.floor(value)}/${max}`;
    },

    /**
     * Create a button element with data attributes
     * @param {Object} config - Button configuration
     * @param {string} config.text - Button text
     * @param {string} config.action - Action name for event delegation
     * @param {Object} config.params - Parameters for the action
     * @param {string} config.className - Additional CSS classes
     * @param {boolean} config.disabled - Whether button is disabled
     * @returns {string} HTML string
     */
    createButton(config) {
        const {
            text,
            action,
            params = {},
            className = 'act-btn',
            disabled = false,
            style = ''
        } = config;

        const paramsAttr = Object.keys(params).length > 0
            ? `data-params='${JSON.stringify(params)}'`
            : '';

        const disabledAttr = disabled ? 'disabled' : '';
        const styleAttr = style ? `style="${style}"` : '';

        return `<button class="${className}" 
                        data-action="${action}" 
                        ${paramsAttr} 
                        ${disabledAttr}
                        ${styleAttr}>
                    ${text}
                </button>`;
    },

    /**
     * Create a purchase button with cost display
     * @param {Object} config - Purchase button configuration
     * @returns {string} HTML string
     */
    createPurchaseButton(config) {
        const {
            text = 'Comprar',
            cost,
            action,
            params,
            className = 'btn-buy'
        } = config;

        const canAfford = this.canAfford(cost);
        const displayText = cost ? `${text} (${this.formatMoney(cost)})` : text;

        return this.createButton({
            text: displayText,
            action,
            params,
            className,
            disabled: !canAfford
        });
    },

    /**
     * Create a card element
     * @param {Object} config - Card configuration
     * @returns {string} HTML string
     */
    createCard(config) {
        const {
            title,
            subtitle = '',
            content = '',
            footer = '',
            icon = '',
            className = 'lifestyle-card'
        } = config;

        return `
            <div class="${className}">
                ${icon ? `<div class="card-icon">${icon}</div>` : ''}
                <div class="card-title">${title}</div>
                ${subtitle ? `<div class="card-subtitle">${subtitle}</div>` : ''}
                ${content ? `<div class="card-content">${content}</div>` : ''}
                ${footer ? `<div class="card-footer">${footer}</div>` : ''}
            </div>
        `;
    },

    /**
     * Create a stat bar (progress bar)
     * @param {Object} config - Stat bar configuration
     * @returns {string} HTML string
     */
    createStatBar(config) {
        const {
            label,
            value,
            max = 100,
            color = '#4CAF50',
            showNumbers = true
        } = config;

        const percentage = Math.min((value / max) * 100, 100);

        return `
            <div class="stat-bar-container">
                <div class="stat-bar-label">
                    ${label}
                    ${showNumbers ? `<span>${this.formatStat(value, max)}</span>` : ''}
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get button state classes based on conditions
     * @param {Object} conditions - Conditions to check
     * @returns {string} CSS classes
     */
    getButtonState(conditions) {
        const { isActive, isDisabled, isOwned } = conditions;
        const classes = [];

        if (isActive) classes.push('active-job');
        if (isDisabled) classes.push('disabled');
        if (isOwned) classes.push('owned');

        return classes.join(' ');
    },

    /**
     * Create a choice button (for multiple choice selections)
     * @param {Object} config - Choice button configuration
     * @returns {string} HTML string
     */
    createChoiceButton(config) {
        const {
            text,
            action,
            params,
            isActive = false
        } = config;

        const className = `choice-btn ${isActive ? 'active-job' : ''}`;

        return this.createButton({
            text,
            action,
            params,
            className
        });
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string}
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Create a list of items
     * @param {Array} items - Array of items to display
     * @param {Function} renderFn - Function to render each item
     * @returns {string} HTML string
     */
    createList(items, renderFn) {
        if (!items || items.length === 0) {
            return '<div class="empty-state">No hay elementos disponibles</div>';
        }

        return items.map(renderFn).join('');
    },

    /**
     * Create a grid of cards
     * @param {Array} items - Array of items
     * @param {Function} renderFn - Function to render each card
     * @param {string} className - Grid container class
     * @returns {string} HTML string
     */
    createGrid(items, renderFn, className = 'card-grid') {
        const content = this.createList(items, renderFn);
        return `<div class="${className}">${content}</div>`;
    }
};
