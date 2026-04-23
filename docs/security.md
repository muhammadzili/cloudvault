# 🛡️ Security Best Practices

CloudVault is designed with security as a core principle. Here is how we protect your data:

## 1. Authentication
- **Passwords**: Hashed using `bcrypt` (10 rounds).
- **Sessions**: Stateless JWT (JSON Web Tokens) with adjustable expiration.
- **Cookies**: HTTP-only cookies utilized for frontend session persistence.

## 2. Database Protection
- **SQL Injection**: All SQLite queries use parameterized bindings via `db.prepare()` and `stmt.bind()`. No raw user input is ever concatenated into SQL strings.

## 3. Directory Security
- **Strict Isolation**: The `/uploads` directory is specifically blocked from public static indexing.
- **Logo Exception**: Only the specific file path currently configured as the `logo_url` in settings is allowed public read access.

## 4. Recommended Hardening
If deploying to a production VPS:
- Use **Nginx** as a reverse proxy.
- Enable **SSL (HTTPS)** using Certbot/Let's Encrypt.
- Use a tool like **PM2** to manage the process and auto-restart.
- Set up a **UFW Firewall** and only allow ports 80, 443, and SSH.
