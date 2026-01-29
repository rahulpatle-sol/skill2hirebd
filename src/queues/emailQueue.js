import { Queue, Worker } from "bullmq";
import redis from "../config/redis.js"; 
import { sendEmail } from "../utils/mailSender.js";

const connection = redis;

// 1. Create Queue
export const emailQueue = new Queue("emailQueue", { 
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
    }
});

// 2. Create Worker
const emailWorker = new Worker("emailQueue", async (job) => {
    const { email, subject, html } = job.data;
    try {
        const result = await sendEmail({ email, subject, html });
        return result;
    } catch (error) {
        console.error(`❌ Worker Error for Job ${job.id}:`, error.message);
        throw error; 
    }
}, { 
    connection,
    concurrency: 5 
});

// 3. Listeners
emailWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} - Email sent successfully!`);
});

emailWorker.on("failed", (job, err) => {
    console.log(`🔥 Job ${job.id} failed: ${err.message}`);
});

export default emailQueue;