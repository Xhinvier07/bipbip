import { motion } from 'framer-motion';
import { FaBell, FaSearch, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-banner">
        <motion.img 
          src="/banner_name.png" 
          alt="BipBip - Branch Intelligence Platform" 
          className="banner-image"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      </div>
      
      <motion.div 
        className="header-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        
        <div className="header-buttons">
          <motion.button 
            className="icon-button notification-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBell />
            <span className="notification-badge">3</span>
          </motion.button>
          
          <motion.div
            className="user-dropdown"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUserCircle className="user-icon" />
            <span className="user-name">Jansen</span>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
};

export default Header;