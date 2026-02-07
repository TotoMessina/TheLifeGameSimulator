/**
 * TabManager - Native Mobile Tab Navigation
 * Manages bottom tab bar navigation for iOS/Android-like experience
 */

const TabManager = {
    currentTab: 'vida',

    /**
     * Initialize tab navigation system
     */
    init() {
        console.log('📱 TabManager initialized');

        // Setup tab button listeners
        const tabButtons = document.querySelectorAll('[data-tab]');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(btn.dataset.tab);

                // Haptic feedback if available
                if (typeof Juice !== 'undefined' && Juice.hapticFeedback) {
                    Juice.hapticFeedback('short');
                }
            });
        });

        // Activate initial tab
        this.switchTab(this.currentTab);

        // Add swipe support for tab switching (optional enhancement)
        this.setupSwipeGestures();
    },

    /**
     * Switch to a specific tab
     * @param {string} tabName - Name of the tab to switch to
     */
    switchTab(tabName) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab content
        const targetTab = document.getElementById(`tab-${tabName}`);
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error(`Tab not found: tab-${tabName}`);
            return;
        }

        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.currentTab = tabName;

        // Scroll to top of new tab
        if (targetTab) {
            targetTab.scrollTop = 0;
        }

        // Trigger any tab-specific rendering
        this.onTabChange(tabName);
    },

    /**
     * Called when tab changes - can be used to trigger specific UI updates
     * @param {string} tabName - Name of the newly active tab
     */
    onTabChange(tabName) {
        switch (tabName) {
            case 'trabajo':
                // Refresh job data if needed
                if (typeof UI !== 'undefined' && UI.renderJobDashboard) {
                    // Only render if modal is open
                }
                break;
            case 'inversiones':
                // Could refresh financial data
                break;
            case 'social':
                // Could refresh social data
                break;
        }
    },

    /**
     * Setup swipe gestures for tab navigation (mobile enhancement)
     */
    setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;

        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        appContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        appContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) < swipeThreshold) return;

            const tabs = ['vida', 'trabajo', 'inversiones', 'social'];
            const currentIndex = tabs.indexOf(this.currentTab);

            if (diff > 0 && currentIndex < tabs.length - 1) {
                // Swipe left - next tab
                this.switchTab(tabs[currentIndex + 1]);
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right - previous tab
                this.switchTab(tabs[currentIndex - 1]);
            }
        };
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TabManager.init());
} else {
    // DOM already loaded
    TabManager.init();
}
