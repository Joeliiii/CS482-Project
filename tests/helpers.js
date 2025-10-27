exports.makeReq = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    session: {},
    ...overrides,
});

exports.makeRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = jest.fn().mockImplementation((code) => {
        res.statusCode = code;
        return res;
    });
    res.json = jest.fn().mockImplementation((obj) => obj);
    res.send = jest.fn().mockImplementation((obj) => obj);
    res.clearCookie = jest.fn();
    return res;
};

exports.next = jest.fn();


exports.returnsLean = (value) => ({
    lean: jest.fn().mockResolvedValue(value),
});


exports.returnsExec = (value) => ({
    exec: jest.fn().mockResolvedValue(value),
});


exports.returnsLeanExec = (value) => ({
    lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(value),
    }),
});


jest.mock('mongoose', () => {
    const actual = jest.requireActual('mongoose');
    return {
        ...actual,
        connect: jest.fn().mockResolvedValue({}),
        connection: {
            close: jest.fn().mockResolvedValue({}),
            on: jest.fn(), // for listeners in DBConnection
        },
        Schema: actual.Schema,
        Types: {
            ObjectId: function (id) {
                return { toString: () => String(id || '507f1f77bcf86cd799439011') };
            },
        },
    };
});
const mongoose = require('mongoose');
exports.mongoose = mongoose;

const mockUser = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
};
jest.mock('../model/User', () => mockUser, { virtual: true });

const mockRole = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
};
jest.mock('../model/Role', () => mockRole, { virtual: true });

const mockUserRole = {
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    findOne: jest.fn(),
};
jest.mock('../model/UserRole', () => mockUserRole, { virtual: true });

const mockAdult = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
};
jest.mock('../model/Adult', () => mockAdult, { virtual: true });

const mockChild = {
    create: jest.fn(),
};
jest.mock('../model/Child', () => mockChild, { virtual: true });

const mockAdultChildLink = {
    aggregate: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    deleteOne: jest.fn(),
};
jest.mock('../model/AdultChildLink', () => mockAdultChildLink, { virtual: true });

exports.mocks = {
    User: mockUser,
    Role: mockRole,
    UserRole: mockUserRole,
    Adult: mockAdult,
    Child: mockChild,
    AdultChildLink: mockAdultChildLink,
};


exports.resetAll = () => {
    jest.clearAllMocks();
};