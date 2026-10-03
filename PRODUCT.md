# PRODUCT.md - Notify v1

Notify is an open planner for students. Not a school tool, not a marketplace, not a productivity suite. Anyone with an email can register and keep one shared list of what is due and what they already finished.

## 1. Users

- **Open signup.** Anyone with a valid email address registers, no invitation needed.
- **Student, not administrator.** One identity, one password. No roles, no seats, no workspace management.
- **Google Classroom user.** If the group already lives in Classroom, coursework should land in Notify on its own, not be retyped.
- **Small scale.** Tens of users, hundreds of tasks. Single Postgres, no queue, no cron sync, no cache tier.

What they need from the product:
1. See what is due, soonest first.
2. Mark something done once and have it stay done.
3. Add a task Classroom does not know about.
4. Talk about a specific task with the people who also have it.

## 2. Auth (hybrid, locked)

Two paths, one identity.

- **Password register and login.** Email + password, argon2 hash, server-set session cookie. This is the primary path.
- **Link Google.** Optional per user, requested only when the user chooses to pull Classroom data or share Google identity.
- **No gate.** Both paths accept any valid email. Google identity is verified by Google, password identity by argon2.
- **Merge rule.** Same verified email auto-links. Google login matching an existing password account attaches the Google refresh token to that user row. Never creates a second user.
- **Unlinked users** get custom tasks only. Any Classroom surface shows a Link Google prompt instead of data or an error.
- **Scopes, only on link or sync:** `openid email profile classroom.courses.readonly classroom.coursework.me.readonly`. No Gmail, no Calendar, no Drive, not even readonly.
- **Sync** runs on login and from an explicit Refresh button. No cron, no background job, no webhook.

## 3. v1 scope

This phase ships four things:

1. **Landing `/`** for logged-out visitors: what Notify is, one primary CTA to register, one to sign in. See DESIGN.md section 2 for the Persuade mode.
2. **Auth screens `/register` and `/login`**: split layout, form on the left, illustration or product shot on the right.
3. **Dashboard shell `/` when authed**: greeting, due-soon list, custom task list, per-subject entry points, refresh button, Link Google affordance. This is a shell plus custom tasks, no Classroom data in this phase.
4. **Custom tasks**: create, edit, complete, delete, optionally due date and course. Usable by an unlinked user from minute one.

Later, same contract, not this phase: `/s/[courseId]` Kanban, `/t/[taskId]` detail and thread, `/calendar` local month view derived from `tasks.dueAt`.

The Dashboard shell is not a placeholder. Every row on it shows real data from the API, and every empty state names the next action. No "coming soon" panels.

## 4. Non-goals v1

Hard bans. Each needs an integrator decision before it can change.

- **No Google Classroom turnIn API.** Read coursework, never submit it.
- **No Gmail read.** Deep-link only: `https://mail.google.com/mail/u/0/#search/{title}`. Zero API calls, zero scopes.
- **No Google Calendar read or write.** `/calendar` is a local view over `tasks.dueAt` and nothing else.
- **No OCR.** No screenshot-to-task, no image text extraction.
- **No votes or upvotes** on tasks or posts.
- No anonymity, no roles or permissions beyond owner, no block editor, no realtime or presence, no background or cron sync, no push or email notifications, no mobile app.

## 5. Content and copy rules

- English, second person, present tense, short sentences.
- No em-dashes anywhere in visible strings.
- No emoji. Icons come from Phosphor.
- No invented numbers, no fake testimonials, no placeholder names in example data.
- Empty states instruct: "No tasks due. Add one with the button above."