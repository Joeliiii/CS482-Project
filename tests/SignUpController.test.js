// IMPORTANT: load helpers (which installs jest model mocks) BEFORE requiring controllers
const H = require('./helpers');
const { makeReq, makeRes, resetAll, mocks, returnsLean } = H;

const path = require('path');
const SignupController = require(path.join(process.cwd(), 'controller', 'SignupController'));

jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hashed_pw') }));

beforeEach(resetAll);

describe('SignupController.signup', () => {
    test('user flow creates user + assigns user role', async () => {
        // No duplicate email
        mocks.User.findOne.mockReturnValueOnce(returnsLean(null));
        // Upsert "user" role (controller calls .lean())
        mocks.Role.findOneAndUpdate.mockReturnValueOnce(returnsLean({ _id: 'r_user', name: 'user' }));
        // Create user
        mocks.User.create.mockResolvedValueOnce({ _id: 'u1', email: 'a@b.com' });
        // Link role
        mocks.UserRole.updateOne.mockResolvedValueOnce({});

        const req = makeReq({
            body: { email: 'a@b.com', username: 'Alpha', password: 'secret', phone: '123', accountType: 'user' }
        });
        const res = makeRes();

        await SignupController.signup(req, res);

        expect(mocks.User.create).toHaveBeenCalled();
        expect(mocks.Role.findOneAndUpdate).toHaveBeenCalledWith(
            { name: 'user' },
            expect.any(Object),
            expect.objectContaining({ upsert: true, new: true })
        );
        expect(mocks.UserRole.updateOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('adult flow requires extra fields and creates Adult', async () => {
        mocks.User.findOne.mockReturnValueOnce(returnsLean(null));
        mocks.Role.findOneAndUpdate.mockReturnValueOnce(returnsLean({ _id: 'r_user', name: 'user' }));  // base role
        mocks.Role.findOneAndUpdate.mockReturnValueOnce(returnsLean({ _id: 'r_adult', name: 'adult' })); // adult role
        mocks.User.create.mockResolvedValueOnce({ _id: 'u2', email: 'c@d.com' });
        mocks.UserRole.updateOne.mockResolvedValue({});
        mocks.Adult.updateOne.mockResolvedValue({}); // upsert adult profile

        const req = makeReq({
            body: {
                email: 'c@d.com',
                username: 'Bravo',
                password: 'secret',
                accountType: 'adult',
                address: '123 Main',
                govIdType: 'license',
                govIdLast4: '1234'
            }
        });
        const res = makeRes();

        await SignupController.signup(req, res);

        expect(mocks.Adult.updateOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('duplicate email returns 409', async () => {
        mocks.User.findOne.mockReturnValueOnce(returnsLean({ _id: 'exists' }));

        const req = makeReq({ body: { email: 'x@y.com', username: 'Z', password: 'secret' } });
        const res = makeRes();

        await SignupController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });
});
