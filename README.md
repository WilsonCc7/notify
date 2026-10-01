# Notify

One calm place for coursework, notes, and due dates. Closed group planner: Classroom tasks land on their own, custom tasks take seconds, each task carries its own help thread.

## User flow

1. Open `/`. Logged out sees landing, one button to register.
2. `/register` email + name + password. Email must sit in `ALLOWED_EMAILS` or you land on `/blocked`.
3. `/` authed shows dashboard: greeting, due soon, To do with Upcoming / Overdue / Completed tabs.
4. Add custom task via New task form. Tick checkbox or change status select. Delete with row action.
5. Unlinked banner prompts Link Google. Linked users pull Classroom courses on login + Refresh. Gmail stays a deep link, no extra scopes.

## Run it

```bash
git clone https://github.com/WilsonCc7/notify.git
cd notify
cp .env.example .env
# fill DATABASE_URL, ALLOWED_EMAILS, SESSION_SECRET
docker run -d --name notify-postgres \
  -e POSTGRES_USER=notify -e POSTGRES_PASSWORD=notify \
  -e POSTGRES_DB=notify -p 5432:5432 postgres:16
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`. Register with an allowlisted email.

## Scope v1

Landing, password auth + optional Link Google, dashboard shell, custom tasks. No Classroom turn-in, no Gmail/Calendar read, no OCR, no votes. See `CONTRACT.md`, `PRODUCT.md`, `DESIGN.md`.
