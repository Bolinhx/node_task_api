const express = require('express');
const router = express.Router();
const User = require('../models/user');
const user = require('../models/user');

//get all

router.get('/', async (req, res) => {
try{
    const users = await User.find();
    res.send(users)
}catch(err){
    res.status(500).json({message: err.message });
}
});

//get one

router.get('/:id', getUser, (req,res) =>{
    res.json(res.user); 
});

//creating one

router.post('/', async (req, res) => {
    const user = new User({
       name: req.body.name,
       email: req.body.email, 
    });
    try{
        const newUser = await user.save();
        res.status(201).json(newUser);
    }catch(err){
        res.status(400).json({message: err.message });
    }
});

//updating one

router.patch('/:id', getUser, async (req,res) =>{
    if(req.body.name != null){
        res.user.name = req.body.name
    }
    if(req.body.email != null ){
        res.user.email = req.body.email
    }
    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
    
});

router.delete('/:id', getUser, async (req,res) => {
    try {
        await res.user.deleteOne();
        res.json({message: 'deleted user'})
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
});

async function getUser(req, res, next){
    let user;
    try {
        user = await User.findById(req.params.id)
        if (user == null){
            return res.status(404).json({message: 'Cannot find user'});
        }
    } catch (err) {
        return res.status(500).json({message: err.message});
    };

    res.user = user
    next()
}
module.exports = router;