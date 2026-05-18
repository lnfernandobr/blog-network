import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLog } from './middleware/requestLog.js';
import { API_NAME, API_VERSION, API_DESCRIPTION } from './config/version.js';

export function createApp() {
  const app = express();
  app.use(helmet());

  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
  const corsOpts =
    allowed.length === 1 && allowed[0] === '*'
      ? cors()
      : cors({
          origin(origin, cb) {
            if (!origin || allowed.includes(origin)) return cb(null, true);
            cb(new Error(`Origin ${origin} not allowed by CORS`));
          },
          credentials: true,
        });
  app.use(corsOpts);

  app.use(express.json({ limit: '2mb' }));
  app.use(requestLog);

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      name: API_NAME,
      version: API_VERSION,
      uptime: process.uptime(),
    });
  });

  app.get('/', (_req, res) => {
    res.type('html').send(renderLandingPage());
  });

  app.use('/api/v1/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

function renderLandingPage() {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${API_NAME} · v${API_VERSION}</title>
<style>
  :root {
    color-scheme: light dark;
    --fg: #0f172a;
    --muted: #64748b;
    --bg: #ffffff;
    --card: #f8fafc;
    --border: #e2e8f0;
    --accent: #fe2c55;
    --code-bg: #f1f5f9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fg: #e2e8f0;
      --muted: #94a3b8;
      --bg: #0f172a;
      --card: #1e293b;
      --border: #334155;
      --code-bg: #1e293b;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif; line-height: 1.55; }
  .wrap { max-width: 720px; margin: 0 auto; padding: 64px 24px 96px; }
  header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .logo { width: 36px; height: 36px; border-radius: 8px; background: var(--accent); color: white; display: grid; place-items: center; font-weight: 700; font-size: 18px; }
  h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 999px; background: var(--card); border: 1px solid var(--border); font-size: 12px; font-weight: 500; color: var(--muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  p { color: var(--muted); margin: 16px 0 0; }
  h2 { margin: 36px 0 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--muted); }
  .endpoints { display: grid; gap: 6px; padding: 16px; background: var(--card); border: 1px solid var(--border); border-radius: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  .endpoints div { display: flex; gap: 12px; align-items: center; }
  .method { display: inline-block; min-width: 44px; color: var(--accent); font-weight: 600; font-size: 11px; }
  .path { color: var(--fg); }
  .desc { color: var(--muted); margin-left: auto; font-size: 12px; }
  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  code { background: var(--code-bg); padding: 1px 6px; border-radius: 4px; font-size: 0.9em; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">F</div>
      <div>
        <h1>${API_NAME}</h1>
        <span class="badge">v${API_VERSION}</span>
      </div>
    </header>
    <p>${API_DESCRIPTION}</p>

    <h2>Endpoints</h2>
    <div class="endpoints">
      <div><span class="method">GET</span><span class="path">/health</span><span class="desc">status + uptime + version</span></div>
      <div><span class="method">·</span><span class="path">/api/v1/auth</span><span class="desc">login / me</span></div>
    </div>

    <h2>Status</h2>
    <p>Healthcheck JSON at <a href="/health"><code>/health</code></a>.</p>

    <footer>
      <span>© ${year} Fernando — private.</span>
      <span>node ${process.version}</span>
    </footer>
  </div>
</body>
</html>`;
}
