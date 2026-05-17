// src/routes/auditRoutes.js
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { validateUserRole } = require('../services/userService');

// Middleware para validar roles (apenas Admin pode ver logs de auditoria)
const checkAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (!validateUserRole(user, 'Admin')) {
            return res.status(403).json({ error: 'Unauthorized: Only Admin can access audit logs.' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};

// Criar um novo log de auditoria (qualquer utilizador autenticado)
router.post('/', auditController.createAuditLog);

// Obter todos os logs de auditoria (apenas Admin)
router.get('/', checkAdmin, auditController.getAllAuditLogs);

// Obter logs de auditoria por filtro (apenas Admin)
router.get('/filter', checkAdmin, auditController.getAuditLogsByFilter);

module.exports = router;