'use strict';

const { logAction, getAuditLogs, isAuditable } = require('../services/auditService');

exports.createAuditLog = (req, res) => {
    const { action, meta } = req.body || {};
    const user = req.user;

    try {
        const entry = logAction(user, action, meta || {});
        return res.status(201).json(entry);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

exports.getAllAuditLogs = (req, res) => {
    const logs = getAuditLogs();
    return res.status(200).json(logs);
};

exports.getAuditLogsByFilter = (req, res) => {
    const { userId, action } = req.query;
    const filters = {};
    if (userId !== undefined) filters.userId = Number(userId);
    if (action  !== undefined) filters.action = action;

    const logs = getAuditLogs(filters);
    return res.status(200).json(logs);
};
