
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchMainSheetData } from '../Dashboard/GoogleSheetsService';
import {
  SlidersHorizontal,
  Users,
  Clock,
  CalendarDays,
  BarChart2,
  Play,
  Pause,
  RotateCcw,
  Save,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  ArrowRight,
  ExternalLink,
  Settings
} from 'lucide-react';

import {
  branchFloorPlan,
  branchFloorPlans,
  servicePoints,
  branchServicePoints,
  transactionTypes,
  staffSkillLevels,
  dayTypes,
  timeOfDay as timeOfDayData,
  defaultSimulationParams,
  sampleSimulationResults,
  calculateStaffingEffect,
  generateCustomerPaths
} from './SimulationData';

import './Simulation.css';
import BranchFloorPlan from './components/BranchFloorPlan';
import SimulationControls from './components/SimulationControls';
import SimulationResults from './components/SimulationResults';

const Simulation = () => {
  const [selectedBranch, setSelectedBranch] = useState('Morayta Feu');
  const [branchNames, setBranchNames] = useState([]);
  const [simulationParams, setSimulationParams] = useState(defaultSimulationParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(true);
  const [view, setView] = useState('2D'); // '2D' or '3D'
  const [customerPaths, setCustomerPaths] = useState([]);
  const [show3DOverlay, setShow3DOverlay] = useState(false); // Add 3D overlay state
  const [transactionDistribution, setTransactionDistribution] = useState(
    transactionTypes.map(type => ({ id: type.id, name: type.name, percentage: type.percentage }))
  );
  
  // State for current branch floor plan and service points
  const [currentFloorPlan, setCurrentFloorPlan] = useState(branchFloorPlans["Morayta Feu"] || branchFloorPlan);
  const [currentServicePoints, setCurrentServicePoints] = useState(branchServicePoints["Morayta Feu"] || servicePoints);
  
  // Refs for canvas/simulation
  const simulationRef = useRef(null);
  
  // Fetch branch names from Main Sheet
  useEffect(() => {
    const fetchBranchNames = async () => {
      try {
        const data = await fetchMainSheetData();
        if (data && data.length > 0) {
          // Extract unique branch names
          const uniqueBranches = [...new Set(data.map(item => item.branch_name))].filter(Boolean);
          setBranchNames(uniqueBranches);
          
          // Set the first branch as default if available
          if (uniqueBranches.length > 0 && !uniqueBranches.includes(selectedBranch)) {
            setSelectedBranch(uniqueBranches[0]);
            setSimulationParams(prev => ({ ...prev, branchName: uniqueBranches[0] }));
          }
        }
      } catch (error) {
        console.error('Error fetching branch names:', error);
        // Fallback to default branches if fetch fails
        setBranchNames(['C3 A Mabini', 'BPI Morayta-FEU Branch', 'BPI Corinthian Plaza Branch']);
      }
    };
    
    fetchBranchNames();
  }, []);
  
  // Generate customer paths for visualization
  useEffect(() => {
    if (isSimulating) {
      // Generate paths based on simulation parameters
      const customerCount = Math.floor(
        simulationParams.baseArrivalRate * 
        dayTypes.find(d => d.id === simulationParams.dayType).arrivalRateMultiplier *
        timeOfDayData.find(t => t.id === simulationParams.timeOfDay).peakMultiplier
      );
      
      const generatedPaths = generateCustomerPaths(customerCount, false, selectedBranch);
      setCustomerPaths(generatedPaths);
      
      // After a delay, show simulation results with randomized data based on selected branch
      const timer = setTimeout(async () => {
        try {
          const data = await fetchMainSheetData();
          const branchData = data.find(item => item.branch_name === selectedBranch);
          
          if (branchData) {
            // Create randomized simulation results based on actual branch data
            const randomizedResults = {
              ...sampleSimulationResults,
              totalCustomers: Math.floor(branchData.transaction_count * (0.8 + Math.random() * 0.4)), // ±20% variation
              averageWaitTime: Math.max(1, branchData.avg_waiting_time * (0.7 + Math.random() * 0.6)), // ±30% variation
              averageServiceTime: Math.max(1, branchData.avg_processing_time * (0.8 + Math.random() * 0.4)), // ±20% variation
              customerSatisfaction: Math.max(0, Math.min(100, branchData.sentiment_score * (0.9 + Math.random() * 0.2))), // ±10% variation
              projectedBHS: Math.max(0, Math.min(100, branchData.bhs * (0.85 + Math.random() * 0.3))), // ±15% variation
              staffUtilization: Math.max(0, Math.min(100, 70 + Math.random() * 30)) // Random between 70-100%
            };
            
            setSimulationResults(randomizedResults);
          } else {
            setSimulationResults(sampleSimulationResults);
          }
        } catch (error) {
          console.error('Error fetching branch data for simulation:', error);
          setSimulationResults(sampleSimulationResults);
        }
      }, 3000); // Simulate a 3-second calculation time
      
      return () => clearTimeout(timer);
    }
  }, [isSimulating, simulationParams, selectedBranch]);
  
  // Handle simulation start/stop
  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      // Keep results visible
    } else {
      setIsSimulating(true);
      // Reset results for new simulation
      setSimulationResults(null);
    }
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationResults(null);
    setSimulationParams(defaultSimulationParams);
    setCustomerPaths([]);
  };
  
  // Handle branch selection
  const handleBranchChange = (branchName) => {
    setSelectedBranch(branchName);
    setSimulationParams(prev => ({ ...prev, branchName }));
    
    // Update floor plan and service points based on selected branch
    if (branchFloorPlans[branchName]) {
      setCurrentFloorPlan(branchFloorPlans[branchName]);
    } else {
      // Default to Morayta if the branch doesn't have a specific floor plan
      setCurrentFloorPlan(branchFloorPlans["Morayta Feu"] || branchFloorPlan);
    }
    
    // Update service points
    if (branchServicePoints[branchName]) {
      setCurrentServicePoints(branchServicePoints[branchName]);
    } else {
      // Default to Morayta if the branch doesn't have specific service points
      setCurrentServicePoints(branchServicePoints["Morayta Feu"] || servicePoints);
    }
  };
  
  // Update simulation parameters
  const updateSimulationParams = (newParams) => {
    setSimulationParams(prevParams => ({ ...prevParams, ...newParams }));
  };
  
  // Update transaction distribution
  const updateTransactionDistribution = (transactionId, newPercentage) => {
    setTransactionDistribution(prev => 
      prev.map(item => item.id === transactionId ? 
        { ...item, percentage: newPercentage } : item
      )
    );
  };
  
  // Toggle control panel visibility
  const toggleControlPanel = () => {
    setIsControlPanelOpen(!isControlPanelOpen);
  };
  
  // Toggle results panel visibility
  const toggleResultsPanel = () => {
    setIsResultsPanelOpen(!isResultsPanelOpen);
  };
  
  // Toggle view mode (2D/3D)
  const toggleView = () => {
    const newView = view === '2D' ? '3D' : '2D';
    setView(newView);
    
    // Show 3D overlay when switching to 3D view
    if (newView === '3D') {
      setShow3DOverlay(true);
    } else {
      setShow3DOverlay(false);
    }
  };
  

  
  // Calculate realtime metrics based on current parameters
  const calculateRealtimeMetrics = () => {
    return calculateStaffingEffect(simulationParams);
  };
  
  const realtimeMetrics = calculateRealtimeMetrics();
  
  return (
    <div className="simulation-page">
      <div className="simulation-header">
        <div className="branch-selector">
          <h1>Branch Simulation</h1>
          <div className="branch-select-dropdown">
            <select 
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              disabled={isSimulating}
            >
              {branchNames.map((branchName) => (
                <option key={branchName} value={branchName}>
                  {branchName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="simulation-controls-top">
          <div className="view-toggle-buttons">
            <button
              className={`view-toggle-btn ${view === '2D' ? 'active' : ''}`}
              onClick={() => {
                setView('2D');
                setShow3DOverlay(false);
              }}
            >
              2D View
            </button>
            <button
              className={`view-toggle-btn ${view === '3D' ? 'active' : ''}`}
              onClick={() => {
                setView('3D');
                setShow3DOverlay(true);
              }}
            >
              3D View
            </button>
          </div>
          
          <div className="simulation-action-buttons">
            <button
              className={`simulation-btn ${isSimulating ? 'stop' : 'start'}`}
              onClick={toggleSimulation}
            >
              {isSimulating ? <Pause size={16} /> : <Play size={16} />}
              {isSimulating ? 'Stop' : 'Start'} Simulation
            </button>
            
            <button
              className="simulation-btn reset"
              onClick={resetSimulation}
              disabled={isSimulating}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          
          </div>
        </div>
      </div>
      
      <div className="simulation-content">
        {/* Left Panel - Simulation Controls */}
        <div className={`simulation-panel controls-panel ${isControlPanelOpen ? '' : 'collapsed'}`}>
          <div className="panel-header">
            <h2>
              <Settings size={16} />
              Simulation Controls
            </h2>
            <button className="panel-toggle" onClick={toggleControlPanel}>
              {isControlPanelOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
          
          {isControlPanelOpen && (
            <SimulationControls 
              params={simulationParams}
              onUpdateParams={updateSimulationParams}
              dayTypes={dayTypes}
              timeOfDay={timeOfDayData}
              staffSkillLevels={staffSkillLevels}
              transactionTypes={transactionTypes}
              transactionDistribution={transactionDistribution}
              onUpdateTransactionDistribution={updateTransactionDistribution}
              disabled={isSimulating}
            />
          )}
        </div>
        
        {/* Center Panel - Visualization */}
        <div className="simulation-visualization">
          <div className="visualization-header">
            <div className="realtime-metrics">
              <div className="metric">
                <Users size={14} />
                <span>Customer Rate: </span>
                <strong>{realtimeMetrics.effectiveArrivalRate.toFixed(1)}/hr</strong>
              </div>
              <div className="metric">
                <Clock size={14} />
                <span>Avg. Wait: </span>
                <strong>{realtimeMetrics.expectedWaitTime.toFixed(1)} min</strong>
              </div>
              <div className="metric">
                <BarChart2 size={14} />
                <span>Utilization: </span>
                <strong>{realtimeMetrics.staffUtilization}%</strong>
              </div>
            </div>
            

          </div>
          
          <div className="visualization-area">
            {branchFloorPlans[selectedBranch] ? (
              <div className="floor-plan-container">
                <BranchFloorPlan
                  floorPlan={currentFloorPlan}
                  servicePoints={currentServicePoints}
                  customerPaths={isSimulating ? customerPaths : []}
                  view={view}
                  simulationSpeed={simulationParams.simulationSpeed}
                  ref={simulationRef}
                />
                
                {/* 3D Overlay */}
                {show3DOverlay && (
                  <div className="three-d-overlay">
                    <div className="overlay-content">
                      <h3>
                        🚧 3D View
                      </h3>
                      <p>Currently in development...</p>
                      <p className="overlay-subtitle">3D Map Visualization, Soon!</p>
                      <button 
                        className="overlay-close-btn"
                        onClick={() => {
                          setView('2D');
                          setShow3DOverlay(false);
                        }}
                      >
                        Switch to 2D View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-map-available">
                <div className="no-map-message">
                  <h3>No Branch Map Available</h3>
                  <p>Floor plan for this branch is not available in the simulation.</p>
                  <p>Please select either Morayta FEU or Corinthian Plaza branch.</p>
                </div>
              </div>
            )}
            
            {isSimulating && (
              <div className="simulation-status">
                <div className="simulation-speed">
                  <span>Simulation Speed: {simulationParams.simulationSpeed}x</span>
                  <div className="speed-controls">
                    <button 
                      disabled={simulationParams.simulationSpeed <= 1}
                      onClick={() => updateSimulationParams({ simulationSpeed: Math.max(1, simulationParams.simulationSpeed - 1) })}
                    >
                      -
                    </button>
                    <button
                      disabled={simulationParams.simulationSpeed >= 10}
                      onClick={() => updateSimulationParams({ simulationSpeed: Math.min(10, simulationParams.simulationSpeed + 1) })}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="simulation-timer">
                  <Clock size={14} />
                  <span>Loading...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="branch-legend">
            <div className="legend-item">
              <p><b>Legend</b></p>
            </div>
            <div className="legend-item">
              <div className="legend-color withdrawal"></div>
              <span>Withdrawal</span>
            </div>
            <div className="legend-item">
              <div className="legend-color deposit"></div>
              <span>Deposit</span>
            </div>
            <div className="legend-item">
              <div className="legend-color encashment"></div>
              <span>Encashment</span>
            </div>
            <div className="legend-item">
              <div className="legend-color loan"></div>
              <span>Loan</span>
            </div>
            <div className="legend-item">
              <div className="legend-color transfer"></div>
              <span>Transfer</span>
            </div>
            <div className="legend-item">
              <div className="legend-color accountservice"></div>
              <span>Account Service</span>
            </div>

            <div className="legend-item">
              <div className="legend-color customerservice"></div>
              <span>Customer Service</span>
            </div>

          </div>
        </div>
        
        {/* Right Panel - Results */}
        <div className={`simulation-panel results-panel ${isResultsPanelOpen ? '' : 'collapsed'}`}>
          <div className="panel-header">
            <h2>
              <BarChart2 size={16} />
              Simulation Results
            </h2>
            <button className="panel-toggle" onClick={toggleResultsPanel}>
              {isResultsPanelOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          
          {isResultsPanelOpen && (
            simulationResults ? (
              <SimulationResults 
                results={simulationResults} 
                transactionDistribution={transactionDistribution} 
              />
            ) : (
              <div className="no-results">
                <p>No simulation results yet</p>
                <p>Start a simulation to see results here</p>
                <button
                  className="simulation-btn start"
                  onClick={toggleSimulation}
                  disabled={isSimulating}
                >
                  <Play size={16} />
                  Start Simulation
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;