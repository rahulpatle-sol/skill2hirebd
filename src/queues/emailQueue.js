import { Queue, Worker } from "bullmq";
import redis from "../config/redis.js";
import { sendEmail } from "../utils/mailSender.js";

const connection = redis;

/* ===============================
   Queue
================================ */
export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: 100,
  },
});

/* ===============================
   Worker
================================ */
const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { email, subject, html } = job.data;
    return await sendEmail({ email, subject, html });
  },
  {
    connection,
    concurrency: 5,
  }
);

/* ===============================
   Logs
================================ */
emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} - Email sent`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`🔥 Job ${job?.id} failed: ${err.message}`);
});

export default emailQueue;
