import { Router } from "express";
import { 
    getPendingAssessments, 
    verifyTalentStatus, 
    getPendingReviews, 
    manageMentorSession, 
    getGlobalJobStats 
} from "../controllers/manager.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Middleware: Pehle login check, phir Role check
router.use(verifyJWT);
router.use(authorizeRoles("MANAGER"));

// --- System Controls ---
router.get("/bridge", getPendingReviews);          // Poora data (Assessments + Profiles)
router.get("/pending-reviews", getPendingAssessments); // Sirf Pending Assessments
router.patch("/verify-talent/:talentId", verifyTalentStatus); // Approve/Reject Talent
router.patch("/mentor-session/:sessionId", manageMentorSession); // Approve Mentor Session
router.get("/job-stats", getGlobalJobStats);      // HR Activity Monitor

export default router;