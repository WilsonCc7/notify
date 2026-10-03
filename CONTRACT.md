# CONTRACT.md — Notify v1 frozen

Single repo Next.js monolith. Both sessions MUST match these shapes. Change needs integrator approval.

## Auth — hybrid (Q16B locked)
- Password register/login (email+password argon2, session cookie) + optional Link Google.
- Open signup: any valid email registers; Google login creates-or-links by verified email.
- Merge rule: same verified email auto-links; Google email matching existing user links tokens, no second user.
- Unlinked users: custom tasks only, Classroom sections show Link Google prompt.
- Google scopes (only on link/sync): `openid email profile classroom.courses.readonly classroom.coursework.me.readonly`
- No Gmail / Calendar / Drive scopes v1.

## Core types (lib/contract.ts)
```ts
type TaskSource = "classroom" | "custom";
type TaskStatus = "todo" | "doing" | "done";
type Task = {
  id: string; source: TaskSource; courseId: string | null;
  classroomCourseworkId?: string; title: string; description?: string;
  dueAt?: string | null; status: TaskStatus; // per-user resolved
};
type Course = { id: string; classroomId: string; name: string; section?: string; room?: string };
type Post = { id: string; taskId: string; authorId: string; bodyText?: string; imageUrl?: string; linkUrl?: string; createdAt: string };
type Reply = { id: string; postId: string; authorId: string; bodyText: string; linkUrl?: string; createdAt: string };
```

## DB (Prisma + Postgres)
- users(id, email unique, name, avatar)
- courses(id, classroomId unique, name, section, room)
- tasks(id, source, courseId FK nullable, classroomCourseworkId unique nullable, title, description, dueAt)
- task_state(userId, taskId, status) PK(userId, taskId)
- posts(id, taskId FK, authorId FK, bodyText, imageUrl, linkUrl, createdAt)
- replies(id, postId FK, authorId FK, bodyText, linkUrl, createdAt)
- No OCR, no votes, author-only edit/delete.

## API
- GET /api/me
- GET /api/courses
- POST /api/sync/classroom — on-login + Refresh button only, no cron
- GET /api/tasks?courseId=&filter=all|overdue|due7|done
- POST /api/tasks {courseId?, title, description?, dueAt?} — custom card
- PATCH /api/tasks/:id/status {status}
- GET /api/tasks/:id/posts — thread
- POST /api/tasks/:id/posts (multipart: bodyText, image max 5MB, linkUrl)
- POST /api/posts/:id/replies {bodyText, linkUrl?}
- GET /api/calendar?from=&to= — derived from tasks.dueAt only, no Google Calendar calls

## Frontend routes
- /login, / (all subjects), /s/[courseId] (Kanban Todo/Doing/Done), /t/[taskId] (detail + thread), /calendar (local view)
- Gmail: deep-link only `https://mail.google.com/mail/u/0/#search/{title}`, zero API
- Responsive: desktop CSS grid Kanban with @dnd-kit, mobile stacked list + move menu, no touch-drag lib

## Storage
- R2/S3, 5MB cap, server upload, next/image thumbs. No base64 in DB, no Drive.

## Non-goals v1
No API turnIn, no Gmail read, no Calendar read/write, no OCR, no votes, no anonymity, no background sync, no block editor.
