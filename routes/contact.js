/**
 * Author: Nishant Gurung
 * User Story S14
 * API routes for contact form 
 */

const express = require('express');
const router = express.Router();
const contactModel = require('../models/contact.js');

//submit contact form
router.post('/', async (req,res) => {
    try {
        const{name, email, message} = req.body;

        if(!name || !email || !message){
            return res.status(400).json({error: 'Name, email, and message are required'})
        }

        const emailRegex = /^[^\s@+@[^\s@+\.[^\s@]+$/;
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
router.get('/:id', async (req, res) => {
    try {

    }catch(err){
        console.error('Fetch contact error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});


// get contact message by ID
...

//update status
router.patch('/:id', async(req, res) => {
    try{

    }catch(err){
        console.error('Update content error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//delete a contact message
router.delete('/:id', async (req,res)=>{
    try{

    }catch(err){
        console.error('Delete contact error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;