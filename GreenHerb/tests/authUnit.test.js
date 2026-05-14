'use strict';

/**
 * Testes unitários do login (TU-01 a TU-15).
 *
 * Característica desta suite: NÃO usa supertest nem sobe o Express.
 * Cada teste chama diretamente o validador (utils/authValidator) ou o
 * controller (controllers/authcontroller) com objetos req/res mockados.
 * Não há BD, rede nem dependências externas, conforme as pré-condições
 * dos casos da tabela.
 */

const jwt = require('jsonwebtoken');

const authController = require('../src/controllers/authcontroller');
const { validateLoginInput, containsInjection, USERNAME_MAX_LENGTH } =
    require('../src/utils/authValidator');
const rateLimiter = require('../src/utils/rateLimiter');

// ---------------------------------------------------------------------------
// Helpers para mock de req / res
// ---------------------------------------------------------------------------

function mockRes() {
    const res = {};
    res.statusCode = null;
    res.body = null;
    res.status = jest.fn(function (code) {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn(function (payload) {
        res.body = payload;
        return res;
    });
    return res;
}

function mockReq(body) {
    return { body, ip: '127.0.0.1' };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
    // Garantir contador de tentativas limpo entre testes
    rateLimiter.reset();
});

// ===========================================================================
// TU-01 — RF-01: autenticação de utilizador válida
// Técnica: Particionamento de Equivalência
// Esperado: 200 + token JWT válido
// ===========================================================================
describe('TU-01 — Login válido devolve 200 e token JWT', () => {
    test('credenciais válidas → 200 + token JWT verificável', async () => {
        const req = mockReq({ username: 'admin', password: '123456' });
        const res = mockRes();

        await authController.login(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');

        // Confirma que o token é um JWT válido assinado com o segredo
        const decoded = jwt.verify(
            res.body.token,
            process.env.JWT_SECRET || 'segredo'
        );
        expect(decoded).toHaveProperty('id', 1);
        expect(decoded).toHaveProperty('role', 'Administrador');
    });
});

// ===========================================================================
// TU-02 — RF-01: username inválido
// Técnica: Particionamento de Equivalência
// Esperado: 401 credenciais inválidas
// ===========================================================================
describe('TU-02 — Username inexistente devolve 401', () => {
    test('utilizador desconhecido → 401', async () => {
        const req = mockReq({ username: 'naoexiste', password: '123456' });
        const res = mockRes();

        await authController.login(req, res);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/credenciais/i);
    });
});

// ===========================================================================
// TU-03 — RF-01: password inválida
// Técnica: Particionamento de Equivalência
// Esperado: 401 credenciais inválidas
// ===========================================================================
describe('TU-03 — Password incorreta devolve 401', () => {
    test('utilizador válido mas password errada → 401', async () => {
        const req = mockReq({ username: 'admin', password: 'errada' });
        const res = mockRes();

        await authController.login(req, res);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toMatch(/credenciais/i);
    });
});

// ===========================================================================
// TU-04 — Campos obrigatórios: body vazio
// Técnica: Valores Limite
// Esperado: 400 dados em falta
// ===========================================================================
describe('TU-04 — Body completamente vazio devolve 400', () => {
    test('validador isolado com body={} → 400', () => {
        const result = validateLoginInput({});

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/em falta/i);
    });
});

// ===========================================================================
// TU-05 — Campos obrigatórios: username = null
// Técnica: Valores Limite
// Esperado: 400 username inválido
// ===========================================================================
describe('TU-05 — username nulo devolve 400', () => {
    test('validador isolado com username=null → 400 username inválido', () => {
        const result = validateLoginInput({ username: null, password: '123456' });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/username/i);
    });
});

// ===========================================================================
// TU-06 — Campos obrigatórios: password = null
// Técnica: Valores Limite
// Esperado: 400 password inválida
// ===========================================================================
describe('TU-06 — password nula devolve 400', () => {
    test('validador isolado com password=null → 400 password inválida', () => {
        const result = validateLoginInput({ username: 'admin', password: null });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/password/i);
    });
});

// ===========================================================================
// TU-07 — Campos obrigatórios: username vazio
// Técnica: Valores Limite
// Esperado: 400 / 401
// ===========================================================================
describe('TU-07 — username vazio devolve 400/401', () => {
    test('validador com username="" → 400', () => {
        const result = validateLoginInput({ username: '', password: '123456' });

        expect(result.valid).toBe(false);
        expect([400, 401]).toContain(result.status);
    });
});

// ===========================================================================
// TU-08 — Campos obrigatórios: password vazia
// Técnica: Valores Limite
// Esperado: 400 / 401
// ===========================================================================
describe('TU-08 — password vazia devolve 400/401', () => {
    test('validador com password="" → 400', () => {
        const result = validateLoginInput({ username: 'admin', password: '' });

        expect(result.valid).toBe(false);
        expect([400, 401]).toContain(result.status);
    });
});

// ===========================================================================
// TU-09 — Ausência de chave username
// Técnica: Particionamento de Equivalência
// Esperado: 400 campo obrigatório
// ===========================================================================
describe('TU-09 — body sem chave username devolve 400', () => {
    test('validador com body={password:"..."} → 400 obrigatório', () => {
        const result = validateLoginInput({ password: '123456' });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/obrigat/i);
        expect(result.message).toMatch(/username/i);
    });
});

// ===========================================================================
// TU-10 — Ausência de chave password
// Técnica: Particionamento de Equivalência
// Esperado: 400 campo obrigatório
// ===========================================================================
describe('TU-10 — body sem chave password devolve 400', () => {
    test('validador com body={username:"..."} → 400 obrigatório', () => {
        const result = validateLoginInput({ username: 'admin' });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/obrigat/i);
        expect(result.message).toMatch(/password/i);
    });
});

// ===========================================================================
// TU-11 — Formato do request: JSON inválido / não-objeto
// Técnica: Particionamento de Equivalência
// Esperado: 400 JSON inválido
// ===========================================================================
describe('TU-11 — body não-objeto / mal formado devolve 400', () => {
    test.each([
        ['null',      null],
        ['undefined', undefined],
        ['string',    'isto não é json'],
        ['número',    42],
        ['array',     ['admin', '123456']]
    ])('validador rejeita body do tipo %s', (_label, badBody) => {
        const result = validateLoginInput(badBody);

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/json|inválido/i);
    });
});

// ===========================================================================
// TU-12 — Condições múltiplas: username = "" e password = ""
// Técnica: Condições Múltiplas
// Esperado: 400 campos obrigatórios inválidos
// ===========================================================================
describe('TU-12 — username="" E password="" devolve 400', () => {
    test('ambos vazios → 400 campos obrigatórios inválidos', () => {
        const result = validateLoginInput({ username: '', password: '' });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/obrigat|inválid/i);
    });
});

// ===========================================================================
// TU-13 — Segurança: tentativa de injeção
// Técnica: Particionamento de Equivalência
// Esperado: 400 / 401 sem execução de código
// ===========================================================================
describe('TU-13 — injeção no username é rejeitada', () => {
    test.each([
        "' OR '1'='1",
        "admin'; DROP TABLE users; --",
        "admin' OR 1=1 --",
        '{"$ne": null}'
    ])('payload malicioso %s → 400 sem token', async (payload) => {
        // Teste no validador isolado
        const result = validateLoginInput({ username: payload, password: 'x' });
        expect(result.valid).toBe(false);
        expect([400, 401]).toContain(result.status);

        // E no controller: garantir que nunca devolve token
        const req = mockReq({ username: payload, password: 'x' });
        const res = mockRes();
        await authController.login(req, res);

        expect(res.body).not.toHaveProperty('token');
        expect([400, 401]).toContain(res.statusCode);
    });
});

// ===========================================================================
// TU-14 — Rate limiting / tentativas excessivas
// Técnica: Valores Limite (N-1, N, N+1)
// Esperado: 429 a partir do limite N
// ===========================================================================
describe('TU-14 — Rate limiting bloqueia acima de N tentativas', () => {
    const N = rateLimiter.DEFAULT_MAX_ATTEMPTS;

    test(`tentativa N-1 (=${N - 1}) ainda permite resposta normal (401)`, async () => {
        // Pré-condição: simular N-2 falhas anteriores no contador (mock)
        for (let i = 0; i < N - 2; i++) {
            rateLimiter.registerAttempt('admin');
        }
        // Esta tentativa será a (N-1)
        const req = mockReq({ username: 'admin', password: 'errada' });
        const res = mockRes();
        await authController.login(req, res);

        expect(res.statusCode).toBe(401);
    });

    test(`tentativa N (=${N}) ainda passa pelo validador (401)`, async () => {
        for (let i = 0; i < N - 1; i++) {
            rateLimiter.registerAttempt('admin');
        }
        const req = mockReq({ username: 'admin', password: 'errada' });
        const res = mockRes();
        await authController.login(req, res);

        expect(res.statusCode).toBe(401);
        expect(res.statusCode).not.toBe(429);
    });

    test(`tentativa N+1 (=${N + 1}) é bloqueada com 429`, async () => {
        for (let i = 0; i < N; i++) {
            rateLimiter.registerAttempt('admin');
        }
        const req = mockReq({ username: 'admin', password: 'errada' });
        const res = mockRes();
        await authController.login(req, res);

        expect(res.statusCode).toBe(429);
        expect(res.body.message).toMatch(/tentativas/i);
    });
});

// ===========================================================================
// TU-15 — Comprimento máximo de username
// Técnica: Valores Limite (limite-1, limite, limite+1)
// Esperado: 400 input inválido para limite+1
// ===========================================================================
describe('TU-15 — Comprimento máximo do username', () => {
    const LIMIT = USERNAME_MAX_LENGTH;

    test(`username com limite-1 (=${LIMIT - 1}) chars é aceite pelo validador`, () => {
        const username = 'a'.repeat(LIMIT - 1);
        const result = validateLoginInput({ username, password: '123456' });

        expect(result.valid).toBe(true);
    });

    test(`username com exatamente ${LIMIT} chars é aceite pelo validador`, () => {
        const username = 'a'.repeat(LIMIT);
        const result = validateLoginInput({ username, password: '123456' });

        expect(result.valid).toBe(true);
    });

    test(`username com limite+1 (=${LIMIT + 1}) chars é rejeitado com 400`, () => {
        const username = 'a'.repeat(LIMIT + 1);
        const result = validateLoginInput({ username, password: '123456' });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/inválido|longo/i);
    });
});

// ===========================================================================
// Extra — Branches defensivas para 100% de cobertura
// Não correspondem a um TU específico, mas exercitam caminhos defensivos do
// código (tipos não-string, identifier ausente no rate limiter, etc.).
// ===========================================================================
describe('Cobertura — caminhos defensivos', () => {

    test('validador rejeita username não-string (ex.: number) com 400', () => {
        const result = validateLoginInput({ username: 12345, password: '123456' });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/username/i);
    });

    test('validador rejeita password não-string (ex.: object) com 400', () => {
        const result = validateLoginInput({ username: 'admin', password: { a: 1 } });

        expect(result.valid).toBe(false);
        expect(result.status).toBe(400);
        expect(result.message).toMatch(/password/i);
    });

    test('controller com req.body ausente devolve 400 (JSON inválido) e não rebenta', async () => {
        const req = { ip: '127.0.0.1' }; // sem body
        const res = mockRes();

        await authController.login(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/json|inválido/i);
    });

    test('rateLimiter.registerAttempt com identifier ausente cai em "unknown"', () => {
        rateLimiter.reset();
        rateLimiter.registerAttempt();
        rateLimiter.registerAttempt(null);

        expect(rateLimiter.getAttempts('unknown')).toBe(2);
    });

    test('rateLimiter.reset(identifier) limpa apenas essa chave', () => {
        rateLimiter.reset();
        rateLimiter.registerAttempt('user-a');
        rateLimiter.registerAttempt('user-b');

        rateLimiter.reset('user-a');

        expect(rateLimiter.getAttempts('user-a')).toBe(0);
        expect(rateLimiter.getAttempts('user-b')).toBe(1);
    });

    test('rateLimiter expira a janela: tentativa fora da janela reinicia contador', () => {
        rateLimiter.reset();
        const t0 = 1_000_000;
        rateLimiter.registerAttempt('expira', t0);
        rateLimiter.registerAttempt('expira', t0 + 1000);
        expect(rateLimiter.getAttempts('expira')).toBe(2);

        // Tentativa muito depois da janela (> DEFAULT_WINDOW_MS)
        rateLimiter.registerAttempt('expira', t0 + 10 * 60 * 1000);
        expect(rateLimiter.getAttempts('expira')).toBe(1);
    });

    test('containsInjection devolve false para valor não-string (guarda)', () => {
        expect(containsInjection(12345)).toBe(false);
        expect(containsInjection(null)).toBe(false);
        expect(containsInjection(undefined)).toBe(false);
        expect(containsInjection({ x: 1 })).toBe(false);
    });

    test('controller com req.body do tipo string usa fallback de identifier (req.ip)', async () => {
        // req.body é truthy mas não é objeto → cai em req.ip no identifier
        const req = { body: 'string-inesperada', ip: '10.0.0.1' };
        const res = mockRes();

        await authController.login(req, res);

        // Validador rejeita o body não-objeto com 400 (TU-11)
        expect(res.statusCode).toBe(400);
    });

    test('controller com body objeto SEM username usa req.ip como identifier', async () => {
        // req.body.username é falsy → identifier = req.ip
        const req = { body: { password: '123456' }, ip: '10.0.0.2' };
        const res = mockRes();

        await authController.login(req, res);

        expect(res.statusCode).toBe(400);
        expect(rateLimiter.getAttempts('10.0.0.2')).toBeGreaterThanOrEqual(1);
    });

    describe('_getIdentifier — todas as combinações', () => {
        const getIdentifier = authController._getIdentifier;

        test('body com username → devolve o username', () => {
            expect(getIdentifier({ body: { username: 'alice' }, ip: '1.1.1.1' }))
                .toBe('alice');
        });

        test('body sem username mas com ip → devolve o ip', () => {
            expect(getIdentifier({ body: {}, ip: '2.2.2.2' })).toBe('2.2.2.2');
        });

        test('body string (não-objeto) mas com ip → devolve o ip', () => {
            expect(getIdentifier({ body: 'lixo', ip: '3.3.3.3' })).toBe('3.3.3.3');
        });

        test('sem body e sem ip → devolve "unknown"', () => {
            expect(getIdentifier({})).toBe('unknown');
        });

        test('req inexistente → devolve "unknown"', () => {
            expect(getIdentifier(null)).toBe('unknown');
            expect(getIdentifier(undefined)).toBe('unknown');
        });
    });
});