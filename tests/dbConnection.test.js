// tests/dbConnection.test.js
const { mongoose } = require('./helpers');
const dbcon = require('../model/DBConnection');

describe('DBConnection', () => {
    test('connect uses env and connects', async () => {
        process.env.DB_HOST = 'cluster.example.net';
        process.env.DB_USER = 'userx';
        process.env.DB_PASS = '12345';
        process.env.DB_NAME_REAL = 'RealDatabase';
        process.env.DB_NAME_TEST = 'TestInfo';
        process.env.DB_TARGET = 'real';

        await dbcon.connect('real');
        expect(mongoose.connect).toHaveBeenCalled();
    });

    test('disconnect closes connection', async () => {
        await dbcon.disconnect();
        expect(mongoose.connection.close).toHaveBeenCalled();
    });
});
