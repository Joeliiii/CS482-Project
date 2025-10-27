/**
 * Author: Nishant Gurung
 * User Story S9 - team logos and profiles
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../Server.js');
const teamModel = require('../model/team.js');

describe('Team API tests', () => {
    beforeEach(async () => {
        await teamModel.deleteAll();
    });

    afterAll(async () =>{
        await mongoose.connection.close();
});

    //test1: creating a team
    test('POST /api/teams - should create new team', async () => {
        const teamData = {
            name: 'Baltimore Hawks',
            season: '2025',
            coach: 'Marcus Green',
            logo: 'hawks.png'
        };
        const response = await request(app)
            .post('/api/teams')
            .send(teamData)
            .expect(201);
        expect(response.body.message).toBe('Team created successfully');
        expect(response.body.id).toBeDefined();
    });

    //test 2 missing team name
    test('POST /api/teams - should fail without name', async () => {
        const teamData = {
            season: '2025',
            coach: 'Marcus Green'
        };
        const response = await request(app)
            .post('/api/teams')
            .send(teamData)
            .expect(400);
        expect(response.body.error).toBe('Team name and Season are required');
    });

    //test 3 missing season
    test('POST /api/teams - should fail without season', async () =>{
        const teamData = {
            name: 'Baltimore Hawks',
            coach: 'Marcus Green'
        };
        const response = await request(app)
            .post('/api/teams')
            .send(teamData)
            .expect(400);
        expect(response.body.error).toBe('Team name and Season are required');
    });

    //test 4 getting all teams
    test('GET /api/teams - should return all teams', async () => {
        await teamModel.create({
            name: 'Tigers',
            season: '2025',
            coach: 'John Smith',
            wins: 56,
            losses: 48,
            logo: 'tigers.png'
        });
        await teamModel.create({
            name: 'Tigers',
            season: '2025',
            coach: 'John Smith',
            wins: 56,
            losses: 48,
            logo: 'tigers.png'
        });
        const response = await request(app)
            .get('/api/teams')
            .expect(200);
        
        expect(response.body.length).toBe(2);
        expect(response.body[0].name).toBeDefined();
        expect(response.body[0]).toBedefined();
    });

    //test 5 getting single team ID, and playerCount
    test('GET /api/teams/:id - should return specific team with all details', async () => {
        const team = await teamModel.create({
            name: 'Baltimore Hawks',
            season: '2025',
            coach: 'Marcus Green',
            wins: 50,
            losses: 42,
            playerCount: 10,
            logo: 'hawks.png'
        });
        const response = await request(app)
            .get(`/api/teams/${team._id}`)
            .expect(200);

        expect(response.body.name).toBe('Baltimore Hawks');
        expect(response.body.coach).toBe('Marcus Green');
        expect(response.body.logo).toBe('hawks.png');
        expect(response.body.playerCount).toBe(10);
        expect(response.body.wins).toBe(50);
        expect(response.body.losses).toBe(42);
        //expect(response.body.email).toBe('test@example.com');
    });
;

   //patch update
   test('PATCH /api/teams/:id - should update team info', async () => {
        const team = await teamModel.create({
            name: 'Baltimore Hawks',
            season: '2025',
            coach: 'Marcus Green',
            wins: 50,
            losses: 42
        });

        const response = await request(app)
            .patch(`/api/teams/${team._id}`)
            .send({wins:51, losses: 42})
            .expect(200);

        expect(response.body.message).toBe('Team updated successfully');
        expect(response.body.data.wins).toBe(51);
   });

   //delete team
   test('DELETE /api/teams/:id - should delete team', async () => {
        const team = await teamModel.create({
            name: 'Test Team',
            season: '2025',
            coach: 'Test Coach'
        });

        await request(app)
            .delete(`/api/teams/${team._id}`)
            .expect(200);

        const deleted = await teamModel.readOne(team._id);
        expect(deleted).toBeNull();
   });

   //team not found
   test('GET /api/teams/:id - should return 404 for non-existent team', async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/api/teams/${fakeId}`)
            .expect(404);

        expect(response.body.error).toBe('Team not found');
   });

});

//Code Coverage tests, test script, and Code Coverage of Iteration 1