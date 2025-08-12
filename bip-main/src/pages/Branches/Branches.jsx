import { motion } from 'framer-motion';

const Branches = () => {
  return (
    <motion.div
      className="branches-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>Branches</h1>
      </div>
      
      <div className="branches-content">
        <p>Branches map and content will be added here.</p>
      </div>
    </motion.div>
  );
};

export default Branches;