# Implementation Status

## Completed

### Project foundation
- Created monorepo structure:
  - `apps/web` (React + Vite)
  - `apps/api` (NestJS)
  - `packages/types` (shared TypeScript types)
- Added workspace and root config:
  - `package.json`
  - `pnpm-workspace.yaml`
  - `tsconfig.base.json`
  - `.gitignore`
  - `README.md`
- Added architecture/roadmap document:
  - `plan.md`

### Shared contracts
- Added core shared types in `packages/types/src/index.ts`:
  - `JobStatus`
  - `ResumeDraft`
  - `GenerationJob`

### Backend (NestJS)
- Bootstrapped API with global prefix and CORS.
- Added health endpoint:
  - `GET /v1/health`
- Added resume/files API skeleton and basic local logic:
  - `POST /v1/files/presign-upload`
  - `POST /v1/files/upload/:token` (local multipart upload)
  - `GET /v1/files/download-url`
  - `GET /v1/files/download/:token`
  - `POST /v1/resumes/generate`
  - `GET /v1/resumes/jobs/:jobId`
  - `POST /v1/resumes/jobs/:jobId/regenerate-pdf`
- Added local file storage service (`.local-storage`) for end-to-end local testing.
- Added in-memory job store and mock draft generation.
- Fixed dev/start runtime config so Nest resolves the correct entry file in monorepo.

### Frontend (React + Vite)
- Built MVP screen to:
  - Select PDF
  - Enter LinkedIn job URL
  - Enter job description text
  - Enter custom instructions
  - Trigger generation
  - View/edit draft JSON
  - Trigger regenerate
  - Request download link
- Added real local upload flow:
  - Presign request
  - Multipart upload to API upload endpoint
  - Store returned `fileKey` internally
- Removed user-facing editable "Resume File Key" input from UI.
- Removed stale generated source files (`App.js`, `main.js`) that caused old UI to render.

### Build and type safety
- Installed dependencies successfully.
- `pnpm typecheck` passing.
- `pnpm --filter api build` passing.
- `pnpm --filter web build` passing.

## Current known behavior
- `Get Download Link` works end-to-end locally.
- The downloaded output is currently a copied version of the uploaded PDF (scaffold behavior), not yet AI-generated.

## Next steps

### 1. Authentication and authorization
- Integrate Clerk in frontend.
- Add Clerk JWT verification in backend.
- Enforce per-user ownership checks for all jobs and files.

### 2. Replace local file storage with S3
- Implement S3-backed file service.
- Move upload/download to true S3 presigned URLs.
- Remove temporary local token upload/download endpoints.

### 3. Replace in-memory store with DynamoDB
- Persist jobs and metadata in DynamoDB.
- Add TTL (`expiresAt`) for 24-hour cleanup.
- Ensure robust status transitions and retrieval.

### 4. Add async pipeline
- Publish generation jobs to SQS from API.
- Implement worker consumer (Lambda-oriented structure).
- Add retries and failure handling with DLQ.

### 5. Bedrock integration
- Parse uploaded resume PDF text.
- Build model prompt using resume + JD + custom instructions.
- Invoke Bedrock with:
  - Primary: DeepSeek-R1
  - Fallback: Claude Sonnet

### 6. Output quality validation
- Validate model output against `ResumeDraft` schema.
- Add keyword coverage checks vs job description.
- Add basic anti-fabrication and date consistency checks.

### 7. Real PDF rendering
- Generate ATS-friendly PDF from validated `ResumeDraft`.
- Save generated PDF to output storage.
- Ensure download always returns generated output.

### 8. Frontend UX improvements
- Replace raw JSON editor with structured form/editor UI.
- Add clear job progress states (queued/processing/completed/failed).
- Improve validation and user-facing error handling.

### 9. Retention and observability
- Configure 24-hour lifecycle deletion for S3 objects.
- Ensure DynamoDB TTL cleanup.
- Add CloudWatch metrics, logs, and alarms.

### 10. Hardening
- Add idempotency keys.
- Add basic rate limiting.
- Add integration and end-to-end test coverage for critical flows.
