import { Worker } from "bullmq";
import { connection } from "./queue.js"; // Import the exact same connection

const worker = new Worker(
  "emails",
  async (job) => {
    console.log("Processing email job...", job.id, job.name, job.data);
    
    // Simulate a heavy task taking 1.5 seconds
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Email job completed!", job.id, job.name, job.data);
  },
  { connection }
);

// Event listeners for monitoring
worker.on("completed", (job) => {
  console.log("Job completed!", job.id, job.name, job.data);
});

worker.on("failed", (job, err) => {
  console.log("Job failed!", job.id, job.name, job.data, err);
});