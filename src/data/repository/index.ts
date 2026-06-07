// Barrel — mirrors data/repository.dart (food-delivery + auth + settings subset).
import { authRepo } from './auth';
import { catalogRepo } from './catalog';
import { settingsRepo } from './settings';
import { ordersRepo } from './orders';
import { complaintsRepo } from './complaints';

export const repository = {
  ...authRepo,
  ...catalogRepo,
  ...settingsRepo,
  ...ordersRepo,
  ...complaintsRepo,
};

export { authRepo, catalogRepo, settingsRepo, ordersRepo, complaintsRepo };
