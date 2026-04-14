import { Request, Response } from 'express';
import { registryService } from '../services/registry.service';
import { storageService } from '../services/storage.service';

/**
 * POST /components
 * Body (multipart): bundle (.zip), name (text), exposedModule (text)
 * Extracts the federation zip, registers metadata, returns the manifest entry.
 */
const uploadComponent = (req: Request, res: Response): void => {
  const bundleUuid = registryService.generateUUID();

  // Extract zip into storage/components/{bundleUuid}/
  const files = storageService.saveBundle(bundleUuid, req.file!);

  // Verify the zip contained a remoteEntry.json
  if (!files.includes('remoteEntry.json')) {
    storageService.deleteBundle(bundleUuid);
    res.status(400).json({
      error:
        'Invalid federation bundle: zip must contain a remoteEntry.json at the root level.',
    });
    return;
  }

  // Auto-detect name and exposedModules from remoteEntry.json
  const remoteEntry = storageService.getRemoteEntry(bundleUuid) as Record<string, any> | null;
  const detectedName = remoteEntry?.name || undefined;
  const detectedExposes: string[] = Array.isArray(remoteEntry?.exposes)
    ? remoteEntry.exposes.map((e: any) => e.key as string)
    : [];

  const name: string =
    req.body?.name || (req.query?.name as string) || detectedName || 'unnamed-component';
  
  // If no exposed modules detected, create one default entry
  const exposedModules = detectedExposes.length > 0 
    ? detectedExposes 
    : [req.body?.exposedModule || (req.query?.exposedModule as string) || './Component'];

  // Build the base URL from the incoming request
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  // Create separate registry entries for each exposed component
  const componentEntries = exposedModules.map((exposedModule) => {
    const componentUuid = registryService.generateUUID();
    return registryService.register(componentUuid, {
      name,
      exposedModule,
      exposedModules,
      baseUrl,
      bundleUuid, // Link back to the bundle directory
    });
  });

  res.status(201).json({
    bundleUuid,
    remoteName: name,
    components: componentEntries,
    message: `Created ${componentEntries.length} component(s) from bundle`,
  });
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
 * GET /components/federation-manifest
 * Returns { remoteName: remoteEntryUrl } map for initFederation().
 */
const getFederationManifest = (_req: Request, res: Response): void => {
  const registry = registryService.getAll();
  const manifest: Record<string, string> = {};
  for (const meta of Object.values(registry)) {
    manifest[meta.name] = meta.remoteEntry;
  }
  res.json(manifest);
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

  const meta = registryService.getMeta(uuid);
  if (!meta) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  const remoteEntry = storageService.getRemoteEntry(meta.bundleUuid);
  if (!remoteEntry) {
    res.status(500).json({ error: 'remoteEntry.json missing from storage' });
    return;
  }

  res.json(remoteEntry);
};

/**
 * DELETE /components/:uuid
 * Removes a single component entry. If it's the last component from a bundle,
 * also removes the bundle directory.
 */
const deleteComponent = (req: Request, res: Response): void => {
  const { uuid } = req.params;

  const meta = registryService.getMeta(uuid);
  if (!meta) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  // Remove this component from the registry
  registryService.unregister(uuid);

  // Check if any other components from the same bundle still exist
  const allComponents = Object.values(registryService.getAll());
  const bundleStillInUse = allComponents.some(c => c.bundleUuid === meta.bundleUuid);

  // If no other components from this bundle exist, clean up the storage directory
  if (!bundleStillInUse) {
    try {
      storageService.deleteBundle(meta.bundleUuid);
    } catch (error) {
      // Storage directory might already be gone, that's OK
    }
  }

  res.status(200).json({ 
    message: `Component "${uuid}" deleted successfully`,
    bundleCleanedUp: !bundleStillInUse,
  });
};

export const componentController = {
  uploadComponent,
  listComponents,
  getFederationManifest,
  getComponentManifest,
  getComponent,
  deleteComponent,
};
