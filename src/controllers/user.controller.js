import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redis from "../config/redis.js";
import { emailQueue } from "../queues/emailQueue.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// JWT Token Helper
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
    );
};

// 1. REGISTER
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, role, companyName } = req.body;

    if ([fullName, email, password, role].some(f => f?.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existedUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existedUser) return res.status(400).json({ message: "User exists" });

    const profilePicLocalPath = req.file?.path;
    let profilePicUrl = null;
    if (profilePicLocalPath) {
        const cloud = await uploadOnCloudinary(profilePicLocalPath);
        profilePicUrl = cloud?.url;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${email.toLowerCase()}`, otp, "EX", 300);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: { fullName, email: email.toLowerCase(), password: hashedPassword, role, profilePic: profilePicUrl, isVerified: false }
        });
        if (role === "TALENT") await tx.talent.create({ data: { userId: newUser.id } });
        else if (role === "HR") await tx.recruiter.create({ data: { userId: newUser.id, companyName: companyName || "Independent" } });
        return newUser;
    });

    await emailQueue.add("sendOTP", {
        email: user.email,
        subject: "Verify Your Account",
        html: `<h1>Code: ${otp}</h1><p>Valid for 5 mins.</p>`
    });

    return res.status(201).json(new ApiResponse(201, { email: user.email }, "User registered. OTP sent."));
});

// 2. VERIFY OTP
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = await redis.get(`otp:${email.toLowerCase()}`);

    if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid/Expired OTP" });
    }

    await redis.del(`otp:${email.toLowerCase()}`);
    const user = await prisma.user.update({ 
        where: { email: email.toLowerCase() }, 
        data: { isVerified: true } 
    });

    const accessToken = generateToken(user);

    return res.status(200).json(
        new ApiResponse(200, { 
            user: { id: user.id, fullName: user.fullName, role: user.role, profilePic: user.profilePic }, 
            accessToken 
        }, "Verified Successfully!")
    );
});

// 3. RESEND OTP
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${email.toLowerCase()}`, newOtp, "EX", 300);

    await emailQueue.add("sendOTP", {
        email: user.email,
        subject: "Your New Verification Code",
        html: `<h1>New Code: ${newOtp}</h1>`
    });

    return res.status(200).json(new ApiResponse(200, {}, "New OTP sent!"));
});

// 4. GOOGLE CALLBACK
const googleAuthSuccess = asyncHandler(async (req, res) => {
    const user = req.user;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${user.email.toLowerCase()}`, otp, "EX", 300);

    await emailQueue.add("googleOTP", {
        email: user.email,
        subject: "Security Verification",
        html: `<h1>Security Code: ${otp}</h1>`
    });

    // Dashboard dynamic port handle karne ke liye frontend origin check karein
    res.redirect(`http://localhost:5174/verify-otp?email=${user.email}&source=google`);
});

// 5. FORGOT PASSWORD
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = Math.random().toString(36).substring(2);
    await redis.set(`reset:${resetToken}`, email.toLowerCase(), "EX", 600);

    const link = `http://localhost:5174/reset-password/${resetToken}`;
    await emailQueue.add("resetPass", { email, subject: "Reset Password", html: `<a href="${link}">Reset Now</a>` });

    res.status(200).json(new ApiResponse(200, {}, "Reset link sent."));
});

// 6. LOGIN
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified) return res.status(401).json({ message: "Please verify email" });

    const accessToken = generateToken(user);
    return res.status(200)
        .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
        .json(new ApiResponse(200, { user, accessToken }, "Login success"));
});

// 7. GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized request" });
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched"));
});

// 8. LOGOUT
const logoutUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .json(new ApiResponse(200, {}, "Logged out"));
});

export { 
    registerUser, 
    verifyOTP, 
    resendOTP,
    googleAuthSuccess, 
    forgotPassword, 
    loginUser,
    getCurrentUser,
    logoutUser 
};