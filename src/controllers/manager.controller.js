import { prisma } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// --- 1. Pending Assessment & Profiles (Talent Review) ---
export const getPendingReviews = asyncHandler(async (req, res) => {
  // Assessment aur Profile Review dono fetch karo
  const [assessments, profiles] = await Promise.all([
    prisma.assessment.findMany({
      where: { status: "UNDER_REVIEW" },
      include: { talent: { include: { user: true } } }
    }),
    prisma.talent.findMany({
      where: { profileStatus: "PENDING_AUDIT" },
      include: { user: true }
    })
  ]);

  res.status(200).json(new ApiResponse(200, { assessments, profiles }, "Pending tasks fetched"));
});

// --- 2. Verify Talent & Activate Public Profile ---
export const verifyTalentStatus = asyncHandler(async (req, res) => {
  const { talentId } = req.params;
  const { score, isApproved, feedback, makePublic } = req.body;

  const updatedTalent = await prisma.talent.update({
    where: { id: talentId },
    data: { 
      isVerified: isApproved,
      isPublic: isApproved && makePublic, // Sirf verified bande hi public ho sakte hain
      reviewFeedback: feedback,
      assessment: {
        update: {
          status: isApproved ? "VERIFIED" : "REJECTED",
          onlineTestScore: score 
        }
      }
    }
  });

  res.status(200).json(new ApiResponse(200, updatedTalent, "Talent audit complete!"));
});

// --- 3. Mentor Session Approval ---
export const manageMentorSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { status, meetLink } = req.body; // APPROVED, REJECTED

  const session = await prisma.mentorSession.update({
    where: { id: sessionId },
    data: { 
      status, 
      meetLink: status === "APPROVED" ? meetLink : null 
    }
  });

  res.status(200).json(new ApiResponse(200, session, `Session ${status} successfully`));
});

// --- 4. Global Job Monitor (HR Check) ---
export const getGlobalJobStats = asyncHandler(async (req, res) => {
  const jobStats = await prisma.job.findMany({
    include: {
      _count: { select: { applications: true } },
      postedBy: { select: { companyName: true } }
    }
  });
  res.status(200).json(new ApiResponse(200, jobStats, "HR job stats fetched"));
});

export const getPendingAssessments = asyncHandler(async (req, res) => {
  const pending = await prisma.assessment.findMany({
    where: { status: "UNDER_REVIEW" },
    include: { talent: { include: { user: true } } }
  });
  res.status(200).json(new ApiResponse(200, pending, "Pending assessments fetched"));
});