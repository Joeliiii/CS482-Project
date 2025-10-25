/**
 * Author: Nishant Gurung
 * USer Story S14
 */
const mongoose = require('mongoose');

//schema blueprint for the model
const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    message: { type: String, required: true },
    status: { type: String, default: 'unread' },
    created_at: { type: Date, default: Date.now }
});

//creating the mcontact model blueprint for the database
const contactModel = mongoose.models.Contact || mongoose.model('contact', ContactSchema);

//creating new contact messages
exports.create = async function(contatctdata) {
    //contactdata -- parameter for whatever is being passed to the function
    let contact = new contactModel(contatctdata);
    await contact.save();
    return contact; 
}

//read messages for testing and functioning 
//either sort, delete messages later
exports.readAll = async function(){
    let lstContacts = await contactModel.find();
    return lstContacts;
}

//for testing 
//admin control for spam
//user wants to remove
exports.readOne = async function(id){
    let contact = await contactModel.findById(id);
    //find().sort({name:'James'}).skip(0).limit(5);
    return contact;
}

//updating the status of the recieved contact messages
exports.update = async function (id, updateData){
    let contact = await contactModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true}
    );
    return contact;
}

//if admin wants to delete a spam or unwanted message
//user wants to remove the submission
exports.deleteOne = async function(id){
    let contact = await contactModel.findByIdAndDelete(id);
    return contact;
}

//for testing only, to start with a clear databse before each test
exports.deleteAll = async function(){
    await contactModel.deleteMany();
}