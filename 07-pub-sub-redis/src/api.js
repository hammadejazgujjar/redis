import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");


app.post("/publish", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    await redis.publish("notification", JSON.stringify({ message }));
    res.status(200).json({ success: true, message: "Message published" });
  } catch (error) {
    console.error("Error publishing message:", error);
    res.status(500).json({ error: "Failed to publish message" });
  }
});




app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
