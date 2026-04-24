import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const DB_PATH = process.env.DB_PATH || './data/cloudvault.db';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir(UPLOAD_DIR);
ensureDir(path.dirname(DB_PATH));

let db;

const initDb = async () => {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      permissions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      user_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      user_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER NOT NULL,
      mime_type TEXT,
      folder_id INTEGER,
      user_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS shared_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Seed default settings
  const defaultSettings = {
    brand_name: 'CloudVault',
    logo_url: '',
    description: 'Self-Hosted File Management System',
    meta_keys: 'files, storage, cloud',
    seo_title: 'CloudVault'
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = db.exec("SELECT * FROM settings WHERE key = ?", [key]);
    if (existing.length === 0 || existing[0].values.length === 0) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
    }
  }

  const adminCheck = db.exec("SELECT id FROM users WHERE email = ?", [process.env.ADMIN_EMAIL]);
  if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
    const hashed = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [process.env.ADMIN_EMAIL, hashed, 'Admin']);
    console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
  }

  saveDb();
  return db;
};

const saveDb = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
};

const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while(stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const queryOne = (sql, params = []) => {
  const results = query(sql, params);
  return results[0] || null;
};

const run = (sql, params = []) => {
  db.run(sql, params);
  saveDb();
  return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0].values[0][0] };
};

app.use(cors({
  origin: '*', // More permissive for production
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Secure the uploads directory. Only allow the dynamically configured logo to be accessed publicly.
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const logoSetting = queryOne("SELECT value FROM settings WHERE key = 'logo_url'");
  
  if (logoSetting && logoSetting.value && logoSetting.value.endsWith(`/uploads/${filename}`)) {
    const filePath = path.resolve(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  
  return res.status(403).json({ error: 'Direct file access is strictly forbidden.' });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 104857600 }
});

const authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authenticateAPI = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const tokenData = queryOne("SELECT * FROM api_tokens WHERE token = ?", [token]);
  if (!tokenData) return res.status(401).json({ error: 'Invalid API token' });

  if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Token expired' });
  }

  req.apiToken = tokenData;
  req.permissions = JSON.parse(tokenData.permissions);
  next();
};

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });

  const existing = queryOne("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) return res.status(400).json({ error: 'Email already exists' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [email, hashed, name]);

  const token = jwt.sign({ id: result.lastInsertRowid, email, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: result.lastInsertRowid, email, name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = queryOne("SELECT * FROM users WHERE email = ?", [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/files', authenticate, (req, res) => {
  const { folder_id } = req.query;
  let files;
  if (folder_id) {
    files = query(`
      SELECT files.*, CASE WHEN shared_links.id IS NOT NULL THEN 1 ELSE 0 END as is_shared 
      FROM files 
      LEFT JOIN shared_links ON files.id = shared_links.file_id 
      WHERE user_id = ? AND folder_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id, parseInt(folder_id)]);
  } else {
    files = query(`
      SELECT files.*, CASE WHEN shared_links.id IS NOT NULL THEN 1 ELSE 0 END as is_shared 
      FROM files 
      LEFT JOIN shared_links ON files.id = shared_links.file_id 
      WHERE user_id = ? AND folder_id IS NULL 
      ORDER BY created_at DESC
    `, [req.user.id]);
  }
  res.json(files);
});

app.post('/api/files/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { folder_id } = req.body;
  const result = run(
    "INSERT INTO files (original_name, stored_name, path, size, mime_type, folder_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.file.originalname, req.file.filename, req.file.path, req.file.size, req.file.mimetype, folder_id || null, req.user.id]
  );

  res.json({ id: result.lastInsertRowid, original_name: req.file.originalname, size: req.file.size });
});

app.get('/api/files/:id/download', authenticate, (req, res) => {
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!file) return res.status(404).json({ error: 'File not found' });

  res.download(file.path, file.original_name);
});

app.put('/api/files/:id', authenticate, (req, res) => {
  const { name } = req.body;
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!file) return res.status(404).json({ error: 'File not found' });

  run("UPDATE files SET original_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [name, req.params.id]);
  res.json({ message: 'File renamed' });
});

app.delete('/api/files/:id', authenticate, (req, res) => {
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!file) return res.status(404).json({ error: 'File not found' });

  fs.unlinkSync(file.path);
  run("DELETE FROM files WHERE id = ?", [req.params.id]);
  res.json({ message: 'File deleted' });
});

app.post('/api/files/move', authenticate, (req, res) => {
  const { file_id, folder_id } = req.body;
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [file_id, req.user.id]);
  if (!file) return res.status(404).json({ error: 'File not found' });

  run("UPDATE files SET folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [folder_id, file_id]);
  res.json({ message: 'File moved' });
});

app.get('/api/folders', authenticate, (req, res) => {
  const { parent_id } = req.query;
  let folders;
  if (parent_id) {
    folders = query("SELECT * FROM folders WHERE user_id = ? AND parent_id = ? ORDER BY name", [req.user.id, parseInt(parent_id)]);
  } else {
    folders = query("SELECT * FROM folders WHERE user_id = ? AND parent_id IS NULL ORDER BY name", [req.user.id]);
  }
  res.json(folders);
});

app.post('/api/folders', authenticate, (req, res) => {
  const { name, parent_id } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const result = run("INSERT INTO folders (name, parent_id, user_id) VALUES (?, ?, ?)", [name, parent_id || null, req.user.id]);
  res.json({ id: result.lastInsertRowid, name });
});

app.put('/api/folders/:id', authenticate, (req, res) => {
  const { name } = req.body;
  const folder = queryOne("SELECT * FROM folders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  run("UPDATE folders SET name = ? WHERE id = ?", [name, req.params.id]);
  res.json({ message: 'Folder renamed' });
});

app.delete('/api/folders/:id', authenticate, (req, res) => {
  const folder = queryOne("SELECT * FROM folders WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  run("DELETE FROM folders WHERE id = ?", [req.params.id]);
  res.json({ message: 'Folder deleted' });
});

app.get('/api/tokens', authenticate, (req, res) => {
  const tokens = query("SELECT id, name, permissions, created_at, expires_at FROM api_tokens WHERE user_id = ?", [req.user.id]);
  res.json(tokens);
});

app.post('/api/tokens', authenticate, (req, res) => {
  const { name, permissions, expires_at } = req.body;
  if (!name || !permissions) return res.status(400).json({ error: 'Name and permissions required' });

  const token = uuidv4();
  run("INSERT INTO api_tokens (name, token, permissions, expires_at, user_id) VALUES (?, ?, ?, ?, ?)", [name, token, JSON.stringify(permissions), expires_at || null, req.user.id]);

  res.json({ token, name, permissions });
});

app.delete('/api/tokens/:id', authenticate, (req, res) => {
  const token = queryOne("SELECT * FROM api_tokens WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!token) return res.status(404).json({ error: 'Token not found' });

  run("DELETE FROM api_tokens WHERE id = ?", [req.params.id]);
  res.json({ message: 'Token revoked' });
});

app.get('/api/public/files', authenticateAPI, (req, res) => {
  if (!req.permissions.includes('read') && !req.permissions.includes('admin')) return res.status(403).json({ error: 'No read permission' });
  const files = query("SELECT id, original_name, size, mime_type, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC", [req.apiToken.user_id]);
  res.json(files);
});

app.get('/api/public/files/:id/download', authenticateAPI, (req, res) => {
  if (!req.permissions.includes('read') && !req.permissions.includes('download') && !req.permissions.includes('admin')) {
    return res.status(403).json({ error: 'No read/download permission' });
  }
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [req.params.id, req.apiToken.user_id]);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  if (!fs.existsSync(file.path)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }
  return res.download(file.path, file.original_name);
});

app.post('/api/public/files/upload', authenticateAPI, (req, res) => {
  if (!req.permissions.includes('write')) return res.status(403).json({ error: 'No write permission' });
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const admin = queryOne("SELECT id FROM users ORDER BY id ASC LIMIT 1");
    const result = run(
      "INSERT INTO files (original_name, stored_name, path, size, mime_type, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [req.file.originalname, req.file.filename, req.file.path, req.file.size, req.file.mimetype, admin.id]
    );

    res.json({ id: result.lastInsertRowid, original_name: req.file.originalname });
  });
});

app.delete('/api/public/files/:id', authenticateAPI, (req, res) => {
  if (!req.permissions.includes('delete') && !req.permissions.includes('admin')) return res.status(403).json({ error: 'No delete permission' });
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [req.params.id, req.apiToken.user_id]);
  if (!file) return res.status(404).json({ error: 'File not found' });

  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
  run("DELETE FROM files WHERE id = ?", [req.params.id]);
  res.json({ message: 'File deleted' });
});

// -- Settings Endpoints --

app.get('/api/public/settings', (req, res) => {
  const result = query("SELECT key, value FROM settings");
  const settings = {};
  result.forEach(row => settings[row.key] = row.value);
  res.json(settings);
});

app.get('/api/settings', authenticate, (req, res) => {
  const result = query("SELECT key, value FROM settings");
  const settings = {};
  result.forEach(row => settings[row.key] = row.value);
  res.json(settings);
});

app.post('/api/settings', authenticate, (req, res) => {
  const settings = req.body;
  
  for (const [key, value] of Object.entries(settings)) {
    const existing = queryOne("SELECT * FROM settings WHERE key = ?", [key]);
    if (existing) {
      run("UPDATE settings SET value = ? WHERE key = ?", [value, key]);
    } else {
      run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
    }
  }
  
  res.json({ message: 'Settings saved' });
});

app.post('/api/settings/logo', authenticate, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const host = req.get('host');
  const protocol = req.protocol;
  const logoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  
  const existing = queryOne("SELECT * FROM settings WHERE key = ?", ['logo_url']);
  if (existing) {
    run("UPDATE settings SET value = ? WHERE key = ?", [logoUrl, 'logo_url']);
  } else {
    run("INSERT INTO settings (key, value) VALUES (?, ?)", ['logo_url', logoUrl]);
  }
  
  res.json({ logo_url: logoUrl });
});

// -- Serve Frontend in Production --
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    // Only serve index.html if it's not an API route and not a static file request that wasn't caught
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  });
}

// -- Shared Pages Endpoints --

app.post('/api/files/:id/share', authenticate, (req, res) => {
  const fileId = req.params.id;
  const file = queryOne("SELECT * FROM files WHERE id = ? AND user_id = ?", [fileId, req.user.id]);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const existing = queryOne("SELECT id FROM shared_links WHERE file_id = ?", [fileId]);
  let is_shared = false;
  if (existing) {
    run("DELETE FROM shared_links WHERE file_id = ?", [fileId]);
    is_shared = false;
  } else {
    const token = uuidv4();
    run("INSERT INTO shared_links (token, file_id) VALUES (?, ?)", [token, fileId]);
    is_shared = true;
  }
  
  res.json({ is_shared });
});

app.get('/api/shared', (req, res) => {
  const files = query(`
    SELECT files.id, files.original_name, files.size, files.mime_type 
    FROM files 
    JOIN shared_links ON files.id = shared_links.file_id
    ORDER BY shared_links.created_at DESC
  `);

  const result = query("SELECT key, value FROM settings");
  const settings = {};
  result.forEach(row => settings[row.key] = row.value);

  res.json({ files, settings });
});

app.get('/api/shared/download/:id', (req, res) => {
  const { id } = req.params;
  const link = queryOne("SELECT file_id FROM shared_links WHERE file_id = ?", [id]);
  if (!link) return res.status(403).json({ error: 'File is not shared' });

  const file = queryOne("SELECT * FROM files WHERE id = ?", [link.file_id]);
  if (!file) return res.status(404).json({ error: 'File not found' });
  if (!fs.existsSync(file.path)) return res.status(404).json({ error: 'File not found on disk' });

  res.download(file.path, file.original_name);
});


initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CloudVault server running on http://localhost:${PORT}`);
  });
});