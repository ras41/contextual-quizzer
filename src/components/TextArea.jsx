import React from "react";

// This component's job is to get the text from the user.
// It receives a function (onTextChange) from its parent (App.jsx)
// and calls it every time the user types.
function TextArea({ onTextChange }) {
  return (
    <div className="textarea-container">
      <h3>Paste Your Study Notes Here:</h3>
      <textarea
        className="textarea-input"
        placeholder="Paste your text from an article, textbook, or notes..."
        // When the text in this box changes...
        onChange={(e) => onTextChange(e.target.value)}
      />
    </div>
  );
}

export default TextArea;
