/**
 * GREENHERB – batchService Unit & Integration Tests
 *
 * Techniques applied:
 *   1. Equivalence Partitioning  (EP)     – section 1
 *   2. Boundary Value Analysis   (BVA)    – section 2
 *   3. Multiple Condition Coverage (MCC / MC-DC) – section 3
 *   5. Integration Tests (POST /batches, PATCH /batches/:id) – section 5
 *
 * ID convention: TU-B-<section>.<sequence>
 *
 * Function under test: transitionBatch(batch, user, targetState, justification)
 *
 * Atomic conditions:
 *   C1 : user.role ∈ { 'Technical Manager', 'Admin' }
 *   C2 : batch.state === 'active'
 *   C3 : targetState ∈ { 'completed', 'compromised' }
 *   C4 : batch.losses === 0  OR  justification is non-empty
 */

// --- NOVAS DEPENDÊNCIAS PARA TESTES DE INTEGRAÇÃO ---
const request = require('supertest');
const app = require('../app'); // ou '../server' se for o caso
// -------------------------------------------------

const { transitionBatch } = require('../src/services/batchService');

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const mockBatch = (state = 'active', losses = 0) => ({ state, losses });
const mockUser = (role = 'Technical Manager') => ({ role });

// ============================================================================
// 0. ORIGINAL TESTS (from provided file – preserved verbatim)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

// ============================================================================
// 1. EQUIVALENCE PARTITIONING  (EP)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

// ============================================================================
// 2. BOUNDARY VALUE ANALYSIS  (BVA)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

// ============================================================================
// 3. MULTIPLE CONDITION COVERAGE  (MCC / MC-DC)
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

// ============================================================================
// 4. RETURN VALUE & IMMUTABILITY
// ============================================================================
// ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

// ============================================================================
// 5. INTEGRAÇÃO: POST /batches e PATCH /batches/:id (NOVOS TESTES)
// ============================================================================
describe('Batch Service – 5. Integration Tests', () => {
    // Helper para gerar dados de lote válidos
    const validBatch = (overrides = {}) => ({
        state: 'active',
        divisions: 1,
        losses: 0,
        productivity: 100,
        herbId: 1,
        startDate: new Date().toISOString(),
        ...overrides,
    });

    // --------------------------------------------------------------------------
    // 5.1: Criação de lotes válidos (POST /batches)
    // --------------------------------------------------------------------------
    describe('5.1 POST /batches – valid batch creation (EP-valid)', () => {
        test.each`
            id        | batchData                                      | description
            ${'5.01'} | ${{ ...validBatch() }}                        | ${'Default batch'}
            ${'5.02'} | ${{ ...validBatch(), divisions: 5 }}           | ${'Batch with 5 divisions'}
            ${'5.03'} | ${{ ...validBatch(), productivity: 80 }}       | ${'Batch with 80% productivity'}
            ${'5.04'} | ${{ ...validBatch(), herbId: 2 }}               | ${'Batch with herbId 2'}
        `('TU-B-$id: $description', async ({ batchData }) => {
            const response = await request(app)
                .post('/batches')
                .send(batchData)
                .expect(201); // Espera status 201 (Created)

            expect(response.body).toHaveProperty('id');
            expect(response.body.state).toBe(batchData.state);
            expect(response.body.divisions).toBe(batchData.divisions);
            expect(response.body.herbId).toBe(batchData.herbId);
        });
    });

    // --------------------------------------------------------------------------
    // 5.2: Criação de lotes inválidos (EP-invalid)
    // --------------------------------------------------------------------------
    describe('5.2 POST /batches – invalid batch creation (EP-invalid)', () => {
        test.each`
            id        | batchData                                      | expectedStatus | description
            ${'5.05'} | ${{ divisions: 1, productivity: 100 }}         | ${400} | ${'Missing state'}
            ${'5.06'} | ${{ state: 'active', productivity: 100 }}     | ${400} | ${'Missing divisions'}
            ${'5.07'} | ${{ state: 'active', divisions: 1 }}          | ${400} | ${'Missing productivity'}
            ${'5.08'} | ${{ ...validBatch(), state: 'invalid_state' }} | ${400} | ${'Invalid state'}
            ${'5.09'} | ${{ ...validBatch(), divisions: -1 }}         | ${400} | ${'Negative divisions'}
            ${'5.10'} | ${{ ...validBatch(), productivity: -1 }}      | ${400} | ${'Negative productivity'}
            ${'5.11'} | ${{ ...validBatch(), productivity: 101 }}      | ${400} | ${'Productivity > 100'}
        `('TU-B-$id: $description', async ({ batchData, expectedStatus }) => {
            await request(app)
                .post('/batches')
                .send(batchData)
                .expect(expectedStatus);
        });
    });

    // --------------------------------------------------------------------------
    // 5.3: Valores limite (BVA)
    // --------------------------------------------------------------------------
    describe('5.3 POST /batches – boundary values (BVA)', () => {
        test('TU-B-5.12: divisions = 0 → 400 Bad Request', async () => {
            const batchData = { ...validBatch(), divisions: 0 };
            await request(app)
                .post('/batches')
                .send(batchData)
                .expect(400);
        });

        test('TU-B-5.13: divisions = 1 (min) → 201 Created', async () => {
            const batchData = { ...validBatch(), divisions: 1 };
            const response = await request(app)
                .post('/batches')
                .send(batchData)
                .expect(201);
            expect(response.body.divisions).toBe(1);
        });

        test('TU-B-5.14: divisions = 100 (max) → 201 Created', async () => {
            const batchData = { ...validBatch(), divisions: 100 };
            const response = await request(app)
                .post('/batches')
                .send(batchData)
                .expect(201);
            expect(response.body.divisions).toBe(100);
        });

        test('TU-B-5.15: productivity = 0 (min) → 201 Created', async () => {
            const batchData = { ...validBatch(), productivity: 0 };
            const response = await request(app)
                .post('/batches')
                .send(batchData)
                .expect(201);
            expect(response.body.productivity).toBe(0);
        });

        test('TU-B-5.16: productivity = 100 (max) → 201 Created', async () => {
            const batchData = { ...validBatch(), productivity: 100 };
            const response = await request(app)
                .post('/batches')
                .send(batchData)
                .expect(201);
            expect(response.body.productivity).toBe(100);
        });

        test('TU-B-5.17: losses = 0 (min) → 201 Created', async () => {
            const batchData = { ...validBatch(), losses: 0 };
            const response = await request(app)
                .post('/batches')
                .send(batchData)
                .expect(201);
            expect(response.body.losses).toBe(0);
        });
    });

    // --------------------------------------------------------------------------
    // 5.4: Transição de estado (PATCH /batches/:id/transition)
    // --------------------------------------------------------------------------
    describe('5.4 PATCH /batches/:id/transition – transition batch state', () => {
        let createdBatchId; // Para armazenar o ID do lote criado

        beforeAll(async () => {
            // Cria um lote ativo para ser usado nos testes de transição
            const response = await request(app)
                .post('/batches')
                .send(validBatch());
            createdBatchId = response.body.id;
        });

        test('TU-B-5.18: transition to "completed" with no losses → 200 OK', async () => {
            const transitionData = {
                targetState: 'completed',
                justification: '',
            };
            const response = await request(app)
                .patch(`/batches/${createdBatchId}/transition`)
                .send(transitionData)
                .expect(200);

            expect(response.body.state).toBe('completed');
        });

        test('TU-B-5.19: transition to "compromised" with losses and justification → 200 OK', async () => {
            // Cria um novo lote com perdas
            const batchWithLosses = await request(app)
                .post('/batches')
                .send({ ...validBatch(), losses: 10 });
            const batchIdWithLosses = batchWithLosses.body.id;

            const transitionData = {
                targetState: 'compromised',
                justification: 'Pest infestation detected.',
            };
            const response = await request(app)
                .patch(`/batches/${batchIdWithLosses}/transition`)
                .send(transitionData)
                .expect(200);

            expect(response.body.state).toBe('compromised');
            expect(response.body.justification).toBe('Pest infestation detected.');
        });

        test('TU-B-5.20: transition to "completed" with losses and no justification → 400 Bad Request', async () => {
            // Cria um novo lote com perdas
            const batchWithLosses = await request(app)
                .post('/batches')
                .send({ ...validBatch(), losses: 5 });
            const batchIdWithLosses = batchWithLosses.body.id;

            const transitionData = {
                targetState: 'completed',
                justification: '',
            };
            await request(app)
                .patch(`/batches/${batchIdWithLosses}/transition`)
                .send(transitionData)
                .expect(400);
        });

        test('TU-B-5.21: transition with invalid targetState → 400 Bad Request', async () => {
            const transitionData = {
                targetState: 'invalid_state',
                justification: '',
            };
            await request(app)
                .patch(`/batches/${createdBatchId}/transition`)
                .send(transitionData)
                .expect(400);
        });

        test('TU-B-5.22: transition by unauthorized user (Technician) → 403 Forbidden', async () => {
            const transitionData = {
                targetState: 'completed',
                justification: '',
                userRole: 'Technician', // Simula um utilizador não autorizado
            };
            await request(app)
                .patch(`/batches/${createdBatchId}/transition`)
                .send(transitionData)
                .expect(403);
        });

        test('TU-B-5.23: transition from non-active state → 400 Bad Request', async () => {
            // Primeiro, transiciona o lote para "completed"
            await request(app)
                .patch(`/batches/${createdBatchId}/transition`)
                .send({ targetState: 'completed', justification: '' });

            // Tenta transicionar novamente
            const transitionData = {
                targetState: 'compromised',
                justification: 'Should fail',
            };
            await request(app)
                .patch(`/batches/${createdBatchId}/transition`)
                .send(transitionData)
                .expect(400);
        });
    });

    // --------------------------------------------------------------------------
    // 5.5: Listagem de lotes (GET /batches)
    // --------------------------------------------------------------------------
    describe('5.5 GET /batches – list batches with filters', () => {
        beforeAll(async () => {
            // Cria lotes com diferentes estados para testar filtros
            await request(app).post('/batches').send({ ...validBatch(), state: 'active' });
            await request(app).post('/batches').send({ ...validBatch(), state: 'active' });
            await request(app).post('/batches').send({ ...validBatch(), state: 'completed' });
        });

        test('TU-B-5.24: get all batches → 200 OK', async () => {
            const response = await request(app)
                .get('/batches')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('TU-B-5.25: filter by state (active) → 200 OK', async () => {
            const response = await request(app)
                .get('/batches?state=active')
                .expect(200);
            expect(response.body.every(batch => batch.state === 'active')).toBe(true);
        });

        test('TU-B-5.26: filter by herbId → 200 OK', async () => {
            const response = await request(app)
                .get('/batches?herbId=1')
                .expect(200);
            expect(response.body.every(batch => batch.herbId === 1)).toBe(true);
        });
    });
});