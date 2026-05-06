const { sql, getPool } = require("../server/config/db");

async function checkQuestions() {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT TOP 5 Id, QuestionText, OptionsJson, CorrectIndex FROM Questions ORDER BY Id DESC");
    console.log(JSON.stringify(result.recordset, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkQuestions();
