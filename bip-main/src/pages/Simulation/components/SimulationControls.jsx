import { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Percent,
  BarChart4,
  BarChart,
  Star,
  ChevronsUpDown,
  TrendingUp,
  Settings,
  ListPlus,
  AlertTriangle
} from 'lucide-react';

const SimulationControls = ({ 
  params, 
  onUpdateParams, 
  dayTypes,
  timeOfDay,
  staffSkillLevels,
  transactionTypes,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState('timing');
  
  // Handler for slider changes
  const handleSliderChange = (param, value) => {
    onUpdateParams({ [param]: parseFloat(value) });
  };
  
  // Handler for select changes
  const handleSelectChange = (param, value) => {
    onUpdateParams({ [param]: value });
  };
  
  // Handler for transaction distribution changes
  const handleTransactionDistributionChange = (id, percentage) => {
    // Get current distribution
    const currentDistribution = [...params.transactionDistribution];
    
    // Find the item to update
    const index = currentDistribution.findIndex(item => item.id === id);
    
    // Calculate the change in percentage
    const oldPercentage = currentDistribution[index].percentage;
    const change = percentage - oldPercentage;
    
    // Only proceed if there's a change
    if (change === 0) return;
    
    // Create updated distribution
    const updatedDistribution = [...currentDistribution];
    updatedDistribution[index] = { ...updatedDistribution[index], percentage };
    
    // Adjust other percentages to maintain 100% total
    // Distribute the change proportionally among other transaction types
    const otherIndices = currentDistribution.map((_, i) => i).filter(i => i !== index);
    
    if (otherIndices.length > 0) {
      const totalOtherPercentage = otherIndices.reduce((sum, i) => sum + currentDistribution[i].percentage, 0);
      
      if (totalOtherPercentage > 0) {
        otherIndices.forEach(i => {
          const proportion = currentDistribution[i].percentage / totalOtherPercentage;
          updatedDistribution[i] = {
            ...updatedDistribution[i],
            percentage: Math.max(0, currentDistribution[i].percentage - change * proportion)
          };
        });
      }
    }
    
    // Round percentages and ensure they sum to 100
    let sum = 0;
    updatedDistribution.forEach((item, i) => {
      updatedDistribution[i] = { ...item, percentage: Math.round(item.percentage) };
      sum += updatedDistribution[i].percentage;
    });
    
    // Adjust for rounding errors
    const diff = 100 - sum;
    if (diff !== 0) {
      // Add/subtract from largest percentage
      const largestIndex = updatedDistribution
        .map((item, i) => ({ percentage: item.percentage, index: i }))
        .filter(item => item.index !== index) // Don't adjust the one we just changed
        .sort((a, b) => b.percentage - a.percentage)[0]?.index;
      
      if (largestIndex !== undefined) {
        updatedDistribution[largestIndex] = {
          ...updatedDistribution[largestIndex],
          percentage: updatedDistribution[largestIndex].percentage + diff
        };
      }
    }
    
    // Update params
    onUpdateParams({ transactionDistribution: updatedDistribution });
  };
  
  // Get the day type and time of day objects
  const selectedDayType = dayTypes.find(d => d.id === params.dayType);
  const selectedTimeOfDay = timeOfDay.find(t => t.id === params.timeOfDay);
  const selectedStaffLevel = staffSkillLevels.find(s => s.id === params.staffEfficiency);

  return (
    <div className="simulation-controls">
      <div className="controls-tabs">
        <button 
          className={`tab-btn ${activeTab === 'timing' ? 'active' : ''}`}
          onClick={() => setActiveTab('timing')}
        >
          <Calendar size={14} />
          Timing
        </button>
        <button 
          className={`tab-btn ${activeTab === 'staffing' ? 'active' : ''}`}
          onClick={() => setActiveTab('staffing')}
        >
          <Users size={14} />
          Staffing
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <BarChart size={14} />
          Transactions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          <Settings size={14} />
          Advanced
        </button>
      </div>
      
      <div className="controls-content">
        {activeTab === 'timing' && (
          <div className="control-section">
            <h3 className="section-title">
              <Calendar size={16} />
              Day Type
            </h3>
            
            <div className="control-group">
              <div className="select-container">
                <select 
                  value={params.dayType}
                  onChange={(e) => handleSelectChange('dayType', parseInt(e.target.value))}
                  disabled={disabled}
                >
                  {dayTypes.map(day => (
                    <option key={day.id} value={day.id}>
                      {day.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="description">
                {selectedDayType?.description}
                {selectedDayType && (
                  <div className="coefficient">
                    Customer volume: 
                    <span className={selectedDayType.arrivalRateMultiplier > 1 ? 'increased' : 'decreased'}>
                      {selectedDayType.arrivalRateMultiplier > 1 ? '+' : ''}
                      {Math.round((selectedDayType.arrivalRateMultiplier - 1) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="section-title">
              <Clock size={16} />
              Time of Day
            </h3>
            
            <div className="control-group">
              <div className="select-container">
                <select 
                  value={params.timeOfDay}
                  onChange={(e) => handleSelectChange('timeOfDay', parseInt(e.target.value))}
                  disabled={disabled}
                >
                  {timeOfDay.map(time => (
                    <option key={time.id} value={time.id}>
                      {time.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="description">
                Traffic: <strong>{selectedTimeOfDay?.arrivalPattern}</strong>
                {selectedTimeOfDay && (
                  <div className="coefficient">
                    Peak multiplier: <strong>x{selectedTimeOfDay.peakMultiplier.toFixed(1)}</strong>
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="section-title">
              <TrendingUp size={16} />
              Customer Arrival Rate
            </h3>
            
            <div className="control-group">
              <div className="slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="1"
                  value={params.baseArrivalRate}
                  onChange={(e) => handleSliderChange('baseArrivalRate', e.target.value)}
                  disabled={disabled}
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>{params.baseArrivalRate} per hour</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            
            <div className="timing-summary">
              <div className="summary-item">
                <span>Effective <br></br>arrival rate:</span>
                <strong>
                  {(params.baseArrivalRate * 
                    selectedDayType.arrivalRateMultiplier * 
                    selectedTimeOfDay.peakMultiplier).toFixed(1)}
                </strong>
                <span>customers/hour</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'staffing' && (
          <div className="control-section">
            <h3 className="section-title">
              <Users size={16} />
              Staffing Levels
            </h3>
            
            <div className="control-group">
              <label>Number of Tellers</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="6" 
                  step="1"
                  value={params.numberOfTellers}
                  onChange={(e) => handleSliderChange('numberOfTellers', e.target.value)}
                  disabled={disabled}
                />
                <div className="slider-labels">
                  <span>Min</span>
                  <span>{params.numberOfTellers} tellers</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            
            <div className="control-group">
              <label>Number of Customer Service Reps</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  step="1"
                  value={params.numberOfCustomerServiceReps}
                  onChange={(e) => handleSliderChange('numberOfCustomerServiceReps', e.target.value)}
                  disabled={disabled}
                />
                <div className="slider-labels">
                  <span>Min</span>
                  <span>{params.numberOfCustomerServiceReps} reps</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
            
            <h3 className="section-title">
              <Star size={16} />
              Staff Efficiency
            </h3>
            
            <div className="control-group">
              <div className="select-container">
                <select 
                  value={params.staffEfficiency}
                  onChange={(e) => handleSelectChange('staffEfficiency', parseInt(e.target.value))}
                  disabled={disabled}
                >
                  {staffSkillLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.level} (x{level.efficiencyMultiplier.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="description">
                Staff efficiency affects transaction times and quality of service.
                {selectedStaffLevel && (
                  <div className="coefficient">
                    Efficiency multiplier: <strong>x{selectedStaffLevel.efficiencyMultiplier.toFixed(1)}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <div className="control-section">
            <h3 className="section-title">
              <BarChart4 size={16} />
              Transaction Distribution
            </h3>
            
            <div className="transaction-distribution">
              {transactionTypes.map(transaction => {
                const currentPercentage = params.transactionDistribution.find(t => t.id === transaction.id)?.percentage || 0;
                
                return (
                  <div key={transaction.id} className="transaction-type">
                    <div className="transaction-header">
                      <div 
                        className="transaction-color" 
                        style={{ backgroundColor: transaction.color }}
                      ></div>
                      <div className="transaction-name">{transaction.name}</div>
                      <div className="transaction-percentage">{currentPercentage}%</div>
                    </div>
                    
                    <div className="transaction-slider">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="1"
                        value={currentPercentage}
                        onChange={(e) => handleTransactionDistributionChange(transaction.id, parseInt(e.target.value))}
                        disabled={disabled}
                      />
                    </div>
                    
                    <div className="transaction-info">
                      <div className="transaction-time">
                        <Clock size={12} />
                        <span>Avg. Time: {transaction.avgTime} min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="distribution-note">
                <AlertTriangle size={14} />
                <p>Total must equal 100%. Adjusting one type will automatically rebalance others.</p>
              </div>
              
            </div>
          </div>
        )}
        
        {activeTab === 'advanced' && (
          <div className="control-section">
            <h3 className="section-title">
              <ChevronsUpDown size={16} />
              Queue Behavior
            </h3>
            
            <div className="control-group">
              <label>Max Queue Length (before customers leave)</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  min="5" 
                  max="20" 
                  step="1"
                  value={params.maxQueueLength}
                  onChange={(e) => handleSliderChange('maxQueueLength', e.target.value)}
                  disabled={disabled}
                />
                <div className="slider-labels">
                  <span>Short</span>
                  <span>{params.maxQueueLength} customers</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
            
            <h3 className="section-title">
              <ListPlus size={16} />
              Additional Options
            </h3>
            
            <div className="control-group">
              <div className="checkbox-container">
                <label>
                  <input 
                    type="checkbox"
                    checked={params.randomEvents}
                    onChange={(e) => onUpdateParams({ randomEvents: e.target.checked })}
                    disabled={disabled}
                  />
                  <span>Include random events</span>
                </label>
                <div className="description">
                  Simulate unexpected events like system issues, customer issues, etc.
                </div>
              </div>
            </div>
            

            
            <div className="control-group">
              <div className="checkbox-container">
                <label>
                  <input 
                    type="checkbox"
                    checked={params.showPaths}
                    onChange={(e) => onUpdateParams({ showPaths: e.target.checked })}
                    disabled={disabled}
                  />
                  <span>Show customer paths</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationControls;