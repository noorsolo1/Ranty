const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'audio');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const userId = req.user?.id || 'unknown';
    cb(null, `temp_${userId}_${timestamp}.webm`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

function renameAudioFile(tempFilename, userId, rantId) {
  const timestamp = Date.now();
  const newFilename = `rant_${userId}_${rantId}_${timestamp}.webm`;
  const oldPath = path.join(UPLOAD_DIR, tempFilename);
  const newPath = path.join(UPLOAD_DIR, newFilename);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
  }

  return newFilename;
}

function deleteAudioFile(filename) {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function getAudioFilePath(filename) {
  return path.join(UPLOAD_DIR, filename);
}

module.exports = { upload, renameAudioFile, deleteAudioFile, getAudioFilePath };
