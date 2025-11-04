# ☁️ Multi-Source Image Search

A **multi-cloud unified image management and search system** built with **Node.js, Express, PostgreSQL, Redis, and Sequelize**.
It allows users to connect multiple cloud drives (Google Drive, OneDrive — with Apple Drive and Dropbox support coming soon) and manage image uploads, tagging, and cross-source search from a single dashboard.


## 🌟 Overview

MultiSourceSearch is designed to unify multiple cloud storage providers and local uploads under one authenticated interface.
Users can:

* Link different drives securely via OAuth2
* Upload directly to chosen drive or local FS
* Tag and search across **all linked drives simultaneously**
* Manage sessions securely via Redis
* Store encrypted access tokens in PostgreSQL
* Extend to new providers easily (Dropbox, Apple Drive)


## 🧠 Core Architecture

### 📊 Database Schema (PostgreSQL + Sequelize ORM)

The utilized schema (shown in ![Database Schema](./assets/schema.svg)):

| Table          | Description                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------- |
| **users**      | Stores user credentials (username, email, hashed password).                                 |
| **drives**     | Represents linked cloud drives per user — includes provider, encrypted tokens, expiry, etc. |
| **images**     | Central file metadata store — unified structure for all cloud/local uploads.                |
| **tags**       | User-defined tags used for classification and search.                                       |
| **image_tags** | Join table mapping many-to-many relationship between `images` and `tags`.                   |

### 🧩 Entity Relationships

* One **User** → Many **Drives**
* One **User** → Many **Images**
* One **Image** ↔ Many **Tags** (through `image_tags`)

This structure allows for **cross-cloud file aggregation** and **semantic tagging** across all storage providers.


## ⚙️ Backend Logic

### 1️⃣ Authentication & Session

* Custom **login/signup** with bcrypt password hashing.
* **Session-based auth** with `express-session` + `connect-redis`.
* `preventAuthForLoggedIn` middleware ensures users can’t hit login routes if already authenticated.
* Sessions stored securely with Redis (tokenized keys).

### 2️⃣ OAuth 2.0 Flow

Handled per provider via `/auth/{provider}` routes.

**Steps:**

1. Redirect user to provider’s OAuth URL.
2. Receive auth code → exchange for `access_token` and `refresh_token`.
3. Encrypt tokens using `cryptoUtils.js` (AES-256).
4. Store encrypted credentials in `drives` table.
5. Automatically refresh tokens when expired.

### 3️⃣ Upload Workflow

```
Client → Upload Form → POST /upload/:provider
Backend → Decrypt drive token → Cloud API Upload
Response → Metadata stored in PostgreSQL (images)
```

Metadata saved:

| Key          | Description                  |
| ------------ | ---------------------------- |
| fileId       | Cloud file ID                |
| provider     | e.g. google, onedrive, local |
| fileName     | Original file name           |
| fileUrl      | Public/share link            |
| mimeType     | File type                    |
| size         | File size (bytes)            |
| thumbnailUrl | Optional preview link        |
| uploadedAt   | Timestamp                    |

### 4️⃣ Search Workflow

* Endpoint `/imagesearch?q=term`
* Performs fuzzy or partial match on:

  * fileName (ILIKE)
  * tag.name (JOIN via image_tags)
* Returns merged results across all drives.

You can search once → results come from **Google Drive, OneDrive, and Local FS** together.

### 5️⃣ Drive Refresh Logic

* On each dashboard load or `/managedrives/refresh`

  * For each drive: attempt token refresh via provider API
  * If invalid or expired beyond refresh capability → remove drive
* Requires `requireLogin` middleware.

## 🔒 Security Highlights

| Layer    | Protection                                    |
| -------- | --------------------------------------------- |
| Sessions | Redis store with signed cookies               |
| Tokens   | AES-256 encryption (cryptoUtils.js)           |
| Database | PostgreSQL (UUID PKs, minimal plaintext data) |
| Uploads  | Provider APIs (OAuth-secured)                 |
| Server   | Helmet.js + CORS + Morgan logging             |


## 🧩 Frontend

Simple **Bootstrap 5** UI with pages:

* `index.html` → login
* `register.html` → signup
* `dashboard.html` → view all images + tags + search
* `managedrives.html` → connect/remove drives
* `imagesearch.html` → dedicated search interface

Front-end JS (Vanilla) manages:

* Upload form submission
* Drive link buttons
* Dynamic search bar with live results
* Tag adding/removing using `/tags` and `/image_tags` routes


## 🧰 Utilities

### 🔐 `cryptoUtils.js`

AES-256-based encryption/decryption with IV derived from the environment `ENCRYPTION_KEY`.
Used to protect drive tokens and sensitive data in DB.

### ☁️ `driveUtils.js`

Abstracts each provider’s logic:

* Google: `googleapis` (Drive v3)
* OneDrive: Microsoft Graph API
* Apple: placeholder for future iCloud Drive SDK integration
* Dropbox: planned integration via `dropbox` SDK


## 🚀 Setup & Run

### 1️⃣ Clone Repo

```bash
git clone https://github.com/RHarish1/MultiSourceSearch.git
cd MultiSourceSearch
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment

Create a `.env` file:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/multisearch
SESSION_SECRET=your_secret
ENCRYPTION_KEY=your_32_char_key
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

Include your cloud OAuth credentials (Google, OneDrive, etc.) as described earlier.

### 4️⃣ Run Development

```bash
npm run dev
```

### 5️⃣ Database Init

```bash
npx sequelize-cli db:migrate
```


## 🧩 Current Features Summary

* ✅ **Secure login + session management**
* ✅ **Multi-provider linking** (Google + OneDrive)
* ✅ **Encrypted token storage (AES-256)**
* ✅ **File uploads across cloud and local providers**
* ✅ **Unified dashboard view for all drives**
* ✅ **Manual tagging system**
* ✅ **Full-text + tag-based cross-drive search**
* ✅ **Drive refresh + expired token cleanup**
* ✅ **Local uploads via multer with metadata sync**





## 🧱 To-Do / Roadmap

| Feature / Task                    | Status      | Notes                                                                                      | Benefits                                                                                         |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Dropbox Integration**           | 🚧 Planned  | Use `dropbox` SDK and OAuth 2.0 for seamless file uploads and metadata sync.               | Expands cross-cloud support; positions app as fully multi-provider.                              |
| **Apple Drive Support**           | 🧱 Hard     | Requires Apple Developer verification; integrate via CloudKit JS / App Store linked key.   | Enables Apple ecosystem reach (macOS/iOS users).                                                 |
| **Local Windows FS Integration**  | 🧠 Planned  | Integrate native folder picker via Windows API or Electron.                                | Allows direct file indexing from local drives; near-cloud parity.                                |
| **Smarter Search Layer**          | 🚀 Upcoming | Implement `PostgreSQL tsvector` + fuzzy search + tag weight scoring.                       | Enables semantic + relevance-based results across all drives.                                    |
| **Auto CV Tagging Layer**         | 🧩 Future   | Add ML service (TensorFlow / OpenCV) to auto-tag files by visual content or CV extraction. | Reduces manual tagging; enhances AI-based organization.                                          |
| **Supabase Sync Layer**           | 🔧 Optional | Mirror uploads + metadata to Supabase for analytics and backup.                            | Real-time data sync; scalable data pipelines; enables BI tools.                                  |
| **Advanced Dashboard Filters**    | ⚙️ Planned  | Filter by provider, tag, file type, size, or upload date.                                  | Improves UX and multi-cloud data control; faster discovery.                                      |
| **Frontend Shift → React.js**     | ⚙️ Planned  | Migrate static HTML + JS frontend to modular React SPA (with Vite).                        | Improves scalability, reactivity, and component reusability; smoother UI and API-driven updates. |
| **Backend TypeScript Migration**  | 💡 Planned  | Incremental migration from JS to TS (types, interfaces, DTOs).                             | Stronger type safety; reduces runtime bugs; simplifies team scaling; improves IDE autocomplete.  |
| **Database Optimization**         | 🧠 Planned  | Add composite indexes (e.g., `(userId, provider)`), caching, and query optimization.       | Boosts search performance and reduces load on PostgreSQL for large-scale data.                   |
| **Service Layer Refactor**        | 🔄 Future   | Decouple logic into service classes (AuthService, DriveService, SearchService).            | Cleaner code structure; testable microservice-ready architecture.                                |
| **React Query / SWR Integration** | 🧩 Planned  | Add caching + background revalidation for search/dashboard data.                           | Reduces network calls; improves perceived performance.                                           |
| **CI/CD + Docker Setup**          | 🔧 Optional | Containerize with Docker; add GitHub Actions for deploy/test.                              | Simplifies deployment; ensures environment consistency and automated testing.                    |


## 💡 Future Vision

The goal is to evolve **MultiSourceSearch** into a **semantic cloud indexer** —
a system that doesn’t just *store* your files but also *understands and organizes* them automatically across every cloud service.

Planned direction:

* Auto-tagging using AI (CV/NLP-based)
* Metadata-based smart folders
* Real-time sync via WebSockets
* Cloud-to-cloud file transfer


## 🧑‍💻 Author

**Harish Ramaswamy**
B.Tech @ Delhi Technological University

📧 [harishrswamy1@gmail.com](mailto:harishrswamy1@gmail.com)
🌐 [GitHub: RHarish1](https://github.com/RHarish1)


## 📄 License

Licensed under the **MIT License** — free to use, extend, and modify.


### ⭐ Star this repo if you like the idea of **multi-cloud + smart search integration!**

