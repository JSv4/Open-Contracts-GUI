import React from "react";

export const HighlightPopup = ({ comment }) =>
    comment.text ? (
    <div className="Highlight__popup">
        {comment.emoji} {comment.text}
    </div>
) : null;