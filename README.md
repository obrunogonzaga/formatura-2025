# Formulário de Fotos – Formatura 2025

Formulário para coleta de **3 fotos por criança**, ligado a um responsável, com persistência em Postgres e armazenamento dos arquivos no MinIO (S3 compatível). Monorepo usando Next.js (frontend + API routes) e Prisma.

## Stack
- Next.js 14 (App Router) + React + TypeScript
- Prisma + Postgres
- MinIO (via SDK S3)
- npm workspaces (`apps/web`, `packages/config`)
- Docker Compose para local e para deploy (Coolify)

## Estrutura
- `apps/web`: app Next.js + APIs.
- `packages/config`: validação/compartilhamento de env.
- `prisma/`: schema e migração inicial.
- `docker-compose.local.yml`: web + Postgres + MinIO para dev.
- `docker-compose.prod.yml`: stack para deploy (Coolify).

## Variáveis de ambiente
Use os arquivos de exemplo e crie suas cópias:
```
cp env.local.example .env.local
cp env.prod.example .env.prod
```
Principais variáveis:
- `DATABASE_URL`: URL do Postgres.
- `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_FORCE_PATH_STYLE`.
- `NEXT_PUBLIC_MAX_FILE_SIZE_MB`: limite (MB) por foto exibido no formulário.

## Desenvolvimento local (Docker)
1) Copie e ajuste `.env.local`.
2) Suba a stack:
```
docker compose -f docker-compose.local.yml up --build
```
3) Rode migrações (em outro terminal, com containers ativos):
```
docker compose -f docker-compose.local.yml exec web npx prisma migrate deploy --schema ../../prisma/schema.prisma
```
4) Acesse `http://localhost:3000`. MinIO console: `http://localhost:9001` (user/pass de `.env.local`).

## Desenvolvimento local (sem Docker)
1) `npm install`
2) Tenha Postgres + MinIO rodando e configure `.env.local`.
3) `npm run dev`
4) Migrações: `npm run prisma:migrate -- --name init`

## Deploy (Coolify)
- Utilize `docker-compose.prod.yml` como base.
- Configure `.env.prod` no Coolify (ou variáveis na UI) com `DATABASE_URL`, credenciais do MinIO e bucket.
- A imagem é construída a partir de `apps/web/Dockerfile` (Next.js `output: standalone`).
- Após subir, aplique migrações:
```
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy --schema ../../prisma/schema.prisma
```

## APIs principais
- `POST /api/submissions`: recebe responsável + filhos + metadados das fotos, cria registros e devolve URLs pré-assinadas para upload.
- `GET /api/submissions`: lista últimas submissões com URLs públicas dos arquivos (baseadas em `S3_PUBLIC_ENDPOINT`).
- `GET /api/health`: healthcheck simples.

## Notas do formulário
- Campos: nome do responsável; múltiplos filhos; cada filho exige exatamente 3 fotos (JPEG/PNG/WEBP) e validação de tamanho.
- Instruções de uso exibidas na página.
- Upload via URLs pré-assinadas diretamente para o MinIO; metadados persistidos no Postgres.

## Scripts úteis
- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:deploy` (workspace `apps/web`)

