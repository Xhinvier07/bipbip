# Contributing to BIPBIP

Thank you for your interest in contributing to BIPBIP (Branch Intelligence Platform for BPI)! This document provides guidelines and information for contributors.

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn
- Git
- Python 3.8+ (for backend/ML components)
- Google Cloud Platform account (for Google Sheets API)

### **Quick Setup**
```bash
# Clone the repository
git clone https://github.com/Xhinvier07/bipbip.git
cd bipbip

# Install frontend dependencies
cd bip-main
npm install

# Install backend dependencies
cd ../bea_generator
pip install -r requirements.txt

# Start development server
cd ../bip-main
npm run dev
```

## 📋 **Project Structure**

```
bipbip/
├── bip-main/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API and external services
│   │   └── styles/          # CSS and styling files
│   └── public/              # Static assets
├── bea_generator/           # Python BEA data generator
├── sentiment_train/         # ML sentiment analysis models
├── overall_data/            # Data processing scripts
├── branch_scraper/          # Chrome extension for branch data
├── review_scraper/          # Chrome extension for review data
└── bip_paper/              # Academic research papers
```

## 🔧 **Development Guidelines**

### **Frontend (React)**
- **Component Structure**: Use functional components with hooks
- **Styling**: CSS modules or styled-components preferred
- **State Management**: React Context for global state
- **Code Style**: Follow ESLint configuration
- **Testing**: Write unit tests for critical components

### **Backend (Python)**
- **Code Style**: Follow PEP 8 guidelines
- **Documentation**: Use docstrings for all functions
- **Error Handling**: Implement proper exception handling
- **Testing**: Use pytest for testing

### **General Principles**
- **Clean Code**: Write readable, maintainable code
- **Documentation**: Document complex logic and APIs
- **Performance**: Consider performance implications
- **Security**: Follow security best practices
- **Accessibility**: Ensure UI is accessible

## 🎯 **Contribution Areas**

### **High Priority**
- **Bug Fixes**: Critical issues affecting functionality
- **Performance Improvements**: Optimizing data processing and UI rendering
- **Security Updates**: Addressing security vulnerabilities
- **Documentation**: Improving code and user documentation

### **Medium Priority**
- **Feature Enhancements**: Adding new capabilities to existing features
- **UI/UX Improvements**: Better user experience and interface design
- **Code Refactoring**: Improving code structure and maintainability
- **Testing**: Adding test coverage

### **Low Priority**
- **New Features**: Major new functionality (discuss with maintainers first)
- **Styling Updates**: Cosmetic changes and theme improvements
- **Tooling**: Development environment improvements

## 📝 **How to Contribute**

### **1. Issue Reporting**
- Check existing issues before creating new ones
- Use clear, descriptive titles
- Include steps to reproduce the issue
- Provide environment details (OS, browser, versions)
- Add screenshots or error logs when relevant

### **2. Feature Requests**
- Describe the feature clearly
- Explain the use case and benefits
- Consider implementation complexity
- Discuss with maintainers before major features

### **3. Pull Request Process**
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Follow coding standards and add tests

# Commit your changes
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request
```

### **4. Pull Request Guidelines**
- **Title**: Use conventional commit format
- **Description**: Clearly describe changes and motivation
- **Testing**: Include test results and screenshots
- **Related Issues**: Link to relevant issues
- **Review**: Address feedback from maintainers

## 📚 **Code Standards**

### **JavaScript/React**
```javascript
// Use functional components
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  // Use meaningful variable names
  const handleClick = () => {
    // Implementation
  };
  
  return (
    <div className="my-component">
      {/* JSX content */}
    </div>
  );
};

// Export components
export default MyComponent;
```

### **Python**
```python
def process_data(data: List[Dict]) -> pd.DataFrame:
    """
    Process transaction data and return formatted DataFrame.
    
    Args:
        data: List of transaction dictionaries
        
    Returns:
        Formatted pandas DataFrame
        
    Raises:
        ValueError: If data format is invalid
    """
    if not data:
        raise ValueError("Data cannot be empty")
    
    # Implementation
    return formatted_df
```

### **CSS**
```css
/* Use BEM methodology */
.component {
  /* Base styles */
}

.component__element {
  /* Element styles */
}

.component--modifier {
  /* Modifier styles */
}

/* Use CSS custom properties for theming */
.component {
  color: var(--primary-color);
  background: var(--background-color);
}
```

## 🧪 **Testing Guidelines**

### **Frontend Testing**
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=ComponentName
```

### **Backend Testing**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest test_file.py
```

### **Test Requirements**
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **Coverage**: Aim for 80%+ code coverage
- **Performance**: Test with realistic data volumes

## 📖 **Documentation Standards**

### **Code Documentation**
- **Functions**: Document parameters, return values, and exceptions
- **Classes**: Document purpose and usage
- **Complex Logic**: Add inline comments explaining reasoning
- **API Endpoints**: Document request/response formats

### **User Documentation**
- **README**: Keep main README updated
- **API Docs**: Document all public APIs
- **User Guides**: Create step-by-step instructions
- **Examples**: Provide working code examples

## 🔄 **Development Workflow**

### **Branch Naming Convention**
```
feature/feature-name          # New features
bugfix/issue-description      # Bug fixes
hotfix/critical-fix          # Urgent fixes
docs/documentation-update    # Documentation changes
refactor/code-improvement    # Code refactoring
test/test-coverage          # Testing improvements
```

### **Commit Message Format**
```
type(scope): description

feat(dashboard): add real-time data refresh
fix(auth): resolve login validation issue
docs(readme): update installation instructions
refactor(api): simplify data processing logic
test(components): add unit tests for Dashboard
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🚨 **Security Guidelines**

### **Data Handling**
- **Sensitive Data**: Never commit API keys or credentials
- **Environment Variables**: Use .env files for configuration
- **Input Validation**: Validate all user inputs
- **SQL Injection**: Use parameterized queries
- **XSS Prevention**: Sanitize user-generated content

### **Authentication & Authorization**
- **Secure Storage**: Use secure token storage
- **Password Hashing**: Hash passwords before storage
- **Session Management**: Implement secure session handling
- **Access Control**: Verify user permissions

## 🌐 **Internationalization**

### **Language Support**
- **Primary**: English
- **Secondary**: Filipino (Tagalog)
- **Text**: Use translation keys for all user-facing text
- **Formatting**: Support local date/time and number formats

### **Implementation**
```javascript
// Use translation keys
const message = t('dashboard.welcome_message');

// Support multiple languages
const languages = ['en', 'tl'];
```

## 📊 **Performance Guidelines**

### **Frontend Performance**
- **Lazy Loading**: Implement code splitting
- **Image Optimization**: Use appropriate image formats
- **Bundle Size**: Monitor and optimize bundle size
- **Caching**: Implement proper caching strategies

### **Backend Performance**
- **Database Queries**: Optimize database operations
- **Caching**: Use Redis for data caching
- **Async Processing**: Use background tasks for heavy operations
- **Monitoring**: Track performance metrics

## 🤝 **Communication**

### **Discussions**
- **GitHub Issues**: Use for technical discussions
- **Pull Requests**: Comment on specific code changes
- **Discussions**: Use GitHub Discussions for general topics

### **Getting Help**
- **Documentation**: Check existing docs first
- **Issues**: Search existing issues for solutions
- **Maintainers**: Tag maintainers for urgent issues
- **Community**: Engage with other contributors

## 📋 **Review Process**

### **Pull Request Review**
1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer approval
3. **Testing**: All tests must pass
4. **Documentation**: Update relevant documentation
5. **Merge**: Maintainers handle final merge

### **Review Criteria**
- **Functionality**: Does it work as intended?
- **Code Quality**: Is the code clean and maintainable?
- **Performance**: Any performance implications?
- **Security**: Any security concerns?
- **Testing**: Adequate test coverage?

## 🎉 **Recognition**

### **Contributor Recognition**
- **Contributors**: Listed in README.md
- **Commit History**: Preserved in git history
- **Release Notes**: Acknowledged in release notes
- **Community**: Recognition in project discussions

### **Types of Contributions**
- **Code**: Bug fixes, features, improvements
- **Documentation**: Guides, tutorials, API docs
- **Testing**: Test cases, bug reports
- **Design**: UI/UX improvements, graphics
- **Community**: Support, mentoring, outreach

## 📞 **Contact & Support**

### **Maintainers**
- **Lead Developer**: [Your Name]
- **Email**: [Your Email]
- **LinkedIn**: [Your LinkedIn]

### **Getting Help**
- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for urgent matters

## 📄 **License**

By contributing to BIPBIP, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to BIPBIP!** 🚀

Your contributions help make this platform better for BPI and the broader banking community. Every contribution, no matter how small, is valuable and appreciated.
