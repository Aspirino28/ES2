'use strict';

const { validateUserRole, VALID_ROLES } = require('../services/userService');

// In-memory store (replica dos utilizadores conhecidos pelo sistema)
const users = [
    { id: 1, username: 'admin',   role: 'Admin' },
    { id: 2, username: 'manager', role: 'Technical Manager' },
    { id: 3, username: 'tech',    role: 'Technician' },
];
let nextId = 4;

exports._store = users; // exposto para testes (reset)

exports.createUser = (req, res) => {
    const { username, role } = req.body || {};

    if (!username || !role) {
        return res.status(400).json({ error: 'username e role são obrigatórios.' });
    }

    if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `Role inválido: ${role}` });
    }

    const exists = users.find(u => u.username === username);
    if (exists) {
        return res.status(409).json({ error: 'Username já existe.' });
    }

    const user = { id: nextId++, username, role };
    users.push(user);
    return res.status(201).json(user);
};

exports.getAllUsers = (req, res) => {
    return res.status(200).json(users);
};

exports.getUserById = (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    return res.status(200).json(user);
};

exports.updateUser = (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    const { role } = req.body || {};
    if (role && !VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `Role inválido: ${role}` });
    }

    if (role) user.role = role;
    return res.status(200).json(user);
};

exports.deleteUser = (req, res) => {
    const idx = users.findIndex(u => u.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Utilizador não encontrado.' });

    users.splice(idx, 1);
    return res.status(204).send();
};
