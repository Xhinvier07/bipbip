import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  XCircle, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import DotGrid from '../../components/DotGrid';
import BranchMap from './BranchMap';
import BranchDetails from './BranchDetails';
import BranchList from './BranchList';
import './Branches.css';

// Function to fetch and parse the JSON data
async function fetchBranchData() {
  try {
    const response = await fetch('/branch.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to load branch data:", error);
    
    // Fallback to hardcoded data for development
    return [
      {
        city: "Caloocan",
        branch_name: "C3 A Mabini",
        address: "193 A. MABINI ST., BRGY 30, MAYPAJO, CALOOCAN CITY",
        latitude: 14.6402736,
        longitude: 120.973027
      },
      {
        city: "Caloocan",
        branch_name: "Caloocan",
        address: "1350-1352 Rizal Ave Extn ( between 6th & 7th Ave.), Brgy. 110 Gracepark, Caloocan City 1400",
        latitude: 14.6460235,
        longitude: 120.9835707
      },
      {
        city: "Caloocan",
        branch_name: "Caloocan Camarin Susano",
        address: "Unit 1 Ground Floor, Aryanna Village Center, Brgy 175, Susano Road, Camarin, Caloocan City 1400",
        latitude: 14.7559063,
        longitude: 120.0368598
      },
      {
        city: "Caloocan",
        branch_name: "EDSA - Monumento",
        address: "MCU Compound, EDSA Monumento, Barangay 84, Caloocan City 1400",
        latitude: 14.6574292,
        longitude: 120.9831961
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
    // Filter branches based on search query
    if (searchQuery.trim() === '') {
      setFilteredBranches(branches);
    } else {
      const filtered = branches.filter(branch => 
        branch.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBranches(filtered);
    }
  }, [searchQuery, branches]);

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
        {/* Main container with map and sidepanels */}
        <div className="branches-container">
          {/* Left panel - Branch list */}
          <div className={`branch-list-panel ${isListCollapsed ? 'collapsed' : ''}`}>
            <div className="panel-header">
              <h2>Branch Locations</h2>
              <div className="search-container">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  ref={searchInputRef}
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="clear-search" onClick={clearSearch}>
                    <XCircle size={14} />
                  </button>
                )}
              </div>
              
              <div className="sort-dropdown">
                <div className="sort-label">Sort by</div>
                <div className="dropdown">
                  <button className="dropdown-toggle" onClick={toggleDropdown}>
                    {sortBy === 'city' ? 'City' : 'Branch Name'} 
                    <ChevronDown size={14} />
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
            
            {/* Branch listing */}
            <BranchList 
              branches={displayedBranches} 
              totalCount={filteredBranches.length}
              selectedBranch={selectedBranch}
              onSelectBranch={handleBranchSelect}
              onLoadMore={loadMoreBranches}
              hasMore={displayedBranches.length < filteredBranches.length}
            />
            
            {/* Toggle tab for list panel */}
            <div className="panel-toggle list-toggle" onClick={toggleListCollapse}>
              <div className="toggle-icon">
                {isListCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </div>
            </div>
          </div>
          
          {/* Center - Map container */}
          <div className="map-container">
            <BranchMap 
              branches={filteredBranches} 
              selectedBranch={selectedBranch} 
              onSelectBranch={handleBranchSelect}
              apiKey="AIzaSyD9Kl7Ws53pJIcg1vZTfcVWWBITACUjc9c"
            />
          </div>
          
          {/* Right panel - Branch details */}
          {selectedBranch && (
            <div className={`branch-details-panel ${isDetailsCollapsed ? 'collapsed' : ''}`}>
              <BranchDetails branch={selectedBranch} />
              
              {/* Toggle tab for details panel */}
              <div className="panel-toggle details-toggle" onClick={toggleDetailsCollapse}>
                <div className="toggle-icon">
                  {isDetailsCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Branches;