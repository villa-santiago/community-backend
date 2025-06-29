const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

//Save a post to the logged-in user's savedPosts list
router.post("/saved-posts/:postId", isAuthenticated, (req, res) => {
  const userId = req.payload._id;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw { status: 404, message: "User not found" };
      }

      if (user.savedPosts.includes(postId)) {
        throw { status: 400, message: "Post already saved" };
      }

      user.savedPosts.push(postId);
      return user.save();
    })
    .then((updatedUser) => {
      res.status(200).json({
        message: "Post saved successfully",
        savedPosts: updatedUser.savedPosts,
      });
    })
    .catch((err) => {
      console.error("Save post error:", err);
      if (err.status) {
        res.status(err.status).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Failed to save post" });
      }
    });
});


//Remove a post from the logged-in user's savedPosts list
router.delete("/saved-posts/:postId", isAuthenticated, (req, res) => {
  const userId = req.payload._id;
  const { postId } = req.params;

 
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  
  User.findByIdAndUpdate(
    userId,
    { $pull: { savedPosts: postId } }, 
    { new: true } 
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Post removed from saved posts",
        savedPosts: updatedUser.savedPosts,
      });
    })
    .catch((err) => {
      console.error("Error removing saved post:", err);
      res.status(500).json({ message: "Failed to remove saved post" });
    });
});

// GET - Retrieve all saved posts for the logged-in user
router.get("/saved-posts", isAuthenticated, (req, res) => {
  const userId = req.payload._id;

  User.findById(userId)
    .populate("savedPosts")
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Saved posts retrieved successfully",
        savedPosts: user.savedPosts,
      });
    })
    .catch((err) => {
      console.error("Error fetching saved posts", err);
      res.status(500).json({ message: "Failed to retrieve saved posts" });
    });
});

// GET - Get all posts created by the logged-in user
router.get("/my-posts", isAuthenticated, (req, res) => {
  const userId = req.payload._id;

  Post.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "userName profileImage")
    .then((myPosts) => {
      res.status(200).json({
        message: "User's posts retrieved successfully",
        myPosts,
      });
    })
    .catch((err) => {
      console.error("Error retrieving user's posts:", err);
      res.status(500).json({ message: "Failed to fetch user's posts" });
    });
});







module.exports = router;