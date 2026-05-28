// src/routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { validateUserRole } = require('../services/userService');

// Middleware para validar roles (Technical Manager ou Admin)
const checkRole = (requiredRoles) => (req, res, next) => {
    try {
        const user = req.user;
        if (!validateUserRole(user, requiredRoles)) {
            return res.status(403).json({ error: 'Unauthorized: Insufficient permissions.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ error: error.message });
    }
};

// Criar um novo alerta (qualquer utilizador autenticado)
router.post('/', alertController.createAlert);

// Obter todos os alertas (Technical Manager ou Admin)
router.get('/', checkRole(['Technical Manager', 'Admin']), alertController.getAllAlerts);

// Obter alertas por filtro (Technical Manager ou Admin)
router.get('/filter', checkRole(['Technical Manager', 'Admin']), alertController.getAlertsByFilter);

// Resolver ou ignorar um alerta (Technical Manager ou Admin)
router.patch('/:id', checkRole(['Technical Manager', 'Admin']), alertController.resolveOrIgnoreAlert);

module.exports = router;