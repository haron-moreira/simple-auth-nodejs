// __tests__/auth.test.js
const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const TokenModel = require('../src/models/Token.model');
const UserModel = require('../src/models/User.model');
const PlatformModel = require('../src/models/Platform.model');

// Mock user para os testes
const mockUser = {
    id: 1,
    id_user: 1,
    username: 'kakashi',
    password_hash: '$2b$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg', // hash fictício
    profile: 'admin',
    status: 'active',
    first_name: 'Kakashi',
    last_name: 'Hatake',
    role: 'sensei',
    dt_created: new Date(),
    dt_last_update: new Date(),
    main_origin: 'leaf',
    uuid: 'some-uuid'
};

jest.mock('bcrypt', () => ({
    compare: jest.fn(() => true)
}));


jest.mock('../src/models/User.model');
jest.mock('../src/models/Token.model');
jest.mock('../src/models/Platform.model');




// Mocks comuns
beforeEach(() => {
    PlatformModel.userHasAccessToPlatform.mockResolvedValue(true);
    UserModel.findByUsername.mockResolvedValue(mockUser);
    TokenModel.storeRefreshToken.mockResolvedValue(true);
    TokenModel.deleteAllTokensForUser.mockResolvedValue(true);
    TokenModel.findRefreshToken.mockResolvedValue({
        token: 'existing-refresh-token',
        user_id: mockUser.id_user,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });
    TokenModel.deleteRefreshToken.mockResolvedValue(true);
});

describe('Kakashi Auth - Login e Token', () => {
    it('deve autenticar com sucesso via /auth/surf/api/v3/login', async () => {
        const res = await request(app)
            .post('/auth/surf/api/v3/login')
            .send({ username: 'kakashi', password: 'senhaincorreta' });

        expect(res.statusCode).toBe(200);
        expect(res.body.information.token).toBeDefined();
        expect(res.body.information.refreshToken).toBeDefined();

    });

    it('deve validar o token corretamente via /token/validate', async () => {
        const token = jwt.sign({ id: mockUser.id_user }, process.env.JWT_SECRET || 'kakashi-secret');

        const res = await request(app)
            .get('/token/surf/api/v3/validate')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/valid/i);
    });

    it('deve renovar o token via /auth/surf/api/v3/refresh', async () => {
        const res = await request(app)
            .post('/auth/surf/api/v3/refresh')
            .set('Cookie', ['refresh_token=existing-refresh-token']);

        expect(res.statusCode).toBe(200);
        expect(res.body.information).toHaveProperty('message');
    });
});


describe('Kakashi Auth - Casos de erro', () => {

    it('deve retornar 400 se username ou password estiverem ausentes', async () => {
        const res = await request(app)
            .post('/auth/surf/api/v3/login')
            .send({ username: 'kakashi' }); // sem password

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('deve retornar 401 se usuário não existir', async () => {
        UserModel.findByUsername.mockResolvedValueOnce(null); // simula usuário inexistente

        const res = await request(app)
            .post('/auth/surf/api/v3/login')
            .send({ username: 'inexistente', password: 'senha' });

        expect(res.statusCode).toBe(401);
    });

    it('deve retornar 401 se senha estiver incorreta', async () => {
        const bcrypt = require('bcrypt');
        bcrypt.compare.mockResolvedValueOnce(false); // simula falha de senha

        const res = await request(app)
            .post('/auth/surf/api/v3/login')
            .send({ username: 'kakashi', password: 'errada' });

        expect(res.statusCode).toBe(401);
    });

    it('deve retornar 403 se usuário não tiver acesso à plataforma', async () => {
        PlatformModel.userHasAccessToPlatform.mockResolvedValueOnce(false);

        const res = await request(app)
            .post('/auth/surf/api/v3/login')
            .send({ username: 'kakashi', password: 'certa' });

        expect(res.statusCode).toBe(403);
    });

    it('deve retornar 400 se não houver refresh_token no cookie', async () => {
        const res = await request(app)
            .post('/auth/surf/api/v3/refresh'); // sem cookie

        expect(res.statusCode).toBe(400);
    });

    it('deve retornar 401 se refresh_token for inválido ou expirado', async () => {
        TokenModel.findRefreshToken.mockResolvedValueOnce(null); // token não encontrado

        const res = await request(app)
            .post('/auth/surf/api/v3/refresh')
            .set('Cookie', ['refresh_token=token-invalido']);

        expect(res.statusCode).toBe(401);
    });

    it('deve retornar 500 se falhar ao salvar o refresh_token', async () => {
        TokenModel.storeRefreshToken.mockResolvedValueOnce(false); // simula erro no insert

        const res = await request(app)
            .post('/auth/surf/api/v3/login')
            .send({ username: 'kakashi', password: 'senhaincorreta' });

        expect(res.statusCode).toBe(500);
    });

});
