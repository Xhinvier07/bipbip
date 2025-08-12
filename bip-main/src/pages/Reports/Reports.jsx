import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  Search,
  BarChart,
  CalendarRange,
  MessageSquare,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ListFilter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ReviewCard from './components/ReviewCard';
import CSATSummary from './components/CSATSummary';
import { 
  customerReviews, 
  cities, 
  branchNames, 
  sentimentLabels,
  getSentimentCategory
} from './ReportsData';
import './Reports.css';

const Reports = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [sentimentFilter, setSentimentFilter] = useState({
    positive: true,
    neutral: true,
    negative: true
  });
  const [filteredReviews, setFilteredReviews] = useState(customerReviews);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;
  
  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [currentPage]);

  const applyFilters = () => {
    let filtered = [...customerReviews];
    
    // Filter by city
    if (selectedCity !== 'all') {
      filtered = filtered.filter(review => review.city === selectedCity);
    }
    
    // Filter by branch
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(review => review.branchName === selectedBranch);
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment.toLowerCase().includes(query) ||
        review.customerName.toLowerCase().includes(query) ||
        review.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(review => new Date(review.date) >= new Date(dateRange.from));
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(review => new Date(review.date) <= new Date(dateRange.to));
    }
    
    // Filter by sentiment
    filtered = filtered.filter(review => {
      const sentiment = getSentimentCategory(review.rating).toLowerCase();
      return sentimentFilter[sentiment.toLowerCase()];
    });
    
    setFilteredReviews(filtered);
  };

  const handleSentimentFilterChange = (sentiment) => {
    setSentimentFilter(prev => ({
      ...prev,
      [sentiment]: !prev[sentiment]
    }));
  };

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedBranch('all');
    setSearchQuery('');
    setDateRange({ from: '', to: '' });
    setSentimentFilter({
      positive: true,
      neutral: true,
      negative: true
    });
    setCurrentPage(1);
    setFilteredReviews(customerReviews);
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="reports-page">
      {/* No background with DotGrid as requested */}
      
      <div className="reports-content">
        <div className="reports-header">
          <h1>Customer Satisfaction Reports</h1>
          <button 
            className="filter-toggle" 
            onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FEA000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(254, 160, 0, 0.2)'
            }}
          >
            <SlidersHorizontal size={16} />
            Filters
            {isFiltersCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        
        {/* Filters Section */}
        <div className={`reports-filters ${isFiltersCollapsed ? 'collapsed' : ''}`}>
          <div className="filters-title">
            <h2>
              <ListFilter size={16} />
              Advanced Filters
            </h2>
            <span style={{ fontSize: '13px', color: '#888' }}>{filteredReviews.length} reviews match your criteria</span>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>
                <MapPin size={14} />
                Branch City
              </label>
              <select 
                className="filter-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="all">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>
                <Building size={14} />
                Branch Name
              </label>
              <select 
                className="filter-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branchNames.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>
                <Search size={14} />
                Search Reviews
              </label>
              <input 
                type="text"
                className="filter-input"
                placeholder="Search by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filters-row">
            <div className="filter-group">
              <label>
                <CalendarRange size={14} />
                Date Range
              </label>
              <div className="date-range-container">
                <input 
                  type="date"
                  className="filter-input"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <span>to</span>
                <input 
                  type="date"
                  className="filter-input"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>
                <MessageSquare size={14} />
                Sentiment
              </label>
              <div className="sentiment-filter">
                <div 
                  className={`sentiment-chip sentiment-positive ${sentimentFilter.positive ? 'active' : ''}`}
                  onClick={() => handleSentimentFilterChange('positive')}
                >
                  <div className="sentiment-icon"></div>
                  <CheckCircle size={14} />
                  Positive
                </div>
                
                <div 
                  className={`sentiment-chip sentiment-neutral ${sentimentFilter.neutral ? 'active' : ''}`}
                  onClick={() => handleSentimentFilterChange('neutral')}
                >
                  <div className="sentiment-icon"></div>
                  <HelpCircle size={14} />
                  Neutral
                </div>
                
                <div 
                  className={`sentiment-chip sentiment-negative ${sentimentFilter.negative ? 'active' : ''}`}
                  onClick={() => handleSentimentFilterChange('negative')}
                >
                  <div className="sentiment-icon"></div>
                  <AlertCircle size={14} />
                  Negative
                </div>
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="filter-button reset-btn" onClick={resetFilters}>
              <RefreshCcw size={16} />
              Reset Filters
            </button>
            <button className="filter-button apply-btn" onClick={applyFilters}>
              <Filter size={16} />
              Apply Filters
            </button>
          </div>
        </div>
        
        {/* CSAT Summary Section */}
        <CSATSummary />
        
        {/* Customer Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="reviews-header">
            <h2>
              <MessageSquare size={20} />
              Customer Reviews
              {filteredReviews.length > 0 && (
                <span className="review-count">
                  ({filteredReviews.length} reviews found)
                </span>
              )}
            </h2>
            <div className="reviews-view-options">
              <div className="view-option active">
                <BarChart size={16} />
                All Reviews
              </div>
              <div className="view-option">
                <Clock size={16} />
                Recent
              </div>
            </div>
          </div>
          
          {currentReviews.length === 0 ? (
            <div className="no-results">
              <h3>No reviews found</h3>
              <p>Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {currentReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {filteredReviews.length > reviewsPerPage && (
            <div className="pagination">
              <button 
                className="pagination-arrow" 
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                // Show ellipsis for many pages
                if (totalPages > 5) {
                  if (
                    i === 0 || 
                    i === totalPages - 1 || 
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (i === 1 && currentPage > 3) {
                    return <span key="ellipsis1">...</span>;
                  } else if (i === totalPages - 2 && currentPage < totalPages - 2) {
                    return <span key="ellipsis2">...</span>;
                  }
                  return null;
                } else {
                  return (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                }
              })}
              
              <button 
                className="pagination-arrow" 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;