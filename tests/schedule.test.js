/**
 * Author: Nishant Gurung
 * User Story S10 - Scheduling
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../Server.js');
const scheduleModel = require('../model/schedule.js');

describe('Schedule API tests', () => {
    beforeAll(async () => {
        try {
            await mongoose.connection.db.dropCollection('schedules');
        } catch (err) {
        }
    });

    beforeEach(async () => {
        await scheduleModel.deleteAll();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // first test creating new scheduled event
    test('POST /api/schedule - should create new event', async () => {
        const eventData = {
            date: '2025-10-21',
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        };

        const response = await request(app)
            .post('/api/schedule')
            .send(eventData)
            .expect(201);

        expect(response.body.message).toBe('Event scheduled successfully');
        expect(response.body.id).toBeDefined();
    });

    //  second test missing required fields
    test('POST /api/schedule - should fail without required fields', async () => {
        const eventData = {
            date: '2025-10-21',
            time: '4:00 PM'
        };

        const response = await request(app)
            .post('/api/schedule')
            .send(eventData)
            .expect(400);

        expect(response.body.error).toBe('Date, time, teams, venue, and season are required');
    });

    // third test invalid date format
    test('POST /api/schedule - should fail with invalid date', async () => {
        const eventData = {
            date: 'invalid-date',
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        };

        const response = await request(app)
            .post('/api/schedule')
            .send(eventData)
            .expect(400);

        expect(response.body.error).toBe('Invalid date format');
    });

    // fourth test same team playing itself
    test('POST /api/schedule - should fail when home and away teams are the same', async () => {
        const eventData = {
            date: '2025-10-21',
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Hawks', 
            venue: 'Baltimore Arena',
            season: '2025'
        };

        const response = await request(app)
            .post('/api/schedule')
            .send(eventData)
            .expect(400);

        expect(response.body.error).toBe('Home and away teams must be different');
    });

    // fifth test getting all scheduled events
    test('GET /api/schedule - should return all events', async () => {
        await scheduleModel.create({
            date: new Date('2025-10-21'),
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        });
        await scheduleModel.create({
            date: new Date('2025-10-22'),
            time: '6:30 PM',
            homeTeam: 'Tigers',
            awayTeam: 'Lions',
            venue: 'Chicago Center',
            season: '2025'
        });

        const response = await request(app)
            .get('/api/schedule')
            .expect(200);

        expect(response.body.length).toBe(2);
        expect(response.body[0].homeTeam).toBeDefined();
        expect(response.body[0].venue).toBeDefined();
    });

    // sixth test single event by ID
    test('GET /api/schedule/:id - should return specific event', async () => {
        const event = await scheduleModel.create({
            date: new Date('2025-10-21'),
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        });

        const response = await request(app)
            .get(`/api/schedule/${event._id}`)
            .expect(200);

        expect(response.body.homeTeam).toBe('Hawks');
        expect(response.body.awayTeam).toBe('Bulls');
        expect(response.body.venue).toBe('Baltimore Arena');
    });

    // secenth test events by season
    test('GET /api/schedule/season/:season - should return events for season', async () => {
        await scheduleModel.create({
            date: new Date('2025-10-21'),
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        });
        await scheduleModel.create({
            date: new Date('2024-10-21'),
            time: '4:00 PM',
            homeTeam: 'Tigers',
            awayTeam: 'Lions',
            venue: 'Chicago Center',
            season: '2024'
        });

        const response = await request(app)
            .get('/api/schedule/season/2025')
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].season).toBe('2025');
    });

    // eighth test events by team
    test('GET /api/schedule/team/:teamName - should return events for team', async () => {
        await scheduleModel.create({
            date: new Date('2025-10-21'),
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        });
        await scheduleModel.create({
            date: new Date('2025-10-22'),
            time: '6:30 PM',
            homeTeam: 'Tigers',
            awayTeam: 'Hawks', // Hawks as away team
            venue: 'Chicago Center',
            season: '2025'
        });

        const response = await request(app)
            .get('/api/schedule/team/Hawks')
            .expect(200);

        expect(response.body.length).toBe(2); // Hawks in both games
    });

    // ninth test upcoming events
    test('GET /api/schedule/upcoming - should return future events', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        await scheduleModel.create({
            date: tomorrow,
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025',
            status: 'scheduled'
        });
        await scheduleModel.create({
            date: yesterday,
            time: '6:30 PM',
            homeTeam: 'Tigers',
            awayTeam: 'Lions',
            venue: 'Chicago Center',
            season: '2025',
            status: 'completed'
        });

        const response = await request(app)
            .get('/api/schedule/upcoming')
            .expect(200);

        expect(response.body.length).toBe(1); // Only future event
        expect(response.body[0].homeTeam).toBe('Hawks');
    });

    // tenth test update event
    test('PATCH /api/schedule/:id - should update event', async () => {
        const event = await scheduleModel.create({
            date: new Date('2025-10-21'),
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025',
            status: 'scheduled'
        });

        const response = await request(app)
            .patch(`/api/schedule/${event._id}`)
            .send({ status: 'completed', homeScore: 90, awayScore: 85 })
            .expect(200);

        expect(response.body.message).toBe('Event updated successfully');
        expect(response.body.data.status).toBe('completed');
        expect(response.body.data.homeScore).toBe(90);
    });

    // test 11 delete event
    test('DELETE /api/schedule/:id - should delete event', async () => {
        const event = await scheduleModel.create({
            date: new Date('2025-10-21'),
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        });

        await request(app)
            .delete(`/api/schedule/${event._id}`)
            .expect(200);

        const deleted = await scheduleModel.readOne(event._id);
        expect(deleted).toBeNull();
    });

    // test 12 event not found
    test('GET /api/schedule/:id - should return 404 for non-existent event', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/schedule/${fakeId}`)
            .expect(404);

        expect(response.body.error).toBe('Event not found');
    });

    // test 13 duplicate event
    test('POST /api/schedule - should fail with duplicate event', async () => {
        const eventData = {
            date: '2025-10-21',
            time: '4:00 PM',
            homeTeam: 'Hawks',
            awayTeam: 'Bulls',
            venue: 'Baltimore Arena',
            season: '2025'
        };

        // first submission
        await request(app)
            .post('/api/schedule')
            .send(eventData)
            .expect(201); //success message

        // second submission
        const response = await request(app)
            .post('/api/schedule')
            .send(eventData)
            .expect(409); //error message

        expect(response.body.error).toBe('Event already exists for these teams on this date');
    });
});