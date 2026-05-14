const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = [
    {
        id: 1,
        username: 'admin',
        password: bcrypt.hashSync('123456', 10),
        role: 'Administrador'
    }
];

exports.login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Dados obrigatórios'
        });
    }

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({
            message: 'Utilizador inválido'
        });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return res.status(401).json({
            message: 'Password inválida'
        });
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        'segredo',
        {
            expiresIn: '1h'
        }
    );

    return res.status(200).json({
        token
    });
};