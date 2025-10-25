/**
 * Author: Nishant Gurung
 * User Story S14
 * API routes for contact form 
 */

const express = require('express');
const router = express.Router();
const contactModel = require('../model/contact.js');

//submit contact form
router.post('/', async (req,res) => {
    try {
        const{name, email, message} = req.body;

        if(!name || !email || !message){
            return res.status(400).json({error: 'Name, email, and message are required'})
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)){
            return res.status(400).json({error: 'Invalid email format'});
        }

        const contact = await contactModel.create({name, email, message});

        res.status(201).json({
            message: 'Contact message sent successfully!',
            id: contact._id
        });
    } catch(err){
        if (err.code === 11000){
            return res.status(409).json({error: 'Email already submitted'});
        }
        console.error('Contact submission error:', err);
        res.status(500).json({error: 'Server error'});
    }
});

//get all message
router.get('/', async (req, res) => {
    try {
        const messages = await contactModel.readAll();
        res.status(200).json(messages);
    }catch(err){
        console.error('Fetch contact error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//getting one message by ID
router.get('/:id', async (req, res) => {
    try {
        const message = await contactModel.readOne(req.params.id);

        if(!message){
            return res.status(404).json({error: 'Message not found'});
        }

        res.status(200).json(message);
    }catch(err){
        console.error('Fetch contact error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//update status
router.patch('/:id', async(req, res) => {
    try{
        const {status} = req.body;

        if(!['unread', 'read', 'resolved'].includes(status)){
            return res.status(400).json({error:'Invalid status'});
        }

        const message = await contactModel.update(req.params.id, {status});

        if (!message){
            return res.status(404).json({error: 'Message not found'});
        }

        res.status(200).json({
            message: 'Status updated successfully',
            data: message
        });

    }catch(err){
        console.error('Update content error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//delete a contact message
router.delete('/:id', async (req,res)=>{
    try{
        const message = await contactModel.deleteOne(req.params.id);

        if (!message){
            return res.status(404).json({error: 'Message not found'});
        }

        res.status(200).json({message: 'Contact message deleted successfully'});

    }catch(err){
        console.error('Delete contact error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;