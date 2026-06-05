// Barrel — mirrors data/repository.dart (food-delivery + auth + settings subset).
import { authRepo } from './auth';
import { catalogRepo } from './catalog';
import { settingsRepo } from './settings';

export const repository = {
  ...authRepo,
  ...catalogRepo,
  ...settingsRepo,
};

export { authRepo, catalogRepo, settingsRepo };
