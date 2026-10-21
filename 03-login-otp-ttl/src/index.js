import express from "express";
import Redis from "ioredis";

const app = express();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(express.json());

function optKey(phoneNumber) {
  return `otp:${phoneNumber}`;
}



app.post("/otp", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = optKey(phoneNumber);

  await redis.set(key, otp, "EX", 60); // OTP expires in 60 seconds


  res.json({ message: `OTP sent successfully to ${phoneNumber}`, otp: otp });
});

app.post("/verify-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: "Phone number and OTP are required" });
  }

  const key = optKey(phoneNumber);
  const storedOtp = await redis.get(key);

  if(!storedOtp) {
    return res.status(400).json({ error: "OTP has expired or does not exist" });
  }

  if (storedOtp == otp) {
    await redis.del(key); // Invalidate the OTP after successful verification
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.get("/otp/:phone/ttl", async (req, res) => {
  const ttl = await redis.ttl(optKey(req.params.phone));
  res.json({ ttl });
});


app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});``