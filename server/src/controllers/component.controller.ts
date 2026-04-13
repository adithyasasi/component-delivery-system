import { Request, Response } from 'express';
import { registryService } from '../services/registry.service';
import { storageService } from '../services/storage.service';

/**
 * POST /components
 * Body (multipart): bundle (.zip), name (text), exposedModule (text)
 * Extracts the federation zip, registers metadata, returns the manifest entry.
 */
const uploadComponent = (req: Request, res: Response): void => {
  const uuid = registryService.generateUUID();

  // Extract zip into storage/components/{uuid}/
  const files = storageService.saveBundle(uuid, req.file!);

  // Verify the zip contained a remoteEntry.json
  if (!files.includes('remoteEntry.json')) {
    storageService.deleteBundle(uuid);
    res.status(400).json({
      error:
        'Invalid federation bundle: zip must contain a remoteEntry.json at the root level.',
    });
    return;
  }

  // Auto-detect name and exposedModule from remoteEntry.json,
  // falling back to user-provided values or defaults
  const remoteEntry = storageService.getRemoteEntry(uuid) as Record<string, any> | null;
  const detectedName = remoteEntry?.name || undefined;
  const detectedExposes: string[] = Array.isArray(remoteEntry?.exposes)
    ? remoteEntry.exposes.map((e: any) => e.key as string)
    : [];

  const name: string =
    req.body?.name || (req.query?.name as string) || detectedName || 'unnamed-component';
  const exposedModule: string =
    req.body?.exposedModule ||
    (req.query?.exposedModule as string) ||
    detectedExposes[0] ||
    './Component';

  // Build the base URL from the incoming request
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // Persist metadata in registry.json
  const meta = registryService.register(uuid, {
    name,
    exposedModule,
    exposedModules: detectedExposes.length > 0 ? detectedExposes : [exposedModule],
    baseUrl,
  });

  res.status(201).json(meta);
};

/**
 * GET /components
 * Returns the full federation manifest (all registered remotes).
 */
const listComponents = (_req: Request, res: Response): void => {
  const registry = registryService.getAll();
  res.json(registry);
};

/**
 * GET /components/:uuid/manifest
 * Returns the metadata for a single registered component.
 */
const getComponentManifest = (req: Request, res: Response): void => {
  const { uuid } = req.params;
  const meta = registryService.getMeta(uuid);

  if (!meta) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  res.json(meta);
};

/**
 * GET /components/:uuid
 * Returns the remoteEntry.json content directly (convenience endpoint).
 */
const getComponent = (req: Request, res: Response): void => {
  const { uuid } = req.params;

  if (!registryService.isRegistered(uuid)) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  const remoteEntry = storageService.getRemoteEntry(uuid);
  if (!remoteEntry) {
    res.status(500).json({ error: 'remoteEntry.json missing from storage' });
    return;
  }

  res.json(remoteEntry);
};

/**
 * DELETE /components/:uuid
 * Removes the component directory and its registry entry.
 */
const deleteComponent = (req: Request, res: Response): void => {
  const { uuid } = req.params;

  if (!registryService.isRegistered(uuid)) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  storageService.deleteBundle(uuid);
  registryService.unregister(uuid);
  res.status(200).json({ message: `Component "${uuid}" deleted successfully` });
};

export const componentController = {
  uploadComponent,
  listComponents,
  getComponentManifest,
  getComponent,
  deleteComponent,
};
