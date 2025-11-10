import React, { useState } from "react";
import TextArea from "./components/TextArea";
import QuizArea from "./components/QuizArea";
// import { STOP_WORDS } from './utils/stopwords'; // OLD: We don't need this anymore!
import "./App.css";

function App() {
  const [rawText, setRawText] = useState("");
  const [quizText, setQuizText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [score, setScore] = useState(null);

  // --- NEW STATE ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // To show API errors

  // --- THIS IS THE "BRAIN TRANSPLANT" ---
  const handleGenerateQuiz = async () => {
    setIsLoading(true); // Show loading spinner
    setError(null); // Clear old errors
    setQuizText(""); // Clear old quiz
    setAnswers([]);
    setUserInputs({});
    setScore(null);

    try {
      // 1. Call our *own* server (the "lockbox")
      const response = await fetch("http://localhost:3001/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textToQuiz: rawText }),
      });

      if (!response.ok) {
        throw new Error("Something went wrong with the AI server.");
      }

      // 2. Get the JSON response from *our* server
      const data = await response.json();
      // data is { quizText: "...", answers: [...] }

      // 3. Set the state with the AI-generated data
      setQuizText(data.quizText);
      setAnswers(data.answers);
    } catch (err) {
      console.error(err);
      setError(err.message); // Show the error to the user
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };
  // --- END OF NEW FUNCTION ---

  const handleAnswerChange = (index, value) => {
    setUserInputs((prevInputs) => ({
      ...prevInputs,
      [index]: value,
    }));
  };

  const handleCheckAnswers = () => {
    let correctCount = 0;
    answers.forEach((correctAnswer, index) => {
      const userAnswer = (userInputs[index] || "").trim();
      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Contextual Quizzer 🧠✨</h1> {/* Added a sparkle! */}
        <p>Turn any text into an interactive quiz instantly.</p>
      </header>

      <main>
        <TextArea onTextChange={setRawText} />

        <div className="button-container">
          <button
            className="generate-button"
            onClick={handleGenerateQuiz}
            disabled={isLoading} // NEW: Disable button while loading
          >
            {/* NEW: Show different text when loading */}
            {isLoading ? "🧠 AI is thinking..." : "Generate Quiz!"}
          </button>
        </div>

        {/* NEW: Show loading message or error message */}
        {isLoading && (
          <div className="loading-message">Generating your quiz...</div>
        )}
        {error && <div className="error-message">{error}</div>}

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
