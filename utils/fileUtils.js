// /utils/fileUtils.js

const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "profile_pics");

const PUBLIC_UPLOAD_PATH = "/uploads/profile_pics";

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}


function getProfileImagePath(userID) {
    return path.join(UPLOAD_DIR, `${userID}.png`);  
}


function getProfileImageUrl(userID) {
    console.log("profile image url:", `${PUBLIC_UPLOAD_PATH}/${userID}.png`);
    return `${PUBLIC_UPLOAD_PATH}/${userID}.png`;
}

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

async function saveProfileImage(tempFilePath, userID) {
    const finalPath = getProfileImagePath(userID);

    return new Promise((resolve, reject) => {
        fs.rename(tempFilePath, finalPath, (err) => {
            if (err) return reject(err);
            resolve(getProfileImageUrl(userID));
        });
    });
}

module.exports = {
    saveProfileImage,
    deleteOldProfileImage,
    getProfileImageUrl,
    getProfileImagePath
};
