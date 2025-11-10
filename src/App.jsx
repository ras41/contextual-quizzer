import React, { useState } from "react";
import TextArea from "./components/TextArea";
import QuizArea from "./components/QuizArea"; // This component will be updated next
import { STOP_WORDS } from "./utils/stopwords";
import "./App.css";

function App() {
  const [rawText, setRawText] = useState("");
  const [quizText, setQuizText] = useState("");

  // --- NEW STATE ---
  // We need to store the *list* of correct answers
  const [answers, setAnswers] = useState([]);
  // We need to store what the user types in each blank
  const [userInputs, setUserInputs] = useState({});
  // We need to store the final score
  const [score, setScore] = useState(null); // null means "not graded yet"
  // -------------------

  const handleGenerateQuiz = () => {
    const sanitizedText = rawText.toLowerCase().replace(/[^a-z\s]/g, "");

    const allWords = sanitizedText.split(/\s+/);
    const importantWords = allWords.filter((word) => {
      return word.length > 1 && !STOP_WORDS.has(word);
    });

    const uniqueImportantWords = [...new Set(importantWords)];

    // Let's aim for 5-10 words
    const wordCount = Math.max(
      5,
      Math.min(Math.floor(uniqueImportantWords.length / 5), 10)
    );

    const wordsToBlank = uniqueImportantWords
      .sort(() => 0.5 - Math.random())
      .slice(0, wordCount);

    // ... (code above this is fine)

    if (wordsToBlank.length === 0 && rawText.length > 0) {
      setQuizText("This text was too short or had no common words to quiz!");
      setAnswers([]);
      return;
    }

    // --- THIS IS THE NEW, FIXED LOGIC ---

    // 1. Create a regex that will find *any* of our chosen words
    //    e.g., /\\b(mitochondria|cell|energy)\\b/gi
    //    'g' = global (find all), 'i' = case-insensitive
    // This new regex means "Find one of the words,
    // as long as it's NOT immediately followed by another letter."
    // This will correctly match "energy" in "energy." or "energy,"
    const regex = new RegExp(
      `\\b(${wordsToBlank.join("|")})(?![a-zA-Z])`,
      "gi"
    );
    // 2. We create our new *correct* answers list
    const finalAnswers = [];

    // 3. We use the .replace() function's "callback" method.
    //    This function will be called for *every* word it matches.
    const generatedQuizText = rawText.replace(regex, (match) => {
      // 'match' will be the *actual* word found (e.g., "Mitochondria")
      // We push it onto our answers list *in the order it was found*
      finalAnswers.push(match);

      // And we return the blank
      return "[_____]";
    });

    // 4. NOW the lists are in sync!
    setQuizText(generatedQuizText);
    setAnswers(finalAnswers); // Set the correctly-ordered answers
    setUserInputs({});
    setScore(null);

    // ... (rest of function)

    setQuizText(generatedQuizText);
    setAnswers(wordsToBlank); // NEW: Save the correct answers!
    setUserInputs({}); // NEW: Clear any old inputs
    setScore(null); // NEW: Clear the old score
  };

  // NEW: This function is called by QuizArea every time a blank is typed in
  const handleAnswerChange = (index, value) => {
    setUserInputs((prevInputs) => ({
      ...prevInputs,
      [index]: value,
    }));
  };

  // NEW: This function is called when the user clicks "Check Answers"
  const handleCheckAnswers = () => {
    let correctCount = 0;
    answers.forEach((correctAnswer, index) => {
      const userAnswer = (userInputs[index] || "").trim(); // <-- Added .trim()
      //       // Compare answers (lowercase)
      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });
    setScore(correctCount);
  };

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

        {/* NEW: We are passing *many* more props down to QuizArea
          so it can be interactive.
        */}
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
