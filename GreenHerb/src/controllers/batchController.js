'use strict';

const { transitionBatch } = require('../services/batchService');

const batches = [];
let nextId = 1;

exports._store = batches; // exposto para reset nos testes

exports.createBatch = (req, res) => {
    const { herbId, planId, losses } = req.body || {};

    if (!herbId || !planId) {
        return res.status(400).json({ error: 'herbId e planId são obrigatórios.' });
    }

    const batch = {
        id:            nextId++,
        herbId,
        planId,
        state:         'active',
        losses:        losses !== undefined ? Number(losses) : 0,
        justification: '',
        createdAt:     new Date().toISOString(),
    };

    batches.push(batch);
    return res.status(201).json(batch);
};

exports.getAllBatches = (req, res) => {
    return res.status(200).json(batches);
};

exports.getBatchesByFilter = (req, res) => {
    const { state } = req.query;
    const result = state ? batches.filter(b => b.state === state) : [...batches];
    return res.status(200).json(result);
};

exports.getBatchById = (req, res) => {
    const batch = batches.find(b => b.id === Number(req.params.id));
    if (!batch) return res.status(404).json({ error: 'Lote não encontrado.' });
    return res.status(200).json(batch);
};

exports.transitionBatch = (req, res) => {
    const batch = batches.find(b => b.id === Number(req.params.id));
    if (!batch) return res.status(404).json({ error: 'Lote não encontrado.' });

    const { targetState, justification } = req.body || {};
    const user = req.user;

    try {
        const updated = transitionBatch(batch, user, targetState, justification);
        Object.assign(batch, updated);
        return res.status(200).json(batch);
    } catch (err) {
        const status = err.message.includes('Unauthorized') ? 403 : 422;
        return res.status(status).json({ error: err.message });
    }
};
