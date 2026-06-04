import { Router } from 'express';
import { applyPolicyFiles, previewPolicyFiles } from '../services/policyFiles';

export const policyRouter = Router();

policyRouter.post('/preview', async (req, res, next) => {
  try {
    const result = await previewPolicyFiles(req.body?.profile);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

policyRouter.post('/apply', async (req, res, next) => {
  try {
    const result = await applyPolicyFiles(req.body?.profile, Array.isArray(req.body?.confirmedPaths) ? req.body.confirmedPaths : []);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
