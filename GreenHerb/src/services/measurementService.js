/**
 * ============================================================
 * GREENHERB — Measurement Service
 * ============================================================
 *
 * Orquestra a obtenção automática de medições ambientais através
 * do TemperatureGateway e aplica a lógica de classificação de
 * alertas via alertService.
 *
 * Dependências injetadas no construtor para facilitar a
 * substituição por duplos de teste (Dependency Injection pattern).
 * ============================================================
 */

const { classifyAlert } = require('./alertService');

class MeasurementService {
    /**
     * @param {import('../gateways/temperatureGateway').TemperatureGateway} temperatureGateway
     * @param {import('../gateways/notificationGateway').NotificationGateway} notificationGateway
     */
    constructor(temperatureGateway, notificationGateway) {
        this.temperatureGateway   = temperatureGateway;
        this.notificationGateway  = notificationGateway;
    }

    /**
     * Recolhe a leitura mais recente do sensor e classifica o alerta
     * com base nos limites do plano associado ao lote.
     *
     * Se o alerta for 'Warning' ou 'Critical', dispara notificação.
     *
     * @param {string} sensorId   - ID do sensor físico.
     * @param {object} limits     - Limites do plano: { minTemp, maxTemp, minHumidity, maxHumidity }
     * @param {object} recipients - Lista de utilizadores a notificar: [{ id, email }]
     * @returns {Promise<{ reading: object, alertType: string, notificationSent: boolean }>}
     */
    async processAutomaticReading(sensorId, limits, recipients = []) {
        // 1. Obter leitura do gateway (substituído por stub nos testes)
        const reading = await this.temperatureGateway.getLatestReading(sensorId);

        // 2. Classificar o alerta com base na leitura e nos limites do plano
        const alertType = classifyAlert(
            reading.temperature,
            reading.humidity,
            reading.sensorOK,
            limits
        );

        // 3. Enviar notificação se o alerta for Warning ou Critical
        //    (substituído por mock nos testes para verificar a interação)
        let notificationSent = false;
        if (alertType === 'Warning' || alertType === 'Critical') {
            const notifications = recipients.map(r => ({
                recipientId:    r.id,
                recipientEmail: r.email,
                channel:        'email',
                subject:        `[GREENHERB] Alerta ${alertType} detetado`,
                body:           `Sensor ${sensorId}: Temp=${reading.temperature}°C, Humidade=${reading.humidity}%. Alerta: ${alertType}.`,
                alertType,
            }));

            if (notifications.length > 0) {
                await this.notificationGateway.sendBulkNotification(notifications);
                notificationSent = true;
            }
        }

        return { reading, alertType, notificationSent };
    }

    /**
     * Verifica se um sensor está operacional.
     *
     * @param {string} sensorId
     * @returns {Promise<boolean>}
     */
    async checkSensorHealth(sensorId) {
        return this.temperatureGateway.isSensorHealthy(sensorId);
    }
}

module.exports = { MeasurementService };