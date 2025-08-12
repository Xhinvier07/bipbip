import { BarChart, Sparkles } from 'lucide-react';
import { csatSummary, getSentimentColor } from '../ReportsData';

const CSATSummary = () => {
  const { 
    overallScore, 
    totalReviews,
    positiveFeedback,
    neutralFeedback,
    negativeFeedback,
    topPerformer,
    needsImprovement,
    commonTags
  } = csatSummary;

  const positivePercentage = Math.round((positiveFeedback / totalReviews) * 100);
  const neutralPercentage = Math.round((neutralFeedback / totalReviews) * 100);
  const negativePercentage = Math.round((negativeFeedback / totalReviews) * 100);

  return (
    <div className="csat-summary-container">
      {/* Overall CSAT Score */}
      <div className="csat-card">
        <div className="csat-card-header">
          <h2>Overall Customer Satisfaction</h2>
          <BarChart size={18} />
        </div>
        <div className="csat-score">
          <div className="score-circle" style={{ backgroundColor: getSentimentColor(overallScore) }}>
            <span>{overallScore}<span className="score-percentage">%</span></span>
          </div>
          <span className="score-label">Based on {totalReviews} reviews</span>
        </div>
        <div className="feedback-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">
              <span className="breakdown-dot positive-dot"></span>
              Positive
            </span>
            <span className="breakdown-value">{positivePercentage}%</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">
              <span className="breakdown-dot neutral-dot"></span>
              Neutral
            </span>
            <span className="breakdown-value">{neutralPercentage}%</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">
              <span className="breakdown-dot negative-dot"></span>
              Negative
            </span>
            <span className="breakdown-value">{negativePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="csat-card">
        <div className="csat-card-header">
          <h2>Branch Performance</h2>
          <Sparkles size={18} />
        </div>

        <div className="branch-performance">
          <div className="performance-card">
            <h4>Top Performer</h4>
            <div className="branch-rating">
              <div>
                <div className="branch-name">{topPerformer.branchName}</div>
                <div className="branch-city">{topPerformer.city}</div>
              </div>
              <div className="branch-score" style={{ color: getSentimentColor(topPerformer.score) }}>
                {topPerformer.score}%
              </div>
            </div>
          </div>

          <div className="performance-card">
            <h4>Needs Improvement</h4>
            <div className="branch-rating">
              <div>
                <div className="branch-name">{needsImprovement.branchName}</div>
                <div className="branch-city">{needsImprovement.city}</div>
              </div>
              <div className="branch-score" style={{ color: getSentimentColor(needsImprovement.score) }}>
                {needsImprovement.score}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Tags */}
      <div className="csat-card">
        <div className="csat-card-header">
          <h2>Common Customer Feedback</h2>
          <BarChart size={18} />
        </div>

        <h4 style={{ margin: '0 0 8px', fontSize: '14px', color: '#00BFA6' }}>Positive Feedback</h4>
        <div className="tags-cloud">
          {commonTags.positive.map((tag, index) => (
            <span key={index} className="tag positive-tag">{tag}</span>
          ))}
        </div>

        <h4 style={{ margin: '16px 0 8px', fontSize: '14px', color: '#FEA000' }}>Neutral Feedback</h4>
        <div className="tags-cloud">
          {commonTags.neutral.map((tag, index) => (
            <span key={index} className="tag neutral-tag">{tag}</span>
          ))}
        </div>

        <h4 style={{ margin: '16px 0 8px', fontSize: '14px', color: '#CF3D58' }}>Negative Feedback</h4>
        <div className="tags-cloud">
          {commonTags.negative.map((tag, index) => (
            <span key={index} className="tag negative-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CSATSummary;