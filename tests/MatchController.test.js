// tests/MatchController.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const MatchController = require("../controller/MatchController");
const Match = require("../model/Match");

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

describe("MatchController.create", () => {
    it("creates a match with valid data", async () => {
        const eventId = new mongoose.Types.ObjectId();
        const req = {
            body: {
                eventId: eventId.toString(),
                teamA: "Team A",
                teamB: "Team B",
                start: "2025-01-01T10:00:00.000Z",
                court: "Court 1",
            },
        };
        const res = mockResponse();

        await MatchController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledTimes(1);

        const match = res.json.mock.calls[0][0];
        expect(match).toHaveProperty("_id");
        expect(match.teamA).toBe("Team A");
        expect(match.teamB).toBe("Team B");
        expect(match.court).toBe("Court 1");
        expect(match.eventId.toString()).toBe(eventId.toString());
    });

    it("returns 400 when required fields missing", async () => {
        const req = { body: {} };
        const res = mockResponse();

        await MatchController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "eventId, teamA, teamB, start required.",
        });
    });

    it("returns 400 for invalid eventId", async () => {
        const req = {
            body: {
                eventId: "not-an-objectid",
                teamA: "Team A",
                teamB: "Team B",
                start: "2025-01-01T10:00:00.000Z",
            },
        };
        const res = mockResponse();

        await MatchController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid eventId" });
    });
});

describe("MatchController.list", () => {
    it("lists all matches when eventId not provided", async () => {
        const event1 = new mongoose.Types.ObjectId();
        const event2 = new mongoose.Types.ObjectId();

        await Match.create([
            {
                eventId: event1,
                teamA: "A1",
                teamB: "B1",
                start: new Date("2025-01-01T10:00:00.000Z"),
            },
            {
                eventId: event2,
                teamA: "A2",
                teamB: "B2",
                start: new Date("2025-01-01T11:00:00.000Z"),
            },
        ]);

        const req = { query: {} };
        const res = mockResponse();

        await MatchController.list(req, res);

        expect(res.status).not.toHaveBeenCalled(); // default 200
        expect(res.json).toHaveBeenCalledTimes(1);

        const items = res.json.mock.calls[0][0];
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(2);
    });

    it("filters by eventId", async () => {
        const event1 = new mongoose.Types.ObjectId();
        const event2 = new mongoose.Types.ObjectId();

        await Match.create([
            {
                eventId: event1,
                teamA: "A1",
                teamB: "B1",
                start: new Date("2025-01-01T10:00:00.000Z"),
            },
            {
                eventId: event2,
                teamA: "A2",
                teamB: "B2",
                start: new Date("2025-01-01T11:00:00.000Z"),
            },
        ]);

        const req = { query: { eventId: event1.toString() } };
        const res = mockResponse();

        await MatchController.list(req, res);

        const items = res.json.mock.calls[0][0];
        expect(items.length).toBe(1);
        expect(items[0].eventId.toString()).toBe(event1.toString());
    });

    it("returns 400 for invalid eventId", async () => {
        const req = { query: { eventId: "not-an-objectid" } };
        const res = mockResponse();

        await MatchController.list(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid eventId" });
    });
});

describe("MatchController.update", () => {
    it("updates a match when given valid matchId and data", async () => {
        const eventId = new mongoose.Types.ObjectId();
        const match = await Match.create({
            eventId,
            teamA: "Old A",
            teamB: "Old B",
            start: new Date("2025-01-01T10:00:00.000Z"),
        });

        const req = {
            params: { matchId: match._id.toString() },
            body: { scoreA: 50, scoreB: 45, status: "completed" },
        };
        const res = mockResponse();

        await MatchController.update(req, res);

        expect(res.status).not.toHaveBeenCalled(); // default 200
        const updated = res.json.mock.calls[0][0];
        expect(updated.scoreA).toBe(50);
        expect(updated.scoreB).toBe(45);
        expect(updated.status).toBe("completed");
    });

    it("returns 400 for invalid matchId", async () => {
        const req = {
            params: { matchId: "not-an-objectid" },
            body: { scoreA: 50 },
        };
        const res = mockResponse();

        await MatchController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid matchId" });
    });

    it("returns 400 for invalid eventId in body", async () => {
        const eventId = new mongoose.Types.ObjectId();
        const match = await Match.create({
            eventId,
            teamA: "Old A",
            teamB: "Old B",
            start: new Date("2025-01-01T10:00:00.000Z"),
        });

        const req = {
            params: { matchId: match._id.toString() },
            body: { eventId: "not-an-objectid" },
        };
        const res = mockResponse();

        await MatchController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid eventId" });
    });

    it("returns 404 when match not found", async () => {
        const req = {
            params: { matchId: new mongoose.Types.ObjectId().toString() },
            body: { scoreA: 10 },
        };
        const res = mockResponse();

        await MatchController.update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Match not found." });
    });
});

describe("MatchController.remove", () => {
    it("deletes a match with valid matchId", async () => {
        const eventId = new mongoose.Types.ObjectId();
        const match = await Match.create({
            eventId,
            teamA: "To Delete",
            teamB: "Other",
            start: new Date("2025-01-01T10:00:00.000Z"),
        });

        const req = { params: { matchId: match._id.toString() } };
        const res = mockResponse();

        await MatchController.remove(req, res);

        expect(res.status).not.toHaveBeenCalled(); // default 200
        expect(res.json).toHaveBeenCalledWith({ message: "Match deleted." });

        const check = await Match.findById(match._id);
        expect(check).toBeNull();
    });

    it("returns 400 for invalid matchId", async () => {
        const req = { params: { matchId: "not-an-objectid" } };
        const res = mockResponse();

        await MatchController.remove(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid matchId" });
    });

    it("returns 404 when match not found", async () => {
        const req = {
            params: { matchId: new mongoose.Types.ObjectId().toString() },
        };
        const res = mockResponse();

        await MatchController.remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Match not found." });
    });
});
