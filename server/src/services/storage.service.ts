import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const STORAGE_DIR = path.resolve(__dirname, '../../storage/components');
export { STORAGE_DIR };

// Ensure storage directory exists on startup
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Extract a zip buffer into storage/components/{uuid}/
 * Returns the list of extracted file names.
 */
const saveBundle = (uuid: string, file: Express.Multer.File): string[] => {
  const componentDir = path.join(STORAGE_DIR, uuid);

  if (fs.existsSync(componentDir)) {
    fs.rmSync(componentDir, { recursive: true, force: true });
  }
  fs.mkdirSync(componentDir, { recursive: true });

  const zip = new AdmZip(file.buffer);
  zip.extractAllTo(componentDir, true);

  // Flatten: if the zip contains a single root folder, hoist its contents up
  const entries = fs.readdirSync(componentDir);
  if (
    entries.length === 1 &&
    fs.statSync(path.join(componentDir, entries[0])).isDirectory()
  ) {
    const innerDir = path.join(componentDir, entries[0]);
    for (const child of fs.readdirSync(innerDir)) {
      fs.renameSync(path.join(innerDir, child), path.join(componentDir, child));
    }
    fs.rmdirSync(innerDir);
  }

  return fs.readdirSync(componentDir);
};

/**
 * Read the remoteEntry.json from a component directory.
 */
const getRemoteEntry = (uuid: string): Record<string, unknown> | null => {
  const remoteEntryPath = path.join(STORAGE_DIR, uuid, 'remoteEntry.json');
  if (!fs.existsSync(remoteEntryPath)) return null;
  return JSON.parse(fs.readFileSync(remoteEntryPath, 'utf-8'));
};

/**
 * Delete an entire component directory.
 */
const deleteBundle = (uuid: string): void => {
  const componentDir = path.join(STORAGE_DIR, uuid);
  if (!fs.existsSync(componentDir)) {
    throw new Error(`Bundle directory not found for UUID: ${uuid}`);
  }
  fs.rmSync(componentDir, { recursive: true, force: true });
};

/**
 * Check whether a component directory exists and contains a remoteEntry.json.
 */
const exists = (uuid: string): boolean => {
  const componentDir = path.join(STORAGE_DIR, uuid);
  return (
    fs.existsSync(componentDir) &&
    fs.statSync(componentDir).isDirectory() &&
    fs.existsSync(path.join(componentDir, 'remoteEntry.json'))
  );
};

export const storageService = {
  saveBundle,
  getRemoteEntry,
  deleteBundle,
  exists,
};
