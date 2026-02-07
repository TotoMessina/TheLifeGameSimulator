/**
 * KeyboardManager - Keyboard navigation and shortcuts
 * Provides accessibility through keyboard controls
 */

const KeyboardManager = {
    /**
     * Keyboard shortcuts registry
     */
    shortcuts: new Map(),

    /**
     * Initialize keyboard manager
     */
    init() {
        this.setupGlobalListeners();
        this.registerDefaultShortcuts();
        console.log('✅ KeyboardManager initialized');
    },

    /**
     * Setup global keyboard event listeners
     */
    setupGlobalListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));

        // Prevent default space scroll behavior when not in input
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    },

    /**
     * Handle keyboard press events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyPress(e) {
        // Don't intercept if user is typing
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // ESC - Close active modal
        if (e.key === 'Escape') {
            EventManager.closeAllModals();
            return;
        }

        // Enter - Activate focused button
        if (e.key === 'Enter' && e.target.matches('[data-action]')) {
            e.target.click();
            return;
        }

        // Space - Next month (when no modal active)
        if (e.key === ' ' && !document.querySelector('.modal.active')) {
            e.preventDefault();
            Game.nextMonth();
            return;
        }

        // Ctrl/Cmd shortcuts
        if (e.ctrlKey || e.metaKey) {
            this.handleShortcut(e);
        }
    },

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleShortcut(e) {
        const key = e.key.toLowerCase();
        const handler = this.shortcuts.get(key);

        if (handler) {
            e.preventDefault();
            handler();
        }
    },

    /**
     * Register a keyboard shortcut
     * @param {string} key - Key to bind
     * @param {Function} handler - Handler function
     * @param {string} description - Description for help menu
     */
    registerShortcut(key, handler, description = '') {
        this.shortcuts.set(key.toLowerCase(), handler);
    },

    /**
     * Register default shortcuts
     */
    registerDefaultShortcuts() {
        // Ctrl+S - Save game
        this.registerShortcut('s', () => {
            DB.saveGame();
        }, 'Save game');

        // Ctrl+J - Open jobs
        this.registerShortcut('j', () => {
            PerformanceManager.openModalLazy('job-modal');
        }, 'Open job market');

        // Ctrl+M - Open shop
        this.registerShortcut('m', () => {
            PerformanceManager.openModalLazy('shop-modal');
        }, 'Open shop');

        // Ctrl+A - Open activity
        this.registerShortcut('a', () => {
            PerformanceManager.openModalLazy('activity-modal');
        }, 'Open activities');

        // Ctrl+B - Open business
        this.registerShortcut('b', () => {
            if (state.business && state.business.active) {
                EventManager.openModal('business-modal');
            }
        }, 'Open business');

        // Ctrl+H - Show help
        this.registerShortcut('h', () => {
            this.showHelp();
        }, 'Show keyboard shortcuts');
    },

    /**
     * Show keyboard shortcuts help
     */
    showHelp() {
        const shortcuts = [
            { key: 'Space', action: 'Next month' },
            { key: 'Esc', action: 'Close modal' },
            { key: 'Ctrl+S', action: 'Save game' },
            { key: 'Ctrl+J', action: 'Open jobs' },
            { key: 'Ctrl+M', action: 'Open shop' },
            { key: 'Ctrl+A', action: 'Open activities' },
            { key: 'Ctrl+B', action: 'Open business' },
            { key: 'Ctrl+H', action: 'Show this help' }
        ];

        const helpText = shortcuts.map(s => `${s.key}: ${s.action}`).join('\n');

        UI.showAlert('⌨️ Keyboard Shortcuts', helpText);
    },

    /**
     * Enable tab navigation for modal elements
     * @param {string} modalId - ID of modal to enable tab navigation
     */
    enableTabNavigation(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        // Focus first element when modal opens
        focusableElements[0].focus();

        // Trap focus within modal
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift+Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
};
