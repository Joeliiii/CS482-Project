// Load helpers first
const H = require('./helpers');
const { makeReq, makeRes, resetAll, mocks, returnsLean } = H;

const path = require('path');
const UserController = require(path.join(process.cwd(), 'controller', 'UserController'));

beforeEach(resetAll);

describe('UserController.updateMe', () => {
    test('updates username/phone', async () => {
        mocks.User.findByIdAndUpdate.mockReturnValueOnce(
            returnsLean({
                _id: 'u1',
                email: 'a@b.com',
                username: 'New',
                phone: '999',
                isVerified: false,
                createdAt: new Date()
            })
        );

        const req = makeReq({ session: { userId: 'u1' }, body: { username: 'New', phone: '999' } });
        const res = makeRes();

        await UserController.updateMe(req, res);

        expect(mocks.User.findByIdAndUpdate).toHaveBeenCalled();
        // Controller sends { message, user }
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                user: expect.objectContaining({ username: 'New', phone: '999' })
            })
        );
    });
});

describe('UserController.getMe (optional)', () => {
    test('returns current user profile (skipped if not implemented)', async () => {
        if (typeof UserController.getMe !== 'function') {
            // Skip without failing if you haven’t added getMe to the controller yet
            return;
        }
        mocks.User.findById.mockReturnValueOnce(
            returnsLean({
                _id: 'u1',
                email: 'a@b.com',
                username: 'Alpha',
                phone: '',
                isVerified: false,
                createdAt: new Date()
            })
        );

        const req = makeReq({ session: { userId: 'u1' } });
        const res = makeRes();

        await UserController.getMe(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ email: 'a@b.com', username: 'Alpha' })
        );
    });
});
