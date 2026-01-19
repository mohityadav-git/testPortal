const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const sql = require("mssql");

const missing = [];
if (!process.env.DB_SERVER) missing.push("DB_SERVER");
if (!process.env.DB_NAME) missing.push("DB_NAME");
if (!process.env.DB_USER) missing.push("DB_USER");
if (process.env.DB_PASSWORD === undefined) missing.push("DB_PASSWORD");

if (missing.length) {
  console.error(
    `Missing SQL config env vars (${missing.join(
      ", "
    )}). Ensure server/.env is present and you run the server from the server folder.`
  );
}

const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "master",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: process.env.DB_TRUSTED_CONNECTION === "true",
  },
};

// Create a shared connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect().catch((err) => {
  console.error("SQL pool connection failed", err);
});

module.exports = {
  sql,
  pool,
  poolConnect,
};
