import { Router } from "express";
import { getPendingAssessments, verifyTalentStatus } from "../controllers/manager.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Saare manager routes ko verifyJWT aur Role check se guzaaro
router.use(verifyJWT);
router.use(authorizeRoles("MANAGER"));

// Pending reviews mangwane ke liye
router.route("/pending-reviews").get(getPendingAssessments);

// Talent verify karne ke liye (PATCH request best rahegi kyunki hum status update kar rahe hain)
router.route("/verify-talent/:assessmentId").patch(verifyTalentStatus);

export default router;