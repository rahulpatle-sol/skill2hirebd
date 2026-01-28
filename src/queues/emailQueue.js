import { Queue, Worker } from "bullmq";
import redis from "../config/redis.js";
import { sendEmail } from "../utils/mailSender.js";

// Connection config
const connection = redis;

// 1. Create Queue
export const emailQueue = new Queue("emailQueue", { connection });

// 2. Create Worker (Ye background mein chalta rahega)
const emailWorker = new Worker("emailQueue", async (job) => {
    const { email, subject, html } = job.data;
    try {
        await sendEmail({ email, subject, html });
        console.log(`✅ Email sent successfully to: ${email}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
    }
}, { connection });

emailWorker.on("completed", (job) => console.log(`Job ${job.id} completed!`));
emailWorker.on("failed", (job, err) => console.log(`Job ${job.id} failed: ${err.message}`));