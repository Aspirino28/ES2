/**
 * ============================================================
 * GREENHERB — Alert Service — Plano de Testes Completo
 * ============================================================
 *
 * Técnicas aplicadas:
 *  - Particionamento de Equivalência (PE)
 *  - Análise de Valores Limite (AVL)
 *  - Cobertura de Condições Múltiplas (MCC)
 *  - Cobertura MC/DC (Modified Condition / Decision Coverage)
 *  - Testes de Caminho (Path Coverage)
 *  - Testes de Mutação (conceito aplicado nos casos de fronteira exata)
 *  - Testes de Integração (POST /alerts) – secção 5
 *
 * Referências de rastreabilidade:
 *  TU-AL-01..N → classifyAlert
 *  TU-RA-01..N → resolveAlert
 *  TU-INT-01..N → Integration Tests (POST /alerts)
 * ============================================================
 */

// --- NOVAS DEPENDÊNCIAS PARA TESTES DE INTEGRAÇÃO ---
const request = require('supertest');
const app = require('../src/app'); // ou '../server' se for o caso
// -------------------------------------------------

const { classifyAlert, resolveAlert } = require('../src/services/alertService');

// ─── Limites padrão usados nos planos regulares ───────────────────────────────
const defaultLimits = {
    maxTemp:     30,
    minTemp:     18,
    maxHumidity: 80,
    minHumidity: 40,
};

// ─── Limites alternativos para testar independência de parâmetros ─────────────
const tightLimits = {
    maxTemp:     25,
    minTemp:     20,
    maxHumidity: 60,
    minHumidity: 50,
};

const wideLimits = {
    maxTemp:     50,
    minTemp:     0,
    maxHumidity: 100,
    minHumidity: 0,
};

// =============================================================================
// SUITE PRINCIPAL
// =============================================================================

describe('Alert Service — Testes Completos (GREENHERB)', () => {

    // =========================================================================
    // classifyAlert
    // =========================================================================
    // ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

    // =========================================================================
    // resolveAlert
    // =========================================================================
    // ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)
});

// =============================================================================
// RESUMO DA MATRIZ DE RASTREABILIDADE
// =============================================================================
// ... (TODO O CÓDIGO EXISTENTE MANTÉM-SE INALTERADO)

// ============================================================================
// 5. INTEGRAÇÃO: POST /alerts (NOVOS TESTES)
// ============================================================================
describe('Alert Service – 5. Integration Tests (POST /alerts)', () => {
    // Helper para gerar dados de alerta válidos
    const validAlert = (overrides = {}) => ({
        type: 'Warning',
        message: 'Temperature is slightly above the recommended range.',
        status: 'pending',
        sensorId: 1,
        timestamp: new Date().toISOString(),
        ...overrides,
    });

    // --------------------------------------------------------------------------
    // 5.1: Criação de alertas válidos (EP-valid)
    // --------------------------------------------------------------------------
    describe('5.1 POST /alerts – valid alert creation (EP-valid)', () => {
        test.each`
            id        | alertData                                      | description
            ${'INT-01'} | ${{ ...validAlert(), type: 'Informative' }} | ${'Informative alert'}
            ${'INT-02'} | ${{ ...validAlert(), type: 'Warning' }} | ${'Warning alert'}
            ${'INT-03'} | ${{ ...validAlert(), type: 'Critical' }} | ${'Critical alert'}
            ${'INT-04'} | ${{ ...validAlert(), message: 'Humidity is too low.' }} | ${'Custom message'}
            ${'INT-05'} | ${{ ...validAlert(), sensorId: 2 }} | ${'Different sensor'}
        `('TU-INT-$id: $description', async ({ alertData }) => {
            const response = await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(201); // Espera status 201 (Created)

            expect(response.body).toHaveProperty('id');
            expect(response.body.type).toBe(alertData.type);
            expect(response.body.message).toBe(alertData.message);
            expect(response.body.status).toBe('pending');
            expect(response.body.timestamp).toBeDefined();
        });
    });

    // --------------------------------------------------------------------------
    // 5.2: Criação de alertas inválidos (EP-invalid)
    // --------------------------------------------------------------------------
    describe('5.2 POST /alerts – invalid alert creation (EP-invalid)', () => {
        test.each`
            id        | alertData                                      | expectedStatus | description
            ${'INT-06'} | ${{ message: 'No type', status: 'pending' }} | ${400} | ${'Missing type'}
            ${'INT-07'} | ${{ type: 'Warning', status: 'pending' }} | ${400} | ${'Missing message'}
            ${'INT-08'} | ${{ type: 'InvalidType', message: 'Test' }} | ${400} | ${'Invalid type'}
            ${'INT-09'} | ${{ ...validAlert(), type: '' }} | ${400} | ${'Empty type'}
            ${'INT-10'} | ${{ ...validAlert(), message: '' }} | ${400} | ${'Empty message'}
            ${'INT-11'} | ${{ ...validAlert(), status: 'invalid_status' }} | ${400} | ${'Invalid status'}
        `('TU-INT-$id: $description', async ({ alertData, expectedStatus }) => {
            await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(expectedStatus);
        });
    });

    // --------------------------------------------------------------------------
    // 5.3: Valores limite (BVA)
    // --------------------------------------------------------------------------
    describe('5.3 POST /alerts – boundary values (BVA)', () => {
        test('TU-INT-12: message with 1 character → 400 Bad Request', async () => {
            const alertData = { ...validAlert(), message: 'x' };
            await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(400);
        });

        test('TU-INT-13: message with 10 characters (min) → 201 Created', async () => {
            const alertData = { ...validAlert(), message: 'a'.repeat(10) };
            const response = await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(201);
            expect(response.body.message).toHaveLength(10);
        });

        test('TU-INT-14: message with 500 characters (max) → 201 Created', async () => {
            const alertData = { ...validAlert(), message: 'a'.repeat(500) };
            const response = await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(201);
            expect(response.body.message).toHaveLength(500);
        });

        test('TU-INT-15: message with 501 characters → 400 Bad Request', async () => {
            const alertData = { ...validAlert(), message: 'a'.repeat(501) };
            await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(400);
        });

        test('TU-INT-16: sensorId = 0 → 201 Created', async () => {
            const alertData = { ...validAlert(), sensorId: 0 };
            const response = await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(201);
            expect(response.body.sensorId).toBe(0);
        });

        test('TU-INT-17: sensorId = Number.MAX_SAFE_INTEGER → 201 Created', async () => {
            const alertData = { ...validAlert(), sensorId: Number.MAX_SAFE_INTEGER };
            const response = await request(app)
                .post('/alerts')
                .send(alertData)
                .expect(201);
            expect(response.body.sensorId).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    // --------------------------------------------------------------------------
    // 5.4: Resolução de alertas (PATCH /alerts/:id)
    // --------------------------------------------------------------------------
    describe('5.4 PATCH /alerts/:id – resolve or ignore alert', () => {
        let createdAlertId; // Para armazenar o ID do alerta criado

        beforeAll(async () => {
            // Cria um alerta para ser usado nos testes de resolução
            const response = await request(app)
                .post('/alerts')
                .send(validAlert());
            createdAlertId = response.body.id;
        });

        test('TU-INT-18: resolve alert with justification → 200 OK', async () => {
            const updateData = {
                action: 'resolve',
                justification: 'Issue was fixed by adjusting the thermostat.',
            };
            const response = await request(app)
                .patch(`/alerts/${createdAlertId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.status).toBe('resolved');
            expect(response.body.justification).toBe(updateData.justification);
        });

        test('TU-INT-19: ignore alert with valid justification → 200 OK', async () => {
            const newAlert = await request(app)
                .post('/alerts')
                .send(validAlert());
            const newAlertId = newAlert.body.id;

            const updateData = {
                action: 'ignore',
                justification: 'This alert was triggered by a temporary sensor glitch.',
            };
            const response = await request(app)
                .patch(`/alerts/${newAlertId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.status).toBe('ignored');
            expect(response.body.justification).toBe(updateData.justification);
        });

        test('TU-INT-20: ignore alert with short justification → 400 Bad Request', async () => {
            const newAlert = await request(app)
                .post('/alerts')
                .send(validAlert());
            const newAlertId = newAlert.body.id;

            const updateData = {
                action: 'ignore',
                justification: 'Short', // Menos de 10 caracteres
            };
            await request(app)
                .patch(`/alerts/${newAlertId}`)
                .send(updateData)
                .expect(400);
        });

        test('TU-INT-21: invalid action → 400 Bad Request', async () => {
            const newAlert = await request(app)
                .post('/alerts')
                .send(validAlert());
            const newAlertId = newAlert.body.id;

            const updateData = {
                action: 'dismiss', // Ação inválida
                justification: 'This should fail.',
            };
            await request(app)
                .patch(`/alerts/${newAlertId}`)
                .send(updateData)
                .expect(400);
        });

        test('TU-INT-22: resolve alert without justification → 200 OK', async () => {
            const newAlert = await request(app)
                .post('/alerts')
                .send(validAlert());
            const newAlertId = newAlert.body.id;

            const updateData = {
                action: 'resolve',
            };
            const response = await request(app)
                .patch(`/alerts/${newAlertId}`)
                .send(updateData)
                .expect(200);

            expect(response.body.status).toBe('resolved');
            expect(response.body.justification).toBeNull();
        });
    });

    // --------------------------------------------------------------------------
    // 5.5: Listagem de alertas (GET /alerts)
    // --------------------------------------------------------------------------
    describe('5.5 GET /alerts – list alerts with filters', () => {
        beforeAll(async () => {
            // Cria alertas de diferentes tipos para testar filtros
            await request(app).post('/alerts').send({ ...validAlert(), type: 'Informative' });
            await request(app).post('/alerts').send({ ...validAlert(), type: 'Warning' });
            await request(app).post('/alerts').send({ ...validAlert(), type: 'Critical' });
        });

        test('TU-INT-23: get all alerts → 200 OK', async () => {
            const response = await request(app)
                .get('/alerts')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('TU-INT-24: filter by type (Warning) → 200 OK', async () => {
            const response = await request(app)
                .get('/alerts?type=Warning')
                .expect(200);
            expect(response.body.every(alert => alert.type === 'Warning')).toBe(true);
        });

        test('TU-INT-25: filter by status (pending) → 200 OK', async () => {
            const response = await request(app)
                .get('/alerts?status=pending')
                .expect(200);
            expect(response.body.every(alert => alert.status === 'pending')).toBe(true);
        });

        test('TU-INT-26: filter by sensorId → 200 OK', async () => {
            const response = await request(app)
                .get('/alerts?sensorId=1')
                .expect(200);
            expect(response.body.every(alert => alert.sensorId === 1)).toBe(true);
        });
    });
});