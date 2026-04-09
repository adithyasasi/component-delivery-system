import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storage.service';

const generateUUID = (): string => {
  return uuidv4();
};

const isRegistered = (uuid: string): boolean => {
  return storageService.exists(uuid);
};

export const registryService = {
  generateUUID,
  isRegistered,
};
