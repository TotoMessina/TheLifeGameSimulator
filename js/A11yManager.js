/**
 * A11yManager - Accessibility features
 * Provides ARIA labels, screen reader support, and WCAG compliance
 */

const A11yManager = {
    /**
     * Initialize accessibility features
     */
    init() {
        this.createScreenReaderAnnouncer();
        this.addARIALabels();
        this.setupFocusManagement();
        console.log('✅ A11yManager initialized');
    },

    /**
     * Create screen reader announcer element
     */
    createScreenReaderAnnouncer() {
        // Check if already exists
        if (document.getElementById('sr-announcer')) return;

        const announcer = document.createElement('div');
        announcer.id = 'sr-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.setAttribute('role', 'status');

        document.body.appendChild(announcer);

        // Add CSS for sr-only class if not exists
        if (!document.querySelector('style[data-sr-only]')) {
            const style = document.createElement('style');
            style.setAttribute('data-sr-only', 'true');
            style.textContent = `
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0,0,0,0);
                    white-space: nowrap;
                    border: 0;
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        const announcer = document.getElementById('sr-announcer');
        if (!announcer) return;

        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;

        // Clear after 1 second
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    },

    /**
     * Add ARIA labels to critical buttons
     */
    addARIALabels() {
        // Next month button
        const nextBtn = document.getElementById('btn-next');
        if (nextBtn && !nextBtn.getAttribute('aria-label')) {
            nextBtn.setAttribute('aria-label', 'Avanzar al siguiente mes');
            nextBtn.setAttribute('role', 'button');
        }

        // Settings button
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn && !settingsBtn.getAttribute('aria-label')) {
            settingsBtn.setAttribute('aria-label', 'Abrir configuración');
        }

        // Trophy button
        const trophyBtn = document.getElementById('btn-trophy');
        if (trophyBtn && !trophyBtn.getAttribute('aria-label')) {
            trophyBtn.setAttribute('aria-label', 'Ver logros y trofeos');
        }

        // Job trigger
        const jobTrigger = document.getElementById('job-trigger');
        if (jobTrigger && !jobTrigger.getAttribute('aria-label')) {
            jobTrigger.setAttribute('aria-label', 'Abrir mercado laboral');
        }

        // Add ARIA labels to modals
        this.labelModals();
    },

    /**
     * Add ARIA labels to all modals
     */
    labelModals() {
        const modals = document.querySelectorAll('.modal');

        modals.forEach(modal => {
            if (!modal.getAttribute('role')) {
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-modal', 'true');
            }

            // Find modal title
            const title = modal.querySelector('.modal-header span, h2, h3');
            if (title && !modal.getAttribute('aria-labelledby')) {
                // Add ID to title if it doesn't have one
                if (!title.id) {
                    title.id = `${modal.id}-title`;
                }
                modal.setAttribute('aria-labelledby', title.id);
            }

            // Label close buttons
            const closeBtn = modal.querySelector('[id^="close-"]');
            if (closeBtn && !closeBtn.getAttribute('aria-label')) {
                const modalName = modal.id.replace('-modal', '').replace(/-/g, ' ');
                closeBtn.setAttribute('aria-label', `Cerrar ${modalName}`);
            }
        });
    },

    /**
     * Setup focus management for modals
     */
    setupFocusManagement() {
        // When modal opens, focus first focusable element
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.target.classList.forEach((className) => {
                    if (className === 'active') {
                        const modal = mutation.target;
                        if (modal.classList.contains('modal')) {
                            this.focusFirstElement(modal);
                            KeyboardManager.enableTabNavigation(modal.id);
                        }
                    }
                });
            });
        });

        // Observe all modals
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    },

    /**
     * Focus first focusable element in container
     * @param {HTMLElement} container - Container element
     */
    focusFirstElement(container) {
        const focusable = container.querySelector(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable) {
            setTimeout(() => focusable.focus(), 100);
        }
    },

    /**
     * Add accessible button helper
     * @param {Object} config - Button configuration
     * @returns {string} HTML string with ARIA attributes
     */
    createAccessibleButton(config) {
        const {
            text,
            action,
            params = {},
            ariaLabel,
            className = 'act-btn',
            disabled = false
        } = config;

        const label = ariaLabel || text;

        return `
            <button 
                class="${className}"
                data-action="${action}"
                data-params='${JSON.stringify(params)}'
                aria-label="${label}"
                role="button"
                ${disabled ? 'disabled aria-disabled="true"' : ''}
            >
                ${text}
            </button>
        `;
    },

    /**
     * Verify WCAG AA contrast ratios
     * @returns {Object} Contrast check results
     */
    checkContrast() {
        const results = {
            passed: [],
            failed: []
        };

        // Sample elements to check
        const elementsToCheck = [
            { selector: 'body', bg: '#121212', fg: '#e0e0e0' },
            { selector: '.stat-label', bg: '#121212', fg: '#b0b0b0' },
            { selector: 'button', bg: '#4CAF50', fg: '#ffffff' },
            { selector: 'button:disabled', bg: '#333', fg: '#999' }
        ];

        elementsToCheck.forEach(item => {
            const ratio = this.calculateContrastRatio(item.bg, item.fg);
            const passes = ratio >= 4.5; // WCAG AA for normal text

            if (passes) {
                results.passed.push({ ...item, ratio });
            } else {
                results.failed.push({ ...item, ratio });
            }
        });

        return results;
    },

    /**
     * Calculate contrast ratio between two colors
     * @param {string} color1 - First color (hex)
     * @param {string} color2 - Second color (hex)
     * @returns {number} Contrast ratio
     */
    calculateContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1);
        const lum2 = this.getLuminance(color2);

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        return (lighter + 0.05) / (darker + 0.05);
    },

    /**
     * Get relative luminance of a color
     * @param {string} hex - Hex color
     * @returns {number} Relative luminance
     */
    getLuminance(hex) {
        const rgb = this.hexToRgb(hex);
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
            val = val / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    /**
     * Convert hex to RGB
     * @param {string} hex - Hex color
     * @returns {Object} RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};
