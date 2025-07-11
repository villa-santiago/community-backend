const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const Post = require("../models/Post.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// Save a post to the logged-in user's savedPosts list
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

// Remove a post from the logged-in user's savedPosts list
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

// PATCH /users/profile — update bio, location, profileImage
router.patch("/profile", isAuthenticated, (req, res, next) => {
  const userId = req.payload._id;
  const { bio, location, profileImage } = req.body;

  const updateFields = {};
  if (bio !== undefined) updateFields.bio = bio;
  if (location !== undefined) updateFields.location = location;
  if (profileImage !== undefined) updateFields.profileImage = profileImage;

  User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true })
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    })
    .catch(err => {
      console.error("Error updating profile:", err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Failed to update profile" });
    });
});

// PATCH /users/password — change current password
router.patch("/password", isAuthenticated, async (req, res) => {
  const userId = req.payload._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Ambas contraseñas son obligatorias." });
  }

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(newPassword)) {
    return res.status(400).json({
      message: "La nueva contraseña debe tener al menos 6 caracteres, incluyendo mayúsculas, minúsculas y un número.",
    });
  }

  try {
    const user = await User.findById(userId);
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "La contraseña actual es incorrecta." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Error al actualizar la contraseña." });
  }
});

// DELETE /users/delete — delete the logged-in user's account
router.delete("/delete", isAuthenticated, async (req, res) => {
  const userId = req.payload._id;

  try {
    // Remove posts owned by this user
    await Post.deleteMany({ owner: userId });

    // Remove the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Cuenta eliminada correctamente." });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Error al eliminar la cuenta." });
  }
});

// GET /users/:userId/posts — Public: get posts by userId
router.get("/:userId/posts", (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  Post.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate("owner", "userName profileImage")
    .then(posts => {
      res.status(200).json({ posts });
    })
    .catch(err => {
      console.error("Error fetching public posts:", err);
      res.status(500).json({ message: "Failed to fetch posts" });
    });
});

// GET /users/:userId — fetch public profile info
router.get("/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("userName profileImage bio location");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching public profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;
