import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.resolve(__dirname, '../../storage/components');

// Ensure storage directory exists on startup
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = ['.js', '.mjs'];

// Find the stored file for a UUID regardless of extension
const resolveBundlePath = (uuid: string): string | null => {
  for (const ext of ALLOWED_EXTENSIONS) {
    const filePath = path.join(STORAGE_DIR, `${uuid}${ext}`);
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
};

const saveBundle = (uuid: string, file: Express.Multer.File): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const filePath = path.join(STORAGE_DIR, `${uuid}${ext}`);
  fs.writeFileSync(filePath, file.buffer);
};

const getBundle = (uuid: string): Buffer => {
  const filePath = resolveBundlePath(uuid);
  if (!filePath) throw new Error(`Bundle not found for UUID: ${uuid}`);
  return fs.readFileSync(filePath);
};

const deleteBundle = (uuid: string): void => {
  const filePath = resolveBundlePath(uuid);
  if (!filePath) throw new Error(`Bundle not found for UUID: ${uuid}`);
  fs.unlinkSync(filePath);
};

const exists = (uuid: string): boolean => {
  return resolveBundlePath(uuid) !== null;
};

export const storageService = {
  saveBundle,
  getBundle,
  deleteBundle,
  exists,
};
