import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { applyForJob } from "../controllers/application.controller.js";

const router = Router();

router.route("/apply/:jobId").post(verifyJWT, applyForJob);

export default router;