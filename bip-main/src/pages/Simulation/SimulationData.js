// Simulation page data and helper functions

// Branch floor plan coordinates for 2D visualization (example coordinates)
export const branchFloorPlan = {
  // Branch boundaries and walls
  boundaries: [
    { x1: 0, y1: 0, x2: 800, y2: 0 },
    { x1: 800, y1: 0, x2: 800, y2: 600 },
    { x1: 800, y1: 600, x2: 0, y2: 600 },
    { x1: 0, y1: 600, x2: 0, y2: 0 },
  ],
  // Interior walls
  walls: [
    { x1: 200, y1: 0, x2: 200, y2: 450 },
    { x1: 500, y1: 450, x2: 500, y2: 600 },
    { x1: 200, y1: 450, x2: 500, y2: 450 },
  ],
  // Furniture and fixtures
  furniture: [
    // Teller counters
    { type: 'counter', x: 220, y: 100, width: 360, height: 60 },
    { type: 'counter', x: 220, y: 200, width: 360, height: 60 },
    { type: 'counter', x: 220, y: 300, width: 360, height: 60 },
    
    // Manager's office
    { type: 'office', x: 50, y: 50, width: 130, height: 150 },
    
    // Waiting area
    { type: 'waitingArea', x: 600, y: 100, width: 150, height: 300 },
    
    // ATMs
    { type: 'atm', x: 650, y: 500, width: 30, height: 30 },
    { type: 'atm', x: 700, y: 500, width: 30, height: 30 },
    
    // Entrance
    { type: 'entrance', x: 600, y: 600, width: 100, height: 10 },
  ]
};

// Service points (teller positions)
export const servicePoints = [
  { id: 1, name: 'Teller 1', x: 250, y: 80, type: 'teller', isActive: true },
  { id: 2, name: 'Teller 2', x: 350, y: 80, type: 'teller', isActive: true },
  { id: 3, name: 'Teller 3', x: 450, y: 80, type: 'teller', isActive: false },
  { id: 4, name: 'Teller 4', x: 250, y: 180, type: 'teller', isActive: true },
  { id: 5, name: 'Teller 5', x: 350, y: 180, type: 'teller', isActive: false },
  { id: 6, name: 'Teller 6', x: 450, y: 180, type: 'teller', isActive: false },
  { id: 7, name: 'Customer Service', x: 350, y: 280, type: 'service', isActive: true },
  { id: 8, name: 'Branch Manager', x: 110, y: 125, type: 'manager', isActive: true },
  { id: 9, name: 'ATM 1', x: 650, y: 500, type: 'atm', isActive: true },
  { id: 10, name: 'ATM 2', x: 700, y: 500, type: 'atm', isActive: true },
];

// Different types of transactions
export const transactionTypes = [
  { id: 1, name: 'Deposit', color: '#FEA000', avgTime: 3, percentage: 40 },
  { id: 2, name: 'Withdrawal', color: '#CF3D58', avgTime: 2, percentage: 30 },
  { id: 3, name: 'Balance Inquiry', color: '#C95A94', avgTime: 1, percentage: 10 },
  { id: 4, name: 'Account Opening', color: '#BC7EFF', avgTime: 15, percentage: 5 },
  { id: 5, name: 'Loan Application', color: '#00BFA6', avgTime: 20, percentage: 5 },
  { id: 6, name: 'Bill Payment', color: '#4299e1', avgTime: 3, percentage: 10 }
];

// Staff skill levels
export const staffSkillLevels = [
  { id: 1, level: 'Novice', efficiencyMultiplier: 0.7 },
  { id: 2, level: 'Regular', efficiencyMultiplier: 1.0 },
  { id: 3, level: 'Experienced', efficiencyMultiplier: 1.3 },
  { id: 4, level: 'Expert', efficiencyMultiplier: 1.5 }
];

// Day types that affect customer behavior
export const dayTypes = [
  { id: 1, name: 'Regular Day', arrivalRateMultiplier: 1.0, description: 'Normal customer traffic' },
  { id: 2, name: 'Payday (15th/30th)', arrivalRateMultiplier: 1.8, description: 'Higher volume due to salary disbursement' },
  { id: 3, name: 'Holiday Season', arrivalRateMultiplier: 1.5, description: 'Increased transactions before holidays' },
  { id: 4, name: 'Weekend', arrivalRateMultiplier: 1.3, description: 'Higher retail customer traffic' },
  { id: 5, name: 'Low Traffic Day', arrivalRateMultiplier: 0.7, description: 'Slower than usual business' }
];

// Time of day affects customer arrival patterns
export const timeOfDay = [
  { id: 1, name: 'Early Morning (8-10AM)', arrivalPattern: 'moderate', peakMultiplier: 1.0 },
  { id: 2, name: 'Mid Morning (10-12PM)', arrivalPattern: 'high', peakMultiplier: 1.4 },
  { id: 3, name: 'Lunch Hour (12-2PM)', arrivalPattern: 'very high', peakMultiplier: 1.8 },
  { id: 4, name: 'Afternoon (2-4PM)', arrivalPattern: 'moderate', peakMultiplier: 1.2 },
  { id: 5, name: 'Late Afternoon (4-6PM)', arrivalPattern: 'high', peakMultiplier: 1.5 }
];

// Default simulation parameters
export const defaultSimulationParams = {
  // Branch setup
  branchName: 'C3 A Mabini',
  numberOfTellers: 4,
  numberOfCustomerServiceReps: 1,
  
  // Time settings
  dayType: dayTypes[0].id,
  timeOfDay: timeOfDay[2].id,
  simulationDuration: 60, // minutes
  simulationSpeed: 1, // 1x real time
  
  // Customer behavior
  baseArrivalRate: 8, // customers per hour
  maxQueueLength: 10, // maximum queue length before customers leave
  
  // Transaction distribution
  transactionDistribution: transactionTypes.map(type => ({
    id: type.id,
    percentage: type.percentage
  })),
  
  // Staff settings
  staffEfficiency: staffSkillLevels[1].id, // Regular efficiency
  
  // Random events
  randomEvents: false,
  
  // Display options
  showHeatmap: true,
  showPaths: true,
  show3D: false
};

// Example simulation results
export const sampleSimulationResults = {
  totalCustomers: 42,
  completedTransactions: 38,
  abandonedTransactions: 4,
  averageWaitTime: 8.3, // minutes
  maximumWaitTime: 17.2, // minutes
  averageServiceTime: 4.1, // minutes
  staffUtilization: 86, // percentage
  customerSatisfaction: 73, // percentage
  projectedBHS: 79, // percentage
  
  // Detailed metrics by transaction type
  transactionBreakdown: transactionTypes.map(type => ({
    id: type.id,
    name: type.name,
    count: Math.floor(Math.random() * 15) + 1,
    avgTime: type.avgTime * (0.9 + Math.random() * 0.2),
    satisfaction: Math.floor(Math.random() * 30) + 70
  })),
  
  // Hourly customer counts
  hourlyBreakdown: [
    { hour: '8-9 AM', customers: 5, completed: 5, abandoned: 0, avgWait: 2.3 },
    { hour: '9-10 AM', customers: 8, completed: 7, abandoned: 1, avgWait: 6.1 },
    { hour: '10-11 AM', customers: 12, completed: 11, abandoned: 1, avgWait: 9.7 },
    { hour: '11-12 PM', customers: 17, completed: 15, abandoned: 2, avgWait: 12.4 }
  ]
};

// Helper function to calculate effect of staffing changes
export const calculateStaffingEffect = (params) => {
  const { numberOfTellers, staffEfficiency, baseArrivalRate, dayType, timeOfDay: timeOfDayId } = params;
  
  // Get multipliers
  const selectedDayType = dayTypes.find(day => day.id === dayType) || dayTypes[0];
  const selectedTimeOfDay = timeOfDay.find(time => time.id === timeOfDayId) || timeOfDay[0];
  const selectedEfficiency = staffSkillLevels.find(level => level.id === staffEfficiency) || staffSkillLevels[1];
  
  // Calculate customer arrival rate
  const effectiveArrivalRate = baseArrivalRate * 
                               selectedDayType.arrivalRateMultiplier * 
                               selectedTimeOfDay.peakMultiplier;
  
  // Calculate service capacity (how many customers can be served per hour)
  const serviceCapacity = numberOfTellers * selectedEfficiency.efficiencyMultiplier * 5; // 5 customers/hr per teller at baseline
  
  // Calculate expected waiting time (using simple queue theory)
  const utilization = effectiveArrivalRate / serviceCapacity;
  const expectedWaitTime = utilization < 1 
    ? (utilization / (serviceCapacity * (1 - utilization))) * 60 // in minutes
    : 30; // If utilization > 100%, set a high wait time
  
  // Calculate abandonment rate
  const abandonmentRate = Math.max(0, Math.min(0.3, (expectedWaitTime - 10) / 50));
  
  // Calculate customer satisfaction
  const customerSatisfaction = Math.max(0, Math.min(100, 100 - (expectedWaitTime * 2)));
  
  return {
    effectiveArrivalRate,
    serviceCapacity,
    utilization: utilization < 1 ? utilization * 100 : 100, // percentage
    expectedWaitTime: Math.min(30, expectedWaitTime), // cap at 30 minutes
    abandonmentRate: Math.round(abandonmentRate * 100),
    customerSatisfaction: Math.round(customerSatisfaction),
    staffUtilization: Math.min(100, Math.round(utilization * 100))
  };
};

// Customer paths for visualization
export const generateCustomerPaths = (count) => {
  // Entry point (door)
  const entryPoint = { x: 650, y: 590 };
  
  // Queue position
  const queueStart = { x: 600, y: 400 };
  
  // Helper to generate a random path to a service point
  const generatePath = (servicePoint) => {
    // Basic path: Entry -> Queue -> Service Point
    return [
      entryPoint,
      queueStart,
      { x: queueStart.x - 20, y: queueStart.y - 50 },  // Queue position
      { x: servicePoint.x + 30, y: servicePoint.y + 30 }, // In front of service point
      { x: servicePoint.x, y: servicePoint.y }, // At service point
      { x: servicePoint.x + 30, y: servicePoint.y + 30 }, // Moving away
      entryPoint // Exit
    ];
  };
  
  // Generate paths for the requested number of customers
  const paths = [];
  const activeServicePoints = servicePoints.filter(point => point.isActive);
  
  for (let i = 0; i < count; i++) {
    // Pick a random service point for this customer
    const randomServicePoint = activeServicePoints[Math.floor(Math.random() * activeServicePoints.length)];
    
    // Generate a path to that service point
    const path = generatePath(randomServicePoint);
    
    // Assign a random transaction type
    const randomTransactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    
    paths.push({
      id: `customer-${i + 1}`,
      path,
      servicePoint: randomServicePoint,
      transaction: randomTransactionType,
      startTime: Math.floor(Math.random() * 50), // Random start time for visualization
      duration: randomTransactionType.avgTime * 60, // Convert minutes to seconds for animation
    });
  }
  
  return paths;
};

// Heat map data generation
export const generateHeatmapData = () => {
  const heatmapData = [];
  const width = 800;
  const height = 600;
  const cellSize = 20;
  
  // Generate a grid of heat points
  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      // Skip cells that are in walls
      if (isPointInWall(x, y)) continue;
      
      // Calculate intensity based on proximity to service points and waiting area
      let intensity = 0;
      
      // Higher intensity near service points
      servicePoints.forEach(point => {
        const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        if (distance < 100 && point.isActive) {
          intensity += (100 - distance) / 100;
        }
      });
      
      // Higher intensity in waiting area
      if (x > 600 && x < 750 && y > 100 && y < 400) {
        intensity += 0.5;
      }
      
      // Higher intensity near entrance
      const distanceToEntrance = Math.sqrt(Math.pow(x - 650, 2) + Math.pow(y - 590, 2));
      if (distanceToEntrance < 80) {
        intensity += (80 - distanceToEntrance) / 160;
      }
      
      // Add some randomness
      intensity += Math.random() * 0.2;
      
      // Cap intensity
      intensity = Math.min(1, Math.max(0, intensity));
      
      if (intensity > 0.1) { // Only add points with meaningful intensity
        heatmapData.push({
          x, 
          y, 
          value: intensity
        });
      }
    }
  }
  
  return heatmapData;
};

// Helper function to check if a point is inside a wall
function isPointInWall(x, y) {
  // Check boundaries
  if (x < 0 || x > 800 || y < 0 || y > 600) return true;
  
  // Check each wall
  for (const wall of branchFloorPlan.walls) {
    // Simple check for horizontal and vertical walls
    if (wall.x1 === wall.x2) { // Vertical wall
      if (Math.abs(x - wall.x1) < 5 && y >= Math.min(wall.y1, wall.y2) && y <= Math.max(wall.y1, wall.y2)) {
        return true;
      }
    } else if (wall.y1 === wall.y2) { // Horizontal wall
      if (Math.abs(y - wall.y1) < 5 && x >= Math.min(wall.x1, wall.x2) && x <= Math.max(wall.x1, wall.x2)) {
        return true;
      }
    }
  }
  
  // Check furniture
  for (const item of branchFloorPlan.furniture) {
    if (item.type === 'counter' || item.type === 'office') {
      if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
        return true;
      }
    }
  }
  
  return false;
}