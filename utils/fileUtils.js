// /utils/fileUtils.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "profile_pics");

// URL returned to client
const PUBLIC_UPLOAD_PATH = "/uploads/profile_pics";

// Ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Returns the full filesystem path for a user's profile image
 */
function getProfileImagePath(userID) {
    return path.join(UPLOAD_DIR, `${userID}.webp`);
}

/**
 * Returns the public URL for a user's profile image
 */
function getProfileImageUrl(userID) {
    return `${PUBLIC_UPLOAD_PATH}/${userID}.webp`;
}

/**
 * Safely deletes an old profile image if it exists.
 */
function deleteOldProfileImage(oldUrl) {

    if (!oldUrl) return;

    // Don't delete the default avatar
    if (oldUrl === "/img/default-avatar.png") return;

    const fullPath = path.join(__dirname, "..", "public", oldUrl);

    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) return; // File doesn't exist

        fs.unlink(fullPath, (err) => {
            if (err) console.error("Failed to delete old profile image:", err);
        });
    });
}

/**
 * Converts uploaded image → WebP and saves as /uploads/profile_pics/<userID>.webp
 * Also deletes the temporary upload.
 */
async function saveProfileImage(tempFilePath, userID) {

    const finalPath = getProfileImagePath(userID);

    // Convert to WebP
    await sharp(tempFilePath)
        .resize(256, 256, { fit: "cover" }) // optional but recommended
        .webp({ quality: 85 })
        .toFile(finalPath);

    // Remove the temp file
    fs.unlink(tempFilePath, () => {});

    return getProfileImageUrl(userID);
}

module.exports = {
    saveProfileImage,
    deleteOldProfileImage,
    getProfileImageUrl,
    getProfileImagePath
};
