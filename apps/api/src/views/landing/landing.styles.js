export const landingStyles = `
  :root {
    color-scheme: light dark;
    --fg: #0b1220;
    --fg-soft: #1f2937;
    --muted: #64748b;
    --muted-2: #94a3b8;
    --bg: #fafafa;
    --bg-grad: radial-gradient(1200px 600px at 50% -10%, rgba(254, 44, 85, 0.06), transparent 60%);
    --card: #ffffff;
    --border: #ececf0;
    --border-strong: #e2e2ea;
    --accent: #fe2c55;
    --accent-soft: rgba(254, 44, 85, 0.08);
    --code-bg: #f4f4f6;
    --live: #16a34a;
    --shadow: 0 1px 0 rgba(15, 23, 42, 0.03), 0 8px 24px -12px rgba(15, 23, 42, 0.08);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --fg: #f1f5f9;
      --fg-soft: #cbd5e1;
      --muted: #94a3b8;
      --muted-2: #64748b;
      --bg: #0a0a0c;
      --bg-grad: radial-gradient(1200px 600px at 50% -10%, rgba(254, 44, 85, 0.10), transparent 60%);
      --card: #111114;
      --border: #1f1f24;
      --border-strong: #26262c;
      --code-bg: #16161a;
      --live: #4ade80;
      --shadow: 0 1px 0 rgba(0, 0, 0, 0.4), 0 8px 24px -12px rgba(0, 0, 0, 0.6);
    }
  }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    background-image: var(--bg-grad);
    background-repeat: no-repeat;
    color: var(--fg);
    font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-feature-settings: 'ss01', 'cv11';
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    line-height: 1.55;
  }

  .wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 88px 24px 96px;
  }

  .hero { display: flex; align-items: center; gap: 14px; }
  .hero__title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .logo {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #ff3b6b 0%, var(--accent) 60%, #d81f47 100%);
    color: white;
    display: grid; place-items: center;
    font-weight: 700; font-size: 18px;
    letter-spacing: -0.01em;
    box-shadow: 0 6px 16px -8px rgba(254, 44, 85, 0.55), inset 0 1px 0 rgba(255,255,255,0.25);
  }

  h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.022em;
    color: var(--fg);
  }

  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 9px;
    border-radius: 999px;
    background: var(--card);
    border: 1px solid var(--border-strong);
    font-size: 11.5px;
    font-weight: 500;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-variant-numeric: tabular-nums;
  }

  .tagline {
    color: var(--fg-soft);
    margin: 18px 0 0;
    font-size: 15px;
    max-width: 56ch;
  }

  h2 {
    margin: 44px 0 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .endpoints {
    list-style: none;
    margin: 0;
    padding: 6px;
    display: grid;
    gap: 2px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: var(--shadow);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
  }
  .endpoint {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 12px;
    border-radius: 8px;
    transition: background 120ms ease;
  }
  .endpoint:hover { background: var(--accent-soft); }
  .endpoint__method {
    min-width: 44px;
    color: var(--accent);
    font-weight: 600;
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .endpoint__path { color: var(--fg); }
  .endpoint__desc {
    color: var(--muted);
    margin-left: auto;
    font-size: 12px;
    font-family: ui-sans-serif, -apple-system, system-ui, sans-serif;
  }

  .status {
    display: flex; align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--muted);
    font-size: 14px;
    margin: 0;
  }
  .status__dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--live);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--live) 18%, transparent);
    animation: pulse 2.4s ease-in-out infinite;
  }
  .status__label {
    color: var(--fg-soft);
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .status__sep { color: var(--muted-2); }
  .status__hint { color: var(--muted); }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--live) 18%, transparent); }
    50%      { box-shadow: 0 0 0 7px color-mix(in srgb, var(--live) 6%, transparent); }
  }

  footer {
    margin-top: 56px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
    color: var(--muted-2);
    font-size: 12px;
    display: flex; justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
  }
  .footer__mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-variant-numeric: tabular-nums;
  }

  code {
    background: var(--code-bg);
    padding: 1.5px 6px;
    border-radius: 5px;
    font-size: 0.88em;
    border: 1px solid var(--border);
  }
  a {
    color: var(--accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 120ms ease;
  }
  a:hover { border-bottom-color: var(--accent); }

  @media (max-width: 480px) {
    .wrap { padding: 56px 20px 72px; }
    h1 { font-size: 22px; }
    .endpoint { gap: 10px; padding: 9px 10px; }
    .endpoint__desc { font-size: 11.5px; }
  }
`;
