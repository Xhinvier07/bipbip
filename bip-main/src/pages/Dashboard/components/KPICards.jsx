import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUp,
  ArrowDown,
  Building, 
  BarChart, 
  Clock, 
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { getKPIData } from '../DashboardData';

const KPICards = () => {
  const [kpiData, setKpiData] = useState({
    branchCount: { total: 0, newThisMonth: 0, trend: 'positive' },
    transactions: { today: 0, growth: 0, trend: 'positive' },
    waitTime: { average: 0, change: 0, trend: 'positive' },
    bhs: { score: 0, change: 0, trend: 'positive' }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getKPIData();
        setKpiData(data);
      } catch (error) {
        console.error('Error loading KPI data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up periodic refresh to simulate real-time data
    const intervalId = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  // Function to render the trend indicator
  const renderTrendIndicator = (trend, value) => {
    if (trend === 'positive') {
      return (
        <div className="kpi-trend positive">
          <ArrowUp size={14} /> 
          <span>{value}</span>
        </div>
      );
    } else {
      return (
        <div className="kpi-trend negative">
          <ArrowDown size={14} /> 
          <span>{value}</span>
        </div>
      );
    }
  };

  // Function to format the trend text
  const formatTrendText = (metric, value, trend) => {
    if (metric === 'branchCount') {
      return `${value} new this month`;
    } else if (metric === 'transactions') {
      return `${value}% vs last month`;
    } else if (metric === 'waitTime') {
      return `${Math.abs(value)} min ${trend === 'positive' ? 'decrease' : 'increase'}`;
    } else if (metric === 'bhs') {
      return `${Math.abs(value)}% ${trend === 'positive' ? 'increase' : 'decrease'}`;
    }
    return '';
  };

  return (
    <div className="kpi-cards">
      <motion.div 
        className="kpi-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="kpi-icon">
          <Building size={20} />
        </div>
        <div className="kpi-content">
          <h3>Total Branches</h3>
          <div className="kpi-value">
            {loading ? '...' : kpiData.branchCount.total.toLocaleString()}
          </div>
          {renderTrendIndicator(
            kpiData.branchCount.trend,
            formatTrendText('branchCount', kpiData.branchCount.newThisMonth, kpiData.branchCount.trend)
          )}
        </div>
        <div className="tooltip-container">
          <HelpCircle size={16} className="tooltip-icon" />
          <div className="tooltip-content">
            <strong>Total Branches</strong>
            <p>Number of active branch locations across all cities</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="kpi-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="kpi-icon transactions">
          <BarChart size={20} />
        </div>
        <div className="kpi-content">
          <h3>Total Transactions</h3>
          <div className="kpi-value">
            {loading ? '...' : kpiData.transactions.today.toLocaleString()}
          </div>
          {renderTrendIndicator(
            kpiData.transactions.trend,
            formatTrendText('transactions', kpiData.transactions.growth, kpiData.transactions.trend)
          )}
        </div>
        <div className="tooltip-container">
          <HelpCircle size={16} className="tooltip-icon" />
          <div className="tooltip-content">
            <strong>Today's Transactions</strong>
            <p>Sum of transaction counts from all branches in Main sheet</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="kpi-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="kpi-icon wait-time">
          <Clock size={20} />
        </div>
        <div className="kpi-content">
          <h3>Avg. Wait Time</h3>
          <div className="kpi-value">
            {loading ? '...' : `${kpiData.waitTime.average} min`}
          </div>
          {renderTrendIndicator(
            kpiData.waitTime.trend,
            formatTrendText('waitTime', kpiData.waitTime.change, kpiData.waitTime.trend)
          )}
        </div>
        <div className="tooltip-container">
          <HelpCircle size={16} className="tooltip-icon" />
          <div className="tooltip-content">
            <strong>Average Wait Time</strong>
            <p>Average time customers wait before being served across all branches</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="kpi-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="kpi-icon health">
          <TrendingUp size={20} />
        </div>
        <div className="kpi-content">
          <h3>Overall BHS</h3>
          <div className="kpi-value">
            {loading ? '...' : `${kpiData.bhs.score}%`}
          </div>
          {renderTrendIndicator(
            kpiData.bhs.trend,
            formatTrendText('bhs', kpiData.bhs.change, kpiData.bhs.trend)
          )}
        </div>
        <div className="tooltip-container">
          <HelpCircle size={16} className="tooltip-icon" />
          <div className="tooltip-content">
            <strong>Branch Health Score</strong>
            <p>Combined metric of customer satisfaction, wait times, and transaction efficiency</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KPICards;