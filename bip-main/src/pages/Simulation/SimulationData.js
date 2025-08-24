// Simulation page data and helper functions

// Branch floor plans for different branches
export const branchFloorPlans = {
  // Morayta FEU Branch floor plan
  "Morayta Feu": {
    name: "Morayta FEU Branch",
    // Branch boundaries and walls
    boundaries: [
      { x1: 0, y1: 0, x2: 800, y2: 0 },
      { x1: 800, y1: 0, x2: 800, y2: 600 },
      { x1: 800, y1: 600, x2: 0, y2: 600 },
      { x1: 0, y1: 600, x2: 0, y2: 0 },
    ],
    // Furniture matches the current layout
    furniture: [
      // Purple - Branch Manager (top-left corner)
      { type: 'manager', x: 50, y: 50, width: 80, height: 80, color: '#9b59b6' },
      
      // Orange - Teller counters (top row)
      { type: 'teller', x: 150, y: 50, width: 70, height: 40, color: '#FEA000' },
      { type: 'teller', x: 230, y: 50, width: 70, height: 40, color: '#FEA000' },
      { type: 'teller', x: 310, y: 50, width: 70, height: 40, color: '#FEA000' },
      { type: 'teller', x: 390, y: 50, width: 70, height: 40, color: '#FEA000' },
      
      // Red - Customer Service (left side, 4 squares)
      { type: 'customerService', x: 50, y: 150, width: 60, height: 60, color: '#CF3D58' },
      { type: 'customerService', x: 50, y: 230, width: 60, height: 60, color: '#CF3D58' },
      { type: 'customerService', x: 50, y: 310, width: 60, height: 60, color: '#CF3D58' },
      { type: 'customerService', x: 50, y: 390, width: 60, height: 60, color: '#CF3D58' },
      
      // Green - Waiting Area (center, 2 rows of 2 pairs)
      { type: 'waitingArea', x: 150, y: 150, width: 120, height: 60, color: '#00BFA6' },
      { type: 'waitingArea', x: 290, y: 150, width: 120, height: 60, color: '#00BFA6' },
      { type: 'waitingArea', x: 150, y: 230, width: 120, height: 60, color: '#00BFA6' },
      { type: 'waitingArea', x: 290, y: 230, width: 120, height: 60, color: '#00BFA6' },
      
      // Yellow - BEA Kiosks (right side, 3 rectangles)
      { type: 'beaKiosk', x: 480, y: 150, width: 80, height: 50, color: '#FEA000' },
      { type: 'beaKiosk', x: 480, y: 220, width: 80, height: 50, color: '#FEA000' },
      { type: 'beaKiosk', x: 480, y: 290, width: 80, height: 50, color: '#FEA000' },
      
      // Brown - ATMs (bottom-right, 2 squares)
      { type: 'atm', x: 480, y: 480, width: 60, height: 60, color: '#8B4513' },
      { type: 'atm', x: 560, y: 480, width: 60, height: 60, color: '#8B4513' },
      
      // Entrance
      { type: 'entrance', x: 220, y: 580, width: 100, height: 20, color: '#333' },
    ]
  },
  
  // Corinthian Plaza Branch floor plan - different layout

  "Corinthian Plaza": {
    name: "Corinthian Plaza Branch",
    // Branch boundaries and walls
    boundaries: [
      { x1: 0, y1: 0, x2: 800, y2: 0 },
      { x1: 800, y1: 0, x2: 800, y2: 600 },
      { x1: 800, y1: 600, x2: 0, y2: 600 },
      { x1: 0, y1: 600, x2: 0, y2: 0 },
    ],
    // Updated furniture layout based on diagram
    furniture: [
      // Orange - Teller counters (top row) - 3 Regular + 1 Bulk
      { type: 'teller', x: 170, y: 100, width: 60, height: 60, color: '#FEA000', label: 'Regular' },
      { type: 'teller', x: 250, y: 100, width: 60, height: 60, color: '#FEA000', label: 'Regular' },
      { type: 'teller', x: 330, y: 100, width: 60, height: 60, color: '#FEA000', label: 'Regular' },
      { type: 'teller', x: 410, y: 100, width: 60, height: 60, color: '#FEA000', label: 'Bulk' },
      { type: 'teller', x: 590, y: 100, width: 60, height: 60, color: '#FEA000', label: 'Regular' },
      
      // Purple - Branch Manager and Secretary (left side)
      { type: 'manager', x: 10, y: 200, width: 80, height: 60, color: '#9b59b6', label: 'Branch Manager' },
      { type: 'secretary', x: 10, y: 280, width: 80, height: 50, color: '#9b59b6', label: 'Secretary' },
      
      // Yellow - BEA Kiosks (positioned as in diagram)
      { type: 'beaKiosk', x: 190, y: 280, width: 80, height: 50, color: '#FEA000', label: 'BEA' },
      { type: 'beaKiosk', x: 580, y: 280, width: 60, height: 50, color: '#FEA000', label: 'BEA' },
      { type: 'beaKiosk', x: 30, y: 440, width: 80, height: 50, color: '#FEA000', label: 'BEA' },
      
      // Bottom row (3 chairs)
      { type: 'waitingArea', x: 300, y: 350, width: 40, height: 40, color: '#00BFA6' },
      { type: 'waitingArea', x: 350, y: 350, width: 40, height: 40, color: '#00BFA6' },
      { type: 'waitingArea', x: 400, y: 350, width: 40, height: 40, color: '#00BFA6' },

      // Middle row (2 chairs)
      { type: 'waitingArea', x: 350, y: 300, width: 40, height: 40, color: '#00BFA6' },
      { type: 'waitingArea', x: 400, y: 300, width: 40, height: 40, color: '#00BFA6' },

      // Top row (1 chair)
      { type: 'waitingArea', x: 400, y: 250, width: 40, height: 40, color: '#00BFA6' },
    
      // Red - Customer Service (bottom row)
      { type: 'customerService', x: 170, y: 520, width: 60, height: 60, color: '#dc143c' },
      { type: 'customerService', x: 250, y: 520, width: 60, height: 60, color: '#dc143c' },
      { type: 'customerService', x: 330, y: 520, width: 60, height: 60, color: '#dc143c' },
      { type: 'customerService', x: 410, y: 520, width: 60, height: 60, color: '#dc143c' },
      { type: 'customerService', x: 490, y: 520, width: 60, height: 60, color: '#dc143c' },
      
      // Entrance (bottom left)
      { type: 'entrance', x: 30, y: 540, width: 100, height: 20, color: '#333' },
    ],
  }
};

// Default branch floor plan (using Morayta as default)
export const branchFloorPlan = {
  // Branch boundaries and walls
  boundaries: [
    { x1: 0, y1: 0, x2: 800, y2: 0 },
    { x1: 800, y1: 0, x2: 800, y2: 600 },
    { x1: 800, y1: 600, x2: 0, y2: 600 },
    { x1: 0, y1: 600, x2: 0, y2: 0 },
  ],
  // Furniture and fixtures based on the image layout
  furniture: [
    // Purple - Branch Manager (top-left corner)
    { type: 'manager', x: 50, y: 50, width: 80, height: 80, color: '#9b59b6' },
    
    // Orange - Teller counters (top row, 7 rectangles)
    { type: 'teller', x: 150, y: 50, width: 70, height: 40, color: '#FEA000' },
    { type: 'teller', x: 230, y: 50, width: 70, height: 40, color: '#FEA000' },
    { type: 'teller', x: 310, y: 50, width: 70, height: 40, color: '#FEA000' },
    { type: 'teller', x: 390, y: 50, width: 70, height: 40, color: '#FEA000' },
    
    // Red - Customer Service (left side, 4 squares)
    { type: 'customerService', x: 50, y: 150, width: 60, height: 60, color: '#CF3D58' },
    { type: 'customerService', x: 50, y: 230, width: 60, height: 60, color: '#CF3D58' },
    { type: 'customerService', x: 50, y: 310, width: 60, height: 60, color: '#CF3D58' },
    { type: 'customerService', x: 50, y: 390, width: 60, height: 60, color: '#CF3D58' },
    
    // Green - Waiting Area (center, 2 rows of 2 pairs)
    { type: 'waitingArea', x: 150, y: 150, width: 120, height: 60, color: '#00BFA6' },
    { type: 'waitingArea', x: 290, y: 150, width: 120, height: 60, color: '#00BFA6' },
    { type: 'waitingArea', x: 150, y: 230, width: 120, height: 60, color: '#00BFA6' },
    { type: 'waitingArea', x: 290, y: 230, width: 120, height: 60, color: '#00BFA6' },
    
    
    // Yellow - BEA Kiosks (right side, 3 rectangles)
    { type: 'beaKiosk', x: 480, y: 150, width: 80, height: 50, color: '#FEA000' },
    { type: 'beaKiosk', x: 480, y: 220, width: 80, height: 50, color: '#FEA000' },
    { type: 'beaKiosk', x: 480, y: 290, width: 80, height: 50, color: '#FEA000' },
    
    // Brown - ATMs (bottom-right, 2 squares)
    { type: 'atm', x: 480, y: 480, width: 60, height: 60, color: '#8B4513' },
    { type: 'atm', x: 560, y: 480, width: 60, height: 60, color: '#8B4513' },
    
    // Entrance
    { type: 'entrance', x: 220, y: 580, width: 100, height: 20, color: '#333' },
  ]
};

// Service points for each branch
export const branchServicePoints = {
  // Morayta FEU Branch service points
  "Morayta Feu": [
  // Orange - Teller positions (top row)
  { id: 1, name: 'Teller 1', x: 185, y: 70, type: 'teller', isActive: true },
  { id: 2, name: 'Teller 2', x: 265, y: 70, type: 'teller', isActive: true },
  { id: 3, name: 'Teller 3', x: 345, y: 70, type: 'teller', isActive: true },
  { id: 4, name: 'Teller 4', x: 425, y: 70, type: 'teller', isActive: true },
  
  // Red - Customer Service positions (left side)
  { id: 8, name: 'CS Rep 1', x: 80, y: 180, type: 'customerService', isActive: true },
  { id: 9, name: 'CS Rep 2', x: 80, y: 260, type: 'customerService', isActive: true },
  { id: 10, name: 'CS Rep 3', x: 80, y: 340, type: 'customerService', isActive: true },
  { id: 11, name: 'CS Rep 4', x: 80, y: 420, type: 'customerService', isActive: true },
  
  // Purple - Branch Manager position
  { id: 12, name: 'Branch Manager', x: 90, y: 90, type: 'manager', isActive: true },
  
  // Yellow - BEA Kiosk positions (right side)
  { id: 13, name: 'BEA Kiosk 1', x: 520, y: 175, type: 'beaKiosk', isActive: true },
  { id: 14, name: 'BEA Kiosk 2', x: 520, y: 245, type: 'beaKiosk', isActive: true },
  { id: 15, name: 'BEA Kiosk 3', x: 520, y: 315, type: 'beaKiosk', isActive: true },
  
  // Brown - ATM positions (bottom-right)
  { id: 16, name: 'ATM 1', x: 510, y: 510, type: 'atm', isActive: true },
  { id: 17, name: 'ATM 2', x: 590, y: 510, type: 'atm', isActive: true },
  ],
  
  // Corinthian Plaza Branch service points
"Corinthian Plaza": [
  // Orange - Teller positions (top row) - Updated to match furniture layout
  { id: 1, name: 'Teller 1', x: 200, y: 140, type: 'teller', isActive: true, serviceType: 'regular' },
  { id: 2, name: 'Teller 2', x: 280, y: 140, type: 'teller', isActive: true, serviceType: 'regular' },
  { id: 3, name: 'Teller 3', x: 360, y: 140, type: 'teller', isActive: true, serviceType: 'regular' },
  { id: 4, name: 'Bulk Teller', x: 440, y: 140, type: 'teller', isActive: true, serviceType: 'bulk' },
  { id: 5, name: 'Teller 5', x: 620, y: 140, type: 'teller', isActive: true, serviceType: 'regular' },
  
  // Red - Customer Service positions (bottom row) - Updated to match furniture
  { id: 8, name: 'CS Rep 1', x: 200, y: 550, type: 'customerService', isActive: true },
  { id: 9, name: 'CS Rep 2', x: 280, y: 550, type: 'customerService', isActive: true },
  { id: 10, name: 'CS Rep 3', x: 360, y: 550, type: 'customerService', isActive: true },
  { id: 11, name: 'CS Rep 4', x: 440, y: 550, type: 'customerService', isActive: true },
  { id: 19, name: 'CS Rep 5', x: 520, y: 550, type: 'customerService', isActive: true },
  
  // Purple - Branch Manager position (left side) - Updated to match furniture
  { id: 12, name: 'Branch Manager', x: 50, y: 220, type: 'manager', isActive: true },
  
  // Purple - Secretary position (left side) - Updated to match furniture
  { id: 20, name: 'Secretary', x: 50, y: 305, type: 'secretary', isActive: true },
  
  // Yellow - BEA Kiosk positions - Updated to match furniture layout
  { id: 13, name: 'BEA Kiosk 1', x: 230, y: 305, type: 'beaKiosk', isActive: true },
  { id: 14, name: 'BEA Kiosk 2', x: 610, y: 305, type: 'beaKiosk', isActive: true },
  { id: 15, name: 'BEA Kiosk 3', x: 70, y: 465, type: 'beaKiosk', isActive: true },
]
};

// Default service points (using Morayta as default)
export const servicePoints = branchServicePoints["Morayta Feu"];


// Different types of transactions - updated to reflect DashboardData.js, avgTimes matched with database
export const transactionTypes = [
  { 
    id: 1, 
    name: 'Withdrawal', 
    color: '#FEA000', 
    normalWait: 2.5, 
    peakWait: 6.0, 
    normalProcess: 2.5, 
    peakProcess: 3.5,
    percentage: 40 
  },
  { 
    id: 2, 
    name: 'Deposit', 
    color: '#CF3D58', 
    normalWait: 3.0, 
    peakWait: 8.0, 
    normalProcess: 3.0, 
    peakProcess: 4.5,
    percentage: 30 
  },
  { 
    id: 3, 
    name: 'Encashment', 
    color: '#C95A94', 
    normalWait: 4.0, 
    peakWait: 10.0, 
    normalProcess: 4.0, 
    peakProcess: 6.0,
    percentage: 10 
  },
  { 
    id: 4, 
    name: 'Transfer', 
    color: '#3B82F6', 
    normalWait: 2.5, 
    peakWait: 6.0, 
    normalProcess: 2.5, 
    peakProcess: 3.5,
    percentage: 5 
  },
  { 
    id: 5, 
    name: 'Customer service', 
    color: '#10B981', 
    normalWait: 5.0, 
    peakWait: 12.0, 
    normalProcess: 7.0, 
    peakProcess: 12.0,
    percentage: 5 
  },
  { 
    id: 6, 
    name: 'Account service', 
    color: '#06B6D4', 
    normalWait: 5.0, 
    peakWait: 12.0, 
    normalProcess: 7.0, 
    peakProcess: 12.0,
    percentage: 10 
  },
  { 
    id: 7, 
    name: 'Loan', 
    color: '#BC7EFF', 
    normalWait: 5.0, 
    peakWait: 12.0, 
    normalProcess: 7.0, 
    peakProcess: 12.0,
    percentage: 10 
  }
];

// Helper function to get timing based on peak/normal conditions
export const getTransactionTiming = (transactionType, isPeakTime = false) => {
  const transaction = transactionTypes.find(t => t.name.toLowerCase() === transactionType.toLowerCase());
  if (!transaction) return { waitTime: 3, processTime: 3 };
  
  return {
    waitTime: isPeakTime ? transaction.peakWait : transaction.normalWait,
    processTime: isPeakTime ? transaction.peakProcess : transaction.normalProcess
  };
};

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
  branchName: 'Morayta Feu',
  numberOfTellers: 4,
  numberOfCustomerServiceReps: 4, // Default 4, max 6
  
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

// Customer colors for visualization
export const customerColors = [
  '#4299e1', // Blue
  '#48bb78', // Green
  '#ed8936', // Orange
  '#9f7aea', // Purple
  '#f56565', // Red
  '#38b2ac', // Teal
  '#ed64a6', // Pink
  '#667eea', // Indigo
  '#f6ad55', // Yellow
  '#68d391', // Light Green
];

// Branch-specific locations for customer paths
const branchLocations = {
  "Morayta Feu": {
    entrance: { x: 260, y: 590, maxCapacity: 100 },
    teller1: { x: 185, y: 70, maxCapacity: 1 },
    teller2: { x: 265, y: 70, maxCapacity: 1 },
    teller3: { x: 345, y: 70, maxCapacity: 1 },
    teller4: { x: 425, y: 70, maxCapacity: 1 },
    customerService1: { x: 80, y: 180, maxCapacity: 1 },
    customerService2: { x: 80, y: 260, maxCapacity: 1 },
    customerService3: { x: 80, y: 340, maxCapacity: 1 },
    customerService4: { x: 80, y: 420, maxCapacity: 1 },
    bea1: { x: 520, y: 175, maxCapacity: 1 },
    bea2: { x: 520, y: 245, maxCapacity: 1 },
    bea3: { x: 520, y: 315, maxCapacity: 1 },
    waitingArea1: { x: 210, y: 180, maxCapacity: 4 },
    waitingArea2: { x: 350, y: 180, maxCapacity: 4 },
    waitingArea3: { x: 210, y: 260, maxCapacity: 4 },
    waitingArea4: { x: 350, y: 260, maxCapacity: 4 },
    exit: { x: 450, y: 590, maxCapacity: 100 }
  },
"Corinthian Plaza": {
  // Updated customer path coordinates to match furniture positions
  entrance: { x: 80, y: 550, maxCapacity: 100 }, // Inside entrance furniture
  
  // Teller positions - centered within teller furniture
  teller1: { x: 200, y: 130, maxCapacity: 1 }, // Inside teller furniture (170+30, 100+30)
  teller2: { x: 280, y: 130, maxCapacity: 1 }, // Inside teller furniture (250+30, 100+30)
  teller3: { x: 360, y: 130, maxCapacity: 1 }, // Inside teller furniture (330+30, 100+30)
  teller4: { x: 440, y: 130, maxCapacity: 1 }, // Inside bulk teller furniture (410+30, 100+30)
  teller5: { x: 620, y: 130, maxCapacity: 1 }, // Inside teller furniture (590+30, 100+30)
  
  // Customer Service positions - centered within customer service furniture
  customerService1: { x: 200, y: 550, maxCapacity: 1 }, // Inside CS furniture (170+30, 520+30)
  customerService2: { x: 280, y: 550, maxCapacity: 1 }, // Inside CS furniture (250+30, 520+30)
  customerService3: { x: 360, y: 550, maxCapacity: 1 }, // Inside CS furniture (330+30, 520+30)
  customerService4: { x: 440, y: 550, maxCapacity: 1 }, // Inside CS furniture (410+30, 520+30)
  customerService5: { x: 520, y: 550, maxCapacity: 1 }, // Inside CS furniture (490+30, 520+30)
  
  // BEA Kiosks - centered within BEA furniture
  bea1: { x: 230, y: 305, maxCapacity: 1 }, // Inside BEA furniture (190+40, 280+25)
  bea2: { x: 610, y: 305, maxCapacity: 1 }, // Inside BEA furniture (580+30, 280+25)
  bea3: { x: 70, y: 465, maxCapacity: 1 }, // Inside BEA furniture (30+40, 440+25)
  
  // Waiting Area positions - centered within waiting chair furniture
  waitingArea1: { x: 320, y: 370, maxCapacity: 1 }, // Bottom left chair (300+20, 350+20)
  waitingArea2: { x: 370, y: 370, maxCapacity: 1 }, // Bottom middle chair (350+20, 350+20)
  waitingArea3: { x: 420, y: 370, maxCapacity: 1 }, // Bottom right chair (400+20, 350+20)
  waitingArea4: { x: 370, y: 320, maxCapacity: 1 }, // Middle left chair (350+20, 300+20)
  waitingArea5: { x: 420, y: 320, maxCapacity: 1 }, // Middle right chair (400+20, 300+20)
  waitingArea6: { x: 420, y: 270, maxCapacity: 1 }, // Top chair (400+20, 250+20)
  
  // Additional waiting areas for queue management
  generalWaitingArea: { x: 370, y: 330, maxCapacity: 10 }, // Central waiting area
  
  // Exit same as entrance
  exit: { x: 80, y: 550, maxCapacity: 100 }
}
};

// Updated customer path structure with proper state tracking
export const generateCustomerPaths = (count, isPeakTime = false, branchName = "Morayta Feu") => {
  const paths = [];
  
  // Define key locations (use spread to avoid reference issues)
  const locations = branchLocations[branchName] || branchLocations["Morayta Feu"];
  
  for (let i = 0; i < count; i++) {
    // Select transaction and get timing
    const randomValue = Math.random() * 100;
    let cumulativePercentage = 0;
    let selectedTransaction = transactionTypes[0];
    
    for (const transaction of transactionTypes) {
      cumulativePercentage += transaction.percentage;
      if (randomValue <= cumulativePercentage) {
        selectedTransaction = transaction;
        break;
      }
    }
    
    const timing = getTransactionTiming(selectedTransaction.name, isPeakTime);
    let path = [];
    let waitingAreaIndex = -1;
    let serviceAreaIndex = -1;
    
    // Build path based on transaction type and branch
    if (branchName === "Corinthian Plaza") {
      // Corinthian Plaza specific paths
      switch (selectedTransaction.name.toLowerCase()) {
        case 'deposit':
        case 'encashment':
        case 'withdrawal':
        case 'transfer':
          // Use only available BEA kiosks for Corinthian
          const beaOptions = Object.keys(locations).filter(key => key.startsWith('bea'));
          const selectedBEA = beaOptions[Math.floor(Math.random() * beaOptions.length)];
          
          // Use available waiting areas
          const waitingOptions = Object.keys(locations).filter(key => key.startsWith('waitingArea'));
          const selectedWaiting = waitingOptions[Math.floor(Math.random() * waitingOptions.length)];
          
          // Use available tellers
          const tellerOptions = Object.keys(locations).filter(key => key.startsWith('teller'));
          const selectedTeller = tellerOptions[Math.floor(Math.random() * tellerOptions.length)];
          
          path = [
            { ...locations.entrance },
            { ...locations[selectedBEA] },
            { ...locations[selectedWaiting] },
            { ...locations[selectedTeller] },
            { ...locations.exit }
          ];
          waitingAreaIndex = 2; // waiting area is 3rd step (index 2)
          serviceAreaIndex = 3; // service area is 4th step (index 3)
          break;
          
        case 'customer service':
        case 'account service':
        case 'loan':
          // Use available customer service reps
          const csOptions = Object.keys(locations).filter(key => key.startsWith('customerService'));
          const selectedCS = csOptions[Math.floor(Math.random() * csOptions.length)];
          
          path = [
            { ...locations.entrance },
            { ...locations[selectedCS] },
            { ...locations.exit }
          ];
          serviceAreaIndex = 1; // service area is 2nd step (index 1)
          break;
      }
    } else {
      // Default Morayta FEU paths
      switch (selectedTransaction.name.toLowerCase()) {
        case 'deposit':
        case 'encashment':
        case 'withdrawal':
        case 'transfer':
          const beaOptions = ['bea1', 'bea2', 'bea3'];
          const selectedBEA = beaOptions[Math.floor(Math.random() * beaOptions.length)];
          const waitingOptions = ['waitingArea1', 'waitingArea2', 'waitingArea3', 'waitingArea4'];
          const selectedWaiting = waitingOptions[Math.floor(Math.random() * waitingOptions.length)];
          const tellerOptions = ['teller1', 'teller2', 'teller3', 'teller4'];
          const selectedTeller = tellerOptions[Math.floor(Math.random() * tellerOptions.length)];
          
          path = [
            { ...locations.entrance },
            { ...locations[selectedBEA] },
            { ...locations[selectedWaiting] },
            { ...locations[selectedTeller] },
            { ...locations.exit }
          ];
          waitingAreaIndex = 2; // waiting area is 3rd step (index 2)
          serviceAreaIndex = 3; // service area is 4th step (index 3)
          break;
          
        case 'customer service':
        case 'account service':
        case 'loan':
          const csOptions = ['customerService1', 'customerService2', 'customerService3', 'customerService4'];
          const selectedCS = csOptions[Math.floor(Math.random() * csOptions.length)];
          
          path = [
            { ...locations.entrance },
            { ...locations[selectedCS] },
            { ...locations.exit }
          ];
          serviceAreaIndex = 1; // service area is 2nd step (index 1)
          break;
      }
    }
    
    paths.push({
      id: i,
      path,
      startTime: i * (2 + Math.random() * 3),
      transaction: selectedTransaction,
      color: customerColors[i % customerColors.length],
      
      // Movement tracking
      currentStep: 0,
      currentPosition: { ...path[0] },
      targetPosition: { ...path[1] },
      
      // State tracking
      state: 'moving', // 'moving', 'waiting', 'being_served', 'completed'
      waitingAreaIndex,
      serviceAreaIndex,
      
      // Timing
      waitingTime: timing.waitTime * 60 * 1000, // Convert to milliseconds
      serviceTime: timing.processTime * 60 * 1000, // Convert to milliseconds
      stateStartTime: 0,
      
      isComplete: false
    });
  }
  
  return paths;
};

// Customer update function for animation loop
export const updateCustomerPosition = (customer, currentTime, deltaTime) => {
  if (customer.isComplete) return customer;
  
  const speed = 50;
  
  switch (customer.state) {
    case 'moving':
      const dx = customer.targetPosition.x - customer.currentPosition.x;
      const dy = customer.targetPosition.y - customer.currentPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        // Reached target
        customer.currentPosition = { ...customer.targetPosition };
        
        // Check what area we just reached
        if (customer.currentStep === customer.waitingAreaIndex) {
          customer.state = 'waiting';
          customer.stateStartTime = currentTime;
        }
        else if (customer.currentStep === customer.serviceAreaIndex) {
          customer.state = 'being_served';
          customer.stateStartTime = currentTime;
        }
        else {
          // Normal movement - go to next step
          customer.currentStep++;
          if (customer.currentStep >= customer.path.length) {
            customer.state = 'completed';
            customer.isComplete = true;
          } else {
            customer.targetPosition = { ...customer.path[customer.currentStep] };
          }
        }
      } else {
        // Continue moving
        const moveDistance = speed * (deltaTime / 1000);
        const ratio = Math.min(moveDistance / distance, 1);
        customer.currentPosition.x += dx * ratio;
        customer.currentPosition.y += dy * ratio;
      }
      break;
      
    case 'waiting':
      if (currentTime - customer.stateStartTime >= customer.waitingTime) {
        customer.state = 'moving';
        customer.currentStep++; // Move to next step
        customer.targetPosition = { ...customer.path[customer.currentStep] };
      }
      break;
      
    case 'being_served':
      if (currentTime - customer.stateStartTime >= customer.serviceTime) {
        customer.state = 'moving';
        customer.currentStep++; // Move to next step
        if (customer.currentStep >= customer.path.length) {
          customer.state = 'completed';
          customer.isComplete = true;
        } else {
          customer.targetPosition = { ...customer.path[customer.currentStep] };
        }
      }
      break;
  }
  
  return customer;
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