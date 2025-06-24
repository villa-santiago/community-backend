const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Post = require("../models/Post.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");

//POST - CREATE NEW POST IF USER IS LOGGEDIN
router.post("/", isAuthenticated, (req, res, next) => {
    const {service, description, category, location, email, phone} = req.body;
    const owner = req.payload._id;

    if(!service || !description || !category){
        return res.status(400).json({message: "required fields are missing"})
    }

    Post.create({
        owner,
        service,
        description,
        category,
        location,
        email,
        phone
    })
    .then((newPost) => res.status(201).json(newPost))
    .catch((err) => {
        console.log("Post creation error", err);
        res.status(500).json({message: "Error"});
    });
});  


module.exports = router;