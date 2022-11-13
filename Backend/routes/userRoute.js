const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protectedresource = require('../middleware/protectedresource');
const protectedRoute = require('../middleware/protectedresource');
const PostModel = mongoose.model("PostModel");
const UserModel = mongoose.model("UserModel");


// endpoint to get user details of another user(not the loggedin user) along with their posts
router.get('/user/:userId',protectedresource, (req,res) => {
    UserModel.findOne({_id: req.params.userId})
    .select("-password") // fetch everything except the password
    .then((userFound) => {
        //fetch all posts of this found user
        PostModel.find({author: req.params.userId})
        .populate("author", "_id fullName")
        .exec((error, allPosts) => {
            if(error){
                return res.status(400).json({error: error});
            }
            res.json({user: userFound, posts: allPosts})
        })
    })
    .catch((error) => {
        return res.status(400).json({error: "User is not found!"})
    });
})

router.put(('/follow'), protectedRoute, (req,res) => {
    //sceaniro: logged in user is trying to follow a non-logged in User
    // req.body.followId = userid OF NOT LOGGEDIN uSER
    UserModel.findByIdAndUpdate(req.body.followId,{
        $push: {followers: req.dbUser._id} //push the userId of logged in user
    },{
        new: true
    },(error, result)=> {
        if(error){
            return res.status(400).json({error: error})
        }

         // req.body.followId = userid is LOGGEDIN uSER
        UserModel.findByIdAndUpdate(req.dbUser._id, {
            $push: {following: req.body.followId} //push the userId of not  logged in user
        }, 
        {new:true})
        .select("-password")
        .then(result => res.json(result))
        .catch((error) => {
            return res.status(400).json({error: error})
        });
    })
});


router.put(('/unfollow'), protectedRoute, (req,res) => {
    //sceaniro: logged in user is trying to follow a non-logged in User
    // req.body.followId = userid OF NOT LOGGEDIN uSER
    UserModel.findByIdAndUpdate(req.body.unfollowId,{
        $pull: {followers: req.dbUser._id} //push the userId of logged in user
    },{
        new: true
    },(error, result)=> {
        if(error){
            return res.status(400).json({error: error})
        }

         // req.body.followId = userid is LOGGEDIN uSER
        UserModel.findByIdAndUpdate(req.dbUser._id, {
            $pull: {following: req.body.unfollowId} //push the userId of not  logged in user
        }, 
        {new:true})
        .select("-password")
        .then(result => res.json(result))
        .catch((error) => {
            return res.status(400).json({error: error})
        });
    })
});


module.exports = router;
