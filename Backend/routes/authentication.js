const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model("UserModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');
const protectedRoute = require('../middleware/protectedresource');

router.get('/', (req,res)=>{
    res.send('welcome to the mern course');
});

router.get('/secured', (req,res)=>{
    res.send('welcome to the secured area!');
});

router.post('/login', ()=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "one or more mandatory feild is required"});
    }
    UserModel.findOne()
    .then((dbUser)=>{
        if(!dbUser){
            return res.status(400).json({error: "user does not exist!"});
        }

        bcrypt.compare(password, dbUser.password)
        .then((didMatch)=>{
            if(didMatch){
                // res.status(200).json({result:"user logged in successfully"});
                // create and send  a token
                const jwtToken = jwt.sign({_id: dbUser._id}, JWT_SECRET);
                const {_id, fullname, email, followers, following , profilePicUrl} = dbUser;
                res.json({token: jwtToken, userInfo: { _id, fullname, email , followers, following, profilePicUrl}});
            }
            else{
                return res.status(400).json({error: "Invalid credentials!"});
            }
        });
    })
    .catch((error)=>{
        console.log(error);
    });
});

router.post('/register', (req,res)=>{
    console.log(req.body);
    const {fullName, email, password, profilePicUrl} = req.body;
    if(!fullName || !email || !password){
        return res.status(400).json({error: "one or more mandatory feild is required"});
    }

    UserModel.findOne({email:email})
    .then((dbUser)=>{
        if(dbUser){
            return res.status(500).json({error: "user withe email already existed"});
        }
        
        bcrypt.hash(password, 16)
        .then((hashedPassword)=>{
            const user = new UserModel({fullName, email, password: hashedPassword, profilePicUrl});

            user.save()
            .then((u)=>{
                res.status(201).json({result:"user registered successufully"});
            })
            .catch((error)=>{
                console.log(error);
            });
        });

    })
    
    .catch((error)=>{
        console.log(error);
    });
    
});

module.exports = router;        