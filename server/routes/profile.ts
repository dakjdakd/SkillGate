import { Router } from 'express';
import { recommendProfile } from '../services/profileRecommender';

export const profileRouter = Router();

profileRouter.post('/recommend', (req, res, next) => {
  try {
    const result = recommendProfile({
      profileDraft: req.body?.profileDraft,
      requirement: req.body?.requirement || '',
      skills: req.body?.skills,
      userOverrides: req.body?.userOverrides
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});
