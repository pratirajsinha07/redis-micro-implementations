import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(phone) {
  return `otp:${phone}`;
}

// 1. Generate and save OTP with a 30-second expiration[cite: 6]
app.post('/otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(otpKey(phone), otp, 'EX', 30); // OTP valid for 30 seconds[cite: 6]
  res.json({ message: 'OTP sent', otp }); // In real application, send OTP via SMS[cite: 6]
});

// 2. Verify the OTP provided by the user[cite: 7, 8]
app.post('/otp/verify', async (req, res) => {
  const { phone, otp } = req.body;
  const savedOtp = await redis.get(otpKey(phone)); //[cite: 7]

  if(!savedOtp) {
      return res.status(400).json({ message: 'OTP expired or not found' }); //[cite: 7]
  }

  if (savedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' }); //[cite: 7, 8]
  }

  await redis.del(otpKey(phone)); //[cite: 8]
  res.json({ message: "OTP verified successfully" }); //[cite: 8]
});

// 3. Check remaining time to live (TTL) for a specific phone number's OTP[cite: 8]
app.get("/otp/:phone/ttl", async (req, res) => {
  const ttl = await redis.ttl(otpKey(req.params.phone)); //[cite: 8]
  res.json({ ttl }); //[cite: 8]
});

app.listen(3000, () => {
  console.log("Server running on port http://localhost:3000"); //[cite: 8]
});