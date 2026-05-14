'use strict';

/**
 * Validador isolado das credenciais de login.
 *
 * Mantido sem dependências externas (BD, rede, bcrypt, jwt) para permitir
 * testes unitários puros conforme as pré-condições dos casos TU-04 a TU-15.
 */

const USERNAME_MAX_LENGTH = 30;
const USERNAME_MIN_LENGTH = 1;

// Padrões simples de injeção (SQL / NoSQL básicos). Usado pelo TU-13.
const INJECTION_PATTERNS = [
    /('|").*(\s+OR\s+|\s+AND\s+).*('|"|=)/i, // ' OR '1'='1
    /(--|;|\/\*|\*\/)/,                       // comentários SQL / terminadores
    /\b(DROP|INSERT|UPDATE|DELETE|SELECT|UNION)\b/i,
    /(\$where|\$ne|\$gt|\$lt)/i               // operadores NoSQL
];

function containsInjection(value) {
    if (typeof value !== 'string') return false;
    return INJECTION_PATTERNS.some(re => re.test(value));
}

/**
 * Valida o body recebido no login.
 *
 * @param {object|null|undefined} body
 * @returns {{ valid: boolean, status?: number, message?: string }}
 */
function validateLoginInput(body) {
    // TU-11: body inexistente / não-objeto => JSON inválido
    if (body === null || body === undefined || typeof body !== 'object' || Array.isArray(body)) {
        return { valid: false, status: 400, message: 'JSON inválido' };
    }

    const hasUsernameKey = Object.prototype.hasOwnProperty.call(body, 'username');
    const hasPasswordKey = Object.prototype.hasOwnProperty.call(body, 'password');

    // TU-04: body completamente vazio
    if (!hasUsernameKey && !hasPasswordKey) {
        return { valid: false, status: 400, message: 'Dados em falta' };
    }

    // TU-09: ausência da chave username
    if (!hasUsernameKey) {
        return { valid: false, status: 400, message: 'Campo obrigatório: username' };
    }

    // TU-10: ausência da chave password
    if (!hasPasswordKey) {
        return { valid: false, status: 400, message: 'Campo obrigatório: password' };
    }

    const { username, password } = body;

    // TU-05: username = null
    if (username === null) {
        return { valid: false, status: 400, message: 'Username inválido' };
    }

    // TU-06: password = null
    if (password === null) {
        return { valid: false, status: 400, message: 'Password inválida' };
    }

    // Tipos inválidos (não-string)
    if (typeof username !== 'string') {
        return { valid: false, status: 400, message: 'Username inválido' };
    }
    if (typeof password !== 'string') {
        return { valid: false, status: 400, message: 'Password inválida' };
    }

    // TU-07 e TU-08 e TU-12: strings vazias
    if (username.length === 0 || password.length === 0) {
        return { valid: false, status: 400, message: 'Campos obrigatórios inválidos' };
    }

    // TU-15: comprimento máximo de username
    // (o limite mínimo é coberto pelo check de string vazia acima)
    if (username.length > USERNAME_MAX_LENGTH) {
        return { valid: false, status: 400, message: 'Input inválido: username demasiado longo' };
    }

    // TU-13: tentativa de injeção
    if (containsInjection(username) || containsInjection(password)) {
        return { valid: false, status: 400, message: 'Input inválido' };
    }

    return { valid: true };
}

module.exports = {
    validateLoginInput,
    containsInjection,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH
};