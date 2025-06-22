const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    service: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 300,
    },

    category: {
      type: String,
      enum: ["Servicios", "Productos", "Eventos", "Informacion"],
      required: true,
    },

    location: {
      type: String,
      enum: [
        "paris 1",
        "paris 2",
        "paris 3",
        "paris 4",
        "paris 5",
        "paris 6",
        "paris 7",
        "paris 8",
        "paris 9",
        "paris 10",
        "paris 11",
        "paris 12",
        "paris 13",
        "paris 14",
        "paris 15",
        "paris 16",
        "paris 17",
        "paris 18",
        "paris 19",
        "paris 20",
        "Fuera de Paris",
      ],
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

module.exports = Post;
