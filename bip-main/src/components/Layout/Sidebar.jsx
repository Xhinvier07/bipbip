import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { FaChartBar, FaMapMarkerAlt, FaChartArea, FaFileAlt, FaHistory, FaCog, FaQuestionCircle, FaComments, FaBars, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (!isCollapsed) toggleSidebar();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed, toggleSidebar]);

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaChartBar /> },
    { path: '/branches', name: 'Branches', icon: <FaMapMarkerAlt /> },
    { path: '/simulation', name: 'Simulation', icon: <FaChartArea /> },
    { path: '/reports', name: 'Reports', icon: <FaFileAlt /> },
    { path: '/logs', name: 'Logs', icon: <FaHistory /> },
    { path: '/divider', name: '', icon: null },
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
    { path: '/help', name: 'Help', icon: <FaQuestionCircle /> },
    { path: '/bip-chat', name: 'Bip Chat', icon: <FaComments /> },
  ];

  const sidebarVariants = {
    expanded: {
      width: '230px',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: '100px',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 50
      }
    }
  };

  const navItemVariants = {
    expanded: {
      opacity: 1,
      display: 'block',
      transition: {
        delay: 0.2
      }
    },
    collapsed: {
      opacity: 0,
      display: 'none',
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div
      className="sidebar"
      ref={sidebarRef}
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
    >
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="avatar-container">
            <img src="/profile.png" alt="User avatar" className="avatar" />
          </div>
          <motion.div
            className="user-info"
            variants={navItemVariants}
          >
            <h3>Hello,</h3>
            <h2>Jansen!</h2>
          </motion.div>
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <div className="nav-links">
        {navItems.map((item) => {
          if (item.path === '/divider') {
            return <div className="nav-divider" key={item.path}></div>;
          }
          
          return (
            <NavLink 
              to={item.path} 
              key={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <div className="icon">{item.icon}</div>
              <motion.span
                className="link-text"
                variants={navItemVariants}
              >
                {item.name}
              </motion.span>
              {location.pathname === item.path && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeIndicator"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <NavLink to="/logout" className="logout-btn">
          <div className="icon">
            <FaSignOutAlt />
          </div>
          <motion.span
            className="link-text"
            variants={navItemVariants}
          >
            Logout
          </motion.span>
        </NavLink>
      </div>
    </motion.div>
  );
};

export default Sidebar;