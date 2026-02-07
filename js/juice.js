/**
 * Juice.js - UI Enhancement Module
 * Provides animated counters, haptic feedback, dynamic bars, and particle effects
 */

const Juice = {
    /**
     * Animates a counter from start to end value with smooth counting effect
     * @param {HTMLElement} element - Element containing the number to animate
     * @param {number} startValue - Starting value
     * @param {number} endValue - Ending value
     * @param {number} duration - Animation duration in ms (default: 500)
     * @param {boolean} isCurrency - Format as currency with $ and commas
     */
    animateCounter(element, startValue, endValue, duration = 500, isCurrency = false) {
        if (!element) return;

        const startTime = performance.now();
        const difference = endValue - startValue;

        const formatNumber = (val) => {
            if (isCurrency) {
                return '$' + Math.floor(val).toLocaleString('es-ES');
            }
            return Math.floor(val).toString();
        };

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (difference * easeOut);

            element.textContent = formatNumber(currentValue);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = formatNumber(endValue);
            }
        };

        requestAnimationFrame(step);
    },

    /**
     * Provides haptic feedback on supported devices
     * @param {string} pattern - 'short' (10ms), 'double' (10ms, 50ms, 10ms), or custom array
     */
    hapticFeedback(pattern = 'short') {
        if (!navigator.vibrate) return; // Fallback for unsupported devices

        const patterns = {
            short: [10],
            double: [10, 50, 10],
            long: [50]
        };

        const vibrationPattern = patterns[pattern] || patterns.short;
        navigator.vibrate(vibrationPattern);
    },

    /**
     * Monitors progress bars and adds critical state warnings
     * Should be called once during initialization
     */
    addDynamicBarBehavior() {
        const checkCritical = () => {
            const bars = [
                { bar: document.getElementById('health-bar'), type: 'health' },
                { bar: document.getElementById('happiness-bar'), type: 'happiness' },
                { bar: document.getElementById('energy-bar'), type: 'energy' }
            ];

            bars.forEach(({ bar, type }) => {
                if (!bar) return;

                const width = parseFloat(bar.style.width) || 0;

                if (width < 20 && width > 0) {
                    bar.classList.add('critical-blink');
                } else {
                    bar.classList.remove('critical-blink');
                }
            });
        };

        // Check every 500ms
        setInterval(checkCritical, 500);
    },

    /**
     * Spawns confetti particles from a button or element
     * @param {HTMLElement} origin - Element to spawn particles from (optional)
     * @param {Array<string>} emojis - Array of emojis to use
     * @param {number} count - Number of particles to spawn
     */
    spawnConfetti(origin = null, emojis = ['💰', '✨'], count = 10) {
        const container = document.body;

        // Get origin position
        let originX, originY;
        if (origin && origin.getBoundingClientRect) {
            const rect = origin.getBoundingClientRect();
            originX = rect.left + rect.width / 2;
            originY = rect.top + rect.height / 2;
        } else {
            // Default to center of screen
            originX = window.innerWidth / 2;
            originY = window.innerHeight / 2;
        }

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            // Random trajectory
            const angle = (Math.random() * Math.PI * 2);
            const velocity = 100 + Math.random() * 150;
            const deltaX = Math.cos(angle) * velocity;
            const deltaY = Math.sin(angle) * velocity - 100; // Bias upward

            particle.style.left = originX + 'px';
            particle.style.top = originY + 'px';
            particle.style.setProperty('--deltaX', deltaX + 'px');
            particle.style.setProperty('--deltaY', deltaY + 'px');

            // Random rotation
            const rotation = Math.random() * 360;
            particle.style.setProperty('--rotation', rotation + 'deg');

            // Small delay for cascade effect
            particle.style.animationDelay = (i * 50) + 'ms';

            container.appendChild(particle);

            // Remove after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
    },

    /**
     * Triggers confetti for money gains
     * @param {number} amount - Amount of money gained
     * @param {HTMLElement} origin - Origin element
     */
    moneyGained(amount, origin = null) {
        if (amount >= 5000) {
            this.spawnConfetti(origin, ['💰', '💵', '✨', '🤑'], 15);
            this.hapticFeedback('short');
        } else if (amount >= 1000) {
            this.spawnConfetti(origin, ['💰', '✨'], 8);
            this.hapticFeedback('short');
        }
    },

    /**
     * Triggers confetti for promotions/achievements
     * @param {HTMLElement} origin - Origin element
     */
    promotion(origin = null) {
        this.spawnConfetti(origin, ['🎉', '⭐', '✨', '🏆'], 20);
        this.hapticFeedback('double');
    },

    /**
     * Triggers haptic feedback for negative events
     */
    negativeEvent() {
        this.hapticFeedback('double');
    },

    /**
     * Initialize all juice behaviors
     */
    init() {
        console.log('🧃 Juice module initialized');
        this.addDynamicBarBehavior();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Juice.init());
} else {
    Juice.init();
}
