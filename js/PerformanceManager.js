/**
 * PerformanceManager - Performance optimizations and monitoring
 * Provides debounced/throttled versions of expensive operations
 */

const PerformanceManager = {
    /**
     * Debounced version of UI.render()
     * Prevents excessive re-renders
     */
    debouncedRender: null,

    /**
     * Lazy-loaded modal renderers
     * Only render modals when first opened
     */
    lazyModals: {
        'job-modal': { loaded: false, renderFn: null },
        'shop-modal': { loaded: false, renderFn: null },
        'activity-modal': { loaded: false, renderFn: null }
    },

    /**
     * Initialize performance optimizations
     */
    init() {
        this.setupDebouncedRender();
        this.setupLazyModals();
        console.log('✅ PerformanceManager initialized');
    },

    /**
     * Setup debounced UI.render()
     */
    setupDebouncedRender() {
        // Store original render function
        const originalRender = UI.render.bind(UI);

        // Create debounced version (100ms delay)
        this.debouncedRender = UIHelpers.debounce(originalRender, 100);

        // Replace UI.render with debounced version
        UI.renderImmediate = originalRender; // Keep immediate version for critical updates
        UI.render = this.debouncedRender;
    },

    /**
     * Setup lazy loading for heavy modals
     */
    setupLazyModals() {
        // Job Modal
        this.lazyModals['job-modal'].renderFn = () => {
            if (!this.lazyModals['job-modal'].loaded) {
                UI.renderJobMarket();
                this.lazyModals['job-modal'].loaded = true;
            }
        };

        // Shop Modal
        this.lazyModals['shop-modal'].renderFn = () => {
            if (!this.lazyModals['shop-modal'].loaded) {
                UI.populateShop();
                this.lazyModals['shop-modal'].loaded = true;
            }
        };

        // Activity Modal
        this.lazyModals['activity-modal'].renderFn = () => {
            if (!this.lazyModals['activity-modal'].loaded) {
                UI.switchActTab('social'); // Default tab
                this.lazyModals['activity-modal'].loaded = true;
            }
        };
    },

    /**
     * Open modal with lazy loading
     * @param {string} modalId - ID of modal to open
     */
    openModalLazy(modalId) {
        const lazyModal = this.lazyModals[modalId];

        if (lazyModal && lazyModal.renderFn) {
            lazyModal.renderFn();
        }

        EventManager.openModal(modalId);
    },

    /**
     * Reset lazy modal (force re-render next time)
     * @param {string} modalId - ID of modal to reset
     */
    resetLazyModal(modalId) {
        if (this.lazyModals[modalId]) {
            this.lazyModals[modalId].loaded = false;
        }
    },

    /**
     * Virtual scrolling for large lists
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Array of items to render
     * @param {Function} renderItem - Function to render each item
     * @param {number} itemHeight - Height of each item in pixels
     */
    createVirtualList(container, items, renderItem, itemHeight = 80) {
        if (!container || !items || items.length === 0) return;

        const containerHeight = container.clientHeight || 600;
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // +2 for buffer

        let scrollTop = 0;
        let startIndex = 0;

        const render = () => {
            startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.min(startIndex + visibleCount, items.length);

            // Clear container
            container.innerHTML = '';

            // Set container height to accommodate all items
            container.style.position = 'relative';
            container.style.height = `${items.length * itemHeight}px`;

            // Render only visible items
            for (let i = startIndex; i < endIndex; i++) {
                const itemEl = renderItem(items[i], i);

                // Position absolutely
                if (typeof itemEl === 'string') {
                    const div = document.createElement('div');
                    div.innerHTML = itemEl;
                    div.style.position = 'absolute';
                    div.style.top = `${i * itemHeight}px`;
                    div.style.width = '100%';
                    container.appendChild(div.firstElementChild || div);
                } else {
                    itemEl.style.position = 'absolute';
                    itemEl.style.top = `${i * itemHeight}px`;
                    itemEl.style.width = '100%';
                    container.appendChild(itemEl);
                }
            }
        };

        // Throttled scroll handler
        const handleScroll = UIHelpers.throttle(() => {
            scrollTop = container.scrollTop;
            render();
        }, 50);

        container.addEventListener('scroll', handleScroll);

        // Initial render
        render();

        return {
            update: (newItems) => {
                items = newItems;
                render();
            },
            destroy: () => {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    },

    /**
     * Performance monitoring
     */
    metrics: {
        renderCount: 0,
        renderTime: [],
        lastRenderTime: 0
    },

    /**
     * Track render performance
     */
    trackRender(duration) {
        this.metrics.renderCount++;
        this.metrics.renderTime.push(duration);
        this.metrics.lastRenderTime = duration;

        // Keep only last 100 renders
        if (this.metrics.renderTime.length > 100) {
            this.metrics.renderTime.shift();
        }
    },

    /**
     * Get performance stats
     */
    getStats() {
        const avgRenderTime = this.metrics.renderTime.reduce((a, b) => a + b, 0) / this.metrics.renderTime.length;

        return {
            totalRenders: this.metrics.renderCount,
            avgRenderTime: avgRenderTime.toFixed(2),
            lastRenderTime: this.metrics.lastRenderTime.toFixed(2),
            cacheHitRate: this.getCacheHitRate()
        };
    },

    /**
     * Get memoization cache hit rate
     */
    getCacheHitRate() {
        // This would require tracking cache hits/misses
        // Placeholder for now
        return 'N/A';
    },

    /**
     * Clear all performance caches
     */
    clearCaches() {
        // Clear memoization cache for getFinancialSummary
        if (FinanceManager.getFinancialSummary && FinanceManager.getFinancialSummary.cache) {
            FinanceManager.getFinancialSummary.cache.clear();
        }

        // Reset lazy modals
        Object.keys(this.lazyModals).forEach(modalId => {
            this.resetLazyModal(modalId);
        });

        console.log('🧹 Performance caches cleared');
    }
};
