
import mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { User, Post, Save } from '@studymate/database';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studymate";

async function seed() {
    try {
        console.log('Connecting to MongoDB...', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`Processing user: ${user.fullName} (${user._id})`);

            // Check if posts exist
            const postCount = await Post.countDocuments({ userId: user._id });
            if (postCount > 0) {
                console.log(`User already has ${postCount} posts. Skipping.`);
                continue;
            }

            console.log("Creating sample posts...");
            const posts = [
                {
                    userId: user._id,
                    title: "Advanced Integration Cheatsheet",
                    description: "Quick formulas for Definite Integration. Includes Wallis Formula and King's Property.",
                    contentType: "CHEAT_SHEET",
                    subject: "Mathematics",
                    examCategory: "JEE",
                    tags: ["math", "calculus", "shortcuts"],
                    likesCount: 45,
                    commentsCount: 12,
                    savesCount: 89,
                    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop"
                },
                {
                    userId: user._id,
                    title: "Organic Chemistry: Named Reactions Mind Map",
                    description: "A comprehensive mind map covering all named reactions for JEE Mains & Advanced.",
                    contentType: "MIND_MAP",
                    subject: "Chemistry",
                    examCategory: "JEE",
                    tags: ["chemistry", "organic", "reactions"],
                    likesCount: 120,
                    commentsCount: 34,
                    savesCount: 200,
                    thumbnailUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop"
                },
                {
                    userId: user._id,
                    title: "Physics Formula Sheet - Mechanics",
                    description: "All mechanics formulas in one place. Rotational motion, gravitation, and more.",
                    contentType: "NOTES",
                    subject: "Physics",
                    examCategory: "JEE",
                    tags: ["physics", "mechanics"],
                    likesCount: 89,
                    commentsCount: 5,
                    savesCount: 45,
                    thumbnailUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600&auto=format&fit=crop"
                }
            ];

            const createdPosts = await Post.insertMany(posts);
            console.log(`Created ${createdPosts.length} posts for ${user.username}.`);

            try {
                // User saves the first post of themselves (or you could make them save other's posts if multiple users existed, but this is fine)
                await Save.create([
                    { userId: user._id, postId: createdPosts[0]._id },
                    { userId: user._id, postId: createdPosts[1]._id }
                ]);
                console.log("Created 2 saved items.");
            } catch (e: any) {
                if (e.code !== 11000) console.error("Error creating save items:", e);
            }
        }

        console.log("Seeding complete.");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
