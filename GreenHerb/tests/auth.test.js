const request = require('supertest');
const app = require('../src/app');

describe('Testes de autenticação', () => {

    test('Login válido deve devolver token', async () => {

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'admin',
                password: '123456'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    test('Username inválido deve devolver 401', async () => {

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'erro',
                password: '123456'
            });

        expect(response.statusCode).toBe(401);
    });

    test('Password inválida deve devolver 401', async () => {

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'admin',
                password: 'errada'
            });

        expect(response.statusCode).toBe(401);
    });

    test('Campos vazios devem devolver 400', async () => {

        const response = await request(app)
            .post('/auth/login')
            .send({});

        expect(response.statusCode).toBe(400);
    });
});
