import { connectToDatabase } from "./lib/mongoose.js";
import { UserProfile, EateryProfile } from "./models/profile.js";
import { Comment } from "./models/comment.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from "dotenv"; // for global .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultEateryAvatar = fs.readFileSync(path.join(__dirname, './public/default_eatery_avatar_base64.txt'), 'utf-8');
const defaultUservatar = fs.readFileSync(path.join(__dirname, './public/default_user_avatar_base64.txt'), 'utf-8');

dotenv.config();

// connect todatabase
connectToDatabase();

// update field
async function updateExistingEateryDocuments() {
    try {
        await EateryProfile.updateMany(
            { is_subscribed: { $exists: false } },
            { $set: { is_subscribed: true } }
        );
        
        await EateryProfile.updateMany(
            { avatar: { $exists: false } },
            { $set: { avatar: defaultEateryAvatar } }
        );

        await EateryProfile.updateMany(
            { profileId: { $exists: false } },
            [{ $set: { profileId: "$_id" }}]
        );

        try {
            // Find all documents where profileId is incorrect
            const eateries = await EateryProfile.find({ profileId: "$_id" });
    
            for (const eatery of eateries) {
                // Set profileId to the correct value
                eatery.profileId = eatery._id;
                await eatery.save();
            }
            console.log("Fixed profileId for all documents");
        } catch (err) {
            console.error('Error fixing profileId:', err);
        }

        console.log("Updated documents successfully");
    } catch (err) {
        console.error('Error updating documents:', err);
    }
}


async function updateExistingUserDocuments() {
    try {
        await UserProfile.updateMany(
            { is_subscribed: { $exists: false } },
            { $set: { is_subscribed: true } }
        );
        
        await UserProfile.updateMany(
            { avatar: { $exists: false } },
            { $set: { avatar: defaultUservatar } }
        );

        await UserProfile.updateMany(
            { profileId: { $exists: false } },
            [{ $set: { profileId: "$_id" }}]
        );

        try {
            // Find all documents where profileId is incorrect
            const users = await UserProfile.find({ profileId: "$_id" });
    
            for (const user of users) {
                // Set profileId to the correct value
                user.profileId = user._id;
                await user.save();
            }
            console.log("Fixed profileId for all documents");
        } catch (err) {
            console.error('Error fixing profileId:', err);
        }

        console.log("Updated documents successfully");
    } catch (err) {
        console.error('Error updating documents:', err);
    }
}

async function clearComment() {
    try {
        await Comment.deleteMany({});
        console.log("Deleted all comments");
      } catch (err) {
        console.error('Error deleting comments:', err);
      }
}
// update comment manually
clearComment();