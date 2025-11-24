// tests/BracketController.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const BracketController = require("../controller/BracketController");
const Match = require("../model/Match");

// simple Express res mock
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

let mongo;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe("BracketController.byEvent", () => {
    it("returns 400 for invalid event id", async () => {
        const req = { params: { eventId: "not-an-objectid" } };
        const res = mockResponse();

        await BracketController.byEvent(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid event id." });
    });

    it("returns grouped rounds for a valid event", async () => {
        const eventId = new mongoose.Types.ObjectId();
        const otherEventId = new mongoose.Types.ObjectId();

        // seed matches
        await Match.create([
            {
                eventId,
                teamA: "Team 1",
                teamB: "Team 2",
                round: 1,
                start: new Date("2025-01-01T10:00:00.000Z"),
            },
            {
                eventId,
                teamA: "Team 3",
                teamB: "Team 4",
                round: 2,
                start: new Date("2025-01-01T12:00:00.000Z"),
            },
            {
                // different event, should be ignored
                eventId: otherEventId,
                teamA: "X",
                teamB: "Y",
                round: 1,
                start: new Date("2025-01-02T10:00:00.000Z"),
            },
        ]);

        const req = { params: { eventId: eventId.toString() } };
        const res = mockResponse();

        await BracketController.byEvent(req, res);

        expect(res.status).not.toHaveBeenCalled(); // default 200
        expect(res.json).toHaveBeenCalledTimes(1);

        const payload = res.json.mock.calls[0][0];

        expect(payload.eventId).toBe(eventId.toString());
        expect(Array.isArray(payload.rounds)).toBe(true);
        expect(payload.rounds.length).toBe(2);

        // rounds ordered ascending
        expect(payload.rounds[0].round).toBe(1);
        expect(payload.rounds[1].round).toBe(2);

        expect(payload.rounds[0].matches.length).toBe(1);
        expect(payload.rounds[1].matches.length).toBe(1);

        // sanity: ensure no match from otherEventId snuck in
        const allMatchesIds = payload.rounds
            .flatMap((r) => r.matches)
            .map((m) => m.eventId.toString());
        expect(new Set(allMatchesIds)).toEqual(new Set([eventId.toString()]));
    });
});
