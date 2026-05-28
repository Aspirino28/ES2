'use strict';

const express = require('express');
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes   = require('./routes/authroutes');
const alertRoutes  = require('./routes/alertRoutes');
const auditRoutes  = require('./routes/auditRoutes');
const batchRoutes  = require('./routes/batchRoutes');
const userRoutes   = require('./routes/userRoutes');

const app = express();

app.use(express.json());

// Rota pública — não exige JWT
app.use('/auth', authRoutes);

// Rotas protegidas — authMiddleware aplicado individualmente por router
app.use('/alerts',  authMiddleware, alertRoutes);
app.use('/audit',   authMiddleware, auditRoutes);
app.use('/batches', authMiddleware, batchRoutes);
app.use('/users',   authMiddleware, userRoutes);

module.exports = app;