import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, ChevronLeft, ChevronRight, PanelLeftOpen, PanelLeftClose, Menu, Filter, MapPin } from 'lucide-react';
import DotGrid from '../../components/DotGrid';
import BranchMap from './BranchMap';
import BranchDetails from './BranchDetails';
import BranchList from './BranchList';
import { fetchBranchMetrics, getBranchCities } from './BranchDataService';
import './Branches.css';

// Function to fetch branch data from Google Sheets
async function fetchBranchData() {
  try {
    const branchMetrics = await fetchBranchMetrics();
    
    if (!branchMetrics || branchMetrics.length === 0) {
      throw new Error("No branch data available");
    }
    
    return branchMetrics;
  } catch (error) {
    console.error("Failed to load branch data:", error);
    
    // Fallback to hardcoded data for development
    return [
      {
        city: "Caloocan",
        branch_name: "C3 A Mabini",
        address: "193 A. MABINI ST., BRGY 30, MAYPAJO, CALOOCAN CITY",
        latitude: 14.6402736,
        longitude: 120.973027,
        daily_transactions: 245,
        avg_waiting_time: 12,
        bhs: 78,
        staff_utilization: 85
      },
      {
        city: "Caloocan",
        branch_name: "Caloocan",
        address: "1350-1352 Rizal Ave Extn ( between 6th & 7th Ave.), Brgy. 110 Gracepark, Caloocan City 1400",
        latitude: 14.6460235,
        longitude: 120.9835707,
        daily_transactions: 178,
        avg_waiting_time: 8,
        bhs: 92,
        staff_utilization: 76
      },
      {
        city: "Caloocan",
        branch_name: "Caloocan Camarin Susano",
        address: "Unit 1 Ground Floor, Aryanna Village Center, Brgy 175, Susano Road, Camarin, Caloocan City 1400",
        latitude: 14.7559063,
        longitude: 120.0368598,
        daily_transactions: 132,
        avg_waiting_time: 15,
        bhs: 65,
        staff_utilization: 92
      },
      {
        city: "Caloocan",
        branch_name: "EDSA - Monumento",
        address: "MCU Compound, EDSA Monumento, Barangay 84, Caloocan City 1400",
        latitude: 14.6574292,
        longitude: 120.9831961,
        daily_transactions: 287,
        avg_waiting_time: 18,
        bhs: 72,
        staff_utilization: 95
      }
    ];
  }
}

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [displayedBranches, setDisplayedBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('city');
  const [cityFilter, setCityFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(true);
  const [visibleBranchCount, setVisibleBranchCount] = useState(5); // Show only 5 branches initially
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    // Load branch data from JSON
    fetchBranchData().then(data => {
      // For branches without coordinates, add random ones for demo purposes
      const branchesWithCoordinates = data.map(branch => {
        if (!branch.latitude || !branch.longitude) {
          return {
            ...branch,
            latitude: 14.5995 + (Math.random() - 0.5) * 0.2,
            longitude: 120.9842 + (Math.random() - 0.5) * 0.2
          };
        }
        // Convert string coordinates to numbers if they're strings
        return {
          ...branch,
          latitude: typeof branch.latitude === 'string' ? parseFloat(branch.latitude) : branch.latitude,
          longitude: typeof branch.longitude === 'string' ? parseFloat(branch.longitude) : branch.longitude
        };
      });
      setBranches(branchesWithCoordinates);
      setFilteredBranches(branchesWithCoordinates);
      setDisplayedBranches(branchesWithCoordinates.slice(0, visibleBranchCount));
    });
  }, []);

  useEffect(() => {
    // Filter branches based on search query and city filter
    let filtered = [...branches];
    
    // Apply search filter if any
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(branch => 
        branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply city filter if not 'all'
    if (cityFilter !== 'all') {
      filtered = filtered.filter(branch => 
        branch.city.toLowerCase() === cityFilter.toLowerCase()
      );
    }
    
    setFilteredBranches(filtered);
  }, [searchQuery, branches, cityFilter]);

  useEffect(() => {
    // Sort branches
    const sortedBranches = [...filteredBranches].sort((a, b) => {
      if (sortBy === 'city') {
        return a.city.localeCompare(b.city);
      } else if (sortBy === 'name') {
        return a.branch_name.localeCompare(b.branch_name);
      }
      return 0;
    });
    
    setFilteredBranches(sortedBranches);
    setDisplayedBranches(sortedBranches.slice(0, visibleBranchCount));
  }, [sortBy, filteredBranches.length]);
  
  useEffect(() => {
    // Update displayed branches when filter changes or visible count changes
    setDisplayedBranches(filteredBranches.slice(0, visibleBranchCount));
  }, [filteredBranches, visibleBranchCount]);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setIsDetailsCollapsed(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Reset visible count when searching
    setVisibleBranchCount(5);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsDropdownOpen(false);
  };
  
  const handleCityFilter = (city) => {
    setCityFilter(city);
    setIsDropdownOpen(false);
    // Reset visible count when filtering
    setVisibleBranchCount(5);
  };
  
  // Expose the handleCityFilter to be used by the BranchList component
  useEffect(() => {
    window.handleCityFilter = handleCityFilter;
    return () => {
      delete window.handleCityFilter;
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleListCollapse = () => {
    setIsListCollapsed(!isListCollapsed);
  };
  
  const toggleDetailsCollapse = () => {
    setIsDetailsCollapsed(!isDetailsCollapsed);
  };
  
  const loadMoreBranches = () => {
    setVisibleBranchCount(prevCount => prevCount + 5);
  };

  return (
    <div className="branches-page">
      {/* Background */}
      <div className="branches-background">
        <DotGrid color="#bc7eff" />
      </div>
      
      <div className="branches-content">
        <div className="branches-container branches-redesign">
          {/* Map section with search and branch list */}
          <div className={`map-section ${isListCollapsed ? 'list-collapsed' : ''}`}>
            <div className="map-controls">
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  ref={searchInputRef}
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input-branch"
                />
                {searchQuery && (
                  <button className="clear-search" onClick={clearSearch}>
                    <X size={18} />
                  </button>
                )}
              </div>
              
              <div className="sort-container">
                <span>Sort by</span>
                <div className="dropdown">
                  <button className="dropdown-toggle" onClick={toggleDropdown}>
                    <Filter size={16} className="sort-icon" />
                    {sortBy === 'city' ? 'City' : 'Branch Name'} 
                    <ChevronDown size={16} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <button 
                        className={`dropdown-item ${sortBy === 'city' ? 'active' : ''}`}
                        onClick={() => handleSortChange('city')}
                      >
                        City
                      </button>
                      <button 
                        className={`dropdown-item ${sortBy === 'name' ? 'active' : ''}`}
                        onClick={() => handleSortChange('name')}
                      >
                        Branch Name
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="map-content">
              {/* Branch list panel */}
              <AnimatePresence>
                {!isListCollapsed && (
                                      <motion.div 
                    className="branch-list-panel"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <BranchList 
                      branches={displayedBranches} 
                      totalCount={filteredBranches.length}
                      selectedBranch={selectedBranch}
                      onSelectBranch={handleBranchSelect}
                      onLoadMore={loadMoreBranches}
                      hasMore={displayedBranches.length < filteredBranches.length}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Map */}
              <div className="map-container">
                <BranchMap 
                  branches={filteredBranches} 
                  selectedBranch={selectedBranch} 
                  onSelectBranch={handleBranchSelect}
                  apiKey="AIzaSyD9Kl7Ws53pJIcg1vZTfcVWWBITACUjc9c"
                />
              </div>
              
              {/* Always visible toggle button for branch list using panel icons */}
              <button 
                className={`collapse-toggle-btn list-toggle ${isListCollapsed ? 'collapsed' : ''}`}
                onClick={toggleListCollapse}
                aria-label={isListCollapsed ? "Show branch list" : "Hide branch list"}
              >
                {isListCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>
          </div>
          
          {/* Branch details section (visible when branch is selected) */}
          <AnimatePresence>
            {selectedBranch && (
              <motion.div 
                className={`branch-details-section ${isDetailsCollapsed ? 'details-collapsed' : ''}`}
                initial={{ opacity: 0, width: 0 }}
                animate={{ 
                  opacity: 1, 
                  width: isDetailsCollapsed ? 0 : 320
                }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Always visible toggle button for branch details using panel icons */}
                <button 
                  className={`collapse-toggle-btn details-toggle ${isDetailsCollapsed ? 'collapsed' : ''}`}
                  onClick={toggleDetailsCollapse}
                  aria-label={isDetailsCollapsed ? "Show branch details" : "Hide branch details"}
                >
                  {isDetailsCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
                
                {!isDetailsCollapsed && (
                  <BranchDetails branch={selectedBranch} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Branches;