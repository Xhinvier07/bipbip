import React from 'react';

const DotGrid = ({ color = "#c95a94" }) => {
  return (
    <div className="dot-grid-container">
      <div 
        className="dot-grid" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `radial-gradient(circle, ${color} 3px, transparent 3px)`,
          backgroundSize: '30px 30px',
          opacity: 0.2,
          animation: 'dotAnimation 60s linear infinite',
          zIndex: 0
        }}
      />
      <style jsx="true">{`
        @keyframes dotAnimation {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 500px 500px;
          }
        }
      `}</style>
    </div>
  );
};

export default DotGrid;
