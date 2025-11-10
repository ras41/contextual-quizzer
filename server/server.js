// server/server.js
import express from "express";
import cors from "cors";
import "dotenv/config"; // Loads .env file
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Server Setup ---
const app = express();
app.use(cors()); // Allow our React app to call this server
app.use(express.json()); // Allow server to read JSON payloads
const PORT = 3001; // We'll run our backend on this port

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- Our API Endpoint ---
app.post("/generate-quiz", async (req, res) => {
  try {
    const { textToQuiz } = req.body; // Get the text from React

    if (!textToQuiz) {
      return res.status(400).json({ error: "No text provided" });
    }

    // --- This is our "Prompt Engineering" ---
    // We are telling the AI exactly what we want.
    const prompt = `
      You are an expert quiz-making bot.
      Based on the following text, create a fill-in-the-blank quiz.
      - Find 5-7 key, important words from the text.
      - Return a JSON object *only*. Do not return any other text or markdown.
      - The JSON object must have two keys:
        1. "quizText": The full original text, but with the key words you found replaced by "[_____]".
        2. "answers": An array of strings, containing the words you blanked out, in the *exact order* they appeared in the text.

      Example response:
      {
        "quizText": "The [_____] is the powerhouse of the [_____].",
        "answers": ["mitochondria", "cell"]
      }

      Here is the text to quiz:
      "${textToQuiz}"
    `;

    // --- Call the AI ---
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = response.text();

    let cleanedResponse = aiResponseText.trim();
    // Remove code block markers if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*$/, '');
    }

    let quizJson;
    try {
      quizJson = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      console.error(
        "AI response not valid JSON. Raw response:",
        aiResponseText
      );
      const match = cleanedResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          quizJson = JSON.parse(match[0]);
        } catch (innerError) {
          console.error("Failed to parse extracted JSON:", innerError);
          return res
            .status(500)
            .json({
              error: "AI response was not valid JSON",
              details: innerError.message,
            });
        }
      } else {
        return res
          .status(500)
          .json({
            error: "AI did not return a JSON object",
            details: aiResponseText,
          });
      }
    }

    // Send the JSON object back to our React app
    res.json(quizJson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate AI quiz" });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Quiz server running on http://localhost:${PORT}`);
});
