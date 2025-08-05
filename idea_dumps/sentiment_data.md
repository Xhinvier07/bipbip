BIPBIP Sentiment Analysis & Data Pipeline Strategy
Phase 1: Data Collection Strategy
Primary Data Sources
Google Places API Integration
Use Google Places API with your existing branch coordinates to find corresponding place_id
Extract reviews, ratings, and metadata for each BPI branch location
Limitation: Google Places typically returns only 5 most recent reviews per location
Cost: Approximately $17 per 1000 Place Details requests
Web Scraping Supplement
Scrape Google Maps reviews directly using Selenium/BeautifulSoup
Extract reviews from banking review websites (MoneyMax, Bangko Sentral consumer complaints)
Social media sentiment from Facebook pages, Twitter mentions
Synthetic Data Generation
Create banking-specific review templates covering common scenarios:
Service quality (staff friendliness, efficiency)
Wait times and queue management
Facility conditions and accessibility
Digital services integration
Generate 50-100 synthetic reviews per branch using realistic patterns
Maintain proper sentiment distribution (40% positive, 30% neutral, 30% negative)
Phase 2: Tech Stack Recommendation
Machine Learning Pipeline
Python Environment: Jupyter notebooks for experimentation, production scripts for automation
NLP Libraries:
Hugging Face Transformers for pre-trained Filipino/English sentiment models
NLTK/spaCy for text preprocessing
TextBlob for basic sentiment scoring
ML Frameworks: scikit-learn for traditional ML, PyTorch for transformer fine-tuning
Data Processing: pandas, numpy for data manipulation
Database & API Integration
Supabase: Primary database with real-time subscriptions
Google Sheets API: For branch data management and manual updates
Google Places API: For review collection and place verification
Caching Layer: Redis for frequently accessed sentiment scores
Deployment & Automation
Model Training: Google Colab Pro for GPU training, schedule retraining monthly
Data Pipeline: GitHub Actions for automated daily review collection
API Deployment: FastAPI on Heroku/Railway for model inference endpoints
Phase 3: Sentiment Analysis Model Development
Model Selection Strategy
Option 1: Pre-trained Transformer (Recommended for MVP)
Use existing multilingual sentiment models (mBERT, XLM-RoBERTa)
Fine-tune on Filipino banking terminology if needed
Faster deployment, good baseline performance
Models: "cardiffnlp/twitter-roberta-base-sentiment" or "nlptown/bert-base-multilingual-uncased-sentiment"
Option 2: Custom Model Training
Train from scratch using collected review dataset
Better domain adaptation but requires larger dataset
Consider if you collect 10,000+ reviews across all branches
Feature Engineering
Text Features: TF-IDF, word embeddings, n-grams
Metadata Features: Review length, rating correlation, time patterns
Banking-specific Features: Transaction type mentions, service keywords, wait time indicators
Phase 4: Database Schema & Data Flow
Supabase Table Structure
branches: Core branch information from Google Sheets
reviews: Raw review data with metadata
sentiment_analysis: Processed sentiment scores and classifications
branch_metrics: Daily aggregated sentiment and performance metrics
model_versions: Track model performance and deployment history
Data Pipeline Flow
Google Sheets → Branch Data → Supabase
Google Places API → Raw Reviews → Text Preprocessing → Sentiment Model → Scored Reviews → Supabase
Scheduled Jobs → Aggregate Metrics → Branch Performance Scores → Real-time Dashboard
Phase 5: Map Page Development Strategy
Data Integration for Map
Real-time Branch Status: Pull current sentiment scores from Supabase
Color Coding System:
Green (70-100%): High satisfaction branches
Orange (40-69%): Moderate performance branches
Red (0-39%): Needs attention branches
Interactive Markers: Click to show detailed branch analytics panel
Map Features Implementation
Mapbox GL JS: For smooth, customizable map experience
Clustering: Group nearby branches at lower zoom levels
Heat Map Overlay: Show satisfaction density across Metro Manila
Filter Controls: Filter by satisfaction score, review count, branch type
Right Panel Content
Branch Overview: Name, address, contact info
Sentiment Summary: Overall score, recent trend, review highlights
Performance Metrics: Average wait time, popular services, peak hours
Recent Reviews: Latest 3-5 reviews with sentiment labels
Recommendations: AI-generated improvement suggestions
Phase 6: AI Prompting Guidelines for Development
For Data Collection Scripts
Create a Python script that:
- Connects to Google Places API using branch coordinates
- Extracts all available review data including ratings, text, dates
- Handles API rate limits and error responses gracefully
- Stores raw data in structured format for processing
- Implements retry logic for failed requests
For Sentiment Analysis Model
Develop a sentiment analysis pipeline that:
- Preprocesses Filipino and English banking reviews
- Handles mixed-language text and banking terminology
- Returns sentiment scores (-1 to 1) and confidence levels
- Classifies reviews into positive/neutral/negative categories
- Provides explainable results for business insights
For Map Integration
Build a React map component that:
- Displays branch locations with real-time sentiment color coding
- Shows interactive popups with key branch metrics
- Implements smooth zoom and pan animations
- Updates marker colors based on live data changes
- Provides filtering and search functionality
For Database Operations
Create Supabase functions that:
- Aggregate daily sentiment scores by branch
- Calculate rolling averages and trend indicators
- Handle real-time updates for dashboard consumption
- Implement efficient queries for map data loading
- Maintain data consistency during batch updates
Success Metrics & Validation
Model Performance Targets
Sentiment Accuracy: >85% on manually labeled test set
Multi-language Support: Handle Filipino/English mixed reviews
Processing Speed: <200ms per review for real-time scoring
Data Coverage: Collect 50+ reviews per major branch
Business Impact Metrics
Branch Ranking Accuracy: Correlate with actual customer satisfaction surveys
Trend Detection: Identify declining branches 2-4 weeks before major issues
Operational Insights: Generate actionable recommendations for 80% of low-performing branches
This strategy provides a comprehensive roadmap for building the sentiment analysis component while integrating seamlessly with your existing Google API ecosystem and Supabase infrastructure.

