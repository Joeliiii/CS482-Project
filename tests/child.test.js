// tests/child.test.js
const { resetAll, mocks } = require('./helpers');
const Child = require('../model/Child');

beforeEach(resetAll);

test('Child.create', async () => {
    mocks.Child.create.mockResolvedValueOnce({ _id: 'c1' });
    await mocks.Child.create({ fullName: 'Kid', birthdate: new Date() });
    expect(mocks.Child.create).toHaveBeenCalled();
});
