/**
 * Author: Nishant Gurung
 * User Story S20 - Admin Support Messages
 * Tests for support messages
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../Server.js');
const supportMessageModel = require('../model/supportMessage.js');

describe('Support Message API tests', () => {
    beforeAll(async () => {
        try {
            await mongoose.connection.db.dropCollection('supportmessages');
        } catch (err) {
            // Collection might not exist
        }
    });

    beforeEach(async () => {
        await supportMessageModel.deleteAll();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // create new support ticket
    test('POST /api/support - should create new support ticket', async () => {
        const ticketData = {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Cannot login to account',
            message: 'I forgot my password and cannot reset it',
            category: 'account'
        };

        const response = await request(app)
            .post('/api/support')
            .send(ticketData)
            .expect(201);

        expect(response.body.message).toBe('Support ticket created successfully');
        expect(response.body.id).toBeDefined();
        expect(response.body.ticketNumber).toBeDefined();
    });

    // missing required fields
    test('POST /api/support - should fail without required fields', async () => {
        const ticketData = {
            name: 'John Doe',
            email: 'john@example.com'
            // Missing subject and message
        };

        const response = await request(app)
            .post('/api/support')
            .send(ticketData)
            .expect(400);

        expect(response.body.error).toBe('Name, email, subject, and message are required');
    });

    // invalid email
    test('POST /api/support - should fail with invalid email', async () => {
        const ticketData = {
            name: 'John Doe',
            email: 'invalid-email',
            subject: 'Test',
            message: 'Test message'
        };

        const response = await request(app)
            .post('/api/support')
            .send(ticketData)
            .expect(400);

        expect(response.body.error).toBe('Invalid email format');
    });

    // get all support messages
    test('GET /api/support - should return all messages', async () => {
        await supportMessageModel.create({
            name: 'User 1',
            email: 'user1@test.com',
            subject: 'Issue 1',
            message: 'Problem description 1'
        });
        await supportMessageModel.create({
            name: 'User 2',
            email: 'user2@test.com',
            subject: 'Issue 2',
            message: 'Problem description 2'
        });

        const response = await request(app)
            .get('/api/support')
            .expect(200);

        expect(response.body.length).toBe(2);
        expect(response.body[0].status).toBe('new');
    });

    // get single message by ID
    test('GET /api/support/:id - should return specific message', async () => {
        const ticket = await supportMessageModel.create({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test message content'
        });

        const response = await request(app)
            .get(`/api/support/${ticket._id}`)
            .expect(200);

        expect(response.body.name).toBe('Test User');
        expect(response.body.subject).toBe('Test Subject');
    });

    // update message status
    test('PATCH /api/support/:id - should update status', async () => {
        const ticket = await supportMessageModel.create({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test'
        });

        const response = await request(app)
            .patch(`/api/support/${ticket._id}`)
            .send({ status: 'in-progress' })
            .expect(200);

        expect(response.body.message).toBe('Support ticket updated successfully');
        expect(response.body.data.status).toBe('in-progress');
    });

    // update priority
    test('PATCH /api/support/:id - should update priority', async () => {
        const ticket = await supportMessageModel.create({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test'
        });

        const response = await request(app)
            .patch(`/api/support/${ticket._id}`)
            .send({ priority: 'urgent' })
            .expect(200);

        expect(response.body.data.priority).toBe('urgent');
    });

    // assign to admin
    test('PATCH /api/support/:id - should assign to admin', async () => {
        const ticket = await supportMessageModel.create({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test'
        });

        const response = await request(app)
            .patch(`/api/support/${ticket._id}`)
            .send({ assignedTo: 'admin123' })
            .expect(200);

        expect(response.body.data.assignedTo).toBe('admin123');
    });

    // invalid status
    test('PATCH /api/support/:id - should reject invalid status', async () => {
        const ticket = await supportMessageModel.create({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test'
        });

        const response = await request(app)
            .patch(`/api/support/${ticket._id}`)
            .send({ status: 'invalid-status' })
            .expect(400);

        expect(response.body.error).toBe('Invalid status');
    });

    // get messages by status
    test('GET /api/support/status/:status - should filter by status', async () => {
        await supportMessageModel.create({
            name: 'User 1',
            email: 'user1@test.com',
            subject: 'Issue 1',
            message: 'Test',
            status: 'new'
        });
        await supportMessageModel.create({
            name: 'User 2',
            email: 'user2@test.com',
            subject: 'Issue 2',
            message: 'Test',
            status: 'resolved'
        });

        const response = await request(app)
            .get('/api/support/status/new')
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].status).toBe('new');
    });

    // get unresolved messages
    test('GET /api/support/unresolved - should return only unresolved', async () => {
        await supportMessageModel.create({
            name: 'User 1',
            email: 'user1@test.com',
            subject: 'Issue 1',
            message: 'Test',
            status: 'new'
        });
        await supportMessageModel.create({
            name: 'User 2',
            email: 'user2@test.com',
            subject: 'Issue 2',
            message: 'Test',
            status: 'in-progress'
        });
        await supportMessageModel.create({
            name: 'User 3',
            email: 'user3@test.com',
            subject: 'Issue 3',
            message: 'Test',
            status: 'resolved'
        });

        const response = await request(app)
            .get('/api/support/unresolved')
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    // delete message
    test('DELETE /api/support/:id - should delete message', async () => {
        const ticket = await supportMessageModel.create({
            name: 'Test User',
            email: 'test@example.com',
            subject: 'Test',
            message: 'Test'
        });

        await request(app)
            .delete(`/api/support/${ticket._id}`)
            .expect(200);

        const deleted = await supportMessageModel.readOne(ticket._id);
        expect(deleted).toBeNull();
    });

    // message not found
    test('GET /api/support/:id - should return 404 for non-existent message', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/support/${fakeId}`)
            .expect(404);

        expect(response.body.error).toBe('Support message not found');
    });
});