import express from 'express';
import { submitAssessmentLinks } from '../controllers/talent.controller.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';


const router = express.Router();

// Talent apne links yahan se submit karega
router.post('/submit-assessment', submitAssessmentLinks);

export default router;