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
    username: 'testuser',
    password_hash: '$2b$10$examplehashhere1234567890examplehashhere1234567890abcdef', // hash fictício
    profile: 'admin',
    status: 'active',
    first_name: 'Test',
    last_name: 'User',
    role: 'admin',
    dt_created: new Date(),
    dt_last_update: new Date(),
    main_origin: 'web',
    uuid: 'test-uuid-1234'
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

describe('Simple Auth - Login e Token', () => {
    it('deve autenticar com sucesso via /auth/api/v1/login', async () => {
        const res = await request(app)
            .post('/auth/api/v1/login')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(res.statusCode).toBe(200);
        expect(res.body.information.token).toBeDefined();
        expect(res.body.information.refreshToken).toBeDefined();

    });

    it('deve validar o token corretamente via /token/validate', async () => {
        const token = jwt.sign({ id: mockUser.id_user }, process.env.JWT_SECRET || 'change-this-secret-in-production');

        const res = await request(app)
            .get('/token/api/v1/validate')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/valid/i);
    });

    it('deve renovar o token via /auth/api/v1/refresh', async () => {
        const res = await request(app)
            .post('/auth/api/v1/refresh')
            .set('Cookie', ['refresh_token=existing-refresh-token']);

        expect(res.statusCode).toBe(200);
        expect(res.body.information).toHaveProperty('message');
    });
});


describe('Simple Auth - Casos de erro', () => {

    it('deve retornar 400 se username ou password estiverem ausentes', async () => {
        const res = await request(app)
            .post('/auth/api/v1/login')
            .send({ username: 'testuser' }); // sem password

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('deve retornar 401 se usuário não existir', async () => {
        UserModel.findByUsername.mockResolvedValueOnce(null); // simula usuário inexistente

        const res = await request(app)
            .post('/auth/api/v1/login')
            .send({ username: 'inexistente', password: 'senha' });

        expect(res.statusCode).toBe(401);
    });

    it('deve retornar 401 se senha estiver incorreta', async () => {
        const bcrypt = require('bcrypt');
        bcrypt.compare.mockResolvedValueOnce(false); // simula falha de senha

        const res = await request(app)
            .post('/auth/api/v1/login')
            .send({ username: 'testuser', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
    });

    it('deve retornar 403 se usuário não tiver acesso à plataforma', async () => {
        PlatformModel.userHasAccessToPlatform.mockResolvedValueOnce(false);

        const res = await request(app)
            .post('/auth/api/v1/login')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(res.statusCode).toBe(403);
    });

    it('deve retornar 400 se não houver refresh_token no cookie', async () => {
        const res = await request(app)
            .post('/auth/api/v1/refresh'); // sem cookie

        expect(res.statusCode).toBe(400);
    });

    it('deve retornar 401 se refresh_token for inválido ou expirado', async () => {
        TokenModel.findRefreshToken.mockResolvedValueOnce(null); // token não encontrado

        const res = await request(app)
            .post('/auth/api/v1/refresh')
            .set('Cookie', ['refresh_token=token-invalido']);

        expect(res.statusCode).toBe(401);
    });

    it('deve retornar 500 se falhar ao salvar o refresh_token', async () => {
        TokenModel.storeRefreshToken.mockResolvedValueOnce(false); // simula erro no insert

        const res = await request(app)
            .post('/auth/api/v1/login')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(res.statusCode).toBe(500);
    });

});
