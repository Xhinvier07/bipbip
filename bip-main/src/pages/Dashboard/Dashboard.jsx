import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="dashboard-content">
        <p>Dashboard content will be added here.</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;