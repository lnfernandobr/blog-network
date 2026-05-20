import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { handleSignup } from './waitlist.controller.js';

export const createWaitlistRouter = () => {
  const router = Router();
  router.post('/', asyncHandler(handleSignup));
  return router;
};
