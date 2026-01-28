import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/index.js";

const applyForJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // 1. Check if user is TALENT
    if (req.user.role !== "TALENT") {
        return res.status(403).json({ message: "Only Talents can apply for jobs" });
    }

    // 2. Talent profile ID nikaalo
    const talentProfile = await prisma.talent.findUnique({
        where: { userId: req.user.id }
    });

    // 3. Check if already applied
    const existingApplication = await prisma.application.findFirst({
        where: {
            jobId,
            talentId: talentProfile.id
        }
    });

    if (existingApplication) {
        return res.status(400).json({ message: "You have already applied for this job" });
    }

    // 4. Create Application
    const application = await prisma.application.create({
        data: {
            jobId,
            talentId: talentProfile.id
        }
    });

    return res.status(201).json(new ApiResponse(201, application, "Applied successfully"));
});

export { applyForJob };