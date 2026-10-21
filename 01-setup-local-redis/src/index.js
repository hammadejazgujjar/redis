import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


app.get("/redis", async (req, res) => {
    const reply = await redis.ping();
    res.json({ redis: reply });
});


app.get("/mongodb", async (req, res) => {
    const url = process.env.MONGO_URL || "mongodb://localhost:27017/test_db_name";
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        res.json({ mongodb: "Connected to MongoDB", database: mongoose.connection.name });
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to MongoDB", details: error.message });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});