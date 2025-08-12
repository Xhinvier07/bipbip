import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

const BranchList = ({ branches, totalCount, selectedBranch, onSelectBranch, onLoadMore, hasMore }) => {
  const handleBranchClick = (branch) => {
    onSelectBranch(branch);
  };

  return (
    <div className="branch-list">
      <div className="branch-count">
        Showing {branches.length} of {totalCount} branches
      </div>
      
      <div className="branch-list-scroll-container">
        {branches.length === 0 ? (
          <div className="no-branches">
            <p>No branches found</p>
          </div>
        ) : (
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
                  <MapPin size={18} className={selectedBranch && selectedBranch.branch_name === branch.branch_name ? 'marker-active' : ''} />
                </div>
                <div className="branch-info">
                  <h3 className="branch-name">{branch.branch_name}</h3>
                  <div className="branch-city">{branch.city}</div>
                  <div className="branch-address">{branch.address}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={onLoadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default BranchList;