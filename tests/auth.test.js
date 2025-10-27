const { makeReq, makeRes, next, resetAll } = require('./helpers')
const { ensureLoggedIn } = require('../middleware/auth')

beforeEach(() => resetAll())

describe('auth.ensureLoggedIn', () => {
    test('blocks when not logged in', () => {
        const req = makeReq({ session: {} })
        const res = makeRes()
        ensureLoggedIn(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    test('passes when session has userId', () => {
        const req = makeReq({ session: { userId: 'u1' } })
        const res = makeRes()
        ensureLoggedIn(req, res, next)
        expect(next).toHaveBeenCalled()
    })
})
