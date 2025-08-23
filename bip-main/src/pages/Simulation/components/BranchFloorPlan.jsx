

import { useState, useEffect, forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { updateCustomerPosition } from '../SimulationData';
// ... existing imports ...
const BranchFloorPlan = forwardRef(({ 
  floorPlan, 
  servicePoints,
  customerPaths,
  view,
  simulationSpeed = 1
}, ref) => {
  const [activePaths, setActivePaths] = useState([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const customerStateRef = useRef(new Map());

// Handle customer path animations
  useEffect(() => {
    if (customerPaths.length === 0) {
      setActivePaths([]);
      return;
    }

    const startTime = Date.now();
    let lastTime = startTime;
    
    const animate = () => {
      const now = Date.now();
      const realDeltaTime = now - lastTime;
      const acceleratedDeltaTime = realDeltaTime * simulationSpeed;
      const simulatedTime = startTime + (now - startTime) * simulationSpeed;
      lastTime = now;
      
      // Update each customer using the state machine from SimulationData.js
      const updatedPaths = customerPaths.map(customer => {
        // Create a copy to avoid mutations
        let customerCopy;
          if (!customerStateRef.current.has(customer.id)) {
            // First time seeing this customer - initialize
            customerCopy = {
              ...customer,
              currentPosition: { ...customer.path[0] },
              targetPosition: customer.path.length > 1 ? { ...customer.path[1] } : { ...customer.path[0] },
              currentStep: 0,
              state: 'moving',
              stateStartTime: simulatedTime,
              isComplete: false
            };
            customerStateRef.current.set(customer.id, customerCopy);
          } else {
            // Get existing state
            customerCopy = customerStateRef.current.get(customer.id);
          }
        
        // Check if customer has started their journey yet (using simulated time)
        const customerStartTime = startTime + (customer.startTime * 1000);
        if (simulatedTime < customerStartTime) {
          return { 
            ...customerCopy, 
            position: null, 
            isActive: false,
            isComplete: false 
          };
        }
        
 
        // Use the state machine update function with simulated time
        const updatedCustomer = updateCustomerPosition(customerCopy, simulatedTime, acceleratedDeltaTime);
        customerStateRef.current.set(customer.id, updatedCustomer);
        
        // Convert the state machine output to the format expected by your UI
        return {
          ...updatedCustomer,
          position: updatedCustomer.isComplete ? null : {
            x: updatedCustomer.currentPosition.x,
            y: updatedCustomer.currentPosition.y
          },
          isActive: !updatedCustomer.isComplete,
          isWaiting: updatedCustomer.state === 'waiting',
          isBeingServed: updatedCustomer.state === 'being_served',
          serviceProgress: updatedCustomer.state === 'being_served' 
            ? Math.min(1, (simulatedTime - updatedCustomer.stateStartTime) / updatedCustomer.serviceTime)
            : 0
        };
      });
      
      setActivePaths(updatedPaths);
      
      // Continue animation if any customers are still active
      if (updatedPaths.some(p => !p.isComplete)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [customerPaths, simulationSpeed]);

  useEffect(() => {
    // Clear old customer state when paths change
    customerStateRef.current.clear();
  }, [customerPaths]);
  
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