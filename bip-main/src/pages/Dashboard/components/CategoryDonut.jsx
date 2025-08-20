import { useState, useEffect } from 'react';
import { BarChart2, RefreshCcw } from 'lucide-react';
import { getCategoryData } from '../DashboardData';

const CategoryDonut = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryData();

    // Refresh data periodically to simulate real-time updates
    const intervalId = setInterval(loadCategoryData, 90000);
    return () => clearInterval(intervalId);
  }, []);

  const loadCategoryData = async () => {
    setLoading(true);
    try {
      const data = await getCategoryData();
      setCategoryData(data);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCategoryData();
  };

  // Calculate total for the totals section
  const totalTransactions = categoryData.reduce((sum, category) => sum + (category.count || 0), 0);
  
  // Sort data by count (descending)
  const sortedData = [...categoryData].sort((a, b) => b.count - a.count);
  
  // Calculate max value for scaling bar widths
  const maxCount = Math.max(...sortedData.map(item => item.count || 0), 1);

  return (
    <div className="dashboard-card categories-card">
      <div className="card-header">
        <div className="card-title">
          <BarChart2 size={18} />
          <h2>Transaction Distribution</h2>
        </div>
        <div className="card-actions">
          <button 
            className={`card-action-btn ${loading ? 'loading' : ''}`} 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw size={16} className={loading ? 'rotating' : ''} />
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="category-bars-container">
          {loading ? (
            <div className="loading-spinner">
              <RefreshCcw size={24} className="rotating" />
            </div>
          ) : (
            <>
              <div className="category-total">
                <span className="total-label">Total Transactions:</span>
                <span className="total-value">{totalTransactions.toLocaleString()}</span>
              </div>
              <div className="category-bars">
                {sortedData.map(category => (
                  <div key={category.name} className="category-bar-item">
                    <div className="category-bar-label">
                      <div className="category-color" style={{ backgroundColor: category.color }}></div>
                      <div className="category-name">{category.name}</div>
                    </div>
                                      <div className="category-bar-wrapper">
                    <div 
                      className="category-bar" 
                      style={{ 
                        width: `${(category.count / maxCount) * 100}%`,
                        backgroundColor: category.color
                      }}
                    >
                      <span className="category-inline-count">{category.count?.toLocaleString() || 0}</span>
                    </div>
                    <div className="category-percentage">{category.value}%</div>
                  </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDonut;