import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getAllUsers, 
    deleteUser, 
    getSystemStats, 
    verifyTalentBadge 
} from "../controllers/admin.controller.js";

const router = Router();

// Saare admin routes protected hain aur verifyJWT middleware use karte hain
router.use(verifyJWT); 

router.route("/stats").get(getSystemStats);
router.route("/users").get(getAllUsers);
router.route("/user/:userId").delete(deleteUser);
router.route("/verify-badge/:talentId").patch(verifyTalentBadge);

export default router;