import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChartBar, FaMapMarkerAlt, FaChartArea, FaFileAlt, FaHistory, FaCog, FaQuestionCircle, FaComments, FaBars, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, signOut } = useAuth();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (!isCollapsed) toggleSidebar();
      }
      
      // Close profile menu when clicking outside
      const avatarEl = document.querySelector('.avatar-container');
      if (showProfileMenu && avatarEl && !avatarEl.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCollapsed, toggleSidebar, showProfileMenu]);

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

// Update profile dropdown position based on sidebar state
const getDropdownStyle = (isCollapsed) => {
  return {
    position: 'absolute',
    top: '65px',
    left: isCollapsed ? '50%' : '0',
    transform: isCollapsed ? 'translateX(-50%)' : 'none',
    zIndex: 1000
  };
};
  
  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
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
      <div className="sidebar-header">
        <div className="user-profile">
          <motion.div 
            className="avatar-container"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProfileClick}
          >
            <img src="/profile.png" alt="User avatar" className="avatar" />
          </motion.div>
          {!isCollapsed && (
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
          )}
          
          {/* Profile dropdown menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                className="profile-dropdown"
                style={getDropdownStyle(isCollapsed)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="profile-menu-item" onClick={() => navigate('/settings')}>
                  <FaUserCircle />
                  <span>Profile</span>
                </div>
                <div className="profile-menu-item" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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