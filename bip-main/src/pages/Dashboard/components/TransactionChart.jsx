import { useState, useEffect } from 'react';
import { BarChart2, RefreshCcw, PieChart, ArrowUp, ArrowDown } from 'lucide-react';
import { getTransactionChartData, getCategoryData } from '../DashboardData';

const TransactionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    loadChartData();

    // Refresh data every 2 minutes to simulate real-time updates
    const intervalId = setInterval(loadChartData, 30000); // 5 second
    return () => clearInterval(intervalId);
  }, []);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const data = await getTransactionChartData();
      setChartData(data);
      
      // Also load category data
      const categories = await getCategoryData();
      setCategoryData(categories);
    } catch (error) {
      console.error('Error loading transaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadChartData();
  };

  // Find the maximum value for scaling
  const maxValue = Math.max(...chartData.map(item => item.count), 1);
  
  // Calculate growth percentage between days
  const calculateGrowth = () => {
    if (chartData.length < 2) return { value: 0, trend: 'neutral' };
    const latest = chartData[0].count;
    const previous = chartData[1].count;
    const growth = ((latest - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      trend: growth >= 0 ? 'positive' : 'negative'
    };
  };
  
  const growth = calculateGrowth();

  return (
    <div className="dashboard-card transactions-card">
      <div className="card-header">
        <div className="card-title">
          <BarChart2 size={18} />
          <h2>Daily Transaction Comparison</h2>
        </div>
        <div className="card-actions">
          <button 
            className="card-action-btn toggle-view"
            onClick={() => setShowCategories(!showCategories)}
            title={showCategories ? "Show daily comparison" : "Show categories"}
          >
            {showCategories ? <BarChart2 size={16} /> : <PieChart size={16} />}
          </button>
          <button 
            className={`card-action-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh data"
          >
            <RefreshCcw size={16} className={loading ? 'rotating' : ''} />
          </button>
        </div>
      </div>
      <div className="card-content">
        {loading ? (
          <div className="loading-spinner">
            <RefreshCcw size={24} className="rotating" />
          </div>
        ) : showCategories ? (
          <div className="transaction-categories-view">
            <div className="transaction-categories-header">
              <h3>Transaction Categories</h3>
              <div className="transaction-categories-total">
                Total: <span>{categoryData.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="transaction-categories-grid">
              {categoryData.map((category, index) => (
                <div key={index} className="transaction-category-card" style={{ borderColor: category.color }}>
                  <div className="category-card-header" style={{ backgroundColor: category.color }}>
                    {category.name}
                  </div>
                  <div className="category-card-content">
                    <div className="category-card-count">{category.count.toLocaleString()}</div>
                    <div className="category-card-percentage">{category.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="transaction-comparison-view">
            <div className="transaction-growth">
              <div className="growth-label">Growth</div>
              <div className={`growth-value ${growth.trend}`}>
                {growth.trend === 'positive' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {growth.value}%
              </div>
            </div>
            <div className="day-transactions-chart">
              {chartData.map((day, index) => (
                <div key={index} className="day-bar-container">
                  <div className="day-name" title={day.label}>
                    {day.label}
                  </div>
                  <div className="day-bar-wrapper">
                    <div 
                      className="day-bar"
                      style={{ 
                        width: `${(day.count / maxValue) * 100}%`,
                        backgroundColor: getBarColor(index)
                      }}
                    >
                      <span className="day-count">{day.count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}          
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to get different colors for bars
const getBarColor = (index) => {
  const colors = [
    '#FEA000', // Orange
    '#CF3D58', // Red
    '#BC7EFF', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#C95A94', // Pink
    '#6B7280', // Gray
    '#F59E0B'  // Amber
  ];
  
  return colors[index % colors.length];
};

export default TransactionChart;