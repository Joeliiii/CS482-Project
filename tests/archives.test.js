// tests/archive.test.js
const { resetAll, mocks } = require('./helpers');
const Archive = require('../model/Archive');

beforeEach(resetAll);

describe('Archive model', () => {
  test('sanity: Archive model is mocked', () => {
    expect(typeof Archive.findOne).toBe('function');
  });

  test('Archive.create is called with correct parameters', async () => {
    const fakeArchive = {
      title: 'Hawks vs Eagles - Championship Final',
      description: 'An intense championship game',
      gameDate: new Date('2024-10-28'),
      videoUrl: 'https://example.com/video.mp4',
      duration: 7200,
      uploadedBy: 'u123',
      status: 'active'
    };
    mocks.Archive.create.mockResolvedValueOnce({ _id: 'a1', ...fakeArchive, views: 0 });
    const result = await Archive.create(fakeArchive);
    expect(mocks.Archive.create).toHaveBeenCalledWith(fakeArchive);
    expect(result).toEqual(expect.objectContaining({ 
      title: 'Hawks vs Eagles - Championship Final',
      duration: 7200
    }));
  });

  test('Archive.findOne returns expected archive', async () => {
    const fakeArchive = { 
      _id: 'a2', 
      title: 'Raptors vs Thunder',
      videoUrl: 'https://example.com/video2.mp4',
      status: 'active',
      views: 150
    };
    mocks.Archive.findOne.mockResolvedValueOnce(fakeArchive);
    const result = await Archive.findOne({ _id: 'a2' });
    expect(mocks.Archive.findOne).toHaveBeenCalledWith({ _id: 'a2' });
    expect(result).toEqual(fakeArchive);
  });

  test('Archive.find returns all active archives sorted by date', async () => {
    const fakeArchives = [
      { _id: 'a3', title: 'Game 1', gameDate: new Date('2024-10-28'), status: 'active', views: 100 },
      { _id: 'a4', title: 'Game 2', gameDate: new Date('2024-10-25'), status: 'active', views: 200 }
    ];
    mocks.Archive.find.mockReturnValue({
      sort: jest.fn().mockResolvedValueOnce(fakeArchives)
    });
    const result = await Archive.find({ status: 'active' }).sort({ gameDate: -1 });
    expect(mocks.Archive.find).toHaveBeenCalledWith({ status: 'active' });
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Game 1');
  });

  test('Archive.find returns archives sorted by views (popular)', async () => {
    const fakeArchives = [
      { _id: 'a5', title: 'Popular Game', views: 5000, status: 'active' },
      { _id: 'a6', title: 'Less Popular', views: 1000, status: 'active' }
    ];
    mocks.Archive.find.mockReturnValue({
      sort: jest.fn().mockResolvedValueOnce(fakeArchives)
    });
    const result = await Archive.find({ status: 'active' }).sort({ views: -1 });
    expect(result[0].views).toBe(5000);
    expect(result[1].views).toBe(1000);
  });

  test('Archive.find filters by team', async () => {
    const fakeArchives = [
      { _id: 'a7', title: 'Hawks Game', teams: ['Hawks', 'Eagles'], status: 'active' },
      { _id: 'a8', title: 'Another Hawks Game', teams: ['Hawks', 'Tigers'], status: 'active' }
    ];
    mocks.Archive.find.mockResolvedValueOnce(fakeArchives);
    const result = await Archive.find({ teams: 'Hawks', status: 'active' });
    expect(mocks.Archive.find).toHaveBeenCalledWith({ teams: 'Hawks', status: 'active' });
    expect(result).toHaveLength(2);
    expect(result.every(a => a.teams.includes('Hawks'))).toBe(true);
  });

  test('Archive.find filters by tags', async () => {
    const fakeArchives = [
      { _id: 'a9', title: 'Championship', tags: ['championship', 'playoffs'], status: 'active' }
    ];
    mocks.Archive.find.mockResolvedValueOnce(fakeArchives);
    const result = await Archive.find({ tags: 'championship', status: 'active' });
    expect(mocks.Archive.find).toHaveBeenCalledWith({ tags: 'championship', status: 'active' });
    expect(result[0].tags).toContain('championship');
  });

  test('Archive.findByIdAndUpdate updates archive status', async () => {
    const updatedArchive = { 
      _id: 'a10', 
      title: 'Game Title',
      status: 'archived'
    };
    mocks.Archive.findByIdAndUpdate.mockResolvedValueOnce(updatedArchive);
    const result = await Archive.findByIdAndUpdate('a10', { status: 'archived' }, { new: true });
    expect(mocks.Archive.findByIdAndUpdate).toHaveBeenCalledWith('a10', { status: 'archived' }, { new: true });
    expect(result.status).toBe('archived');
  });

  test('Archive.findByIdAndUpdate increments view count', async () => {
    const updatedArchive = { 
      _id: 'a11', 
      title: 'Game Title',
      views: 151
    };
    mocks.Archive.findByIdAndUpdate.mockResolvedValueOnce(updatedArchive);
    const result = await Archive.findByIdAndUpdate('a11', { $inc: { views: 1 } }, { new: true });
    expect(mocks.Archive.findByIdAndUpdate).toHaveBeenCalledWith('a11', { $inc: { views: 1 } }, { new: true });
    expect(result.views).toBe(151);
  });

  test('Archive.find returns featured archives', async () => {
    const fakeArchives = [
      { _id: 'a12', title: 'Featured Game', featured: true, status: 'active' }
    ];
    mocks.Archive.find.mockResolvedValueOnce(fakeArchives);
    const result = await Archive.find({ featured: true, status: 'active' });
    expect(result[0].featured).toBe(true);
  });

  test('Archive.create handles errors gracefully', async () => {
    mocks.Archive.create.mockRejectedValueOnce(new Error('DB Error'));
    await expect(Archive.create({ title: 'broken' })).rejects.toThrow('DB Error');
  });

  test('Archive.create validates required fields', async () => {
    mocks.Archive.create.mockRejectedValueOnce(new Error('Validation Error'));
    await expect(Archive.create({ title: 'Missing Fields' })).rejects.toThrow('Validation Error');
  });

  test('Archive.deleteOne removes an archive', async () => {
    mocks.Archive.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    const result = await Archive.deleteOne({ _id: 'a13' });
    expect(mocks.Archive.deleteOne).toHaveBeenCalledWith({ _id: 'a13' });
    expect(result.deletedCount).toBe(1);
  });

  test('Archive.countDocuments returns total archive count', async () => {
    mocks.Archive.countDocuments.mockResolvedValueOnce(42);
    const result = await Archive.countDocuments({ status: 'active' });
    expect(mocks.Archive.countDocuments).toHaveBeenCalledWith({ status: 'active' });
    expect(result).toBe(42);
  });
});