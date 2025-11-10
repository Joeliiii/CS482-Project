/**
 * Author: Nishant Gurung
 * User Story S0
 */
const mongoose = require('mongoose');

//schema blueprint for the model
const ScheduleSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true }, 
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    venue: { type: String, required: true },
    season: { type: String, required: true }, 
    status: { 
        type: String, 
        default: 'scheduled',
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled']
    },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

//indexes for queries
ScheduleSchema.index({ date: 1, season: 1 });
ScheduleSchema.index({ homeTeam: 1, awayTeam: 1, date: 1 }, { unique: true });

//creating the schedule model blueprint for the database
const scheduleModel = mongoose.models.Schedule || mongoose.model('schedule', ScheduleSchema);

//creating new event/game 
exports.create = async function(scheduleData) {
    let schedule = new scheduleModel(scheduleData);
    await schedule.save();
    return schedule;
};

//read messages for testing and functioning 
//either sort, delete messages later
exports.readAll = async function(){
   //let lstContacts = await contactModel.find();
   //return lstContacts;
   return await scheduleModel.find({}).sort({ date: 1, time: 1});
};

//for testing 
//admin control for spam
//user wants to remove
exports.readOne = async function(id){
    //let contact = await contactModel.findById(id);
    //find().sort({name:'James'}).skip(0).limit(5);
    //return contact;
    return await scheduleModel.findById(id);
};

// events by season
exports.readBySeason = async function(season) {
    return await scheduleModel.find({ season: season }).sort({ date: 1, time: 1 });
};

// events by date range
exports.readByDateRange = async function(startDate, endDate) {
    return await scheduleModel.find({
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1, time: 1 });
};

// events by team (either home or away)
exports.readByTeam = async function(teamName) {
    return await scheduleModel.find({
        $or: [
            { homeTeam: teamName },
            { awayTeam: teamName }
        ]
    }).sort({ date: 1, time: 1 });
};

// upcoming events
exports.readUpcoming = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await scheduleModel.find({
        date: { $gte: today },
        status: { $in: ['scheduled', 'in-progress'] }
    }).sort({ date: 1, time: 1 });
};

//updating event
exports.update = async function (id, updateData){
    updateData.updated_at = Date.now();
    let schedule = await scheduleModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true}
    );
    return schedule;
};

//if admin wants to delete a spam or unwanted message
//user wants to remove the submission
exports.deleteOne = async function(id){
    let schedule = await scheduleModel.findByIdAndDelete(id);
    return schedule;
};

//for testing only, to start with a clear databse before each test
exports.deleteAll = async function(){
    await scheduleModel.deleteMany();
};