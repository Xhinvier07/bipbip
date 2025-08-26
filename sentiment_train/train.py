import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import torch
from transformers import pipeline
import re
import json
from datetime import datetime, timedelta
import warnings
import random

warnings.filterwarnings('ignore')

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")


class BPISentimentAnalyzer:
    def __init__(self, csv_path):
        """Initialize the sentiment analyzer with data loading"""
        self.csv_path = csv_path
        self.df = None
        self.sentiment_pipeline = None
        self.overall_sentiment = None
        self.branch_sentiments = {}
        self.aspects = [
            # Original aspects
            'service', 'staff', 'wait time', 'facility', 'atm', 'fees', 'process', 'system', 'queue',
            'parking',

            # Customer service & interaction
            'customer service', 'staff behavior', 'staff knowledge', 'staff professionalism',
            'helpfulness', 'courtesy', 'communication', 'language support', 'accessibility',
            'complaint handling', 'problem resolution',

            # Physical environment
            'cleanliness', 'comfort', 'temperature', 'lighting', 'noise level', 'seating',
            'restroom', 'air conditioning', 'ventilation', 'decoration', 'ambiance',
            'security', 'safety', 'privacy',

            # Technology & systems
            'online services', 'mobile app', 'website', 'digital system', 'internet',
            'wifi', 'kiosk', 'self service', 'payment system', 'card reader',
            'transaction speed', 'system reliability', 'technical support',

            # Operational aspects
            'operating hours', 'availability', 'scheduling', 'appointment system',
            'efficiency', 'organization', 'workflow', 'documentation', 'paperwork',
            'forms', 'requirements', 'procedures', 'policy', 'rules',

            # Financial aspects
            'pricing', 'cost', 'charges', 'hidden fees', 'transparency', 'payment options',
            'billing', 'refund', 'exchange rate', 'interest rate', 'loan terms',

            # Accessibility & convenience
            'location', 'transportation', 'public transport', 'wheelchair access',
            'elevator', 'ramp', 'signage', 'directions', 'information desk',
            'child friendly', 'elderly friendly',

            # Quality & reliability
            'accuracy', 'error handling', 'consistency', 'reliability', 'quality',
            'completeness', 'follow up', 'tracking', 'updates', 'notifications',

            # Specific services
            'account opening', 'loan application', 'money transfer', 'currency exchange',
            'insurance', 'investment', 'consultation', 'advice', 'guidance',
            'training', 'workshop', 'education',

            # Communication channels
            'phone support', 'email support', 'chat support', 'social media',
            'feedback system', 'survey', 'review process', 'contact methods',

            # Additional operational
            'branch network', 'coverage', 'partnerships', 'affiliations',
            'rewards program', 'loyalty program', 'promotions', 'offers',
            'terms and conditions', 'contract', 'agreement'
        ]

        # Updated cities list
        self.cities = [
            "Manila", "Makati", "Pasig", "Taguig", "Quezon City", "Mandaluyong",
            "Pasay", "San Juan", "Caloocan", "Marikina", "Muntinlupa", "Las Piñas",
            "Parañaque", "Valenzuela", "Malabon", "Navotas"
        ]

    def load_data(self):
        """Load and preprocess the CSV data"""
        print("Loading data...")
        self.df = pd.read_csv(self.csv_path)

        # Basic data info
        print(f"Dataset shape: {self.df.shape}")
        print(f"Columns: {self.df.columns.tolist()}")
        print(f"Unique branches: {self.df['branch_name'].nunique()}")

        # Handle missing values - DON'T drop rows with missing review_text
        # Instead, fill empty review_text with placeholder
        self.df['review_text'] = self.df['review_text'].fillna('No review text provided')
        self.df['review_text'] = self.df['review_text'].astype(str)

        # Replace empty strings with placeholder
        self.df['review_text'] = self.df['review_text'].replace('', 'No review text provided')
        self.df['review_text'] = self.df['review_text'].replace('nan', 'No review text provided')

        print(f"Data loaded successfully!")
        print(f"Reviews with text: {len(self.df[self.df['review_text'] != 'No review text provided'])}")
        print(f"Reviews without text: {len(self.df[self.df['review_text'] == 'No review text provided'])}")
        return self.df

    def setup_bert_model(self, model_name='nlptown/bert-base-multilingual-uncased-sentiment'):
        """Initialize BERT model for sentiment analysis"""
        print("Setting up BERT model...")
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model=model_name,
            tokenizer=model_name,
            device=0 if torch.cuda.is_available() else -1
        )
        print("BERT model setup complete!")

    def preprocess_text(self, text):
        """Clean and preprocess text"""
        text = str(text).lower()
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[^\w\s.,!?]', '', text)
        return text

    def predict_sentiment_with_validation(self, text):
        """Predict sentiment with enhanced validation against obvious patterns"""
        # Handle empty or placeholder text
        if not text or len(text.strip()) == 0 or text == 'No review text provided':
            return 'Neutral'

        try:
            # Check for obvious negative patterns first
            negative_patterns = [
                'worst', 'terrible', 'awful', 'horrible', 'disgusting', 'hate',
                'rude', 'unprofessional', 'slow', 'long wait', 'bad service',
                'poor', 'disappointing', 'frustrated', 'angry', 'annoyed',
                'useless', 'pathetic', 'nightmare', 'disaster'
            ]

            # Check for obvious positive patterns
            positive_patterns = [
                'excellent', 'great', 'amazing', 'fantastic', 'wonderful',
                'good', 'fast', 'quick', 'helpful', 'friendly', 'professional',
                'clean', 'efficient', 'satisfied', 'happy', 'recommend',
                'love', 'best', 'perfect'
            ]

            text_lower = text.lower()

            # Count negative and positive keywords
            negative_count = sum(1 for pattern in negative_patterns if pattern in text_lower)
            positive_count = sum(1 for pattern in positive_patterns if pattern in text_lower)

            # If there's a clear keyword dominance, use that
            if negative_count > positive_count and negative_count >= 2:
                return 'Negative'
            elif positive_count > negative_count and positive_count >= 2:
                return 'Positive'

            # Otherwise, use BERT but validate the result
            result = self.sentiment_pipeline(text[:512])
            score = result[0]['score']
            label = result[0]['label']

            # Map to our format with validation
            if label in ['POSITIVE', '5 stars', '4 stars']:
                bert_sentiment = 'Positive'
            elif label in ['NEGATIVE', '1 star', '2 stars']:
                bert_sentiment = 'Negative'
            else:
                bert_sentiment = 'Neutral'

            # Cross-validate BERT result with keyword analysis
            if negative_count > 0 and bert_sentiment == 'Positive':
                # BERT says positive but we found negative keywords
                if negative_count >= positive_count:
                    return 'Negative'  # Override BERT
            elif positive_count > 0 and bert_sentiment == 'Negative':
                # BERT says negative but we found positive keywords
                if positive_count >= negative_count:
                    return 'Positive'  # Override BERT

            return bert_sentiment

        except Exception as e:
            print(f"Error in sentiment prediction: {e}")
            return 'Neutral'

    def rating_to_sentiment(self, rating):
        """Convert star rating to sentiment"""
        if pd.isna(rating):
            return 'Neutral'
        if rating >= 4:
            return 'Positive'
        elif rating == 3:
            return 'Neutral'
        else:  # rating <= 2
            return 'Negative'

    def determine_final_sentiment(self, text_sentiment, rating_sentiment, star_rating):
        """
        Determine final sentiment using a priority system:
        1. Star rating is the primary indicator (most reliable)
        2. Text sentiment is secondary (but important for validation)
        3. Resolve conflicts intelligently
        """
        # If no star rating, use text sentiment
        if pd.isna(star_rating):
            return text_sentiment

        # If both agree, use that sentiment
        if text_sentiment == rating_sentiment:
            return text_sentiment

        # Handle conflicts with star rating priority
        if star_rating <= 2:  # 1-2 stars
            # For very low ratings, always negative regardless of text
            return 'Negative'
        elif star_rating >= 4:  # 4-5 stars
            # For high ratings, lean positive but consider strong negative text
            if text_sentiment == 'Negative':
                return 'Neutral'  # Compromise between conflicting signals
            else:
                return 'Positive'
        else:  # 3 stars
            # For middle rating, text sentiment can influence more
            if text_sentiment == 'Negative':
                return 'Negative'
            elif text_sentiment == 'Positive':
                return 'Positive'
            else:
                return 'Neutral'

    def sentiment_to_score_range(self, sentiment):
        """Convert sentiment to randomized score within range"""
        if sentiment == 'Positive':
            return random.randint(70, 95)
        elif sentiment == 'Neutral':
            return random.randint(45, 69)
        else:  # Negative
            return random.randint(20, 44)

    def calculate_branch_sentiments(self):
        """Calculate branch sentiments based on weighted average"""
        print("Calculating branch sentiments...")
        self.branch_sentiments = {}

        for branch in self.df['branch_name'].unique():
            branch_data = self.df[self.df['branch_name'] == branch]

            if len(branch_data) == 0:
                self.branch_sentiments[branch] = 'Neutral'
                continue

            # Count final sentiments
            sentiment_counts = branch_data['final_sentiment'].value_counts()
            pos_count = sentiment_counts.get('Positive', 0)
            neu_count = sentiment_counts.get('Neutral', 0)
            neg_count = sentiment_counts.get('Negative', 0)

            # Calculate weighted score
            total_reviews = len(branch_data)
            weighted_score = (pos_count * 85 + neu_count * 65 + neg_count * 45) / total_reviews

            # Determine sentiment based on weighted score
            if weighted_score >= 75:
                self.branch_sentiments[branch] = 'Positive'
            elif weighted_score >= 55:
                self.branch_sentiments[branch] = 'Neutral'
            else:
                self.branch_sentiments[branch] = 'Negative'

    def calculate_overall_sentiment(self):
        """Calculate overall sentiment based on weighted average"""
        sentiment_counts = self.df['final_sentiment'].value_counts()
        pos_count = sentiment_counts.get('Positive', 0)
        neu_count = sentiment_counts.get('Neutral', 0)
        neg_count = sentiment_counts.get('Negative', 0)

        total_reviews = len(self.df)
        if total_reviews == 0:
            self.overall_sentiment = 'Neutral'
            return

        # Calculate weighted score
        weighted_score = (pos_count * 85 + neu_count * 65 + neg_count * 45) / total_reviews

        # Determine overall sentiment based on weighted score
        if weighted_score >= 75:
            self.overall_sentiment = 'Positive'
        elif weighted_score >= 55:
            self.overall_sentiment = 'Neutral'
        else:
            self.overall_sentiment = 'Negative'

    def analyze_sentiments(self):
        """Perform comprehensive sentiment analysis with improved logic"""
        print("Performing sentiment analysis...")

        # Preprocess texts
        self.df['cleaned_text'] = self.df['review_text'].apply(self.preprocess_text)

        print("Analyzing sentiments using enhanced BERT + keyword validation...")
        text_sentiments = []
        rating_sentiments = []
        final_sentiments = []

        for idx, row in self.df.iterrows():
            # Get text-based sentiment (with validation)
            if row['review_text'] == 'No review text provided':
                text_sentiment = 'Neutral'  # Default for no text
            else:
                text_sentiment = self.predict_sentiment_with_validation(row['cleaned_text'])

            # Get rating-based sentiment
            rating_sentiment = self.rating_to_sentiment(row['star_rating'])

            # Determine final sentiment using priority logic
            final_sentiment = self.determine_final_sentiment(
                text_sentiment, rating_sentiment, row['star_rating']
            )

            text_sentiments.append(text_sentiment)
            rating_sentiments.append(rating_sentiment)
            final_sentiments.append(final_sentiment)

            # Debug problematic cases
            if idx < 10 or (text_sentiment == 'Positive' and rating_sentiment == 'Negative'):
                print(
                    f"Row {idx}: Rating={row['star_rating']}, Text='{text_sentiment}', Rating='{rating_sentiment}', Final='{final_sentiment}'")

        self.df['text_based_sentiment'] = text_sentiments
        self.df['rating_based_sentiment'] = rating_sentiments
        self.df['final_sentiment'] = final_sentiments

        # Calculate overall and branch sentiments using final sentiment
        self.calculate_overall_sentiment()
        self.calculate_branch_sentiments()

        print(f"Overall Sentiment: {self.overall_sentiment}")
        print(f"Branch Sentiments calculated for {len(self.branch_sentiments)} branches")

        # Show breakdown
        final_sentiment_counts = self.df['final_sentiment'].value_counts()
        print(f"Final sentiment distribution:")
        for sentiment in ['Positive', 'Neutral', 'Negative']:
            count = final_sentiment_counts.get(sentiment, 0)
            percentage = (count / len(self.df) * 100) if len(self.df) > 0 else 0
            print(f"  - {sentiment}: {count} ({percentage:.1f}%)")

    def extract_city_from_branch(self, branch_name):
        """Extract city from branch name using the predefined cities list"""
        branch_lower = branch_name.lower()

        # Check if any city name is in the branch name
        for city in self.cities:
            if city.lower() in branch_lower:
                return city

        # Default to first word of branch name if no city match found
        first_word = branch_name.split()[0] if branch_name.split() else "Metro Manila"
        return first_word.title()

    def generate_js_compatible_data(self):
        """Generate data structure compatible with the JavaScript file"""
        print("Generating JavaScript-compatible data...")

        # Get unique branch names
        branch_names = sorted(self.df['branch_name'].unique())

        # Calculate CSAT scores with proper weighted averages using FINAL sentiment
        sentiment_counts = self.df['final_sentiment'].value_counts()
        total_reviews = int(len(self.df))

        # Calculate overall weighted score
        overall_score = int((
                                    sentiment_counts.get('Positive', 0) * 85 +
                                    sentiment_counts.get('Neutral', 0) * 65 +
                                    sentiment_counts.get('Negative', 0) * 45
                            ) // total_reviews if total_reviews > 0 else 65)

        # Calculate branch scores with weighted averages using final sentiment
        branch_scores = {}
        for branch in branch_names:
            branch_data = self.df[self.df['branch_name'] == branch]
            if len(branch_data) > 0:
                branch_sentiment_counts = branch_data['final_sentiment'].value_counts()
                branch_score = int((
                                           branch_sentiment_counts.get('Positive', 0) * 85 +
                                           branch_sentiment_counts.get('Neutral', 0) * 65 +
                                           branch_sentiment_counts.get('Negative', 0) * 45
                                   ) // len(branch_data))
                branch_scores[branch] = branch_score

        # Find top and bottom performers
        top_performer = max(branch_scores.items(), key=lambda x: x[1]) if branch_scores else ("Unknown", 65)
        bottom_performer = min(branch_scores.items(), key=lambda x: x[1]) if branch_scores else ("Unknown", 65)

        # Extract common tags
        positive_tags = [tag for tag, count in self.extract_common_tags(self.df, 'Positive')]
        neutral_tags = [tag for tag, count in self.extract_common_tags(self.df, 'Neutral')]
        negative_tags = [tag for tag, count in self.extract_common_tags(self.df, 'Negative')]

        # Create customer reviews data with CORRECTED scores based on final sentiment
        customer_reviews = []
        for idx, row in self.df.iterrows():
            # Get score based on FINAL sentiment (this fixes the bug)
            score = self.sentiment_to_score_range(row['final_sentiment'])

            # Extract city using improved method
            city = self.extract_city_from_branch(row['branch_name'])

            # Extract tags based on final sentiment
            tags = []
            if row['final_sentiment'] == 'Positive':
                tags = ['Fast Service', 'Professional Staff'] if 'fast' in row['cleaned_text'] or 'professional' in row[
                    'cleaned_text'] else ['Good Experience']
            elif row['final_sentiment'] == 'Negative':
                tags = ['Long Wait Time', 'Poor Service'] if 'long' in row['cleaned_text'] or 'poor' in row[
                    'cleaned_text'] else ['Issues']
            else:
                tags = ['Average Experience']

            customer_reviews.append({
                "id": int(idx + 1),
                "branchName": str(row['branch_name']),
                "city": str(city),
                "customerId": f"#N{str(idx + 1).zfill(3)}",
                "date": (datetime.now() - timedelta(days=int(np.random.randint(1, 30)))).strftime("%Y-%m-%d"),
                "rating": int(score),
                "comment": str(
                    row['review_text'][:200] + "..." if len(row['review_text']) > 200 else row['review_text']),
                "tags": tags
            })

        # CSAT Summary using final sentiment
        csat_summary = {
            "overallScore": int(overall_score),
            "totalReviews": int(total_reviews),
            "positiveFeedback": int(sentiment_counts.get('Positive', 0)),
            "neutralFeedback": int(sentiment_counts.get('Neutral', 0)),
            "negativeFeedback": int(sentiment_counts.get('Negative', 0)),
            "topPerformer": {
                "branchName": str(top_performer[0]),
                "city": str(self.extract_city_from_branch(top_performer[0])),
                "score": int(top_performer[1])
            },
            "needsImprovement": {
                "branchName": str(bottom_performer[0]),
                "city": str(self.extract_city_from_branch(bottom_performer[0])),
                "score": int(bottom_performer[1])
            },
            "commonTags": {
                "positive": positive_tags,
                "neutral": neutral_tags,
                "negative": negative_tags
            }
        }

        # City performance (aggregate branch scores by city)
        city_performance = []
        city_scores = {}
        for branch, score in branch_scores.items():
            city = self.extract_city_from_branch(branch)
            if city not in city_scores:
                city_scores[city] = []
            city_scores[city].append(score)

        for city, scores in city_scores.items():
            avg_score = int(sum(scores) // len(scores))
            city_performance.append({"city": str(city), "score": int(avg_score)})

        # Monthly trends (simulate based on data with more realistic variation)
        monthly_trends = []
        base_score = overall_score
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for i, month in enumerate(months):
            # More realistic variation based on base score
            variation = int(np.random.randint(-8, 9))
            score = int(max(25, min(95, base_score + variation)))
            monthly_trends.append({"month": str(month), "score": int(score)})

        return {
            "cities": self.cities,
            "branchNames": [str(branch) for branch in branch_names],
            "customerReviews": customer_reviews,
            "csatSummary": csat_summary,
            "monthlyTrends": monthly_trends,
            "cityPerformance": city_performance,
            "overallSentiment": str(self.overall_sentiment),
            "branchSentiments": {str(k): str(v) for k, v in self.branch_sentiments.items()}
        }

    def extract_common_tags(self, reviews, sentiment_type):
        """Extract common tags/themes from reviews based on final sentiment"""
        sentiment_reviews = reviews[reviews['final_sentiment'] == sentiment_type]['cleaned_text']

        # Define keyword categories for bank reviews
        positive_keywords = {
            'Fast Service': ['fast', 'quick', 'speedy', 'efficient', 'rapid', 'swift', 'prompt', 'immediate', 'instant',
                             'timely'],

            'Professional Staff': ['professional', 'courteous', 'polite', 'respectful', 'well-trained', 'knowledgeable',
                                   'competent', 'skilled', 'experienced', 'qualified', 'expert'],

            'Clean': ['clean', 'neat', 'organized', 'tidy', 'spotless', 'well-maintained', 'pristine', 'hygienic',
                      'sanitized'],

            'Helpful Staff': ['helpful', 'accommodating', 'friendly', 'kind', 'supportive', 'caring', 'attentive',
                              'patient', 'understanding', 'cooperative', 'generous', 'welcoming', 'warm'],

            'Modern Facilities': ['modern', 'updated', 'new', 'facilities', 'contemporary', 'state-of-the-art',
                                  'advanced',
                                  'upgraded', 'renovated', 'high-tech', 'digital'],

            'Excellent Customer Service': ['excellent', 'outstanding', 'exceptional', 'superb', 'amazing', 'fantastic',
                                           'wonderful', 'great', 'perfect', 'top-notch', 'first-class'],

            'Convenient Location': ['convenient', 'accessible', 'central', 'easy to find', 'good location', 'nearby',
                                    'strategic', 'well-located', 'close', 'reachable'],

            'Security & Safety': ['secure', 'safe', 'protected', 'trustworthy', 'reliable', 'confidential', 'private',
                                  'guarded', 'monitored'],

            'Low Fees': ['low fees', 'affordable', 'reasonable rates', 'competitive', 'cost-effective', 'economical',
                         'budget-friendly', 'no hidden charges', 'transparent pricing'],

            'Technology': ['mobile app', 'online banking', 'ATM', 'digital', 'user-friendly', 'seamless', 'smooth',
                           'intuitive', 'automated', 'self-service'],

            'Problem Resolution': ['resolved', 'solved', 'fixed', 'handled well', 'sorted out', 'addressed',
                                   'corrected',
                                   'remedied', 'settled'],

            'Account Services': ['easy account opening', 'smooth process', 'straightforward', 'hassle-free', 'simple',
                                 'streamlined', 'uncomplicated']
        }

        neutral_keywords = {
            'Average Wait Time': ['average', 'okay', 'normal', 'reasonable', 'typical', 'standard', 'usual', 'moderate',
                                  'acceptable', 'fair'],

            'Crowded': ['crowded', 'busy', 'full', 'packed', 'many people', 'occupied', 'populated', 'congested'],

            'Peak Hour Issues': ['lunch', 'peak', 'rush hour', 'busy time', 'morning rush', 'end of month', 'payday',
                                 'weekend', 'holiday period'],

            'Standard Service': ['standard', 'regular', 'routine', 'basic', 'conventional', 'ordinary', 'common',
                                 'typical banking'],

            'Limited Hours': ['limited hours', 'short hours', 'early closing', 'weekend hours', 'holiday schedule'],

            'Parking Situation': ['parking', 'space', 'lot', 'street parking', 'valet', 'garage']
        }

        negative_keywords = {
            'Long Wait Time': ['long', 'slow', 'wait', 'delay', 'hours', 'forever', 'endless', 'extended', 'prolonged',
                               'lengthy', 'time-consuming', 'takes too long', 'wasted time'],

            'System Issues': ['system', 'down', 'maintenance', 'technical', 'network', 'server', 'offline', 'crashed',
                              'frozen', 'error', 'glitch', 'malfunction', 'broken', 'not working'],

            'Poor Communication': ['communication', 'information', 'notice', 'announcement', 'unclear', 'confusing',
                                   'no updates', 'lack of info', 'poor explanation', 'miscommunication',
                                   'language barrier'],

            'Understaffed': ['staff', 'teller', 'understaffed', 'more people', 'shortage', 'insufficient staff',
                             'overworked', 'too few', 'need more employees', 'stretched thin'],

            'Poor Service': ['poor', 'bad', 'terrible', 'awful', 'disappointing', 'horrible', 'worst', 'pathetic',
                             'unacceptable', 'subpar', 'inadequate', 'unsatisfactory'],

            'Rude Staff': ['rude', 'unprofessional', 'disrespectful', 'impolite', 'arrogant', 'dismissive',
                           'condescending',
                           'unhelpful', 'attitude', 'unfriendly', 'cold', 'hostile'],

            'High Fees': ['expensive', 'costly', 'high fees', 'overpriced', 'excessive charges', 'hidden fees',
                          'rip-off',
                          'unreasonable', 'outrageous', 'money grab'],

            'Security Issues': ['unsafe', 'insecure', 'risky', 'vulnerable', 'breach', 'fraud', 'scam',
                                'identity theft',
                                'compromised', 'suspicious'],

            'Account Problems': ['account frozen', 'locked out', 'blocked', 'suspended', 'unauthorized charges',
                                 'billing errors', 'statement issues', 'balance problems'],

            'ATM Issues': ['ATM broken', 'out of cash', 'card stuck', 'machine error', 'ATM down',
                           'cash dispensing error',
                           'receipt issues', 'ATM malfunction'],

            'Loan/Credit Issues': ['loan denied', 'credit rejected', 'high interest', 'unfair terms',
                                   'predatory lending',
                                   'misleading', 'bait and switch', 'loan problems'],

            'Facility Problems': ['dirty', 'outdated', 'cramped', 'uncomfortable', 'noisy', 'poor lighting',
                                  'broken furniture',
                                  'no air conditioning', 'smelly', 'run down'],

            'Process Issues': ['complicated', 'bureaucratic', 'too many forms', 'lengthy process', 'red tape',
                               'paperwork',
                               'requirements', 'documentation', 'hassle', 'nightmare'],

            'Accessibility Issues': ['not accessible', 'no wheelchair access', 'no parking', 'hard to reach',
                                     'inconvenient',
                                     'remote location', 'transportation issues']
        }

        keyword_dict = positive_keywords if sentiment_type == 'Positive' else (
            neutral_keywords if sentiment_type == 'Neutral' else negative_keywords
        )

        tag_counts = {}
        for tag, keywords in keyword_dict.items():
            count = 0
            for review in sentiment_reviews:
                if any(keyword in review for keyword in keywords):
                    count += 1
            if count > 0:
                tag_counts[tag] = count

        # Return top 4 most common tags
        return sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:4]

    def generate_visualizations(self):
        """Generate comprehensive visualizations using final sentiment"""
        print("Generating visualizations...")

        # Set up the plotting style
        plt.style.use('default')
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        fig.suptitle('BPI Bank Sentiment Analysis Dashboard', fontsize=16, fontweight='bold')

        # 1. Final sentiment distribution
        sentiment_counts = self.df['final_sentiment'].value_counts()
        colors = ['#00BFA6', '#FEA000', '#CF3D58']  # Green, Orange, Red
        sentiment_colors = []
        for sentiment in sentiment_counts.index:
            if sentiment == 'Positive':
                sentiment_colors.append('#00BFA6')
            elif sentiment == 'Neutral':
                sentiment_colors.append('#FEA000')
            else:
                sentiment_colors.append('#CF3D58')

        axes[0, 0].pie(sentiment_counts.values, labels=sentiment_counts.index,
                       autopct='%1.1f%%', startangle=90, colors=sentiment_colors)
        axes[0, 0].set_title('Final Sentiment Distribution')

        # 2. Rating distribution
        if 'star_rating' in self.df.columns:
            rating_counts = self.df['star_rating'].value_counts().sort_index()
            bar_colors = ['#CF3D58', '#FF6B6B', '#FEA000', '#66BB6A', '#00BFA6']
            axes[0, 1].bar(rating_counts.index, rating_counts.values,
                           color=bar_colors[:len(rating_counts)])
            axes[0, 1].set_title('Star Rating Distribution')
            axes[0, 1].set_xlabel('Star Rating')
            axes[0, 1].set_ylabel('Count')
            axes[0, 1].set_xticks(rating_counts.index)

        # 3. Top branches by review count
        top_branches = self.df['branch_name'].value_counts().head(10)
        axes[0, 2].barh(range(len(top_branches)), top_branches.values, color='#00BFA6')
        axes[0, 2].set_yticks(range(len(top_branches)))
        axes[0, 2].set_yticklabels([branch[:20] + '...' if len(branch) > 20 else branch
                                    for branch in top_branches.index])
        axes[0, 2].set_title('Top 10 Branches by Review Count')
        axes[0, 2].set_xlabel('Number of Reviews')

        # 4. Sentiment comparison: Text vs Rating vs Final
        comparison_data = {
            'Text-based': self.df['text_based_sentiment'].value_counts(),
            'Rating-based': self.df['rating_based_sentiment'].value_counts(),
            'Final': self.df['final_sentiment'].value_counts()
        }

        sentiments = ['Positive', 'Neutral', 'Negative']
        x = np.arange(len(sentiments))
        width = 0.25

        for i, (method, counts) in enumerate(comparison_data.items()):
            values = [counts.get(s, 0) for s in sentiments]
            color = ['#4CAF50', '#FF9800', '#F44336'][i]
            axes[1, 0].bar(x + i * width, values, width, label=method, color=color, alpha=0.8)

        axes[1, 0].set_title('Sentiment Analysis Method Comparison')
        axes[1, 0].set_xlabel('Sentiment')
        axes[1, 0].set_ylabel('Count')
        axes[1, 0].set_xticks(x + width)
        axes[1, 0].set_xticklabels(sentiments)
        axes[1, 0].legend()

        # 5. Branch sentiment comparison (top 10 branches) using final sentiment
        top_10_branches = self.df['branch_name'].value_counts().head(10).index
        branch_sentiment_data = []

        for branch in top_10_branches:
            branch_data = self.df[self.df['branch_name'] == branch]
            pos_count = (branch_data['final_sentiment'] == 'Positive').sum()
            neu_count = (branch_data['final_sentiment'] == 'Neutral').sum()
            neg_count = (branch_data['final_sentiment'] == 'Negative').sum()
            branch_sentiment_data.append([pos_count, neu_count, neg_count])

        branch_sentiment_array = np.array(branch_sentiment_data)

        # Create stacked bars
        p1 = axes[1, 1].bar(range(len(top_10_branches)), branch_sentiment_array[:, 0],
                            color='#00BFA6', label='Positive')
        p2 = axes[1, 1].bar(range(len(top_10_branches)), branch_sentiment_array[:, 1],
                            bottom=branch_sentiment_array[:, 0], color='#FEA000', label='Neutral')
        p3 = axes[1, 1].bar(range(len(top_10_branches)), branch_sentiment_array[:, 2],
                            bottom=branch_sentiment_array[:, 0] + branch_sentiment_array[:, 1],
                            color='#CF3D58', label='Negative')

        axes[1, 1].set_title('Final Sentiment by Top 10 Branches')
        axes[1, 1].set_xlabel('Branch')
        axes[1, 1].set_ylabel('Count')
        axes[1, 1].set_xticks(range(len(top_10_branches)))
        axes[1, 1].set_xticklabels([branch[:15] + '...' if len(branch) > 15 else branch
                                    for branch in top_10_branches], rotation=45, ha='right')
        axes[1, 1].legend()

        # 6. Aspect-based sentiment using final sentiment
        aspect_sentiments = self.aspect_based_sentiment_analysis()
        aspects_with_mentions = {k: v for k, v in aspect_sentiments.items() if v['total_mentions'] > 0}

        if aspects_with_mentions:
            aspect_names = list(aspects_with_mentions.keys())[:8]
            positive_counts = [aspects_with_mentions[asp]['sentiment_distribution'].get('Positive', 0)
                               for asp in aspect_names]
            negative_counts = [aspects_with_mentions[asp]['sentiment_distribution'].get('Negative', 0)
                               for asp in aspect_names]

            x = np.arange(len(aspect_names))
            width = 0.35

            axes[1, 2].bar(x - width / 2, positive_counts, width, label='Positive',
                           color='#00BFA6', alpha=0.8)
            axes[1, 2].bar(x + width / 2, negative_counts, width, label='Negative',
                           color='#CF3D58', alpha=0.8)
            axes[1, 2].set_title('Aspect-based Sentiment')
            axes[1, 2].set_xlabel('Aspects')
            axes[1, 2].set_ylabel('Count')
            axes[1, 2].set_xticks(x)
            axes[1, 2].set_xticklabels(aspect_names, rotation=45, ha='right')
            axes[1, 2].legend()
        else:
            # Show analysis method breakdown
            text_based = len(self.df[self.df['review_text'] != 'No review text provided'])
            rating_based = len(self.df[self.df['review_text'] == 'No review text provided'])

            labels = ['Text-based\nAnalysis', 'Rating-based\nAnalysis']
            sizes = [text_based, rating_based]
            colors = ['#00BFA6', '#FEA000']

            axes[1, 2].pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90)
            axes[1, 2].set_title('Analysis Method Distribution')

        plt.tight_layout()
        plt.savefig('bpi_sentiment_analysis_dashboard.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("Dashboard visualization saved as: bpi_sentiment_analysis_dashboard.png")

    def aspect_based_sentiment_analysis(self):
        """Perform aspect-based sentiment analysis using FINAL sentiment"""
        print("Performing aspect-based sentiment analysis...")

        aspect_sentiments = {}

        for aspect in self.aspects:
            # Find reviews mentioning this aspect (only in reviews with text)
            text_reviews = self.df[self.df['review_text'] != 'No review text provided']
            aspect_mask = text_reviews['cleaned_text'].str.contains(aspect, case=False, na=False)
            aspect_reviews = text_reviews[aspect_mask]

            if len(aspect_reviews) > 0:
                # Use FINAL sentiment instead of BERT sentiment
                aspect_sentiments[aspect] = {
                    'total_mentions': int(len(aspect_reviews)),
                    'sentiment_distribution': aspect_reviews['final_sentiment'].value_counts().to_dict(),
                    'sentiment_percentages': (
                            aspect_reviews['final_sentiment'].value_counts(normalize=True) * 100).round(2).to_dict(),
                    'average_rating': float(
                        aspect_reviews['star_rating'].mean()) if 'star_rating' in aspect_reviews.columns else 0,
                    'dominant_sentiment': str(
                        aspect_reviews['final_sentiment'].mode().iloc[0] if len(aspect_reviews) > 0 else 'Neutral')
                }
                # Convert all values to JSON serializable types
                for key, value in aspect_sentiments[aspect]['sentiment_distribution'].items():
                    aspect_sentiments[aspect]['sentiment_distribution'][key] = int(value)
            else:
                aspect_sentiments[aspect] = {
                    'total_mentions': 0,
                    'sentiment_distribution': {},
                    'sentiment_percentages': {},
                    'average_rating': 0,
                    'dominant_sentiment': 'Neutral'
                }

        return aspect_sentiments

    def save_results_as_js(self, data, filename='ReportsData_Generated_.js'):
        """Save results as JavaScript file compatible with your existing structure"""
        js_content = f"""// Generated BPI Sentiment Analysis Data - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

// Available branch cities for filtering
export const cities = {json.dumps(data['cities'], indent=2)};

// Available branch names for filtering
export const branchNames = {json.dumps(data['branchNames'], indent=2)};

// CSAT sentiment labels
export const sentimentLabels = ["Positive", "Neutral", "Negative"];

// Helper function to get sentiment color
export const getSentimentColor = (score) => {{
  if (score >= 70) return "#00BFA6"; // Green for positive (70-95)
  if (score >= 45) return "#FEA000"; // Orange for neutral (45-69)
  return "#CF3D58"; // Red for negative (20-44)
}};

// Helper function to get sentiment category
export const getSentimentCategory = (score) => {{
  if (score >= 70) return "Positive";
  if (score >= 45) return "Neutral";
  return "Negative";
}};

// OVERALL SENTIMENT ANALYSIS RESULTS 
export const overallSentiment = "{data['overallSentiment']}";

// BRANCH SENTIMENT ANALYSIS RESULTS 
export const branchSentiments = {json.dumps(data['branchSentiments'], indent=2)};

// Customer reviews data with CORRECTED sentiment analysis
export const customerReviews = {json.dumps(data['customerReviews'], indent=2)};

// CSAT summary data 
export const csatSummary = {json.dumps(data['csatSummary'], indent=2)};

// Monthly trend data
export const monthlyTrends = {json.dumps(data['monthlyTrends'], indent=2)};

// City performance data
export const cityPerformance = {json.dumps(data['cityPerformance'], indent=2)};
"""

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(js_content)

        print(f"JavaScript data file saved as: {filename}")

    def save_csv_results(self, data, filename='bpi_sentiment_dashboard_data.csv'):
        """Save detailed CSV results for dashboard visualization"""

        # Create customer reviews CSV with CORRECTED data
        csv_data = []
        for review in data['customerReviews']:
            csv_data.append({
                'record_type': 'review',
                'id': review['id'],
                'branch_name': review['branchName'],
                'city': review['city'],
                'customer_id': review['customerId'],
                'date': review['date'],
                'rating': review['rating'],  # This is now correctly based on final sentiment
                'comment': review['comment'],
                'tags': ', '.join(review['tags']),
                'sentiment': 'Positive' if review['rating'] >= 70 else 'Neutral' if review[
                                                                                        'rating'] >= 45 else 'Negative',
                'overall_sentiment': data['overallSentiment'],
                'branch_sentiment': data['branchSentiments'].get(review['branchName'], 'Neutral')
            })

        # Add summary data
        csv_data.append({
            'record_type': 'overall_summary',
            'overall_score': data['csatSummary']['overallScore'],
            'total_reviews': data['csatSummary']['totalReviews'],
            'positive_feedback': data['csatSummary']['positiveFeedback'],
            'neutral_feedback': data['csatSummary']['neutralFeedback'],
            'negative_feedback': data['csatSummary']['negativeFeedback'],
            'overall_sentiment': data['overallSentiment'],
            'top_performer_branch': data['csatSummary']['topPerformer']['branchName'],
            'top_performer_score': data['csatSummary']['topPerformer']['score'],
            'needs_improvement_branch': data['csatSummary']['needsImprovement']['branchName'],
            'needs_improvement_score': data['csatSummary']['needsImprovement']['score']
        })

        # Save dashboard CSV
        csv_df = pd.DataFrame(csv_data)
        csv_df.to_csv(filename, index=False)
        print(f"CSV dashboard data saved as: {filename}")

        # Save the original analysis results
        analysis_df = self.df[
            ['branch_name', 'review_text', 'star_rating', 'text_based_sentiment', 'rating_based_sentiment',
             'final_sentiment']].copy()

        # Add computed fields
        analysis_df['branch_sentiment'] = analysis_df['branch_name'].map(data['branchSentiments'])
        analysis_df['overall_sentiment'] = data['overallSentiment']
        analysis_df['city'] = analysis_df['branch_name'].apply(self.extract_city_from_branch)

        # Add CORRECTED sentiment scores based on FINAL sentiment
        analysis_df['sentiment_score'] = analysis_df['final_sentiment'].apply(self.sentiment_to_score_range)

        original_filename = 'bpi_original_analysis_results.csv'
        analysis_df.to_csv(original_filename, index=False)
        print(f"Original analysis results saved as: {original_filename}")

        return csv_df

    def print_summary(self):
        """Printanalysis summary"""
        print("\n" + "=" * 60)
        print("BPI BANK SENTIMENT ANALYSIS SUMMARY")
        print("=" * 60)

        print(f"\nOVERALL SENTIMENT (Weighted Average): {self.overall_sentiment}")

        print(f"\nBRANCH SENTIMENTS (Weighted Average):")
        for branch, sentiment in self.branch_sentiments.items():
            print(f"   {branch}: {sentiment}")

        # Show all three sentiment analysis methods
        print(f"\nSENTIMENT ANALYSIS COMPARISON:")

        text_counts = self.df['text_based_sentiment'].value_counts()
        rating_counts = self.df['rating_based_sentiment'].value_counts()
        final_counts = self.df['final_sentiment'].value_counts()
        total = len(self.df)

        print(f"Text-based Analysis:")
        for sentiment in ['Positive', 'Neutral', 'Negative']:
            count = text_counts.get(sentiment, 0)
            percentage = (count / total * 100) if total > 0 else 0
            print(f"   {sentiment}: {count} reviews ({percentage:.1f}%)")

        print(f"\nRating-based Analysis:")
        for sentiment in ['Positive', 'Neutral', 'Negative']:
            count = rating_counts.get(sentiment, 0)
            percentage = (count / total * 100) if total > 0 else 0
            print(f"   {sentiment}: {count} reviews ({percentage:.1f}%)")

        print(f"\nFINAL Analysis ( - Used for scoring):")
        for sentiment in ['Positive', 'Neutral', 'Negative']:
            count = final_counts.get(sentiment, 0)
            percentage = (count / total * 100) if total > 0 else 0
            print(f"   {sentiment}: {count} reviews ({percentage:.1f}%)")

        print(f"\nTOTAL REVIEWS ANALYZED: {total}")
        print(f"UNIQUE BRANCHES: {len(self.branch_sentiments)}")

        # Show scoring ranges
        print(f"\nSCORING RANGES (Based on FINAL sentiment):")
        print(f"   Positive: 70-95")
        print(f"   Neutral: 45-69")
        print(f"   Negative: 20-44")

        # Show conflict resolution stats
        text_vs_rating_conflicts = len(self.df[
                                           (self.df['text_based_sentiment'] != self.df['rating_based_sentiment']) &
                                           (self.df['review_text'] != 'No review text provided')
                                           ])
        print(f"\nCONFLICT RESOLUTION:")
        print(f"   Text vs Rating conflicts resolved: {text_vs_rating_conflicts}")
        print(f"   Priority: Star rating > Text sentiment (with intelligent compromise)")


def main():
    """Main execution function with logic"""

    # Get CSV file path
    csv_file = input("\nEnter the path to your CSV file (or press Enter for 'bpi_reviews.csv'): ").strip()
    if not csv_file:
        csv_file = 'bpi_reviews.csv'

    try:
        # Initialize analyzer
        analyzer = BPISentimentAnalyzer(csv_file)

        # Load data
        analyzer.load_data()

        # Setup BERT model
        analyzer.setup_bert_model()

        # Perform sentiment analysis
        analyzer.analyze_sentiments()

        # Generate JavaScript-compatible data
        js_data = analyzer.generate_js_compatible_data()

        # Generate visualizations
        analyzer.generate_visualizations()

        # Save results
        analyzer.save_results_as_js(js_data)
        csv_df = analyzer.save_csv_results(js_data)

        # Print summary
        analyzer.print_summary()

        print("\n" + "=" * 60)
        print("ANALYSIS COMPLETE!")
        print("=" * 60)
        print("FILES GENERATED:")
        print("   - bpi_sentiment_analysis_dashboard.png")
        print("   - ReportsData_Generated.js")
        print("   - bpi_sentiment_dashboard_data.csv")
        print("   - bpi_original_analysis_results.csv")

    except FileNotFoundError:
        print(f"Error: Could not find the file '{csv_file}'")
        print("Please ensure the file exists and has columns: branch_name, review_text, star_rating")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()