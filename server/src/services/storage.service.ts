import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.resolve(__dirname, '../../storage/components');

// Ensure storage directory exists on startup
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const getBundlePath = (uuid: string): string => {
  return path.join(STORAGE_DIR, `${uuid}.js`);
};

const saveBundle = (uuid: string, buffer: Buffer): void => {
  fs.writeFileSync(getBundlePath(uuid), buffer);
};

const getBundle = (uuid: string): Buffer => {
  return fs.readFileSync(getBundlePath(uuid));
};

const deleteBundle = (uuid: string): void => {
  fs.unlinkSync(getBundlePath(uuid));
};

const exists = (uuid: string): boolean => {
  return fs.existsSync(getBundlePath(uuid));
};

export const storageService = {
  saveBundle,
  getBundle,
  deleteBundle,
  exists,
};
