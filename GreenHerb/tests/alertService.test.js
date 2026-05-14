const { classifyAlert, resolveAlert } = require('../src/services/alertService');

const defaultLimits = {
    maxTemp: 30,
    minTemp: 18,
    maxHumidity: 80,
    minHumidity: 40,
};

describe('Alert Service', () => {
    describe('classifyAlert', () => {
        test('should return Informative if sensor is not OK', () => {
            const result = classifyAlert(25, 50, false, defaultLimits);
            expect(result).toBe('Informative');
        });

        test('should return Critical if temperature and humidity are out of range', () => {
            const result = classifyAlert(35, 30, true, defaultLimits); // temp > maxTemp, humidity < minHumidity
            expect(result).toBe('Critical');
        });

        test('should return Warning if only temperature is out of range', () => {
            const result = classifyAlert(35, 50, true, defaultLimits);
            expect(result).toBe('Warning');
        });

        test('should return Informative if all values are in range', () => {
            const result = classifyAlert(25, 50, true, defaultLimits);
            expect(result).toBe('Informative');
        });

        test('should return Warning if temperature is 1 above maxTemp', () => {
            const result = classifyAlert(31, 50, true, defaultLimits);
            expect(result).toBe('Warning');
        });
    });

    describe('resolveAlert', () => {
        const mockAlert = { type: 'Warning', status: 'pending' };

        test('should ignore alert with valid justification', () => {
            const result = resolveAlert(mockAlert, 'ignore', 'Sensor was malfunctioning.');
            expect(result.status).toBe('ignored');
            expect(result.justification).toBe('Sensor was malfunctioning.');
        });

        test('should throw error if justification is too short for ignore', () => {
            expect(() => resolveAlert(mockAlert, 'ignore', 'short'))
                .toThrow('Justification must be between 10 and 500 characters');
        });

        test('should throw error if justification is too long for ignore', () => {
            const longJustification = 'a'.repeat(501);
            expect(() => resolveAlert(mockAlert, 'ignore', longJustification))
                .toThrow('Justification must be between 10 and 500 characters');
        });

        test('should resolve alert without justification', () => {
            const result = resolveAlert(mockAlert, 'resolve', '');
            expect(result.status).toBe('resolved');
            expect(result.justification).toBeNull();
        });

        test('should throw error for invalid action', () => {
            expect(() => resolveAlert(mockAlert, 'invalid_action', ''))
                .toThrow('Invalid action. Use "resolve" or "ignore".');
        });
    });
});