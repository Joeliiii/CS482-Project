/**
 * Model for Team 
 * User Story S9 - team logos and profiles
 */

const mongoose = require('mongoose');

//schema blueprint for the model
const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true},
    season: { type: String, required: true},
    coach: { type: String, required: false },
    logo: { type: String, default: 'logo.png' },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    playerCount: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

TeamSchema.index({ name: 1, season: 1 }, { unique: true });

//creating the team model blueprint for the database
const teamModel = mongoose.models.Team || mongoose.model('team', TeamSchema);

//creating new team
exports.create = async function(teamData) {
    //contactdata -- parameter for whatever is being passed to the function
    let team = new teamModel(teamData);
    await team.save();
    return team; 
}

//read messages for testing and functioning 
//either sort, delete messages later
exports.readAll = async function(){
   //let lstContacts = await contactModel.find();
   //return lstContacts;
   return await teamModel.find({});
}

//for testing 
//admin control for spam
//user wants to remove
exports.readOne = async function(id){
    //let contact = await contactModel.findById(id);
    //find().sort({name:'James'}).skip(0).limit(5);
    //return contact;
    return await teamModel.findById(id);
}

exports.readByName = async function(name){
    //let contact = await contactModel.findById(id);
    //find().sort({name:'James'}).skip(0).limit(5);
    //return contact;
    return await teamModel.findOne({name:name});
}

exports.readBySeason = async function(season){
    //let contact = await contactModel.findById(id);
    //find().sort({name:'James'}).skip(0).limit(5);
    //return contact;
    return await teamModel.find({season: season});
}

//updating the status of the teams
exports.update = async function (id, updateData){
    let team = await teamModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true}
    );
    return team;
}

//if admin wants to delete a specific team
//user wants to remove the submission
exports.deleteOne = async function(id){
    let team = await teamModel.findByIdAndDelete(id);
    return team;
}

//for testing only, to start with a clear databse before each test
exports.deleteAll = async function(){
    await teamModel.deleteMany();
}