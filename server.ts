import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { analyzeCircular } from './server/analyzer.ts';
import {
  OFFICIAL_BANGLADESH_SOURCES,
  analyzeUrlSafety,
  matchOrganizationSources,
  toPublicSource,
} from './server/sources.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '15mb' }));

// Simple per-IP in-memory rate limiter for AI endpoints
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    next();
    return;
  }
  if (bucket.count >= 25) {
    res.status(429).json({ error: 'Too many analysis requests. Please wait a minute and try again.' });
    return;
  }
  bucket.count += 1;
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'CircularCheck AI' });
});

app.get('/api/verify/sources', (_req, res) => {
  res.json({
    sources: OFFICIAL_BANGLADESH_SOURCES.map(toPublicSource),
  });
});

const VerifyUrlSchema = z.object({
  url: z.string().min(4).max(1000),
});

app.post('/api/verify/url', (req, res) => {
  const parsed = VerifyUrlSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please provide a valid URL to verify.' });
    return;
  }
  const result = analyzeUrlSafety(parsed.data.url);
  res.json({
    ...result,
    matchedOfficialSource: result.matchedOfficialSource
      ? toPublicSource(result.matchedOfficialSource)
      : null,
  });
});

const VerifyOrgSchema = z.object({
  organizationName: z.string().min(2).max(300),
  contextText: z.string().max(4000).optional(),
});

app.post('/api/verify/organization', (req, res) => {
  const parsed = VerifyOrgSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Please provide an organization name.' });
    return;
  }
  const matches = matchOrganizationSources(
    parsed.data.organizationName,
    parsed.data.contextText || ''
  );
  res.json({
    matches: matches.map(toPublicSource),
  });
});

const TextScanSchema = z.object({
  text: z.string().min(20, 'Please paste at least 20 characters of job circular text.').max(12000),
});

app.post('/api/scans/text', checkRateLimit, async (req, res) => {
  const parsed = TextScanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid circular text input.' });
    return;
  }
  try {
    const result = await analyzeCircular({
      inputType: 'text',
      textContent: parsed.data.text,
    });
    res.json({ report: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to analyze circular text.';
    console.error('Scan text error:', msg);
    res.status(502).json({ error: msg });
  }
});

const UrlScanSchema = z.object({
  url: z.string().min(5, 'Please enter a valid circular URL.').max(1000),
});

app.post('/api/scans/url', checkRateLimit, async (req, res) => {
  const parsed = UrlScanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid URL input.' });
    return;
  }
  const urlCheck = analyzeUrlSafety(parsed.data.url);
  if (!urlCheck.valid) {
    res.status(400).json({ error: urlCheck.warnings[0] || 'Malformed URL.' });
    return;
  }
  try {
    const result = await analyzeCircular({
      inputType: 'url',
      url: parsed.data.url,
    });
    res.json({ report: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to analyze circular URL.';
    console.error('Scan url error:', msg);
    res.status(502).json({ error: msg });
  }
});

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
]);

const FileScanSchema = z.object({
  fileName: z.string().min(1).max(240),
  mimeType: z.string().refine((m) => ALLOWED_MIME_TYPES.has(m), {
    message: 'Only PNG, JPEG, WebP images and PDF files are supported.',
  }),
  base64: z.string().min(16).max(14_000_000),
});

app.post('/api/scans/file', checkRateLimit, async (req, res) => {
  const parsed = FileScanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid file upload.' });
    return;
  }
  const decodedSize = Buffer.byteLength(parsed.data.base64, 'base64');
  if (decodedSize > 10 * 1024 * 1024) {
    res.status(400).json({ error: 'Uploaded file exceeds the 10 MB limit.' });
    return;
  }
  const inputType = parsed.data.mimeType === 'application/pdf' ? 'pdf' : 'image';
  try {
    const result = await analyzeCircular({
      inputType,
      fileData: {
        fileName: parsed.data.fileName,
        mimeType: parsed.data.mimeType,
        base64: parsed.data.base64,
      },
    });
    res.json({ report: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to extract and analyze file.';
    console.error('Scan file error:', msg);
    res.status(502).json({ error: msg });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CircularCheck AI server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
