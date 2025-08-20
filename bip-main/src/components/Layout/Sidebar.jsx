import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChartBar, FaMapMarkerAlt, FaChartArea, FaFileAlt, FaHistory, FaCog, FaQuestionCircle, FaComments, FaBars, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ProfileModal from '../ProfileModal/ProfileModal';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, signOut } = useAuth();

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
    { path: '/divider', name: '', icon: null },
    { path: '/logs', name: 'Logs', icon: <FaHistory /> },
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


  
  const handleProfileClick = () => {
    setShowProfileModal(true);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
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
      <div className={`sidebar-header ${isCollapsed ? 'collapsed' : ''}`}>
        {!isCollapsed && (
          <div className="user-profile">
            <motion.div 
              className="avatar-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProfileClick}
            >
              <img src="/profile.png" alt="User avatar" className="avatar" />
            </motion.div>
            <motion.div
              className="user-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3>Hello,</h3>
              <h2>{user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</h2>
            </motion.div>
          </div>
        )}
        
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        
        {/* Profile Modal */}
        <ProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />
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
        <div className="logout-btn" onClick={handleLogout}>
          <div className="icon">
            <FaSignOutAlt />
          </div>
          <motion.span
            className="link-text"
            variants={navItemVariants}
          >
            Logout
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;