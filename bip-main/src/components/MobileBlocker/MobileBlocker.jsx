import React, { useState, useEffect } from 'react';
import { FaDesktop, FaMobile, FaLock, FaArrowLeft, FaChartBar, FaCogs, FaChartLine, FaBriefcase, FaExclamationTriangle } from 'react-icons/fa';
import './MobileBlocker.css';
import logoPath from '/logo_withname.png';

const MobileBlocker = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showBlocker, setShowBlocker] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
        'windows phone', 'opera mini', 'mobile safari', 'mobile chrome'
      ];
      
      const isMobileDevice = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      ) || window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice);
      setShowBlocker(isMobileDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (!isMobile) {
    return children;
  }

     return (
     <div className="mobile-blocker">
       <div className="mobile-blocker-background">
         {/* Main content */}
         <div className="mobile-blocker-content">
           <div className="mobile-blocker-card">
             {/* Header with logo and description */}
             <div className="mobile-blocker-header">
               <div className="logo-section">
                 <img src={logoPath} alt="BIP Logo" className="bip-logo" />
                 <div className="bip-description">
                   <h2>Branch Intelligence Platform</h2>
                   <p>Advanced analytics and management for BPI branches</p>
                 </div>
               </div>
               <div className="access-notice">
                 <div className="notice-icon">
                   <FaExclamationTriangle size={32} />
                 </div>
                 <h1>Desktop Access Required</h1>
                 <p>This platform is optimized for desktop computers and larger screens</p>
               </div>
             </div>

                         {/* Device comparison */}
             <div className="device-comparison">
               <div className="device-item blocked">
                 <div className="device-icon">
                   <FaMobile size={32} />
                 </div>
                 <div className="device-info">
                   <h3>Mobile & Tablet</h3>
                   <p>Limited functionality</p>
                   <span className="status-badge blocked">Not Supported</span>
                 </div>
               </div>

               <div className="device-arrow">
                 <FaArrowLeft size={24} />
               </div>

               <div className="device-item allowed">
                 <div className="device-icon">
                   <FaDesktop size={32} />
                 </div>
                 <div className="device-info">
                   <h3>Desktop & Laptop</h3>
                   <p>Full platform access</p>
                   <span className="status-badge allowed">Recommended</span>
                 </div>
               </div>
             </div>

                         {/* Why blocked section */}
             <div className="why-blocked">
               <h3>Why Desktop Access is Required?</h3>
               <div className="reasons-grid">
                 <div className="reason-item">
                   <div className="reason-icon">
                     <FaChartBar size={32} />
                   </div>
                   <h4>Advanced Analytics</h4>
                   <p>Complex dashboards need larger displays</p>
                 </div>
                 <div className="reason-item">
                   <div className="reason-icon">
                     <FaCogs size={32} />
                   </div>
                   <h4>Full Platform Features</h4>
                   <p>Complete functionality requires desktop controls</p>
                 </div>
                 <div className="reason-item">
                   <div className="reason-icon">
                     <FaChartLine size={32} />
                   </div>
                   <h4>Data Visualization</h4>
                   <p>Charts and reports need proper scaling</p>
                 </div>
                 <div className="reason-item">
                   <div className="reason-icon">
                     <FaBriefcase size={32} />
                   </div>
                   <h4>Business Operations</h4>
                   <p>Optimized for professional work environments</p>
                 </div>
               </div>
             </div>

            {/* Action buttons */}
            <div className="mobile-blocker-actions">
              <button 
                className="action-button primary"
                onClick={() => window.open('https://www.bpi.com.ph', '_blank')}
              >
                Visit BPI Website
              </button>
              <button 
                className="action-button secondary"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>

            {/* Footer */}
            <div className="mobile-blocker-footer">
              <p>Need help? Contact our support team</p>
              <p className="support-email">jansenmoral@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBlocker;
