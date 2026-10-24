import express from "express";
import { emailQueue } from "./queue.js"; // Import the queue we just made

const app = express();

app.use(express.json());

app.post("/welcome-email", async (req, res) => {
  // Add a job to the queue
  const job = await emailQueue.add(
    "send-welcome-email",
    {
      to: req.body.to,
      name: req.body.name || "Learner",
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );

  // Respond instantly to the user
  res.json({ message: "Welcome email job added to the queue!", jobId: job.id });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});