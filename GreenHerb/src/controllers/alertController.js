'use strict';

const { classifyAlert, resolveAlert } = require('../services/alertService');

const alerts = [];
let nextId = 1;

exports._store = alerts; // exposto para reset nos testes

exports.createAlert = (req, res) => {
    const { temp, humidity, sensorOK, limits } = req.body || {};

    if (temp === undefined || humidity === undefined || sensorOK === undefined || !limits) {
        return res.status(400).json({ error: 'temp, humidity, sensorOK e limits são obrigatórios.' });
    }

    const classification = classifyAlert(temp, humidity, sensorOK, limits);
    const alert = {
        id:            nextId++,
        temp,
        humidity,
        sensorOK,
        limits,
        classification,
        status:        'pending',
        justification: null,
        createdAt:     new Date().toISOString(),
    };

    alerts.push(alert);
    return res.status(201).json(alert);
};

exports.getAllAlerts = (req, res) => {
    return res.status(200).json(alerts);
};

exports.getAlertsByFilter = (req, res) => {
    const { status, classification } = req.query;
    let result = [...alerts];
    if (status)         result = result.filter(a => a.status === status);
    if (classification) result = result.filter(a => a.classification === classification);
    return res.status(200).json(result);
};

exports.resolveOrIgnoreAlert = (req, res) => {
    const alert = alerts.find(a => a.id === Number(req.params.id));
    if (!alert) return res.status(404).json({ error: 'Alerta não encontrado.' });

    const { action, justification } = req.body || {};

    try {
        resolveAlert(alert, action, justification);
        return res.status(200).json(alert);
    } catch (err) {
        return res.status(422).json({ error: err.message });
    }
};
