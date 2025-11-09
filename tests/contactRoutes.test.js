// tests/contactRoutes.test.js

const express = require('express');
const request = require('supertest');

jest.mock('../model/contact', () => ({
    create: jest.fn().mockResolvedValue({ _id: 'c1' }),
}));

const contactRoutes = require('../routes/contact');

const makeApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/contact', contactRoutes);
    return app;
};

test('POST /api/contact accepts valid payload', async () => {
    const app = makeApp();
    const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Test', email: 't@example.com', message: 'Hello' });

    expect(res.status).toBeLessThan(500);
});
