const request = require('supertest');
const app = require('../src/app');
const { connect, clearDB, closeDB } = require('./setup');

beforeAll(async () => await connect());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

describe('Auth API', () => {
  const userData = {
    full_name: 'Test User',
    email: 'test@example.com',
    phone: '0123456789',
    password: 'password123',
    role: 'customer'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userData.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should fail with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(userData);
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(userData);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(userData.email);
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return profile with valid token', async () => {
      await request(app).post('/api/auth/register').send(userData);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userData.email);
    });
  });
});
