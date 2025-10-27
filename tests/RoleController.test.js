// tests/RoleController.test.js
const H = require('./helpers');
const { makeReq, makeRes, resetAll, mocks, returnsLean } = H;

const path = require('path');
const RoleController = require(path.join(process.cwd(), 'controller', 'RoleController'));

beforeEach(resetAll);

describe('RoleController', () => {
    test('assignRole links user to role', async () => {
        mocks.User.findById.mockReturnValueOnce(returnsLean({ _id: 'u1', email: 'alpha@test.com' }));
        mocks.Role.findOne.mockReturnValueOnce(returnsLean({ _id: 'r1', name: 'coach' }));
        mocks.UserRole.updateOne.mockResolvedValueOnce({});

        const req = makeReq({ body: { userId: 'u1', roleName: 'coach' } });
        const res = makeRes();

        await RoleController.assignRole(req, res);

        expect(mocks.UserRole.updateOne).toHaveBeenCalledWith(
            expect.objectContaining({ userId: expect.anything(), roleId: 'r1' }),
            expect.objectContaining({ $setOnInsert: expect.objectContaining({ roleId: 'r1' }) }),
            expect.objectContaining({ upsert: true })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('revokeRole removes link', async () => {
        mocks.Role.findOne.mockReturnValueOnce(returnsLean({ _id: 'r1', name: 'coach' }));
        mocks.UserRole.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

        const req = makeReq({ body: { userId: 'u1', roleName: 'coach' } });
        const res = makeRes();

        await RoleController.revokeRole(req, res);

        expect(mocks.UserRole.deleteOne).toHaveBeenCalledWith(
            expect.objectContaining({ roleId: 'r1', userId: expect.anything() })
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('listUserRoles aggregates roles', async () => {
        mocks.UserRole.aggregate.mockResolvedValueOnce([{ name: 'user', displayName: 'User' }]);

        const req = makeReq({ params: { userId: 'u1' } });
        const res = makeRes();

        await RoleController.listUserRoles(req, res);

        expect(mocks.UserRole.aggregate).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                roles: expect.arrayContaining([expect.objectContaining({ name: 'user' })]),
            })
        );
    });
});
