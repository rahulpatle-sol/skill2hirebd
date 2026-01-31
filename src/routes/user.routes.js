import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    googleAuthSuccess,
    getCurrentUser 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

// --- PUBLIC ROUTES ---
router.route("/register").post(upload.single("profilePic"), registerUser);
router.route("/login").post(loginUser);

// --- GOOGLE AUTH ROUTES ---
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", 
    passport.authenticate("google", { session: false }), 
    googleAuthSuccess
);

// --- PROTECTED ROUTES ---
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);

// --- ADMIN ROUTES ---
router.route("/admin/all-users").get(
    verifyJWT, 
    authorizeRoles("ADMIN"), 
    (req, res) => res.json({ message: "Welcome Admin!" })
);

export default router;