# sonoprofundo — Next.js 14

Site real navegável, em **Next.js 14 (App Router) + TypeScript**.
Mobile-first (max-width 480px), tema noturno, tipografia Newsreader + Inter Tight.

## Rodando localmente

```bash
cd nextjs-app
npm install
npm run dev
```

Abre em `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run start
```

## Estrutura

```
src/
├── app/
│   ├── layout.tsx         # root + fontes Google + tabbar
│   ├── globals.css        # tokens (CSS vars) + utilities
│   ├── page.tsx           # Home
│   ├── blog/
│   │   ├── page.tsx       # Lista com filtro por categoria
│   │   └── [slug]/page.tsx# Post dinâmico (generateStaticParams)
│   ├── quiz/page.tsx      # Quiz de 6 perguntas + resultado
│   ├── calculadora/page.tsx# Ciclos de sono
│   ├── checklist/page.tsx # Higiene do sono
│   ├── produtos/page.tsx
│   └── sobre/page.tsx
├── components/
│   ├── TabBar.tsx         # Navegação inferior persistente
│   ├── Logo.tsx, Moon.tsx, StripeImage.tsx
│   ├── NewsletterForm.tsx
│   └── PostTOC.tsx        # Sumário scroll-spy
└── lib/
    └── data.ts            # Posts, produtos, perguntas do quiz
```

## Próximos passos sugeridos

1. **CMS de conteúdo** — substituir `src/lib/data.ts` por Contentlayer / MDX / Sanity.
2. **SEO** — adicionar `metadata` por página + `sitemap.ts` + `robots.ts`.
3. **Newsletter real** — conectar o form em `NewsletterForm.tsx` ao ConvertKit / Mailerlite.
4. **Imagens** — trocar os placeholders `<StripeImage>` por `next/image`.
5. **Analytics** — `@vercel/analytics` ou Plausible.
6. **Deploy** — `vercel deploy` ou `netlify deploy`.

## Notas de design

Tokens em `globals.css` (`--ink-*`, `--amber-glow`, etc.). Classes utilitárias `.serif-h1`, `.kicker`, `.btn-primary`, `.tag-*`. Sem framework de CSS — só CSS vars + inline styles em React, fácil de migrar para Tailwind ou CSS Modules depois.
