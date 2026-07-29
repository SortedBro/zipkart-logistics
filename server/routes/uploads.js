const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const storage = require('../lib/storage');

const router = express.Router();

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']);
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only image and PDF files are allowed.'));
  },
});

// Wrap multer so its errors become clean 400s instead of hitting the generic 500 path.
function singleFile(field) {
  return (req, res, next) => {
    multerUpload.single(field)(req, res, (err) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 5MB limit.' : err.message;
        return res.status(400).json({ error: msg });
      }
      next();
    });
  };
}

// Lets the frontend decide whether to upload to storage or fall back to inline base64.
router.get('/status', requireAuth, (req, res) => {
  res.json({ enabled: storage.isEnabled() });
});

router.post(
  '/',
  requireAuth,
  (req, res, next) => {
    if (!storage.isEnabled()) return res.status(503).json({ error: 'File storage is not configured.' });
    next();
  },
  singleFile('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided.' });
    const url = await storage.uploadBuffer(req.file.buffer, {
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
      prefix: req.query.type === 'logo' ? 'logos' : 'documents',
    });
    res.status(201).json({ url, contentType: req.file.mimetype });
  })
);

module.exports = router;
