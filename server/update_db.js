const fs = require('fs');
const { getPool } = require('./config/db');

async function updateDb() {
  try {
    const pool = await getPool();
    
    // Add PasswordHash to Students if it doesn't exist
    try {
      await pool.request().query(`
        IF COL_LENGTH('Students', 'PasswordHash') IS NULL
        BEGIN
            ALTER TABLE Students ADD PasswordHash NVARCHAR(MAX) NULL
        END
      `);
      console.log('Updated Students table');
    } catch (err) {
      console.error('Error updating Students table:', err.message);
    }

    // Create Teachers table
    try {
      await pool.request().query(`
        IF OBJECT_ID('Teachers', 'U') IS NULL
        BEGIN
          CREATE TABLE Teachers (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            TeacherName NVARCHAR(200) NOT NULL,
            MobileNumber NVARCHAR(20) NOT NULL UNIQUE,
            PasswordHash NVARCHAR(MAX) NULL,
            CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
          );
        END
      `);
      console.log('Created Teachers table');
    } catch (err) {
      console.error('Error creating Teachers table:', err.message);
    }

    // Create Admins table
    try {
      await pool.request().query(`
        IF OBJECT_ID('Admins', 'U') IS NULL
        BEGIN
          CREATE TABLE Admins (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            Username NVARCHAR(50) NOT NULL UNIQUE,
            PasswordHash NVARCHAR(MAX) NOT NULL,
            CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
          );
        END
      `);
      console.log('Created Admins table');
    } catch (err) {
      console.error('Error creating Admins table:', err.message);
    }

    console.log('Database update script finished.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

updateDb();
