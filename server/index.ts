import express from 'express';
import { policyRouter } from './routes/policy';
import { profileRouter } from './routes/profile';
import { skillsRouter } from './routes/skills';

const app = express();
const port = Number(process.env.SKILLGATE_API_PORT || 8787);

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'skillgate-api',
    version: '0.1.0',
    time: new Date().toISOString()
  });
});

app.use('/api/skills', skillsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/policy', policyRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`SkillGate API listening on http://localhost:${port}`);
});
