// Load helpers (mocks) BEFORE controller
const H = require('./helpers');
const { makeReq, makeRes, resetAll, mocks, returnsLean } = H;

const path = require('path');
const LoginController = require(path.join(process.cwd(), 'controller', 'LoginController'));

const bcrypt = require('bcrypt');
jest.mock('bcrypt', () => ({ compare: jest.fn().mockResolvedValue(true) }));

beforeEach(() => {
    resetAll();
    bcrypt.compare.mockResolvedValue(true);
});

describe('LoginController.login', () => {
    test('invalid credentials -> 401', async () => {
        mocks.User.findOne.mockReturnValueOnce(returnsLean(null));
        const req = makeReq({ body: { email: 'x@y.com', password: 'bad' } });
        const res = makeRes();

        await LoginController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('success returns user and sets session (roles embedded on user)', async () => {
        mocks.User.findOne.mockReturnValueOnce(
            returnsLean({
                _id: 'u1',
                email: 'a@b.com',
                username: 'Alpha',
                passwordHash: 'hashed_pw',
                phone: '123',
                isVerified: false,
                createdAt: new Date()
            })
        );
        bcrypt.compare.mockResolvedValueOnce(true);

        // Your controller currently flattens role names onto user.roles (array of strings)
        mocks.UserRole.aggregate.mockResolvedValueOnce([{ name: 'user', displayName: 'User' }]);

        const req = makeReq({ body: { email: 'a@b.com', password: 'secret' } });
        const res = makeRes();

        await LoginController.login(req, res);

        expect(req.session.userId).toBe('u1');
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Logged in.',
                user: expect.objectContaining({
                    email: 'a@b.com',
                    username: 'Alpha',
                    roles: expect.arrayContaining(['user']) // <-- match your current shape
                })
            })
        );
    });
});
