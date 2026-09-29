const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

app.use(express.json());

const dataFolder = path.join(__dirname, "data");

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

const dbPath = path.join(dataFolder, "pharmacy.db");
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'pharmacist')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Temporary login sessions.
// The actual password is never stored here.
const sessions = new Map();

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    userId: user.id,
    username: user.username,
    role: user.role,
    createdAt: Date.now(),
  });

  return token;
}

function getSession(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

// Check whether initial setup is complete
app.get("/api/setup-status", (req, res) => {
  const admin = db
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();

  res.json({
    setupCompleted: !!admin,
  });
});

// Create first Admin
app.post("/api/setup-admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existingAdmin = db
      .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
      .get();

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin account has already been created.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    db.prepare(`
      INSERT INTO users (username, password_hash, role)
      VALUES (?, ?, 'admin')
    `).run(cleanUsername, passwordHash);

    res.json({
      success: true,
      message: "Admin account created successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not create the Admin account.",
    });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }

    const user = db
      .prepare(`
        SELECT id, username, password_hash, role
        FROM users
        WHERE username = ?
      `)
      .get(username.trim());

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid username or password.",
      });
    }

    const token = createSession(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed.",
    });
  }
});

// Check current login
app.get("/api/session", (req, res) => {
  const session = getSession(req);

  if (!session) {
    return res.status(401).json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      role: session.role,
    },
  });
});

// Logout
app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (token) {
    sessions.delete(token);
  }

  res.json({
    success: true,
  });
});

// Test route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Premier Pharmacy server is running.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Premier Pharmacy server running on http://localhost:${PORT}`
  );
});