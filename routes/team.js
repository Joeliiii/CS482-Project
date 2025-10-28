/**
 * Author: Nishant Gurung
 * User Story S9
 */

const express = require('express');
const router = express.Router();
const teamModel = require('../model/team.js');

//submit contact form
router.post('/', async (req,res) => {
    try {
        const{name, season, coach, logo} = req.body;

        if(!name || !season){
            return res.status(400).json({error: 'Team name and Season are required'})
        }

        if (!/^\d{4}$/.test(season)){
            return res.status(400).json({error: 'Invalid season format'});
        }

        const team = await teamModel.create({name, season, coach, logo});

        res.status(201).json({
            message: 'Team created successfully!',
            id: team._id
        });
    } catch(err){
        if (err.code === 11000){
            return res.status(409).json({error: 'Team already exists in this season'});
        }
        console.error('Team creation error:', err);
        res.status(500).json({error: 'Server error'});
    }
});

//get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await teamModel.readAll();
        res.status(200).json(teams);
    }catch(err){
        console.error('Fetch teams error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//getting team by season
router.get('/season/:season', async (req, res) => {
    try {
        const team = await teamModel.readBySeason(req.params.id);
        res.status(200).json(teams);
    }catch(err){
        console.error('Fetch team error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//getting team by name
router.get('/by-name/:name', async (req, res) => {
    try {
        const team = await teamModel.readByName(req.params.id);
        if(!team){
            return res.status(404).json({error: 'Team not found'});
        }
        res.status(200).json(team);
    }catch(err){
        console.error('Fetch team error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//getting team by ID
router.get('/:id', async (req, res) => {
    try {
        const team = await teamModel.readOne(req.params.id);
   
        if(!team){
            return res.status(404).json({error: 'Team not found'});
        }

        res.status(200).json(teams);
    }catch(err){
        console.error('Fetch team error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//update team info
router.patch('/:id', async(req, res) => {
    try{
        const team = await teamModel.update(req.params.id, req.body);

        if(!team){
            return res.status(404).json({error:'Team not found'});
        }

        res.status(200).json({
            message: 'Team updated successfully',
            data: team
        });

    }catch(err){
        console.error('Update team error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//update team logo
router.patch('/:id', async(req, res) => {
    try{
        const team = await teamModel.update(req.params.id, req.body);

        if(!team){
            return res.status(404).json({error:'Team not found'});
        }

        res.status(200).json({
            message: 'Logo updated successfully',
            data: team
        });

    }catch(err){
        console.error('Update logo error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

//delete team
router.delete('/:id', async (req,res)=>{
    try{
        const team = await teamModel.deleteOne(req.params.id);

        if (!team){
            return res.status(404).json({error: 'Team not found'});
        }

        res.status(200).json({message: 'Team deleted successfully'});

    }catch(err){
        console.error('Delete team error: ', err);
        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;