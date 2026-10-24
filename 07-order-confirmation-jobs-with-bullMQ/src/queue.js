import { Queue } from "bullmq";

// Define standard connection settings
export const connection = {
  host: "localhost",
  port: 6379,
};

// Initialize the queue and export it
export const emailQueue = new Queue("emails", { connection });