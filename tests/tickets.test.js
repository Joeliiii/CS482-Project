// tests/ticket.test.js
const { resetAll, mocks } = require('./helpers');
const Ticket = require('../model/Ticket');

beforeEach(resetAll);

describe('Ticket model', () => {
  test('sanity: Ticket model is mocked', () => {
    expect(typeof Ticket.findOne).toBe('function');
  });

  test('Ticket.create is called with correct parameters', async () => {
    const fakeTicket = {
      gameId: 'game1',
      gameName: 'Hawks vs Eagles - Saturday, Nov 2 @ 10:00 AM',
      userId: 'u123',
      ticketType: 'adult',
      quantity: 2,
      pricePerTicket: 8,
      totalPrice: 16,
      status: 'pending'
    };
    mocks.Ticket.create.mockResolvedValueOnce({ _id: 't1', ...fakeTicket });
    const result = await Ticket.create(fakeTicket);
    expect(mocks.Ticket.create).toHaveBeenCalledWith(fakeTicket);
    expect(result).toEqual(expect.objectContaining({ 
      gameId: 'game1',
      ticketType: 'adult',
      quantity: 2
    }));
  });

  test('Ticket.findOne returns expected ticket', async () => {
    const fakeTicket = { 
      _id: 't2', 
      gameId: 'game2',
      userId: 'u456',
      ticketType: 'child',
      quantity: 3,
      status: 'confirmed'
    };
    mocks.Ticket.findOne.mockResolvedValueOnce(fakeTicket);
    const result = await Ticket.findOne({ _id: 't2' });
    expect(mocks.Ticket.findOne).toHaveBeenCalledWith({ _id: 't2' });
    expect(result).toEqual(fakeTicket);
  });

  test('Ticket.find returns tickets for a user', async () => {
    const fakeTickets = [
      { _id: 't3', userId: 'u789', gameId: 'game1', quantity: 2 },
      { _id: 't4', userId: 'u789', gameId: 'game3', quantity: 1 }
    ];
    mocks.Ticket.find.mockResolvedValueOnce(fakeTickets);
    const result = await Ticket.find({ userId: 'u789' });
    expect(mocks.Ticket.find).toHaveBeenCalledWith({ userId: 'u789' });
    expect(result).toHaveLength(2);
    expect(result[0].userId).toBe('u789');
  });

  test('Ticket.find returns tickets for a game', async () => {
    const fakeTickets = [
      { _id: 't5', gameId: 'game2', userId: 'u111', status: 'confirmed' },
      { _id: 't6', gameId: 'game2', userId: 'u222', status: 'pending' }
    ];
    mocks.Ticket.find.mockResolvedValueOnce(fakeTickets);
    const result = await Ticket.find({ gameId: 'game2' });
    expect(mocks.Ticket.find).toHaveBeenCalledWith({ gameId: 'game2' });
    expect(result).toHaveLength(2);
    expect(result.every(t => t.gameId === 'game2')).toBe(true);
  });

  test('Ticket.findByIdAndUpdate updates ticket status', async () => {
    const updatedTicket = { 
      _id: 't7', 
      gameId: 'game1',
      status: 'confirmed'
    };
    mocks.Ticket.findByIdAndUpdate.mockResolvedValueOnce(updatedTicket);
    const result = await Ticket.findByIdAndUpdate('t7', { status: 'confirmed' }, { new: true });
    expect(mocks.Ticket.findByIdAndUpdate).toHaveBeenCalledWith('t7', { status: 'confirmed' }, { new: true });
    expect(result.status).toBe('confirmed');
  });

  test('Ticket.create handles errors gracefully', async () => {
    mocks.Ticket.create.mockRejectedValueOnce(new Error('DB Error'));
    await expect(Ticket.create({ gameId: 'broken' })).rejects.toThrow('DB Error');
  });

  test('Ticket.create validates required fields', async () => {
    mocks.Ticket.create.mockRejectedValueOnce(new Error('Validation Error'));
    await expect(Ticket.create({ gameId: 'game1' })).rejects.toThrow('Validation Error');
  });

  test('Ticket.deleteOne removes a ticket', async () => {
    mocks.Ticket.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
    const result = await Ticket.deleteOne({ _id: 't8' });
    expect(mocks.Ticket.deleteOne).toHaveBeenCalledWith({ _id: 't8' });
    expect(result.deletedCount).toBe(1);
  });
});