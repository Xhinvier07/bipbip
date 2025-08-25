import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Book,
  Lightbulb,
  Lock,
  Zap,
  LineChart,
  Layers,
  BrainCircuit,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Map,
  MessageSquare,
  BarChart2,
  Calendar,
  Clock,
  Activity,
  Users,
  ThumbsUp,
  ThumbsDown,
  Github
} from 'lucide-react';

import './Help.css';

const Help = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Toggle FAQ question expansion
  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Change active tab
  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsSearching(false);
    setSearchQuery('');
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Perform search
  const performSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Content to search through
    const searchableContent = [
      { 
        id: 'overview-1',
        tab: 'overview',
        title: 'What is BIP?', 
        content: 'The Branch Intelligence Platform (BIP) is a comprehensive analytics and simulation platform designed to revolutionize how financial institutions manage their branch operations.',
        section: 'Overview'
      },
      { 
        id: 'overview-2',
        tab: 'overview',
        title: 'How BIP Supports Digitalization', 
        content: 'In an era where digital transformation is crucial for financial institutions, BIP serves as a bridge between traditional branch operations and modern data-driven decision making.',
        section: 'Overview'
      },
      { 
        id: 'features-1',
        tab: 'features',
        title: 'Branch Analytics Dashboard', 
        content: 'Comprehensive view of branch performance metrics including transaction volumes, wait times, staff utilization, and customer satisfaction scores.',
        section: 'Key Features'
      },
      { 
        id: 'features-2',
        tab: 'features',
        title: 'Interactive Branch Map', 
        content: 'Geospatial visualization of branch network with health scores and performance metrics, enabling regional comparisons and network optimization.',
        section: 'Key Features'
      },
      { 
        id: 'features-3',
        tab: 'features',
        title: 'Branch Simulation', 
        content: 'Advanced simulation tools to model customer flow, staffing scenarios, and operational changes before implementation, minimizing risk and optimizing outcomes.',
        section: 'Key Features'
      },
      { 
        id: 'features-4',
        tab: 'features',
        title: 'BIP Chat', 
        content: 'AI-powered assistant that provides instant insights, answers questions about branch performance, and generates visualizations on demand.',
        section: 'Key Features'
      },
      { 
        id: 'terminology-1',
        tab: 'terminology',
        title: 'Branch Health Score (BHS)', 
        content: 'A comprehensive metric (0-100%) that evaluates overall branch performance by combining customer satisfaction, operational efficiency, transaction volumes, and staff utilization.',
        section: 'Key Terminology'
      },
      { 
        id: 'terminology-2',
        tab: 'terminology',
        title: 'Customer Satisfaction Score (CSAT)', 
        content: 'A measure of customer satisfaction based on surveys, feedback, and sentiment analysis of customer reviews.',
        section: 'Key Terminology'
      },
      { 
        id: 'terminology-3',
        tab: 'terminology',
        title: 'Average Wait Time (AWT)', 
        content: 'The average time customers spend waiting before being served. A critical metric for measuring branch efficiency and customer experience.',
        section: 'Key Terminology'
      },
      { 
        id: 'ai-1',
        tab: 'ai',
        title: 'Time Series Forecasting', 
        content: 'BIP uses advanced time series models to predict future customer traffic, transaction volumes, and peak periods.',
        section: 'AI & Analytics'
      },
      { 
        id: 'ai-2',
        tab: 'ai',
        title: 'Natural Language Processing', 
        content: 'NLP algorithms analyze customer reviews and feedback to extract sentiment, common themes, and specific issues.',
        section: 'AI & Analytics'
      },
      { 
        id: 'ethics-1',
        tab: 'ethics',
        title: 'Data Privacy & Security', 
        content: 'All customer transaction data is anonymized before analysis. Strict access controls limit who can view sensitive information.',
        section: 'Ethics & Compliance'
      },
      { 
        id: 'faq-1',
        tab: 'troubleshooting',
        title: 'How does BIP connect with our existing systems?', 
        content: 'BIP integrates with BPI Express Assist (BEA) and other bank systems through secure API connections.',
        section: 'FAQ'
      },
      { 
        id: 'faq-2',
        tab: 'troubleshooting',
        title: 'How accurate are the predictive models?', 
        content: 'BIP\'s predictive models typically achieve 85-90% accuracy for next-day customer flow predictions and 80-85% accuracy for longer-term forecasts.',
        section: 'FAQ'
      }
    ];
    
    const query = searchQuery.toLowerCase().trim();
    
    const results = searchableContent.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div className="help-page">
      <div className="help-hero">
        <div className="hero-content">
          <h1>Branch Intelligence Platform</h1>
          <p>Transforming branch operations with data-driven insights</p>
          <form className="hero-search" onSubmit={performSearch}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search help topics..." 
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button type="button" className="clear-search" onClick={clearSearch}>
                <ChevronUp size={16} />
              </button>
            )}
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>
      </div>
      
      <div className="help-container">
        <div className="help-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => changeTab('overview')}
          >
            <Book size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => changeTab('features')}
          >
            <Layers size={18} />
            <span>Key Features</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'terminology' ? 'active' : ''}`}
            onClick={() => changeTab('terminology')}
          >
            <FileText size={18} />
            <span>Terminology</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => changeTab('ai')}
          >
            <BrainCircuit size={18} />
            <span>AI & Analytics</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'ethics' ? 'active' : ''}`}
            onClick={() => changeTab('ethics')}
          >
            <Lock size={18} />
            <span>Ethics & Compliance</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'troubleshooting' ? 'active' : ''}`}
            onClick={() => changeTab('troubleshooting')}
          >
            <HelpCircle size={18} />
            <span>FAQ</span>
          </button>
        </div>
        
        <div className="help-contact-mobile">
          <button className="contact-btn">
            <MessageSquare size={16} />
            Contact Support
          </button>
        </div>
        
        <main className="help-content">
          {isSearching ? (
            <div className="search-results-container">
              <div className="search-results-header">
                <h2>Search Results for "{searchQuery}"</h2>
                <button className="back-to-help" onClick={clearSearch}>
                  <ChevronUp size={16} />
                  Back to Help
                </button>
              </div>
              
              {searchResults.length === 0 ? (
                <div className="no-results">
                  <HelpCircle size={32} />
                  <h3>No results found</h3>
                  <p>Try different keywords or browse the help sections</p>
                </div>
              ) : (
                <div className="search-results-list">
                  {searchResults.map(result => (
                    <div key={result.id} className="search-result-item">
                      <div className="result-section">{result.section}</div>
                      <h3 className="result-title">{result.title}</h3>
                      <p className="result-content">{result.content}</p>
                      <button 
                        className="view-section-btn"
                        onClick={() => {
                          changeTab(result.tab);
                          // Give time for the tab to render before scrolling
                          setTimeout(() => {
                            const element = document.getElementById(result.id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                              element.classList.add('highlight');
                              setTimeout(() => element.classList.remove('highlight'), 2000);
                            }
                          }, 100);
                        }}
                      >
                        View in {result.section}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
          <section className={`help-section ${activeTab === 'overview' ? 'active' : ''}`} id="overview">
            <div className="section-header">
              <Book size={24} />
              <h2>Overview</h2>
            </div>
            
            <div className="section-content">
              <h3 id="overview-1">What is BIP?</h3>
              <p>
                The <strong>Branch Intelligence Platform (BIP)</strong> is a comprehensive analytics and simulation 
                platform designed to revolutionize how financial institutions manage their branch operations. 
                It combines real-time data analytics, predictive AI models, and interactive visualizations 
                to provide actionable insights for branch managers and executives.
              </p>
              
              <h3 id="overview-2">How BIP Supports Digitalization</h3>
              <p>
                In an era where digital transformation is crucial for financial institutions, BIP serves as a 
                bridge between traditional branch operations and modern data-driven decision making. By digitizing 
                branch analytics, BIP enables:
              </p>
              
              <ul>
                <li>
                  <strong>Data-Driven Decision Making:</strong> Replace gut feelings with actionable insights 
                  based on comprehensive branch performance data
                </li>
                <li>
                  <strong>Operational Efficiency:</strong> Identify bottlenecks and optimize staffing, 
                  reducing operational costs while improving customer service
                </li>
                <li>
                  <strong>Enhanced Customer Experience:</strong> Predict customer needs and wait times, 
                  leading to improved satisfaction and loyalty
                </li>
                <li>
                  <strong>Strategic Resource Allocation:</strong> Make informed decisions about branch 
                  locations, staffing, and service offerings
                </li>
              </ul>
              
              <div className="info-card">
                <Lightbulb size={20} />
                <div>
                  <h4>Why BIP Matters</h4>
                  <p>
                    Despite the rise of digital banking, physical branches remain critical touchpoints 
                    for complex services and relationship building. BIP modernizes branch management by 
                    bringing advanced analytics and AI to these traditional spaces, creating a truly 
                    omnichannel customer experience.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className={`help-section ${activeTab === 'features' ? 'active' : ''}`} id="features">
            <div className="section-header">
              <Layers size={24} />
              <h2>Key Features</h2>
            </div>
            
            <div className="section-content">
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <BarChart2 />
                  </div>
                  <div className="feature-content">
                    <h3>Branch Analytics Dashboard</h3>
                    <p>
                      Comprehensive view of branch performance metrics including transaction volumes, 
                      wait times, staff utilization, and customer satisfaction scores.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Map />
                  </div>
                  <div className="feature-content">
                    <h3>Interactive Branch Map</h3>
                    <p>
                      Geospatial visualization of branch network with health scores and performance metrics, 
                      enabling regional comparisons and network optimization.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Zap />
                  </div>
                  <div className="feature-content">
                    <h3>Branch Simulation</h3>
                    <p>
                      Advanced simulation tools to model customer flow, staffing scenarios, and operational 
                      changes before implementation, minimizing risk and optimizing outcomes.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <MessageSquare />
                  </div>
                  <div className="feature-content">
                    <h3>BIP Chat</h3>
                    <p>
                      AI-powered assistant that provides instant insights, answers questions about branch 
                      performance, and generates visualizations on demand.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Activity />
                  </div>
                  <div className="feature-content">
                    <h3>Transaction Analytics</h3>
                    <p>
                      Detailed analysis of transaction patterns, types, and trends to optimize service 
                      offerings and staffing based on customer demand.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <Users />
                  </div>
                  <div className="feature-content">
                    <h3>Staff Optimization</h3>
                    <p>
                      AI-driven recommendations for optimal staffing levels, skill distribution, and 
                      scheduling based on predicted customer traffic and transaction needs.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <LineChart />
                  </div>
                  <div className="feature-content">
                    <h3>Predictive Analytics</h3>
                    <p>
                      Machine learning models that forecast customer traffic, transaction volumes, and 
                      branch performance based on historical data and external factors.
                    </p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <BrainCircuit />
                  </div>
                  <div className="feature-content">
                    <h3>AI Insights</h3>
                    <p>
                      Automated anomaly detection, trend identification, and actionable recommendations 
                      to improve branch performance and customer experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className={`help-section ${activeTab === 'terminology' ? 'active' : ''}`} id="terminology">
            <div className="section-header">
              <FileText size={24} />
              <h2>Key Terminology</h2>
            </div>
            
            <div className="section-content">
              <div className="terminology-list">
                <div className="term-item">
                  <h3>Branch Health Score (BHS)</h3>
                  <p>
                    A comprehensive metric (0-100%) that evaluates overall branch performance by combining customer 
                    satisfaction, operational efficiency, transaction volumes, and staff utilization. 
                    Higher scores indicate better performing branches.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Customer Satisfaction Score (CSAT)</h3>
                  <p>
                    A measure of customer satisfaction based on surveys, feedback, and sentiment analysis of 
                    customer reviews. CSAT contributes significantly to the Branch Health Score.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Average Wait Time (AWT)</h3>
                  <p>
                    The average time customers spend waiting before being served. A critical metric for 
                    measuring branch efficiency and customer experience.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Staff Utilization Rate</h3>
                  <p>
                    The percentage of time staff members are actively engaged in serving customers or 
                    performing productive tasks. Optimal utilization ranges from 78-85%.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Transaction Volume</h3>
                  <p>
                    The total number of customer transactions processed within a specific time period, 
                    categorized by transaction type (deposits, withdrawals, inquiries, etc.).
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>BPI Express Assist (BEA)</h3>
                  <p>
                  A branch-based self-service kiosk that handles transaction details, issues queue numbers, and streamlines the process when you go to the teller. It speeds up service, reduces errors, and makes your visit more comfortable.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Customer Flow</h3>
                  <p>
                    The movement pattern of customers within a branch, including arrival rates, service points 
                    visited, and time spent at each station. Analyzed to optimize branch layout and staffing.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Sentiment Analysis</h3>
                  <p>
                    The process of analyzing customer feedback and reviews to determine sentiment (positive, 
                    negative, neutral) and extract actionable insights for improving service.
                  </p>
                </div>
                
                <div className="term-item">
                  <h3>Discrete Event Simulation</h3>
                  <p>
                    The computational method used in BIP's simulation feature to model branch operations as a 
                    series of discrete events over time, enabling "what-if" scenario testing.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className={`help-section ${activeTab === 'ai' ? 'active' : ''}`} id="ai">
            <div className="section-header">
              <BrainCircuit size={24} />
              <h2>AI & Analytics</h2>
            </div>
            
            <div className="section-content">
              <h3>How BIP Uses Artificial Intelligence</h3>
              <p>
                BIP leverages multiple AI and machine learning technologies to transform raw branch data 
                into actionable insights and predictions:
              </p>
              
              <div className="ai-components">
                <div className="ai-component">
                  <h4>Time Series Forecasting</h4>
                  <p>
                    BIP uses advanced time series models to predict future customer traffic, transaction 
                    volumes, and peak periods based on historical patterns, seasonal factors, and external 
                    events (like paydays or holidays).
                  </p>
                  <div className="connection-note">
                    <strong>Data Source:</strong> BPI Express Assist (BEA) transaction logs
                  </div>
                </div>
                
                <div className="ai-component">
                  <h4>Natural Language Processing</h4>
                  <p>
                    NLP algorithms analyze customer reviews and feedback to extract sentiment, common themes, 
                    and specific issues. This powers both the sentiment analysis in reports and the understanding 
                    capabilities in BIP Chat.
                  </p>
                  <div className="connection-note">
                    <strong>Data Source:</strong> Customer reviews and feedback forms
                  </div>
                </div>
                
                <div className="ai-component">
                  <h4>Customer Flow Prediction</h4>
                  <p>
                    Machine learning models predict how customers move through branches, which services they'll 
                    need, and how long each interaction will take. These predictions power the simulation feature 
                    and staffing recommendations.
                  </p>
                  <div className="connection-note">
                    <strong>Data Source:</strong> Queue management systems and BEA transaction data
                  </div>
                </div>
                
                <div className="ai-component">
                  <h4>Anomaly Detection</h4>
                  <p>
                    AI algorithms continuously monitor branch metrics to identify unusual patterns or deviations 
                    from expected performance, alerting managers to potential issues before they impact 
                    customer experience.
                  </p>
                  <div className="connection-note">
                    <strong>Data Source:</strong> Real-time branch performance metrics
                  </div>
                </div>
                
                <div className="ai-component">
                  <h4>Smart Staffing Optimizer</h4>
                  <p>
                    Reinforcement learning models that recommend optimal staffing configurations based on 
                    predicted customer needs, staff skills, and service time distributions.
                  </p>
                  <div className="connection-note">
                    <strong>Data Source:</strong> Staff performance data and customer traffic patterns
                  </div>
                </div>
                
                <div className="ai-component">
                  <h4>Conversational AI</h4>
                  <p>
                    BIP Chat uses sophisticated language models to understand user queries, generate natural 
                    language responses, and create visual representations of branch data on demand.
                  </p>
                  <div className="connection-note">
                    <strong>Data Source:</strong> Branch analytics database and real-time metrics
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <Lightbulb size={20} />
                <div>
                  <h4>How Predictive Algorithms Work</h4>
                  <p>
                    BIP's predictive algorithms combine multiple data sources including historical transaction 
                    logs, customer feedback, seasonal patterns, local events, and even weather data. These models 
                    are continuously trained and validated using real branch performance data, improving their 
                    accuracy over time. The system uses both traditional statistical methods and deep learning 
                    approaches depending on the specific prediction task.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <section className={`help-section ${activeTab === 'ethics' ? 'active' : ''}`} id="ethics">
            <div className="section-header">
              <Lock size={24} />
              <h2>Ethics & Compliance</h2>
            </div>
            
            <div className="section-content">
              <h3>Our Commitment to Responsible AI</h3>
              <p>
                BIP is developed with a strong commitment to ethical AI principles and data privacy. 
                Our approach ensures that the platform delivers value while protecting customer information 
                and avoiding algorithmic bias.
              </p>
              
              <div className="ethics-principles">
                <div className="ethics-principle">
                  <h4>Data Privacy & Security</h4>
                  <ul>
                    <li>All customer transaction data is anonymized before analysis</li>
                    <li>Strict access controls limit who can view sensitive information</li>
                    <li>All data is encrypted both in transit and at rest</li>
                    <li>Compliance with relevant banking regulations and data protection laws</li>
                  </ul>
                </div>
                
                <div className="ethics-principle">
                  <h4>Algorithmic Fairness</h4>
                  <ul>
                    <li>Regular audits of AI models to detect and prevent bias</li>
                    <li>Diverse training data to ensure fair treatment across demographics</li>
                    <li>Transparent model evaluation metrics that prioritize equity</li>
                    <li>Human oversight of all automated recommendations</li>
                  </ul>
                </div>
                
                <div className="ethics-principle">
                  <h4>Transparency</h4>
                  <ul>
                    <li>Clear documentation of how AI models make predictions and recommendations</li>
                    <li>Confidence scores provided alongside all AI-generated insights</li>
                    <li>Explanations of factors influencing branch performance metrics</li>
                    <li>Regular reporting on system performance and improvement areas</li>
                  </ul>
                </div>
                
                <div className="ethics-principle">
                  <h4>Human-Centered Design</h4>
                  <ul>
                    <li>AI serves as a decision support tool, not a replacement for human judgment</li>
                    <li>System design focuses on augmenting staff capabilities, not replacing people</li>
                    <li>Regular feedback collection from branch staff to improve usability</li>
                    <li>Training provided to help users interpret and appropriately apply AI insights</li>
                  </ul>
                </div>
              </div>
              
              <div className="compliance-statement">
                <h3>Regulatory Compliance</h3>
                <p>
                  BIP is designed to help financial institutions comply with regulatory requirements while 
                  optimizing their operations. The platform maintains comprehensive audit logs of all 
                  system recommendations and user actions for accountability and regulatory review.
                </p>
              </div>
            </div>
          </section>
          
          <section className={`help-section ${activeTab === 'troubleshooting' ? 'active' : ''}`} id="troubleshooting">
            <div className="section-header">
              <HelpCircle size={24} />
              <h2>Frequently Asked Questions</h2>
            </div>
            
            <div className="section-content">
              <div className="faq-list">
                <div className="faq-item">
                  <button 
                    className={`faq-question ${expandedQuestions['faq1'] ? 'expanded' : ''}`} 
                    onClick={() => toggleQuestion('faq1')}
                  >
                    <span>How does BIP connect with our existing systems?</span>
                    {expandedQuestions['faq1'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestions['faq1'] && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>
                          BIP integrates with BPI Express Assist (BEA) and other bank systems 
                          through secure API connections. The platform is designed to work alongside existing 
                          core banking systems, drawing transaction data, customer information, and operational 
                          metrics while maintaining strict security protocols. Our implementation team will 
                          work with your IT department to establish these connections with minimal disruption 
                          to your operations.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="faq-item">
                  <button 
                    className={`faq-question ${expandedQuestions['faq2'] ? 'expanded' : ''}`} 
                    onClick={() => toggleQuestion('faq2')}
                  >
                    <span>How accurate are the predictive models?</span>
                    {expandedQuestions['faq2'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestions['faq2'] && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>
                          BIP's predictive models typically achieve 85-90% accuracy for next-day customer flow 
                          predictions and 80-85% accuracy for longer-term forecasts. These models improve over 
                          time as they learn from your specific branch patterns. Each prediction comes with a 
                          confidence score, and the system is transparent about factors that might affect accuracy, 
                          such as unusual events or limited historical data.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="faq-item">
                  <button 
                    className={`faq-question ${expandedQuestions['faq3'] ? 'expanded' : ''}`} 
                    onClick={() => toggleQuestion('faq3')}
                  >
                    <span>Can we customize the Branch Health Score calculations?</span>
                    {expandedQuestions['faq3'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestions['faq3'] && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>
                          Yes, BIP allows for customization of the Branch Health Score (BHS) components and weights. 
                          During implementation, we work with your management team to determine the relative importance 
                          of different metrics (customer satisfaction, wait times, transaction volumes, etc.) based on 
                          your strategic priorities. These weights can be adjusted over time as your focus areas evolve.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="faq-item">
                  <button 
                    className={`faq-question ${expandedQuestions['faq4'] ? 'expanded' : ''}`} 
                    onClick={() => toggleQuestion('faq4')}
                  >
                    <span>How does the sentiment analysis handle multiple languages?</span>
                    {expandedQuestions['faq4'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestions['faq4'] && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>
                          BIP's sentiment analysis engine supports multiple languages and can handle mixed-language 
                          feedback (like Taglish - a mix of Tagalog and English). The system uses multilingual 
                          NLP models that understand context and sentiment across languages, ensuring accurate analysis 
                          regardless of the language customers use in their feedback. This capability is particularly 
                          valuable in diverse linguistic regions.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="faq-item">
                  <button 
                    className={`faq-question ${expandedQuestions['faq5'] ? 'expanded' : ''}`} 
                    onClick={() => toggleQuestion('faq5')}
                  >
                    <span>What training is provided for branch staff?</span>
                    {expandedQuestions['faq5'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestions['faq5'] && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>
                          We provide comprehensive training programs for different user roles: branch managers, 
                          operations staff, and executives. Training covers platform navigation, interpreting analytics, 
                          running simulations, and implementing recommended optimizations. We also offer ongoing 
                          webinars and a certification program for power users. All training materials remain accessible 
                          through the Help section for reference.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="faq-item">
                  <button 
                    className={`faq-question ${expandedQuestions['faq6'] ? 'expanded' : ''}`} 
                    onClick={() => toggleQuestion('faq6')}
                  >
                    <span>How often is the system updated with new features?</span>
                    {expandedQuestions['faq6'] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  
                  <AnimatePresence>
                    {expandedQuestions['faq6'] && (
                      <motion.div 
                        className="faq-answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p>
                          BIP receives quarterly feature updates and monthly maintenance releases. Major updates 
                          introducing new analytics capabilities or significant UI improvements are scheduled quarterly, 
                          with advance notice and optional training sessions. Security patches and minor enhancements 
                          are deployed monthly with minimal disruption. All updates are thoroughly tested in staging 
                          environments before deployment to production.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
          
          <div className="help-footer">
            <div className="documentation-links">
              <h3>Additional Resources</h3>
              <ul>
                <li>
                  <a href="https://docs.google.com/document/d/1IJx9GnSEEiVfybt4t-D5ubDAsy6gm8Cn4KNslTThbyA/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="resource-link">
                    <FileText size={16} />
                    <span>Academic Paper</span>
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Xhinvier07/bipbip" target="_blank" rel="noopener noreferrer" className="resource-link">
                    <Github size={16} />
                    <span>GitHub Repository</span>
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="resource-link">
                    <Zap size={16} />
                    <span>Simulation Tutorial</span>
                    <ExternalLink size={14} />
                  </a>
                </li>
                <li>
                  <a href="#" className="resource-link">
                    <BrainCircuit size={16} />
                    <span>AI Capabilities Whitepaper</span>
                    <ExternalLink size={14} />
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="help-feedback">
              <h3>Help Us Improve</h3>
              <p>Was this documentation helpful?</p>
              <div className="feedback-buttons">
                <button className="feedback-yes">
                  <ThumbsUp size={16} />
                  Yes
                </button>
                <button className="feedback-no">
                  <ThumbsDown size={16} />
                  No
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </main>
        
        <div className="help-contact-desktop">
          <h3>Need more help?</h3>
          <p>Contact our support team for assistance</p>
          <button
            className="contact-btn"
            onClick={() => window.open("https://www.linkedin.com/in/xhinvier/", "_blank")}
          >
            <MessageSquare size={16} />
            Contact Support
        </button>
        </div>
      </div>
    </div>
  );
};

export default Help;