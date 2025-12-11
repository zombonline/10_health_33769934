// /utils/profilePics.js

const fs = require("fs");
const path = require("path");
const multer = require("multer");

// === DISK PATH ===
// Files are ALWAYS stored here, regardless of environment
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads", "profile_pics");

// === URL PATH (what goes into DB) ===
// DB ALWAYS stores values starting with this:
const PUBLIC_UPLOAD_PATH = "/uploads/profile_pics";

// Make sure the folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const userID = req.session?.loggedUser?.userID;

        // Fallback to something safe if for some reason userID is missing
        const safeUserID = userID != null ? userID : "unknown";

        const ext = path.extname(file.originalname) || ".png";
        cb(null, `user_${safeUserID}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images allowed"), false);
    }
};

// Express middleware: upload.single("profilePic")
const uploadProfilePic = multer({
    storage,
    fileFilter
}).single("profilePic");

// Build the URL you store in DB (and use in EJS)
function getProfileImageUrlFromFile(file) {
    // file.filename will be like: user_7.jpg
    return `${PUBLIC_UPLOAD_PATH}/${file.filename}`;
}

// Delete old profile image from disk using URL stored in DB
function deleteProfileImageByUrl(oldUrl) {
    if (!oldUrl) return;

    // Don't delete the default avatar
    if (oldUrl === "/img/default-avatar.png") return;

    // oldUrl example: "/uploads/profile_pics/user_7.jpg"
    const relativePath = oldUrl.replace(/^\/+/, ""); // "uploads/profile_pics/user_7.jpg"
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
