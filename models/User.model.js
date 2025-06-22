const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'User name is required'],
      unique: true,
      trim: true
    },

    profileImage: {
      type: String,
      // default: insert hosted image URL
      },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required']
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

      savedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],

    // fullName: {
    //   type: String,
    //   trim: true
    // },

    // location: String,

    // bio: {
    //   type: String,
    //   maxlength: 300
    // },

  },

  {
    timestamps: true
  }
);

const User = model("User", userSchema);

module.exports = User;
