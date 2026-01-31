import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// JWT Token Helper
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

// 1. REGISTER (Direct Verification)
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, role, companyName } = req.body;

    if ([fullName, email, password, role].some(f => f?.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existedUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existedUser) return res.status(400).json({ message: "User already exists" });

    // Profile Picture Upload
    const profilePicLocalPath = req.file?.path;
    let profilePicUrl = null;
    if (profilePicLocalPath) {
        const cloud = await uploadOnCloudinary(profilePicLocalPath);
        profilePicUrl = cloud?.url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: { 
                fullName, 
                email: email.toLowerCase(), 
                password: hashedPassword, 
                role, 
                profilePic: profilePicUrl, 
                isVerified: true // OTP skipped, direct true
            }
        });

        // Role based profile creation
        if (role === "TALENT") {
            await tx.talent.create({ data: { userId: newUser.id } });
        } else if (role === "HR") {
            await tx.recruiter.create({ 
                data: { userId: newUser.id, companyName: companyName || "Independent" } 
            });
        }
        return newUser;
    });

    const accessToken = generateToken(user);

    return res.status(201)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .json(new ApiResponse(201, { user, accessToken }, "Registration successful!"));
});

// 2. LOGIN
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateToken(user);

    return res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: 'None' })
        .json(new ApiResponse(200, { 
            user: { id: user.id, fullName: user.fullName, role: user.role, profilePic: user.profilePic }, 
            accessToken 
        }, "Login successful"));
});

// 3. GOOGLE CALLBACK SUCCESS
const googleAuthSuccess = asyncHandler(async (req, res) => {
    const user = req.user;
    const accessToken = generateToken(user);

    // Cookie set karke frontend dashboard pe bhej do
    res.cookie("accessToken", accessToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'None' 
    });

    // Tumhara Vercel URL
    res.redirect(`https://ecojobboard.vercel.app/dashboard`);
});

// 4. GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized request" });
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched"));
});

// 5. LOGOUT
const logoutUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: 'None' })
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export { 
    registerUser, 
    loginUser,
    googleAuthSuccess, 
    getCurrentUser,
    logoutUser 
};