const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const protectedresource = require('../middleware/protectedresource');
const protectedRoute = require('../middleware/protectedresource');
const PostModel = mongoose.model("PostModel");


router.get('/posts',protectedresource, (req,res)=>{
    PostModel.find()
    .populate("comments.commentedBy" , "_id fullName profilePicUrl")
    .populate("author")
    .then((dbPosts)=>{
        res.status(200).json({posts: dbPosts});
    })
    .catch((error) => {
        console.log(error);
    });
});

router.get('/myposts',protectedRoute, (req,res)=>{
    PostModel.find({author: req.dbUser._id})
    .populate("comments.commentedBy" , "_id fullName profilePicUrl")
    .populate("author")
    .then((dbPosts)=>{
        res.status(200).json({posts: dbPosts});
    })
    .catch((error) => {
        console.log(error);
    });
});

router.get('/postsfromfollowing',protectedresource, (req,res)=>{
    PostModel.find({author: {$in: req.dbUser.following} })
    .populate("comments.commentedBy" , "_id fullName profilePicUrl")
    .populate("author", "id_fullName profilePicUrl")
    .then((dbPosts)=>{
        res.status(200).json({posts: dbPosts});
    })
    .catch((error) => {
        console.log(error);
    });
});


router.post('./createpost',protectedresource ,(req,res) =>{
    const {title,body, image} = req.body;

    if(!title || !body || !image){
        return res.status(400).json({error: "one or more mandatory feild is required"});
    }
    // console.log(req.dbUser);
    // res.send("Done");
    req.dbUser.password = undefined;

    const post = new PostModel({title,body,image: image, author: req.dbUser});

    post.save()
    .then((dbPost)=>{
        res.status(201).json({post: dbPost});
    })
    .catch((error) => {
        console.log(error);
    });
})

router.put('/like', protectedRoute, (req,res) => {
    PostModel.findByIdAndUpdate(req.body.postId, {
        $push: {likes: req.dbUser._id}
    } ,{
        new:  true //return updated data
    })
    .populate("author", "._id fullName")
    .exec((error, result) => {
        if(error){
            return res.status(400).json({error: error});
        }
        else{
            res.json(result);
        }
    })
})


router.put('/unlike', protectedRoute, (req,res) => {
    PostModel.findByIdAndUpdate(req.body.postId, {
        $pull: {likes: req.dbUser._id}
    } ,{
        new:  true //return updated data
    })
    .populate("author", "._id fullName")
    .exec((error, result) => {
        if(error){
            return res.status(400).json({error: error});
        }
        else{
            res.json(result);
        }
    })
})


router.put('/comment', protectedRoute, (req,res) => {

    const comment = {
        commentText : req.body.commentText,
        commentedBy : req.dbUser._id
    };


    PostModel.findByIdAndUpdate(req.body.postId, {
        $push: {comments: comment}
    } ,{
        new:  true //return updated data
    })
    .populate("comments.commentedBy" , "_id fullName")
    .populate("author", "._id fullName")
    .exec((error, result) => {
        if(error){
            return res.status(400).json({error: error});
        }
        else{
            res.json(result);
        }
    })
});


router.delete("/deletepost/:postId", protectedRoute, (req,res) => {
    PostModel.findOne({_id: req.params.postId})
    .populate("author", "_id")
    .exec((error,post) => {
        if(error){
            return res.status(400).json({error: error});
        }
        //CHECKING IF the post user is same as logged in user
        if(post.author._id.toString() === req.dbUser._id.toString()){
            post.remove()
            .then( (data) => {
                res.json({result: data})
            })
            .catch((error) => {
                console.log(error);
            });
        }
    })
});

module.exports = router;
