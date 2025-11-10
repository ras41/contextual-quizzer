// src/components/HowToModal.jsx

import React from "react";
import "./HowToModal.css"; // We will create this CSS file next

function HowToModal({ onClose }) {
  return (
    // The "backdrop" is the dark transparent background
    // We make it close the modal when clicked
    <div className="modal-backdrop" onClick={onClose}>
      {/* This stops the modal from closing when you click *inside* it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            How to Use{" "}
            <span role="img" aria-label="lightbulb">
              💡
            </span>
          </h2>
          <button className="modal-close-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <ol>
            <li>
              <strong>Paste Your Text:</strong> Find any study notes, article,
              or text and paste it into the "Your text goes here..." box.
            </li>
            <li>
              <strong>Generate Quiz:</strong> Hit the "Generate Quiz!" button.
              Our app will try to use **Gemini AI** for the best quiz. If the AI
              is busy, our **offline algorithm** takes over instantly so you're
              never stuck!
            </li>
            <li>
              <strong>Fill in the Blanks:</strong> Type your answers directly
              into the `[_____]` boxes that appear.
            </li>
            <li>
              <strong>Check Your Score:</strong> Click "Check My Answers!" to
              get your instant score. Correct answers will be highlighted.
            </li>
            <li>
              <strong>Play Again:</strong> Use the "Play Again!" button to clear
              the board and try a new text.
            </li>
          </ol>
        </div>

        <div className="modal-footer">
          <button className="modal-close-btn" onClick={onClose}>
            Got it, let's go! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowToModal;
