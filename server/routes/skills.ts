import { Router } from 'express';
import { scanSkills } from '../services/skillScanner';

export const skillsRouter = Router();

skillsRouter.post('/scan', async (req, res, next) => {
  try {
    const result = await scanSkills({
      roots: Array.isArray(req.body?.roots) ? req.body.roots : [],
      projectPath: req.body?.projectPath,
      includeBuiltIn: req.body?.includeBuiltIn
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
