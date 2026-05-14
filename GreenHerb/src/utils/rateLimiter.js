'use strict';

/**
 * Rate limiter simples em memória, usado pelo login.
 *
 * Estrutura pensada para ser facilmente mockada / reiniciada nos testes
 * (TU-14). Não usa BD nem rede.
 */

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 60 * 1000;

const attempts = new Map();

function _key(identifier) {
    return String(identifier || 'unknown');
}

function registerAttempt(identifier, now = Date.now(), windowMs = DEFAULT_WINDOW_MS) {
    const key = _key(identifier);
    const entry = attempts.get(key);

    if (!entry || (now - entry.firstAttemptAt) > windowMs) {
        attempts.set(key, { count: 1, firstAttemptAt: now });
        return 1;
    }

    entry.count += 1;
    return entry.count;
}

function getAttempts(identifier) {
    const entry = attempts.get(_key(identifier));
    return entry ? entry.count : 0;
}

function isBlocked(identifier, maxAttempts = DEFAULT_MAX_ATTEMPTS) {
    return getAttempts(identifier) > maxAttempts;
}

function reset(identifier) {
    if (identifier === undefined) {
        attempts.clear();
        return;
    }
    attempts.delete(_key(identifier));
}

module.exports = {
    registerAttempt,
    getAttempts,
    isBlocked,
    reset,
    DEFAULT_MAX_ATTEMPTS,
    DEFAULT_WINDOW_MS
};