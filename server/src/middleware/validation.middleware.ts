import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Store file in memory as a buffer — storage service handles persistence
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.endsWith('.js')) {
      return cb(new Error('Only .js bundle files are accepted'));
    }
    cb(null, true);
  },
});

const validateBundle = [
  upload.single('bundle'),
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({ error: 'No bundle file provided. Attach a .js file under the key "bundle"' });
      return;
    }
    next();
  },
];

export { validateBundle };
