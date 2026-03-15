import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("family_stories.db");

// Initialize DB schema if needed
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER,
    user_id INTEGER,
    role TEXT,
    FOREIGN KEY(family_id) REFERENCES families(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER,
    author_id INTEGER,
    title TEXT,
    content TEXT,
    type TEXT,
    media_url TEXT,
    year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(family_id) REFERENCES families(id),
    FOREIGN KEY(author_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS tree_nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER,
    name TEXT,
    relation_type TEXT,
    parent_id INTEGER,
    birth_year INTEGER,
    death_year INTEGER,
    FOREIGN KEY(family_id) REFERENCES families(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      const info = db.prepare("INSERT INTO users (email, name) VALUES (?, ?)").run(email, email.split('@')[0]);
      user = { id: info.lastInsertRowid, email, name: email.split('@')[0] };
    }
    res.json({ user, token: "mock-token-" + user.id });
  });

  app.get("/api/families", (req, res) => {
    const families = db.prepare("SELECT * FROM families").all();
    res.json(families);
  });

  app.get("/api/stories", (req, res) => {
    const stories = db.prepare(`
      SELECT s.*, u.name as author_name 
      FROM stories s 
      JOIN users u ON s.author_id = u.id 
      ORDER BY s.year ASC
    `).all();
    res.json(stories);
  });

  app.post("/api/stories", (req, res) => {
    const { family_id, author_id, title, content, type, media_url, year } = req.body;
    const info = db.prepare(`
      INSERT INTO stories (family_id, author_id, title, content, type, media_url, year)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(family_id, author_id, title, content, type, media_url, year);
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/tree", (req, res) => {
    const nodes = db.prepare("SELECT * FROM tree_nodes").all();
    res.json(nodes);
  });

  app.post("/api/tree", (req, res) => {
    const { family_id, name, relation_type, parent_id, birth_year, death_year } = req.body;
    const info = db.prepare(`
      INSERT INTO tree_nodes (family_id, name, relation_type, parent_id, birth_year, death_year)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(family_id, name, relation_type, parent_id, birth_year, death_year);
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
