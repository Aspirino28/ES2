const { transitionBatch } = require('../src/services/batchService');

const mockBatch = (state, losses) => ({ state, losses });
const mockUser = (role) => ({ role });

describe('Batch State Transitions', () => {
    test('should transition from active to completed with no losses', () => {
        const batch = mockBatch('active', 0);
        const user = mockUser('Technical Manager');
        const result = transitionBatch(batch, user, 'completed', '');
        expect(result.state).toBe('completed');
    });

    test('should reject transition to completed if losses exist without justification', () => {
        const batch = mockBatch('active', 5);
        const user = mockUser('Technical Manager');
        expect(() => transitionBatch(batch, user, 'completed', ''))
            .toThrow('Justification required for losses');
    });

    test('should transition to compromised with losses and justification', () => {
        const batch = mockBatch('active', 10);
        const user = mockUser('Admin');
        const result = transitionBatch(batch, user, 'compromised', 'Sensor failure');
        expect(result.state).toBe('compromised');
    });

    test('should reject transition if user is not Technical Manager or Admin', () => {
        const batch = mockBatch('active', 0);
        const user = mockUser('Technician');
        expect(() => transitionBatch(batch, user, 'completed', ''))
            .toThrow('Unauthorized');
    });
});