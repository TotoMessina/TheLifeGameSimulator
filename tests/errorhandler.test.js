import { describe, it, expect, beforeEach } from 'vitest';

describe('ErrorHandler', () => {
    beforeEach(() => {
        ErrorHandler.clearErrorLog();
    });

    describe('safeExecute', () => {
        it('should execute function successfully', () => {
            const result = ErrorHandler.safeExecute(() => {
                return 42;
            }, 'Test');

            expect(result).toBe(42);
        });

        it('should catch errors and return fallback', () => {
            const result = ErrorHandler.safeExecute(() => {
                throw new Error('Test error');
            }, 'Test', 'fallback');

            expect(result).toBe('fallback');
        });

        it('should log errors', () => {
            ErrorHandler.safeExecute(() => {
                throw new Error('Test error');
            }, 'Test');

            const log = ErrorHandler.getErrorLog();
            expect(log.length).toBe(1);
            expect(log[0].context).toBe('Test');
            expect(log[0].message).toBe('Test error');
        });
    });

    describe('validate', () => {
        it('should validate required values', () => {
            expect(() => {
                ErrorHandler.validate(null, { required: true });
            }).toThrow();

            expect(() => {
                ErrorHandler.validate('value', { required: true });
            }).not.toThrow();
        });

        it('should validate types', () => {
            expect(() => {
                ErrorHandler.validate('string', { type: 'number' });
            }).toThrow();

            expect(() => {
                ErrorHandler.validate(42, { type: 'number' });
            }).not.toThrow();
        });

        it('should validate min/max', () => {
            expect(() => {
                ErrorHandler.validate(5, { min: 10 });
            }).toThrow();

            expect(() => {
                ErrorHandler.validate(15, { max: 10 });
            }).toThrow();

            expect(() => {
                ErrorHandler.validate(10, { min: 5, max: 15 });
            }).not.toThrow();
        });
    });

    describe('errorLog', () => {
        it('should store errors', () => {
            ErrorHandler.logError(new Error('Error 1'), 'Context 1');
            ErrorHandler.logError(new Error('Error 2'), 'Context 2');

            const log = ErrorHandler.getErrorLog();
            expect(log.length).toBe(2);
        });

        it('should limit log size', () => {
            // Add more than maxLogSize errors
            for (let i = 0; i < 60; i++) {
                ErrorHandler.logError(new Error(`Error ${i}`), 'Test');
            }

            const log = ErrorHandler.getErrorLog();
            expect(log.length).toBeLessThanOrEqual(50);
        });

        it('should clear log', () => {
            ErrorHandler.logError(new Error('Test'), 'Test');
            expect(ErrorHandler.getErrorLog().length).toBe(1);

            ErrorHandler.clearErrorLog();
            expect(ErrorHandler.getErrorLog().length).toBe(0);
        });
    });
});
