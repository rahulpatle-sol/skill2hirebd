import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // ✅ Success: Remove temp file
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("❌ Cloudinary Error:", error);
        // ❌ Fail: Phir bhi temp file remove karo taaki kachra na bhare
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return null;
    }
};