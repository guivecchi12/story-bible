# Story Bible — Design Document

## 1. Overview

Story Bible is a full-stack web application designed for authors and writing teams to organize and manage the world-building elements of their stories. It supports multiple books, collaborative access with role-based permissions, and structured tracking of characters, powers, factions, locations, story arcs, plot events, items, and timelines.

---

## 2. Tech Stack

| Layer               | Technology                                      |
| ------------------- | ----------------------------------------------- |
| Framework           | Next.js 14 (App Router)                         |
| Language            | TypeScript                                      |
| Database            | PostgreSQL                                      |
| ORM                 | Prisma 7                                        |
| Authentication      | NextAuth.js v4                                  |
| Styling             | Tailwind CSS + shadcn-style components          |
| Validation          | Zod                                             |
| Report Generation   | jsPDF                                           |
| Email (Invitations) | Resend                                          |
| Hosting             | _(add your hosting platform here, e.g. Vercel)_ |

---

## 3. Architecture

Story Bible follows a three-tier architecture:

- **Presentation Layer** — React components rendered server- or client-side via Next.js App Router. Global state (active book, book list) is managed via a `BookContext` React context provider.
- **Application Layer** — Next.js API routes under `/api/**` handle all business logic, validation (Zod), and authorization (session + role checks).
- **Data Layer** — Prisma ORM interfaces with a PostgreSQL database. All queries are parameterized, preventing SQL injection.

See the **Architecture Diagram** for a visual representation of how these layers interact.

---

## 4. Data Model (Class Diagram)

See the attached **Class Diagram** artifact.

### Key Relationships

- A **User** can belong to many **Books** via **BookMember** (many-to-many join table).
- A **BookMember** has a `role` of either `owner` or `collaborator`.
- A **Book** can have many content entities: Characters, Powers, Factions, Locations, Story Arcs, Plot Events, and Items.
- **Invitations** are scoped to a Book and expire after 7 days. A token is generated on creation and emailed to the invitee.

---

## 5. Security Design

- **Authentication** — Credential-based login via NextAuth.js. Passwords are hashed (bcrypt) before storage. Sessions use JWTs.
- **Authorization** — Every API route verifies the session and checks the user's `BookMember.role` before any read or write. Destructive operations (delete, invite) require `owner` role.
- **Input Validation** — All incoming request bodies are parsed and validated with Zod schemas before reaching the database.
- **Injection Prevention** — All database queries go through Prisma's parameterized query builder; raw SQL is not used.

---

## 6. Scalability Design

- **Multi-tenancy** — Every content entity is scoped to a `bookId`, enabling horizontal growth of books and users without schema changes.
- **Role system** — The `BookMember` join table supports extensible roles without restructuring.
- **Stateless API** — API routes are stateless and session-verified, compatible with serverless/edge deployment.
- **ORM abstraction** — Prisma allows switching database providers with minimal code change.

---

## 7. Links

- **Hosted Application:** _(add your deployment URL here)_
- **GitLab Repository:** _(add your GitLab repo URL here)_
- **Repository Version / Commit:** _(add your commit hash or tag here)_

---

## 8. Diagrams

- Class Diagram — see attached SVG artifact
- Architecture / Design Diagram — see FigJam diagram in submission
