import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, BarChart2, Clock, Users, RefreshCw, Search, ArrowDownToLine, Filter, ChevronDown, ChevronUp, Database, AlertCircle } from 'lucide-react';
import { fetchMainSheetData } from '../Dashboard/GoogleSheetsService';

const BEALogs = () => {
  const [beaData, setBEAData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'branch_name', direction: 'asc' });
  const [cityFilter, setCityFilter] = useState('all');
  const [availableCities, setAvailableCities] = useState([]);
  const [showCityFilter, setShowCityFilter] = useState(false);

  // Fetch BEA data
  useEffect(() => {
    fetchBEAData();
  }, []);

  // Apply search and filters when data, search query or city filter changes
  useEffect(() => {
    applyFilters();
  }, [beaData, searchQuery, cityFilter]);

  const fetchBEAData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from the Main sheet
      const data = await fetchMainSheetData();
      setBEAData(data);
      
      // Extract unique cities for filtering
      const cities = [...new Set(data.map(item => item.city))].filter(Boolean).sort();
      setAvailableCities(['All Cities', ...cities]);
    } catch (error) {
      console.error("Error fetching BEA data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...beaData];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.branch_name.toLowerCase().includes(query) ||
        item.city.toLowerCase().includes(query)
      );
    }
    
    // Apply city filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(item => item.city.toLowerCase() === cityFilter.toLowerCase());
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredData(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleCityFilter = (city) => {
    setCityFilter(city === 'All Cities' ? 'all' : city);
    setShowCityFilter(false);
  };

  const toggleCityFilter = () => {
    setShowCityFilter(!showCityFilter);
  };

  const exportData = () => {
    if (filteredData.length === 0) return;
    
    const headers = [
      'City', 
      'Branch Name', 
      'Avg Waiting Time', 
      'Avg Processing Time', 
      'Avg Transaction Time', 
      'Transaction Count', 
      'Sentiment Score', 
      'BHS'
    ];
    
    const csvData = [
      headers.join(','),
      ...filteredData.map(item => [
        `"${item.city || ''}"`,
        `"${item.branch_name || ''}"`,
        item.avg_waiting_time || 0,
        item.avg_processing_time || 0,
        item.avg_transaction_time || 0,
        item.transaction_count || 0,
        item.sentiment_score || 0,
        item.bhs || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bip-bea-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    fetchBEAData();
  };

  // Helper function to determine cell color based on value
  const getBHSColor = (bhs) => {
    if (bhs < 45) return '#CF3D58'; // Red
    if (bhs < 85) return '#FEA000'; // Orange
    return '#10B981'; // Green
  };

  const getWaitTimeColor = (waitTime) => {
    if (waitTime > 15) return '#CF3D58'; // Red
    if (waitTime > 10) return '#FEA000'; // Orange
    return '#10B981'; // Green
  };

  return (
    <div className="bea-logs-content">
      <div className="bea-card">
        <div className="bea-logs-header">
          <div className="bea-title">
            <Building2 size={24} />
            <h3>BEA Transaction Data</h3>
          </div>
          
          <div className="bea-actions">
            <button 
              className="action-button refresh"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'rotating' : ''} />
              <span>Refresh</span>
            </button>
            
            <button 
              className="action-button export"
              onClick={exportData}
              disabled={filteredData.length === 0}
            >
              <ArrowDownToLine size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="bea-description">
          <AlertCircle size={16} />
          <p>BEA (BPI Express Assist) transaction data showing branch performance metrics and wait times.</p>
        </div>
      </div>
      
      <div className="bea-toolbar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              <ChevronUp size={18} />
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <button
            className="filter-button"
            onClick={toggleCityFilter}
          >
            <Filter size={16} />
            <span>{cityFilter === 'all' ? 'All Cities' : cityFilter}</span>
            {showCityFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          {showCityFilter && (
            <div className="city-filter-dropdown">
              {availableCities.map(city => (
                <div 
                  key={city} 
                  className={`city-option ${cityFilter === (city === 'All Cities' ? 'all' : city) ? 'active' : ''}`}
                  onClick={() => handleCityFilter(city)}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bea-meta">
        <div className="bea-count">
          <span>Showing {filteredData.length} branches</span>
          {beaData.length !== filteredData.length && (
            <span className="filtered-info">
              (filtered from {beaData.length})
            </span>
          )}
        </div>
        <div className="bea-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#CF3D58' }}></span>
            <span>Critical (&lt;45)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FEA000' }}></span>
            <span>Warning (&lt;85)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#10B981' }}></span>
            <span>Good (≥85)</span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="bea-loading">
          <RefreshCw size={24} className="rotating" />
          <span>Loading data...</span>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="no-data">
          <Building2 size={24} />
          <h3>No branch data found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="bea-table-container">
          <table className="bea-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('city')} className={sortConfig.key === 'city' ? `sorted-${sortConfig.direction}` : ''}>
                  City 
                  {sortConfig.key === 'city' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('branch_name')} className={sortConfig.key === 'branch_name' ? `sorted-${sortConfig.direction}` : ''}>
                  Branch Name
                  {sortConfig.key === 'branch_name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('avg_waiting_time')} className={sortConfig.key === 'avg_waiting_time' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Clock size={14} />
                    <span>Avg Wait Time</span>
                    {sortConfig.key === 'avg_waiting_time' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('avg_processing_time')} className={sortConfig.key === 'avg_processing_time' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Clock size={14} />
                    <span>Avg Processing</span>
                    {sortConfig.key === 'avg_processing_time' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('avg_transaction_time')} className={sortConfig.key === 'avg_transaction_time' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Clock size={14} />
                    <span>Avg Total Time</span>
                    {sortConfig.key === 'avg_transaction_time' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('transaction_count')} className={sortConfig.key === 'transaction_count' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Database size={14} />
                    <span>Transactions</span>
                    {sortConfig.key === 'transaction_count' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('sentiment_score')} className={sortConfig.key === 'sentiment_score' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Users size={14} />
                    <span>Sentiment</span>
                    {sortConfig.key === 'sentiment_score' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('bhs')} className={sortConfig.key === 'bhs' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <BarChart2 size={14} />
                    <span>BHS</span>
                    {sortConfig.key === 'bhs' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <motion.tr 
                  key={`${item.branch_name}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <td>{item.city || '-'}</td>
                  <td className="branch-name-cell">{item.branch_name || '-'}</td>
                  <td className="numeric-cell">
                    <span className="wait-time-badge" style={{ 
                      color: getWaitTimeColor(item.avg_waiting_time),
                      backgroundColor: `${getWaitTimeColor(item.avg_waiting_time)}15`
                    }}>
                      {Math.round(item.avg_waiting_time) || '-'} min
                    </span>
                  </td>
                  <td className="numeric-cell">
                    {Math.round(item.avg_processing_time) || '-'} min
                  </td>
                  <td className="numeric-cell">
                    {Math.round(item.avg_transaction_time) || '-'} min
                  </td>
                  <td className="numeric-cell">
                    {item.transaction_count?.toLocaleString() || '-'}
                  </td>
                  <td className="numeric-cell">
                    {item.sentiment_score ? Math.round(item.sentiment_score) : '-'}
                  </td>
                  <td>
                    <div className="bhs-cell" style={{ 
                      color: getBHSColor(item.bhs),
                      backgroundColor: `${getBHSColor(item.bhs)}15`
                    }}>
                      {Math.round(item.bhs) || '-'}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BEALogs;
