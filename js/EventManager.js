/**
 * EventManager - Centralized event handling system
 * Manages all UI event listeners and provides helpers for common patterns
 */

const EventManager = {
    /**
     * Registered modals for cleanup
     * @private
     */
    _registeredModals: [],

    /**
     * Initialize the event manager
     */
    init() {
        this.setupGlobalDelegation();
        console.log('✅ EventManager initialized');
    },

    /**
     * Setup global event delegation for dynamic content
     * @private
     */
    setupGlobalDelegation() {
        // Delegate clicks on buttons with data-action attribute
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const params = button.dataset.params ? JSON.parse(button.dataset.params) : {};

            this.handleAction(action, params, button);
        });
    },

    /**
     * Handle delegated actions
     * @private
     */
    handleAction(action, params, element) {
        const handlers = {
            // Game actions
            'buy-item': () => Game.buyItem(params.itemId),
            'buy-rare-item': () => Game.buyRareItem(params.itemId),
            'buy-housing': () => Game.buyHousingFromModal(params.housingId),
            'buy-vehicle': () => Game.buyVehicleFromModal(params.vehicleId),
            'buy-pet': () => Game.buyPet(params.petId),
            'buy-real-estate': () => Game.buyRealEstate(params.propertyId),
            'sell-real-estate': () => Game.sellRealEstate(params.propertyId),
            'apply-job': () => Game.applyJob(params.jobId),
            'enroll-course': () => Game.enrollCourse(params.courseId),
            'trade': () => Game.trade(params.assetId, params.type),
            'donate-charity': () => Game.donateCharity(params.amount),
            'find-love': () => Game.findLove(),
            'advance-relationship': () => Game.advanceRel(),
            'date-partner': () => Game.datePartner(),
            'breakup': () => Game.breakup(),
            'maintain-friend': () => Game.maintainFriend(params.friendId),
            'take-vacation': () => Game.takeVacationDays(params.days),

            // Athletics actions
            'set-training': () => {
                Athletics.setTraining(params.level);
                UI.renderAthletics();
            },
            'register-race': () => {
                if (Athletics.registerRace(params.raceType)) {
                    UI.renderAthletics();
                }
            },
            'buy-gear': () => Athletics.buyGear(params.gearId),

            // Business actions
            'raise-funds': () => UI.raiseFunds(),
            'close-business': () => {
                if (confirm('¿Cerrar empresa?')) {
                    state.business.active = false;
                    UI.renderBusiness();
                }
            },

            // Freelancer actions
            'accept-gig': () => Freelancer.acceptGig(params.gigId),

            // Routine actions
            'buy-upgrade': () => Routine.buyUpgrade(params.upgradeId),

            // School actions
            'set-focus': () => School.setFocus(params.subject),

            // UI actions
            'switch-tab': () => UI.switchActTab(params.tab)
        };

        const handler = handlers[action];
        if (handler) {
            handler();
        } else {
            console.warn(`Unknown action: ${action}`);
        }
    },

    /**
     * Register a modal with automatic open/close handling
     * @param {string} modalId - ID of the modal element
     * @param {string} triggerId - ID of the trigger button
     * @param {Function} renderFn - Optional render function to call on open
     */
    registerModal(modalId, triggerId, renderFn = null) {
        const modal = document.getElementById(modalId);
        const trigger = document.getElementById(triggerId);
        const closeBtn = document.getElementById(`close-${modalId.replace('-modal', '')}`);

        if (!modal || !trigger) {
            console.warn(`Modal registration failed: ${modalId}`);
            return;
        }

        // Open handler
        trigger.onclick = () => {
            modal.classList.add('active');
            if (renderFn) renderFn();
        };

        // Close handler
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove('active');
            };
        }

        // Track registration
        this._registeredModals.push({ modalId, triggerId });
    },

    /**
     * Register multiple modals at once
     * @param {Array} modals - Array of {modalId, triggerId, renderFn}
     */
    registerModals(modals) {
        modals.forEach(({ modalId, triggerId, renderFn }) => {
            this.registerModal(modalId, triggerId, renderFn);
        });
    },

    /**
     * Open a modal programmatically
     * @param {string} modalId - ID of the modal to open
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    /**
     * Close a modal programmatically
     * @param {string} modalId - ID of the modal to close
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    /**
     * Close all modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    /**
     * Cleanup - remove all event listeners
     */
    cleanup() {
        this._registeredModals = [];
        console.log('🧹 EventManager cleaned up');
    }
};
