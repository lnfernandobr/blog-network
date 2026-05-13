import { Router, type Router as RouterType } from 'express';
import { socialAccountsRouter } from './accounts.js';
import { socialCampaignsRouter } from './campaigns.js';
import { socialPostsRouter } from './posts.js';
import { socialRunsRouter } from './runs.js';

export const socialRouter: RouterType = Router();

socialRouter.use('/accounts', socialAccountsRouter);
socialRouter.use('/campaigns', socialCampaignsRouter);
socialRouter.use('/posts', socialPostsRouter);
socialRouter.use('/runs', socialRunsRouter);
