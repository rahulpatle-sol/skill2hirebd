import { asyncHandler } from "../utils/asyncHandler.js";
import { prisma } from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// 1. Dashboard Stats (Cards ke liye)
export const getSystemStats = asyncHandler(async (req, res) => {
    const userCount = await prisma.user.count();
    const jobCount = await prisma.job.count();
    
    // Role based counts
    const managerCount = await prisma.user.count({ where: { role: "MANAGER" } });
    const talentCount = await prisma.user.count({ where: { role: "TALENT" } });

    res.status(200).json(new ApiResponse(200, { 
        userCount, jobCount, managerCount, talentCount 
    }, "Stats fetched successfully"));
});

// 2. All Users List
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, users, "All users fetched"));
});

// 3. Verify Talent Badge
export const verifyTalentBadge = asyncHandler(async (req, res) => {
    const { talentId } = req.params;
    const updatedTalent = await prisma.user.update({
        where: { id: talentId },
        data: { isVerified: true }
    });
    res.status(200).json(new ApiResponse(200, updatedTalent, "Badge Verified!"));
});

// 4. Delete User (Admin Only)
export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");

    await prisma.user.delete({ where: { id: userId } });
    
    res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});