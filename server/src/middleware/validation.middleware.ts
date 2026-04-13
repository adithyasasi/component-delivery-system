import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.zip'];

// Store file in memory as a buffer — storage service handles extraction
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Only .zip federation bundle archives are accepted'));
    }
    cb(null, true);
  },
});

const validateBundle = [
  upload.single('bundle'),
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({
        error: 'No bundle file provided. Attach a .zip federation archive under the key "bundle"',
      });
      return;
    }
    next();
  },
];

export { validateBundle };
