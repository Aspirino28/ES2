/**
 * ============================================================
 * GREENHERB — Temperature Gateway
 * ============================================================
 *
 * Gateway responsável pela obtenção automática de leituras de
 * temperatura e humidade a partir de sensores físicos da estufa.
 *
 * Em produção, esta classe comunica com o hardware (ex: API REST
 * do controlador de sensores, MQTT broker, ou base de dados de
 * séries temporais).
 *
 * Em testes, este gateway é substituído por um STUB que retorna
 * valores controlados, sem depender de hardware real ou rede.
 *
 * Justificação da escolha do duplo:
 *   → STUB: a medição de temperatura é um processo automático e
 *     de leitura passiva. O teste precisa controlar os valores
 *     devolvidos (simular temperatura dentro/fora dos limites),
 *     mas NÃO precisa verificar se o gateway foi chamado.
 *     O stub é mais simples e adequado que o mock para este caso.
 * ============================================================
 */

class TemperatureGateway {
    /**
     * Obtém a leitura mais recente do sensor de temperatura.
     *
     * @param {string} sensorId - Identificador do sensor físico.
     * @returns {Promise<{ temperature: number, humidity: number, sensorOK: boolean, timestamp: string }>}
     */
    async getLatestReading(sensorId) {
        // Em produção: chamada HTTP/MQTT ao hardware real
        throw new Error(
            'TemperatureGateway.getLatestReading: produção não implementada neste contexto de teste.'
        );
    }

    /**
     * Verifica se o sensor está operacional.
     *
     * @param {string} sensorId
     * @returns {Promise<boolean>}
     */
    async isSensorHealthy(sensorId) {
        throw new Error(
            'TemperatureGateway.isSensorHealthy: produção não implementada neste contexto de teste.'
        );
    }
}

module.exports = { TemperatureGateway };