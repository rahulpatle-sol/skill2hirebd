import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/index.js";

// --- 1. HR Job Post Karega ---
// --- 1. HR Job Post Karega (FIXED) ---
const postJob = asyncHandler(async (req, res) => {
    const { title, description, location, salary, requiredSkills } = req.body; // jobType hata diya

    if (!req.user) {
        return res.status(401).json({ message: "Bhai, pehle login karo" });
    }

    const hrProfile = await prisma.recruiter.findUnique({
        where: { userId: req.user.id }
    });

    const job = await prisma.job.create({
        data: {
            title,
            description,
            location,
            salary,
            // jobType: jobType || "Full-time", ❌ Is line ko comment kar do ya hata do
            requiredSkills: requiredSkills || [],
            postedById: hrProfile.id
        }
    });

    return res.status(201).json(new ApiResponse(201, job, "Job live successfully!"));
});

// --- 2. HR Apni Jobs Dekhega ---
const getMyJobs = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Pehle login karo bhai!" });
    }

    const hrProfile = await prisma.recruiter.findUnique({
        where: { userId: req.user.id }
    });

    if (!hrProfile) {
        return res.status(404).json({ success: false, message: "HR profile nahi mili!" });
    }

    const jobs = await prisma.job.findMany({
        where: { postedById: hrProfile.id },
        include: {
            _count: { select: { applications: true } },
            applications: {
                include: {
                    talent: { include: { user: true } }
                }
            },
            recruiter: true // ✅ SCHEMA FIX: postedBy nahi, recruiter
        },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json(new ApiResponse(200, jobs, "Data aa gaya!"));
});

// --- 3. General Job Feed ---
const getAllJobs = asyncHandler(async (req, res) => {
    const jobs = await prisma.job.findMany({
        orderBy: { createdAt: "desc" },
        include: { 
            recruiter: { select: { companyName: true } } // ✅ SCHEMA FIX: postedBy -> recruiter
        }
    });
    return res.status(200).json(new ApiResponse(200, jobs, "All jobs fetched"));
});

// --- 4. Get Job Applicants ---
const getJobApplicants = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const jobWithApplicants = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            applications: {
                include: {
                    talent: { include: { user: true } }
                }
            }
        }
    });
    if (!jobWithApplicants) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json(new ApiResponse(200, jobWithApplicants, "Applicants fetched"));
});

// --- 5. Update Status ---
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const updatedApp = await prisma.application.update({
        where: { id: applicationId },
        data: { status }
    });
    return res.status(200).json(new ApiResponse(200, updatedApp, `Candidate ${status}`));
});

// --- 6. Recommended Jobs ---
const getRecommendedJobs = asyncHandler(async (req, res) => {
    const talent = await prisma.talent.findUnique({
        where: { userId: req.user.id },
        select: { skills: true }
    });

    if (!talent || !talent.skills || talent.skills.length === 0) {
        const randomJobs = await prisma.job.findMany({ take: 5 });
        return res.status(200).json(new ApiResponse(200, randomJobs, "Set skills for better matches"));
    }

    const matchedJobs = await prisma.job.findMany({
        where: {
            requiredSkills: {
                hasSome: talent.skills 
            }
        },
        include: {
            recruiter: { select: { companyName: true } } // ✅ SCHEMA FIX: postedBy -> recruiter
        }
    });

    return res.status(200).json(new ApiResponse(200, matchedJobs, "Recommended jobs for you"));
});

export { 
    postJob, 
    getAllJobs, 
    getMyJobs, 
    updateApplicationStatus, 
    getJobApplicants,
    getRecommendedJobs
};