import { Router } from 'express';
import { componentController } from '../controllers/component.controller';
import { validateBundle } from '../middleware/validation.middleware';

const router = Router();

router.post('/', validateBundle, componentController.uploadComponent);
router.get('/:uuid', componentController.getComponent);
router.delete('/:uuid', componentController.deleteComponent);

export default router;
