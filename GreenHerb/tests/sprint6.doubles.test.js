/**
 * ============================================================
 * GREENHERB — Sprint 6: Duplos de Teste — EXPANDED
 * ============================================================
 *
 * Expansão máxima dos testes a partir dos 25 originais.
 * Cobre todos os serviços do projeto com estratégia sistemática:
 *
 *   • MeasurementService  — Stub (TU-SP6-01..25, originais mantidos)
 *   • alertService        — classifyAlert (TU-AL-*) e resolveAlert (TU-RA-*)
 *   • batchService        — transitionBatch (TU-BA-*)
 *   • auditService        — logAction / isAuditable / getAuditLogs (TU-AU-*)
 *   • automationService   — switchMode / decideAction (TU-AM-*)
 *
 * Estratégia de cobertura:
 *   ─ AVL (Análise de Valor Limite): valores exatos nos limites, imediatamente
 *     abaixo/acima, e fora dos extremos.
 *   ─ MCC (Modified Condition/Decision Coverage): cada condição booleana
 *     individualmente responsável pelo resultado.
 *   ─ Tabelas de decisão: combinações de condições independentes.
 *
 * Referências de rastreabilidade:
 *   TU-SP6-01..25  → MeasurementService (Stub + Mock) — originais
 *   TU-AL-01..20   → classifyAlert (alertService)
 *   TU-RA-01..20   → resolveAlert (alertService)
 *   TU-BA-01..20   → transitionBatch (batchService)
 *   TU-AU-01..20   → auditService (logAction / isAuditable / getAuditLogs)
 *   TU-AM-01..12   → automationService (switchMode / decideAction)
 * ============================================================
 */

'use strict';

const { MeasurementService }    = require('../src/services/measurementService');
const { classifyAlert, resolveAlert } = require('../src/services/alertService');
const { transitionBatch }        = require('../src/services/batchService');
const { logAction, isAuditable, getAuditLogs, auditLogs } = require('../src/services/auditService');
const { switchMode, decideAction } = require('../src/services/automationService');

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const defaultLimits = {
    minTemp:     18,
    maxTemp:     28,
    minHumidity: 40,
    maxHumidity: 80,
};

const defaultRecipients = [
    { id: 'user-001', email: 'responsavel@greenherb.pt' },
    { id: 'user-002', email: 'admin@greenherb.pt' },
];

// ─── Test Doubles ─────────────────────────────────────────────────────────────

class TemperatureGatewayStub {
    constructor(reading, healthy = true) {
        this._reading = reading;
        this._healthy = healthy;
    }
    async getLatestReading(_sensorId) {
        return { ...this._reading, timestamp: new Date().toISOString() };
    }
    async isSensorHealthy(_sensorId) {
        return this._healthy;
    }
}

class NotificationGatewayMock {
    constructor() { this.reset(); }
    reset() {
        this.sendNotificationCalls     = [];
        this.sendBulkNotificationCalls = [];
    }
    async sendNotification(notification) {
        this.sendNotificationCalls.push({ ...notification });
        return { success: true, messageId: `mock-msg-${Date.now()}` };
    }
    async sendBulkNotification(notifications) {
        this.sendBulkNotificationCalls.push([...notifications]);
        return { sent: notifications.length, failed: 0 };
    }
    get bulkCallCount()    { return this.sendBulkNotificationCalls.length; }
    get firstBulkCallArgs(){ return this.sendBulkNotificationCalls[0] ?? null; }
    wasNotifiedWithAlertType(alertType) {
        return this.sendBulkNotificationCalls.some(batch =>
            batch.some(n => n.alertType === alertType)
        );
    }
}

// =============================================================================
// SUITE 1 — MeasurementService (originais TU-SP6-01..25 mantidos)
// =============================================================================

describe('Sprint 6 — Duplos de Teste (Stub + Mock)', () => {

    let notificationMock;
    beforeEach(() => { notificationMock = new NotificationGatewayMock(); });

    // ── A — Stub do TemperatureGateway ────────────────────────────────────────

    describe('A — Stub do TemperatureGateway', () => {

        test('TU-SP6-01 | Leitura nominal → Informative', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.reading.temperature).toBe(23);
            expect(result.reading.humidity).toBe(60);
            expect(result.alertType).toBe('Informative');
        });

        test('TU-SP6-02 | Temperatura no limite inferior exato (18 °C) → Informative', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 18, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Informative');
        });

        test('TU-SP6-03 | Temperatura abaixo do limite inferior (17 °C) → Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 17, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });

        test('TU-SP6-04 | Temperatura no limite superior exato (28 °C) → Informative', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 28, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Informative');
        });

        test('TU-SP6-05 | Temperatura acima do limite superior (29 °C) → Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 29, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });

        test('TU-SP6-06 | Sensor avariado (sensorOK=false) → Informative mesmo fora dos limites', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: false });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Informative');
            expect(result.reading.sensorOK).toBe(false);
        });

        test('TU-SP6-07 | Ambos fora dos limites → Critical', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Critical');
        });

        test('TU-SP6-08 | Humidade no limite inferior exato (40 %) → Informative', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 40, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Informative');
        });

        test('TU-SP6-09 | Humidade abaixo do limite inferior (39 %) → Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 39, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });

        test('TU-SP6-10 | isSensorHealthy → true quando sensor operacional', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: true }, true);
            const svc  = new MeasurementService(stub, notificationMock);
            expect(await svc.checkSensorHealth('sensor-01')).toBe(true);
        });
    });

    // ── B — Mock do NotificationGateway ──────────────────────────────────────

    describe('B — Mock do NotificationGateway', () => {

        test('TU-SP6-11 | Informative → mock NÃO é chamado', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.bulkCallCount).toBe(0);
        });

        test('TU-SP6-12 | Warning → mock chamado uma vez', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 17, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.bulkCallCount).toBe(1);
        });

        test('TU-SP6-13 | Warning → payload contém alertType=Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 17, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.wasNotifiedWithAlertType('Warning')).toBe(true);
        });

        test('TU-SP6-14 | Critical → mock chamado uma vez', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.bulkCallCount).toBe(1);
        });

        test('TU-SP6-15 | Critical → payload contém alertType=Critical', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.wasNotifiedWithAlertType('Critical')).toBe(true);
        });

        test('TU-SP6-16 | Batch contém número correto de destinatários', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.firstBulkCallArgs).toHaveLength(defaultRecipients.length);
        });

        test('TU-SP6-17 | Email do primeiro destinatário está correto', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.firstBulkCallArgs[0].recipientEmail).toBe('responsavel@greenherb.pt');
        });

        test('TU-SP6-18 | Canal de notificação é email', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            notificationMock.firstBulkCallArgs.forEach(n => expect(n.channel).toBe('email'));
        });

        test('TU-SP6-19 | Sem destinatários → mock NÃO é chamado mesmo com Critical', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(notificationMock.bulkCallCount).toBe(0);
            expect(result.notificationSent).toBe(false);
        });

        test('TU-SP6-20 | Sensor avariado → mock NÃO é chamado (Informative)', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: false });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.bulkCallCount).toBe(0);
        });
    });

    // ── C — Cenários Combinados ───────────────────────────────────────────────

    describe('C — Cenários Combinados', () => {

        test('TU-SP6-21 | Nominal → Informative → notificationSent=false', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(result.alertType).toBe('Informative');
            expect(result.notificationSent).toBe(false);
            expect(notificationMock.bulkCallCount).toBe(0);
        });

        test('TU-SP6-22 | Temperatura fora → Warning → notificationSent=true', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 29, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(result.alertType).toBe('Warning');
            expect(result.notificationSent).toBe(true);
            expect(notificationMock.bulkCallCount).toBe(1);
        });

        test('TU-SP6-23 | Ambos fora → Critical → notificação com alertType=Critical', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 15, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(result.alertType).toBe('Critical');
            expect(result.notificationSent).toBe(true);
            expect(notificationMock.wasNotifiedWithAlertType('Critical')).toBe(true);
        });

        test('TU-SP6-24 | Humidade AVL 81 % → Warning → notificação enviada', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 81, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(result.alertType).toBe('Warning');
            expect(result.notificationSent).toBe(true);
        });

        test('TU-SP6-25 | Reset do mock isola contagens entre cenários', async () => {
            const stub1 = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            await new MeasurementService(stub1, notificationMock)
                .processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.bulkCallCount).toBe(1);
            notificationMock.reset();
            const stub2 = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: true });
            await new MeasurementService(stub2, notificationMock)
                .processAutomaticReading('sensor-01', defaultLimits, defaultRecipients);
            expect(notificationMock.bulkCallCount).toBe(0);
        });
    });

    // ── D — Novos cenários MeasurementService ─────────────────────────────────

    describe('D — MeasurementService: novos cenários', () => {

        test('TU-SP6-26 | isSensorHealthy → false quando sensor avariado', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: false }, false);
            const svc  = new MeasurementService(stub, notificationMock);
            expect(await svc.checkSensorHealth('sensor-01')).toBe(false);
        });

        test('TU-SP6-27 | Temperatura no extremo inferior (0 °C) → Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 0, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });

        test('TU-SP6-28 | Temperatura negativa → Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: -5, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });

        test('TU-SP6-29 | Humidade no limite superior exato (80 %) → Informative', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 80, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Informative');
        });

        test('TU-SP6-30 | Destinatário único → batch contém 1 notificação', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 35, humidity: 90, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-01', defaultLimits, [{ id: 'u1', email: 'x@y.pt' }]);
            expect(notificationMock.firstBulkCallArgs).toHaveLength(1);
        });

        test('TU-SP6-31 | Payload inclui sensorId no body da mensagem (Warning)', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 17, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            await svc.processAutomaticReading('sensor-XYZ', defaultLimits, defaultRecipients);
            const body = notificationMock.firstBulkCallArgs[0].body;
            expect(body).toContain('sensor-XYZ');
        });

        test('TU-SP6-32 | Leitura retornada contém timestamp', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.reading.timestamp).toBeDefined();
        });

        test('TU-SP6-33 | Limites personalizados: temperatura máxima 35 °C → Informative com 34 °C', async () => {
            const customLimits = { minTemp: 10, maxTemp: 35, minHumidity: 20, maxHumidity: 90 };
            const stub = new TemperatureGatewayStub({ temperature: 34, humidity: 60, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', customLimits, []);
            expect(result.alertType).toBe('Informative');
        });

        test('TU-SP6-34 | Humidade 0 % (extremo absoluto) → Warning', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 0, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });

        test('TU-SP6-35 | Humidade 100 % → Warning (acima do máximo)', async () => {
            const stub = new TemperatureGatewayStub({ temperature: 23, humidity: 100, sensorOK: true });
            const svc  = new MeasurementService(stub, notificationMock);
            const result = await svc.processAutomaticReading('sensor-01', defaultLimits, []);
            expect(result.alertType).toBe('Warning');
        });
    });
});

// =============================================================================
// SUITE 2 — classifyAlert (alertService)
// =============================================================================

describe('alertService — classifyAlert', () => {

    // AVL: limites de temperatura ─────────────────────────────────────────────

    test('TU-AL-01 | Temp e humidade nominais → Informative', () => {
        expect(classifyAlert(23, 60, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-02 | sensorOK=false → sempre Informative (ignora leitura)', () => {
        expect(classifyAlert(0, 0, false, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-03 | Temp no limite inferior exato (18) → Informative', () => {
        expect(classifyAlert(18, 60, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-04 | Temp abaixo do limite inferior (17) — AVL → Warning', () => {
        expect(classifyAlert(17, 60, true, defaultLimits)).toBe('Warning');
    });

    test('TU-AL-05 | Temp no limite superior exato (28) → Informative', () => {
        expect(classifyAlert(28, 60, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-06 | Temp acima do limite superior (29) — AVL → Warning', () => {
        expect(classifyAlert(29, 60, true, defaultLimits)).toBe('Warning');
    });

    // AVL: limites de humidade ────────────────────────────────────────────────

    test('TU-AL-07 | Humidade no limite inferior exato (40) → Informative', () => {
        expect(classifyAlert(23, 40, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-08 | Humidade abaixo do limite inferior (39) — AVL → Warning', () => {
        expect(classifyAlert(23, 39, true, defaultLimits)).toBe('Warning');
    });

    test('TU-AL-09 | Humidade no limite superior exato (80) → Informative', () => {
        expect(classifyAlert(23, 80, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-10 | Humidade acima do limite superior (81) — AVL → Warning', () => {
        expect(classifyAlert(23, 81, true, defaultLimits)).toBe('Warning');
    });

    // Critical: ambos fora ────────────────────────────────────────────────────

    test('TU-AL-11 | Temp baixa e humidade alta (ambos fora) → Critical', () => {
        expect(classifyAlert(10, 95, true, defaultLimits)).toBe('Critical');
    });

    test('TU-AL-12 | Temp alta e humidade baixa (ambos fora) → Critical', () => {
        expect(classifyAlert(35, 10, true, defaultLimits)).toBe('Critical');
    });

    test('TU-AL-13 | Ambos nos limites exatos (18, 40) → Informative', () => {
        expect(classifyAlert(18, 40, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-14 | Ambos nos limites exatos (28, 80) → Informative', () => {
        expect(classifyAlert(28, 80, true, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-15 | Temp nominal, humidade 0 % → Warning', () => {
        expect(classifyAlert(23, 0, true, defaultLimits)).toBe('Warning');
    });

    test('TU-AL-16 | Temp nominal, humidade 100 % → Warning', () => {
        expect(classifyAlert(23, 100, true, defaultLimits)).toBe('Warning');
    });

    test('TU-AL-17 | Temp negativa, humidade nominal → Warning', () => {
        expect(classifyAlert(-10, 60, true, defaultLimits)).toBe('Warning');
    });

    test('TU-AL-18 | sensorOK=false com ambos fora → Informative (sensor prevalece)', () => {
        expect(classifyAlert(0, 100, false, defaultLimits)).toBe('Informative');
    });

    test('TU-AL-19 | Limites personalizados estreitos (20-22): temp 21 → Informative', () => {
        const limits = { minTemp: 20, maxTemp: 22, minHumidity: 50, maxHumidity: 60 };
        expect(classifyAlert(21, 55, true, limits)).toBe('Informative');
    });

    test('TU-AL-20 | Limites personalizados estreitos: temp 23 → Warning', () => {
        const limits = { minTemp: 20, maxTemp: 22, minHumidity: 50, maxHumidity: 60 };
        expect(classifyAlert(23, 55, true, limits)).toBe('Warning');
    });
});

// =============================================================================
// SUITE 3 — resolveAlert (alertService)
// =============================================================================

describe('alertService — resolveAlert', () => {

    const makeAlert = () => ({ type: 'Warning', status: 'open' });

    test('TU-RA-01 | resolve sem justificação → status=resolved, justification=null', () => {
        const a = makeAlert();
        const r = resolveAlert(a, 'resolve', undefined);
        expect(r.status).toBe('resolved');
        expect(r.justification).toBeNull();
    });

    test('TU-RA-02 | resolve com justificação → justificação preservada', () => {
        const a = makeAlert();
        const r = resolveAlert(a, 'resolve', 'Problema corrigido');
        expect(r.status).toBe('resolved');
        expect(r.justification).toBe('Problema corrigido');
    });

    test('TU-RA-03 | resolve com string vazia → justification=null', () => {
        const a = makeAlert();
        const r = resolveAlert(a, 'resolve', '');
        expect(r.justification).toBeNull();
    });

    test('TU-RA-04 | ignore com justificação válida (10 chars) → status=ignored', () => {
        const a = makeAlert();
        const r = resolveAlert(a, 'ignore', '1234567890');
        expect(r.status).toBe('ignored');
        expect(r.justification).toBe('1234567890');
    });

    test('TU-RA-05 | ignore com justificação de 500 chars → aceite', () => {
        const a = makeAlert();
        const j = 'x'.repeat(500);
        const r = resolveAlert(a, 'ignore', j);
        expect(r.status).toBe('ignored');
    });

    test('TU-RA-06 | ignore com justificação de 9 chars — AVL → lança erro', () => {
        const a = makeAlert();
        expect(() => resolveAlert(a, 'ignore', '123456789')).toThrow();
    });

    test('TU-RA-07 | ignore com justificação de 501 chars — AVL → lança erro', () => {
        const a = makeAlert();
        expect(() => resolveAlert(a, 'ignore', 'x'.repeat(501))).toThrow();
    });

    test('TU-RA-08 | ignore com justificação vazia → lança erro', () => {
        const a = makeAlert();
        expect(() => resolveAlert(a, 'ignore', '')).toThrow();
    });

    test('TU-RA-09 | ignore com justificação undefined → lança erro', () => {
        const a = makeAlert();
        expect(() => resolveAlert(a, 'ignore', undefined)).toThrow();
    });

    test('TU-RA-10 | ação inválida → lança erro', () => {
        expect(() => resolveAlert(makeAlert(), 'delete', 'qualquer')).toThrow('Invalid action');
    });

    test('TU-RA-11 | ação com maiúsculas ("Resolve") → lança erro (case-sensitive)', () => {
        expect(() => resolveAlert(makeAlert(), 'Resolve', '')).toThrow();
    });

    test('TU-RA-12 | ação numérica → lança erro', () => {
        expect(() => resolveAlert(makeAlert(), 42, '')).toThrow();
    });

    test('TU-RA-13 | DEF-01: resolveAlert muta o objeto original (referência)', () => {
        const a = makeAlert();
        const r = resolveAlert(a, 'resolve', 'ok');
        expect(r).toBe(a); // mesma referência
    });

    test('TU-RA-14 | ignore preserva outros campos do objeto alerta', () => {
        const a = { type: 'Critical', status: 'open', sensorId: 'SEN-007' };
        resolveAlert(a, 'ignore', 'Justificação com dez');
        expect(a.sensorId).toBe('SEN-007');
        expect(a.type).toBe('Critical');
    });

    test('TU-RA-15 | resolve preserva o campo type do objeto alerta', () => {
        const a = makeAlert();
        resolveAlert(a, 'resolve', '');
        expect(a.type).toBe('Warning');
    });

    test('TU-RA-16 | ignore com justificação de exatamente 10 chars — AVL aceite', () => {
        const a = makeAlert();
        expect(() => resolveAlert(a, 'ignore', 'abcdefghij')).not.toThrow();
    });

    test('TU-RA-17 | ignore com justificação de exatamente 500 chars — AVL aceite', () => {
        const a = makeAlert();
        expect(() => resolveAlert(a, 'ignore', 'a'.repeat(500))).not.toThrow();
    });

    test('TU-RA-18 | resolve com justificação null → justification=null', () => {
        const a = makeAlert();
        const r = resolveAlert(a, 'resolve', null);
        expect(r.justification).toBeNull();
    });

    test('TU-RA-19 | ação string vazia → lança erro', () => {
        expect(() => resolveAlert(makeAlert(), '', '')).toThrow();
    });

    test('TU-RA-20 | ignore com justificação whitespace (len=5 < 10) → lança erro', () => {
        expect(() => resolveAlert(makeAlert(), 'ignore', '     ')).toThrow();
    });
});

// =============================================================================
// SUITE 4 — transitionBatch (batchService)
// =============================================================================

describe('batchService — transitionBatch', () => {

    const activeBatch  = { state: 'active',      losses: 0 };
    const doneBatch    = { state: 'completed',   losses: 0 };
    const lostBatch    = { state: 'active',      losses: 5 };
    const manager      = { role: 'Technical Manager' };
    const admin        = { role: 'Admin' };
    const viewer       = { role: 'Viewer' };

    test('TU-BA-01 | Technical Manager pode transitar active → completed', () => {
        const result = transitionBatch({ ...activeBatch }, manager, 'completed', '');
        expect(result.state).toBe('completed');
    });

    test('TU-BA-02 | Admin pode transitar active → compromised', () => {
        const result = transitionBatch({ ...activeBatch }, admin, 'compromised', 'Contaminação');
        expect(result.state).toBe('compromised');
    });

    test('TU-BA-03 | Viewer não pode transitar (C1 falso) → lança erro', () => {
        expect(() => transitionBatch({ ...activeBatch }, viewer, 'completed', '')).toThrow('Unauthorized');
    });

    test('TU-BA-04 | Lote já completed não pode transitar (C2 falso) → lança erro', () => {
        expect(() => transitionBatch({ ...doneBatch }, manager, 'completed', '')).toThrow('Invalid transition');
    });

    test('TU-BA-05 | Estado alvo inválido (C3 falso) → lança erro', () => {
        expect(() => transitionBatch({ ...activeBatch }, manager, 'active', '')).toThrow('Invalid target state');
    });

    test('TU-BA-06 | Perdas > 0 sem justificação (C4 falso) → lança erro', () => {
        expect(() => transitionBatch({ ...lostBatch }, manager, 'completed', '')).toThrow('Justification required');
    });

    test('TU-BA-07 | Perdas > 0 com justificação válida → transição aceite', () => {
        const result = transitionBatch({ ...lostBatch }, manager, 'compromised', 'Motivo claro');
        expect(result.state).toBe('compromised');
    });

    test('TU-BA-08 | Perdas = 0 sem justificação → transição aceite', () => {
        const result = transitionBatch({ ...activeBatch }, manager, 'completed', '');
        expect(result.state).toBe('completed');
    });

    test('TU-BA-09 | batch=null → lança erro', () => {
        expect(() => transitionBatch(null, manager, 'completed', '')).toThrow();
    });

    test('TU-BA-10 | user=null → lança erro', () => {
        expect(() => transitionBatch({ ...activeBatch }, null, 'completed', '')).toThrow();
    });

    test('TU-BA-11 | Estado alvo "active" (inválido) → lança erro', () => {
        expect(() => transitionBatch({ ...activeBatch }, manager, 'active', '')).toThrow();
    });

    test('TU-BA-12 | Estado alvo undefined → lança erro', () => {
        expect(() => transitionBatch({ ...activeBatch }, manager, undefined, '')).toThrow();
    });

    test('TU-BA-13 | Lote compromised não pode transitar → lança erro', () => {
        const compromised = { state: 'compromised', losses: 0 };
        expect(() => transitionBatch(compromised, manager, 'completed', '')).toThrow('Invalid transition');
    });

    test('TU-BA-14 | Transição não muta o objeto original (retorna cópia)', () => {
        const batch = { ...activeBatch };
        const result = transitionBatch(batch, manager, 'completed', '');
        expect(result).not.toBe(batch); // nova referência
        expect(batch.state).toBe('active'); // original inalterado
    });

    test('TU-BA-15 | Justificação é preservada no resultado', () => {
        const result = transitionBatch({ ...lostBatch }, manager, 'compromised', 'Geada inesperada');
        expect(result.justification).toBe('Geada inesperada');
    });

    test('TU-BA-16 | Perdas = 0 com justificação fornecida → justificação preservada', () => {
        const result = transitionBatch({ ...activeBatch }, manager, 'completed', 'Colheita normal');
        expect(result.justification).toBe('Colheita normal');
    });

    test('TU-BA-17 | Papel "Admin" é aceite para transitar', () => {
        const result = transitionBatch({ ...activeBatch }, admin, 'completed', '');
        expect(result.state).toBe('completed');
    });

    test('TU-BA-18 | Papel "Technician" não é aceite → lança erro', () => {
        expect(() => transitionBatch({ ...activeBatch }, { role: 'Technician' }, 'completed', '')).toThrow();
    });

    test('TU-BA-19 | Perdas fracionárias > 0 sem justificação → lança erro', () => {
        expect(() => transitionBatch({ state: 'active', losses: 0.5 }, manager, 'completed', '')).toThrow();
    });

    test('TU-BA-20 | Perdas = 0 e justificação undefined → aceite (sem erro)', () => {
        expect(() => transitionBatch({ ...activeBatch }, manager, 'completed', undefined)).not.toThrow();
    });
});

// =============================================================================
// SUITE 5 — auditService
// =============================================================================

describe('auditService', () => {

    const validUser   = { id: 'u-001', role: 'Admin' };
    const validAction = 'created_plan';

    beforeEach(() => {
        // Limpar o log em memória entre testes
        auditLogs.length = 0;
    });

    // isAuditable ─────────────────────────────────────────────────────────────

    test('TU-AU-01 | isAuditable com ação válida → true', () => {
        expect(isAuditable('created_plan')).toBe(true);
    });

    test('TU-AU-02 | isAuditable com ação de leitura → false', () => {
        expect(isAuditable('get_plan')).toBe(false);
    });

    test('TU-AU-03 | isAuditable com string vazia → false', () => {
        expect(isAuditable('')).toBe(false);
    });

    test('TU-AU-04 | isAuditable com string de espaços → false', () => {
        expect(isAuditable('   ')).toBe(false);
    });

    test('TU-AU-05 | isAuditable com número → false', () => {
        expect(isAuditable(42)).toBe(false);
    });

    // logAction ───────────────────────────────────────────────────────────────

    test('TU-AU-06 | logAction válido → retorna entrada com userId correto', () => {
        const entry = logAction(validUser, validAction);
        expect(entry.userId).toBe('u-001');
    });

    test('TU-AU-07 | logAction válido → retorna entrada com action correta', () => {
        const entry = logAction(validUser, validAction);
        expect(entry.action).toBe(validAction);
    });

    test('TU-AU-08 | logAction válido → entrada tem timestamp', () => {
        const entry = logAction(validUser, validAction);
        expect(entry.timestamp).toBeDefined();
    });

    test('TU-AU-09 | logAction regista entrada no auditLogs', () => {
        logAction(validUser, validAction);
        expect(auditLogs).toHaveLength(1);
    });

    test('TU-AU-10 | logAction com user=null → lança erro (C1 falso)', () => {
        expect(() => logAction(null, validAction)).toThrow();
    });

    test('TU-AU-11 | logAction com user sem id → lança erro (C1 falso)', () => {
        expect(() => logAction({ role: 'Admin' }, validAction)).toThrow();
    });

    test('TU-AU-12 | logAction com user sem role → lança erro (C1 falso)', () => {
        expect(() => logAction({ id: 'u-001' }, validAction)).toThrow();
    });

    test('TU-AU-13 | logAction com action vazia → lança erro (C2 falso)', () => {
        expect(() => logAction(validUser, '')).toThrow();
    });

    test('TU-AU-14 | logAction com ação não auditável → lança erro (C3 falso)', () => {
        expect(() => logAction(validUser, 'list_plans')).toThrow();
    });

    test('TU-AU-15 | logAction com meta → meta preservada na entrada', () => {
        const entry = logAction(validUser, validAction, { planId: 'plan-99' });
        expect(entry.meta.planId).toBe('plan-99');
    });

    // getAuditLogs ────────────────────────────────────────────────────────────

    test('TU-AU-16 | getAuditLogs sem filtros → retorna todas as entradas', () => {
        logAction(validUser, 'created_plan');
        logAction(validUser, 'deleted_plan');
        expect(getAuditLogs()).toHaveLength(2);
    });

    test('TU-AU-17 | getAuditLogs com filtro userId → apenas entradas do utilizador', () => {
        logAction(validUser, 'created_plan');
        logAction({ id: 'u-002', role: 'Technical Manager' }, 'updated_plan');
        const results = getAuditLogs({ userId: 'u-001' });
        expect(results).toHaveLength(1);
        expect(results[0].userId).toBe('u-001');
    });

    test('TU-AU-18 | getAuditLogs com filtro action → apenas entradas com essa ação', () => {
        logAction(validUser, 'created_plan');
        logAction(validUser, 'deleted_plan');
        const results = getAuditLogs({ action: 'created_plan' });
        expect(results).toHaveLength(1);
        expect(results[0].action).toBe('created_plan');
    });

    test('TU-AU-19 | getAuditLogs com filtro sem correspondência → array vazio', () => {
        logAction(validUser, 'created_plan');
        expect(getAuditLogs({ userId: 'nao-existe' })).toHaveLength(0);
    });

    test('TU-AU-20 | logAction múltiplas ações → log acumula corretamente', () => {
        const actions = ['created_plan', 'updated_plan', 'deleted_plan'];
        actions.forEach(a => logAction(validUser, a));
        expect(auditLogs).toHaveLength(3);
    });
});

// =============================================================================
// SUITE 6 — automationService
// =============================================================================

describe('automationService', () => {

    const techManager = { role: 'Technical Manager' };
    const admin       = { role: 'Admin' };
    const viewer      = { role: 'Viewer' };

    // switchMode ──────────────────────────────────────────────────────────────

    test('TU-AM-01 | Technical Manager pode mudar para Automatic', () => {
        expect(switchMode('Manual', 'Automatic', techManager)).toBe('Automatic');
    });

    test('TU-AM-02 | Admin pode mudar para Automatic', () => {
        expect(switchMode('Manual', 'Automatic', admin)).toBe('Automatic');
    });

    test('TU-AM-03 | Viewer não pode mudar para Automatic → lança erro', () => {
        expect(() => switchMode('Manual', 'Automatic', viewer)).toThrow('Unauthorized');
    });

    test('TU-AM-04 | Qualquer utilizador pode mudar para Manual', () => {
        expect(switchMode('Automatic', 'Manual', viewer)).toBe('Manual');
    });

    test('TU-AM-05 | Modo inválido → lança erro', () => {
        expect(() => switchMode('Manual', 'Turbo', techManager)).toThrow('Invalid mode');
    });

    test('TU-AM-06 | Mudar para o mesmo modo (Manual → Manual) → aceite', () => {
        expect(switchMode('Manual', 'Manual', viewer)).toBe('Manual');
    });

    // decideAction ────────────────────────────────────────────────────────────

    test('TU-AM-07 | Automatic + regra ativa → execute', () => {
        expect(decideAction('Automatic', true, {})).toBe('execute');
    });

    test('TU-AM-08 | Automatic + regra inativa → suggest', () => {
        expect(decideAction('Automatic', false, {})).toBe('suggest');
    });

    test('TU-AM-09 | Manual + regra ativa → suggest', () => {
        expect(decideAction('Manual', true, {})).toBe('suggest');
    });

    test('TU-AM-10 | Manual + regra inativa → suggest', () => {
        expect(decideAction('Manual', false, {})).toBe('suggest');
    });

    test('TU-AM-11 | Automatic + ruleActive=null (falsy) → suggest', () => {
        expect(decideAction('Automatic', null, {})).toBe('suggest');
    });

    test('TU-AM-12 | Modo desconhecido + regra ativa → suggest (não é Automatic)', () => {
        expect(decideAction('Unknown', true, {})).toBe('suggest');
    });
});