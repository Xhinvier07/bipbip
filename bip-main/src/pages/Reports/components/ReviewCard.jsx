import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { getSentimentColor, getSentimentCategory } from '../ReportsData';

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const sentimentColor = getSentimentColor(review.rating);
  const sentimentCategory = getSentimentCategory(review.rating);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="review-card">
      <div className="review-rating-stripe" style={{ backgroundColor: sentimentColor }}></div>
      
      <div className="review-header">
        <div className="reviewer-info">
          <h3 className="customer-id">{review.customerId}</h3>
          <div className="branch-info">
            <strong>{review.branchName}</strong>, {review.city}
          </div>
          <div className="review-date">{formatDate(review.date)}</div>
        </div>
                  <div className="review-rating" style={{ backgroundColor: sentimentColor }}>
            <span>{review.rating}<span className="score-percentage">%</span></span>
          </div>
      </div>

      <div className={`review-comment ${expanded ? 'expanded' : ''}`}>
        {review.comment}
      </div>

      {review.tags && review.tags.length > 0 && (
        <div className="review-tags">
          {review.tags.map((tag, index) => (
            <span key={index} className="review-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="review-actions">
        <div className="sentiment-label" style={{ color: sentimentColor }}>
          <MessageSquare size={14} style={{ marginRight: '4px' }} />
          {sentimentCategory}
        </div>

        <button className="read-more-btn" onClick={toggleExpanded}>
          {expanded ? (
            <>
              Show Less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Read More <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;