const { resetAll, mocks } = require('./helpers')

beforeEach(() => resetAll())

test('User.create called with expected fields', async () => {
    mocks.User.create.mockResolvedValueOnce({ _id: 'u1', email: 'x@y.com' })
    await mocks.User.create({ email: 'x@y.com', username: 'X', passwordHash: 'h', phone: '' })
    expect(mocks.User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'x@y.com' }))
})
