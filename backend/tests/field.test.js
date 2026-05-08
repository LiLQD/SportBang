const request = require('supertest');
const app = require('../src/app');
const { connect, clearDB, closeDB } = require('./setup');

beforeAll(async () => await connect());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

// Helper to register and login
const registerAndLogin = async (overrides = {}) => {
  const data = {
    full_name: 'Owner User',
    email: 'owner@example.com',
    phone: '0123456789',
    password: 'password123',
    role: 'owner',
    ...overrides
  };
  await request(app).post('/api/auth/register').send(data);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: data.email, password: data.password });
  return res.body.data.token;
};

const fieldData = {
  field_name: 'Test Field',
  address: '123 Test Street',
  field_type: 'football',
  description: 'A test football field',
  price_per_hour: 200000,
  available_time: [
    { start: '06:00', end: '08:00' },
    { start: '08:00', end: '10:00' }
  ]
};

describe('Field API', () => {
  describe('POST /api/fields', () => {
    it('owner should create a field', async () => {
      const token = await registerAndLogin();

      const res = await request(app)
        .post('/api/fields')
        .set('Authorization', `Bearer ${token}`)
        .send(fieldData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.field_name).toBe(fieldData.field_name);
      expect(res.body.data.available_time).toHaveLength(2);
    });

    it('customer should NOT create a field', async () => {
      const token = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });

      const res = await request(app)
        .post('/api/fields')
        .set('Authorization', `Bearer ${token}`)
        .send(fieldData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/fields/:id', () => {
    it('owner should update their field', async () => {
      const token = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/fields')
        .set('Authorization', `Bearer ${token}`)
        .send(fieldData);
      const fieldId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/fields/${fieldId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ field_name: 'Updated Field Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.field_name).toBe('Updated Field Name');
    });
  });

  describe('Slot Management', () => {
    let token, fieldId;

    beforeEach(async () => {
      token = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/fields')
        .set('Authorization', `Bearer ${token}`)
        .send(fieldData);
      fieldId = createRes.body.data._id;
    });

    it('should add a slot', async () => {
      const res = await request(app)
        .post(`/api/fields/${fieldId}/slots`)
        .set('Authorization', `Bearer ${token}`)
        .send({ start: '10:00', end: '12:00' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available_time).toHaveLength(3);
    });

    it('should fail adding overlapping slot', async () => {
      const res = await request(app)
        .post(`/api/fields/${fieldId}/slots`)
        .set('Authorization', `Bearer ${token}`)
        .send({ start: '07:00', end: '09:00' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should update a slot', async () => {
      const fieldRes = await request(app)
        .get(`/api/fields/${fieldId}`)
        .set('Authorization', `Bearer ${token}`);
      const slotId = fieldRes.body.data.available_time[0]._id;

      const res = await request(app)
        .put(`/api/fields/${fieldId}/slots/${slotId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ start: '05:00', end: '07:00' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should delete a slot', async () => {
      const fieldRes = await request(app)
        .get(`/api/fields/${fieldId}`)
        .set('Authorization', `Bearer ${token}`);
      const slotId = fieldRes.body.data.available_time[0]._id;

      const res = await request(app)
        .delete(`/api/fields/${fieldId}/slots/${slotId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.available_time).toHaveLength(1);
    });
  });
});
