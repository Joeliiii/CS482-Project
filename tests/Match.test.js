const mongoose = require('mongoose');
const Match = require('../model/Match');

describe('Match Model', () => {
   // beforeAll(async () => {
   //     // Use an in-memory connection (mocked)
   //     await mongoose.connect('mongodb://localhost:27017/testdb', {
   //         useNewUrlParser: true,
   //         useUnifiedTopology: true,
   //     });
   // });
//
   // afterAll(async () => {
   //     await mongoose.disconnect();
   // });

    test('creates a valid Match document', async () => {
        const match = new Match({
            eventId: new mongoose.Types.ObjectId(),
            teamA: 'Hawks',
            teamB: 'Eagles',
            scoreA: 72,
            scoreB: 68,
            start: new Date('2025-06-01T12:00:00Z'),
            court: 'Court 1'
        });

        const validationError = match.validateSync();
        expect(validationError).toBeUndefined();

        expect(match.teamA).toBe('Hawks');
        expect(match.scoreA).toBe(72);
        expect(match.status).toBe('scheduled'); // default
        expect(match.court).toBe('Court 1');
    });

    test('requires eventId, teamA, teamB, and start', async () => {
        const match = new Match({});
        const err = match.validateSync();

        expect(err.errors.eventId).toBeDefined();
        expect(err.errors.teamA).toBeDefined();
        expect(err.errors.teamB).toBeDefined();
        expect(err.errors.start).toBeDefined();
    });

    test('rejects invalid status values', async () => {
        const match = new Match({
            eventId: new mongoose.Types.ObjectId(),
            teamA: 'Team X',
            teamB: 'Team Y',
            start: new Date(),
            status: 'invalid_status'
        });

        const err = match.validateSync();
        expect(err.errors.status).toBeDefined();
    });

    test('defaults numeric fields to 0', async () => {
        const match = new Match({
            eventId: new mongoose.Types.ObjectId(),
            teamA: 'A',
            teamB: 'B',
            start: new Date()
        });

        expect(match.scoreA).toBe(0);
        expect(match.scoreB).toBe(0);
    });

    test('trims string fields properly', async () => {
        const match = new Match({
            eventId: new mongoose.Types.ObjectId(),
            teamA: '  Hawks  ',
            teamB: '  Eagles  ',
            start: new Date(),
            court: '  Gym A  '
        });

        const saved = await match.save();
        expect(saved.teamA).toBe('Hawks');
        expect(saved.teamB).toBe('Eagles');
        expect(saved.court).toBe('Gym A');

        await Match.deleteOne({ _id: saved._id });
    });

    test('stores timestamps automatically', async () => {
        const match = new Match({
            eventId: new mongoose.Types.ObjectId(),
            teamA: 'Falcons',
            teamB: 'Owls',
            start: new Date()
        });

        const saved = await match.save();
        expect(saved.createdAt).toBeInstanceOf(Date);
        expect(saved.updatedAt).toBeInstanceOf(Date);

        await Match.deleteOne({ _id: saved._id });
    });
});
