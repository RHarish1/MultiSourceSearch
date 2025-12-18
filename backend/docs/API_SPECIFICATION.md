# MultiSourceSearch Backend API Specification

Base URL: `https://multisourcesearch.onrender.com`

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Google OAuth Endpoints](#google-oauth-endpoints)
3. [OneDrive OAuth Endpoints](#onedrive-oauth-endpoints)
4. [Image Management Endpoints](#image-management-endpoints)
5. [Health Check](#health-check)

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "message": "Registered successfully",
  "userId": "string"
}
```

**Response (Error - 400):**
```json
{
  "error": "Username already taken"
}
```
or
```json
{
  "error": "Email already in use"
}
```

**Response (Error - 500):**
```json
{
  "error": "Registration failed"
}
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Description:** Login with username/email and password

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "login": "string (username or email, required)",
  "password": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "message": "Logged in",
  "userId": "string"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid credentials"
}
```

**Response (Error - 500):**
```json
{
  "error": "Login failed"
}
```

**Notes:**
- Sets session cookie upon successful login
- Session cookie is required for authenticated endpoints

---

### 3. Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout current user and destroy session

**Authentication:** Required (session cookie)

**Response (Success - 200):**
```json
{
  "message": "Logged out"
}
```

**Response (Error - 500):**
```json
{
  "error": "Logout failed"
}
```

**Notes:**
- Clears session cookie

---

### 4. Get Current User
**Endpoint:** `GET /api/auth/me`

**Description:** Get current user profile and linked drives

**Authentication:** Required (session cookie)

**Response (Success - 200):**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "linked": {
    "google": "boolean",
    "onedrive": "boolean"
  }
}
```

**Response (Error - 404):**
```json
{
  "error": "User not found"
}
```

**Response (Error - 500):**
```json
{
  "error": "Failed to fetch user"
}
```

---

### 5. List Drives
**Endpoint:** `GET /api/auth/drives`

**Description:** Get all linked cloud drives for current user

**Authentication:** Required (session cookie)

**Response (Success - 200):**
```json
{
  "drives": [
    {
      "provider": "google | onedrive",
      "email": "string | null",
      "expiry": "ISO 8601 date string | null",
      "accessToken": "string (decrypted)",
      "refreshToken": "string (decrypted)"
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "error": "Failed to retrieve drives"
}
```

**Notes:**
- Automatically refreshes expired tokens before returning
- Tokens are decrypted from storage

---

## Google OAuth Endpoints

### 1. Initiate Google OAuth
**Endpoint:** `GET /api/auth/google/`

**Description:** Redirect user to Google OAuth consent screen

**Authentication:** Required (session cookie)

**Response:**
- HTTP 302 Redirect to Google OAuth URL

**Scopes Requested:**
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/drive.file`

---

### 2. Google OAuth Callback
**Endpoint:** `GET /api/auth/google/callback`

**Description:** Handle OAuth callback from Google

**Authentication:** Required (session cookie)

**Query Parameters:**
- `code`: OAuth authorization code (provided by Google)

**Response:**
- HTTP 302 Redirect to `{FRONTEND_URL}/dashboard` on success
- HTTP 302 Redirect to `{FRONTEND_URL}/manageDrives?error=google_oauth_failed` on error

**Response (Error - 400):**
```json
{
  "error": "Missing code"
}
```

**Notes:**
- Stores encrypted access token and refresh token in database
- Links Google Drive to user account
- Updates existing drive connection if already linked

---

## OneDrive OAuth Endpoints

### 1. Initiate OneDrive OAuth
**Endpoint:** `GET /api/auth/onedrive/`

**Description:** Redirect user to Microsoft OAuth consent screen

**Authentication:** Required (session cookie)

**Response:**
- HTTP 302 Redirect to Microsoft OAuth URL

**Scopes Requested:**
- `Files.ReadWrite.All`
- `offline_access`
- `User.Read`

---

### 2. OneDrive OAuth Callback
**Endpoint:** `GET /api/auth/onedrive/callback`

**Description:** Handle OAuth callback from Microsoft

**Authentication:** Required (session cookie)

**Query Parameters:**
- `code`: OAuth authorization code (provided by Microsoft)

**Response:**
- HTTP 302 Redirect to `{FRONTEND_URL}/dashboard` on success
- HTTP 302 Redirect to `{FRONTEND_URL}/manageDrives?error=onedrive_oauth_failed` on error

**Response (Error - 400):**
```json
{
  "error": "Missing code"
}
```

**Notes:**
- Stores encrypted access token and refresh token in database
- Links OneDrive to user account
- Updates existing drive connection if already linked

---

## Image Management Endpoints

### 1. Get Images
**Endpoint:** `GET /api/images/`

**Description:** Get all images for current user with optional filename search

**Authentication:** Required (session cookie)

**Query Parameters:**
- `search` (optional): Search term to filter by filename (case-insensitive)

**Response (Success - 200):**
```json
[
  {
    "id": "string",
    "fileName": "string",
    "fileUrl": "string",
    "tags": ["string"]
  }
]
```

**Response (Error - 500):**
```json
{
  "error": "Failed to fetch images"
}
```

**Notes:**
- Returns images ordered by creation date (newest first)
- Automatically refreshes expired drive tokens

---

### 2. Search Images
**Endpoint:** `GET /api/images/search`

**Description:** Search images by filename and tags

**Authentication:** Required (session cookie)

**Query Parameters:**
- `q` (required): Search query (comma or space-separated terms)
- `and` (optional): If "true", all terms must match (AND logic). Otherwise, any term matches (OR logic)

**Examples:**
- `/api/images/search?q=cat,dog` - Find images with "cat" OR "dog"
- `/api/images/search?q=cat,dog&and=true` - Find images with both "cat" AND "dog"

**Response (Success - 200):**
```json
{
  "images": [
    {
      "id": "string",
      "fileName": "string",
      "fileUrl": "string",
      "tags": ["string"]
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing query"
}
```

**Response (Error - 500):**
```json
{
  "error": "Search failed"
}
```

**Notes:**
- Searches both filename and tags
- Case-insensitive search
- Multiple search terms can be separated by commas or spaces

---

### 3. Upload Image
**Endpoint:** `POST /api/images/upload`

**Description:** Upload an image to a linked cloud drive

**Authentication:** Required (session cookie)

**Request Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: File (required) - The image file to upload
provider: "google" | "onedrive" (required) - Cloud storage provider
fileName: string (optional) - Custom filename (defaults to original filename)
tags: string (optional) - Comma-separated list of tags
```

**Example:**
```
file: [binary file data]
provider: google
fileName: vacation_photo.jpg
tags: vacation,beach,summer
```

**Response (Success - 200):**
```json
{
  "success": true,
  "imageId": "string"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid or missing provider"
}
```
or
```json
{
  "error": "No file uploaded."
}
```
or
```json
{
  "error": "Drive not linked."
}
```

**Response (Error - 500):**
```json
{
  "error": "Upload failed"
}
```

**Notes:**
- File is uploaded to the specified cloud drive
- Tags are created if they don't exist
- File metadata is stored in database

---

### 4. Edit Image
**Endpoint:** `PUT /api/images/:id`

**Description:** Update image filename and tags

**Authentication:** Required (session cookie)

**Path Parameters:**
- `id`: Image ID (required)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "fileName": "string (optional)",
  "tags": "string (optional, comma-separated)"
}
```

**Example:**
```json
{
  "fileName": "new_filename.jpg",
  "tags": "nature,landscape,mountains"
}
```

**Response (Success - 200):**
```json
{
  "success": true
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing image id"
}
```

**Response (Error - 404):**
```json
{
  "error": "Not found"
}
```

**Response (Error - 500):**
```json
{
  "error": "Edit failed"
}
```

**Notes:**
- Only updates provided fields
- Replaces all existing tags with new ones
- User can only edit their own images

---

### 5. Delete Image
**Endpoint:** `DELETE /api/images/:id`

**Description:** Delete image from cloud drive and database

**Authentication:** Required (session cookie)

**Path Parameters:**
- `id`: Image ID (required)

**Response (Success - 200):**
```json
{
  "success": true
}
```

**Response (Error - 400):**
```json
{
  "error": "Missing image id"
}
```

**Response (Error - 404):**
```json
{
  "error": "Not found"
}
```

**Response (Error - 500):**
```json
{
  "error": "Delete failed"
}
```

**Notes:**
- Deletes file from cloud storage (Google Drive or OneDrive)
- Removes all associated tags
- Removes database record
- User can only delete their own images

---

## Health Check

### Health Check
**Endpoint:** `GET /api/health`

**Description:** Check if the API and Redis connection are healthy

**Authentication:** Not required

**Response (Success - 200):**
```json
{
  "status": "ok",
  "redis": true
}
```

**Notes:**
- `redis` field indicates whether Redis connection is active
- Used for monitoring and uptime checks

---

## Global Error Responses

### 401 Unauthorized
Returned when authentication is required but not provided or session has expired.

```json
{
  "error": "Unauthorized"
}
```

**Endpoints affected:** All endpoints with "Authentication: Required"

---

## Authentication Notes

All authenticated endpoints require a valid session cookie (`connect.sid`). The session is established when:
- A user successfully registers (`POST /api/auth/register`)
- A user successfully logs in (`POST /api/auth/login`)

Session configuration:
- **Duration:** 7 days
- **Cookie settings:**
  - `httpOnly`: true (prevents JavaScript access)
  - `secure`: true in production (HTTPS only)
  - `sameSite`: "none" in production, "lax" in development
  - `maxAge`: 604,800,000 ms (7 days)

---

## CORS Configuration

Allowed origins:
- `https://multi-source-search.vercel.app`

Credentials are enabled, allowing cookies to be sent with cross-origin requests.

---

## Rate Limiting

No rate limiting is currently implemented. Consider implementing rate limiting for production use.

---

## Data Encryption

The following data is encrypted at rest using AES-256-CBC encryption:
- Cloud drive access tokens
- Cloud drive refresh tokens

Encryption key should be set in the `ENCRYPTION_KEY` environment variable.
