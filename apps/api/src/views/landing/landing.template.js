import { PATHS, PUBLIC_ENDPOINTS } from '../../constants/api.js';
import { LANDING_BRAND, LANDING_TEXT } from '../../constants/landing.js';
import { landingStyles } from './landing.styles.js';

const renderEndpointRow = ({ method, path, description }) => `
        <li class="endpoint">
          <span class="endpoint__method">${method}</span>
          <span class="endpoint__path">${path}</span>
          <span class="endpoint__desc">${description}</span>
        </li>`;

const renderEndpoints = (endpoints) => endpoints.map(renderEndpointRow).join('');

export const renderLandingHtml = ({ name, version, description, year, nodeVersion }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${name} · v${version}</title>
<style>${landingStyles}</style>
</head>
<body>
  <main class="wrap">
    <header class="hero">
      <div class="logo" aria-hidden="true">${LANDING_BRAND.LOGO_LETTER}</div>
      <div class="hero__title">
        <h1>${name}</h1>
        <span class="badge" title="version">v${version}</span>
      </div>
    </header>
    <p class="tagline">${description}</p>

    <section>
      <h2>${LANDING_TEXT.ENDPOINTS_HEADING}</h2>
      <ul class="endpoints">${renderEndpoints(PUBLIC_ENDPOINTS)}
      </ul>
    </section>

    <section>
      <h2>${LANDING_TEXT.STATUS_HEADING}</h2>
      <p class="status">
        <span class="status__dot" aria-hidden="true"></span>
        <span class="status__label">${LANDING_TEXT.STATUS_LIVE_LABEL}</span>
        <span class="status__sep">·</span>
        <span class="status__hint">${LANDING_TEXT.HEALTHCHECK_HINT} <a href="${PATHS.HEALTH}"><code>${PATHS.HEALTH}</code></a></span>
      </p>
    </section>

    <footer>
      <span>© ${year} ${LANDING_BRAND.OWNER} · ${LANDING_BRAND.VISIBILITY}</span>
      <span class="footer__mono">node ${nodeVersion}</span>
    </footer>
  </main>
</body>
</html>`;
