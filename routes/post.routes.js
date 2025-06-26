const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Post = require("../models/Post.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");

//POST - CREATE NEW POST IF USER IS AUTHENTICATED
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

//POST - GET ALL POSTS, DISREGARDING AUTH STATUS
router.get("/", (req, res, next) => {
    Post.find()
    .sort({createdAt: -1})
    .populate("owner", "userName")
    .then((allPosts) => {
        res.status(200).json(allPosts);
    })
    .catch((err) => {
        console.log("Error retrieving posts", err);
        res.status(500).json({message: "Failed to fetch posts"});
    });
});

//POST - GET POST BY ID
router.get("/:postId", (req, res) => {
    const {postId} = req.params;
     if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

    Post.findById(postId)
    .populate("owner", "userName profileImage")
    .then(post => {
        if(!post) {
            return res.status(404).json({message: "Post not found"});
        }
        res.status(200).json(post);
    })
    .catch(err => {
        console.log("Error retrieving post", err);
        res.status(500).json({message:"Error"});
    });
});

//POST - EDIT POST BY ID
router.put("/:postId", isAuthenticated, (req, res, next) => {
  const { postId } = req.params;
  const updateData = req.body;
  const loggedInUserId = req.payload._id;

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

     
      if (post.owner.toString() !== loggedInUserId) {
        return res.status(403).json({ message: "Unauthorized to edit this post" });
      }

      
      return Post.findByIdAndUpdate(postId, updateData, {
        new: true,
        runValidators: true,
      });
    })
    .then((updatedPost) => {
      res.status(200).json(updatedPost);
    })
    .catch((err) => {
      console.error("Update error:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Failed to update post" });
    });
});

// POST - DELETE POST BY ID
router.delete("/:postId", isAuthenticated, (req, res, next) => {
  const { postId } = req.params;
  const loggedInUserId = req.payload._id;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.status(404).json({ message: `Post ${postId} not found` });
      }

      if (post.owner.toString() !== loggedInUserId) {
        return res.status(403).json({ message: "Unauthorized to delete this post" });
      }

      return Post.findByIdAndDelete(postId);
    })
    .then((deletedPost) => {
      if (deletedPost) {
        console.log(`Post ${postId} successfully deleted`);
        res.status(200).json({ message: `Post ${postId} has been deleted` });
      }
    })
    .catch((err) => {
      console.error("Delete error:", err);
      res.status(500).json({ message: "Failed to delete post" });
    });
});

    







module.exports = router;