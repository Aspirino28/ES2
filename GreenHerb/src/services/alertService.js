/**
 * ============================================================
 * GREENHERB — Alert Service
 * ============================================================
 *
 * Exporta:
 *   classifyAlert(temp, humidity, sensorOK, limits) → 'Informative' | 'Warning' | 'Critical'
 *   resolveAlert(alert, action, justification)       → alert (mutado)
 *
 * NOTA (DEF-01): resolveAlert muta diretamente o objeto `alert` recebido,
 * retornando a mesma referência. Este comportamento está documentado nos
 * testes TU-RA-24, TU-RA-25 e TU-RA-25b como defeito conhecido.
 * Correção sugerida: return { ...alert, status: '...', justification: ... };
 * ============================================================
 */

'use strict';

// ---------------------------------------------------------------------------
// classifyAlert
// ---------------------------------------------------------------------------

/**
 * Classifica um alerta com base nos valores ambientais e no estado do sensor.
 *
 * Lógica:
 *   - Se o sensor não está operacional (sensorOK = false) → 'Informative'
 *   - Se ambos temp e humidity estão dentro dos limites    → 'Informative'
 *   - Se apenas um dos dois está fora dos limites          → 'Warning'
 *   - Se ambos estão fora dos limites                      → 'Critical'
 *
 * Os limites são inclusivos: [minTemp, maxTemp] e [minHumidity, maxHumidity].
 *
 * @param {number}  temp      - Temperatura lida pelo sensor.
 * @param {number}  humidity  - Humidade lida pelo sensor.
 * @param {boolean} sensorOK  - Indica se o sensor está operacional.
 * @param {{maxTemp: number, minTemp: number, maxHumidity: number, minHumidity: number}} limits
 * @returns {'Informative' | 'Warning' | 'Critical'}
 */
function classifyAlert(temp, humidity, sensorOK, limits) {
    if (!sensorOK) {
        return 'Informative';
    }

    const { maxTemp, minTemp, maxHumidity, minHumidity } = limits;

    const tempOK     = temp     >= minTemp     && temp     <= maxTemp;
    const humidityOK = humidity >= minHumidity && humidity <= maxHumidity;

    if (tempOK && humidityOK) {
        return 'Informative';
    }

    if (!tempOK && !humidityOK) {
        return 'Critical';
    }

    return 'Warning';
}

// ---------------------------------------------------------------------------
// resolveAlert
// ---------------------------------------------------------------------------

/**
 * Resolve ou ignora um alerta existente.
 *
 * Ações suportadas (case-sensitive):
 *   'resolve' — marca o alerta como resolvido; justificação é opcional.
 *               Se a justificação for falsy ('' | undefined | null), é
 *               armazenada como null; caso contrário é preservada.
 *   'ignore'  — marca o alerta como ignorado; justificação obrigatória
 *               com comprimento entre 10 e 500 caracteres (inclusivo).
 *
 * ⚠ DEF-01: a função muta o objeto `alert` recebido e retorna a mesma
 *   referência (não cria uma cópia).
 *
 * @param {{ type: string, status: string }} alert         - Objeto de alerta a processar.
 * @param {'resolve' | 'ignore'}             action        - Ação a executar.
 * @param {string | undefined}               justification - Texto de justificação.
 * @returns {typeof alert} O mesmo objeto `alert`, mutado.
 * @throws {Error} Se a ação for inválida ou se a justificação não cumprir os requisitos.
 */
function resolveAlert(alert, action, justification) {
    if (action !== 'resolve' && action !== 'ignore') {
        throw new Error('Invalid action. Use "resolve" or "ignore".');
    }

    if (action === 'ignore') {
        const len = justification ? justification.length : 0;
        if (len < 10 || len > 500) {
            throw new Error('Justification must be between 10 and 500 characters');
        }

        alert.status        = 'ignored';
        alert.justification = justification;
        return alert;
    }

    // action === 'resolve'
    alert.status        = 'resolved';
    alert.justification = justification || null;
    return alert;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = { classifyAlert, resolveAlert };