import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // Sabse pehle variables load honge

import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import { initializePassport } from "./config/passport.js"; // Import after dotenv

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        // 🔥 Database connect hone ke baad aur server start hone se pehle initialize karo
        initializePassport(); 
        console.log("✅ Passport Initialized with ID:", process.env.GOOGLE_CLIENT_ID);

        app.listen(PORT, () => {
            console.log(`⚙️  Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("❌ Server startup failed:", err);
    });