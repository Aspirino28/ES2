let auditLogs = [];

function logAction(user, action) {
    if (!user || !action) {
        throw new Error('User and action are required for audit logging.');
    }

    const logEntry = {
        userId: user.id,
        userRole: user.role,
        action: action,
        timestamp: new Date().toISOString(),
    };

    auditLogs.push(logEntry);
    return logEntry;
}

function isAuditable(action) {
    const nonAuditableActions = ['GET', 'fetch', 'read'];
    return !nonAuditableActions.includes(action);
}

module.exports = { logAction, isAuditable, auditLogs };