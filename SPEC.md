# CloudVault - Self-Hosted File Management System

## 1. Project Overview

**Project Name:** CloudVault  
**Type:** Full-stack Web Application (React + Node.js)  
**Core Functionality:** Self-hosted file management system with cloud storage capabilities  
**Target Users:** Individual developers, small teams who want their own file hosting on VPS

## 2. Technical Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** SQLite with better-sqlite3
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt for password hashing
- **File Handling:** multer for uploads
- **Port:** 3001

### Frontend
- **Framework:** React + Vite
- **UI Library:** Material UI (MUI) v5
- **Font:** Poppins
- **State:** React Context + useState
- **HTTP Client:** Axios

## 3. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Tokens Table
```sql
CREATE TABLE api_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL, -- JSON array: ["read", "write", "delete", "admin"]
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  user_id INTEGER FOREIGN KEY REFERENCES users(id)
);
```

### Files Table
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT,
  folder_id INTEGER,
  user_id INTEGER FOREIGN KEY REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Folders Table
```sql
CREATE TABLE folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  parent_id INTEGER,
  user_id INTEGER FOREIGN KEY REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id)
);
```

## 4. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user info

### Files
- `GET /api/files` - List files (with folder filtering)
- `POST /api/files/upload` - Upload file (multipart)
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file
- `PUT /api/files/:id` - Rename file
- `POST /api/files/move` - Move file to folder

### Folders
- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder
- `PUT /api/folders/:id` - Rename folder

### API Tokens
- `GET /api/tokens` - List user's API tokens
- `POST /api/tokens` - Create new API token
- `DELETE /api/tokens/:id` - Revoke token

## 5. Security Features

- JWT token stored in httpOnly cookie
- Password hashed with bcrypt (10 rounds)
- Rate limiting on auth endpoints
- File path traversal prevention
- File type validation
- Max file size: 100MB (configurable)
- API tokens with granular permissions

## 6. UI/UX Design

### Color Palette (White Mode)
- **Background:** #FFFFFF
- **Surface:** #F8F9FA
- **Primary:** #1976D2 (Blue 700)
- **Secondary:** #9C27B0 (Purple 500)
- **Text Primary:** #212121
- **Text Secondary:** #757575
- **Border:** #E0E0E0
- **Success:** #2E7D32
- **Error:** #D32F2F

### Typography
- **Font Family:** Poppins (Google Fonts)
- **Headings:** 600 weight
- **Body:** 400 weight

### Layout
- **Sidebar:** 280px fixed width, collapsible
- **Main Content:** Fluid
- **Header:** 64px height
- **Cards:** 8px border-radius, subtle shadow

### Pages
1. **Login/Register** - Clean centered form
2. **Dashboard** - File explorer with grid/list view
3. **Settings** - API tokens management

### Components
- **File Card:** Preview icon, name, size, actions dropdown
- **Folder Card:** Folder icon, name, open on click
- **Upload Zone:** Drag & drop area with progress
- **Breadcrumb:** Navigation path
- **Context Menu:** Right-click actions
- **Modal:** Confirmations and forms

## 7. Environment Variables (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

# Database
DB_PATH=./data/cloudvault.db
```

## 8. Default Admin Credentials (set via .env)

```env
ADMIN_EMAIL=admin@cloudvault.local
ADMIN_PASSWORD=SecurePass123!
```

## 9. Acceptance Criteria

1. ✅ User can register and login
2. ✅ User can upload files (drag & drop and click)
3. ✅ User can download files
4. ✅ User can rename files
5. ✅ User can delete files
6. ✅ User can create/rename/delete folders
7. ✅ User can move files between folders
8. ✅ User can create API tokens with permissions
9. ✅ API tokens work for external access
10. ✅ White mode UI with Poppins font
11. ✅ Responsive design
12. ✅ Secure password storage