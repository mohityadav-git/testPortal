const fs = require('fs');
const path = require('path');
const { getPool } = require('./config/db');

async function clearAllData() {
  try {
    const pool = await getPool();
    console.log("Connected to database. Clearing tables...");

    const tablesToClear = [
      'Tests',
      'Questions',
      'Results',
      'StudyMaterials',
      'Students',
      'Teachers'
    ];

    for (const table of tablesToClear) {
      try {
        await pool.request().query(`TRUNCATE TABLE ${table}`);
        console.log(`Cleared table: ${table}`);
      } catch (err) {
        // TRUNCATE might fail if there are foreign keys, but we don't have them in the schema.
        // Fallback to DELETE just in case
        console.log(`TRUNCATE failed for ${table}, trying DELETE...`);
        await pool.request().query(`DELETE FROM ${table}`);
        console.log(`Cleared table: ${table}`);
      }
    }

    console.log("Database tables cleared.");

    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log("Clearing uploads directory...");
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
      console.log("Uploads directory cleared.");
    }

    console.log("All data cleared successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing data:", error);
    process.exit(1);
  }
}

clearAllData();
