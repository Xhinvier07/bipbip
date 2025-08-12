# BIPBIP - Branch Intelligence Platform Documentation
This documentation provides a comprehensive overview of the BIPBIP (Branch Intelligence Platform) project, including architecture, components, and development guidelines. This will serve as a reference for AI agents like Trae to better understand the project context and structure.

## Table of Contents
1. 1.
   Project Overview
2. 2.
   Architecture
3. 3.
   Frontend
4. 4.
   Backend
5. 5.
   Machine Learning
6. 6.
   Datasets
7. 7.
   Development Roadmap
## Project Overview
BIPBIP is an AI-powered branch analytics platform designed to transform BPI's 1,250+ branch operations through real-time data integration and predictive insights. The platform creates a digital twin of the branch network, combining historical operational data with real-time feeds to optimize customer flow, staff productivity, and service delivery.

Core Value Proposition: Convert operational blind spots into actionable intelligence, reducing wait times by 50%, improving staff efficiency by 30%, and preventing customer churn through predictive analytics.

Key Features:

1. 1.
   Real-Time Branch Dashboard
2. 2.
   Map-based Branch Visualization
3. 3.
   Customer Flow Simulator
4. 4.
   Intelligent Churn Prevention
5. 5.
   Smart Staffing Optimizer
6. 6.
   Customer Sentiment Analytics
## Architecture
### Data Flow Architecture
```
flowchart TD
    A[Historical Data] --> B[Model 
    Training] --> C[Predictive 
    Models]
    D[Real-time BEA Data] --> E
    [Processing Engine] --> F
    [Dashboard/Insights]
    G[Customer Reviews] --> H
    [Sentiment Analysis] --> I
    [Branch Scoring]
    C --> F
    I --> F
```
### MVP Feature Prioritization
1. 1.
   Core Analytics Dashboard (Priority 1)
2. 2.
   Map-based Branch Visualization (Priority 1)
3. 3.
   Predictive Models & Insights (Priority 2)
4. 4.
   Simulation Tools (Priority 3)
5. 5.
   Chatbot Intelligence Layer (Priority 4)
## Frontend
### Technology Stack
- Framework: React with Vite (JavaScript)
- State Management: Redux or Context API
- Styling: Tailwind CSS
- UI Components: Headless UI, Radix UI, or Material UI
- Maps Integration: Google Maps API
- Charts/Visualization: D3.js, Chart.js, or Recharts
- 3D Visualization: Three.js (for branch simulation)
### Design System Typography
- Primary Font: Inter or Poppins
- Headings: Semi-bold, 24-48px
- Body Text: Regular, 16px
- Small Text: Regular, 14px Color Palette
- Primary Colors:
  
  - Orange: #fea000 (Used for primary actions, highlights)
  - Red: #cf3d58 (Used for alerts, critical information)
  - Pink: #c95a94 (Used for secondary elements)
  - Purple: #bc7eff (Used for tertiary elements)
- Secondary Colors:
  
  - Dark Blue: #2d3748 (Text, headers)
  - Light Gray: #f7fafc (Backgrounds)
  - Medium Gray: #a0aec0 (Inactive elements)
- Functional Colors:
  
  - Success: #48bb78
  - Warning: #ed8936
  - Error: #f56565
  - Info: #4299e1
### Pages & Components Pages
1. 1.
   Login Page
   
   - Authentication form
   - Role-based access control
2. 2.
   Dashboard
   
   - KPI summary cards
   - Transaction charts
   - Branch performance metrics
   - Time and day filters
   - Chatbot integration
3. 3.
   Map View
   
   - Interactive branch map
   - Filter controls
   - Branch details sidebar
   - Performance heatmap overlay
4. 4.
   Simulation
   
   - 2D/3D branch visualization
   - Parameter controls
   - Real-time simulation results
   - Scenario comparison
5. 5.
   Branch Details
   
   - Comprehensive branch metrics
   - Staff performance
   - Customer sentiment analysis
   - Historical trends Core Components
1. 1.
   Navigation
   
   - Sidebar navigation
   - User profile dropdown
   - Notifications center
2. 2.
   Data Visualization
   
   - Line charts for trends
   - Bar charts for comparisons
   - Pie/donut charts for distributions
   - Heatmaps for geospatial data
3. 3.
   Interactive Map
   
   - Branch markers with status indicators
   - Clustering for dense areas
   - Search and filter functionality
   - Custom info windows
4. 4.
   Simulation Controls
   
   - Parameter sliders
   - Time controls (play, pause, reset)
   - Scenario saving/loading
   - Results comparison
5. 5.
   Chatbot Interface
   
   - Natural language query input
   - Response display
   - Suggestion chips
   - Context awareness
### Libraries & Dependencies
```
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "@reduxjs/toolkit": "^1.9.5",
    "react-redux": "^8.0.5",
    "@react-google-maps/api": "^2.
    18.1",
    "chart.js": "^4.3.0",
    "react-chartjs-2": "^5.2.0",
    "three": "^0.152.2",
    "@headlessui/react": "^1.7.14",
    "tailwindcss": "^3.3.2",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "vite": "^4.3.5",
    "@vitejs/plugin-react": "^4.0.
    0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.23",
    "eslint": "^8.40.0",
    "eslint-plugin-react": "^7.32.
    2",
    "eslint-plugin-react-hooks": 
    "^4.6.0"
  }
}
```
## Backend
### Technology Stack
- API Framework: FastAPI or Express.js
- Database: Supabase (PostgreSQL) or Google Sheets API
- Authentication: JWT with role-based access control
- Caching: Redis (optional for performance)
- Deployment: Vercel, Netlify, or Railway
### API Endpoints Authentication
- POST /api/auth/login - User login
- POST /api/auth/refresh - Refresh token
- GET /api/auth/me - Get current user Branches
- GET /api/branches - List all branches
- GET /api/branches/{id} - Get branch details
- GET /api/branches/{id}/metrics - Get branch performance metrics
- GET /api/branches/{id}/sentiment - Get branch sentiment analysis Analytics
- GET /api/analytics/transactions - Get transaction analytics
- GET /api/analytics/staff - Get staff performance metrics
- GET /api/analytics/customers - Get customer flow metrics
- GET /api/analytics/churn - Get churn risk predictions Simulation
- POST /api/simulation/customer-flow - Run customer flow simulation
- POST /api/simulation/staffing - Run staffing optimization simulation
### Database Schema Branches Table
```
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  branch_name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  branch_type TEXT,
  opening_hours JSONB,
  contact_info JSONB,
  created_at TIMESTAMP DEFAULT NOW
  (),
  updated_at TIMESTAMP DEFAULT NOW()
);
``` Reviews Table
```
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES 
  branches(id),
  review_text TEXT,
  rating INTEGER CHECK (rating >= 1 
  AND rating <= 5),
  language TEXT,
  source TEXT,
  review_date TIMESTAMP,
  sentiment_score FLOAT,
  sentiment_label TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
``` Transactions Table
```
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES 
  branches(id),
  transaction_type TEXT,
  transaction_time TIMESTAMP,
  duration_seconds INTEGER,
  staff_id INTEGER,
  customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
``` Branch Metrics Table
```
CREATE TABLE branch_metrics (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES 
  branches(id),
  date DATE,
  avg_wait_time FLOAT,
  total_transactions INTEGER,
  staff_count INTEGER,
  customer_count INTEGER,
  satisfaction_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```
## Machine Learning
### Sentiment Analysis Data Collection
- Sources:
  
  - Google Maps reviews (via API or scraping)
  - Social media mentions
  - Synthetic data generation
- Data Structure:
  
  - Review text
  - Rating (1-5 stars)
  - Branch ID/name
  - Language (English, Tagalog, Taglish)
  - Date Preprocessing Pipeline
1. 1.
   Text Cleaning:
   
   - Remove special characters, emojis
   - Normalize text (lowercase, remove extra spaces)
   - Handle Tagalog/English/Taglish text
2. 2.
   Feature Engineering:
   
   - Tokenization
   - Stop word removal
   - TF-IDF or word embeddings
   - Language detection Model Architecture
- Approach 1: Pre-trained Transformer (Recommended for MVP)
  
  - Use existing multilingual models (mBERT, XLM-RoBERTa)
  - Fine-tune on Filipino banking terminology
  - Models: "cardiffnlp/twitter-roberta-base-sentiment" or "nlptown/bert-base-multilingual-uncased-sentiment"
- Approach 2: Custom Model Training
  
  - Train from scratch using collected review dataset
  - Better domain adaptation but requires larger dataset
  - Consider if you collect 10,000+ reviews across all branches Training Process
```
# Example code for sentiment 
analysis model training
from transformers import 
AutoModelForSequenceClassification, 
AutoTokenizer, Trainer, 
TrainingArguments
import pandas as pd
import torch

# Load pre-trained model and 
tokenizer
model_name = "nlptown/
bert-base-multilingual-uncased-senti
ment"
tokenizer = AutoTokenizer.
from_pretrained(model_name)
model = 
AutoModelForSequenceClassification.
from_pretrained(model_name)

# Prepare dataset
df = pd.read_csv("bank_reviews.csv")

# Preprocess and tokenize data
class ReviewDataset(torch.utils.
data.Dataset):
    def __init__(self, reviews, 
    ratings, tokenizer, 
    max_length=128):
        self.tokenizer = tokenizer
        self.reviews = reviews
        self.ratings = ratings
        self.max_length = max_length
        
    def __len__(self):
        return len(self.reviews)
    
    def __getitem__(self, idx):
        review = self.reviews[idx]
        rating = self.ratings[idx]
        
        encoding = self.tokenizer(
            review,
            max_length=self.
            max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        
        return {
            "input_ids": encoding
            ["input_ids"].flatten(),
            "attention_mask": 
            encoding
            ["attention_mask"].
            flatten(),
            "labels": torch.tensor
            (rating - 1, 
            dtype=torch.long)
        }

# Split data into train and 
validation sets
train_df = df.sample(frac=0.8, 
random_state=42)
val_df = df.drop(train_df.index)

train_dataset = ReviewDataset(
    train_df["review_text"].tolist
    (),
    train_df["rating"].tolist(),
    tokenizer
)

val_dataset = ReviewDataset(
    val_df["review_text"].tolist(),
    val_df["rating"].tolist(),
    tokenizer
)

# Set up training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    warmup_steps=500,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=10,
    evaluation_strategy="epoch"
)

# Initialize Trainer and train model
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset
)

trainer.train()

# Save the fine-tuned model
model.save_pretrained("./
bank_sentiment_model")
tokenizer.save_pretrained("./
bank_sentiment_model")
``` Inference Pipeline
```
# Example code for sentiment 
analysis inference
from transformers import 
AutoModelForSequenceClassification, 
AutoTokenizer
import torch

# Load fine-tuned model and 
tokenizer
model_path = "./
bank_sentiment_model"
tokenizer = AutoTokenizer.
from_pretrained(model_path)
model = 
AutoModelForSequenceClassification.
from_pretrained(model_path)

def analyze_sentiment(review_text):
    # Tokenize input text
    inputs = tokenizer(
        review_text,
        return_tensors="pt",
        truncation=True,
        max_length=128,
        padding="max_length"
    )
    
    # Get model prediction
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = outputs.logits
        predicted_class = torch.
        argmax(predictions, dim=1).
        item()
    
    # Map class to sentiment label 
    and score
    sentiment_map = {
        0: "very negative",
        1: "negative",
        2: "neutral",
        3: "positive",
        4: "very positive"
    }
    
    # Calculate normalized score 
    (0-1)
    scores = torch.nn.functional.
    softmax(predictions, dim=1)[0].
    tolist()
    normalized_score = 
    (predicted_class / 4)  # 
    Normalize to 0-1 range
    
    return {
        "sentiment": sentiment_map
        [predicted_class],
        "score": normalized_score,
        "confidence": scores
        [predicted_class],
        "class_distribution": scores
    }

# Example usage
review = "The staff was very 
helpful and the transaction was 
quick."
result = analyze_sentiment(review)
print(result)
```
### Other ML Models
1. 1.
   Customer Flow Prediction
   
   - Time series forecasting for branch traffic
   - Features: day of week, month, holidays, local events
   - Algorithms: Prophet, LSTM, or ARIMA
2. 2.
   Churn Risk Prediction
   
   - Binary classification for customer churn risk
   - Features: visit frequency, transaction types, wait times
   - Algorithms: Logistic Regression, Random Forest, or XGBoost
3. 3.
   Staff Optimization
   
   - Regression for optimal staffing levels
   - Features: predicted customer flow, transaction types, time of day
   - Algorithms: Random Forest, XGBoost, or Neural Networks
## Datasets
### Required Datasets
1. 1.
   Branch Information
   
   - Status: Available (deduplicated_branches.csv)
   - Fields: city, branch_name, address, latitude, longitude
   - Source: Web scraping (already completed)
   - Additional Fields Needed: branch_type, opening_hours, contact_info
2. 2.
   Customer Reviews
   
   - Status: Partially available (review scraper in progress)
   - Fields: review_text, rating, branch_id, language, sentiment
   - Source: Google Maps API, web scraping, synthetic generation
   - Volume Needed: 50-100 reviews per branch minimum
3. 3.
   Transaction Data
   
   - Status: Not available (needs simulation or synthetic generation)
   - Fields: transaction_type, duration, staff_id, customer_id, timestamp
   - Source: Synthetic data generation based on realistic patterns
   - Volume Needed: 10,000+ transactions across branches
4. 4.
   Branch Performance Metrics
   
   - Status: Not available (needs simulation or synthetic generation)
   - Fields: avg_wait_time, total_transactions, staff_count, customer_count
   - Source: Synthetic data generation based on realistic patterns
   - Volume Needed: Daily metrics for 6+ months
### Data Collection Strategy
1. 1.
   Google Places API Integration
   
   - Use Google Places API with branch coordinates to find place_id
   - Extract reviews, ratings, and metadata for each branch
   - Cost: Approximately $17 per 1000 Place Details requests
2. 2.
   Web Scraping Supplement
   
   - Scrape Google Maps reviews using Selenium/BeautifulSoup
   - Extract reviews from banking review websites
   - Social media sentiment from Facebook pages, Twitter mentions
3. 3.
   Synthetic Data Generation
   
   - Create banking-specific review templates for common scenarios
   - Generate realistic transaction patterns based on time of day/week
   - Maintain proper sentiment distribution (40% positive, 30% neutral, 30% negative)
### Data Storage
1. 1.
   Supabase (Primary Option)
   
   - PostgreSQL database with real-time subscriptions
   - Tables: branches, reviews, transactions, branch_metrics
   - API integration for frontend access
2. 2.
   Google Sheets (Alternative Option)
   
   - Simpler setup for MVP phase
   - Separate sheets for branches, reviews, metrics
   - Google Sheets API for data access
## Development Roadmap
### Phase 1: Foundation (Week 1-2)
1. 1.
   Project Setup
   
   - Initialize React Vite project
   - Set up Supabase or Google Sheets
   - Configure authentication system
2. 2.
   Data Collection
   
   - Complete review scraping
   - Generate synthetic transaction data
   - Prepare branch information dataset
3. 3.
   Basic Frontend
   
   - Implement login page
   - Create basic dashboard layout
   - Set up routing and navigation
### Phase 2: Core Features (Week 3-4)
1. 1.
   Map Integration
   
   - Implement Google Maps with branch markers
   - Add filtering and search functionality
   - Create branch details sidebar
2. 2.
   Dashboard Components
   
   - Implement key performance indicators
   - Create transaction charts
   - Add branch comparison features
3. 3.
   Sentiment Analysis
   
   - Train initial sentiment model
   - Implement sentiment scoring API
   - Create sentiment visualization components
### Phase 3: Advanced Features (Week 5-6)
1. 1.
   Simulation Tools
   
   - Implement customer flow simulator
   - Create staffing optimization tools
   - Add scenario comparison functionality
2. 2.
   Predictive Models
   
   - Implement churn prediction
   - Add customer flow forecasting
   - Create staff scheduling recommendations
3. 3.
   Integration & Refinement
   
   - Connect all components
   - Optimize performance
   - Refine UI/UX
### Phase 4: Finalization (Week 7-8)
1. 1.
   Testing & Debugging
   
   - Conduct user testing
   - Fix bugs and issues
   - Optimize performance
2. 2.
   Documentation
   
   - Create user documentation
   - Document API endpoints
   - Prepare presentation materials
3. 3.
   Deployment
   
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to appropriate platform
   - Prepare for hackathon presentation
This documentation provides a comprehensive overview of the BIPBIP project, including architecture, components, and development guidelines. It serves as a reference for AI agents like Trae to better understand the project context and structure, and provides a roadmap for development.