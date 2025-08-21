// Mock data generator for the Logs page

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate a random timestamp within a range
const generateTimestamp = (startDate, endDate) => {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
};

// Sample system sources
const systemSources = [
  'API Gateway',
  'Database Server',
  'Authentication Service',
  'File Server',
  'Web Server',
  'Scheduler Service',
  'Email Service',
  'Payment Processor',
  'Transaction Service',
  'Cache Server'
];

// Sample users
const users = [
  'admin@bpi.com',
  'jansen.moral@bpi.com',
  'cristen.tolentino@bpi.com',
  'xhinvier.admin@bpi.com',
  'xtenlei.mod@bpi.com',
  'beth.gomez@bpi.com',
  'system'
];

// Sample log templates by category and level
const logTemplates = {
  user: {
    info: [
      { 
        message: "User logged in successfully", 
        details: "User authenticated with 2FA enabled."
      },
      { 
        message: "User updated profile information", 
        details: "Profile fields changed: contact information, notification preferences."
      },
      { 
        message: "User exported report data", 
        details: "Report type: Branch Performance, Format: CSV, Rows: {0} records."
      },
      { 
        message: "User changed password", 
        details: "Password updated successfully. Password expires in 90 days."
      },
      { 
        message: "User viewed branch analytics", 
        details: "Accessed analytics dashboard for branch: {0}."
      }
    ],
    warning: [
      { 
        message: "Multiple failed login attempts", 
        details: "User had 3 failed login attempts before successful authentication."
      },
      { 
        message: "Session timeout warning", 
        details: "User session approaching inactivity timeout. Timeout in 5 minutes."
      },
      { 
        message: "User attempted to access restricted feature", 
        details: "Access attempted to feature requiring elevated permissions: Branch Simulation Advanced Mode."
      }
    ],
    error: [
      { 
        message: "User login failed", 
        details: "Invalid credentials provided. Account lockout threshold: 5 attempts."
      },
      { 
        message: "Permission denied for operation", 
        details: "User attempted to modify branch configuration without proper authorization."
      },
      { 
        message: "User session forcefully terminated", 
        details: "Suspicious activity detected in session. Security protocol enforced."
      }
    ],
    success: [
      { 
        message: "User completed profile setup", 
        details: "All required profile fields completed and verified."
      },
      { 
        message: "User permissions updated", 
        details: "User granted additional permissions: Branch Analytics, Report Generation."
      }
    ]
  },
  transaction: {
    info: [
      { 
        message: "Transaction processed successfully", 
        details: "Transaction ID: TX-{0}, Type: Deposit, Amount: ₱{1}, Processing time: {2}ms."
      },
      { 
        message: "Batch transactions initiated", 
        details: "Batch ID: BATCH-{0}, Transactions: {1}, Source: File Import."
      },
      { 
        message: "Transaction queued for processing", 
        details: "Transaction ID: TX-{0}, Queue position: {1}, Estimated processing time: {2}s."
      }
    ],
    warning: [
      { 
        message: "Transaction processing delayed", 
        details: "Transaction ID: TX-{0}, Delay: {1}s, Reason: High system load."
      },
      { 
        message: "Transaction flagged for review", 
        details: "Transaction ID: TX-{0}, Flag reason: Unusual amount, Status: Pending approval."
      },
      { 
        message: "Duplicate transaction detected", 
        details: "Transaction ID: TX-{0}, Similar to: TX-{1}, Time difference: {2}s."
      }
    ],
    error: [
      { 
        message: "Transaction failed to process", 
        details: "Transaction ID: TX-{0}, Error: Insufficient funds, Status: Rejected."
      },
      { 
        message: "Transaction timeout", 
        details: "Transaction ID: TX-{0}, Timeout after: {1}s, Current status: Unknown."
      },
      { 
        message: "Transaction data validation failed", 
        details: "Transaction ID: TX-{0}, Invalid fields: Account number, Routing code."
      }
    ],
    success: [
      { 
        message: "High-value transaction completed", 
        details: "Transaction ID: TX-{0}, Amount: ₱{1}, All verifications passed."
      },
      { 
        message: "International transaction processed", 
        details: "Transaction ID: TX-{0}, Origin: PH, Destination: SG, Exchange rate applied: {1}."
      }
    ]
  },
  system: {
    info: [
      { 
        message: "System update applied", 
        details: "Update version: {0}, Components affected: Authentication, Dashboard. Restart not required."
      },
      { 
        message: "Scheduled maintenance completed", 
        details: "Maintenance ID: MAINT-{0}, Duration: {1} minutes, Status: Successful."
      },
      { 
        message: "Database backup created", 
        details: "Backup ID: BK-{0}, Size: {1}MB, Location: Cloud Storage, Retention: 30 days."
      },
      { 
        message: "System performance metrics collected", 
        details: "Metrics batch ID: METRICS-{0}, Period: 1 hour, Datapoints: {1}."
      }
    ],
    warning: [
      { 
        message: "High CPU usage detected", 
        details: "Server: {0}, CPU usage: {1}%, Threshold: 80%, Duration: {2} minutes."
      },
      { 
        message: "Database approaching capacity limit", 
        details: "Database: {0}, Current usage: {1}%, Threshold: 85%."
      },
      { 
        message: "Memory usage warning", 
        details: "Server: {0}, Memory usage: {1}%, Available: {2}GB."
      }
    ],
    error: [
      { 
        message: "Service unavailable", 
        details: "Service: {0}, Error: Connection refused, Duration: {1} minutes, Impact: Transaction processing delayed."
      },
      { 
        message: "Database connection error", 
        details: "Database: {0}, Error: Timeout after {1}s, Impact: Read operations failing."
      },
      { 
        message: "Disk space critical", 
        details: "Server: {0}, Available space: {1}MB, Required for operation: {2}MB."
      }
    ],
    success: [
      { 
        message: "System recovered from failure", 
        details: "Recovery time: {0}s, Services restored: All, Downtime impact: Minimal."
      },
      { 
        message: "Database optimization completed", 
        details: "Database: {0}, Optimization tasks: Indexing, Vacuum, Performance gain: {1}%."
      }
    ]
  },
  security: {
    info: [
      { 
        message: "Security scan completed", 
        details: "Scan ID: SCAN-{0}, Areas: Network, Applications, Endpoints, Duration: {1} minutes."
      },
      { 
        message: "Security policy updated", 
        details: "Policy ID: POL-{0}, Changes: Password requirements strengthened, Session timeout reduced."
      },
      { 
        message: "New security certificate installed", 
        details: "Certificate: {0}, Issuer: DigiCert, Expiration: 12 months."
      }
    ],
    warning: [
      { 
        message: "Unusual login pattern detected", 
        details: "User: {0}, Location: Different from usual pattern, Time: Outside business hours."
      },
      { 
        message: "Firewall rule temporarily modified", 
        details: "Rule ID: FW-{0}, Modification: Port 8080 opened, Duration: 24 hours, Approver: {1}."
      },
      { 
        message: "Vulnerable dependency detected", 
        details: "Component: {0}, Version: {1}, CVE: CVE-2023-{2}, Severity: Medium."
      }
    ],
    error: [
      { 
        message: "Potential security breach detected", 
        details: "Source IP: {0}, Target: Authentication API, Pattern: Brute force attempt, Status: Blocked."
      },
      { 
        message: "Security certificate expired", 
        details: "Certificate: {0}, Expired: {1} days ago, Services affected: External API endpoints."
      },
      { 
        message: "Unauthorized access attempt", 
        details: "IP: {0}, Target: Admin console, Attempts: {1}, Status: IP blocked for 24 hours."
      }
    ],
    success: [
      { 
        message: "Security threat mitigated", 
        details: "Threat ID: THREAT-{0}, Type: SQL Injection attempt, Action taken: IP banned, Affected services: None."
      },
      { 
        message: "Security update applied", 
        details: "Update ID: SEC-{0}, CVEs addressed: 3, Components updated: Authentication service, API gateway."
      }
    ]
  },
  api: {
    info: [
      { 
        message: "API request processed", 
        details: "Endpoint: /api/v1/{0}, Method: GET, Response time: {1}ms, Status code: 200."
      },
      { 
        message: "API rate limit adjusted", 
        details: "Client ID: {0}, New rate limit: {1} requests per minute, Previous: {2}."
      },
      { 
        message: "New API version deployed", 
        details: "Version: v{0}, Endpoints added: 2, Endpoints deprecated: 1, Documentation updated."
      }
    ],
    warning: [
      { 
        message: "API rate limit approaching", 
        details: "Client ID: {0}, Usage: {1}/{2} requests, Reset in: {3} minutes."
      },
      { 
        message: "Deprecated API endpoint accessed", 
        details: "Endpoint: /api/v1/{0}, Client: {1}, Deprecation date: {2}, Alternative: /api/v2/{3}."
      },
      { 
        message: "Slow API response time", 
        details: "Endpoint: /api/v1/{0}, Response time: {1}ms, Threshold: 200ms, Traffic: {2} requests/min."
      }
    ],
    error: [
      { 
        message: "API request failed", 
        details: "Endpoint: /api/v1/{0}, Method: POST, Error: Validation failed, Status code: 400."
      },
      { 
        message: "API rate limit exceeded", 
        details: "Client ID: {0}, Limit: {1} requests per minute, Blocked requests: {2}."
      },
      { 
        message: "API authentication failed", 
        details: "Client ID: {0}, Reason: Invalid API key, Attempt: {1} of 5 before temporary ban."
      }
    ],
    success: [
      { 
        message: "API integration completed", 
        details: "Integration ID: {0}, External system: {1}, Endpoints connected: {2}, Testing: Passed all cases."
      },
      { 
        message: "API performance optimization successful", 
        details: "Optimization ID: OPT-{0}, Response time improvement: {1}%, Affected endpoints: /api/v1/transactions, /api/v1/analytics."
      }
    ]
  }
};

// Generate random metadata based on the category
const generateMetadata = (category) => {
  switch (category) {
    case 'user':
      return {
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
        sessionId: `sess_${Math.random().toString(36).substring(2, 10)}`
      };
    case 'transaction':
      return {
        transactionId: `TX-${Math.floor(Math.random() * 10000)}`,
        amount: Math.floor(Math.random() * 100000) / 100,
        processingTime: Math.floor(Math.random() * 1000) + 50, // milliseconds
        accountType: ['Savings', 'Checking', 'Investment', 'Loan'][Math.floor(Math.random() * 4)]
      };
    case 'system':
      return {
        serverId: `srv-${Math.random().toString(36).substring(2, 6)}`,
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        diskSpace: {
          total: 500, // GB
          used: Math.floor(Math.random() * 400), // GB
          available: Math.floor(Math.random() * 100) + 100 // GB
        }
      };
    case 'security':
      return {
        threatLevel: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
        sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: ['Philippines', 'United States', 'China', 'Russia', 'India'][Math.floor(Math.random() * 5)],
        actionTaken: ['Blocked', 'Monitored', 'Alerted', 'Quarantined'][Math.floor(Math.random() * 4)]
      };
    case 'api':
      return {
        endpoint: `/api/v1/${['transactions', 'users', 'branches', 'reports', 'analytics'][Math.floor(Math.random() * 5)]}`,
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        responseTime: Math.floor(Math.random() * 500), // milliseconds
        statusCode: [200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 7)]
      };
    default:
      return {};
  }
};

// Replace placeholder values in template strings
const fillTemplate = (template, category) => {
  let filled = template;
  
  // Replace {0}, {1}, etc. with appropriate random values
  if (filled.includes('{0}')) {
    switch (category) {
      case 'user':
        filled = filled.replace('{0}', ['Makati', 'BGC', 'Quezon City', 'Caloocan'][Math.floor(Math.random() * 4)]);
        break;
      case 'transaction':
        filled = filled.replace('{0}', Math.floor(Math.random() * 100000).toString());
        break;
      case 'system':
        filled = filled.replace('{0}', `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`);
        break;
      case 'security':
        filled = filled.replace('{0}', `cert-${Math.random().toString(36).substring(2, 8)}`);
        break;
      case 'api':
        filled = filled.replace('{0}', ['transactions', 'users', 'branches', 'reports', 'analytics'][Math.floor(Math.random() * 5)]);
        break;
      default:
        filled = filled.replace('{0}', Math.floor(Math.random() * 1000).toString());
    }
  }
  
  if (filled.includes('{1}')) {
    switch (category) {
      case 'transaction':
        filled = filled.replace('{1}', (Math.floor(Math.random() * 1000000) / 100).toFixed(2));
        break;
      case 'system':
        filled = filled.replace('{1}', Math.floor(Math.random() * 60).toString());
        break;
      case 'security':
        filled = filled.replace('{1}', users[Math.floor(Math.random() * users.length)]);
        break;
      case 'api':
        filled = filled.replace('{1}', Math.floor(Math.random() * 1000).toString());
        break;
      default:
        filled = filled.replace('{1}', Math.floor(Math.random() * 100).toString());
    }
  }
  
  if (filled.includes('{2}')) {
    switch (category) {
      case 'transaction':
        filled = filled.replace('{2}', Math.floor(Math.random() * 500).toString());
        break;
      case 'security':
        filled = filled.replace('{2}', `${Math.floor(Math.random() * 9000) + 1000}`);
        break;
      case 'api':
        filled = filled.replace('{2}', Math.floor(Math.random() * 100).toString());
        break;
      default:
        filled = filled.replace('{2}', Math.floor(Math.random() * 60).toString());
    }
  }
  
  if (filled.includes('{3}')) {
    filled = filled.replace('{3}', ['transactions-new', 'users-v2', 'branches-extended', 'reports-full'][Math.floor(Math.random() * 5)]);
  }
  
  return filled;
};

// Generate mock logs based on filters and date range
export const generateMockLogs = (filters, startDate, endDate) => {
  const logs = [];
  // Determine number of logs based on time range
  const timeSpanHours = (endDate - startDate) / (1000 * 60 * 60);
  // Generate approximately 5 logs per hour, with some randomness
  const logsCount = Math.floor(timeSpanHours * 5 * (0.8 + Math.random() * 0.4));
  
  for (let i = 0; i < logsCount; i++) {
    // Determine log category
    let category;
    if (filters.category !== 'all') {
      category = filters.category;
    } else {
      const categories = Object.keys(logTemplates);
      category = categories[Math.floor(Math.random() * categories.length)];
    }
    
    // Determine log level
    let level;
    if (filters.level !== 'all') {
      level = filters.level;
    } else {
      // Distribution: 60% info, 20% warning, 15% error, 5% success
      const rand = Math.random();
      if (rand < 0.6) {
        level = 'info';
      } else if (rand < 0.8) {
        level = 'warning';
      } else if (rand < 0.95) {
        level = 'error';
      } else {
        level = 'success';
      }
    }
    
    // Get template
    const templates = logTemplates[category][level];
    const templateIndex = Math.floor(Math.random() * templates.length);
    const template = templates[templateIndex];
    
    // Determine if this log has a user associated
    let user = null;
    if (category === 'user' || Math.random() < 0.3) {
      user = users[Math.floor(Math.random() * users.length)];
    }
    
    // Create log entry
    const log = {
      id: generateId(),
      timestamp: generateTimestamp(startDate, endDate),
      level,
      category,
      message: fillTemplate(template.message, category),
      details: fillTemplate(template.details, category),
      user,
      source: category === 'system' || category === 'api' ? 
        systemSources[Math.floor(Math.random() * systemSources.length)] : null,
      metadata: Math.random() > 0.7 ? generateMetadata(category) : null
    };
    
    logs.push(log);
  }
  
  // Sort by timestamp, most recent first
  logs.sort((a, b) => b.timestamp - a.timestamp);
  
  return logs;
};