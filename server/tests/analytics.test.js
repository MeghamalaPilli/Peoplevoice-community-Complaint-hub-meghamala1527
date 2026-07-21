const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../index');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

beforeEach(async () => {
  await User.deleteMany({});
  await Complaint.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/analytics', () => {
  it('allows president users to access a limited analytics view', async () => {
    const president = await request(app).post('/api/auth/register').send({
      name: 'President User',
      email: 'president@example.com',
      password: 'password123',
      role: 'president'
    });

    const res = await request(app)
      .get('/api/analytics/monthly')
      .set('Authorization', `Bearer ${president.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(6);
  });
});
