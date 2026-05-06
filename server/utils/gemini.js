const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

// Keep an instance ready if the API key is present
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Evaluates a student's subjective answer using Gemini AI.
 *
 * @param {string} question The text of the question
 * @param {string} idealAnswer The teacher's ideal answer or grading rubric
 * @param {string} studentAnswer The student's typed response
 * @param {number} maxMarks The maximum marks available for this question
 * @returns {Promise<number>} The awarded score as a number between 0 and maxMarks
 */
async function evaluateSubjectiveAnswer(question, idealAnswer, studentAnswer, maxMarks) {
  if (!genAI) {
    console.warn("GEMINI_API_KEY is not set. Skipping AI auto-grading, awarding 0 marks.");
    return 0;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an automated, strict but fair teacher grading an exam.
    
Question: "${question}"
Max Marks: ${maxMarks}
Ideal Answer / Rubric: "${idealAnswer}"

Student's Answer: "${studentAnswer}"

Task: Evaluate the student's answer strictly based on the ideal answer. Award partial marks if the answer is partially correct. 
Your output MUST be a single integer number representing the final score out of ${maxMarks}. Do NOT provide any explanation, feedback, or extra text. ONLY return the integer number.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Parse the integer from the response
    const awardedMarks = parseInt(responseText, 10);
    
    if (isNaN(awardedMarks)) {
      console.warn("AI returned a non-integer score:", responseText);
      return 0; // Fallback to 0 if AI messes up the format
    }
    
    // Ensure the score is bounded
    return Math.max(0, Math.min(awardedMarks, maxMarks));
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return 0; // Fallback to 0 if the API fails
  }
}

module.exports = {
  evaluateSubjectiveAnswer,
};
