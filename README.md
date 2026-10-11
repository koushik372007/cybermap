# Digitalink SVCET

Academic resource platform for Sri Venkateshwaraa College of Engineering & Technology — students, faculty, and administrators can browse, upload, and manage academic content.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Icons**: Lucide React

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from Settings → API

### 2. Run Database Migrations

Execute the SQL files in order via the Supabase SQL Editor:

```
supabase/migrations/0001_schema.sql        — Tables, indexes, triggers
supabase/migrations/0002_rls_policies.sql  — Row-level security
supabase/migrations/0003_triggers.sql       — Auth trigger, audit helper
supabase/migrations/0004_storage.sql        — Private storage bucket + policies
supabase/migrations/0005_seed.sql           — Default departments, years, categories
```

### 3. Configure Environment Variables

Create a `.env` file (or set via your deployment platform):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 5. Create an Admin User

1. Register an account via the app
2. In the Supabase dashboard, go to Table Editor → `profiles`
3. Change your user's `role` from `student` to `admin`
4. Log in — you'll see the admin dashboard

## Features

### Students
- Browse resources by Department → Academic Year → Semester → Subject
- Search and filter resources
- Bookmark resources
- Preview and download files (signed URLs)
- View resource metadata

### Faculty
- Upload resources with file validation (stored privately)
- Create new subjects within the upload flow
- Edit and delete own resources
- Track upload approval status
- Department-scoped permissions

### Administrators
- Full CRUD for departments, academic years, semesters, subjects, categories
- Approve/reject pending resource uploads
- Manage users (roles, suspend/activate)
- Grant faculty permissions per department
- View audit logs
- Configure app settings (approval workflow, file size, allowed types)

## Security

- **Row-Level Security** is enabled on all tables
- File storage is **private** — access only via signed URLs
- Faculty uploads require department-level permission grants
- Resource approval workflow configurable by admin
- User roles enforced at both client and database level

## Project Structure

```
src/
  components/     Shared UI (Modal, Toast, SearchBar, etc.)
  lib/            Supabase client, auth context, TypeScript types
  pages/
    public/       Landing, login, register, password reset
    student/      Student dashboard, browse, bookmarks, resource view
    staff/        Faculty dashboard, upload, resource management
    admin/        Admin dashboard, structure & user management
supabase/
  migrations/     SQL schema, RLS policies, triggers, storage, seed data
```

## Build

```bash
npm run build    # Type-check + production build
npm run preview  # Preview the production build
```

---

Digitalink by Koushik
