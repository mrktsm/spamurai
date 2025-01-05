import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const StarRating = () => {
  const [rating, setRating] = useState<number>(3);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return (
    <div className="rating-group inline-flex items-center">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isSelected = starValue <= rating;
        const isHovered = starValue <= (hoveredRating || rating);

        return (
          <label
            key={starValue}
            className={`cursor-pointer p-1 text-xs ${
              isHovered ? "text-rose-500" : "text-rose-300"
            }`}
            onMouseEnter={() => setHoveredRating(starValue)}
            onMouseLeave={() => setHoveredRating(null)}
          >
            <input
              type="radio"
              className="hidden"
              value={starValue}
              checked={isSelected}
              onChange={() => handleRatingChange(starValue)}
            />
            <FontAwesomeIcon
              icon={faStar}
              className={`${
                isHovered ? "text-rose-500" : "text-rose-300"
              } text-xs`}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
