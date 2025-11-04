
# ☁️ Multi Source Search

A full-stack web application that allows users to connect **Google Drive**, **OneDrive**, and (coming soon) **Apple Drive** — plus upload directly to **local storage**.
All uploads are managed through a unified dashboard with secure token encryption and PostgreSQL persistence.


## 🚀 Features

### 🌐 Multi-Cloud + Local Integration

* Connect **Google Drive** and **Microsoft OneDrive** accounts.
* **Apple Drive** and **Local File System** support coming soon.
* Manage uploads from all providers in one clean interface.

### 🔒 Secure Authentication

* Custom **OAuth 2.0** login for cloud providers.
* Session-based authentication (no persistent cloud login).
* Encrypted storage for access tokens using AES-256.

### 🗂️ File Management

* Upload directly to any linked drive or local storage.
* Automatic metadata sync:

  * File ID
  * Provider
  * File Name
  * File URL
  * Size
  * MIME Type
  * Upload Time
* Unified dashboard view for cross-cloud management.

### 💾 Database Schema (PostgreSQL)

* Sequelize ORM with models for **Users**, **Drives**, and **Images**
* Automatic UUID primary keys
* PostgreSQL connection via `DATABASE_URL`


## 🏗️ Tech Stack

| Layer          | Technology                                                             |
| -------------- | ---------------------------------------------------------------------- |
| **Frontend**   | HTML5, Bootstrap 5, Vanilla JS                                         |
| **Backend**    | Node.js, Express.js                                                    |
| **Database**   | PostgreSQL (via Sequelize ORM)                                         |
| **Cloud APIs** | Google Drive API, Microsoft Graph API, Apple Drive API *(coming soon)* |
| **Storage**    | Local FS + Supabase integration                                        |
| **Auth**       | OAuth 2.0                                                              |
| **Security**   | AES-based encryption, secure cookies, Redis session store              |


## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/unified-cloud-dashboard.git
cd unified-cloud-dashboard
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the project root:

```env
# ===============================
# 🌐 Server Configuration
# ===============================
PORT=3000

# ===============================
# 🗄️ Database Configuration
# ===============================
DATABASE_URL=postgres://user:password@localhost:5432/mydb

# ===============================
# 🔐 Session & Encryption
# ===============================
SESSION_SECRET=your_session_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# ===============================
# 🪣 Supabase Configuration
# ===============================
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# ===============================
# ☁️ Google OAuth Configuration
# ===============================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# ===============================
# ☁️ OneDrive OAuth Configuration
# ===============================
ONEDRIVE_CLIENT_ID=your_onedrive_client_id_here
ONEDRIVE_CLIENT_SECRET=your_onedrive_client_secret_here
ONEDRIVE_REDIRECT_URI=http://localhost:3000/auth/onedrive/callback

# ===============================
# ☁️ Apple Drive OAuth Configuration (Coming Soon)
# ===============================
APPLE_CLIENT_ID=your_apple_client_id_here
APPLE_CLIENT_SECRET=your_apple_client_secret_here
APPLE_REDIRECT_URI=http://localhost:3000/auth/apple/callback

# ===============================
# 🧠 Redis + Node Environment
# ===============================
REDIS_URL=YOUR_REDIS_URL_HERE
NODE_ENV=production
```

> ⚠️ **Never commit your `.env` file** — always add it to `.gitignore`.

---

## 🧩 Database Setup

Make sure PostgreSQL is running and accessible at your `DATABASE_URL`.

Then run:

```bash
npx sequelize-cli db:migrate
```

Or for schema sync:

```bash
npm run sync-db
```


## 🧠 Project Structure

```
unified-cloud-dashboard/
│
├── models/
│   ├── user.js
│   ├── drive.js
│   ├── image.js
│   └── index.js
│
├── routes/
│   ├── auth/
│   │   ├── google.js
│   │   ├── onedrive.js
│   │   ├── apple.js           # (Coming soon)
│   │   └── index.js
│   ├── images.js
│   ├── local.js               # Local file upload routes
│   └── dashboard.js
│
├── middleware/
│   └── requireLogin.js
│
├── public/
│   ├── index.html
│   ├── upload.html
│   ├── dashboard.html
│   └── js/
│       └── dashboard.js
│
├── app.js
├── server.js
├── package.json
└── .env
```


## 📤 Upload Flow

1. User logs in → session created
2. User connects Drive(s) → encrypted token stored
3. User uploads file → routes to selected cloud/local provider
4. Drive API or local service returns metadata
5. Data stored in PostgreSQL and rendered on dashboard


## 🧩 Example Database Record

| Column         | Example                                |
| -------------- | -------------------------------------- |
| **id**         | `81939872-c77a-498e-a797-1c8e0c7e2e7d` |
| **userId**     | `91ad443c-ba35-4603-9c05-c719e48e12a7` |
| **driveId**    | `7ce2dc28-3776-4cd0-9241-d155b737c741` |
| **provider**   | `google`                               |
| **fileName**   | `sample.jpg`                           |
| **fileUrl**    | `https://drive.google.com/file/d/...`  |
| **mimeType**   | `image/jpeg`                           |
| **size**       | `153482`                               |
| **uploadedAt** | `2025-10-31 11:58:12`                  |



## 🧠 Troubleshooting

| Issue                                              | Cause                                       | Fix                                       |
| -------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `Decryption failed: Invalid initialization vector` | Wrong `ENCRYPTION_KEY` or stale tokens      | Delete and re-link drives                 |
| `POST /auth/login - - ms - -`                      | Missing or misconfigured session middleware | Check Redis + session setup               |
| Upload form not firing                             | JS runs before DOM ready                    | Move script or wrap in `DOMContentLoaded` |
| OAuth not redirecting                              | Redirect URI mismatch                       | Check exact URIs in OAuth console         |
| Local upload not saving                            | Folder permission issue                     | Ensure write access to `uploads/`         |


## 🧰 Useful Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Sync database models
npm run sync-db

# Run migrations manually
npx sequelize-cli db:migrate
```


## 🧑‍💻 Author

**Harish Ramaswamy**
🧠 Developer of the Unified Multi-Drive Dashboard (Google, OneDrive, Apple, Local)
📧 [harishrswamy1@gmail.com](mailto:harishrswamy1@gmail.com)

## 📄 License

Licensed under the **MIT License** — free to use, extend, and modify.

### ⭐ Star this repo if you’re excited for multi-cloud + local file integration!

