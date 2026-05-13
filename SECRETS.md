# Secrets — Doppler

Todos os secrets do projeto (API + 3 apps Next.js + deploy) vivem no [Doppler](https://doppler.com).
**Free tier Hobby** cobre sem custo: 1 projeto × N environments × até 3 users.

```
┌─────────────────┐
│     Doppler     │  ← source of truth
│  blog-network   │
│  ├─ dev         │  ← seu laptop
│  └─ prod        │  ← VPS + Vercel
└────────┬────────┘
         │
   ┌─────┼──────────┬──────────┐
   ▼     ▼          ▼          ▼
  CLI  Vercel     GitHub      VPS
 (dev) integration Actions  (via deploy)
```

---

## Setup inicial (one-time)

### 1. Conta + projeto

1. Cria conta em [doppler.com](https://doppler.com)
2. **+ New project** → `blog-network`
3. Doppler cria os configs `dev`, `staging`, `prd` automaticamente. **Deleta o `staging`** (não usamos).
4. Renomeia `prd` → `prod` (opcional, mais legível).

### 2. Importar os secrets iniciais

Os arquivos `doppler-dev.env` e `doppler-prod.env` na raiz (gitignored) têm tudo pronto.

**Via UI:**
- Config `dev` → **Import secrets** → cola conteúdo do `doppler-dev.env` ou faz upload
- Config `prod` → idem com `doppler-prod.env`

**Via CLI:**
```bash
brew install dopplerhq/cli/doppler          # macOS
# OU
curl -Ls https://cli.doppler.com/install.sh | sudo sh   # Linux/WSL

doppler login                                # abre browser pra autorizar
doppler setup --project blog-network --config dev

doppler secrets upload doppler-dev.env --project blog-network --config dev
doppler secrets upload doppler-prod.env --project blog-network --config prod
```

Depois **delete os arquivos `doppler-*.env`** do disco — eles têm secrets em texto plano e já cumpriram o papel.

### 3. Setup local (dev)

```bash
doppler login                            # uma vez
doppler setup                            # escolha blog-network + dev
pnpm dev                                 # automaticamente injeta env vars
```

Os scripts em `package.json` rodam via `doppler run -- ...` — Doppler injeta cada secret como variável de ambiente.

> Sem Doppler instalado, qualquer `pnpm dev:*` da raiz vai falhar com "doppler: command not found". Pra rodar **sem** doppler, vá pro app: `cd apps/api && pnpm dev` (ele tenta carregar `.env.local` se existir).

### 4. Integração Vercel (apps Next.js)

Pra cada app na Vercel (admin, social-admin, sonoprofundo):

1. No Doppler dashboard → projeto `blog-network` → **Integrations** → **Add Vercel**
2. Autoriza acesso à sua conta Vercel
3. Pra cada Vercel project, mapeia:
   - **Doppler config**: `prod`
   - **Vercel environment**: `Production` (e opcionalmente Preview)
4. Doppler passa a sincronizar TODOS os secrets do config `prod` pras env vars da Vercel
5. **Remove env vars duplicadas** que você setou manualmente na UI da Vercel (Doppler vai sobrescrever)

> Vai funcionar mesmo com vars "extras" que aquele Next app não consome (ex: `MONGODB_URI` na Vercel da sonoprofundo) — Next.js ignora env vars que não usa. Se quiser ser cirúrgico, o Doppler permite filtrar quais secrets vão pra qual project.

### 5. Integração GitHub Actions (deploy do API)

O workflow `.github/workflows/deploy-api.yml` já está preparado pra puxar secrets do Doppler.

1. Doppler → projeto `blog-network` → config `prod` → **Service Tokens** → **+ Generate**
   - Name: `github-actions-deploy`
   - Access: **Read** (não precisa write)
2. Copia o token (`dp.st.prod.XXXXX`)
3. GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `DOPPLER_TOKEN_PROD`
   - Value: (cola o token)

Pronto. No próximo push em `main` o workflow vai:
1. Esperar o CI passar
2. Instalar Doppler CLI no runner
3. `doppler secrets download --format=env > /tmp/api.env`
4. SCP esse `.env` pro VPS
5. SSH no VPS, git pull, install, `pm2 reload`

Os secrets nunca tocam o disco do VPS por mais que segundos (e o `.env` é sobrescrito em todo deploy).

---

## Operação diária

### Mudei uma key, como aplico?

| Onde mudou | O que faz |
|---|---|
| **Local dev** | Edita no Doppler UI (ou `doppler secrets set KEY=value`). Reinicia `pnpm dev`. |
| **Prod — VPS** | Edita no Doppler UI. Trigger manual: GitHub → Actions → Deploy API → Run workflow. |
| **Prod — Vercel** | Edita no Doppler UI. Doppler integration redeploy as Vercel projects automaticamente. |

### Adicionar nova var

1. Doppler UI → config (dev OU prod) → **+ Add secret**
2. Se for usada em prod: pra cada lugar consumidor (VPS / Vercel), o redeploy automático já cuida
3. Se for usada no dev local: reinicia `pnpm dev`

### Listar tudo sem expor valores

```bash
doppler secrets --only-names
```

### Pull pra um `.env` local (debug)

```bash
pnpm secrets:pull          # gera .env.dopplerpulled.local (gitignored)
```

### Rotacionar segredo crítico (ex: JWT)

```bash
NEW=$(openssl rand -hex 32)
doppler secrets set JWT_SECRET="$NEW" --config prod
# Trigger deploy na hora:
gh workflow run deploy-api.yml
```

Vercel reload automático via integration. Usuários precisarão re-logar (porque tokens existentes ficam inválidos com novo JWT_SECRET).

---

## Cenários de fallback

### "Doppler está fora do ar, preciso rodar dev"

Os `.env.local.bak` ainda estão presentes nos apps:

```bash
mv apps/api/.env.local.bak apps/api/.env.local
mv apps/admin/.env.local.bak apps/admin/.env.local
mv apps/sonoprofundo/.env.local.bak apps/sonoprofundo/.env.local

# Roda direto sem doppler:
cd apps/api && pnpm dev    # cada app individualmente
```

(Doppler é AWS us-east-1 — incidentes são raros, mas possíveis.)

### "Quero voltar atrás e não usar Doppler"

```bash
# Restaura os .env.local
for f in apps/api apps/admin apps/sonoprofundo; do
  mv "$f/.env.local.bak" "$f/.env.local"
done

# Reverte package.json:
git checkout HEAD~1 -- package.json
# (ou edita manualmente, tirando `doppler run --` dos scripts)
```

---

## Custo

- **Doppler Hobby** (free): cobre 1 projeto, 3 envs, 3 users. **Você cabe.**
- **Doppler Team** ($14/user/mês): só quando quiser >3 users ou audit avançado.

Sem usar Doppler, esse mesmo problema custaria:
- AWS Secrets Manager: ~$10/mês pra ~25 secrets (pouco mas não-zero)
- AWS Systems Manager Parameter Store: free pra parâmetros básicos, $0.05/10k API calls. Funciona mas não integra com Vercel nativo.
- Sem nada: você duplica em 4-5 lugares e reza pra nunca esquecer.
