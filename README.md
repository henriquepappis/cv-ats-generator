# cv-ats-generator

Aplicação Next.js (App Router) para gerar currículos ATS-friendly a partir de JSON, baixar/abrir PDF e gerenciar currículos salvos por usuário.

## Stack
- Next.js + TypeScript (rotas API e UI client-side).
- Prisma + Postgres para usuários, sessões e currículos (templates).
- Zod para validação de payloads.
- JWT (access/refresh) com rotação de refresh em `Session`.

## Funcionalidades
- Edição de JSON do currículo com preview em PDF, download e abertura em nova aba.
- Persistência de currículos: listar, salvar, carregar, baixar PDF e exclusão (soft delete).
- Autenticação via cookies (`auth_token` + `refresh_token`) com middleware protegendo rotas.

## Como rodar localmente
1. Instale dependências: `npm install`.
2. Copie o `.env.example` para `.env` e ajuste, em especial:
   - `DATABASE_URL=postgresql://cvats:cvats@db:5432/cv_ats`
   - `AUTH_SECRET` (defina um segredo forte).
3. Suba o Postgres (ex.: `docker compose up -d db` ou `docker-compose -f docker-compose.prod.yml up -d db`).
4. Rode migrações e geração de cliente:  
   `npx prisma migrate dev --name init_auth_templates && npx prisma generate`
5. Inicie: `npm run dev` (ou `npm run build && npm run start` em produção).

## Scripts
- `npm run dev` — desenvolvimento.
- `npm run build` — build de produção.
- `npm run start` — serve o build.
- `npm run lint` — ESLint.
- `npm run typecheck` — checagem de tipos.

## Estrutura
- `src/app` — páginas e rotas API (ex.: `/api/render`, `/api/resumes`).
- `src/modules` — domínios desacoplados (resume, storage, openai).
- `prisma` — schema do banco e migrations.
- `public` — assets estáticos.

## APIs relevantes
- `POST /api/render` — recebe `{ resume }`, valida e devolve HTML.
- `POST /api/render/pdf` — recebe `{ resume }`, retorna PDF.
- `GET/POST /api/resumes` — lista e cria currículos do usuário autenticado.
- `DELETE /api/resumes/[id]` — soft delete de currículo do usuário.
- Autenticação: `/api/auth/login`, `/api/auth/signup`, `/api/auth/logout`, `/api/auth/refresh`.

## Modelos (Prisma)
- `User`: `id`, `email` (único), `password`, timestamps.
- `Template`: `id`, `name`, `company?`, `content` (JSON), timestamps, `deletedAt?`, `userId`.
- `Session`: `id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt?`, `userAgent?`, `ip?`.

## Produção
- Configure `AUTH_SECRET` e variáveis de banco.
- Use o `docker-compose.prod.yml` ou seu próprio manifest com a imagem gerada.
- Execute migrações antes do start e mantenha os cookies `httpOnly` ativados.
