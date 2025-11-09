// tests/AdminController.test.js
const mongoose = require('mongoose')

// --- Mock models used by AdminController --- //
jest.mock('../model/User', () => ({
    countDocuments: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
}))
jest.mock('../model/UserRole', () => ({
    aggregate: jest.fn(),
    find: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
}))
jest.mock('../model/Role', () => ({
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
}))
jest.mock('../model/Team', () => ({
    countDocuments: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
}))
jest.mock('../model/Event', () => ({
    countDocuments: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
}))
jest.mock('../model/Adult', () => ({
    findOne: jest.fn(),
    deleteOne: jest.fn(),
}))
jest.mock('../model/Child', () => ({
    collection: { name: 'children' },
}))
jest.mock('../model/AdultChildLink', () => ({
    aggregate: jest.fn(),
    deleteMany: jest.fn(),
}))

// Require mocks
const User = require('../model/User')
const UserRole = require('../model/UserRole')
const Role = require('../model/Role')
const Team = require('../model/Team')
const Event = require('../model/Event')
const Adult = require('../model/Adult')
const Child = require('../model/Child')
const AdultChildLink = require('../model/AdultChildLink')

// Controller under test (uses mocks above)
const AdminController = require('../controller/AdminController')

// --- Test helpers --- //
const makeReq = (overrides = {}) => ({
    params: {},
    query: {},
    body: {},
    session: {},
    ...overrides,
})

const makeRes = () => {
    const res = {}
    res.status = jest.fn(() => res)
    res.json = jest.fn(() => res)
    return res
}

// chainable query: .sort().limit().skip().lean()
const makeQueryChain = (result) => {
    const chain = {}
    chain.sort = jest.fn(() => chain)
    chain.limit = jest.fn(() => chain)
    chain.skip = jest.fn(() => chain)
    chain.lean = jest.fn().mockResolvedValue(result)
    return chain
}

// single .lean() wrapper
const leanResult = (doc) => ({
    lean: jest.fn().mockResolvedValue(doc),
})

beforeEach(() => {
    jest.clearAllMocks()
})

/* =========================================================
 * overview
 * =======================================================*/
describe('AdminController.overview', () => {
    test('returns stats and recent users with roles', async () => {
        const res = makeRes()
        const req = makeReq()

        const userId = '000000000000000000000001'
        const recentUsers = [
            {
                _id: userId,
                email: 'a@example.com',
                username: 'Alpha',
                createdAt: new Date('2025-01-01'),
            },
        ]

        User.countDocuments.mockResolvedValue(5)
        Team.countDocuments.mockResolvedValue(2)
        Event.countDocuments.mockResolvedValue(3)
        User.find.mockReturnValue(makeQueryChain(recentUsers))

        UserRole.aggregate.mockResolvedValue([
            {
                userId: new mongoose.Types.ObjectId(userId),
                role: 'admin',
            },
        ])

        await AdminController.overview(req, res)

        expect(User.countDocuments).toHaveBeenCalled()
        expect(Team.countDocuments).toHaveBeenCalled()
        expect(Event.countDocuments).toHaveBeenCalled()
        expect(User.find).toHaveBeenCalled()

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                stats: { userCount: 5, teamCount: 2, eventCount: 3 },
                users: [
                    expect.objectContaining({
                        email: 'a@example.com',
                        roles: ['admin'],
                    }),
                ],
            })
        )
    })
})

/* =========================================================
 * listUsers
 * =======================================================*/
describe('AdminController.listUsers', () => {
    test('lists users with roles and pagination', async () => {
        const res = makeRes()
        const req = makeReq({
            query: { q: 'alpha', page: '1', limit: '10' },
        })

        const userId = '000000000000000000000010'
        const pageUsers = [
            {
                _id: userId,
                email: 'alpha@example.com',
                username: 'Alpha',
                createdAt: new Date('2025-01-02'),
            },
        ]

        User.find.mockReturnValue(makeQueryChain(pageUsers))
        User.countDocuments.mockResolvedValue(1)

        UserRole.aggregate.mockResolvedValue([
            {
                userId: new mongoose.Types.ObjectId(userId),
                role: 'user',
            },
        ])

        await AdminController.listUsers(req, res)

        expect(User.find).toHaveBeenCalled()
        expect(User.countDocuments).toHaveBeenCalled()
        expect(UserRole.aggregate).toHaveBeenCalled()

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                total: 1,
                page: 1,
                items: [
                    expect.objectContaining({
                        email: 'alpha@example.com',
                        roles: ['user'],
                    }),
                ],
            })
        )
    })
})

/* =========================================================
 * updateUser
 * =======================================================*/
describe('AdminController.updateUser', () => {
    test('updates basic user fields', async () => {
        const userId = '000000000000000000000020'
        const res = makeRes()
        const req = makeReq({
            params: { userId },
            body: { username: 'NewName', phone: '999', isVerified: true },
        })

        const updated = {
            _id: userId,
            email: 'a@example.com',
            username: 'NewName',
            phone: '999',
            isVerified: true,
        }

        User.findByIdAndUpdate.mockReturnValue(leanResult(updated))

        await AdminController.updateUser(req, res)

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            userId,
            expect.objectContaining({
                username: 'NewName',
                phone: '999',
                isVerified: true,
            }),
            { new: true }
        )
        expect(res.json).toHaveBeenCalledWith(updated)
    })
})

/* =========================================================
 * updateUserRoles
 * =======================================================*/
describe('AdminController.updateUserRoles', () => {
    test('replaces roles set for a user', async () => {
        const userId = '000000000000000000000030'
        const uid = new mongoose.Types.ObjectId(userId)
        const res = makeRes()
        const req = makeReq({
            params: { userId },
            body: { roles: ['admin', 'user'] },
        })

        const ADMIN_ID = '00000000000000000000aa01'
        const USER_ID = '00000000000000000000aa02'

        // Upsert roles -> .lean()
        Role.findOneAndUpdate
            .mockReturnValueOnce(leanResult({ _id: ADMIN_ID, name: 'admin' }))
            .mockReturnValueOnce(leanResult({ _id: USER_ID, name: 'user' }))

        // Existing: already has 'admin'
        UserRole.find.mockReturnValue(
            leanResult([
                {
                    userId: uid,
                    roleId: new mongoose.Types.ObjectId(ADMIN_ID),
                },
            ])
        )

        UserRole.insertMany.mockResolvedValue()
        UserRole.deleteMany.mockResolvedValue()

        // Final aggregate of roles
        UserRole.aggregate.mockResolvedValue([
            { _id: ADMIN_ID, name: 'admin', displayName: 'Admin' },
            { _id: USER_ID, name: 'user', displayName: 'User' },
        ])

        await AdminController.updateUserRoles(req, res)

        expect(Role.findOneAndUpdate).toHaveBeenCalled()
        expect(UserRole.find).toHaveBeenCalledWith({ userId: uid })
        expect(UserRole.insertMany).toHaveBeenCalled()
        expect(UserRole.aggregate).toHaveBeenCalled()

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Roles updated.',
                roles: expect.arrayContaining(['admin', 'user']),
            })
        )
    })
})

/* =========================================================
 * deleteUser
 * =======================================================*/
describe('AdminController.deleteUser', () => {
    test('deletes user + related mappings', async () => {
        const userId = '000000000000000000000040'
        const res = makeRes()
        const req = makeReq({ params: { userId } })

        User.deleteOne.mockResolvedValue()
        UserRole.deleteMany.mockResolvedValue()
        Adult.deleteOne.mockResolvedValue()
        AdultChildLink.deleteMany.mockResolvedValue()

        await AdminController.deleteUser(req, res)

        expect(User.deleteOne).toHaveBeenCalled()
        expect(UserRole.deleteMany).toHaveBeenCalled()
        expect(Adult.deleteOne).toHaveBeenCalled()
        expect(AdultChildLink.deleteMany).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
    })
})

/* =========================================================
 * listUserRoles
 * =======================================================*/
describe('AdminController.listUserRoles', () => {
    test('returns roles for a user', async () => {
        const userId = '000000000000000000000050'
        const uid = new mongoose.Types.ObjectId(userId)
        const res = makeRes()
        const req = makeReq({ params: { userId } })

        UserRole.aggregate.mockResolvedValue([
            { _id: 'r1', name: 'admin', displayName: 'Admin' },
        ])

        await AdminController.listUserRoles(req, res)

        expect(UserRole.aggregate).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ name: 'admin' }),
            ])
        )
    })
})

/* =========================================================
 * assignRole / revokeRole
 * =======================================================*/
describe('AdminController.assignRole', () => {
    test('assigns a role to user', async () => {
        const res = makeRes()
        const req = makeReq({
            body: { userId: 'u1', roleName: 'Admin' },
        })

        Role.findOneAndUpdate.mockReturnValue(
            leanResult({ _id: 'rid', name: 'admin' })
        )
        UserRole.updateOne.mockResolvedValue()

        await AdminController.assignRole(req, res)

        expect(Role.findOneAndUpdate).toHaveBeenCalled()
        expect(UserRole.updateOne).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: expect.stringContaining('Assigned'),
            })
        )
    })
})

describe('AdminController.revokeRole', () => {
    test('revokes a role from user', async () => {
        const res = makeRes()
        const req = makeReq({
            body: { userId: 'u1', roleName: 'Admin' },
        })

        Role.findOne.mockReturnValue(
            leanResult({ _id: 'rid', name: 'admin' })
        )
        UserRole.deleteOne.mockResolvedValue()

        await AdminController.revokeRole(req, res)

        expect(Role.findOne).toHaveBeenCalled()
        expect(UserRole.deleteOne).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
    })
})

/* =========================================================
 * listChildren
 * =======================================================*/
describe('AdminController.listChildren', () => {
    test('returns [] when no Adult profile', async () => {
        const res = makeRes()
        const req = makeReq({ params: { userId: 'u-no-adult' } })

        Adult.findOne.mockReturnValue(leanResult(null))

        await AdminController.listChildren(req, res)

        expect(Adult.findOne).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith([])
    })

    test('joins children for Adult via AdultChildLink', async () => {
        const res = makeRes()
        const userId = '000000000000000000000060'
        const adultId = '000000000000000000000061'
        const req = makeReq({ params: { userId } })

        Adult.findOne.mockReturnValue(
            leanResult({ _id: adultId, userId })
        )

        AdultChildLink.aggregate.mockResolvedValue([
            {
                _id: 'c1',
                fullName: 'Kid One',
                birthdate: new Date('2015-01-01'),
                photoUrl: '',
                relation: 'Parent',
                isPrimary: true,
            },
        ])

        await AdminController.listChildren(req, res)

        expect(Adult.findOne).toHaveBeenCalled()
        expect(AdultChildLink.aggregate).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ fullName: 'Kid One' }),
            ])
        )
    })
})

/* =========================================================
 * Teams CRUD
 * =======================================================*/
describe('AdminController Teams CRUD', () => {
    test('listTeams returns paginated teams', async () => {
        const res = makeRes()
        const req = makeReq({
            query: { q: 'Hawks', season: '2025', page: '1', limit: '10' },
        })

        const teams = [
            { _id: 't1', name: 'Hawks', season: '2025', coach: 'Coach' },
        ]

        Team.find.mockReturnValue(makeQueryChain(teams))
        Team.countDocuments.mockResolvedValue(1)

        await AdminController.listTeams(req, res)

        expect(Team.find).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                total: 1,
                items: expect.arrayContaining([
                    expect.objectContaining({ name: 'Hawks' }),
                ]),
            })
        )
    })

    test('createTeam creates team', async () => {
        const res = makeRes()
        const req = makeReq({
            body: { name: 'Hawks', season: '2025', coach: 'Zed' },
        })

        const teamDoc = {
            _id: 't2',
            name: 'Hawks',
            season: '2025',
            coach: 'Zed',
        }

        Team.create.mockResolvedValue(teamDoc)

        await AdminController.createTeam(req, res)

        expect(Team.create).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(teamDoc)
    })

    test('updateTeam updates team', async () => {
        const res = makeRes()
        const req = makeReq({
            params: { teamId: 't3' },
            body: { coach: 'New Coach' },
        })

        const updated = { _id: 't3', coach: 'New Coach' }
        Team.findByIdAndUpdate.mockReturnValue(leanResult(updated))

        await AdminController.updateTeam(req, res)

        expect(Team.findByIdAndUpdate).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(updated)
    })

    test('deleteTeam deletes team', async () => {
        const res = makeRes()
        const req = makeReq({ params: { teamId: 't4' } })

        Team.findByIdAndDelete.mockResolvedValue({ _id: 't4' })

        await AdminController.deleteTeam(req, res)

        expect(Team.findByIdAndDelete).toHaveBeenCalledWith('t4')
        expect(res.status).toHaveBeenCalledWith(200)
    })
})

/* =========================================================
 * Events CRUD
 * =======================================================*/
describe('AdminController Events CRUD', () => {
    test('listEvents returns events', async () => {
        const res = makeRes()
        const req = makeReq({
            query: { page: '1', limit: '10' },
        })

        const events = [
            {
                _id: 'e1',
                title: 'Game 1',
                start: new Date(),
                end: new Date(),
            },
        ]

        Event.find.mockReturnValue(makeQueryChain(events))
        Event.countDocuments.mockResolvedValue(1)

        await AdminController.listEvents(req, res)

        expect(Event.find).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                total: 1,
                items: expect.arrayContaining([
                    expect.objectContaining({ title: 'Game 1' }),
                ]),
            })
        )
    })

    test('createEvent creates event', async () => {
        const res = makeRes()
        const req = makeReq({
            body: {
                title: 'Championship',
                start: '2025-06-01T10:00:00Z',
                end: '2025-06-01T12:00:00Z',
                location: 'Court 1',
            },
        })

        const ev = {
            _id: 'e2',
            title: 'Championship',
        }

        Event.create.mockResolvedValue(ev)

        await AdminController.createEvent(req, res)

        expect(Event.create).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(ev)
    })

    test('updateEvent updates event', async () => {
        const res = makeRes()
        const req = makeReq({
            params: { eventId: 'e3' },
            body: { title: 'Updated Title' },
        })

        const ev = { _id: 'e3', title: 'Updated Title' }

        Event.findByIdAndUpdate.mockReturnValue(leanResult(ev))

        await AdminController.updateEvent(req, res)

        expect(Event.findByIdAndUpdate).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith(ev)
    })

    test('deleteEvent deletes event', async () => {
        const res = makeRes()
        const req = makeReq({ params: { eventId: 'e4' } })

        Event.deleteOne.mockResolvedValue()

        await AdminController.deleteEvent(req, res)

        expect(Event.deleteOne).toHaveBeenCalledWith({ _id: 'e4' })
        expect(res.status).toHaveBeenCalledWith(200)
    })
})
