import pkg from '@prisma/client';
const { PrismaClient } = pkg; // Named export error fix karne ke liye
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma;

const connectDB = async () => {
    try {
        const connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            console.error("❌ ERROR: DATABASE_URL is missing!");
            process.exit(1);
        }

        // 1. Connection Pool
        const pool = new pg.Pool({ connectionString });
        
        // 2. Adapter
        const adapter = new PrismaPg(pool);

        // 3. Singleton Pattern check
        if (!prisma) {
            prisma = new PrismaClient({ adapter });
        }

        await prisma.$connect();
        console.log("🟢 PostgreSQL Connected Successfully (Prisma v7)!");
    } catch (error) {
        console.error("🔴 Postgres Connection Failed!");
        console.error("Reason:", error.message);
        // Build phase mein fail na ho isliye exit tabhi karo jab system live ho
        if (process.env.NODE_ENV === 'production') process.exit(1);
    }
};

export { connectDB, prisma };