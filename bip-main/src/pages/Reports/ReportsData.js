// Sample data for customer reviews and CSAT scores

// Available branch cities for filtering
export const cities = [
  "Caloocan",
  "Makati",
  "Manila",
  "Pasay",
  "Pasig",
  "Quezon City",
  "Taguig"
];

// Available branch names for filtering
export const branchNames = [
  "C3 A Mabini",
  "Caloocan",
  "Caloocan Camarin Susano",
  "EDSA - Monumento",
  "Pasay",
  "Quezon Avenue",
  "Rizal Avenue Extension",
  "Buendia Makati",
  "Ayala Triangle",
  "Ortigas Center",
  "BGC Main",
  "SM North EDSA",
  "Trinoma",
  "Manila Chinatown"
];

// CSAT sentiment labels
export const sentimentLabels = ["Positive", "Neutral", "Negative"];

// Helper function to get sentiment color
export const getSentimentColor = (score) => {
  if (score >= 80) return "#00BFA6"; // Green for positive
  if (score >= 60) return "#FEA000"; // Orange for neutral
  return "#CF3D58"; // Red for negative
};

// Helper function to get sentiment category
export const getSentimentCategory = (score) => {
  if (score >= 80) return "Positive";
  if (score >= 60) return "Neutral";
  return "Negative";
};

// Mock customer reviews data
export const customerReviews = [
  {
    id: 1,
    branchName: "C3 A Mabini",
    city: "Caloocan",
    customerId: "#N001",
    date: "2023-10-15",
    rating: 95,
    comment: "Sobrang bilis ng service sa branch na to! Hindi ako naghintay ng matagal at ang galing ng staff. Very accommodating sila at hindi nagmamadali. Malinis din ang branch at may social distancing pa rin.",
    tags: ["Fast Service", "Friendly Staff", "Clean"]
  },
  {
    id: 2,
    branchName: "Buendia Makati",
    city: "Makati",
    customerId: "#N002",
    date: "2023-10-12",
    rating: 75,
    comment: "Overall okay ang experience ko. Medyo matagal ang pila pero understandable naman kasi maraming tao. Ang staff ay helpful kahit busy sila. May suggestion lang ako na dagdagan pa ang tellers para mas mabilis.",
    tags: ["Average Wait Time", "Helpful Staff"]
  },
  {
    id: 3,
    branchName: "Quezon Avenue",
    city: "Quezon City",
    customerId: "#B001",
    date: "2023-10-10",
    rating: 45,
    comment: "Sobrang tagal ng process. Nasa pila ako for almost 2 hours para lang sa simple transaction. Need more tellers and better system para di masyadong matagal maghintay ang customers.",
    tags: ["Long Wait Time", "Understaffed"]
  },
  {
    id: 4,
    branchName: "BGC Main",
    city: "Taguig",
    customerId: "#N003",
    date: "2023-10-14",
    rating: 90,
    comment: "Excellent branch! Modern facilities and the staff are very professional. I was able to complete my transaction quickly. The branch manager even helped me with some questions about their investment products.",
    tags: ["Modern Facilities", "Professional Staff", "Quick Service"]
  },
  {
    id: 5,
    branchName: "Manila Chinatown",
    city: "Manila",
    customerId: "#B002",
    date: "2023-10-11",
    rating: 65,
    comment: "The branch is quite crowded but the staff are trying their best. I appreciate how they assist senior citizens by prioritizing them. However, they need to improve their queue system.",
    tags: ["Crowded", "Helpful Staff", "Queue System"]
  },
  {
    id: 6,
    branchName: "Ortigas Center",
    city: "Pasig",
    customerId: "#N004",
    date: "2023-10-09",
    rating: 85,
    comment: "I'm impressed with how efficient this branch is. Everything is well-organized and the staff are knowledgeable. I just wish they had more parking spaces available for customers.",
    tags: ["Efficient", "Knowledgeable Staff", "Parking Issues"]
  },
  {
    id: 7,
    branchName: "SM North EDSA",
    city: "Quezon City",
    customerId: "#B003",
    date: "2023-10-13",
    rating: 50,
    comment: "Hindi ako satisfied sa customer service. The staff seemed disinterested and I had to repeat my concerns several times. Hindi rin maayos ang explanation sa mga questions ko about account maintenance.",
    tags: ["Poor Service", "Unresponsive Staff"]
  },
  {
    id: 8,
    branchName: "EDSA - Monumento",
    city: "Caloocan",
    customerId: "#N005",
    date: "2023-10-08",
    rating: 95,
    comment: "Best branch experience ever! Super bilis ng transaction ko and very professional lahat ng staff. The security guards were also helpful and friendly. Definitely my preferred branch from now on.",
    tags: ["Fast Service", "Professional Staff", "Friendly Security"]
  },
  {
    id: 9,
    branchName: "Ayala Triangle",
    city: "Makati",
    customerId: "#N006",
    date: "2023-10-07",
    rating: 80,
    comment: "Good experience overall. The branch is clean and well-maintained. Staff are friendly and efficient. Would be better if they open more counters during lunch hours when more people come in.",
    tags: ["Clean", "Friendly Staff", "Peak Hour Issues"]
  },
  {
    id: 10,
    branchName: "Trinoma",
    city: "Quezon City",
    customerId: "#B004",
    date: "2023-10-06",
    rating: 30,
    comment: "Very disappointing experience. Pumunta ako para mag-deposit pero sabi sakin balik na lang daw ako bukas kasi may system maintenance. Wala man lang prior notice or announcement online. Sayang oras at pamasahe ko.",
    tags: ["System Issues", "Poor Communication", "Wasted Time"]
  },
  {
    id: 11,
    branchName: "Rizal Avenue Extension",
    city: "Caloocan",
    customerId: "#N007",
    date: "2023-10-16",
    rating: 70,
    comment: "Okay naman ang service pero medyo mahaba ang pila. The staff are courteous and the branch is clean. Siguro kung mas maraming digital options para sa simple transactions mas mabilis.",
    tags: ["Long Queue", "Courteous Staff", "Clean"]
  },
  {
    id: 12,
    branchName: "Pasay",
    city: "Pasay",
    customerId: "#N008",
    date: "2023-10-17",
    rating: 55,
    comment: "Average lang. Hindi masyadong maayos ang aircon sa branch at mainit. The transaction was completed but took longer than expected. Staff were okay but seemed stressed.",
    tags: ["Facility Issues", "Slow Service", "Stressed Staff"]
  }
];

// CSAT summary data
export const csatSummary = {
  overallScore: 70,
  totalReviews: 120,
  positiveFeedback: 78,
  neutralFeedback: 25,
  negativeFeedback: 17,
  topPerformer: {
    branchName: "C3 A Mabini",
    city: "Caloocan",
    score: 93
  },
  needsImprovement: {
    branchName: "Trinoma",
    city: "Quezon City",
    score: 42
  },
  commonTags: {
    positive: ["Fast Service", "Professional Staff", "Clean", "Helpful Staff"],
    neutral: ["Average Wait Time", "Crowded", "Peak Hour Issues"],
    negative: ["Long Wait Time", "System Issues", "Poor Communication"]
  }
};

// Monthly trend data
export const monthlyTrends = [
  { month: "Jan", score: 68 },
  { month: "Feb", score: 67 },
  { month: "Mar", score: 70 },
  { month: "Apr", score: 72 },
  { month: "May", score: 74 },
  { month: "Jun", score: 71 },
  { month: "Jul", score: 69 },
  { month: "Aug", score: 70 },
  { month: "Sep", score: 73 },
  { month: "Oct", score: 70 }
];

// City performance data
export const cityPerformance = [
  { city: "Caloocan", score: 85 },
  { city: "Makati", score: 79 },
  { city: "Manila", score: 65 },
  { city: "Pasay", score: 55 },
  { city: "Pasig", score: 85 },
  { city: "Quezon City", score: 62 },
  { city: "Taguig", score: 90 }
];