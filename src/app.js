import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport"; // 1. Passport import karo
 // 2. Passport ki configuration file ko import karo (Zaroori!)

const app = express(); 

// CORS mein dono port allow kar do (5173 admin aur 5174 user)
app.use(cors({ 
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


// --- ROUTES ---
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users", userRouter);

import jobRouter from "./routes/job.routes.js";
app.use("/api/v1/jobs", jobRouter);

import adminRouter from "./routes/admin.routes.js"
app.use("/api/v1/admin", adminRouter);

import managerRouter from "./routes/manager.routes.js";
app.use("/api/v1/manager", managerRouter);
export { app };