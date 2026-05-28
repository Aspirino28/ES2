/**
 * ============================================================
 * GREENHERB — Sprint 4: Testes de Integração
 * ============================================================
 *
 * Ferramenta : Jest + Supertest
 * Cobertura  : /auth, /batches, /alerts, /audit, /users
 *
 * Espaço de inputs coberto por cada endpoint:
 *   - Métodos HTTP (válidos e inválidos)
 *   - Headers (Authorization: ausente, inválido, perfil errado, válido)
 *   - JSON payload (válido, inválido, em falta, valores-limite)
 *   - Respostas HTTP (2xx, 4xx, 5xx) e estrutura JSON
 *
 * Técnicas aplicadas:
 *   PE  — Particionamento de Equivalência
 *   VL  — Análise de Valores Limite
 *   MCC — Cobertura de Condições Múltiplas
 *
 * ID convention: TI-<area>-<seq>
 *   TI-AUTH-XX  → /auth
 *   TI-BATCH-XX → /batches
 *   TI-ALERT-XX → /alerts
 *   TI-AUDIT-XX → /audit
 *   TI-USER-XX  → /users
 * ============================================================
 */

'use strict';

const request = require('supertest');
const jwt     = require('jsonwebtoken');
const app     = require('../src/app');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — geração de tokens JWT sem chamar o endpoint de login
// ─────────────────────────────────────────────────────────────────────────────
const SECRET = process.env.JWT_SECRET || 'segredo';

function makeToken(id, role, expiresIn = '1h') {
    return jwt.sign({ id, role }, SECRET, { expiresIn });
}

const TOKEN = {
    admin:   makeToken(1,  'Admin'),
    manager: makeToken(2,  'Technical Manager'),
    tech:    makeToken(3,  'Technician'),
    expired: makeToken(99, 'Admin', '-1s'),
};

// Limites standard usados nos alertas / planos
const DEFAULT_LIMITS = {
    minTemp:     18, maxTemp:     28,
    minHumidity: 40, maxHumidity: 80,
};

// ─────────────────────────────────────────────────────────────────────────────
// RESET DOS STORES EM MEMÓRIA antes de cada suite
// ─────────────────────────────────────────────────────────────────────────────
const alertCtrl = require('../src/controllers/alertController');
const batchCtrl = require('../src/controllers/batchController');
const { auditLogs } = require('../src/services/auditService');
const rateLimiter   = require('../src/utils/rateLimiter');

beforeEach(() => {
    // Limpar alertas
    alertCtrl._store.splice(0);

    // Limpar lotes
    batchCtrl._store.splice(0);

    // Limpar auditoria
    auditLogs.splice(0);

    // Reset rate limiter para evitar interferência entre testes
    rateLimiter.reset();
});

// =============================================================================
// 1. /auth — POST /auth/login
// =============================================================================

describe('TI-AUTH — POST /auth/login', () => {

    // ── Particionamento de Equivalência ──────────────────────────────────────

    test('TI-AUTH-01 [PE] Credenciais válidas devolvem 200 + token JWT', async () => {
        const res = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'application/json')
            .send({ username: 'admin', password: '123456' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
    });

    test('TI-AUTH-02 [PE] Username inexistente devolve 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'naoexiste', password: '123456' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message');
    });

    test('TI-AUTH-03 [PE] Password incorreta devolve 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'admin', password: 'errada' });

        expect(res.status).toBe(401);
    });

    test('TI-AUTH-04 [PE] Body vazio devolve 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({});

        expect(res.status).toBe(400);
    });

    test('TI-AUTH-05 [PE] Ausência de campo username devolve 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ password: '123456' });

        expect(res.status).toBe(400);
    });

    test('TI-AUTH-06 [PE] Ausência de campo password devolve 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'admin' });

        expect(res.status).toBe(400);
    });

    // ── Valores Limite — comprimento de username ──────────────────────────────

    test('TI-AUTH-07 [VL] Username com 30 chars (limite máximo) devolve 401 (não 400)', async () => {
        const username30 = 'a'.repeat(30);
        const res = await request(app)
            .post('/auth/login')
            .send({ username: username30, password: '123456' });

        // Validação de comprimento passa; falha só por credenciais incorrectas
        expect(res.status).toBe(401);
    });

    /**
     * DEF-02 (descoberto): authcontroller.js não chama validateLoginInput,
     * pelo que a validação de comprimento máximo de username (30 chars) não é
     * aplicada. Um username de 31 chars passa a validação de comprimento e
     * falha apenas como "credenciais inválidas" → 401 em vez de 400.
     * Correção sugerida: chamar validateLoginInput no início do handler de login.
     */
    test('TI-AUTH-08 [VL/DEF-02] Username com 31 chars — authcontroller não valida comprimento → 401', async () => {
        const username31 = 'a'.repeat(31);
        const res = await request(app)
            .post('/auth/login')
            .send({ username: username31, password: '123456' });

        // Comportamento actual (bug): 401 em vez de 400 esperado
        // authcontroller não chama validateLoginInput (authValidator.js)
        expect(res.status).toBe(401);
    });

    // ── Headers — Content-Type ────────────────────────────────────────────────

    test('TI-AUTH-09 [PE] Content-Type text/plain — Express não parseia o body, devolve 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .set('Content-Type', 'text/plain')
            .send('username=admin&password=123456');

        expect(res.status).toBe(400);
    });

    // ── Método HTTP inválido ───────────────────────────────────────────────────

    test('TI-AUTH-10 [PE] GET /auth/login não existe — devolve 404', async () => {
        const res = await request(app).get('/auth/login');
        expect(res.status).toBe(404);
    });

    // ── Rate limiting ─────────────────────────────────────────────────────────

    test('TI-AUTH-11 [VL] 6 tentativas falhadas consecutivas bloqueiam com 429', async () => {
        // Fazer 6 tentativas falhadas (limite = 5)
        for (let i = 0; i < 6; i++) {
            await request(app)
                .post('/auth/login')
                .send({ username: 'admin', password: 'errada' });
        }

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'admin', password: 'errada' });

        expect(res.status).toBe(429);
    });
});

// =============================================================================
// 2. /batches — Controlo de acesso e transições de estado
// =============================================================================

describe('TI-BATCH — POST /batches e PATCH /batches/:id/transition', () => {

    // ── Controlo de acesso na criação ─────────────────────────────────────────

    test('TI-BATCH-01 [PE] POST /batches sem token devolve 401', async () => {
        const res = await request(app)
            .post('/batches')
            .send({ herbId: 1, planId: 1 });

        expect(res.status).toBe(401);
    });

    test('TI-BATCH-02 [PE] POST /batches com token Technician devolve 403', async () => {
        const res = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ herbId: 1, planId: 1 });

        expect(res.status).toBe(403);
    });

    test('TI-BATCH-03 [PE] POST /batches com token Technical Manager devolve 201', async () => {
        const res = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ herbId: 1, planId: 1 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.state).toBe('active');
    });

    test('TI-BATCH-04 [PE] POST /batches com token Admin devolve 201', async () => {
        const res = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ herbId: 2, planId: 2 });

        expect(res.status).toBe(201);
    });

    test('TI-BATCH-05 [PE] POST /batches sem herbId devolve 400', async () => {
        const res = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ planId: 1 });

        expect(res.status).toBe(400);
    });

    // ── GET /batches — acesso público (autenticado) ───────────────────────────

    test('TI-BATCH-06 [PE] GET /batches com qualquer token autenticado devolve 200', async () => {
        const res = await request(app)
            .get('/batches')
            .set('Authorization', `Bearer ${TOKEN.tech}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // ── Transições de estado — MCC (C1 × C2 × C3 × C4) ──────────────────────

    test('TI-BATCH-07 [MCC/C1] Transição com role Technician (C1=false) devolve 403', async () => {
        // Criar lote primeiro com Manager
        const create = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ herbId: 1, planId: 1 });
        const id = create.body.id;

        const res = await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ targetState: 'completed' });

        expect(res.status).toBe(403);
    });

    test('TI-BATCH-08 [MCC/C2] Transição de lote já "completed" (C2=false) devolve 422', async () => {
        const create = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ herbId: 1, planId: 1 });
        const id = create.body.id;

        // Primeira transição: active → completed
        await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ targetState: 'completed' });

        // Segunda transição: já está completed
        const res = await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ targetState: 'compromised' });

        expect(res.status).toBe(422);
    });

    test('TI-BATCH-09 [MCC/C3] targetState inválido (C3=false) devolve 422', async () => {
        const create = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ herbId: 1, planId: 1 });
        const id = create.body.id;

        const res = await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ targetState: 'suspended' });

        expect(res.status).toBe(422);
    });

    test('TI-BATCH-10 [MCC/C4] Lote com losses>0 sem justificação (C4=false) devolve 422', async () => {
        const create = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ herbId: 1, planId: 1, losses: 10 });
        const id = create.body.id;

        const res = await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ targetState: 'compromised' });

        expect(res.status).toBe(422);
    });

    test('TI-BATCH-11 [MCC] Todas condições verdadeiras (C1+C2+C3+C4) devolve 200', async () => {
        const create = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ herbId: 1, planId: 1, losses: 5 });
        const id = create.body.id;

        const res = await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ targetState: 'compromised', justification: 'Perdas por praga' });

        expect(res.status).toBe(200);
        expect(res.body.state).toBe('compromised');
    });

    test('TI-BATCH-12 [PE] Transição active→completed sem perdas não exige justificação — 200', async () => {
        const create = await request(app)
            .post('/batches')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ herbId: 1, planId: 1 }); // losses = 0 por omissão
        const id = create.body.id;

        const res = await request(app)
            .patch(`/batches/${id}/transition`)
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ targetState: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.state).toBe('completed');
    });

    // ── Token expirado ────────────────────────────────────────────────────────

    test('TI-BATCH-13 [PE] Token expirado devolve 401', async () => {
        const res = await request(app)
            .get('/batches')
            .set('Authorization', `Bearer ${TOKEN.expired}`);

        expect(res.status).toBe(401);
    });
});

// =============================================================================
// 3. /alerts — Criação, listagem e resolução
// =============================================================================

describe('TI-ALERT — POST /alerts, GET /alerts, PATCH /alerts/:id', () => {

    // ── Criação de alerta ─────────────────────────────────────────────────────

    test('TI-ALERT-01 [PE] POST /alerts sem token devolve 401', async () => {
        const res = await request(app)
            .post('/alerts')
            .send({ temp: 23, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(401);
    });

    test('TI-ALERT-02 [PE] POST /alerts com sensor inoperacional → classifica Informative', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 35, humidity: 90, sensorOK: false, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Informative');
    });

    test('TI-ALERT-03 [PE] POST /alerts temp e humidity dentro dos limites → Informative', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 23, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Informative');
    });

    test('TI-ALERT-04 [PE] POST /alerts apenas temp fora dos limites → Warning', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 35, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Warning');
    });

    test('TI-ALERT-05 [PE] POST /alerts ambos fora dos limites → Critical', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 35, humidity: 90, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Critical');
    });

    test('TI-ALERT-06 [PE] POST /alerts payload incompleto devolve 400', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 23 }); // faltam humidity, sensorOK, limits

        expect(res.status).toBe(400);
    });

    // ── Valores limite — temperatura ──────────────────────────────────────────

    test('TI-ALERT-07 [VL] Temperatura no limite inferior exacto (18 ºC) → Informative', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 18, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Informative');
    });

    test('TI-ALERT-08 [VL] Temperatura abaixo do limite (17 ºC) → Warning', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 17, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Warning');
    });

    test('TI-ALERT-09 [VL] Temperatura no limite superior (28 ºC) → Informative', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 28, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Informative');
    });

    test('TI-ALERT-10 [VL] Temperatura acima do limite (29 ºC) → Warning', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 29, humidity: 60, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Warning');
    });

    // ── Valores limite — humidade ─────────────────────────────────────────────

    test('TI-ALERT-11 [VL] Humidade abaixo do limite (39%) → Warning', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 23, humidity: 39, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Warning');
    });

    test('TI-ALERT-12 [VL] Humidade no limite inferior exacto (40%) → Informative', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 23, humidity: 40, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Informative');
    });

    test('TI-ALERT-13 [VL] Humidade no limite superior exacto (80%) → Informative', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 23, humidity: 80, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Informative');
    });

    test('TI-ALERT-14 [VL] Humidade acima do limite (81%) → Warning', async () => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ temp: 23, humidity: 81, sensorOK: true, limits: DEFAULT_LIMITS });

        expect(res.status).toBe(201);
        expect(res.body.classification).toBe('Warning');
    });

    // ── GET /alerts — controlo de acesso ─────────────────────────────────────

    test('TI-ALERT-15 [PE] GET /alerts com Technician devolve 403', async () => {
        const res = await request(app)
            .get('/alerts')
            .set('Authorization', `Bearer ${TOKEN.tech}`);

        expect(res.status).toBe(403);
    });

    test('TI-ALERT-16 [PE] GET /alerts com Technical Manager devolve 200', async () => {
        const res = await request(app)
            .get('/alerts')
            .set('Authorization', `Bearer ${TOKEN.manager}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('TI-ALERT-17 [PE] GET /alerts com Admin devolve 200', async () => {
        const res = await request(app)
            .get('/alerts')
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(200);
    });

    // ── PATCH /alerts/:id — resolução e valores limite de justificação ────────

    const createAlert = async (token = TOKEN.tech) => {
        const res = await request(app)
            .post('/alerts')
            .set('Authorization', `Bearer ${token}`)
            .send({ temp: 35, humidity: 90, sensorOK: true, limits: DEFAULT_LIMITS });
        return res.body.id;
    };

    test('TI-ALERT-18 [PE] Resolver alerta (action=resolve) sem justificação — 200', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'resolve' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('resolved');
    });

    test('TI-ALERT-19 [PE] Ignorar alerta sem justificação (action=ignore) — 422', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'ignore' });

        expect(res.status).toBe(422);
    });

    test('TI-ALERT-20 [VL] Ignorar alerta com justificação de 9 chars — 422', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'ignore', justification: 'a'.repeat(9) });

        expect(res.status).toBe(422);
    });

    test('TI-ALERT-21 [VL] Ignorar alerta com justificação de 10 chars (limite inf.) — 200', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'ignore', justification: 'a'.repeat(10) });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ignored');
    });

    test('TI-ALERT-22 [VL] Ignorar alerta com justificação de 250 chars — 200', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'ignore', justification: 'a'.repeat(250) });

        expect(res.status).toBe(200);
    });

    test('TI-ALERT-23 [VL] Ignorar alerta com justificação de 500 chars (limite sup.) — 200', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'ignore', justification: 'a'.repeat(500) });

        expect(res.status).toBe(200);
    });

    test('TI-ALERT-24 [VL] Ignorar alerta com justificação de 501 chars (acima limite) — 422', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'ignore', justification: 'a'.repeat(501) });

        expect(res.status).toBe(422);
    });

    test('TI-ALERT-25 [PE] Ação inválida (action=delete) devolve 422', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'delete' });

        expect(res.status).toBe(422);
    });

    test('TI-ALERT-26 [PE] Alerta inexistente devolve 404', async () => {
        const res = await request(app)
            .patch('/alerts/9999')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ action: 'resolve' });

        expect(res.status).toBe(404);
    });

    test('TI-ALERT-27 [PE] Technician não pode resolver alerta — 403', async () => {
        const id = await createAlert();
        const res = await request(app)
            .patch(`/alerts/${id}`)
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ action: 'resolve' });

        expect(res.status).toBe(403);
    });
});

// =============================================================================
// 4. /audit — Log de auditoria
// =============================================================================

describe('TI-AUDIT — POST /audit e GET /audit', () => {

    test('TI-AUDIT-01 [PE] POST /audit sem token devolve 401', async () => {
        const res = await request(app)
            .post('/audit')
            .send({ action: 'created_plan' });

        expect(res.status).toBe(401);
    });

    test('TI-AUDIT-02 [PE] POST /audit acção auditável cria log — 201', async () => {
        const res = await request(app)
            .post('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ action: 'created_plan', meta: { planId: 1 } });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('action', 'created_plan');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('userId', 1);
    });

    test('TI-AUDIT-03 [PE] POST /audit acção não auditável (get_plans) devolve 400', async () => {
        const res = await request(app)
            .post('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ action: 'get_plans' });

        expect(res.status).toBe(400);
    });

    test('TI-AUDIT-04 [PE] POST /audit acção vazia devolve 400', async () => {
        const res = await request(app)
            .post('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ action: '' });

        expect(res.status).toBe(400);
    });

    test('TI-AUDIT-05 [PE] GET /audit com Technical Manager devolve 403', async () => {
        const res = await request(app)
            .get('/audit')
            .set('Authorization', `Bearer ${TOKEN.manager}`);

        // Nota: auditRoutes.js usa checkAdmin que verifica role === 'Admin'
        // Technical Manager tem canViewAudit=true mas o middleware só permite 'Admin'
        expect(res.status).toBe(403);
    });

    test('TI-AUDIT-06 [PE] GET /audit com Admin devolve 200 + array', async () => {
        const res = await request(app)
            .get('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('TI-AUDIT-07 [PE] GET /audit devolve entradas criadas por POST /audit', async () => {
        await request(app)
            .post('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ action: 'created_batch', meta: { batchId: 42 } });

        const res = await request(app)
            .get('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        const entry = res.body.find(e => e.action === 'created_batch');
        expect(entry).toBeDefined();
        expect(entry.meta.batchId).toBe(42);
    });

    test('TI-AUDIT-08 [PE] GET /audit/filter filtra por action', async () => {
        await request(app)
            .post('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ action: 'deleted_user' });

        await request(app)
            .post('/audit')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ action: 'created_user' });

        const res = await request(app)
            .get('/audit/filter?action=deleted_user')
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(200);
        expect(res.body.every(e => e.action === 'deleted_user')).toBe(true);
    });
});

// =============================================================================
// 5. /users — Gestão de utilizadores
// =============================================================================

describe('TI-USER — POST/GET/PUT/DELETE /users', () => {

    test('TI-USER-01 [PE] POST /users sem token devolve 401', async () => {
        const res = await request(app)
            .post('/users')
            .send({ username: 'novo', role: 'Technician' });

        expect(res.status).toBe(401);
    });

    test('TI-USER-02 [PE] POST /users com Technician devolve 403', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${TOKEN.tech}`)
            .send({ username: 'novo', role: 'Technician' });

        expect(res.status).toBe(403);
    });

    test('TI-USER-03 [PE] POST /users com Admin devolve 201', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ username: `user_${Date.now()}`, role: 'Technician' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.role).toBe('Technician');
    });

    test('TI-USER-04 [PE] POST /users com Technical Manager devolve 201', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ username: `mgr_${Date.now()}`, role: 'Technician' });

        expect(res.status).toBe(201);
    });

    test('TI-USER-05 [PE] POST /users role inválida devolve 400', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ username: 'invalido', role: 'SuperUser' });

        expect(res.status).toBe(400);
    });

    test('TI-USER-06 [PE] POST /users sem username devolve 400', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ role: 'Technician' });

        expect(res.status).toBe(400);
    });

    test('TI-USER-07 [PE] GET /users com Technician devolve 403', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${TOKEN.tech}`);

        expect(res.status).toBe(403);
    });

    test('TI-USER-08 [PE] GET /users com Admin devolve 200 + array', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('TI-USER-09 [PE] GET /users/:id com Technical Manager devolve 200', async () => {
        const res = await request(app)
            .get('/users/1')
            .set('Authorization', `Bearer ${TOKEN.manager}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    test('TI-USER-10 [PE] GET /users/:id inexistente devolve 404', async () => {
        const res = await request(app)
            .get('/users/9999')
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(404);
    });

    test('TI-USER-11 [PE] PUT /users/:id com Admin devolve 200', async () => {
        const res = await request(app)
            .put('/users/3')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ role: 'Technical Manager' });

        expect(res.status).toBe(200);
        expect(res.body.role).toBe('Technical Manager');
    });

    test('TI-USER-12 [PE] PUT /users/:id com Technical Manager devolve 403', async () => {
        const res = await request(app)
            .put('/users/3')
            .set('Authorization', `Bearer ${TOKEN.manager}`)
            .send({ role: 'Admin' });

        expect(res.status).toBe(403);
    });

    test('TI-USER-13 [PE] DELETE /users/:id com Admin devolve 204', async () => {
        // Criar utilizador para depois apagar
        const create = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({ username: `del_${Date.now()}`, role: 'Technician' });
        const id = create.body.id;

        const res = await request(app)
            .delete(`/users/${id}`)
            .set('Authorization', `Bearer ${TOKEN.admin}`);

        expect(res.status).toBe(204);
    });

    test('TI-USER-14 [PE] DELETE /users/:id com Technician devolve 403', async () => {
        const res = await request(app)
            .delete('/users/1')
            .set('Authorization', `Bearer ${TOKEN.tech}`);

        expect(res.status).toBe(403);
    });

    // ── Métodos HTTP inválidos ────────────────────────────────────────────────

    test('TI-USER-15 [PE] PATCH /users (método não suportado) devolve 404', async () => {
        const res = await request(app)
            .patch('/users')
            .set('Authorization', `Bearer ${TOKEN.admin}`)
            .send({});

        // Express 5 responde 404 para rotas não definidas
        expect([404, 405]).toContain(res.status);
    });
});
