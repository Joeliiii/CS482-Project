require('dotenv').config();
const mongoose = require('mongoose');
const Match = require('./model/Match');

async function addTestMatch() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingMatch = await Match.findOne({});
        
        if (existingMatch) {
            console.log('Found existing match, updating it...');
            existingMatch.videoId = 'EoVTttvKfRs';
            existingMatch.streamType = 'youtube';
            existingMatch.isLive = false;
            existingMatch.teamA = 'Cavaliers';
            existingMatch.teamB = 'Warriors';
            existingMatch.scoreA = 93;
            existingMatch.scoreB = 89;
            existingMatch.status = 'final';
            
            await existingMatch.save();
            console.log('Match updated successfully!');
            console.log(existingMatch);
        } else {
            console.log('No matches found in database!');
        }

        await mongoose.connection.close();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addTestMatch();