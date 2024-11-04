import React from 'react';

// star SVG
const StarSVG = ({ fillPercentage }) => {
  const clipPathId = `clip-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width="20" height="20" viewBox="0 0 25 25">
      <defs>
        <clipPath id={clipPathId}>
          <rect width={`${fillPercentage * 25}`} height="25" />
        </clipPath>
      </defs>
      <path
        d="M12 .587l3.09 6.26L22 8.174l-5 4.867 1.18 6.873L12 17.021l-6.18 3.893L7 13.04 2 8.174l6.91-1.327L12 .587z"
        clipPath={`url(#${clipPathId})`}
        fill="#FFD700"
      />
      <path
        d="M12 .587l3.09 6.26L22 8.174l-5 4.867 1.18 6.873L12 17.021l-6.18 3.893L7 13.04 2 8.174l6.91-1.327L12 .587z"
        fill="none"
        stroke="#CCCCCC"
      />
    </svg>
  );
};

// display star of 5
const DisplayRating = ({ rating, style }) => {
  const fullStars = Math.floor(rating);
  const partialFill = rating % 1;
  const emptyStars = 5 - fullStars - (partialFill > 0 ? 1 : 0);

  return (
    <div style={{ display: 'flex', ...style }}>
      {[...Array(fullStars)].map((_, i) => (
        <StarSVG key={`full-${i}`} fillPercentage={1} />
      ))}
      {partialFill > 0 && <StarSVG key="partial" fillPercentage={partialFill} />}
      {[...Array(emptyStars)].map((_, i) => (
        <StarSVG key={`empty-${i}`} fillPercentage={0} />
      ))}
    </div>
  );
};

export default DisplayRating;
