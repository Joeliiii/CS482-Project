// tests/signup.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const signupRoute = require("../routes/signup");

const app = express();
app.use(express.json());
app.use("/api/signup", signupRoute);

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

// Clear database between each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// ----------------------------
//     SIGNUP TESTS
// ----------------------------
describe("POST /api/signup", () => {
    it("creates a new user successfully", async () => {
        const res = await request(app)
            .post("/api/signup")
            .send({
                email: "test@example.com",
                username: "tester",
                password: "123456",
                phone: "555-0000"
            });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("User created successfully!");
    });

    it("rejects duplicate email", async () => {
        await request(app).post("/api/signup").send({
            email: "dupe@example.com",
            username: "user1",
            password: "pass",
            phone: "555"
        });

        const res = await request(app).post("/api/signup").send({
            email: "dupe@example.com",
            username: "user2",
            password: "pass2",
            phone: "555"
        });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe("Email already registered");
    });

    it("returns 400 if fields missing", async () => {
        const res = await request(app)
            .post("/api/signup")
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("All fields required");
    });
});
