// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUserRole } = require('../services/userService');

// Middleware para validar roles
const checkRole = (requiredRoles) => (req, res, next) => {
    try {
        const user = req.user; // Assumindo que o middleware de autenticação define req.user
        if (!validateUserRole(user, requiredRoles)) {
            return res.status(403).json({ error: 'Unauthorized: Insufficient permissions.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ error: error.message });
    }
};

// Criar um novo utilizador (Admin ou Technical Manager)
router.post('/', checkRole(['Admin', 'Technical Manager']), userController.createUser);

// Obter todos os utilizadores (Admin)
router.get('/', checkRole(['Admin']), userController.getAllUsers);

// Obter um utilizador por ID (Admin ou Technical Manager)
router.get('/:id', checkRole(['Admin', 'Technical Manager']), userController.getUserById);

// Atualizar um utilizador (Admin)
router.put('/:id', checkRole(['Admin']), userController.updateUser);

// Eliminar um utilizador (Admin)
router.delete('/:id', checkRole(['Admin']), userController.deleteUser);

module.exports = router;