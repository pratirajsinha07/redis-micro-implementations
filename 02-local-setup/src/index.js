import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize shared Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Redis Health Check Route
app.get('/redis', async (req, res) => {
  try {
    const reply = await redis.ping();
    res.json({ redis: reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB Health Check Route
app.get('/mongo', async (req, res) => {
  try {
    const url = process.env.MONGO_URL || 'mongodb://localhost:27017/chai_aur_redis';

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(url);
    }

    res.json({ mongo: "connected", database: mongoose.connection.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});