import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    postJob, 
    getAllJobs, 
    getRecommendedJobs, 
    getMyJobs, 
    getJobApplicants, 
    updateApplicationStatus 
} from "../controllers/job.controller.js";

const router = Router();

// --- 🛡️ PROTECTED ROUTES (Login Required) ---
router.use(verifyJWT); 

// --- 💼 HR SPECIFIC ROUTES ---
router.route("/post-job").post(postJob);         // Job create karna
router.route("/my-jobs").get(getMyJobs);         // HR ki apni post ki hui list
router.route("/applicants/:jobId").get(getJobApplicants); // Applicants ki details
router.route("/status/:applicationId").patch(updateApplicationStatus); // Accept/Reject

// --- 🎯 TALENT SPECIFIC ROUTES ---
router.route("/all").get(getAllJobs);            // Sabhi jobs dekhne ke liye (General Feed)
router.route("/recommended").get(getRecommendedJobs); // Skill-based jobs (AI Logic)

export default router;