const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const { app } = require('./index');
const User = require('./models/User');

(async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  await mongoose.connect(mongoUri);
  
  await User.deleteMany({ email: /president-test@/ });
  const registerRes = await request(app).post('/api/auth/register').send({
    name: 'President Test',
    email: 'president-test@example.com',
    password: 'password123',
    role: 'president'
  });

  const res = await request(app)
    .get('/api/analytics/monthly')
    .set('Authorization', `Bearer ${registerRes.body.token}`);

  console.log(JSON.stringify({
    status: res.status,
    success: res.body.success,
    dataLength: res.body.data?.length || 0,
    message: res.body.message
  }, null, 2));
  
  await mongoose.connection.close();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
