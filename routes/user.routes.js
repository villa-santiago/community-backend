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
        return res.status(404).json({ message: "User not found" });
      }

      
      if (user.savedPosts.includes(postId)) {
        return res.status(400).json({ message: "Post already saved" });
      }

      
      user.savedPosts.push(postId);

     
      return user.save();
    })
    .then((updatedUser) => {
      res.status(200).json({ message: "Post saved successfully", savedPosts: updatedUser.savedPosts });
    })
    .catch((err) => {
      console.error("Save post error:", err);
      res.status(500).json({ message: "Failed to save post" });
    });
});

//Remove a post from the logged-in user's savedPosts list
router.delete("/saved-posts/:postId", isAuthenticated, (req, res) => {
  const userId = req.payload._id;
  const { postId } = req.params;

  // Validate the post ID format
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  // Find the user and update their savedPosts by removing the postId
  User.findByIdAndUpdate(
    userId,
    { $pull: { savedPosts: postId } }, // Remove postId from array
    { new: true } // Return the updated user
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




module.exports = router;