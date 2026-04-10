import { Request, Response } from 'express';
import { registryService } from '../services/registry.service';
import { storageService } from '../services/storage.service';

const uploadComponent = (req: Request, res: Response): void => {
  const uuid = registryService.generateUUID();
  storageService.saveBundle(uuid, req.file!);
  res.status(201).json({ uuid });
};

const getComponent = (req: Request, res: Response): void => {
  const { uuid } = req.params;

  if (!registryService.isRegistered(uuid)) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  const bundle = storageService.getBundle(uuid);
  res.setHeader('Content-Type', 'application/javascript');
  res.send(bundle);
};

const deleteComponent = (req: Request, res: Response): void => {
  const { uuid } = req.params;

  if (!registryService.isRegistered(uuid)) {
    res.status(404).json({ error: `Component with UUID "${uuid}" not found` });
    return;
  }

  storageService.deleteBundle(uuid);
  res.status(200).json({ message: `Component "${uuid}" deleted successfully` });
};

export const componentController = {
  uploadComponent,
  getComponent,
  deleteComponent,
};
