const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimiter = require('../utils/rateLimiter');

const users = [
    {
        id: 1,
        username: 'admin',
        password: bcrypt.hashSync('123456', 10),
        role: 'Administrador'
    }
];

function _getIdentifier(req) {
    if (req && req.body && typeof req.body === 'object' && typeof req.body.username === 'string' && req.body.username) {
        return req.body.username;
    }

    if (req && req.ip) {
        return req.ip;
    }

    return 'unknown';
}

exports._getIdentifier = _getIdentifier;

exports.login = async (req, res) => {
    const identifier = _getIdentifier(req);

    if (rateLimiter.isBlocked(identifier)) {
        return res.status(429).json({
            message: 'Demasiadas tentativas'
        });
    }

    if (!req || !req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            message: 'JSON inválido'
        });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        const attempts = rateLimiter.registerAttempt(identifier);

        if (attempts > rateLimiter.DEFAULT_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: 'Demasiadas tentativas'
            });
        }

        return res.status(400).json({
            message: 'Dados obrigatórios'
        });
    }

    const user = users.find(u => u.username === username);

    if (!user) {
        const attempts = rateLimiter.registerAttempt(identifier);

        if (attempts > rateLimiter.DEFAULT_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: 'Demasiadas tentativas'
            });
        }

        return res.status(401).json({
            message: 'Credenciais inválidas'
        });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        const attempts = rateLimiter.registerAttempt(identifier);

        if (attempts > rateLimiter.DEFAULT_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: 'Demasiadas tentativas'
            });
        }

        return res.status(401).json({
            message: 'Credenciais inválidas'
        });
    }

    rateLimiter.reset(identifier);

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET || 'segredo',
        {
            expiresIn: '1h'
        }
    );

    return res.status(200).json({
        token
    });
};