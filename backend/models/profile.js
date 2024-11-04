// models/profile.js
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultEateryAvatar = fs.readFileSync(path.join(__dirname, '../public/default_eatery_avatar_base64.txt'), 'utf-8');
const defaultUservatar = fs.readFileSync(path.join(__dirname, '../public/default_user_avatar_base64.txt'), 'utf-8');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    unique: true,
  },
  profileId:{
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true,
  },
  is_subscribed: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
    required: false,
    default: defaultUservatar,
  },
  preferences: [
    {
      type: String,
    },
  ],
  // add more field
});

const UserProfile = mongoose.model("Profile", userProfileSchema);

// add eatery profile schema
const eateryProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Eatery",
    required: false,
    unique: true,
  },
  profileId:{
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  geo_coordinates: {
    type: { type: String, enum: ['Point']},
    coordinates: { type: [Number]} // [longitude, latitude]
  },
  opening_hours: [
    { 
      type: Date
    }
  ],
  is_public: {
    type: Boolean,
    default: true,
  },
  is_subscribed: {
    type: Boolean,
    default: true,
  },
  ratingsAverage: Number,
  cuisine: [
    {
      type: String,
    },
  ],
  rating_average:{
    type: Number,
    default: 5
  },
  rating_quantity:{
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    required: false,
    default: defaultEateryAvatar,
  },

  // add more field
});

//add space index for geo_coordinates
eateryProfileSchema.index({ geo_coordinates: '2dsphere' });
eateryProfileSchema.index({ username: 'text' });
eateryProfileSchema.index({ cuisine: 'text' });
eateryProfileSchema.index({ address: 'text' });

const EateryProfile = mongoose.model("EateryProfile", eateryProfileSchema);

export { UserProfile, EateryProfile };
