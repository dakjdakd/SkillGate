import express from 'express';
import { policyRouter } from './routes/policy';
import { profileRouter } from './routes/profile';
import { skillsRouter } from './routes/skills';
import { SCANNER_VERSION } from './services/skillScanner';

const app = express();
const port = Number(process.env.SKILLGATE_API_PORT || 8787);
const maxPortRetries = 3;

app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'skillgate-api',
    version: '0.1.0',
    scannerMode: 'local-only',
    scannerVersion: SCANNER_VERSION,
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

function listenWithFallback(nextPort: number, retriesLeft: number) {
  const server = app.listen(nextPort, () => {
    console.log(`SkillGate API listening on http://localhost:${nextPort}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
      const fallbackPort = nextPort + 1;
      console.warn(`Port ${nextPort} is in use. Trying http://localhost:${fallbackPort}...`);
      listenWithFallback(fallbackPort, retriesLeft - 1);
      return;
    }

    throw error;
  });
}

listenWithFallback(port, maxPortRetries);
