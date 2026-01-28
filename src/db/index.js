import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma;

const connectDB = async () => {
    try {
        const connectionString = process.env.DATABASE_URL;
        
        if (!connectionString) {
            throw new Error("DATABASE_URL is missing in .env file!");
        }

        // 1. Pehle Pool banao
        const pool = new pg.Pool({ connectionString });
        
        // 2. Adapter create karo
        const adapter = new PrismaPg(pool);

        // 3. Client ko adapter ke saath initialize karo (Prisma v7 format)
        if (!prisma) {
            prisma = new PrismaClient({ adapter });
        }

        await prisma.$connect();
        console.log("🟢 PostgreSQL Connected Successfully (Prisma v7)!");
    } catch (error) {
        console.error("🔴 Postgres Connection Failed!");
        console.error("Reason:", error.message);
        process.exit(1);
    }
};

export { connectDB, prisma };