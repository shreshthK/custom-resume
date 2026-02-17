# AI Resume Tailor - Implementation Plan

## Summary
Build a web app where authenticated users upload a resume PDF, provide a LinkedIn job URL plus pasted job description, add custom instructions, and receive an ATS-optimized tailored PDF resume.

Core architecture:
- Frontend: React + Vite + TypeScript
- Backend: NestJS on AWS Lambda + API Gateway
- AI: Amazon Bedrock with DeepSeek-R1 default and Claude Sonnet fallback
- Storage: S3 + DynamoDB
- Async pipeline: SQS + worker Lambda
- Auth: Clerk
- Region: us-east-1
- Retention: 24h auto-delete

## Scope (v1)
- Clerk authentication
- PDF resume upload only
- LinkedIn URL + pasted job description input
- Custom instruction input
- ATS-first resume draft generation
- In-browser edit before PDF export
- Signed download link for final PDF

## Recommended Stack
### Frontend
- React 18, Vite, TypeScript
- React Router
- Clerk React SDK
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS + Radix UI
- Tiptap editor

### Backend
- NestJS + AWS SDK v3
- S3, DynamoDB, SQS, Lambda, API Gateway
- Bedrock (DeepSeek-R1 + Claude Sonnet fallback)

## API Contracts
- `POST /v1/files/presign-upload`
- `POST /v1/resumes/generate`
- `GET /v1/resumes/jobs/:jobId`
- `POST /v1/resumes/jobs/:jobId/regenerate-pdf`
- `GET /v1/files/download-url?fileKey=...`

## Implementation Phases
1. Foundation: monorepo scaffold, auth wiring, base infra
2. Upload + queue: S3 presign, submission flow, status polling
3. Worker + model routing: parse PDF, invoke Bedrock, validate, fallback
4. Edit + export: draft editor, regenerate PDF, download
5. Hardening: idempotency, observability, rate limits

## Acceptance Criteria
- Typical generation completes within 2 minutes
- User edits are reflected in exported PDF
- Data auto-expires in 24h
- Strict per-user data isolation
