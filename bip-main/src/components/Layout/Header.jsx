import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Get current page name from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'DASHBOARD';
    if (path === '/branches') return 'BRANCHES';
    if (path === '/simulation') return 'SIMULATION';
    if (path === '/reports') return 'REPORTS';
    if (path === '/logs') return 'LOGS';
    if (path === '/settings') return 'SETTINGS';
    if (path === '/help') return 'HELP';
    if (path === '/bip-chat') return 'BIP CHAT';
    return '';
  };

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
        className="header-page-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1>{getPageTitle()}</h1>
      </motion.div>
    </header>
  );
};

export default Header;