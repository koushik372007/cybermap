# Digitalink SVCET — Base44 Setup

## Overview
Full-stack academic resource platform for SVCET. React + TypeScript + Vite + Tailwind frontend connecting directly to Supabase (auth, PostgreSQL, storage). No separate backend — the app uses the Supabase JS client with RLS policies for security.

## Architecture
- **Frontend**: Vite dev server (port 5173 → mapped to host 3000)
- **Database/Auth/Storage**: Supabase (external — requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- **No lockfile**: `npm install` runs on container startup (no lockfile committed)

## Required Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
- Both are **required at boot**. Development placeholders exist in `.env.base44-defaults` so the app renders the NotConfigured page; real values must be provided via the Secrets dashboard.

## Running the App
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
The Vite dev server runs with `--host 0.0.0.0` and live reload. File watching uses polling (bind mount).

## Verifying
1. `docker compose ps` — web service should be healthy
2. `curl http://localhost:3000/` — should return HTML with "Digitalink SVCET" title
3. Without real Supabase credentials, the app shows a "Not Configured" page — this is expected
4. With real credentials, the landing page renders and auth flows work

## Database Schema
Tables: `profiles`, `departments`, `academic_years`, `semesters`, `subjects`, `resource_categories`, `resources`, `faculty_permissions`, `bookmarks`, `audit_logs`, `app_settings`. SQL migrations and RLS policies still need to be created.

## Key Patterns
- `DashboardLayout` wraps all authenticated pages with role-based sidebar nav
- `ProtectedRoute` gates routes by role (student/faculty/admin)
- `useAuth()` provides session, profile, and auth methods
- `useToast()` for notifications
- `Modal` and `ConfirmDialog` for forms and destructive actions
- CSS utility classes: `btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost`, `card`, `input`, `label`, `badge-*`
