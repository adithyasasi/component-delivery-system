import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storage.service';

const REGISTRY_PATH = path.resolve(__dirname, '../../storage/registry.json');

// ── Types ───────────────────────────────────────────────────────────────────

export interface ComponentMeta {
  uuid: string;
  name: string;
  exposedModule: string;   // primary exposed module (first or user-specified)
  exposedModules: string[]; // all exposed modules from remoteEntry.json
  remoteEntry: string;      // full URL served via /static/{bundleUuid}/remoteEntry.json
  bundleUuid: string;       // UUID of the bundle directory (for storage cleanup)
  createdAt: string;
}

export type Registry = Record<string, ComponentMeta>;

// ── Helpers ─────────────────────────────────────────────────────────────────

const loadRegistry = (): Registry => {
  if (!fs.existsSync(REGISTRY_PATH)) return {};
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
};

const saveRegistry = (registry: Registry): void => {
  const dir = path.dirname(REGISTRY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
};

// ── Public API ──────────────────────────────────────────────────────────────

const generateUUID = (): string => uuidv4();

const isRegistered = (uuid: string): boolean => {
  return !!getMeta(uuid);
};

/**
 * Register a newly-uploaded component in the persistent registry.
 */
const register = (
  uuid: string,
  opts: {
    name: string;
    exposedModule: string;
    exposedModules: string[];
    baseUrl: string;
    bundleUuid: string;
  },
): ComponentMeta => {
  const registry = loadRegistry();

  const meta: ComponentMeta = {
    uuid,
    name: opts.name,
    exposedModule: opts.exposedModule,
    exposedModules: opts.exposedModules,
    remoteEntry: `${opts.baseUrl}/static/${opts.bundleUuid}/remoteEntry.json`,
    bundleUuid: opts.bundleUuid,
    createdAt: new Date().toISOString(),
  };

  registry[uuid] = meta;
  saveRegistry(registry);
  return meta;
};

/**
 * Remove a component from the persistent registry.
 */
const unregister = (uuid: string): void => {
  const registry = loadRegistry();
  delete registry[uuid];
  saveRegistry(registry);
};

/**
 * Get metadata for a single component.
 */
const getMeta = (uuid: string): ComponentMeta | undefined => {
  return loadRegistry()[uuid];
};

/**
 * Return the full registry (all components).
 */
const getAll = (): Registry => loadRegistry();

export const registryService = {
  generateUUID,
  isRegistered,
  register,
  unregister,
  getMeta,
  getAll,
};
