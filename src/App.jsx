import React, { useState } from "react";
import TextArea from "./components/TextArea";
import QuizArea from "./components/QuizArea";
import HowToModal from "./components/HowToModal";
import "./App.css";

// STEP 1: Re-import our offline stopwords
import { STOP_WORDS } from "./utils/stopwords";

function App() {
  const [rawText, setRawText] = useState("");
  const [quizText, setQuizText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHowTo, setShowHowTo] = useState(false);

  // STEP 2: Create a "pure" helper function for our offline algorithm
  // This function just takes text and returns a quiz object. It doesn't set state.
  const generateOfflineAlgorithm = (text) => {
    try {
      const sanitizedText = text.toLowerCase().replace(/[^a-z\s]/g, "");
      const allWords = sanitizedText.split(/\s+/);
      const importantWords = allWords.filter((word) => {
        return word.length > 2 && !STOP_WORDS.has(word);
      });
      const uniqueImportantWords = [...new Set(importantWords)];
      const wordCount = Math.max(
        5,
        Math.min(Math.floor(uniqueImportantWords.length / 5), 10)
      );
      const wordsToBlank = uniqueImportantWords
        .sort(() => 0.5 - Math.random())
        .slice(0, wordCount);

      if (wordsToBlank.length === 0 || wordsToBlank.join("|") === "") {
        // This will be caught by our main handler
        throw new Error("Offline algorithm failed: Text too short.");
      }

      const regex = new RegExp(
        `\\b(${wordsToBlank.join("|")})(?![a-zA-Z])`,
        "gi"
      );
      const finalAnswers = [];
      const generatedQuizText = text.replace(regex, (match) => {
        finalAnswers.push(match);
        return "[_____]";
      });

      // Return a successful quiz object
      return { quizText: generatedQuizText, answers: finalAnswers };
    } catch (err) {
      // Return an error object
      return { error: err.message };
    }
  };

  // STEP 3: Update handleGenerateQuiz with try...catch...fallback logic
  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuizText("");
    setAnswers([]);
    setUserInputs({});
    setScore(null);

    if (!rawText.trim()) {
      setError("Please paste some text to generate a quiz!");
      setIsLoading(false);
      return;
    }

    try {
      // --- AI ATTEMPT FIRST ---
      console.log("Attempting to generate quiz with AI...");
      const response = await fetch("http://localhost:3001/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textToQuiz: rawText }),
      });

      if (!response.ok) {
        // If server gives 429, 500, etc., throw an error to trigger the fallback
        throw new Error(`AI Server Failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (
        !data.quizText ||
        !Array.isArray(data.answers) ||
        data.answers.length === 0
      ) {
        // If AI gives bad data, throw an error to trigger the fallback
        throw new Error("AI returned invalid data.");
      }

      // --- AI SUCCESS ---
      console.log("AI quiz generated successfully!");
      setQuizText(data.quizText);
      setAnswers(data.answers);
    } catch (err) {
      // --- AI FAILED: RUN OFFLINE FALLBACK ---
      console.warn(`AI failed (${err.message}). Running offline fallback.`);

      // Run our original algorithm instead
      const offlineResult = generateOfflineAlgorithm(rawText);

      if (offlineResult.error) {
        // If *both* fail, show an error
        setError(offlineResult.error);
      } else {
        // --- OFFLINE SUCCESS ---
        console.log("Offline quiz generated successfully!");
        setQuizText(offlineResult.quizText);
        setAnswers(offlineResult.answers);
      }
    } finally {
      // This runs whether it succeeded or failed
      setIsLoading(false);
    }
  };

  // --- No changes to the functions below ---

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

  const handlePlayAgain = () => {
    setRawText("");
    setQuizText("");
    setAnswers([]);
    setUserInputs({});
    setScore(null);
    setIsLoading(false);
    setError(null);
  };

  // --- No changes to the JSX (return) below ---

  return (
    <div className="app-container">
      <header>
        <div className="header-top-bar">
          <div className="logo-area">
            {/* <span className="logo-text">LOGO</span> */}
            {/* <img
              src={"src/assets/logo.gif"}
              height={80}
              width={80}
              alt="Contextual Quizzer Logo"
              className="logo-image"
            /> */}
          </div>
          <div className="how-to-use" onClick={() => setShowHowTo(true)}>
            How to use{" "}
            <span role="img" aria-label="question mark">
              ❓
            </span>
          </div>{" "}
        </div>

        <h1>
          <div className="logo-area">
            {/* <span className="logo-text">LOGO</span> */}
            <img
              src={"src/assets/logobanner.png"}
              height={120}
              width={300}
              alt="Contextual Quizzer Logo"
              className="logo-image"
            />
          </div>
          {/* Contextual Quizzer{" "} */}
          {/* <span role="img" aria-label="brain emoji">
            🧠
          </span>
          <span role="img" aria-label="swirl emoji">
            🌀
          </span> */}
        </h1>
        <p>Turn any text into an interactive Quiz instantly.</p>
      </header>

      <main>
        <div className="textarea-wrapper">
          <TextArea rawText={rawText} onTextChange={setRawText} />
        </div>

        <div className="generate-quiz-btn-wrapper">
          <button
            className="generate-button"
            onClick={handleGenerateQuiz}
            disabled={isLoading || !rawText.trim()}
          >
            {isLoading ? "🧠 AI is thinking..." : "Generate Quiz!"}
          </button>
        </div>

        {isLoading && (
          <div className="loading-message">Generating your quiz...</div>
        )}
        {error && <div className="error-message">{error}</div>}

        {quizText && !isLoading && !error && (
          <>
            <div className="quiz-area-header">
              <h3>Here's Your Quiz! Don't do cheating 😉</h3>
              <span className="star-decoration">⭐</span>
              <span className="star-decoration right">⭐</span>
            </div>
            <QuizArea
              quizText={quizText}
              answers={answers}
              userInputs={userInputs}
              score={score}
              onAnswerChange={handleAnswerChange}
              onCheckAnswers={handleCheckAnswers}
            />

            {score !== null && (
              <div className="score-feedback-area">
                <div className="score-display">
                  <span className="cloud-emoji">☁️</span>
                  Score &rarr; {score} / {answers.length}
                  <span className="trophy-emoji">🏆</span>
                </div>
                {score === answers.length ? (
                  <p className="good-score-message">Good score! 🎉</p>
                ) : (
                  <p className="not-good-score-message">
                    Not a good score... Keep trying! 🤔
                  </p>
                )}
                <button className="play-again-button" onClick={handlePlayAgain}>
                  Play Again! 🚀
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer>
        <p>
          Built with ❤️ by jatt1{" "}
          <span className="footer-quizzer">Contextual Quizzer</span>
        </p>
        <span className="footer-stars">✨⭐✨</span>
      </footer>
      {showHowTo && <HowToModal onClose={() => setShowHowTo(false)} />}
    </div>
  );
}

export default App;

// import React, { useState } from "react";

// // NEW: Make sure you have this import for your component
// import TextArea from "./components/TextArea";
// import QuizArea from "./components/QuizArea";

// // NEW: Import your SVG files
// // You need 'vite-plugin-svgr' for this to work like a component
// // A simpler way is just to use them as image paths (see below)
// // For simplicity, let's just use CSS for the pencil for now.

// import "./App.css";

// function App() {
//   const [rawText, setRawText] = useState("");
//   const [quizText, setQuizText] = useState("");
//   const [answers, setAnswers] = useState([]);
//   const [userInputs, setUserInputs] = useState({});
//   const [score, setScore] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleGenerateQuiz = async () => {
//     setIsLoading(true);
//     setError(null);
//     setQuizText("");
//     setAnswers([]);
//     setUserInputs({});
//     setScore(null);

//     try {
//       if (!rawText.trim()) {
//         setError("Please paste some text to generate a quiz!");
//         setIsLoading(false);
//         return;
//       }
//       const response = await fetch("http://localhost:3001/generate-quiz", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ textToQuiz: rawText }),
//       });

//       if (!response.ok) {
//         throw new Error("Something went wrong with the AI server.");
//       }

//       const data = await response.json();

//       if (
//         !data.quizText ||
//         !Array.isArray(data.answers) ||
//         data.answers.length === 0
//       ) {
//         setError(
//           "AI couldn't generate a meaningful quiz from this text. Try more detailed notes!"
//         );
//         setIsLoading(false);
//         return;
//       }

//       setQuizText(data.quizText);
//       setAnswers(data.answers);
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAnswerChange = (index, value) => {
//     setUserInputs((prevInputs) => ({
//       ...prevInputs,
//       [index]: value,
//     }));
//   };

//   const handleCheckAnswers = () => {
//     let correctCount = 0;
//     answers.forEach((correctAnswer, index) => {
//       const userAnswer = (userInputs[index] || "").trim();
//       if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
//         correctCount++;
//       }
//     });
//     setScore(correctCount);
//   };

//   // NEW: Function to reset the app for "Play Again"
//   const handlePlayAgain = () => {
//     setRawText("");
//     setQuizText("");
//     setAnswers([]);
//     setUserInputs({});
//     setScore(null);
//     setIsLoading(false);
//     setError(null);
//   };

//   return (
//     <div className="app-container">
//       <header>
//         <div className="header-top-bar">
//           <div className="logo-area">
//             <span className="logo-text">LOGO</span>
//           </div>
//           <div className="how-to-use">
//             How to use{" "}
//             <span role="img" aria-label="question mark">
//               ❓
//             </span>
//           </div>
//         </div>

//         <h1>
//           Contextual Quizzer{" "}
//           <span role="img" aria-label="brain emoji">
//             🧠
//           </span>
//           <span role="img" aria-label="swirl emoji">
//             🌀
//           </span>
//         </h1>
//         <p>Turn any text into an interactive Quiz instantly.</p>
//       </header>

//       <main>
//         <div className="textarea-wrapper">
//           {/* This is the controlled component.
//             We pass the current text *value* down to it.
//             We pass the *function to change the text* down to it.
//           */}
//           <TextArea rawText={rawText} onTextChange={setRawText} />
//         </div>

//         <div className="generate-quiz-btn-wrapper">
//           <button
//             className="generate-button"
//             onClick={handleGenerateQuiz}
//             disabled={isLoading || !rawText.trim()} // Disable if no text
//           >
//             {isLoading ? "🧠 AI is thinking..." : "Generate Quiz!"}
//           </button>
//         </div>

//         {isLoading && (
//           <div className="loading-message">Generating your quiz...</div>
//         )}
//         {error && <div className="error-message">{error}</div>}

//         {/* Only show quiz if generated and not loading/error */}
//         {quizText && !isLoading && !error && (
//           <>
//             <div className="quiz-area-header">
//               <h3>Here's Your Quiz! Don't do cheating 😉</h3>
//               <span className="star-decoration">⭐</span>
//               <span className="star-decoration right">⭐</span>
//             </div>
//             <QuizArea
//               quizText={quizText}
//               answers={answers}
//               userInputs={userInputs}
//               score={score}
//               onAnswerChange={handleAnswerChange}
//               onCheckAnswers={handleCheckAnswers}
//             />

//             {/* Only show score feedback if graded */}
//             {score !== null && (
//               <div className="score-feedback-area">
//                 <div className="score-display">
//                   <span className="cloud-emoji">☁️</span>
//                   Score &rarr; {score} / {answers.length}
//                   <span className="trophy-emoji">🏆</span>
//                 </div>
//                 {score === answers.length ? (
//                   <p className="good-score-message">Good score! 🎉</p>
//                 ) : (
//                   <p className="not-good-score-message">
//                     Not a good score... Keep trying! 🤔
//                   </p>
//                 )}
//                 <button className="play-again-button" onClick={handlePlayAgain}>
//                   Play Again! 🚀
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </main>

//       <footer>
//         <p>
//           Built with ❤️ by jatt1{" "}
//           <span className="footer-quizzer">Contextual Quizzer</span>
//         </p>
//         <span className="footer-stars">✨⭐✨</span>
//       </footer>
//     </div>
//   );
// }

// export default App;
