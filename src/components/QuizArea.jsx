import React from "react";

function QuizArea({
  quizText,
  answers,
  userInputs,
  score,
  onAnswerChange,
  onCheckAnswers,
}) {
  // This is where the magic happens!
  // 1. We split the quizText string by our blank marker '[_____]'
  //    This gives us an array of text snippets.
  //    e.g., "The [_____] is the [_____]."
  //    becomes: ["The ", " is the ", "."]
  const quizParts = quizText.split("[_____]");

  // We will build our new quiz display here
  const renderedQuiz = [];

  // 2. We loop through the text snippets
  quizParts.forEach((part, index) => {
    // Add the text snippet
    // The 'key' is a React requirement for lists
    renderedQuiz.push(<span key={`part-${index}`}>{part}</span>);

    // 3. If this is NOT the last snippet, it means
    //    there was a [_____] after it. So, we add an input box.
    if (index < answers.length) {
      renderedQuiz.push(
        <input
          key={`input-${index}`}
          type="text"
          className="quiz-input"
          // We check the score to see if we should style it
          style={{
            // If a score exists...
            borderColor:
              score !== null
                ? //...and the answer is right (lowercase)...
                  (userInputs[index] || "").trim().toLowerCase() ===
                  answers[index]?.toLowerCase()
                  ? "green" // Make border green
                  : "red" // Make border red
                : "#aaa", // Otherwise, default border
          }}
          // This "controls" the input, filling it with user's text
          value={userInputs[index] || ""}
          // This calls our function in App.jsx to save the text
          onChange={(e) => onAnswerChange(index, e.target.value)}
        />
      );
    }
  });

  return (
    <div className="quiz-container">
      <h3>Your Contextual Quiz:</h3>
      <div className="quiz-output">
        {!quizText ? (
          <p className="placeholder">
            Your quiz will appear here after you generate it...
          </p>
        ) : (
          // We render our new array of text and inputs
          <div className="interactive-quiz">{renderedQuiz}</div>
        )}

        {/* Only show the "Check" button if there's a quiz */}
        {answers.length > 0 && (
          <div className="check-answers-container">
            <button className="check-button" onClick={onCheckAnswers}>
              Check My Answers!
            </button>

            {/* Only show the score after it's been calculated */}
            {score !== null && (
              <h4 className="score">
                Your Score: {score} / {answers.length}
              </h4>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizArea;
