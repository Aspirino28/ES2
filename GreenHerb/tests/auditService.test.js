const { logAction, isAuditable, auditLogs } = require('../src/services/auditService');

const mockUser = (id, role) => ({ id, role });

describe('Audit Service', () => {
    // Reset auditLogs before each test
    beforeEach(() => {
        auditLogs.length = 0;
    });

    describe('logAction', () => {
        test('should log action with user and timestamp', () => {
            const user = mockUser(1, 'Technical Manager');
            const result = logAction(user, 'created_plan');

            // Verify the returned log entry
            expect(result.userId).toBe(1);
            expect(result.userRole).toBe('Technical Manager');
            expect(result.action).toBe('created_plan');
            expect(result.timestamp).toBeDefined();

            // Verify the log was added to auditLogs
            expect(auditLogs.length).toBe(1);
            expect(auditLogs[0].userId).toBe(1);
        });
    });
});