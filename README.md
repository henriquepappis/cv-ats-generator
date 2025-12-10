# cv-ats-generator

Monolito modular em Node.js + TypeScript para gerar currículos ATS-friendly com ingestão de arquivos e uso de LLM.

## Stack inicial
- Next.js (App Router) para frontend + rotas API.
- Tipagem compartilhada em `src/modules`.
- Zod para validação/normalização de dados.

## Scripts
- `npm run dev` — modo desenvolvimento.
- `npm run build` — build de produção.
- `npm run start` — inicia build gerado.
- `npm run lint` — ESLint.
- `npm run typecheck` — checagem de tipos.

## Estrutura
- `src/app` — páginas e rotas API do Next.
- `src/modules` — domínios desacoplados (resume, storage, openai).
  - `resume` — tipos, ingestão e normalização.
  - `storage` — abstrações para blobs/arquivos.
  - `openai` — cliente/serviço de LLM.
- `public` — assets estáticos (vazio por enquanto).
- `prisma` — schema do banco para usuários e templates.

## Fluxo atual (JSON -> template)
- O sistema aceita somente JSON no formato esperado e renderiza em um template HTML ATS-friendly.
- Rota `POST /api/render`: corpo `{ "resume": <json> }` validado via Zod (`ResumeSchema`); retorna `{ "html": "<...>" }`.
- Rota `POST /api/render/pdf`: corpo `{ "resume": <json> }`; retorna um PDF gerado via pdfkit no template base.
- Upload de arquivos e LLM foram desconsiderados neste fluxo.

## Próximos passos sugeridos
- Instalar dependências: `npm install` (ou `pnpm i`/`yarn`).
- Persistir versões do JSON e HTML em um banco (ex.: Postgres + Prisma).
- Adicionar geração de PDF a partir do HTML (Playwright).
- Criar mais templates e selecionar por parâmetro.

## Banco e migrações (Prisma + Postgres)
- URL default: `DATABASE_URL=postgresql://cvats:cvats@db:5432/cv_ats` (veja `.env.example`).
- Modelos:
  - `User`: `id`, `email` (único), `password`, timestamps.
  - `Template`: `id`, `name`, `company?`, `content` (JSON), `createdAt`, `updatedAt`, `deletedAt?`, `userId` (FK).
  - `Session`: `id`, `userId`, `tokenHash`, `expiresAt`, `createdAt`, `revokedAt?`, `userAgent?`, `ip?`.
- Comandos:
  - `npx prisma migrate dev --name init_auth_templates` (ou `--create-only` se não quiser aplicar).
  - `npx prisma generate`.
- Docker Compose inclui Postgres (`db`) e app (`app`).

## Autenticação (mock)
- Páginas: `/login`, `/signup` (cookies `auth_token` + `refresh_token` são definidos ao logar/cadastrar).
- APIs: `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/refresh`.
- Middleware redireciona para `/login` se não houver `auth_token` válido; para APIs retorna 401 (rota de refresh é pública para renovação).
- JWT de acesso: 15 minutos (`auth_token`), Refresh token: 30 dias (`refresh_token`, armazenado hasheado em `Session`).
- Para produção, configure `AUTH_SECRET` e aplique as migrações (`Session` inclui refresh tokens com rotação).
