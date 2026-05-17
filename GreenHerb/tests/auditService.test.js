/**
 * GREENHERB – auditService Unit & Integration Tests
 *
 * Techniques applied:
 *   1. Equivalence Partitioning  (EP)           – section 1
 *   2. Boundary Value Analysis   (BVA)           – section 2
 *   3. Multiple Condition Coverage (MCC / MC-DC) – section 3
 *   5. Integration Tests (POST /audit)         – section 5
 *
 * ID convention: TU-A-<section>.<sequence>
 *
 * Functions under test:
 *   logAction(user, action, meta?)  – records an entry; throws on invalid input
 *   isAuditable(action)             – returns boolean; never throws
 *   getAuditLogs(filters?)          – returns filtered snapshot of the log store
 *
 * Atomic conditions for logAction (MCC):
 *   C1 : user is a non-null object with a defined id and a non-empty role
 *   C2 : action is a non-empty string
 *   C3 : action is contained in AUDITABLE_ACTIONS
 */

// --- NOVAS DEPENDÊNCIAS PARA TESTES DE INTEGRAÇÃO ---
const request = require('supertest');
const app = require('../app'); // ou '../server' se for o caso
// -------------------------------------------------

const {
    logAction,
    isAuditable,
    getAuditLogs,
    auditLogs,
    AUDITABLE_ACTIONS,
} = require('../src/services/auditService');

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const mockUser = (id = 1, role = 'Technical Manager') => ({ id, role });
const validAction = 'created_plan';   // always auditable
const readAction = 'get_plans';      // never auditable

// Reset the in-memory store before every test
beforeEach(() => { auditLogs.length = 0; });

// ============================================================================
// 0. ORIGINAL TEST (preserved verbatim)
// ============================================================================
describe('Audit Service (original suite)', () => {
    describe('logAction', () => {
        test('should log action with user and timestamp', () => {
            const user = mockUser(1, 'Technical Manager');
            const result = logAction(user, 'created_plan');

            expect(result.userId).toBe(1);
            expect(result.userRole).toBe('Technical Manager');
            expect(result.action).toBe('created_plan');
            expect(result.timestamp).toBeDefined();

            expect(auditLogs.length).toBe(1);
            expect(auditLogs[0].userId).toBe(1);
        });
    });
});

// ============================================================================
// 1. EQUIVALENCE PARTITIONING  (EP)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE DA SECÇÃO 1 MANTÉM-SE INALTERADO)

// ============================================================================
// 2. BOUNDARY VALUE ANALYSIS  (BVA)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE DA SECÇÃO 2 MANTÉM-SE INALTERADO)

// ============================================================================
// 3. MULTIPLE CONDITION COVERAGE  (MCC / MC-DC)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE DA SECÇÃO 3 MANTÉM-SE INALTERADO)

// ============================================================================
// 4. RETURN VALUE, IMMUTABILITY & TIMESTAMP
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE DA SECÇÃO 4 MANTÉM-SE INALTERADO)

// ============================================================================
// 5. INTEGRAÇÃO: POST /audit (NOVOS TESTES)
// ============================================================================
describe('Audit Service – 5. Integration Tests (POST /audit)', () => {
    // Helper para gerar dados de log válidos
    const validAuditLog = (overrides = {}) => ({
        userId: 1,
        userRole: 'Technical Manager',
        action: 'created_plan',
        meta: { planId: 1 },
        ...overrides,
    });

    // --------------------------------------------------------------------------
    // 5.1: Criação de logs de auditoria válidos (EP-valid)
    // --------------------------------------------------------------------------
    describe('5.1 POST /audit – valid audit log creation (EP-valid)', () => {
        test.each`
            id        | logData                                      | description
            ${'5.01'} | ${{ ...validAuditLog(), action: 'created_plan' }} | ${'Log for plan creation'}
            ${'5.02'} | ${{ ...validAuditLog(), action: 'updated_plan' }} | ${'Log for plan update'}
            ${'5.03'} | ${{ ...validAuditLog(), action: 'deleted_plan' }} | ${'Log for plan deletion'}
            ${'5.04'} | ${{ ...validAuditLog(), userRole: 'Admin', action: 'created_user' }} | ${'Admin log for user creation'}
            ${'5.05'} | ${{ ...validAuditLog(), meta: { batchId: 42 } }} | ${'Log with custom meta'}
        `('TU-A-$id: $description', async ({ logData }) => {
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201); // Espera status 201 (Created)

            expect(response.body).toHaveProperty('id');
            expect(response.body.userId).toBe(logData.userId);
            expect(response.body.userRole).toBe(logData.userRole);
            expect(response.body.action).toBe(logData.action);
            expect(response.body.timestamp).toBeDefined();
        });
    });

    // --------------------------------------------------------------------------
    // 5.2: Criação de logs de auditoria inválidos (EP-invalid)
    // --------------------------------------------------------------------------
    describe('5.2 POST /audit – invalid audit log creation (EP-invalid)', () => {
        test.each`
            id        | logData                                      | expectedStatus | description
            ${'5.06'} | ${{ userRole: 'Technical Manager', action: 'created_plan' }} | ${400} | ${'Missing userId'}
            ${'5.07'} | ${{ userId: 1, action: 'created_plan' }} | ${400} | ${'Missing userRole'}
            ${'5.08'} | ${{ userId: 1, userRole: 'Technical Manager' }} | ${400} | ${'Missing action'}
            ${'5.09'} | ${{ ...validAuditLog(), action: '' }} | ${400} | ${'Empty action'}
            ${'5.10'} | ${{ ...validAuditLog(), action: 'get_plans' }} | ${400} | ${'Non-auditable action'}
            ${'5.11'} | ${{ ...validAuditLog(), userId: -1 }} | ${400} | ${'Invalid userId (negative)'}
            ${'5.12'} | ${{ ...validAuditLog(), userRole: '' }} | ${400} | ${'Empty userRole'}
        `('TU-A-$id: $description', async ({ logData, expectedStatus }) => {
            await request(app)
                .post('/audit')
                .send(logData)
                .expect(expectedStatus);
        });
    });

    // --------------------------------------------------------------------------
    // 5.3: Valores limite (BVA)
    // --------------------------------------------------------------------------
    describe('5.3 POST /audit – boundary values (BVA)', () => {
        test('TU-A-5.13: userId = 0 → 201 Created', async () => {
            const logData = { ...validAuditLog(), userId: 0 };
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201);
            expect(response.body.userId).toBe(0);
        });

        test('TU-A-5.14: userId = Number.MAX_SAFE_INTEGER → 201 Created', async () => {
            const logData = { ...validAuditLog(), userId: Number.MAX_SAFE_INTEGER };
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201);
            expect(response.body.userId).toBe(Number.MAX_SAFE_INTEGER);
        });

        test('TU-A-5.15: action with 1 char (non-auditable) → 400 Bad Request', async () => {
            const logData = { ...validAuditLog(), action: 'x' };
            await request(app)
                .post('/audit')
                .send(logData)
                .expect(400);
        });

        test('TU-A-5.16: action with 12 chars (shortest auditable) → 201 Created', async () => {
            const logData = { ...validAuditLog(), action: 'deleted_plan' };
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201);
            expect(response.body.action).toBe('deleted_plan');
        });

        test('TU-A-5.17: meta with 100 keys → 201 Created', async () => {
            const meta = {};
            for (let i = 0; i < 100; i++) meta[`key${i}`] = i;
            const logData = { ...validAuditLog(), meta };
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201);
            expect(Object.keys(response.body.meta).length).toBe(100);
        });

        test('TU-A-5.18: empty meta object → 201 Created', async () => {
            const logData = { ...validAuditLog(), meta: {} };
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201);
            expect(response.body.meta).toEqual({});
        });
    });

    // --------------------------------------------------------------------------
    // 5.4: Testes de imutabilidade e timestamp
    // --------------------------------------------------------------------------
    describe('5.4 POST /audit – immutability and timestamp', () => {
        test('TU-A-5.19: timestamp is a valid ISO 8601 string', async () => {
            const logData = validAuditLog();
            const response = await request(app)
                .post('/audit')
                .send(logData)
                .expect(201);
            expect(() => new Date(response.body.timestamp)).not.toThrow();
            expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
        });

        test('TU-A-5.20: successive logs have non-decreasing timestamps', async () => {
            const logData1 = validAuditLog();
            const logData2 = { ...validAuditLog(), action: 'updated_plan' };

            const response1 = await request(app)
                .post('/audit')
                .send(logData1)
                .expect(201);

            // Pequeno delay para garantir timestamps diferentes
            await new Promise(resolve => setTimeout(resolve, 10));

            const response2 = await request(app)
                .post('/audit')
                .send(logData2)
                .expect(201);

            expect(new Date(response2.body.timestamp) >= new Date(response1.body.timestamp)).toBe(true);
        });
    });
});