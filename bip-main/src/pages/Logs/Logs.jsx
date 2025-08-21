import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  Info, 
  Terminal, 
  Shield, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Download, 
  RefreshCw,
  Calendar,
  FileText,
  ArrowDownToLine,
  XCircle,
  CheckCircle,
  Database,
  ExternalLink,
  Building2,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { fetchMainSheetData } from '../Dashboard/GoogleSheetsService';

import './Logs.css';
import { generateMockLogs } from './LogsData';
import BEALogs from './BEALogs';
import TransactionLogs from './TransactionLogs';

const Logs = () => {
  const [activeTab, setActiveTab] = useState('system'); // 'system', 'bea', or 'transactions'
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    level: 'all',
    category: 'all',
    timeRange: '24h'
  });
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [timeRangeLabel, setTimeRangeLabel] = useState('Last 24 Hours');
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date()
  });
  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'table'
  
  const logEndRef = useRef(null);
  const refreshTimerRef = useRef(null);
  
  // Level options
  const logLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'info', label: 'Information', icon: <Info size={14} /> },
    { value: 'warning', label: 'Warning', icon: <AlertTriangle size={14} /> },
    { value: 'error', label: 'Error', icon: <XCircle size={14} /> },
    { value: 'success', label: 'Success', icon: <CheckCircle size={14} /> }
  ];
  
  // Category options
  const logCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'user', label: 'User Activity', icon: <User size={14} /> },
    { value: 'transaction', label: 'Transactions', icon: <Database size={14} /> },
    { value: 'system', label: 'System Events', icon: <Terminal size={14} /> },
    { value: 'security', label: 'Security', icon: <Shield size={14} /> },
    { value: 'api', label: 'API Calls', icon: <ExternalLink size={14} /> }
  ];
  
  // Time range options
  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Fetch logs
  useEffect(() => {
    fetchLogs();
    
    // Setup auto-refresh if enabled
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        fetchLogs();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, activeFilters, selectedDateRange]);
  
  // Filter logs when search or filters change
  useEffect(() => {
    applyFilters();
  }, [logs, searchQuery, activeFilters]);
  
  // Scroll to bottom when new logs arrive if we're at the bottom already
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs]);
  
  // Update time range label when filter changes
  useEffect(() => {
    if (activeFilters.timeRange === 'custom') {
      const startDate = selectedDateRange.start.toLocaleDateString();
      const endDate = selectedDateRange.end.toLocaleDateString();
      setTimeRangeLabel(`${startDate} - ${endDate}`);
    } else {
      const selectedRange = timeRanges.find(range => range.value === activeFilters.timeRange);
      if (selectedRange) {
        setTimeRangeLabel(selectedRange.label);
      }
    }
  }, [activeFilters.timeRange, selectedDateRange]);

  const fetchLogs = () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call to get logs
    // For demo purposes, we generate mock logs
    setTimeout(() => {
      // Generate mock logs based on the active filters
      const mockLogs = generateMockLogs(
        activeFilters, 
        selectedDateRange.start, 
        selectedDateRange.end
      );
      
      setLogs(mockLogs);
      setIsLoading(false);
    }, 600);
  };
  
  const applyFilters = () => {
    let filtered = [...logs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) || 
        log.details.toLowerCase().includes(query) ||
        log.user?.toLowerCase().includes(query) ||
        log.source?.toLowerCase().includes(query)
      );
    }
    
    // Apply level filter
    if (activeFilters.level !== 'all') {
      filtered = filtered.filter(log => log.level === activeFilters.level);
    }
    
    // Apply category filter
    if (activeFilters.category !== 'all') {
      filtered = filtered.filter(log => log.category === activeFilters.category);
    }
    
    setFilteredLogs(filtered);
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    
    // Close custom date range picker if a non-custom time range is selected
    if (filterType === 'timeRange' && value !== 'custom') {
      setIsCustomDateRangeOpen(false);
    }
    
    // Open custom date range picker if custom is selected
    if (filterType === 'timeRange' && value === 'custom') {
      setIsCustomDateRangeOpen(true);
    }
  };
  
  const toggleFilterPanel = () => {
    setIsFiltersPanelOpen(!isFiltersPanelOpen);
  };
  
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  const handleManualRefresh = () => {
    fetchLogs();
  };
  
  const toggleLogExpand = (id) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleDateRangeChange = (type, event) => {
    const date = new Date(event.target.value);
    
    setSelectedDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };
  
  const applyCustomDateRange = () => {
    // Close the custom date range picker
    setIsCustomDateRangeOpen(false);
  };
  
  const toggleView = (newView) => {
    setView(newView);
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Get icon based on log level
  const getLevelIcon = (level) => {
    switch (level) {
      case 'info':
        return <Info size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      case 'success':
        return <CheckCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };
  
  // Get icon based on log category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'user':
        return <User size={16} />;
      case 'transaction':
        return <Database size={16} />;
      case 'system':
        return <Terminal size={16} />;
      case 'security':
        return <Shield size={16} />;
      case 'api':
        return <ExternalLink size={16} />;
      default:
        return <Info size={16} />;
    }
  };
  
  // Export logs as CSV
  const exportLogs = () => {
    if (filteredLogs.length === 0) return;
    
    const csvContent = [
      // Header row
      ['Timestamp', 'Level', 'Category', 'User', 'Source', 'Message', 'Details'].join(','),
      // Data rows
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.category,
        log.user || '',
        log.source || '',
        `"${log.message.replace(/"/g, '""')}"`, // Escape quotes in CSV
        `"${log.details.replace(/"/g, '""')}"`   // Escape quotes in CSV
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bip-logs-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to change tabs
  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="logs-page">
      {/* Tab navigation */}
      <div className="logs-tabs">
        <button 
          className={`log-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => changeTab('system')}
        >
          <Terminal size={18} />
          <span>System Logs</span>
        </button>
        <button 
          className={`log-tab ${activeTab === 'bea' ? 'active' : ''}`}
          onClick={() => changeTab('bea')}
        >
          <Building2 size={18} />
          <span>BEA Summary</span>
        </button>
        <button 
          className={`log-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => changeTab('transactions')}
        >
          <FileSpreadsheet size={18} />
          <span>Transaction Logs</span>
        </button>
      </div>

      {/* System Logs Content */}
      {activeTab === 'system' && (
        <>
          <div className="logs-header">
            <div className="logs-title">
              <Terminal size={24} />
              <h1>System Logs</h1>
            </div>
            
            <div className="logs-actions">
              <div className={`auto-refresh-toggle ${autoRefresh ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={toggleAutoRefresh}
                />
                <label htmlFor="auto-refresh">
                  Auto-refresh
                </label>
              </div>
              
              <button 
                className="action-button refresh"
                onClick={handleManualRefresh}
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'rotating' : ''} />
                <span>Refresh</span>
              </button>
              
              <button 
                className="action-button export"
                onClick={exportLogs}
                disabled={filteredLogs.length === 0}
              >
                <ArrowDownToLine size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
      
      <div className="logs-toolbar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="view-toggle">
          <button
            className={`view-button ${view === 'list' ? 'active' : ''}`}
            onClick={() => toggleView('list')}
          >
            <FileText size={16} />
            <span>List</span>
          </button>
          <button
            className={`view-button ${view === 'table' ? 'active' : ''}`}
            onClick={() => toggleView('table')}
          >
            <Terminal size={16} />
            <span>Table</span>
          </button>
        </div>
        
        <button
          className={`filter-toggle-button ${isFiltersPanelOpen ? 'active' : ''}`}
          onClick={toggleFilterPanel}
        >
          <Filter size={16} />
          <span>Filters</span>
          {isFiltersPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      
      <AnimatePresence>
        {isFiltersPanelOpen && (
          <motion.div
            className="filters-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="filters-container">
              <div className="filter-group">
                <div className="filter-label">Log Level</div>
                <div className="filter-options">
                  {logLevels.map(level => (
                    <button
                      key={level.value}
                      className={`filter-option ${activeFilters.level === level.value ? 'active' : ''} ${level.value !== 'all' ? `level-${level.value}` : ''}`}
                      onClick={() => handleFilterChange('level', level.value)}
                    >
                      {level.icon && level.icon}
                      <span>{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <div className="filter-label">Category</div>
                <div className="filter-options">
                  {logCategories.map(category => (
                    <button
                      key={category.value}
                      className={`filter-option ${activeFilters.category === category.value ? 'active' : ''}`}
                      onClick={() => handleFilterChange('category', category.value)}
                    >
                      {category.icon && category.icon}
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-group">
                <div className="filter-label">Time Range</div>
                <div className="filter-options time-range">
                  {timeRanges.map(range => (
                    <button
                      key={range.value}
                      className={`filter-option ${activeFilters.timeRange === range.value ? 'active' : ''}`}
                      onClick={() => handleFilterChange('timeRange', range.value)}
                    >
                      <span>{range.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {isCustomDateRangeOpen && (
                <motion.div
                  className="custom-date-range"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="date-inputs">
                    <div className="date-input-group">
                      <label htmlFor="start-date">Start Date</label>
                      <div className="date-input-container">
                        <Calendar size={16} />
                        <input
                          type="date"
                          id="start-date"
                          value={selectedDateRange.start.toISOString().split('T')[0]}
                          onChange={(e) => handleDateRangeChange('start', e)}
                        />
                      </div>
                    </div>
                    
                    <div className="date-input-group">
                      <label htmlFor="end-date">End Date</label>
                      <div className="date-input-container">
                        <Calendar size={16} />
                        <input
                          type="date"
                          id="end-date"
                          value={selectedDateRange.end.toISOString().split('T')[0]}
                          onChange={(e) => handleDateRangeChange('end', e)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className="apply-date-range"
                    onClick={applyCustomDateRange}
                  >
                    Apply Range
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="logs-meta">
        <div className="logs-count">
          <span>Showing {filteredLogs.length} logs</span>
          {logs.length !== filteredLogs.length && (
            <span className="filtered-info">
              (filtered from {logs.length})
            </span>
          )}
        </div>
        
        <div className="time-range-display">
          <Clock size={14} />
          <span>{timeRangeLabel}</span>
        </div>
      </div>
      
      <div className="logs-content">
        {isLoading ? (
          <div className="logs-loading">
            <RefreshCw size={24} className="rotating" />
            <span>Loading logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="no-logs">
            <Terminal size={24} />
            <h3>No logs found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : view === 'list' ? (
          <div className="logs-list">
            <AnimatePresence>
              {filteredLogs.map(log => (
                <motion.div
                  key={log.id}
                  className={`log-item ${log.level}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className="log-header" 
                    onClick={() => toggleLogExpand(log.id)}
                  >
                    <div className="log-icon">
                      {getLevelIcon(log.level)}
                    </div>
                    
                    <div className="log-timestamp">
                      {formatTimestamp(log.timestamp)}
                    </div>
                    
                    <div className="log-category">
                      <span className="category-icon">
                        {getCategoryIcon(log.category)}
                      </span>
                      <span>{log.category}</span>
                    </div>
                    
                    {log.user && (
                      <div className="log-user">
                        <User size={14} />
                        <span>{log.user}</span>
                      </div>
                    )}
                    
                    <div className="log-message">
                      {log.message}
                    </div>
                    
                    <div className="log-expand">
                      {expandedLogs[log.id] ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>
                  
                  {expandedLogs[log.id] && (
                    <div className="log-details">
                      <div className="log-details-content">
                        <p>{log.details}</p>
                        
                        {log.source && (
                          <div className="log-source">
                            <strong>Source:</strong> {log.source}
                          </div>
                        )}
                        
                        {log.metadata && (
                          <div className="log-metadata">
                            <strong>Metadata:</strong>
                            <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Category</th>
                  <th>User</th>
                  <th>Message</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className={log.level}>
                    <td className="timestamp-cell">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="level-cell">
                      <div className="level-indicator">
                        {getLevelIcon(log.level)}
                        <span>{log.level}</span>
                      </div>
                    </td>
                    <td className="category-cell">
                      <div className="category-indicator">
                        {getCategoryIcon(log.category)}
                        <span>{log.category}</span>
                      </div>
                    </td>
                    <td className="user-cell">
                      {log.user || '-'}
                    </td>
                    <td className="message-cell">
                      {log.message}
                    </td>
                    <td className="source-cell">
                      {log.source || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div ref={logEndRef} />
      </div>
        </>
      )}

      {/* BEA Logs Content */}
      {activeTab === 'bea' && <BEALogs />}

      {/* Transaction Logs Content */}
      {activeTab === 'transactions' && <TransactionLogs />}
    </div>
  );
};

export default Logs;