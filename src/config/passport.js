import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../db/index.js";

// Isko function bana do
export const initializePassport = () => {
    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error("❌ ERROR: GOOGLE_CLIENT_ID is missing in ENV");
        return;
    }

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/users/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await prisma.user.findUnique({
                where: { email: profile.emails[0].value }
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        profilePic: profile.photos[0].value,
                        role: "TALENT",
                        googleId: profile.id,
                        isVerified: true
                    }
                });
            }
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
};