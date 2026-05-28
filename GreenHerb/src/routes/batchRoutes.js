// src/routes/batchRoutes.js
const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
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

// Criar um novo lote (Technical Manager ou Admin)
router.post('/', checkRole(['Technical Manager', 'Admin']), batchController.createBatch);

// Obter todos os lotes (qualquer utilizador autenticado)
router.get('/', batchController.getAllBatches);

// Obter lotes por filtro (qualquer utilizador autenticado)
router.get('/filter', batchController.getBatchesByFilter);

// Obter um lote por ID (qualquer utilizador autenticado)
router.get('/:id', batchController.getBatchById);

// Transição de estado de um lote (Technical Manager ou Admin)
router.patch('/:id/transition', checkRole(['Technical Manager', 'Admin']), batchController.transitionBatch);

module.exports = router;