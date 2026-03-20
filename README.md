# 📖 Story Bible: A Writer's Companion App

**Story Bible** is a professional-grade, full-stack narrative management system. It allows authors to maintain "absolute truth" in complex world-building by tracking characters, plot events, factions, locations, items, and more through a highly relational database. It supports multiple books, role-based collaboration, invitation-based team access, and PDF report generation.

---

## 🛠️ Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **ORM:** Prisma 7
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js v4
- **Styling:** Tailwind CSS & shadcn/ui
- **Reporting:** jsPDF (client-side PDF generation)
- **Email:** Resend (invitation delivery)
- **Testing:** Vitest (unit & integration)

---

## 🏛️ Project Architecture & Design Patterns

This project was designed to meet strict software engineering principles:

### 1. Object-Oriented Programming (OOP)

Found in `./lib/models/`:

- **Encapsulation:** Data and logic are encapsulated within specialized service layers (`./lib/services`) to hide implementation details from the UI.
- **Inheritance & Polymorphism:** Base classes like `CharacterBase.ts` and `StoryElement.ts` are extended by specific entities (e.g., `MainCharacter`, `MajorArc`), allowing for shared logic with specific behavior overrides.

### 2. Relational Database Design

The schema in `./prisma/schema.prisma` handles complex many-to-many relationships, such as:

- `PlotEvent` ↔ `Character`
- `Character` ↔ `Power`
- `Book` ↔ `User` (via `BookMember` for role-based permissions)

### 3. Validation & Security

- **Validation:** All inputs are strictly validated using Zod schemas found in `./lib/validation/`.
- **Security:** Authentication is handled via NextAuth.js. Route access is restricted based on the `BookMember` role (`owner`, `collaborator`, `viewer`). Every API route verifies the session and role server-side before any read or write operation.

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database instance

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-gitlab-repo-url>
   cd story-bible
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/story_bible"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Email — required for invitation delivery (https://resend.com)
   RESEND_API_KEY="re_your_api_key"
   ```

4. **Run database migrations:**

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start development server         |
| `npm run build`      | Build for production             |
| `npm start`          | Start production server          |
| `npm test`           | Run full test suite (single run) |
| `npm run test:watch` | Run tests in watch mode          |
| `npx prisma studio`  | Open database GUI                |

### Maintenance

- **Schema changes:** Update `prisma/schema.prisma` and run `npx prisma migrate dev --name <description>`.
- **Adding a new entity:** Add the Prisma model, create a service in `lib/services/`, add a Zod schema in `lib/validation/`, add API routes under `app/api/<entity>/`, and add the nav entry in `components/Sidebar.tsx`.
- **Production migrations:** Run `npx prisma migrate deploy` against your production `DATABASE_URL`.

---

## 🧪 Testing

The test suite is located in `./tests` and uses **Vitest** with all external dependencies (Prisma, NextAuth) fully mocked — no live database required.

```bash
npm test
```

### Test Coverage

| File                              | What It Tests                                                           |
| --------------------------------- | ----------------------------------------------------------------------- |
| `tests/api/routes.test.ts`        | API route auth guards, role enforcement, and service delegation         |
| `tests/unit/book-context.test.ts` | Session resolution, header vs. activeBookId fallback, membership lookup |
| `tests/unit/services.test.ts`     | All 10 service modules — scoping, relations, ordering, data merging     |
| `tests/unit/validation.test.ts`   | All 12 Zod schemas — boundary values, enums, optional fields, defaults  |
| `tests/unit/api-fetch.test.ts`    | `apiFetch` header injection and `x-book-id` management                  |

See [`/docs/test-plan.md`](./docs/test-plan.md) for the full test plan and results.

---

## 📚 Documentation

Full project documentation is available in the [`/docs`](./docs) folder:

| Document                                              | Description                                          |
| ----------------------------------------------------- | ---------------------------------------------------- |
| [`design-document.md`](./docs/design-document.md)     | Architecture overview, class diagram, design diagram |
| [`maintenance-guide.md`](./docs/maintenance-guide.md) | Developer setup and maintenance reference            |
| [`user-guide.md`](./docs/user-guide.md)               | End-user guide for all application features          |
| [`test-plan.md`](./docs/test-plan.md)                 | Test plan, test cases, results, and change summary   |

---

## 🔗 Submission Links

- **Hosted Application:** [Vercel](https://story-bible.vercel.app)
- **GitLab Repository:** [d424-software-engineering-capstone](https://gitlab.com/wgu-gitlab-environment/student-repos/gvecch1/d424-software-engineering-capstone/-/tree/Work?ref_type=heads)
- **Panopto Demonstration:** [video](https://wgu.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=2e251313-fe9b-4ee1-a618-b412004644bd)

---

## 📜 License

This project was developed for the Software Engineering Capstone (D424).
