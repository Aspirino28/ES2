function switchMode(currentMode, newMode, user) {
    const validModes = ['Manual', 'Automatic'];
    if (!validModes.includes(newMode)) {
        throw new Error('Invalid mode. Use "Manual" or "Automatic".');
    }

    if (newMode === 'Automatic' && !['Technical Manager', 'Admin'].includes(user.role)) {
        throw new Error('Unauthorized: Only Technical Manager or Admin can switch to Automatic mode.');
    }

    return newMode;
}

function decideAction(mode, ruleActive, measurement) {
    if (mode === 'Automatic' && ruleActive) {
        return 'execute';
    } else {
        return 'suggest';
    }
}

module.exports = { switchMode, decideAction };