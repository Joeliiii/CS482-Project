// tests/adult.test.js
const { resetAll, mocks } = require('./helpers');
const Adult = require('../model/Adult');

beforeEach(resetAll);

test('Adult.updateOne upsert', async () => {
    mocks.Adult.updateOne.mockResolvedValueOnce({});
    await mocks.Adult.updateOne({ userId: 'u1' }, { $setOnInsert: { userId: 'u1' } }, { upsert: true });
    expect(mocks.Adult.updateOne).toHaveBeenCalled();
});
