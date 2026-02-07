/**
 * ErrorHandler - Centralized error handling and logging
 * Provides safe execution wrappers and structured error logging
 */

const ErrorHandler = {
    /**
     * Error log storage (for debugging)
     */
    errorLog: [],

    /**
     * Maximum errors to store
     */
    maxLogSize: 50,

    /**
     * Safe execution wrapper
     * Catches errors and handles them gracefully
     * 
     * @param {Function} fn - Function to execute safely
     * @param {string} context - Context description for debugging
     * @param {*} fallback - Fallback value to return on error
     * @returns {*} Result of fn() or fallback on error
     */
    safeExecute(fn, context = 'Unknown', fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.logError(error, context);
            this.showUserError(error, context);
            return fallback;
        }
    },

    /**
     * Async safe execution wrapper
     */
    async safeExecuteAsync(fn, context = 'Unknown', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.logError(error, context);
            this.showUserError(error, context);
            return fallback;
        }
    },

    /**
     * Log error to console and storage
     */
    logError(error, context) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context,
            message: error.message,
            stack: error.stack,
            state: {
                age: state.age,
                money: state.money,
                job: state.currJobId
            }
        };

        // Add to log
        this.errorLog.push(errorEntry);

        // Trim log if too large
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Console error
        console.error(`[${context}]`, error);

        // Could send to analytics/monitoring service here
        // this.sendToMonitoring(errorEntry);
    },

    /**
     * Show user-friendly error message
     */
    showUserError(error, context) {
        // Don't spam user with errors
        if (this.shouldShowError(context)) {
            const userMessage = this.getUserFriendlyMessage(error, context);

            if (typeof UI !== 'undefined' && UI.showAlert) {
                UI.showAlert('Error', userMessage);
            } else {
                alert(userMessage);
            }
        }
    },

    /**
     * Determine if error should be shown to user
     * (Avoid spamming with multiple errors)
     */
    shouldShowError(context) {
        // Don't show more than 1 error per 5 seconds
        const now = Date.now();
        if (!this.lastErrorTime) {
            this.lastErrorTime = now;
            return true;
        }

        if (now - this.lastErrorTime > 5000) {
            this.lastErrorTime = now;
            return true;
        }

        return false;
    },

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(error, context) {
        // Map technical errors to user-friendly messages
        const errorMessages = {
            'Game.nextMonth': 'Error al avanzar el mes. Por favor, recarga la página.',
            'DB.saveGame': 'Error al guardar el juego. Verifica tu conexión.',
            'DB.loadGame': 'Error al cargar el juego. Verifica tu conexión.',
            'UI.render': 'Error al actualizar la interfaz. Por favor, recarga la página.',
            'FinanceManager': 'Error en cálculos financieros. Contacta soporte.'
        };

        return errorMessages[context] || `Algo salió mal: ${error.message}`;
    },

    /**
     * Validate function arguments
     */
    validate(value, rules, context = 'Validation') {
        const errors = [];

        if (rules.required && (value === null || value === undefined)) {
            errors.push('Value is required');
        }

        if (rules.type && typeof value !== rules.type) {
            errors.push(`Expected type ${rules.type}, got ${typeof value}`);
        }

        if (rules.min !== undefined && value < rules.min) {
            errors.push(`Value must be >= ${rules.min}`);
        }

        if (rules.max !== undefined && value > rules.max) {
            errors.push(`Value must be <= ${rules.max}`);
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push('Value does not match pattern');
        }

        if (errors.length > 0) {
            throw new Error(`${context}: ${errors.join(', ')}`);
        }

        return true;
    },

    /**
     * Validate DOM element exists
     */
    validateElement(elementId, context = 'DOM') {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`${context}: Element #${elementId} not found`);
        }
        return element;
    },

    /**
     * Get error log for debugging
     */
    getErrorLog() {
        return this.errorLog;
    },

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
    },

    /**
     * Export error log as JSON
     */
    exportErrorLog() {
        const data = JSON.stringify(this.errorLog, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Global error handler
window.addEventListener('error', (event) => {
    ErrorHandler.logError(event.error || new Error(event.message), 'Global');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.logError(event.reason, 'Promise Rejection');
});
