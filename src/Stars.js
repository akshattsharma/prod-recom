import React, { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function Stars({ value = 0, onChange, readOnly = false, label = "Rating" }) {
  const [hover, setHover] = useState(0);

  if (readOnly) {
    return (
      <span className="stars readonly" role="img" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= value ? "on" : ""}>
            {n <= value ? <FaStar /> : <FaRegStar />}
          </span>
        ))}
      </span>
    );
  }

  const shown = hover || value;
  return (
    <div className="stars" role="group" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= shown ? "on" : ""}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={n === value}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
        >
          {n <= shown ? <FaStar /> : <FaRegStar />}
        </button>
      ))}
    </div>
  );
}
