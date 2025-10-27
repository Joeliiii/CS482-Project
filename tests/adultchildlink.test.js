// tests/adultchildlink.test.js
const { resetAll, mocks } = require('./helpers');
const AdultChildLink = require('../model/AdultChildLink');

beforeEach(resetAll);

test('AdultChildLink.create', async () => {
    mocks.AdultChildLink.create.mockResolvedValueOnce({ _id: 'l1' });
    await mocks.AdultChildLink.create({ adultId: 'a1', childId: 'c1', relation: 'Parent' });
    expect(mocks.AdultChildLink.create).toHaveBeenCalled();
});
