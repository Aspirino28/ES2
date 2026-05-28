/**
 * ============================================================
 * GREENHERB — Notification Gateway
 * ============================================================
 *
 * Gateway responsável pelo envio de notificações (email, SMS,
 * push) aos utilizadores da plataforma GREENHERB.
 *
 * Em produção, comunica com serviços externos (ex: SendGrid,
 * Twilio, Firebase Cloud Messaging).
 *
 * Em testes, este gateway é substituído por um MOCK que verifica
 * se as notificações foram enviadas corretamente, com os
 * parâmetros esperados.
 *
 * Justificação da escolha do duplo:
 *   → MOCK: ao contrário do stub de temperatura (leitura passiva),
 *     o envio de notificações é um EFEITO LATERAL observável.
 *     O teste deve verificar não só que a lógica funciona, mas
 *     também que o gateway foi chamado com os argumentos corretos
 *     (destinatário, tipo de alerta, mensagem). O mock é o duplo
 *     adequado para verificar estas interações.
 * ============================================================
 */

class NotificationGateway {
    /**
     * Envia uma notificação a um utilizador.
     *
     * @param {object} notification
     * @param {string} notification.recipientId   - ID do utilizador destinatário.
     * @param {string} notification.recipientEmail - Email do destinatário.
     * @param {string} notification.channel        - 'email' | 'sms' | 'push'
     * @param {string} notification.subject        - Assunto / título da notificação.
     * @param {string} notification.body           - Corpo da mensagem.
     * @param {'Informative'|'Warning'|'Critical'} notification.alertType - Tipo do alerta.
     * @returns {Promise<{ success: boolean, messageId: string }>}
     */
    async sendNotification(notification) {
        // Em produção: chamada ao serviço externo de notificações
        throw new Error(
            'NotificationGateway.sendNotification: produção não implementada neste contexto de teste.'
        );
    }

    /**
     * Envia notificações em lote (para alertas Críticos que
     * devem notificar todos os Responsáveis Técnicos).
     *
     * @param {object[]} notifications - Array de objetos de notificação.
     * @returns {Promise<{ sent: number, failed: number }>}
     */
    async sendBulkNotification(notifications) {
        throw new Error(
            'NotificationGateway.sendBulkNotification: produção não implementada neste contexto de teste.'
        );
    }
}

module.exports = { NotificationGateway };