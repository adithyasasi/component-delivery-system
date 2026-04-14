import { Router } from 'express';
import { componentController } from '../controllers/component.controller';
import { validateBundle } from '../middleware/validation.middleware';

const router = Router();

// List all registered components (federation manifest)
router.get('/', componentController.listComponents);

// Upload a new federation bundle (.zip)
router.post('/', validateBundle, componentController.uploadComponent);

// Federation manifest for initFederation() — { name: remoteEntryUrl }
router.get('/federation-manifest', componentController.getFederationManifest);

// Get metadata for a single component
router.get('/:uuid/manifest', componentController.getComponentManifest);

// Get remoteEntry.json content for a component
router.get('/:uuid', componentController.getComponent);

// Delete a component
router.delete('/:uuid', componentController.deleteComponent);

export default router;
