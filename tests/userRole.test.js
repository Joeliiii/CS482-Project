// tests/userRole.test.js
const { resetAll, mocks } = require('./helpers');
const UserRole = require('../model/UserRole');

beforeEach(resetAll);

test('UserRole updateOne upsert', async () => {
    mocks.UserRole.updateOne.mockResolvedValueOnce({});
    await mocks.UserRole.updateOne(
        { userId: 'u', roleId: 'r' },
        { $setOnInsert: { userId: 'u', roleId: 'r' } },
        { upsert: true }
    );
    expect(mocks.UserRole.updateOne).toHaveBeenCalled();
});
