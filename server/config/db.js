const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sql = require("mssql");

/* -------- Validate env -------- */
const missing = [];
if (!process.env.DB_SERVER) missing.push("DB_SERVER");
if (!process.env.DB_NAME) missing.push("DB_NAME");
if (!process.env.DB_USER) missing.push("DB_USER");
if (process.env.DB_PASSWORD === undefined) missing.push("DB_PASSWORD");

if (missing.length) {
  console.error(
    `Missing SQL config env vars (${missing.join(", ")}). Check server/.env`
  );
}

/* -------- SQL config -------- */
const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "master",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: process.env.DB_TRUSTED_CONNECTION === "true",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

/* -------- Lazy pool (auto-reconnect) -------- */
let pool = null;

async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }

  if (pool) {
    try {
      await pool.close();
    } catch {}
  }

  pool = await new sql.ConnectionPool(config).connect();
  console.log("SQL pool connected");
  return pool;
}

sql.on("error", (err) => {
  console.error("SQL global error", err);
  pool = null;
});

module.exports = {
  sql,
  getPool,
};
