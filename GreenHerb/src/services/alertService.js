function classifyAlert(temperature, humidity, sensorOK, limits) {
    if (!sensorOK) {
        return 'Informative';
    }

    const tempOutOfRange = temperature > limits.maxTemp || temperature < limits.minTemp;
    const humidityOutOfRange = humidity > limits.maxHumidity || humidity < limits.minHumidity;

    if (tempOutOfRange && humidityOutOfRange) {
        return 'Critical';
    } else if (tempOutOfRange || humidityOutOfRange) {
        return 'Warning';
    } else {
        return 'Informative';
    }
}

function resolveAlert(alert, action, justification) {
    if (action === 'ignore') {
        if (!justification || justification.length < 10 || justification.length > 500) {
            throw new Error('Justification must be between 10 and 500 characters');
        }
        alert.status = 'ignored';
        alert.justification = justification;
    } else if (action === 'resolve') {
        alert.status = 'resolved';
        alert.justification = justification || null;
    } else {
        throw new Error('Invalid action. Use "resolve" or "ignore".');
    }
    return alert;
}

module.exports = { classifyAlert, resolveAlert };