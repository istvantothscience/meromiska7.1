import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-side evaluation for Chapter 6 (l6) when Supabase RPC `app_check_and_submit`
// has not yet been created in the teacher's Supabase SQL Editor.
// Answer keys never leave the server and never appear in the frontend bundle.
function evaluateL6TaskOnServer(item: string, answer: Record<string, unknown>): boolean {
  if (!answer || typeof answer !== 'object') return false;

  switch (item) {
    case 'l6_a_szamolj': {
      const t = Number(answer.t);
      const felT = Number(answer.fel_t);
      if (!Number.isFinite(t) || !Number.isFinite(felT)) return false;
      // 20.4 / 10 = 2.04, half-period = 1.02
      const expectedT = 20.4 / 10;
      const expectedHalfT = expectedT / 2;
      return Math.abs(t - expectedT) < 0.05 && Math.abs(felT - expectedHalfT) < 0.05;
    }
    case 'l6_b_valts_at': {
      const ertek = Number(answer.ertek);
      if (!Number.isFinite(ertek)) return false;
      // SHA-256 of "7200" = "b35601032b644a2079199f847d5a8c62f8c7a8aa9a0ebf3d5307e4a717f8e051"
      const normalized = String(Math.round(ertek));
      const hash = crypto.createHash('sha256').update(normalized).digest('hex');
      const targetHash = crypto.createHash('sha256').update(String(2 * 60 * 60)).digest('hex');
      return hash === targetHash;
    }
    case 'l6_c_igazhamis': {
      if (typeof answer.valasz !== 'boolean') return false;
      return answer.valasz === !true;
    }
    case 'l6_d_gondolkodj': {
      const szoveg = typeof answer.szoveg === 'string' ? answer.szoveg.trim() : '';
      if (szoveg.length < 15) return false;
      const lower = szoveg.toLowerCase();
      const stripped = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return (
         stripped.includes('hiba') ||
         stripped.includes('pontos') ||
         stripped.includes('atlag') ||
         stripped.includes('reakcio') ||
         stripped.includes('teved') ||
         stripped.includes('kisebb')
      );
    }
    default:
      return false;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.post('/api/check-task', (req, res) => {
    try {
      const { item, answer } = req.body || {};
      if (typeof item !== 'string') {
        res.status(400).json({ correct: false, error: 'Missing task item' });
        return;
      }
      const correct = evaluateL6TaskOnServer(item, answer || {});
      res.json({ correct });
    } catch (err) {
      console.error('Error in /api/check-task:', err);
      res.status(500).json({ correct: false });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
