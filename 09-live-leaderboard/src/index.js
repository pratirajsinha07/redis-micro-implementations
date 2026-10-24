import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

// Connects to your Docker container running on port 6379
const redis = new Redis(); 

// 1. INCR: Increment the view count of a specific post
app.post("/post/:id/view", async (req, res) => {
  const { id } = req.params;
  
  // 'incr' automatically creates the key starting at 0 if it doesn't exist
  const views = await redis.incr(`post:${id}:views`);
  
  res.json({ message: `Post ${id} viewed`, totalViews: views });
});

// 2. ZINCRBY: Add points to a user's score on the leaderboard
app.post("/leaderboard/score", async (req, res) => {
  const { userId, points } = req.body;
  
  // Adds 'points' to 'userId' inside the 'global_leaderboard' Sorted Set
  const newScore = await redis.zincrby("global_leaderboard", points, userId);
  
  res.json({ message: "Score updated successfully", userId, newScore });
});

// 3. ZREVRANGE: Fetch the top 10 users (highest score first)
app.get("/leaderboard", async (req, res) => {
  // 0 to 9 gets the top 10. "WITHSCORES" tells Redis to return the scores alongside the IDs.
  // It returns a flat array like: ["user123", "500", "user456", "450"]
  const top10 = await redis.zrevrange("global_leaderboard", 0, 9, "WITHSCORES");
  
  // Parse the flat array into an array of objects so it's easy for a frontend to read
  const formattedLeaderboard = [];
  for (let i = 0; i < top10.length; i += 2) {
    formattedLeaderboard.push({
      userId: top10[i],
      score: parseInt(top10[i + 1])
    });
  }

  res.json({ top10: formattedLeaderboard });
});

// 4. ZREVRANK: Get the exact rank of a specific user
app.get("/leaderboard/:userid/rank", async (req, res) => {
  const { userid } = req.params;
  
  // ZREVRANK returns the index position. Rank #1 is index 0. 
  const rankIndex = await redis.zrevrank("global_leaderboard", userid);

  if (rankIndex === null) {
    return res.status(404).json({ message: "User not found on the leaderboard" });
  }

  // Add 1 to make it human-readable (so index 0 becomes Rank 1)
  res.json({ userId: userid, rank: rankIndex + 1 });
});

app.listen(3000, () => {
  console.log("Leaderboard API running on http://localhost:3000");
});