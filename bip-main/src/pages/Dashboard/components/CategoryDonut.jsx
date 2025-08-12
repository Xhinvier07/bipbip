import { PieChart, RefreshCcw } from 'lucide-react';
import { categoryData } from '../DashboardData';

const CategoryDonut = () => {
  return (
    <div className="dashboard-card categories-card">
      <div className="card-header">
        <div className="card-title">
          <PieChart size={18} />
          <h2>Transaction Categories</h2>
        </div>
        <div className="card-actions">
          <button className="card-action-btn">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="donut-chart-container">
          <div className="donut-chart">
            <svg width="100%" height="100%" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f3f3f3" strokeWidth="5"></circle>
              
              {/* Calculate stroke-dasharray and stroke-dashoffset for each category */}
              {categoryData.map((category, index) => {
                const previousPercents = categoryData.slice(0, index).reduce((acc, curr) => acc + curr.value, 0);
                return (
                  <circle 
                    key={category.name}
                    cx="21" 
                    cy="21" 
                    r="15.91549430918954" 
                    fill="transparent" 
                    stroke={category.color}
                    strokeWidth="5"
                    strokeDasharray={`${category.value} ${100 - category.value}`}
                    strokeDashoffset={`${100 - previousPercents}`}
                  ></circle>
                );
              })}
              
              <g className="donut-text">
                <text x="50%" y="50%" className="donut-number">
                  {categoryData.length}
                </text>
                <text x="50%" y="50%" className="donut-label">
                  Categories
                </text>
              </g>
            </svg>
          </div>
          <div className="category-legend">
            {categoryData.map(category => (
              <div key={category.name} className="category-item">
                <div className="category-color" style={{ backgroundColor: category.color }}></div>
                <div className="category-name">{category.name}</div>
                <div className="category-value">{category.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDonut;