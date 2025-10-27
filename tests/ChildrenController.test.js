// Load helpers first
const H = require('./helpers');
const { makeReq, makeRes, resetAll, mocks, returnsLean } = H;

const path = require('path');
const ChildrenController = require(path.join(process.cwd(), 'controller', 'ChildrenController'));

beforeEach(resetAll);

describe('ChildrenController', () => {
    test('listMine returns children when adult exists', async () => {
        mocks.Adult.findOne.mockReturnValueOnce(returnsLean({ _id: 'adult1' }));
        mocks.AdultChildLink.aggregate.mockResolvedValueOnce([
            { childId: 'c1', fullName: 'Kid One', birthdate: new Date(), photoUrl: '' }
        ]);

        const req = makeReq({ session: { userId: 'u1' } });
        const res = makeRes();

        await ChildrenController.listMine(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                children: expect.arrayContaining([expect.objectContaining({ fullName: 'Kid One' })])
            })
        );
    });

    test('createMine validates and creates child + link', async () => {
        mocks.Adult.findOne.mockReturnValueOnce(returnsLean({ _id: 'adult1' }));
        mocks.Child.create.mockResolvedValueOnce({
            _id: 'c1',
            fullName: 'Kid One',
            birthdate: new Date(),
            photoUrl: ''
        });
        mocks.AdultChildLink.create.mockResolvedValueOnce({});

        const req = makeReq({
            session: { userId: 'u1' },
            body: { fullName: 'Kid One', birthdate: new Date().toISOString(), relation: 'Parent', isPrimary: true }
        });
        const res = makeRes();

        await ChildrenController.createMine(req, res);

        expect(mocks.Child.create).toHaveBeenCalled();
        expect(mocks.AdultChildLink.create).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    test('deleteMine removes link', async () => {
        mocks.Adult.findOne.mockReturnValueOnce(returnsLean({ _id: 'adult1' }));
        mocks.AdultChildLink.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

        const req = makeReq({ session: { userId: 'u1' }, params: { childId: 'c1' } });
        const res = makeRes();

        await ChildrenController.deleteMine(req, res);

        expect(mocks.AdultChildLink.deleteOne).toHaveBeenCalledWith(
            expect.objectContaining({ adultId: 'adult1', childId: expect.any(Object) })
        );
       expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
});
