# Notify

One calm place for coursework, notes, and due dates. Open planner: anyone registers with an email, Classroom tasks land on their own, custom tasks take seconds, each task carries its own help thread.

## User flow

1. Open `/`. Logged out sees landing, one button to register.
2. `/register` email + name + password. Any valid email works.
3. `/` authed shows dashboard: greeting, due soon, To do with Upcoming / Overdue / Completed tabs.
4. Add custom task via New task form. Tick checkbox or change status select. Delete with row action.
5. Unlinked banner prompts Link Google. Linked users pull Classroom courses on login + Refresh. Gmail stays a deep link, no extra scopes.

## Run it

```bash
git clone https://github.com/WilsonCc7/notify.git
cd notify
cp .env.example .env
# fill DATABASE_URL, SESSION_SECRET
docker run -d --name notify-postgres \
  -e POSTGRES_USER=notify -e POSTGRES_PASSWORD=notify \
  -e POSTGRES_DB=notify -p 5432:5432 postgres:16
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`. Register with any email.

## belum final build masih landing page dashboard sederhana aja

tampilan homepage singkat
<img width="1707" height="922" alt="image" src="https://github.com/user-attachments/assets/3f3ab75d-26a4-4fad-a7a7-22a94d7076d4" />


tampilan register
<img width="1711" height="1027" alt="image" src="https://github.com/user-attachments/assets/74ee2c64-c696-4c23-b7de-b36229b23dcb" />
