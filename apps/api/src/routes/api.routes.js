import { Router } from 'express';
import { PATHS } from '../constants/api.js';
import { createAuthRouter } from '../modules/auth/index.js';
import { createWaitlistRouter } from '../modules/waitlist/index.js';

export const createApiRouter = () => {
  const router = Router();
  router.use(PATHS.AUTH, createAuthRouter());
  router.use(PATHS.WAITLIST, createWaitlistRouter());
  return router;
};
