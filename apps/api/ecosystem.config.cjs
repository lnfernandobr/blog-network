/**
 * PM2 ecosystem for the API on a Linux VPS (AWS Lightsail / EC2 / DigitalOcean).
 *
 * Full step-by-step in DEPLOY.md. Summary:
 *
 *   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
 *   sudo apt-get install -y nodejs
 *   sudo npm i -g pnpm pm2
 *   git clone <repo> /opt/fernandolimaindie && cd /opt/fernandolimaindie
 *   pnpm install --filter @fernandolimaindie/api...
 *   sudo mkdir -p /var/log/fernandolimaindie-api && sudo chown $USER /var/log/fernandolimaindie-api
 *   pm2 start apps/api/ecosystem.config.cjs
 *   pm2 save && pm2 startup   # automatic boot
 *
 * Reload (CI/CD): `pm2 reload fernandolimaindie-api --update-env` (zero downtime).
 */
module.exports = {
  apps: [
    {
      name: 'fernandolimaindie-api',
      cwd: './apps/api',
      script: 'doppler',
      args: 'run -- pnpm start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        // Cap V8 heap at 1GB. Avoids GC panic on small VMs.
        NODE_OPTIONS: '--max-old-space-size=1024',
      },
      // node + mongoose + express normally sits at 200-350MB.
      // Peak (request + GC + log batch) can hit 700MB. Headroom up to 1.2GB.
      max_memory_restart: '1200M',
      // On crash, wait before restarting (avoids tight loop).
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '30s',
      autorestart: true,
      watch: false,
      merge_logs: true,
      time: true,
      // Per-stream logs. pm2-logrotate (installed in DEPLOY.md)
      // rotates automatically when files exceed 50MB.
      out_file: '/var/log/fernandolimaindie-api/out.log',
      error_file: '/var/log/fernandolimaindie-api/err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
