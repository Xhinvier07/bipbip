import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  servicePoints,
  transactionTypes,
  staffSkillLevels,
  dayTypes,
  timeOfDay as timeOfDayData,
  defaultSimulationParams,
  sampleSimulationResults,
  calculateStaffingEffect,
  generateCustomerPaths,
  generateHeatmapData
} from './SimulationData';

import './Simulation.css';
import BranchFloorPlan from './components/BranchFloorPlan';
import SimulationControls from './components/SimulationControls';
import SimulationResults from './components/SimulationResults';

const Simulation = () => {
  const [selectedBranch, setSelectedBranch] = useState('C3 A Mabini');
  const [simulationParams, setSimulationParams] = useState(defaultSimulationParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [view, setView] = useState('2D'); // '2D' or '3D'
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [customerPaths, setCustomerPaths] = useState([]);
  
  // Refs for canvas/simulation
  const simulationRef = useRef(null);
  
  // Generate customer paths for visualization
  useEffect(() => {
    if (isSimulating) {
      // Generate paths based on simulation parameters
      const customerCount = Math.floor(
        simulationParams.baseArrivalRate * 
        dayTypes.find(d => d.id === simulationParams.dayType).arrivalRateMultiplier *
        timeOfDayData.find(t => t.id === simulationParams.timeOfDay).peakMultiplier
      );
      
      const generatedPaths = generateCustomerPaths(customerCount);
      setCustomerPaths(generatedPaths);
      
      // After a delay, show simulation results
      const timer = setTimeout(() => {
        setSimulationResults(sampleSimulationResults);
      }, 3000); // Simulate a 3-second calculation time
      
      return () => clearTimeout(timer);
    }
  }, [isSimulating, simulationParams]);
  
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
  
  // Update simulation parameters
  const updateSimulationParams = (newParams) => {
    setSimulationParams(prevParams => ({ ...prevParams, ...newParams }));
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
    setView(prev => (prev === '2D' ? '3D' : '2D'));
  };
  
  // Toggle heatmap visualization
  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
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
            <span>{selectedBranch}</span>
            <ChevronDown size={16} />
          </div>
        </div>
        
        <div className="simulation-controls-top">
          <div className="view-toggle-buttons">
            <button
              className={`view-toggle-btn ${view === '2D' ? 'active' : ''}`}
              onClick={() => setView('2D')}
            >
              2D View
            </button>
            <button
              className={`view-toggle-btn ${view === '3D' ? 'active' : ''}`}
              onClick={() => setView('3D')}
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
            
            <button className="simulation-btn save">
              <Save size={16} />
              Save Scenario
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
            
            <div className="visualization-controls">
              <button className="viz-control-btn" onClick={toggleHeatmap}>
                {showHeatmap ? <EyeOff size={14} /> : <Eye size={14} />}
                {showHeatmap ? 'Hide' : 'Show'} Heatmap
              </button>
              
              <button className="viz-control-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Layers size={14} />
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>
          
          <div className="visualization-area">
            <BranchFloorPlan
              floorPlan={branchFloorPlan}
              servicePoints={servicePoints}
              customerPaths={isSimulating ? customerPaths : []}
              showHeatmap={showHeatmap}
              view={view}
              simulationSpeed={simulationParams.simulationSpeed}
              ref={simulationRef}
            />
            
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
                  <span>Elapsed: 00:03:42</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="branch-legend">
            <div className="legend-item">
              <div className="legend-color teller"></div>
              <span>Tellers</span>
            </div>
            <div className="legend-item">
              <div className="legend-color customer-service"></div>
              <span>Customer Service</span>
            </div>
            <div className="legend-item">
              <div className="legend-color manager"></div>
              <span>Branch Manager</span>
            </div>
            <div className="legend-item">
              <div className="legend-color atm"></div>
              <span>ATM</span>
            </div>
            <div className="legend-item">
              <div className="legend-color waiting"></div>
              <span>Waiting Area</span>
            </div>
            <div className="legend-item">
              <div className="legend-color entrance"></div>
              <span>Entrance/Exit</span>
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
              <SimulationResults results={simulationResults} />
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