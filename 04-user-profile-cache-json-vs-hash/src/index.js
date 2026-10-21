import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/user/:id/json", async (req, res) => {

  // Store the user pr`ofile data as a JSON string
  await redis.set(`user-profile:${req.params.id}`, JSON.stringify(req.body));
 
  res.json({ savedAs: "json" });
});

app.get("/user/:id/json", async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Retrieve the user profile data stored as a JSON string
  const profileData = await redis.get(`user-profile:${userId}`);

  if (!profileData) {
    return res.status(404).json({ error: "User profile not found" });
  }

  res.json({ data: JSON.parse(profileData) });
});



app.post("/user/:id/hash", async (req, res) => {
  // Store the user profile data as a hash
 let user = await redis.hset(`user-profile:${req.params.id}:hash`, req.body);
  res.json({ savedAs: "hash" });
});


app.get("/user/:id/hash", async (req, res) => {
  const userId = req.params.id;

  // Retrieve the user profile data stored as a hash
  const profileData = await redis.hgetall(`user-profile:${userId}:hash`);

  res.json({ profileData });
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});