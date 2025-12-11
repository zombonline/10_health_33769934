// /utils/profilePics.js

const fs = require("fs");
const path = require("path");
const multer = require("multer");


const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/+$/, "");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "profile_pics");


const PUBLIC_UPLOAD_PATH = `${BASE_PATH}/uploads/profile_pics`;

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR); 
    },
    filename: (req, file, cb) => {
        const userID = req.session.loggedUser.userID;
        const ext = path.extname(file.originalname) || ".png";
        cb(null, `user_${userID}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

const uploadProfilePic = multer({
    storage,
    fileFilter
}).single("profilePic");

function getProfileImageUrlFromFile(file) {
    return `${PUBLIC_UPLOAD_PATH}/${file.filename}`;
}
function urlToRelativePath(url) {
    if (!url) return url;

    let cleaned = url;

    if (BASE_PATH && cleaned.startsWith(BASE_PATH + "/")) {
        cleaned = cleaned.slice(BASE_PATH.length);
    }

    return cleaned.replace(/^\/+/, "");
}

function deleteProfileImageByUrl(oldUrl) {
    if (!oldUrl) return;

    if (
        oldUrl === "/img/default-avatar.png" ||
        (BASE_PATH && oldUrl === `${BASE_PATH}/img/default-avatar.png`)
    ) {
        return;
    }

    const relativePath = urlToRelativePath(oldUrl); 
    const fullPath = path.join(__dirname, "..", "public", relativePath);

    fs.unlink(fullPath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("Failed to delete old profile image:", err);
        }
    });
}

module.exports = {
    uploadProfilePic,
    getProfileImageUrlFromFile,
    deleteProfileImageByUrl
};
