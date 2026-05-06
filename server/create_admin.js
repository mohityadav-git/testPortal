const bcrypt = require('bcryptjs');
const { getPool, sql } = require('./config/db');

async function createAdmin() {
  try {
    const pool = await getPool();
    const hash = await bcrypt.hash('password', 10);
    
    // Check if admin exists
    const result = await pool.request().query("SELECT * FROM Admins WHERE Username = 'admin'");
    if (result.recordset.length === 0) {
      await pool.request()
        .input('Username', sql.NVarChar(50), 'admin')
        .input('PasswordHash', sql.NVarChar, hash)
        .query("INSERT INTO Admins (Username, PasswordHash) VALUES (@Username, @PasswordHash)");
      console.log('Default admin created.');
    } else {
      console.log('Default admin already exists.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
