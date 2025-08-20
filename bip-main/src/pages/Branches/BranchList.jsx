import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Filter } from 'lucide-react';
import { cities } from '../Reports/ReportsData';

const BranchList = ({ branches, totalCount, selectedBranch, onSelectBranch, onLoadMore, hasMore }) => {
  const [showCityFilter, setShowCityFilter] = useState(false);
  // Use predefined cities list from ReportsData.js
  const availableCities = ['All Cities', ...cities];
  
  const toggleCityFilter = () => {
    setShowCityFilter(!showCityFilter);
  };
  
  const handleBranchClick = (branch) => {
    onSelectBranch(branch);
  };
  
  const handleCityFilter = (city) => {
    // Find parent component's city filter handler
    const parentFilterHandler = window.handleCityFilter;
    if (parentFilterHandler && typeof parentFilterHandler === 'function') {
      parentFilterHandler(city === 'All Cities' ? 'all' : city);
    }
    setShowCityFilter(false);
  };

  return (
    <div className="branch-list">
      <div className="branch-list-title">
        <h3>Branches <span className="branch-count">({totalCount})</span></h3>
        <div className="branch-filter" onClick={toggleCityFilter}>
          <Filter size={16} />
        </div>
        
        {showCityFilter && (
          <div className="city-filter-dropdown">
            <div className="city-filter-title">Filter by City</div>
            <div className="city-filter-options">
              {availableCities.map(city => (
                <div 
                  key={city} 
                  className="city-option" 
                  onClick={() => handleCityFilter(city)}
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="branch-list-container">
        <div className="branch-list-scrollable">
          {branches.length === 0 ? (
            <div className="no-branches">
              <p>No branches found</p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {branches.map((branch, index) => (
                  <motion.div 
                    key={`${branch.city}-${branch.branch_name}-${index}`}
                    className={`branch-item ${selectedBranch && selectedBranch.branch_name === branch.branch_name ? 'active' : ''}`}
                    onClick={() => handleBranchClick(branch)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <div className="branch-marker">
                      <MapPin size={22} strokeWidth={1.8} className={selectedBranch && selectedBranch.branch_name === branch.branch_name ? 'marker-active' : ''} />
                    </div>
                    <div className="branch-info">
                      <h4>{branch.branch_name}</h4>
                      <p className="branch-city">{branch.city}</p>
                      <p className="branch-address">{branch.address}</p>

                    </div>
                    <div className="branch-item-arrow">
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {hasMore && (
                <div className="load-more-container-inner">
                  <motion.button 
                    className="load-more-btn"
                    onClick={onLoadMore}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Load More
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchList;