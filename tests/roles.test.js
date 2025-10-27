// tests/roles.test.js
const { makeReq, makeRes, next, resetAll, mocks, returnsLean } = require('./helpers')
const { requireRole } = require('../middleware/roles')

beforeEach(() => resetAll())

test('Role mock sanity', () => {
    const Role = require('../model/Role')
    expect(Role.findOne._isMockFunction).toBe(true)
})

describe('roles.requireRole', () => {
    test('forbids when user lacks role', async () => {
        // Role.findOne(...).lean() -> role doc
        mocks.Role.findOne.mockReturnValueOnce(returnsLean({ _id: 'r_admin', name: 'admin' }))
        // UserRole.findOne(...).lean() -> null (no link)
        mocks.UserRole.findOne.mockReturnValueOnce(returnsLean(null))

        const mw = requireRole('admin')
        const req = makeReq({ session: { userId: 'u1' } })
        const res = makeRes()

        await mw(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(next).not.toHaveBeenCalled()
    })

    test('allows when user has role', async () => {
        // Role.findOne(...).lean() -> role doc
        mocks.Role.findOne.mockReturnValueOnce(returnsLean({ _id: 'r_admin', name: 'admin' }))
        // UserRole.findOne(...).lean() -> link exists
        mocks.UserRole.findOne.mockReturnValueOnce(returnsLean({ userId: 'u1', roleId: 'r_admin' }))

        const mw = requireRole('admin')
        const req = makeReq({ session: { userId: 'u1' } })
        const res = makeRes()

        await mw(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    test('handles missing role config', async () => {
        // Role.findOne(...).lean() -> null (role not configured)
        mocks.Role.findOne.mockReturnValueOnce(returnsLean(null))

        const mw = requireRole('ghost')
        const req = makeReq({ session: { userId: 'u1' } })
        const res = makeRes()

        await mw(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
    })
})
