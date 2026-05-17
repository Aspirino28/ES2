/**
 * GREENHERB – userService Unit & Integration Tests
 *
 * Techniques applied (as required by the assignment):
 *   1. Equivalence Partitioning  (EP)  – sections 1 & 4
 *   2. Boundary Value Analysis   (BVA) – section 2
 *   3. Multiple Condition Coverage (MCC / MC-DC) – section 3
 *   5. Integration Tests (POST /users) – section 5
 *
 * Naming convention:
 *   TU-<section>.<sequence> — e.g. TU-1.01
 */

// --- NOVAS DEPENDÊNCIAS PARA TESTES DE INTEGRAÇÃO ---
const request = require('supertest');
const app = require('../app'); // ou '../server' se for o caso
// -------------------------------------------------

const {
    validateUserRole,
    getUserPermissions,
} = require('../src/services/userService');

// ---------------------------------------------------------------------------
// TEST HELPERS
// ---------------------------------------------------------------------------

/** Build a minimal user object */
const mockUser = (id = 1, role = 'Technician') => ({ id, role });

// ============================================================================
// 1. EQUIVALENCE PARTITIONING  (EP)
// ============================================================================
describe('User Service – 1. Equivalence Partitioning', () => {

    // --------------------------------------------------------------------------
    // 1.1  validateUserRole – valid role classes (5 tests)
    // --------------------------------------------------------------------------
    describe('1.1 validateUserRole – valid roles (EP-valid)', () => {
        test.each`
      id        | userRole               | requiredRoles                          | description
      ${'1.01'} | ${'Technician'}        | ${'Technician'}                        | ${'exact string match – Technician'}
      ${'1.02'} | ${'Technical Manager'} | ${'Technical Manager'}                 | ${'exact string match – Technical Manager'}
      ${'1.03'} | ${'Admin'}             | ${'Admin'}                             | ${'exact string match – Admin'}
      ${'1.04'} | ${'Technical Manager'} | ${['Technical Manager', 'Admin']}      | ${'role present in array'}
      ${'1.05'} | ${'Admin'}             | ${['Technical Manager', 'Admin']}      | ${'role present in array – second element'}
    `('TU-$id: $description', ({ userRole, requiredRoles }) => {
            const user = mockUser(1, userRole);
            expect(validateUserRole(user, requiredRoles)).toBe(true);
        });
    });

    // --------------------------------------------------------------------------
    // 1.2  validateUserRole – invalid role classes (3 tests)
    // --------------------------------------------------------------------------
    describe('1.2 validateUserRole – invalid roles (EP-invalid)', () => {
        test.each`
      id        | userRole               | requiredRoles                          | expectedError
      ${'1.06'} | ${'Technician'}        | ${'Technical Manager'}                 | ${'Unauthorized: User role "Technician" is not allowed for this action.'}
      ${'1.07'} | ${'Technician'}        | ${['Technical Manager', 'Admin']}      | ${'Unauthorized: User role "Technician" is not allowed for this action.'}
      ${'1.08'} | ${'Admin'}             | ${'Technician'}                        | ${'Unauthorized: User role "Admin" is not allowed for this action.'}
    `('TU-$id: should reject $userRole for $requiredRoles', ({ userRole, requiredRoles, expectedError }) => {
            const user = mockUser(1, userRole);
            expect(() => validateUserRole(user, requiredRoles)).toThrow(expectedError);
        });
    });

    // --------------------------------------------------------------------------
    // 1.3  getUserPermissions – valid roles (3 tests)
    // --------------------------------------------------------------------------
    describe('1.3 getUserPermissions – valid roles (EP-valid)', () => {
        test.each`
      id        | role                   | canApprovePlans | canSwitchMode | canTransitionBatches
      ${'1.09'} | ${'Technician'}        | ${false}        | ${false}      | ${false}
      ${'1.10'} | ${'Technical Manager'} | ${true}         | ${true}       | ${true}
      ${'1.11'} | ${'Admin'}             | ${true}         | ${true}       | ${true}
    `('TU-$id: permissions for $role', ({ role, canApprovePlans, canSwitchMode, canTransitionBatches }) => {
            const perms = getUserPermissions(role);
            expect(perms.canApprovePlans).toBe(canApprovePlans);
            expect(perms.canSwitchMode).toBe(canSwitchMode);
            expect(perms.canTransitionBatches).toBe(canTransitionBatches);
        });
    });

    // --------------------------------------------------------------------------
    // 1.4  getUserPermissions – invalid roles (4 tests)
    // --------------------------------------------------------------------------
    describe('1.4 getUserPermissions – invalid roles (EP-invalid)', () => {
        test.each`
      id        | role          | expectedError
      ${'1.12'} | ${'InvalidRole'} | ${'Invalid role: InvalidRole'}
      ${'1.13'} | ${'Guest'}       | ${'Invalid role: Guest'}
      ${'1.14'} | ${null}          | ${'Invalid role: null'}
      ${'1.15'} | ${undefined}     | ${'Invalid role: undefined'}
    `('TU-$id: should reject invalid role "$role"', ({ role, expectedError }) => {
            expect(() => getUserPermissions(role)).toThrow(expectedError);
        });
    });

    // --------------------------------------------------------------------------
    // 1.5  Admin vs Technical Manager – distinct permission classes (3 tests)
    // --------------------------------------------------------------------------
    describe('1.5 Admin has exclusive permissions over Technical Manager', () => {
        test('TU-1.16: Admin can manage users; Technical Manager cannot', () => {
            expect(getUserPermissions('Admin').canManageUsers).toBe(true);
            expect(getUserPermissions('Technical Manager').canManageUsers).toBe(false);
        });

        test('TU-1.17: Admin can import herbs; Technical Manager cannot', () => {
            expect(getUserPermissions('Admin').canImportHerbs).toBe(true);
            expect(getUserPermissions('Technical Manager').canImportHerbs).toBe(false);
        });

        test('TU-1.18: Technician cannot view audit log', () => {
            expect(getUserPermissions('Technician').canViewAudit).toBe(false);
        });
    });
});

// ============================================================================
// 2. BOUNDARY VALUE ANALYSIS  (BVA)
// ============================================================================
describe('User Service – 2. Boundary Value Analysis', () => {

    // --------------------------------------------------------------------------
    // 2.1  user.id boundaries (7 tests)
    // --------------------------------------------------------------------------
    describe('2.1 Boundary values for user.id', () => {
        test.each`
      id          | description               | shouldThrow
      ${0}        | ${'ID = 0 (below min)'}   | ${false}
      ${1}        | ${'ID = 1 (min valid)'}   | ${false}
      ${999999}   | ${'ID = 999 999'}         | ${false}
      ${1000000}  | ${'ID = 1 000 000'}       | ${false}
      ${-1}       | ${'ID = -1 (negative)'}   | ${false}
      ${null}     | ${'ID = null'}            | ${true}
      ${undefined}| ${'ID = undefined'}       | ${true}
    `('TU-2.$#: $description', ({ id, shouldThrow }) => {
            const user = { id, role: id === null || id === undefined ? undefined : 'Admin' };
            if (shouldThrow) {
                expect(() => validateUserRole(user, 'Admin')).toThrow('User is required and must have a role.');
            } else {
                expect(validateUserRole(user, 'Admin')).toBe(true);
            }
        });
    });

    // --------------------------------------------------------------------------
    // 2.2  user.role string length boundaries (6 tests)
    // --------------------------------------------------------------------------
    describe('2.2 Boundary values for user.role', () => {
        test('TU-2.08: empty string role → guard throws', () => {
            const user = mockUser(1, '');
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-2.09: whitespace-only role → guard throws', () => {
            const user = mockUser(1, ' ');
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-2.10: single-character role → Unauthorized (not guard error)', () => {
            const user = mockUser(1, 'A');
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow(/Unauthorized/);
        });

        test('TU-2.11: minimum valid role "Technician" (10 chars) → passes', () => {
            const user = mockUser(1, 'Technician');
            expect(validateUserRole(user, 'Technician')).toBe(true);
        });

        test('TU-2.12: unrecognised long role "Administrator" → Unauthorized', () => {
            const user = mockUser(1, 'Administrator');
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow(/Unauthorized/);
        });

        test('TU-2.13: role string of 100 characters → Unauthorized', () => {
            const user = mockUser(1, 'A'.repeat(100));
            expect(() => validateUserRole(user, 'Admin'))
                .toThrow(/Unauthorized/);
        });
    });

    // --------------------------------------------------------------------------
    // 2.3  requiredRoles array size boundaries (3 tests)
    // --------------------------------------------------------------------------
    describe('2.3 Boundary values for requiredRoles array', () => {
        test('TU-2.14: empty requiredRoles array → Unauthorized', () => {
            const user = mockUser(1, 'Admin');
            expect(() => validateUserRole(user, []))
                .toThrow(/Unauthorized/);
        });

        test('TU-2.15: single-element array containing the role → passes', () => {
            const user = mockUser(1, 'Admin');
            expect(validateUserRole(user, ['Admin'])).toBe(true);
        });

        test('TU-2.16: all three roles in array, user has first → passes', () => {
            const user = mockUser(1, 'Technician');
            expect(validateUserRole(user, ['Technician', 'Technical Manager', 'Admin'])).toBe(true);
        });
    });
});

// ============================================================================
// 3. MULTIPLE CONDITION COVERAGE  (MCC / MC-DC)
// ============================================================================
describe('User Service – 3. Multiple Condition Coverage (MCC / MC-DC)', () => {

    describe('3.1 Full MCC truth table – validateUserRole (8 rows)', () => {
        test('TU-3.01 [Row 1] C1=F C2=F C3=F → guard error', () => {
            expect(() => validateUserRole(null, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.02 [Row 2] C1=F, C2=n/a, C3=n/a → guard error (null user)', () => {
            expect(() => validateUserRole(null, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.03 [Row 3] C1=F → guard error (undefined user)', () => {
            expect(() => validateUserRole(undefined, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.04 [Row 4 / MC/DC-C1 low] C1=F, C2=T, C3=T → guard error', () => {
            expect(() => validateUserRole('Admin', 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.05 [Row 5] C1=T C2=F C3=F → guard error (empty role)', () => {
            expect(() => validateUserRole({ id: 1, role: '' }, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.06 [Row 6 / MC/DC-C2 low] C1=T C2=F C3=T → guard error (whitespace role)', () => {
            expect(() => validateUserRole({ id: 1, role: '   ' }, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.07 [Row 7 / MC/DC-C3 low] C1=T C2=T C3=F → Unauthorized', () => {
            expect(() => validateUserRole({ id: 1, role: 'Technician' }, 'Admin'))
                .toThrow('Unauthorized: User role "Technician" is not allowed for this action.');
        });

        test('TU-3.08 [Row 8 / MC/DC anchor] C1=T C2=T C3=T → true', () => {
            expect(validateUserRole({ id: 1, role: 'Admin' }, 'Admin')).toBe(true);
        });
    });

    describe('3.2 MC/DC minimal set (4 tests)', () => {
        test('TU-3.09 MC/DC-C1 (C1 flips; C2=T,C3=T): non-object user → guard error', () => {
            expect(() => validateUserRole('Admin', 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.10 MC/DC-C2 (C2 flips; C1=T,C3=T): whitespace role → guard error', () => {
            expect(() => validateUserRole({ id: 1, role: ' ' }, 'Admin'))
                .toThrow('User is required and must have a role.');
        });

        test('TU-3.11 MC/DC-C3 (C3 flips; C1=T,C2=T): wrong role → Unauthorized', () => {
            expect(() => validateUserRole({ id: 99, role: 'Technician' }, 'Admin'))
                .toThrow(/Unauthorized/);
        });

        test('TU-3.12 MC/DC-anchor (C1=T,C2=T,C3=T): correct role → true', () => {
            expect(validateUserRole({ id: 1, role: 'Technical Manager' }, 'Technical Manager'))
                .toBe(true);
        });
    });

    describe('3.3 MCC – requiredRoles type × role match', () => {
        test('TU-3.13 D1=F D2=F (string required, wrong role) → Unauthorized', () => {
            expect(() => validateUserRole({ id: 1, role: 'Technician' }, 'Admin'))
                .toThrow(/Unauthorized/);
        });

        test('TU-3.14 D1=F D2=T (string required, correct role) → true', () => {
            expect(validateUserRole({ id: 1, role: 'Admin' }, 'Admin')).toBe(true);
        });

        test('TU-3.15 D1=T D2=F (array required, role absent) → Unauthorized', () => {
            expect(() =>
                validateUserRole({ id: 1, role: 'Technician' }, ['Technical Manager', 'Admin'])
            ).toThrow(/Unauthorized/);
        });

        test('TU-3.16 D1=T D2=T (array required, role present) → true', () => {
            expect(
                validateUserRole({ id: 1, role: 'Admin' }, ['Technical Manager', 'Admin'])
            ).toBe(true);
        });
    });
});

describe('User Service – 4. Full Permission Matrix (EP extended)', () => {
    test('TU-4.01: Technician has no elevated permissions', () => {
        const p = getUserPermissions('Technician');
        expect(p.canApprovePlans).toBe(false);
        expect(p.canSwitchMode).toBe(false);
        expect(p.canTransitionBatches).toBe(false);
        expect(p.canManageUsers).toBe(false);
        expect(p.canViewAudit).toBe(false);
        expect(p.canImportHerbs).toBe(false);
        expect(p.canExportReports).toBe(false);
    });

    test('TU-4.02: Technical Manager has operational but not administrative permissions', () => {
        const p = getUserPermissions('Technical Manager');
        expect(p.canApprovePlans).toBe(true);
        expect(p.canSwitchMode).toBe(true);
        expect(p.canTransitionBatches).toBe(true);
        expect(p.canManageUsers).toBe(false);
        expect(p.canImportHerbs).toBe(false);
        expect(p.canViewAudit).toBe(true);
        expect(p.canExportReports).toBe(true);
    });

    test('TU-4.03: Admin has all permissions', () => {
        const p = getUserPermissions('Admin');
        expect(p.canApprovePlans).toBe(true);
        expect(p.canSwitchMode).toBe(true);
        expect(p.canTransitionBatches).toBe(true);
        expect(p.canManageUsers).toBe(true);
        expect(p.canViewAudit).toBe(true);
        expect(p.canImportHerbs).toBe(true);
        expect(p.canExportReports).toBe(true);
    });

    test('TU-4.04: getUserPermissions returns a copy, not the original object', () => {
        const p1 = getUserPermissions('Admin');
        p1.canManageUsers = false;
        const p2 = getUserPermissions('Admin');
        expect(p2.canManageUsers).toBe(true);
    });
});

// ============================================================================
// 5. INTEGRAÇÃO: POST /users (NOVOS TESTES)
// ============================================================================
describe('User Service – 5. Integration Tests (POST /users)', () => {
    // Helper para gerar dados de utilizador válidos
    const validUserTemplate = (overrides = {}) => ({
        name: 'Test User',
        email: 'test@example.com',
        role: 'Technician',
        password: 'SecurePass123!',
        ...overrides,
    });

    // --------------------------------------------------------------------------
    // 5.1: Criação de utilizadores válidos (EP-valid)
    // --------------------------------------------------------------------------
    describe('5.1 POST /users – valid user creation (EP-valid)', () => {
        test.each`
            id        | userData                                      | description
            ${'5.01'} | ${{ ...validUserTemplate(), role: 'Technician' }} | ${'Technician user'}
            ${'5.02'} | ${{ ...validUserTemplate(), role: 'Technical Manager' }} | ${'Technical Manager user'}
            ${'5.03'} | ${{ ...validUserTemplate(), role: 'Admin' }} | ${'Admin user'}
        `('TU-$id: $description', async ({ userData }) => {
            const response = await request(app)
                .post('/users')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(userData.name);
            expect(response.body.email).toBe(userData.email);
            expect(response.body.role).toBe(userData.role);
        });
    });

    // --------------------------------------------------------------------------
    // 5.2: Criação de utilizadores inválidos (EP-invalid)
    // --------------------------------------------------------------------------
    describe('5.2 POST /users – invalid user creation (EP-invalid)', () => {
        test.each`
            id        | userData                                      | expectedStatus | description
            ${'5.04'} | ${{ name: 'No Email', role: 'Technician', password: 'SecurePass123!' }} | ${400} | ${'Missing email'}
            ${'5.05'} | ${{ email: 'no@name.com', role: 'Technician', password: 'SecurePass123!' }} | ${400} | ${'Missing name'}
            ${'5.06'} | ${{ name: 'No Role', email: 'norole@example.com', password: 'SecurePass123!' }} | ${400} | ${'Missing role'}
            ${'5.07'} | ${{ ...validUserTemplate(), role: 'Guest' }} | ${400} | ${'Invalid role'}
            ${'5.08'} | ${{ ...validUserTemplate(), password: '123' }} | ${400} | ${'Weak password'}
        `('TU-$id: $description', async ({ userData, expectedStatus }) => {
            await request(app)
                .post('/users')
                .send(userData)
                .expect(expectedStatus);
        });
    });

    // --------------------------------------------------------------------------
    // 5.3: Valores limite (BVA)
    // --------------------------------------------------------------------------
    describe('5.3 POST /users – boundary values (BVA)', () => {
        test('TU-5.09: empty name → 400 Bad Request', async () => {
            const userData = { ...validUserTemplate(), name: '' };
            await request(app)
                .post('/users')
                .send(userData)
                .expect(400);
        });

        test('TU-5.10: name with 100 characters → 201 Created', async () => {
            const userData = { ...validUserTemplate(), name: 'A'.repeat(100) };
            const response = await request(app)
                .post('/users')
                .send(userData)
                .expect(201);
            expect(response.body.name).toHaveLength(100);
        });

        test('TU-5.11: email without @ → 400 Bad Request', async () => {
            const userData = { ...validUserTemplate(), email: 'noatsign.com' };
            await request(app)
                .post('/users')
                .send(userData)
                .expect(400);
        });

        test('TU-5.12: password with 7 characters (min) → 201 Created', async () => {
            const userData = { ...validUserTemplate(), password: 'Pass123' };
            await request(app)
                .post('/users')
                .send(userData)
                .expect(201);
        });

        test('TU-5.13: password with 6 characters (below min) → 400 Bad Request', async () => {
            const userData = { ...validUserTemplate(), password: 'Pass12' };
            await request(app)
                .post('/users')
                .send(userData)
                .expect(400);
        });
    });
});