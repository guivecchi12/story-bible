# Story Bible — Maintenance & Setup Guide

This guide is for developers setting up, running, and maintaining the Story Bible application.

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Git

---

## 1. Clone the Repository

```bash
git clone <your-gitlab-repo-url>
cd story-bible
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (Resend) — required for invitation emails
RESEND_API_KEY="re_your_api_key"
```

> Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`

---

## 4. Set Up the Database

Run Prisma migrations to create all tables:

```bash
npx prisma migrate deploy
```

To view and manage data via a GUI:

```bash
npx prisma studio
```

---

## 5. Run the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## 6. Build for Production

```bash
npm run build
npm start
```

---

## 7. Deploying (e.g. Vercel)

1. Push the repository to GitLab.
2. Import the project into Vercel.
3. Add all environment variables from step 3 in the Vercel dashboard.
4. Vercel will automatically run `npm run build` on each push to main.
5. After first deploy, run migrations against your production database:
   ```bash
   DATABASE_URL="your-prod-url" npx prisma migrate deploy
   ```

---

## 8. Database Maintenance

| Task                      | Command                                     |
| ------------------------- | ------------------------------------------- |
| Create a new migration    | `npx prisma migrate dev --name description` |
| Apply migrations (prod)   | `npx prisma migrate deploy`                 |
| Reset database (dev only) | `npx prisma migrate reset`                  |
| Open Prisma Studio        | `npx prisma studio`                         |

---

## 9. Adding a New Content Entity

1. Add the model to `prisma/schema.prisma` with a `bookId` foreign key.
2. Run `npx prisma migrate dev --name add_entity_name`.
3. Create API routes under `app/api/<entity>/route.ts` and `app/api/<entity>/[id]/route.ts`.
4. Add the nav item to the `navItems` array in `components/Sidebar.tsx`.
5. Create the page under `app/<entity>/page.tsx`.

---

## 10. Common Issues

| Issue                             | Fix                                                                       |
| --------------------------------- | ------------------------------------------------------------------------- |
| `PrismaClientInitializationError` | Check `DATABASE_URL` is correct and PostgreSQL is running                 |
| `NEXTAUTH_SECRET` missing         | Ensure `.env` is populated and server restarted                           |
| Invite emails not sending         | Verify `RESEND_API_KEY` and that your sender domain is verified in Resend |
| Migration drift                   | Run `npx prisma migrate status` to inspect                                |
