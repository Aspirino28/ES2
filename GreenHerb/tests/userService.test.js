const { validateUserRole, getUserPermissions } = require('../src/services/userService');

const mockUser = (role) => ({ id: 1, role });

describe('User Service', () => {
    describe('validateUserRole', () => {
        test('should allow access for user with required role (single)', () => {
            const user = mockUser('Technical Manager');
            expect(validateUserRole(user, 'Technical Manager')).toBe(true);
        });

        test('should allow access for user with one of the required roles (array)', () => {
            const user = mockUser('Admin');
            expect(validateUserRole(user, ['Technical Manager', 'Admin'])).toBe(true);
        });

        test('should throw error for user without required role', () => {
            const user = mockUser('Technician');
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow('Unauthorized: User role "Technician" is not allowed for this action.');
        });

        test('should throw error if user is missing', () => {
            expect(() => validateUserRole(null, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('should throw error if user has no role', () => {
            const user = { id: 1 }; // No role
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow('User is required and must have a role.');
        });
    });

    describe('getUserPermissions', () => {
        test('should return correct permissions for Technician', () => {
            const permissions = getUserPermissions('Technician');
            expect(permissions.canApprovePlans).toBe(false);
            expect(permissions.canSwitchMode).toBe(false);
            expect(permissions.canTransitionBatches).toBe(false);
        });

        test('should return correct permissions for Technical Manager', () => {
            const permissions = getUserPermissions('Technical Manager');
            expect(permissions.canApprovePlans).toBe(true);
            expect(permissions.canSwitchMode).toBe(true);
            expect(permissions.canTransitionBatches).toBe(true);
        });

        test('should return correct permissions for Admin', () => {
            const permissions = getUserPermissions('Admin');
            expect(permissions.canApprovePlans).toBe(true);
            expect(permissions.canSwitchMode).toBe(true);
            expect(permissions.canTransitionBatches).toBe(true);
        });

        test('should throw error for invalid role', () => {
            expect(() => getUserPermissions('InvalidRole'))
                .toThrow('Invalid role: InvalidRole');
        });
    });
});