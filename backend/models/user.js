// models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // assume the email is unique
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

const eaterySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // assume the email is unique
  },
  password: {
    type: String,
    required: true,
  },
});

const Eatery = mongoose.model("Eatery", eaterySchema);

export { User, Eatery };
