import { motion } from 'framer-motion';
import { 
  ArrowUp, 
  Building, 
  BarChart, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

const KPICards = () => {
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
          <div className="kpi-value">1,250+</div>
          <div className="kpi-trend positive">
            <ArrowUp size={14} /> 
            <span>5 new this month</span>
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
          <div className="kpi-value">4.2M</div>
          <div className="kpi-trend positive">
            <ArrowUp size={14} /> 
            <span>12% vs last month</span>
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
          <div className="kpi-value">14 min</div>
          <div className="kpi-trend negative">
            <ArrowUp size={14} /> 
            <span>2 min vs last month</span>
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
          <div className="kpi-value">88%</div>
          <div className="kpi-trend positive">
            <ArrowUp size={14} /> 
            <span>3% vs last month</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KPICards;