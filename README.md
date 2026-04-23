# CloudVault

CloudVault is a self-hosted file management system with cloud storage capabilities. Built with React, Node.js, and SQLite, it allows individual developers or small teams to securely host and share their files on a personal virtual private server.

## Features

- Secure Authentication (JWT & bcrypt validation)
- Advanced File Management (Upload, Download, Custom Renaming, Move, and Delete capabilities)
- Folder Organization
- API Tokens (Create individual API tokens with specific permissions for external integrations)
- Public File Catalog (Enable public-facing links for any individual file seamlessly)
- Dynamic Branding & SEO (Change site names, meta text, and upload custom logos dynamically)

## Technology Stack

- **Backend:** Node.js, Express.js, SQLite (sql.js), Multer
- **Frontend:** React, Vite, Material UI (MUI) v5

## Installation

1. Clone the repository
2. Install the necessary dependencies for all application layers:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Create a `.env` file inside the `server/` directory based on the following template:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
DB_PATH=./data/cloudvault.db
ADMIN_EMAIL=admin@cloudvault.local
ADMIN_PASSWORD=SecurePass123!
```

4. Start the application natively across all layers:

```bash
npm run dev
```

CloudVault supports an underlying concurrent system that manages both the server and client builds on identical start up loops. Note that any SQLite migrations occur strictly on the backend instantiation process. 

## License

This software is provided under the MIT License.
