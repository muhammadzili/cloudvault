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

4. Start the application in development mode:

```bash
npm run dev
```

CloudVault supports an underlying concurrent system that manages both the server and client builds on identical start up loops. Note that any SQLite migrations occur strictly on the backend instantiation process. 

## Production Deployment

To run CloudVault in a production environment, follow these steps:

1. **Build and Start:**
   Run the optimized production script which builds the frontend and starts the backend service:
   ```bash
   npm run prod
   ```

2. **Automated Startup (Recommended):**
   Use a process manager like **PM2** to ensure the server restarts automatically:
   ```bash
   npm install -g pm2
   pm2 start start-prod.sh --name cloudvault
   ```

3. **Reverse Proxy:**
   It is highly recommended to use Nginx or Apache as a reverse proxy to handle SSL (HTTPS) and port forwarding.

## License

This software is provided under the MIT License.

