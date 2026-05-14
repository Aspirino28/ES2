function transitionBatch(batch, user, newState, justification) {
    if (batch.state !== 'active') {
        throw new Error('Invalid current state');
    }

    if (newState === 'completed' && batch.losses > 0 && !justification) {
        throw new Error('Justification required for losses');
    }

    if (newState === 'compromised' && (batch.losses === 0 || !justification)) {
        throw new Error('Compromised state requires losses and justification');
    }

    if (!['Technical Manager', 'Admin'].includes(user.role)) {
        throw new Error('Unauthorized');
    }

    batch.state = newState;
    return batch;
}

module.exports = { transitionBatch };