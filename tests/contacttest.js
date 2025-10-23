/**
 * Author: Nishant Gurung
 * User Story S14
 * Tests for contact form API endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../Server.js');
const contactModel = require('../models/contact.js');

describe('Contact Form API tests', () => {
    beforeEach(async () => {
        await contactModel.deleteAll();
    });

    afterAll(async () =>{
        await mongoose.connection.close();
    });

//first test -- successful entry of all required fields
test('POST /api/contact - should create new contact message', async () =>{
    const contactData = {
        name: 'James Doe',
        email: 'james@example.com',
        message: 'I want to sponsor the YBT league'
    };

    const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

    expect(response.body.message).toBe('Contact message sent successfully!');
    expect(response.body.id).toBeDefined();
});

//second test -- no name provided
test('POST /api/contact - should fail without name', async () => {
    const contactData = {
        email: 'james@example.com',
        message: 'This is a test message'
    };

    const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400);

    expect(response.body.error).toBe('Name, email, and message are required');
});

//third test -- no email provided
test('POST /api/contact - should fail without email', async () => {
    const contactData = {
        name: 'James Doe',
        message: 'This is a test message'
    };

    const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400);
    expect(response.body.error).toBe('Name, email, and message are required');
});

//fourth test -- no message
test('POST /api/contact - should fail without message', async () => {
    const contactData = {
        name: 'James Doe',
        email: 'james@example.com'
    };

    const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400);

    expect(response.body.error).toBe('Name, email, and message are required');
 });

//fifth test -- invalid email format
test('POST /api/contact - should fail with invalid email', async () => {
    const contactData = {
        name: 'James Doe',
        email: 'notanemail',
        message: 'This is a test message'
    };

       const response = await request(app)
           .post('/api/contact')
           .send(contactData)
           .expect(400);

       expect(response.body.error).toBe('Invalid email format');
});

//sixth test -- get all contact messages
test('GET /api/contact - should return all messages', async () => {
     // Create test messages first
    await contactModel.create({ 
        name: 'User 1', 
        email: 'user1@test.com', 
        message: 'Message 1' 
    });
    await contactModel.create({ 
        name: 'User 2', 
        email: 'user2@test.com', 
        message: 'Message 2' 
    });
    const response = await request(app)
        .get('/api/contact')
        .expect(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBeDefined();
});

//seventh test -- get single contact message by ID
test('GET /api/contact/:id - should return specific message', async () => {
    const message = await contactModel.create({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
    });
    const response = await request(app)
        .get(`/api/contact/${message._id}`)
        .expect(200);
    expect(response.body.name).toBe('Test User');
    expect(response.body.email).toBe('test@example.com');
});

//eighth test -- update message status
test('PATCH /api/contact/:id - should update message status', async () => {
    const message = await contactModel.create({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
    });
    const response = await request(app)
        .patch(`/api/contact/${message._id}`)
        .send({ status: 'read' })
        .expect(200);
    expect(response.body.message).toBe('Status updated successfully');
    expect(response.body.data.status).toBe('read');
});

//ninth test -- delete contact message
test('DELETE /api/contact/:id - should delete message', async () => {
    const message = await contactModel.create({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
    });
    await request(app)
        .delete(`/api/contact/${message._id}`)
        .expect(200);
    // Verify it's deleted from database
    const deleted = await contactModel.readOne(message._id);
    expect(deleted).toBeNull();
});

//tenth test -- empty form 
test('POST /api/contact - should fail with empty form', async () => {
    const response = await request(app)
        .post('/api/contact')
        .send({})
        .expect(400);
    expect(response.body.error).toBe('Name, email, and message are required');
});

//11th test -- 
test('POST /api/contact - should fail with duplicate email', async () => {
    const contactData = {
        name: 'John Doe',
        email: 'duplicate@test.com',
        message: 'First message'
    };

    // First submission - should succeed
    await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

    // Second submission with same email - should fail
    const response = await request(app)
        .post('/api/contact')
        .send({
            name: 'Jane Doe',
            email: 'duplicate@test.com',
            message: 'Second message'
        })
        .expect(409);

    expect(response.body.error).toBeDefined();
});
});