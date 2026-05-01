/**
 * PM2 ecosystem para a API em VPS Linux (AWS Lightsail / EC2 / DigitalOcean).
 *
 * Passo a passo completo no DEPLOY.md. Resumo:
 *
 *   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
 *   sudo apt-get install -y nodejs
 *   sudo npm i -g pnpm pm2
 *   git clone <repo> /opt/blog-network && cd /opt/blog-network
 *   pnpm install --filter @bn/api...
 *   nano apps/api/.env   # preenche os valores de produção
 *   pm2 start apps/api/ecosystem.config.cjs
 *   pm2 save && pm2 startup   # boot automático
 */
module.exports = {
  apps: [
    {
      name: 'bn-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
    },
  ],
};
