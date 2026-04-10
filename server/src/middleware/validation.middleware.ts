import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.js', '.mjs'];

// Store file in memory as a buffer — storage service handles persistence
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Only .js and .mjs bundle files are accepted'));
    }
    cb(null, true);
  },
});

const validateBundle = [
  upload.single('bundle'),
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({ error: 'No bundle file provided. Attach a .js or .mjs file under the key "bundle"' });
      return;
    }
    next();
  },
];

export { validateBundle };
