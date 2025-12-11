
const fs = require('fs');
const path = require('path');
const multer = require('multer');


const UPLOAD_DIR = path.join(
  __dirname,
  '..',
  'public',
  'uploads',
  'profile_pics',
);


const PUBLIC_UPLOAD_PATH = '/uploads/profile_pics';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const userID = req.session?.loggedUser?.userID;

    const safeUserID = userID != null ? userID : 'unknown';

    const ext = path.extname(file.originalname) || '.png';
    cb(null, `user_${safeUserID}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed'), false);
  }
};

const uploadProfilePic = multer({
  storage,
  fileFilter,
}).single('profilePic');

function getProfileImageUrlFromFile(file) {
  return `${PUBLIC_UPLOAD_PATH}/${file.filename}`;
}

function deleteProfileImageByUrl(oldUrl) {
  if (!oldUrl) return;

  if (oldUrl === '/img/default-avatar.png') return;

  const relativePath = oldUrl.replace(/^\/+/, ''); 
  const fullPath = path.join(__dirname, '..', 'public', relativePath);

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete old profile image:', err);
    }
  });
}

module.exports = {
  uploadProfilePic,
  getProfileImageUrlFromFile,
  deleteProfileImageByUrl,
};
