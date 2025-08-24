import { useState } from 'react';
import {
  BarChart2, 
  Users, 
  Clock, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Download,
  Share2,
  Sparkles
} from 'lucide-react';
import { transactionTypes } from '../SimulationData';

const SimulationResults = ({ results, transactionDistribution }) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  // Format a number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get color for BHS score
  const getBHSColor = (score) => {
    if (score >= 90) return '#00BFA6';
    if (score >= 80) return '#FEA000';
    if (score >= 70) return '#E9A603';
    return '#CF3D58';
  };
  
  // Get color for utilization score
  const getUtilizationColor = (score) => {
    if (score >= 95) return '#CF3D58'; // Over-utilization
    if (score >= 85) return '#00BFA6'; // Optimal
    if (score >= 70) return '#FEA000'; // Good
    return '#BC7EFF'; // Under-utilization
  };
  
  // Get icon for trend
  const getTrendIcon = (isPositive) => {
    return isPositive ? <ArrowUpRight size={14} className="trend-up" /> : <ArrowDownRight size={14} className="trend-down" />;
  };
  
  return (
    <div className="simulation-results">
      <div className="results-tabs">
        <button 
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <BarChart2 size={14} />
        
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <Activity size={14} />
        
        </button>
        <button 
          className={`tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
          onClick={() => setActiveTab('hourly')}
        >
          <Clock size={14} />
        
        </button>
      </div>
      
      <div className="results-content">
        {activeTab === 'summary' && (
          <div className="results-summary">
            <div className="summary-header">
              <div className="bhs-score">
                
                <div className="bhs-score-title">
                  <Sparkles size={16} />
                  Est. BHS
                </div>
                <div 
                  className="bhs-score-value" 
                  style={{ color: getBHSColor(results.projectedBHS) }}
                >
                  {Math.round(results.projectedBHS)}%
                </div>
                <div className="bhs-score-label">Branch Health Score</div>
              </div>
              
              <div className="key-metrics">
                <div className="key-metric">
                  <div className="key-metric-value">{formatNumber(results.totalCustomers)}</div>
                  <div className="key-metric-label">Total CX</div>
                </div>
                <div className="key-metric">
                  <div className="key-metric-value">
                    {results.averageWaitTime.toFixed(1)}
                    <span className="metric-unit">min</span>
                  </div>
                  <div className="key-metric-label">Avg. WT</div>
                </div>
              </div>
            </div>
            
            
            <div className="simulation-insights">
              <h3>
                <Sparkles size={16} />
                AI Insights
              </h3>
              
              <div className="insight-list">
                {results.staffUtilization > 90 && (
                  <div className="insight-item warning">
                    <AlertCircle size={16} />
                    <div className="insight-content">
                      <strong>High staff utilization detected ({results.staffUtilization.toFixed(1)}%)</strong>
                      <p>Consider adding more tellers during peak hours to reduce wait times and improve customer satisfaction.</p>
                    </div>
                  </div>
                )}
                
                {results.abandonedTransactions > 0 && (
                  <div className="insight-item warning">
                    <AlertCircle size={16} />
                    <div className="insight-content">
                      <strong>{results.abandonedTransactions} abandoned transactions</strong>
                      <p>Customer loss detected due to long wait times. Recommend increasing service capacity.</p>
                    </div>
                  </div>
                )}
                
                {results.projectedBHS >= 85 && (
                  <div className="insight-item positive">
                    <CheckCircle size={16} />
                    <div className="insight-content">
                      <strong>Strong Branch Health Score</strong>
                      <p>Current staffing and service levels are maintaining good customer satisfaction.</p>
                    </div>
                  </div>
                )}
                
                {results.staffUtilization < 70 && (
                  <div className="insight-item info">
                    <AlertCircle size={16} />
                    <div className="insight-content">
                      <strong>Low staff utilization ({results.staffUtilization}%)</strong>
                      <p>Consider reducing staff during this time period or redistributing to busier branches.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <Users size={16} />
                  <span>Customer Metrics</span>
                </div>
                <div className="metric-data">
                  <div className="metric-row">
                    <span>Completed Transactions</span>
                    <strong>{formatNumber(results.completedTransactions)}</strong>
                  </div>
                  <div className="metric-row">
                    <span>Abandoned Transactions</span>
                    <strong className={results.abandonedTransactions > 0 ? 'negative' : ''}>
                      {formatNumber(results.abandonedTransactions)}
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span>Abandonment Rate</span>
                    <strong className={results.abandonedTransactions > 0 ? 'negative' : ''}>
                      {((results.abandonedTransactions / results.totalCustomers) * 100).toFixed(1)}%
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span>Customer Satisfaction</span>
                    <strong style={{ color: getBHSColor(results.customerSatisfaction) }}>
                      {results.customerSatisfaction.toFixed(1)}%
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <Clock size={16} />
                  <span>Time Metrics</span>
                </div>
                <div className="metric-data">
                  <div className="metric-row">
                    <span>Average Service Time</span>
                    <strong>{results.averageServiceTime.toFixed(1)} min</strong>
                  </div>
                  <div className="metric-row">
                    <span>Maximum Wait Time</span>
                    <strong className={results.maximumWaitTime > 15 ? 'negative' : ''}>
                      {results.maximumWaitTime.toFixed(1)} min
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span>Service Efficiency</span>
                    <strong>
                      {((results.averageServiceTime / (results.averageWaitTime + results.averageServiceTime)) * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <TrendingUp size={16} />
                  <span>Staff Metrics</span>
                </div>
                <div className="metric-data">
                  <div className="metric-row">
                    <span>Staff Utilization</span>
                    <strong style={{ color: getUtilizationColor(results.staffUtilization) }}>
                      {results.staffUtilization.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="metric-row">
                    <span>Efficiency Rating</span>
                    <strong>
                      {((results.completedTransactions / results.totalCustomers) * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            
      
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <div className="results-transactions">
            <h3>Transaction Breakdown</h3>
            
            <div className="transaction-list">
              {results.transactionBreakdown.map((transaction, index) => {
                // Find matching expected distribution
                const expectedDistribution = transactionDistribution.find(t => t.id === transaction.id);
                const expectedPercentage = expectedDistribution ? expectedDistribution.percentage : 0;
                const actualPercentage = Math.round((transaction.count / results.completedTransactions) * 100);
                const difference = actualPercentage - expectedPercentage;
                
                return (
                  <div key={index} className="transaction-item">
                    <div 
                      className="transaction-color" 
                      style={{ backgroundColor: transaction.color || '#ccc' }}
                    ></div>
                    <div className="transaction-details">
                      <div className="transaction-name">
                        {transaction.name} 
                        <div className="transaction-percentages">
                          <span className="transaction-percentage actual">
                            {actualPercentage}% actual
                          </span>
                          <span className="transaction-percentage expected">
                            {expectedPercentage}% expected
                          </span>
                          {difference !== 0 && (
                            <span className={`transaction-difference ${difference > 0 ? 'positive' : 'negative'}`}>
                              {difference > 0 ? '+' : ''}{difference}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="transaction-metrics">
                        <span className="transaction-count">{transaction.count} transactions</span>
                        <span className="transaction-time">
                          <Clock size={12} />
                          {(() => {
                            const originalType = transactionTypes.find(t => t.id === transaction.id);
                            const defaultTime = originalType ? (originalType.normalProcess + originalType.normalWait) : 5;
                            return ((transaction.avgTime || defaultTime)).toFixed(1);
                          })() + ' min avg'}
                        </span>
                        <span className="transaction-satisfaction">
                        {(() => {
                            const defaultSatisfaction = 70 + Math.round(Math.random() * 20);
                            return (transaction.satisfaction || defaultSatisfaction);
                          })() + '% satisfaction'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="transaction-chart">
              <h4>Transaction Distribution Comparison</h4>
              <div className="chart-container">
                <div className="chart-bars">
                  {results.transactionBreakdown.map((transaction, index) => {
                    const expectedDistribution = transactionDistribution.find(t => t.id === transaction.id);
                    const expectedPercentage = expectedDistribution ? expectedDistribution.percentage : 0;
                    const actualPercentage = Math.round((transaction.count / results.completedTransactions) * 100);
                    
                    return (
                      <div key={index} className="chart-bar-group">
                        <div className="chart-bar-label">{transaction.name.split(' ')[0]}</div>
                        <div className="chart-bars-container">
                          <div 
                            className="chart-bar actual" 
                            style={{ 
                              height: `${actualPercentage * 2}px`,
                              backgroundColor: transaction.color || '#ccc'
                            }}
                            title={`Actual: ${actualPercentage}%`}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-legend">

                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: '#ccc' }}></div>
                    <span>Actual</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'hourly' && (
          <div className="results-hourly">
            <h3>Hourly Breakdown</h3>
            
            <table className="hourly-table">
              <thead>
                <tr>
                  <th>Hour</th>
                  <th>Customers</th>
                  <th>Completed</th>
                  <th>Abandoned</th>
                  <th>Avg Wait</th>
                </tr>
              </thead>
              <tbody>
                {results.hourlyBreakdown.map((hour, index) => (
                  <tr key={index}>
                    <td>{hour.hour}</td>
                    <td>{hour.customers}</td>
                    <td>{hour.completed}</td>
                    <td 
                      className={hour.abandoned > 0 ? 'negative' : ''}
                    >
                      {hour.abandoned}
                    </td>
                    <td 
                      className={hour.avgWait > 10 ? 'negative' : hour.avgWait < 5 ? 'positive' : ''}
                    >
                      {hour.avgWait.toFixed(1)} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="hourly-chart-placeholder">
              <h4>Hourly Customer Flow</h4>
              <div className="chart-placeholder">
                <Activity size={40} />
                <p>Chart visualization would appear here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationResults;