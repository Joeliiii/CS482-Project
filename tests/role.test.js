// tests/role.test.js
const { resetAll, mocks } = require('./helpers');
const Role = require('../model/Role');

beforeEach(resetAll);

describe('Role model', () => {
    test('sanity: Role model is mocked', () => {
        expect(typeof Role.findOne).toBe('function');
    });

    test('Role.create is called with correct parameters', async () => {
        const fakeRole = { name: 'admin' };
        mocks.Role.create.mockResolvedValueOnce({ _id: 'r1', ...fakeRole });

        const result = await Role.create(fakeRole);

        expect(mocks.Role.create).toHaveBeenCalledWith(fakeRole);
        expect(result).toEqual(expect.objectContaining({ name: 'admin' }));
    });

    test('Role.findOne returns expected role', async () => {
        const fakeRole = { _id: 'r2', name: 'user' };
        mocks.Role.findOne.mockResolvedValueOnce(fakeRole);

        const result = await Role.findOne({ name: 'user' });

        expect(mocks.Role.findOne).toHaveBeenCalledWith({ name: 'user' });
        expect(result).toEqual(fakeRole);
    });

    test('Role.create handles errors gracefully', async () => {
        mocks.Role.create.mockRejectedValueOnce(new Error('DB Error'));

        await expect(Role.create({ name: 'broken' })).rejects.toThrow('DB Error');
    });
});
