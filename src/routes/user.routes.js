import { Router } from "express";
import { 
    registerUser, 
    verifyOTP, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    googleAuthSuccess,
    getCurrentUser ,resendOTP
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import passport from "passport";
import {submitAssessmentLinks,getMyAssessment} from '../controllers/talent.controller.js'
const router = Router();

// --- PUBLIC ROUTES ---
router.route("/register").post(upload.single("profilePic"), registerUser);
router.route("/verify-otp").post(verifyOTP);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);

// --- GOOGLE AUTH ROUTES ---
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", 
    passport.authenticate("google", { session: false }), 
    googleAuthSuccess
);

// --- PROTECTED ROUTES (JWT Required) ---
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/resend-otp").post(resendOTP);
// --- ROLE BASED ROUTES (Example: Admin Only) ---
router.route("/admin/all-users").get(
    verifyJWT, 
    authorizeRoles("ADMIN"), 
    (req, res) => res.json({ message: "Welcome Admin!" })
);
// Isko userRouter mein daal dena
// user.routes.js
router.post("/submit-assessment", verifyJWT, submitAssessmentLinks);
router.get("/my-assessment", verifyJWT, getMyAssessment);
export default router;