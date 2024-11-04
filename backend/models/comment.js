// models/comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    eateryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EateryProfile",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const Comment = mongoose.model("Comment", commentSchema);
  export { Comment };