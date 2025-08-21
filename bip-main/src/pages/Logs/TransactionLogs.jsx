import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Search, 
  ArrowDownToLine, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  FileText, 
  User, 
  MessageSquare,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { fetchTransactionData } from '../Dashboard/GoogleSheetsService';

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showBranchFilter, setShowBranchFilter] = useState(false);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTransactionsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, typeFilter, branchFilter, sortConfig]);

  const fetchTransactionsData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransactionData();
      setTransactions(data);
      
      // Extract unique transaction types and branches
      const types = [...new Set(data.map(item => item.transaction_type))].filter(Boolean).sort();
      setAvailableTypes(['All Types', ...types]);
      
      const branches = [...new Set(data.map(item => item.branch_name))].filter(Boolean).sort();
      setAvailableBranches(['All Branches', ...branches]);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.branch_name && item.branch_name.toLowerCase().includes(query)) ||
        (item.transaction_type && item.transaction_type.toLowerCase().includes(query)) ||
        (item.customer_id && item.customer_id.toLowerCase().includes(query)) ||
        (item.transaction_id && item.transaction_id.toLowerCase().includes(query)) ||
        (item.review_text && item.review_text.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.transaction_type === typeFilter);
    }
    
    // Apply branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(item => item.branch_name === branchFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle numeric values
        if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
          return sortConfig.direction === 'asc' 
            ? a[sortConfig.key] - b[sortConfig.key] 
            : b[sortConfig.key] - a[sortConfig.key];
        }
        
        // Handle string values
        const aValue = String(a[sortConfig.key] || '');
        const bValue = String(b[sortConfig.key] || '');
        
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }
    
    setFilteredTransactions(filtered);
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const clearSearch = () => setSearchQuery('');
  
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  const handleTypeFilter = (type) => {
    setTypeFilter(type === 'All Types' ? 'all' : type);
    setShowTypeFilter(false);
  };
  
  const handleBranchFilter = (branch) => {
    setBranchFilter(branch === 'All Branches' ? 'all' : branch);
    setShowBranchFilter(false);
  };
  
  const toggleTypeFilter = () => {
    setShowTypeFilter(!showTypeFilter);
    setShowBranchFilter(false);
  };
  
  const toggleBranchFilter = () => {
    setShowBranchFilter(!showBranchFilter);
    setShowTypeFilter(false);
  };
  
  const handleRefresh = () => fetchTransactionsData();
  
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };

  const exportData = () => {
    if (filteredTransactions.length === 0) return;
    
    const headers = [
      'Transaction ID',
      'Customer ID',
      'Branch Name',
      'Transaction Type',
      'Wait Time (min)',
      'Processing Time (min)',
      'Total Time (min)',
      'Date',
      'Sentiment',
      'Score',
      'Review'
    ];
    
    const csvData = [
      headers.join(','),
      ...filteredTransactions.map(item => [
        item.transaction_id || '',
        item.customer_id || '',
        item.branch_name || '',
        item.transaction_type || '',
        item.waiting_time || '',
        item.processing_time || '',
        item.transaction_time || '',
        item.date || '',
        item.sentiment || '',
        item.sentiment_score || '',
        `"${(item.review_text || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transaction_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return '#999';
    
    switch(sentiment.toLowerCase()) {
      case 'positive': return '#00BFA6';
      case 'negative': return '#CF3D58';
      case 'neutral': return '#FEA000';
      default: return '#999';
    }
  };
  
  const getTimeColor = (time) => {
    if (time === undefined || time === null) return '#999';
    
    if (time > 15) return '#CF3D58';
    if (time > 10) return '#FEA000';
    return '#00BFA6';
  };

  return (
    <div className="transaction-logs-content">
      <div className="transaction-card">
        <div className="transaction-logs-header">
          <div className="transaction-title">
            <FileText size={24} />
            <h3>Transaction Logs</h3>
          </div>
          <div className="transaction-actions">
            <button className="action-button refresh" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'rotating' : ''} />
              <span>Refresh</span>
            </button>
            <button className="action-button export" onClick={exportData} disabled={filteredTransactions.length === 0}>
              <ArrowDownToLine size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
        <div className="transaction-description">
          <AlertCircle size={16} />
          <p>Raw transaction data showing individual customer interactions across all branches.</p>
        </div>
      </div>
      
      <div className="transaction-toolbar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery} 
            onChange={handleSearch} 
            className="search-input" 
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              <X size={18} />
            </button>
          )}
        </div>
        <div className="filter-container">
          <button className="filter-button" onClick={toggleTypeFilter}>
            <Filter size={16} />
            <span>{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
            {showTypeFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showTypeFilter && (
            <div className="filter-dropdown">
              {availableTypes.map(type => (
                <div 
                  key={type} 
                  className={`filter-option ${typeFilter === (type === 'All Types' ? 'all' : type) ? 'active' : ''}`} 
                  onClick={() => handleTypeFilter(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
          
          <button className="filter-button" onClick={toggleBranchFilter}>
            <Filter size={16} />
            <span>{branchFilter === 'all' ? 'All Branches' : branchFilter}</span>
            {showBranchFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showBranchFilter && (
            <div className="filter-dropdown">
              {availableBranches.map(branch => (
                <div 
                  key={branch} 
                  className={`filter-option ${branchFilter === (branch === 'All Branches' ? 'all' : branch) ? 'active' : ''}`} 
                  onClick={() => handleBranchFilter(branch)}
                >
                  {branch}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="transaction-meta">
        <div className="transaction-count">
          <span>Showing {filteredTransactions.length} transactions</span>
          {transactions.length !== filteredTransactions.length && (
            <span className="filtered-info">(filtered from {transactions.length})</span>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="transaction-loading">
          <RefreshCw size={24} className="rotating" />
          <span>Loading transactions...</span>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="no-data">
          <FileText size={24} />
          <h3>No transactions found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('transaction_id')} className={sortConfig.key === 'transaction_id' ? `sorted-${sortConfig.direction}` : ''}>
                  ID {sortConfig.key === 'transaction_id' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('date')} className={sortConfig.key === 'date' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Calendar size={14} />
                    <span>Date</span>
                    {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('branch_name')} className={sortConfig.key === 'branch_name' ? `sorted-${sortConfig.direction}` : ''}>
                  Branch {sortConfig.key === 'branch_name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('transaction_type')} className={sortConfig.key === 'transaction_type' ? `sorted-${sortConfig.direction}` : ''}>
                  Type {sortConfig.key === 'transaction_type' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </th>
                <th onClick={() => handleSort('waiting_time')} className={sortConfig.key === 'waiting_time' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Clock size={14} />
                    <span>Wait</span>
                    {sortConfig.key === 'waiting_time' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('transaction_time')} className={sortConfig.key === 'transaction_time' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <Clock size={14} />
                    <span>Total</span>
                    {sortConfig.key === 'transaction_time' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th onClick={() => handleSort('sentiment')} className={sortConfig.key === 'sentiment' ? `sorted-${sortConfig.direction}` : ''}>
                  <div className="header-with-icon">
                    <MessageSquare size={14} />
                    <span>Sentiment</span>
                    {sortConfig.key === 'sentiment' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr 
                  key={`${transaction.transaction_id || index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <td className="id-cell">{transaction.transaction_id || '-'}</td>
                  <td>{transaction.date || '-'}</td>
                  <td className="branch-cell">{transaction.branch_name || '-'}</td>
                  <td className="type-cell">{transaction.transaction_type || '-'}</td>
                  <td className="time-cell">
                    <span 
                      className="time-badge" 
                      style={{ color: getTimeColor(transaction.waiting_time), backgroundColor: `${getTimeColor(transaction.waiting_time)}15` }}
                    >
                      {transaction.waiting_time ? `${transaction.waiting_time.toFixed(1)} min` : '-'}
                    </span>
                  </td>
                  <td className="time-cell">
                    <span 
                      className="time-badge" 
                      style={{ color: getTimeColor(transaction.transaction_time), backgroundColor: `${getTimeColor(transaction.transaction_time)}15` }}
                    >
                      {transaction.transaction_time ? `${transaction.transaction_time.toFixed(1)} min` : '-'}
                    </span>
                  </td>
                  <td>
                    <div 
                      className="sentiment-badge" 
                      style={{ 
                        color: getSentimentColor(transaction.sentiment), 
                        backgroundColor: `${getSentimentColor(transaction.sentiment)}15` 
                      }}
                    >
                      {transaction.sentiment || '-'}
                    </div>
                  </td>
                  <td>
                    {transaction.review_text ? (
                      <button 
                        className="view-review-btn" 
                        onClick={() => handleViewDetails(transaction)}
                        title="View review details"
                      >
                        <MessageSquare size={14} />
                        <span>View</span>
                      </button>
                    ) : (
                      <span className="no-review">No review</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Review Modal */}
      {showModal && selectedTransaction && (
        <div className="transaction-modal-overlay" onClick={closeModal}>
          <div className="transaction-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button className="close-modal" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="transaction-details">
                <div className="detail-row">
                  <div className="detail-label">Transaction ID:</div>
                  <div className="detail-value">{selectedTransaction.transaction_id || '-'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Customer ID:</div>
                  <div className="detail-value">{selectedTransaction.customer_id || '-'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Branch:</div>
                  <div className="detail-value">{selectedTransaction.branch_name || '-'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Type:</div>
                  <div className="detail-value">{selectedTransaction.transaction_type || '-'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Date:</div>
                  <div className="detail-value">{selectedTransaction.date || '-'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Wait Time:</div>
                  <div className="detail-value time-value" style={{ color: getTimeColor(selectedTransaction.waiting_time) }}>
                    {selectedTransaction.waiting_time ? `${selectedTransaction.waiting_time.toFixed(1)} minutes` : '-'}
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Processing Time:</div>
                  <div className="detail-value time-value" style={{ color: getTimeColor(selectedTransaction.processing_time) }}>
                    {selectedTransaction.processing_time ? `${selectedTransaction.processing_time.toFixed(1)} minutes` : '-'}
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Total Time:</div>
                  <div className="detail-value time-value" style={{ color: getTimeColor(selectedTransaction.transaction_time) }}>
                    {selectedTransaction.transaction_time ? `${selectedTransaction.transaction_time.toFixed(1)} minutes` : '-'}
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Sentiment:</div>
                  <div className="detail-value">
                    <span 
                      className="sentiment-badge-large" 
                      style={{ 
                        color: getSentimentColor(selectedTransaction.sentiment), 
                        backgroundColor: `${getSentimentColor(selectedTransaction.sentiment)}15` 
                      }}
                    >
                      {selectedTransaction.sentiment || '-'}
                      {selectedTransaction.sentiment_score ? ` (${selectedTransaction.sentiment_score})` : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="review-section">
                <h4>Customer Review</h4>
                <div className="review-text">
                  {selectedTransaction.review_text || 'No review provided.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionLogs;
