import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

const app = express();

/**
 * IMPORTANT:
 * - credentials: true ⇒ origin MUST be exact match
 * - trailing slash "/" allowed nahi hota
 * - Render / Vercel strict hote hain
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://skill2-hire.vercel.app",
  "https://ecojobboard.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / server-to-server / health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ❌ app.options("*", cors());  <-- DO NOT USE (Node 24 crash)
// OPTIONS automatically handled by cors()

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Passport (agar session / oauth use ho raha hai)
app.use(passport.initialize());

// --- ROUTES ---
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

import jobRouter from "./routes/job.routes.js";
app.use("/api/v1/jobs", jobRouter);

import adminRouter from "./routes/admin.routes.js";
app.use("/api/v1/admin", adminRouter);

import managerRouter from "./routes/manager.routes.js";
app.use("/api/v1/manager", managerRouter);

export { app };
