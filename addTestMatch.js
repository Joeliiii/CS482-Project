require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./model/Match');

async function addTestMatch() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create test match
        const testMatch = await Match.create({
            eventId: new mongoose.Types.ObjectId(), 
            teamA: 'Cavaliers',
            teamB: 'Warriors',
            scoreA: 93,
            scoreB: 89,
            status: 'final',
            start: new Date('2016-06-19'),
            court: 'Oracle Arena',
            videoId: 'EoVTttvKfRs',
            streamType: 'youtube',
            isLive: false,
            round: 7
        });

        console.log('Test match created successfully!');
        console.log(testMatch);

        await mongoose.connection.close();
        console.log('Done!');
    } catch (error) {
        console.error('Error creating test match:', error);
        process.exit(1);
    }
}

addTestMatch();