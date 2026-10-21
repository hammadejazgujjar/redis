import express, { json } from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Leaderboard API is running");
});

app.post("/user", async (req, res) => {
  const { username, email, id } = req.body;

  if (!username || !email || !id) {
    return res
      .status(400)
      .json({ error: "Username, email, and ID are required" });
  }

  try {
    await redis.hset(`user:${id}`, { username, email });
    await redis.zadd("leaderboard", 0, id);
    res.status(201).json({ message: "User created and added to leaderboard" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/leaderboard/score", async (req, res) => {
  const { id, score } = req.body;

  if (!id || score === undefined) {
    return res.status(400).json({ error: "User ID and score are required" });
  }

  try {
    await redis.zincrby("leaderboard", score, id);
    res.status(200).json({ message: "Score updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/leaderboard", async (req, res) => {
  const ans = await redis.zrevrange(
    "leaderboard", 0, 2, "WITHSCORES"
  );

  const data = [];

  for (let i = 0; i < ans.length; i += 2) {
    data.push({
      userId: ans[i],
      score: Number(ans[i + 1])
    });
  }

  return res.json(data);
});

app.get("/leaderboard/:id/rank",async(req,res)=>{

    const rank = await redis.zrevrank("leaderboard", req.params.id);

    if (rank === null) {
    return res.status(404).json({ message: "User not found" });
  }
    return res.json(rank+1);

})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
