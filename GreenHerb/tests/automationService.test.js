const { switchMode, decideAction } = require('../src/services/automationService');

const mockUser = (role) => ({ role });

describe('Automation Service', () => {
    describe('switchMode', () => {
        test('should switch from Manual to Automatic with authorized user', () => {
            const user = mockUser('Technical Manager');
            const result = switchMode('Manual', 'Automatic', user);
            expect(result).toBe('Automatic');
        });

        test('should switch from Automatic to Manual with any user', () => {
            const user = mockUser('Technician');
            const result = switchMode('Automatic', 'Manual', user);
            expect(result).toBe('Manual');
        });

        test('should throw error for invalid mode', () => {
            const user = mockUser('Admin');
            expect(() => switchMode('Manual', 'InvalidMode', user))
                .toThrow('Invalid mode. Use "Manual" or "Automatic".');
        });

        test('should throw error if Technician tries to switch to Automatic', () => {
            const user = mockUser('Technician');
            expect(() => switchMode('Manual', 'Automatic', user))
                .toThrow('Unauthorized: Only Technical Manager or Admin can switch to Automatic mode.');
        });
    });

    describe('decideAction', () => {
        test('should return execute in Automatic mode with active rule', () => {
            const result = decideAction('Automatic', true, { temperature: 25 });
            expect(result).toBe('execute');
        });

        test('should return suggest in Automatic mode with inactive rule', () => {
            const result = decideAction('Automatic', false, { temperature: 25 });
            expect(result).toBe('suggest');
        });

        test('should return suggest in Manual mode with active rule', () => {
            const result = decideAction('Manual', true, { temperature: 25 });
            expect(result).toBe('suggest');
        });

        test('should return suggest in Manual mode with inactive rule', () => {
            const result = decideAction('Manual', false, { temperature: 25 });
            expect(result).toBe('suggest');
        });
    });
});