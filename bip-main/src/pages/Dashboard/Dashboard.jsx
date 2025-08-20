import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import KPICards from './components/KPICards';
import TransactionChart from './components/TransactionChart';
import CategoryDonut from './components/CategoryDonut';
import BranchPerformance from './components/BranchPerformance';
import CustomerChurn from './components/CustomerChurn';
import StaffUtilization from './components/StaffUtilization';
import CustomerSatisfaction from './components/CustomerSatisfaction';
import EnhancedFloatingAIChat from './components/EnhancedFloatingAIChat';
import './Dashboard.css';


const Dashboard = () => {

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to keep dashboard feeling "live"
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="dashboard-page">      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-current-time">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        


        {/* KPI Cards */}
        <KPICards />

        {/* Main Dashboard Grid */}
        <div className="dashboard-grid">
          {/* First row - 2 columns - Key metrics and performance */}
          <TransactionChart />
          <BranchPerformance />
          
          {/* Second row - 2 columns - Staff utilization and categories */}
          <StaffUtilization />
          <CategoryDonut />
          
          {/* Third row - 2 columns - Customer metrics */}
          <CustomerChurn />
          <CustomerSatisfaction />
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <EnhancedFloatingAIChat />
    </div>
  );
};

export default Dashboard;