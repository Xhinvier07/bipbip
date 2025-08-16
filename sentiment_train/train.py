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
        self.aspects = ['service', 'staff', 'wait time', 'facility', 'atm', 'fees', 'process', 'system', 'queue',
                        'parking']

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

    def predict_sentiment(self, text):
        """Predict sentiment for a single text"""
        # Handle empty or placeholder text
        if not text or len(text.strip()) == 0 or text == 'No review text provided':
            return 'Neutral'  # Default to neutral for empty reviews

        try:
            result = self.sentiment_pipeline(text[:512])
            score = result[0]['score']
            label = result[0]['label']

            # Map to our format (Positive/Neutral/Negative)
            if label in ['POSITIVE', '5 stars', '4 stars'] or score > 0.6:
                return 'Positive'
            elif label in ['NEGATIVE', '1 star', '2 stars'] or score < 0.4:
                return 'Negative'
            else:
                return 'Neutral'
        except:
            return 'Neutral'

    def rating_to_sentiment(self, rating):
        """Convert star rating to sentiment"""
        if rating >= 4:
            return 'Positive'
        elif rating == 3:
            return 'Neutral'
        else:
            return 'Negative'

    def analyze_sentiments(self):
        """Perform comprehensive sentiment analysis"""
        print("Performing sentiment analysis...")

        # Preprocess texts
        self.df['cleaned_text'] = self.df['review_text'].apply(self.preprocess_text)

        # For reviews without text, use star rating for sentiment
        print("Analyzing sentiments using BERT and star ratings...")
        sentiments = []

        for idx, row in self.df.iterrows():
            if row['review_text'] == 'No review text provided':
                # Use star rating for sentiment when no review text
                if pd.notna(row['star_rating']):
                    sentiment = self.rating_to_sentiment(row['star_rating'])
                else:
                    sentiment = 'Neutral'
            else:
                # Use BERT for sentiment analysis when review text exists
                sentiment = self.predict_sentiment(row['cleaned_text'])

            sentiments.append(sentiment)

        self.df['bert_sentiment'] = sentiments

        # Also create rating-based sentiment for comparison
        self.df['rating_sentiment'] = self.df['star_rating'].apply(
            lambda x: self.rating_to_sentiment(x) if pd.notna(x) else 'Neutral'
        )

        # Calculate overall sentiment (most common)
        overall_sentiment_counts = self.df['bert_sentiment'].value_counts()
        self.overall_sentiment = overall_sentiment_counts.index[0]

        # Calculate branch sentiments
        for branch in self.df['branch_name'].unique():
            branch_data = self.df[self.df['branch_name'] == branch]
            branch_sentiment_counts = branch_data['bert_sentiment'].value_counts()
            if len(branch_sentiment_counts) > 0:
                self.branch_sentiments[branch] = branch_sentiment_counts.index[0]
            else:
                self.branch_sentiments[branch] = 'Neutral'

        print(f"Overall Sentiment: {self.overall_sentiment}")
        print(f"Branch Sentiments calculated for {len(self.branch_sentiments)} branches")

        # Show breakdown of how sentiments were determined
        text_based = len(self.df[self.df['review_text'] != 'No review text provided'])
        rating_based = len(self.df[self.df['review_text'] == 'No review text provided'])
        print(f"Sentiment analysis breakdown:")
        print(f"  - Text-based analysis: {text_based} reviews")
        print(f"  - Rating-based analysis: {rating_based} reviews")

    def extract_common_tags(self, reviews, sentiment_type):
        """Extract common tags/themes from reviews based on sentiment"""
        sentiment_reviews = reviews[reviews['bert_sentiment'] == sentiment_type]['cleaned_text']

        # Define keyword categories
        positive_keywords = {
            'Fast Service': ['fast', 'quick', 'speedy', 'efficient', 'rapid'],
            'Professional Staff': ['professional', 'courteous', 'polite', 'respectful'],
            'Clean': ['clean', 'neat', 'organized', 'tidy'],
            'Helpful Staff': ['helpful', 'accommodating', 'friendly', 'kind'],
            'Modern Facilities': ['modern', 'updated', 'new', 'facilities']
        }

        neutral_keywords = {
            'Average Wait Time': ['average', 'okay', 'normal', 'reasonable'],
            'Crowded': ['crowded', 'busy', 'full', 'packed'],
            'Peak Hour Issues': ['lunch', 'peak', 'rush hour', 'busy time']
        }

        negative_keywords = {
            'Long Wait Time': ['long', 'slow', 'wait', 'delay', 'hours'],
            'System Issues': ['system', 'down', 'maintenance', 'technical'],
            'Poor Communication': ['communication', 'information', 'notice', 'announcement'],
            'Understaffed': ['staff', 'teller', 'understaffed', 'more people'],
            'Poor Service': ['poor', 'bad', 'terrible', 'awful', 'disappointing']
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

    def generate_js_compatible_data(self):
        """Generate data structure compatible with the JavaScript file"""
        print("Generating JavaScript-compatible data...")

        # Get unique cities and branches
        cities = sorted(self.df['branch_name'].str.extract(r'([A-Za-z\s]+)')[0].dropna().unique())
        branch_names = sorted(self.df['branch_name'].unique())

        # Calculate CSAT scores (convert sentiment to scores)
        def sentiment_to_score(sentiment):
            return {'Positive': 85, 'Neutral': 65, 'Negative': 45}[sentiment]

        # Overall CSAT summary
        sentiment_counts = self.df['bert_sentiment'].value_counts()
        total_reviews = int(len(self.df))  # Convert to int

        overall_score = int((
                                    sentiment_counts.get('Positive', 0) * 85 +
                                    sentiment_counts.get('Neutral', 0) * 65 +
                                    sentiment_counts.get('Negative', 0) * 45
                            ) // total_reviews if total_reviews > 0 else 65)

        # Find top and bottom performers
        branch_scores = {}
        for branch in branch_names:
            branch_data = self.df[self.df['branch_name'] == branch]
            if len(branch_data) > 0:
                branch_sentiment_counts = branch_data['bert_sentiment'].value_counts()
                branch_score = int((
                                           branch_sentiment_counts.get('Positive', 0) * 85 +
                                           branch_sentiment_counts.get('Neutral', 0) * 65 +
                                           branch_sentiment_counts.get('Negative', 0) * 45
                                   ) // len(branch_data))
                branch_scores[branch] = branch_score

        top_performer = max(branch_scores.items(), key=lambda x: x[1]) if branch_scores else ("Unknown", 65)
        bottom_performer = min(branch_scores.items(), key=lambda x: x[1]) if branch_scores else ("Unknown", 65)

        # Extract common tags
        positive_tags = [tag for tag, count in self.extract_common_tags(self.df, 'Positive')]
        neutral_tags = [tag for tag, count in self.extract_common_tags(self.df, 'Neutral')]
        negative_tags = [tag for tag, count in self.extract_common_tags(self.df, 'Negative')]

        # Create customer reviews data
        customer_reviews = []
        for idx, row in self.df.iterrows():
            # Extract tags based on sentiment and keywords
            tags = []
            if row['bert_sentiment'] == 'Positive':
                tags = ['Fast Service', 'Professional Staff'] if 'fast' in row['cleaned_text'] or 'professional' in row[
                    'cleaned_text'] else ['Good Experience']
            elif row['bert_sentiment'] == 'Negative':
                tags = ['Long Wait Time', 'Poor Service'] if 'long' in row['cleaned_text'] or 'poor' in row[
                    'cleaned_text'] else ['Issues']
            else:
                tags = ['Average Experience']

            customer_reviews.append({
                "id": int(idx + 1),
                "branchName": str(row['branch_name']),
                "city": str(row['branch_name'].split()[0] if ' ' in row['branch_name'] else "Metro Manila"),
                "customerId": f"#N{str(idx + 1).zfill(3)}",
                "date": (datetime.now() - timedelta(days=int(np.random.randint(1, 30)))).strftime("%Y-%m-%d"),
                "rating": int(sentiment_to_score(row['bert_sentiment'])),
                "comment": str(
                    row['review_text'][:200] + "..." if len(row['review_text']) > 200 else row['review_text']),
                "tags": tags
            })

        # CSAT Summary
        csat_summary = {
            "overallScore": int(overall_score),
            "totalReviews": int(total_reviews),
            "positiveFeedback": int(sentiment_counts.get('Positive', 0)),
            "neutralFeedback": int(sentiment_counts.get('Neutral', 0)),
            "negativeFeedback": int(sentiment_counts.get('Negative', 0)),
            "topPerformer": {
                "branchName": str(top_performer[0]),
                "city": str(top_performer[0].split()[0] if ' ' in top_performer[0] else "Metro Manila"),
                "score": int(top_performer[1])
            },
            "needsImprovement": {
                "branchName": str(bottom_performer[0]),
                "city": str(bottom_performer[0].split()[0] if ' ' in bottom_performer[0] else "Metro Manila"),
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
            city = branch.split()[0] if ' ' in branch else "Metro Manila"
            if city not in city_scores:
                city_scores[city] = []
            city_scores[city].append(score)

        for city, scores in city_scores.items():
            avg_score = int(sum(scores) // len(scores))
            city_performance.append({"city": str(city), "score": int(avg_score)})

        # Monthly trends (simulate based on data)
        monthly_trends = []
        base_score = overall_score
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for i, month in enumerate(months):
            variation = int(np.random.randint(-5, 6))
            score = int(max(30, min(95, base_score + variation)))
            monthly_trends.append({"month": str(month), "score": int(score)})

        return {
            "cities": [str(city) for city in cities[:7]] if len(cities) > 7 else [str(city) for city in cities],
            "branchNames": [str(branch) for branch in branch_names],
            "customerReviews": customer_reviews,
            "csatSummary": csat_summary,
            "monthlyTrends": monthly_trends,
            "cityPerformance": city_performance,
            "overallSentiment": str(self.overall_sentiment),
            "branchSentiments": {str(k): str(v) for k, v in self.branch_sentiments.items()}
        }

    def generate_visualizations(self):
        """Generate comprehensive visualizations"""
        print("Generating visualizations...")

        # Set up the plotting style
        plt.style.use('default')
        fig, axes = plt.subplots(2, 3, figsize=(18, 12))
        fig.suptitle('BPI Bank Sentiment Analysis Dashboard', fontsize=16, fontweight='bold')

        # 1. Overall sentiment distribution
        sentiment_counts = self.df['bert_sentiment'].value_counts()
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
        axes[0, 0].set_title('Overall Sentiment Distribution')

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

        # 4. Sentiment by rating heatmap
        if 'star_rating' in self.df.columns:
            crosstab = pd.crosstab(self.df['star_rating'], self.df['bert_sentiment'])
            im = axes[1, 0].imshow(crosstab.values, cmap='RdYlGn', aspect='auto')
            axes[1, 0].set_xticks(range(len(crosstab.columns)))
            axes[1, 0].set_xticklabels(crosstab.columns)
            axes[1, 0].set_yticks(range(len(crosstab.index)))
            axes[1, 0].set_yticklabels(crosstab.index)
            axes[1, 0].set_title('Sentiment vs Rating Heatmap')

            # Add text annotations
            for i in range(len(crosstab.index)):
                for j in range(len(crosstab.columns)):
                    axes[1, 0].text(j, i, crosstab.iloc[i, j],
                                    ha="center", va="center", color="black", fontweight='bold')

        # 5. Branch sentiment comparison (top 10 branches)
        top_10_branches = self.df['branch_name'].value_counts().head(10).index
        branch_sentiment_data = []

        for branch in top_10_branches:
            branch_data = self.df[self.df['branch_name'] == branch]
            pos_count = (branch_data['bert_sentiment'] == 'Positive').sum()
            neu_count = (branch_data['bert_sentiment'] == 'Neutral').sum()
            neg_count = (branch_data['bert_sentiment'] == 'Negative').sum()
            branch_sentiment_data.append([pos_count, neu_count, neg_count])

        branch_sentiment_array = np.array(branch_sentiment_data)
        bottom = np.zeros(len(top_10_branches))

        # Create stacked bars
        p1 = axes[1, 1].bar(range(len(top_10_branches)), branch_sentiment_array[:, 0],
                            color='#00BFA6', label='Positive')
        p2 = axes[1, 1].bar(range(len(top_10_branches)), branch_sentiment_array[:, 1],
                            bottom=branch_sentiment_array[:, 0], color='#FEA000', label='Neutral')
        p3 = axes[1, 1].bar(range(len(top_10_branches)), branch_sentiment_array[:, 2],
                            bottom=branch_sentiment_array[:, 0] + branch_sentiment_array[:, 1],
                            color='#CF3D58', label='Negative')

        axes[1, 1].set_title('Sentiment Distribution by Top 10 Branches')
        axes[1, 1].set_xlabel('Branch')
        axes[1, 1].set_ylabel('Count')
        axes[1, 1].set_xticks(range(len(top_10_branches)))
        axes[1, 1].set_xticklabels([branch[:15] + '...' if len(branch) > 15 else branch
                                    for branch in top_10_branches], rotation=45, ha='right')
        axes[1, 1].legend()

        # 6. Aspect-based sentiment (if aspects are found)
        aspect_sentiments = self.aspect_based_sentiment_analysis()
        aspects_with_mentions = {k: v for k, v in aspect_sentiments.items() if v['total_mentions'] > 0}

        if aspects_with_mentions:
            aspect_names = list(aspects_with_mentions.keys())[:8]  # Limit to 8 aspects
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
            axes[1, 2].set_title('Aspect-based Sentiment Analysis')
            axes[1, 2].set_xlabel('Aspects')
            axes[1, 2].set_ylabel('Count')
            axes[1, 2].set_xticks(x)
            axes[1, 2].set_xticklabels(aspect_names, rotation=45, ha='right')
            axes[1, 2].legend()
        else:
            # If no aspects found, show text analysis vs rating analysis breakdown
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
        """Perform aspect-based sentiment analysis"""
        print("Performing aspect-based sentiment analysis...")

        aspect_sentiments = {}

        for aspect in self.aspects:
            # Find reviews mentioning this aspect (only in reviews with text)
            text_reviews = self.df[self.df['review_text'] != 'No review text provided']
            aspect_mask = text_reviews['cleaned_text'].str.contains(aspect, case=False, na=False)
            aspect_reviews = text_reviews[aspect_mask]

            if len(aspect_reviews) > 0:
                aspect_sentiments[aspect] = {
                    'total_mentions': int(len(aspect_reviews)),
                    'sentiment_distribution': aspect_reviews['bert_sentiment'].value_counts().to_dict(),
                    'sentiment_percentages': (
                                aspect_reviews['bert_sentiment'].value_counts(normalize=True) * 100).round(2).to_dict(),
                    'average_rating': float(
                        aspect_reviews['star_rating'].mean()) if 'star_rating' in aspect_reviews.columns else 0,
                    'dominant_sentiment': str(
                        aspect_reviews['bert_sentiment'].mode().iloc[0] if len(aspect_reviews) > 0 else 'Neutral')
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

    def save_results_as_js(self, data, filename='ReportsData_Generated.js'):
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
  if (score >= 80) return "#00BFA6"; // Green for positive
  if (score >= 60) return "#FEA000"; // Orange for neutral
  return "#CF3D58"; // Red for negative
}};

// Helper function to get sentiment category
export const getSentimentCategory = (score) => {{
  if (score >= 80) return "Positive";
  if (score >= 60) return "Neutral";
  return "Negative";
}};

// OVERALL SENTIMENT ANALYSIS RESULTS
export const overallSentiment = "{data['overallSentiment']}";

// BRANCH SENTIMENT ANALYSIS RESULTS
export const branchSentiments = {json.dumps(data['branchSentiments'], indent=2)};

// Customer reviews data with sentiment analysis
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

        # Create a comprehensive CSV with all necessary data
        csv_data = []

        # Add individual review data
        for review in data['customerReviews']:
            csv_data.append({
                'record_type': 'review',
                'id': review['id'],
                'branch_name': review['branchName'],
                'city': review['city'],
                'customer_id': review['customerId'],
                'date': review['date'],
                'rating': review['rating'],
                'comment': review['comment'],
                'tags': ', '.join(review['tags']),
                'sentiment': 'Positive' if review['rating'] >= 80 else 'Neutral' if review[
                                                                                        'rating'] >= 60 else 'Negative',
                'overall_sentiment': data['overallSentiment'],
                'branch_sentiment': data['branchSentiments'].get(review['branchName'], 'Neutral')
            })

        # Add overall summary data
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

        # Add branch performance data
        for branch, sentiment in data['branchSentiments'].items():
            csv_data.append({
                'record_type': 'branch_performance',
                'branch_name': branch,
                'branch_sentiment': sentiment,
                'overall_sentiment': data['overallSentiment']
            })

        # Add city performance data
        for city_data in data['cityPerformance']:
            csv_data.append({
                'record_type': 'city_performance',
                'city': city_data['city'],
                'city_score': city_data['score'],
                'overall_sentiment': data['overallSentiment']
            })

        # Add monthly trends data
        for trend in data['monthlyTrends']:
            csv_data.append({
                'record_type': 'monthly_trend',
                'month': trend['month'],
                'monthly_score': trend['score'],
                'overall_sentiment': data['overallSentiment']
            })

        # Convert to DataFrame and save
        csv_df = pd.DataFrame(csv_data)
        csv_df.to_csv(filename, index=False)
        print(f"CSV dashboard data saved as: {filename}")

        # Also save the original analysis results
        analysis_df = self.df.copy()
        analysis_df['bert_sentiment_analysis'] = analysis_df['bert_sentiment']
        analysis_df['rating_based_sentiment'] = analysis_df['rating_sentiment']
        analysis_df['branch_overall_sentiment'] = analysis_df['branch_name'].map(data['branchSentiments'])
        analysis_df['dataset_overall_sentiment'] = data['overallSentiment']

        original_filename = 'bpi_original_analysis_results.csv'
        analysis_df.to_csv(original_filename, index=False)
        print(f"Original analysis results saved as: {original_filename}")

        return csv_df

    def print_summary(self):
        """Print analysis summary"""
        print("\n" + "=" * 60)
        print("BPI BANK SENTIMENT ANALYSIS SUMMARY")
        print("=" * 60)

        print(f"\n🏢 OVERALL SENTIMENT (All Branches): {self.overall_sentiment}")

        print(f"\n🏪 BRANCH SENTIMENTS:")
        for branch, sentiment in self.branch_sentiments.items():
            print(f"   {branch}: {sentiment}")

        sentiment_counts = self.df['bert_sentiment'].value_counts()
        total = len(self.df)
        print(f"\n📊 SENTIMENT DISTRIBUTION:")
        for sentiment in ['Positive', 'Neutral', 'Negative']:
            count = sentiment_counts.get(sentiment, 0)
            percentage = (count / total * 100) if total > 0 else 0
            print(f"   {sentiment}: {count} reviews ({percentage:.1f}%)")

        print(f"\n📈 TOTAL REVIEWS ANALYZED: {total}")
        print(f"📍 UNIQUE BRANCHES: {len(self.branch_sentiments)}")


def main():
    """Main execution function"""
    print("BPI Bank Sentiment Analysis with BERT")
    print("=" * 40)

    # Get CSV file path
    csv_file = input("Enter the path to your CSV file (or press Enter for 'bpi_reviews.csv'): ").strip()
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

        print("\n✅ Analysis Complete!")
        print("📁 Files Generated:")
        print("   - bpi_sentiment_analysis_dashboard.png (Visualization Dashboard)")
        print("   - ReportsData_Generated.js (JavaScript data file)")
        print("   - bpi_sentiment_dashboard_data.csv (Dashboard CSV data)")
        print("   - bpi_original_analysis_results.csv (Original analysis results)")
        print("\n💡 You can now use these files in your React application!")
        print("📊 CSV Structure:")
        print("   - review: Individual review data with sentiments")
        print("   - overall_summary: Overall statistics and performance")
        print("   - branch_performance: Branch-specific sentiment analysis")
        print("   - city_performance: City-wise performance data")
        print("   - monthly_trend: Monthly performance trends")
        print("\n🎨 Dashboard includes 6 comprehensive charts:")
        print("   1. Overall Sentiment Pie Chart")
        print("   2. Star Rating Distribution")
        print("   3. Top 10 Branches by Review Count")
        print("   4. Sentiment vs Rating Heatmap")
        print("   5. Branch Sentiment Comparison (Stacked Bar)")
        print("   6. Aspect-based Analysis or Method Distribution")

    except FileNotFoundError:
        print(f"❌ Error: Could not find the file '{csv_file}'")
        print("Please ensure the file exists and has columns: branch_name, review_text, star_rating")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")


if __name__ == "__main__":
    main()