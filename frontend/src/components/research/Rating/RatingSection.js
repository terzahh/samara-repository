import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import './RatingSection.css';

const RatingSection = ({
    userRating,
    averageRating,
    totalRatings,
    onRate,
    isAuthenticated,
    isRating
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (rating) => {
        if (isAuthenticated) {
            setHoverRating(rating);
        }
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = (rating) => {
        if (isAuthenticated && !isRating) {
            onRate(rating);
        }
    };

    const renderStars = () => {
        const stars = [];
        // If hovering, show hover state
        // If not hovering, show user's rating (if rated) OR average rating
        // Wait, requirement says "Every user can rate... edit/change... Average rating... Total number"
        // Usually, you show the User's rating if they have one, otherwise empty stars or similar for input.
        // AND show the Average separately.

        // Let's allow the stars to represent the INPUT.
        // And display the average textually next to it.

        const displayRating = hoverRating > 0 ? hoverRating : userRating;

        for (let i = 1; i <= 5; i++) {
            let icon = faStarRegular;
            let className = 'rating-star';

            if (i <= displayRating) {
                icon = faStarSolid;
                className += ' filled';
            }

            if (isAuthenticated) {
                className += ' interactive';
            } else {
                className += ' disabled';
            }

            stars.push(
                <FontAwesomeIcon
                    key={i}
                    icon={icon}
                    className={className}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(i)}
                />
            );
        }
        return stars;
    };

    return (
        <div className="rating-section">
            <div className="rating-stars mb-2">
                {renderStars()}
                <span className="ms-2 text-muted rating-status">
                    {isRating ? 'Saving...' : (!isAuthenticated ? 'Login to Rate this' : (userRating > 0 ? 'Your rating' : 'Rate this'))}
                </span>
            </div>

            <div className="rating-summary">
                <div className="d-flex align-items-center">
                    <span className="h4 mb-0 me-2 text-warning font-weight-bold">
                        {Number(averageRating).toFixed(1)}
                    </span>
                    <div className="text-muted small">
                        Average Rating
                        <br />
                        ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                    </div>
                </div>
            </div>

            {!isAuthenticated && (
                <div className="mt-2 text-muted small fst-italic">
                    Log in to rate this research.
                </div>
            )}
        </div>
    );
};

export default RatingSection;
