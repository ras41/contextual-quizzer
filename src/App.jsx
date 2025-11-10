import React, { useState } from "react";
import TextArea from "./components/TextArea";
import QuizArea from "./components/QuizArea";
import { STOP_WORDS } from "./utils/stopwords";
import "./App.css";

function App() {
  const [rawText, setRawText] = useState("");
  const [quizText, setQuizText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [score, setScore] = useState(null); // null means "not graded yet"

  const handleGenerateQuiz = () => {
    // 1. Sanitize text
    const sanitizedText = rawText.toLowerCase().replace(/[^a-z\s]/g, "");

    // 2. Filter out stop words
    const allWords = sanitizedText.split(/\s+/);
    const importantWords = allWords.filter((word) => {
      // Only count words with 3+ letters that are NOT stop words
      return word.length > 2 && !STOP_WORDS.has(word);
    });

    // 3. Pick words to blank out
    const uniqueImportantWords = [...new Set(importantWords)];
    const wordCount = Math.max(
      5,
      Math.min(Math.floor(uniqueImportantWords.length / 5), 10)
    );
    const wordsToBlank = uniqueImportantWords
      .sort(() => 0.5 - Math.random())
      .slice(0, wordCount);

    // 4. --- THE CRITICAL BUG FIX ---
    // If we have no words, stop right here.
    if (wordsToBlank.length === 0 || wordsToBlank.join("|") === "") {
      setQuizText("This text is too short or has no keywords to quiz!");
      setAnswers([]);
      setUserInputs({});
      setScore(null);
      return; // Stop the function
    }
    // -------------------------------

    // 5. Build the "smart" regex
    // e.g., \b(mitochondria|cell|energy)(?![a-zA-Z])
    const regex = new RegExp(
      `\\b(${wordsToBlank.join("|")})(?![a-zA-Z])`,
      "gi"
    );

    const finalAnswers = [];
    const generatedQuizText = rawText.replace(regex, (match) => {
      finalAnswers.push(match); // Add the answer *in order*
      return "[_____]";
    });

    // 6. Set the state
    setQuizText(generatedQuizText);
    setAnswers(finalAnswers);
    setUserInputs({});
    setScore(null);
  };

  // This function is called by QuizArea every time a blank is typed in
  const handleAnswerChange = (index, value) => {
    setUserInputs((prevInputs) => ({
      ...prevInputs,
      [index]: value,
    }));
  };

  // This function is called when the user clicks "Check Answers"
  const handleCheckAnswers = () => {
    let correctCount = 0;
    answers.forEach((correctAnswer, index) => {
      // Use .trim() to remove whitespace!
      const userAnswer = (userInputs[index] || "").trim();
      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

  // --- This is the part that renders the page ---
  return (
    <div className="app-container">
      <header>
        <h1>Contextual Quizzer 🧠</h1>
        <p>Turn any text into an interactive quiz instantly.</p>
      </header>

      <main>
        <TextArea onTextChange={setRawText} />

        <div className="button-container">
          <button className="generate-button" onClick={handleGenerateQuiz}>
            Generate Quiz!
          </button>
        </div>

        <QuizArea
          quizText={quizText}
          answers={answers}
          userInputs={userInputs}
          score={score}
          onAnswerChange={handleAnswerChange}
          onCheckAnswers={handleCheckAnswers}
        />
      </main>
    </div>
  );
}

export default App;
