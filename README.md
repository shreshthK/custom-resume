# Custom Resume

AI resume tailoring app (MVP scaffold) with React + Vite frontend and NestJS backend.

## Project structure
- `apps/web`: React + Vite UI
- `apps/api`: NestJS API
- `packages/types`: shared TypeScript contracts
- `plan.md`: full architecture and implementation plan
- `implementation.md`: progress tracker (completed + next steps)

## Current status
Implemented:
- Local PDF upload flow (presign + multipart upload)
- Resume generation flow scaffold
- Draft editing UI (JSON-based for now)
- Download link flow
- Shared types across frontend/backend

Current limitation:
- Downloaded output is currently a copied PDF scaffold, not yet AI-generated content.

## Requirements
- Node.js 24+
- pnpm 9+

## Setup
```bash
pnpm install
```

## Run locally
Terminal 1:
```bash
pnpm dev:api
```

Terminal 2:
```bash
pnpm dev:web
```

App URLs:
- Web: `http://localhost:5173`
- API health: `http://localhost:3000/v1/health`

## Build and typecheck
```bash
pnpm typecheck
pnpm --filter api build
pnpm --filter web build
```

## Current API endpoints
- `GET /v1/health`
- `POST /v1/files/presign-upload`
- `POST /v1/files/upload/:token`
- `GET /v1/files/download-url`
- `GET /v1/files/download/:token`
- `POST /v1/resumes/generate`
- `GET /v1/resumes/jobs/:jobId`
- `POST /v1/resumes/jobs/:jobId/regenerate-pdf`

## Roadmap (next major steps)
1. Clerk authentication + backend authorization guards
2. Replace local file storage with S3 presigned upload/download
3. Replace in-memory jobs with DynamoDB
4. Add SQS worker pipeline
5. Integrate Bedrock models (DeepSeek-R1 default, Claude Sonnet fallback)
6. Add output validation + real ATS PDF rendering

See `implementation.md` for detailed task tracking.
