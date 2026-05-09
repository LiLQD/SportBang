const request = require('supertest');
const app = require('../src/app');
const { connect, clearDB, closeDB } = require('./setup');

beforeAll(async () => await connect());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

// Helpers
const registerAndLogin = async (overrides = {}) => {
  const data = {
    full_name: 'Test User',
    email: 'user@example.com',
    phone: '0123456789',
    password: 'password123',
    role: 'customer',
    ...overrides
  };
  await request(app).post('/api/auth/register').send(data);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: data.email, password: data.password });
  return res.body.data.token;
};

const createFieldAsOwner = async () => {
  const ownerToken = await registerAndLogin({ email: 'owner@example.com', role: 'owner' });
  const res = await request(app)
    .post('/api/fields')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      field_name: 'Test Field',
      address: '123 Test Street',
      field_type: 'football',
      price_per_hour: 200000,
      available_time: [
        { start: '06:00', end: '12:00' },
        { start: '14:00', end: '22:00' }
      ]
    });
  return { ownerToken, field: res.body.data };
};

// Future date (7 days from now) to ensure cancel works
const getFutureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

// Tomorrow's date (within 24 hours)
const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // Set to very early morning so it's within 24h
  return d.toISOString().split('T')[0];
};

describe('Booking API', () => {
  describe('POST /api/bookings', () => {
    it('customer should create a booking', async () => {
      const { field } = await createFieldAsOwner();
      const customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          field_id: field._id,
          booking_date: getFutureDate(),
          booking_slot: { start: '06:00', end: '08:00' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
      expect(res.body.data.total_price).toBe(400000); // 2h * 200000
    });

    it('should prevent double booking', async () => {
      const { field } = await createFieldAsOwner();
      const customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });
      const bookingData = {
        field_id: field._id,
        booking_date: getFutureDate(),
        booking_slot: { start: '06:00', end: '08:00' }
      };

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid slot (outside available time)', async () => {
      const { field } = await createFieldAsOwner();
      const customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          field_id: field._id,
          booking_date: getFutureDate(),
          booking_slot: { start: '12:00', end: '14:00' } // gap between available slots
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    it('should cancel booking more than 1 day in advance', async () => {
      const { field } = await createFieldAsOwner();
      const customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });

      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          field_id: field._id,
          booking_date: getFutureDate(),
          booking_slot: { start: '06:00', end: '08:00' }
        });
      const bookingId = bookingRes.body.data._id;

      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should fail to cancel booking within 1 day', async () => {
      const { field } = await createFieldAsOwner();
      const customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });

      // Book for a slot early tomorrow (within 24h from now)
      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          field_id: field._id,
          booking_date: getTomorrowDate(),
          booking_slot: { start: '06:00', end: '08:00' }
        });
      const bookingId = bookingRes.body.data._id;

      const res = await request(app)
        .patch(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Cancelled booking releases slot', () => {
    it('should allow rebooking a cancelled slot', async () => {
      const { field } = await createFieldAsOwner();
      const customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });
      const bookingData = {
        field_id: field._id,
        booking_date: getFutureDate(),
        booking_slot: { start: '14:00', end: '16:00' }
      };

      // Book
      const bookingRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData);

      // Cancel
      await request(app)
        .patch(`/api/bookings/${bookingRes.body.data._id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      // Rebook same slot
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(bookingData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
