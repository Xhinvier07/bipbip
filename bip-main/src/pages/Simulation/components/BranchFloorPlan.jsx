import { useState, useEffect, forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateHeatmapData } from '../SimulationData';

const BranchFloorPlan = forwardRef(({ 
  floorPlan, 
  servicePoints,
  customerPaths,
  showHeatmap,
  view,
  simulationSpeed = 1
}, ref) => {
  const [activePaths, setActivePaths] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Generate heatmap data when showHeatmap changes
  useEffect(() => {
    if (showHeatmap) {
      setHeatmapData(generateHeatmapData());
    } else {
      setHeatmapData([]);
    }
  }, [showHeatmap]);
  
  // Handle customer path animations
  useEffect(() => {
    if (customerPaths.length === 0) {
      setActivePaths([]);
      return;
    }
    
    // Start time
    const startTime = Date.now();
    
    // Animation frame function
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000 * simulationSpeed; // Convert to seconds with speed multiplier
      
      // Update positions for each customer
      const updatedPaths = customerPaths.map(customer => {
        // Check if customer has started their journey yet
        if (elapsedTime < customer.startTime) {
          return { ...customer, position: null, isActive: false };
        }
        
        // Calculate time in the customer's journey
        const customerTime = elapsedTime - customer.startTime;
        
        // Check if customer's journey is complete
        if (customerTime > customer.duration + customer.path.length * 2) { // 2 seconds per path segment
          return { ...customer, position: null, isActive: false, isComplete: true };
        }
        
        // Calculate which path segment the customer is on
        const pathDuration = customer.path.length * 2; // 2 seconds per path segment
        
        if (customerTime < pathDuration) {
          // Customer is still moving along the path
          const segmentDuration = 2; // seconds per segment
          const segmentIndex = Math.min(
            Math.floor(customerTime / segmentDuration),
            customer.path.length - 2
          );
          const segmentProgress = (customerTime % segmentDuration) / segmentDuration;
          
          // Interpolate between current segment points
          const start = customer.path[segmentIndex];
          const end = customer.path[segmentIndex + 1];
          
          const position = {
            x: start.x + (end.x - start.x) * segmentProgress,
            y: start.y + (end.y - start.y) * segmentProgress
          };
          
          return { ...customer, position, isActive: true, isWaiting: false };
        } else {
          // Customer is at service point being served
          const servicePosition = customer.path[customer.path.length - 2];
          
          // Calculate how far through service they are
          const serviceProgress = (customerTime - pathDuration) / customer.duration;
          
          return { 
            ...customer, 
            position: servicePosition,
            isActive: true,
            isWaiting: false,
            isBeingServed: true,
            serviceProgress: Math.min(1, serviceProgress)
          };
        }
      });
      
      setActivePaths(updatedPaths);
      
      // Continue animation if any paths are still active
      if (updatedPaths.some(p => p.isActive)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [customerPaths, simulationSpeed]);
  
  // Draw branch floor plan
  const renderFloorPlan = () => {
    return (
      <div className={`floor-plan ${view === '3D' ? 'view-3d' : ''}`}>
                 {/* Draw walls */}
         {floorPlan.walls && floorPlan.walls.map((wall, index) => (
           <div 
             key={`wall-${index}`}
             className="wall"
             style={{
               left: Math.min(wall.x1, wall.x2),
               top: Math.min(wall.y1, wall.y2),
               width: Math.abs(wall.x2 - wall.x1) || 4,
               height: Math.abs(wall.y2 - wall.y1) || 4
             }}
           ></div>
         ))}
        
        {/* Draw furniture */}
        {floorPlan.furniture.map((item, index) => (
          <div 
            key={`furniture-${index}`}
            className={`furniture furniture-${item.type}`}
            style={{
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
              backgroundColor: item.color || '#f0f0f0',
              border: '2px solid #333',
              borderRadius: item.type === 'entrance' ? '8px' : '4px'
            }}
          >
            {item.type === 'entrance' && <div className="entrance-label">Entrance</div>}
            {item.type === 'waitingArea' && <div className="waiting-label">Waiting</div>}
            {item.type === 'manager' && <div className="manager-label">Manager</div>}
            {item.type === 'teller' && <div className="teller-label">Teller</div>}
            {item.type === 'customerService' && <div className="cs-label">CS</div>}
            {item.type === 'beaKiosk' && <div className="bea-label">BEA</div>}
            {item.type === 'atm' && <div className="atm-label">ATM</div>}
          </div>
        ))}
        
        {/* Draw service points */}
        {servicePoints.map((point) => {
          const getServicePointColor = (type) => {
            switch (type) {
              case 'teller': return '#FEA000';
              case 'customerService': return '#CF3D58';
              case 'manager': return '#9b59b6';
              case 'beaKiosk': return '#FEA000';
              case 'atm': return '#8B4513';
              default: return '#666';
            }
          };
          
          return (
            <div 
              key={`service-${point.id}`}
              className={`service-point ${point.type} ${point.isActive ? 'active' : 'inactive'}`}
              style={{
                left: point.x - 15,
                top: point.y - 15,
                backgroundColor: getServicePointColor(point.type),
                border: '2px solid #333'
              }}
            >
              <div className="service-point-label">{point.name}</div>
            </div>
          );
        })}
        
        {/* Draw customer paths */}
        {activePaths.filter(p => p.isActive && p.position).map((customer) => (
          <motion.div
            key={`customer-${customer.id}`}
            className={`customer ${customer.isBeingServed ? 'being-served' : ''}`}
            style={{
              left: customer.position.x - 10,
              top: customer.position.y - 10,
              backgroundColor: customer.color || customer.transaction.color,
              border: '2px solid #333',
              borderRadius: '50%'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {customer.isBeingServed && (
              <div 
                className="service-progress"
                style={{ width: `${customer.serviceProgress * 100}%` }}
              ></div>
            )}
          </motion.div>
        ))}
        
        {/* Draw heatmap */}
        {showHeatmap && heatmapData.map((point, index) => (
          <div
            key={`heat-${index}`}
            className="heat-point"
            style={{
              left: point.x,
              top: point.y,
              opacity: point.value * 0.6,
              background: `radial-gradient(circle, rgba(255,0,0,0.7) 0%, rgba(255,165,0,0.5) 40%, rgba(255,255,0,0.3) 70%, transparent 100%)`,
              width: 40,
              height: 40,
              transform: 'translate(-50%, -50%)'
            }}
          ></div>
        ))}
      </div>
    );
  };
  
  // Render 3D view
  const render3DView = () => {
    return (
      <div className="floor-plan-3d">
        <div className="floor-plan-3d-overlay">
          <div className="floor-plan-3d-message">
            <h3>3D View</h3>
            <p>Visualization being rendered...</p>
            <p className="note">Note: In a production environment, this would use Three.js to render a 3D view of the branch</p>
          </div>
        </div>
        {renderFloorPlan()}
      </div>
    );
  };
  
  return (
    <div className="branch-floor-plan" ref={ref}>
      {view === '3D' ? render3DView() : renderFloorPlan()}
    </div>
  );
});

BranchFloorPlan.displayName = 'BranchFloorPlan';

export default BranchFloorPlan;