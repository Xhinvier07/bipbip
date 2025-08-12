import { BarChart2, RefreshCcw } from 'lucide-react';
import { transactionData } from '../DashboardData';

const TransactionChart = () => {
  return (
    <div className="dashboard-card transactions-card">
      <div className="card-header">
        <div className="card-title">
          <BarChart2 size={18} />
          <h2>Transactions: This Year vs Last Year</h2>
        </div>
        <div className="card-actions">
          <button className="card-action-btn">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
      <div className="card-content">
        <div className="chart-container">
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color current-year"></div>
              <div>2023</div>
            </div>
            <div className="legend-item">
              <div className="legend-color previous-year"></div>
              <div>2022</div>
            </div>
          </div>
          <div className="chart transactions-chart">
            {transactionData.labels.map((month, i) => (
              <div key={month} className="chart-column">
                <div className="chart-bars">
                  <div 
                    className="chart-bar previous-year" 
                    style={{ height: `${transactionData.previousYear[i] / 50}px` }}
                  >
                    <div className="tooltip">{transactionData.previousYear[i]}</div>
                  </div>
                  <div 
                    className="chart-bar current-year" 
                    style={{ height: `${transactionData.currentYear[i] / 50}px` }}
                  >
                    <div className="tooltip">{transactionData.currentYear[i]}</div>
                  </div>
                </div>
                <div className="chart-label">{month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionChart;