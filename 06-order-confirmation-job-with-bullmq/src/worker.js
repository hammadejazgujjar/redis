import { Worker } from "bullmq";
import { connection } from "./queue.js";

const worker = new Worker(
  "emails",
  async (job) => {
    console.log(`Processing email}`, job.data, job.id, job.name);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate email sending delay

    console.log(`Email sent to: ${job.data.to}, subject: ${job.data.subject}`);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} has failed with error: ${err.message}`);
});