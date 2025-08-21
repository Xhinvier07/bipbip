#!/usr/bin/env python3
"""
Custom Sentiment Analysis Model Training Script
Trains a custom model on BPI reviews dataset with detailed metrics
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.naive_bayes import MultinomialNB, BernoulliNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score, 
    precision_score, recall_score, f1_score, roc_auc_score,
    roc_curve, precision_recall_curve
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import re
import warnings
import joblib
from datetime import datetime
import torch
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification, 
    TrainingArguments, Trainer, DataCollatorWithPadding
)
from datasets import Dataset
import evaluate

warnings.filterwarnings('ignore')

class CustomSentimentModel:
    def __init__(self, csv_path):
        """Initialize the custom sentiment model trainer"""
        self.csv_path = csv_path
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.label_encoder = LabelEncoder()
        self.models = {}
        self.results = {}
        self.best_model = None
        self.best_model_name = None
        
    def load_and_preprocess_data(self):
        """Load and preprocess the dataset"""
        print("📊 Loading and preprocessing data...")
        
        # Load data
        self.df = pd.read_csv(self.csv_path)
        print(f"Dataset shape: {self.df.shape}")
        print(f"Columns: {self.df.columns.tolist()}")
        
        # Handle missing values
        self.df['review_text'] = self.df['review_text'].fillna('No review text provided')
        
        # Create sentiment labels based on star ratings
        def create_sentiment_label(row):
            if pd.isna(row['star_rating']):
                return 'neutral'
            elif row['star_rating'] >= 4:
                return 'positive'
            elif row['star_rating'] <= 2:
                return 'negative'
            else:
                return 'neutral'
        
        self.df['sentiment'] = self.df.apply(create_sentiment_label, axis=1)
        
        # Clean text
        self.df['cleaned_text'] = self.df['review_text'].apply(self.clean_text)
        
        # Remove empty reviews
        self.df = self.df[self.df['cleaned_text'].str.len() > 0]
        
        print(f"After preprocessing: {self.df.shape}")
        print(f"Sentiment distribution:")
        print(self.df['sentiment'].value_counts())
        
        return self.df
    
    def clean_text(self, text):
        """Clean and preprocess text"""
        if pd.isna(text) or text == 'No review text provided':
            return ''
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def prepare_data(self, test_size=0.2, random_state=42):
        """Prepare data for training"""
        print("🔧 Preparing data for training...")
        
        # Encode labels
        y = self.label_encoder.fit_transform(self.df['sentiment'])
        X = self.df['cleaned_text']
        
        # Split data
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        print(f"Training set: {len(self.X_train)} samples")
        print(f"Test set: {len(self.X_test)} samples")
        print(f"Classes: {self.label_encoder.classes_}")
        
    def train_traditional_models(self):
        """Train traditional ML models"""
        print("🤖 Training traditional ML models...")
        
        # Define models to train
        models = {
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
            'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100),
            'Gradient Boosting': GradientBoostingClassifier(random_state=42),
            'SVM': SVC(random_state=42, probability=True),
            'Multinomial NB': MultinomialNB(),
            'Bernoulli NB': BernoulliNB()
        }
        
        # Vectorizers
        vectorizers = {
            'TF-IDF': TfidfVectorizer(max_features=5000, ngram_range=(1, 2)),
            'Count': CountVectorizer(max_features=5000, ngram_range=(1, 2))
        }
        
        for vec_name, vectorizer in vectorizers.items():
            print(f"\n📝 Using {vec_name} vectorizer...")
            
            # Fit vectorizer
            X_train_vec = vectorizer.fit_transform(self.X_train)
            X_test_vec = vectorizer.transform(self.X_test)
            
            for model_name, model in models.items():
                print(f"  Training {model_name}...")
                
                # Train model
                model.fit(X_train_vec, self.y_train)
                
                # Predictions
                y_pred = model.predict(X_test_vec)
                y_pred_proba = model.predict_proba(X_test_vec)
                
                # Calculate metrics
                accuracy = accuracy_score(self.y_test, y_pred)
                precision = precision_score(self.y_test, y_pred, average='weighted')
                recall = recall_score(self.y_test, y_pred, average='weighted')
                f1 = f1_score(self.y_test, y_pred, average='weighted')
                
                # Store results
                model_key = f"{vec_name}_{model_name}"
                self.models[model_key] = {
                    'model': model,
                    'vectorizer': vectorizer,
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'predictions': y_pred,
                    'probabilities': y_pred_proba
                }
                
                print(f"    Accuracy: {accuracy:.4f}, F1: {f1:.4f}")
        
        # Find best traditional model
        best_score = 0
        for model_key, results in self.models.items():
            if results['f1_score'] > best_score:
                best_score = results['f1_score']
                self.best_model_name = model_key
        
        print(f"\n🏆 Best traditional model: {self.best_model_name} (F1: {best_score:.4f})")
    
    def train_bert_model(self):
        """Train BERT-based model"""
        print("🧠 Training BERT model...")
        
        try:
            # Prepare data for BERT
            train_data = self.df.iloc[self.X_train.index]
            test_data = self.df.iloc[self.X_test.index]
            
            # Create datasets
            train_dataset = Dataset.from_pandas(train_data[['cleaned_text', 'sentiment']])
            test_dataset = Dataset.from_pandas(test_data[['cleaned_text', 'sentiment']])
            
            # Tokenizer
            tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
            
            def tokenize_function(examples):
                return tokenizer(examples["cleaned_text"], padding="max_length", truncation=True, max_length=128)
            
            train_dataset = train_dataset.map(tokenize_function, batched=True)
            test_dataset = test_dataset.map(tokenize_function, batched=True)
            
            # Model
            model = AutoModelForSequenceClassification.from_pretrained(
                "bert-base-uncased", 
                num_labels=len(self.label_encoder.classes_)
            )
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir="./bert_sentiment_model",
                learning_rate=2e-5,
                per_device_train_batch_size=16,
                per_device_eval_batch_size=16,
                num_train_epochs=3,
                weight_decay=0.01,
                evaluation_strategy="epoch",
                save_strategy="epoch",
                load_best_model_at_end=True,
                push_to_hub=False,
            )
            
            # Data collator
            data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
            
            # Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=test_dataset,
                tokenizer=tokenizer,
                data_collator=data_collator,
            )
            
            # Train model
            trainer.train()
            
            # Evaluate
            predictions = trainer.predict(test_dataset)
            y_pred_bert = np.argmax(predictions.predictions, axis=1)
            
            # Calculate metrics
            accuracy = accuracy_score(self.y_test, y_pred_bert)
            precision = precision_score(self.y_test, y_pred_bert, average='weighted')
            recall = recall_score(self.y_test, y_pred_bert, average='weighted')
            f1 = f1_score(self.y_test, y_pred_bert, average='weighted')
            
            # Store BERT results
            self.models['BERT'] = {
                'model': trainer,
                'tokenizer': tokenizer,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'predictions': y_pred_bert,
                'probabilities': predictions.predictions
            }
            
            print(f"BERT Model - Accuracy: {accuracy:.4f}, F1: {f1:.4f}")
            
            # Update best model if BERT is better
            if f1 > self.models[self.best_model_name]['f1_score']:
                self.best_model_name = 'BERT'
                print(f"🏆 BERT is now the best model! (F1: {f1:.4f})")
                
        except Exception as e:
            print(f"❌ Error training BERT model: {e}")
            print("Continuing with traditional models only...")
    
    def generate_detailed_report(self):
        """Generate detailed classification report"""
        print("\n📊 Generating detailed classification report...")
        
        # Create comprehensive results DataFrame
        results_data = []
        
        for model_name, results in self.models.items():
            results_data.append({
                'Model': model_name,
                'Accuracy': results['accuracy'],
                'Precision': results['precision'],
                'Recall': results['recall'],
                'F1 Score': results['f1_score']
            })
        
        self.results_df = pd.DataFrame(results_data)
        self.results_df = self.results_df.sort_values('F1 Score', ascending=False)
        
        print("\n" + "="*80)
        print("📈 MODEL PERFORMANCE COMPARISON")
        print("="*80)
        print(self.results_df.to_string(index=False, float_format='%.4f'))
        
        # Detailed report for best model
        best_results = self.models[self.best_model_name]
        print(f"\n🏆 DETAILED REPORT FOR BEST MODEL: {self.best_model_name}")
        print("="*60)
        
        # Classification report
        print("\n📋 Classification Report:")
        print(classification_report(
            self.y_test, 
            best_results['predictions'],
            target_names=self.label_encoder.classes_
        ))
        
        # Confusion matrix
        cm = confusion_matrix(self.y_test, best_results['predictions'])
        print(f"\n🔢 Confusion Matrix:")
        print(cm)
        
        return self.results_df
    
    def create_visualizations(self):
        """Create comprehensive visualizations"""
        print("\n📊 Creating visualizations...")
        
        # Set style
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 3, figsize=(20, 12))
        fig.suptitle('Custom Sentiment Analysis Model Performance', fontsize=16, fontweight='bold')
        
        # 1. Model comparison
        ax1 = axes[0, 0]
        models = self.results_df['Model']
        f1_scores = self.results_df['F1 Score']
        colors = ['gold' if model == self.best_model_name else 'skyblue' for model in models]
        
        bars = ax1.bar(range(len(models)), f1_scores, color=colors)
        ax1.set_title('F1 Scores by Model', fontweight='bold')
        ax1.set_ylabel('F1 Score')
        ax1.set_xticks(range(len(models)))
        ax1.set_xticklabels(models, rotation=45, ha='right')
        ax1.grid(True, alpha=0.3)
        
        # Add value labels on bars
        for bar, score in zip(bars, f1_scores):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{score:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # 2. Confusion matrix for best model
        ax2 = axes[0, 1]
        best_results = self.models[self.best_model_name]
        cm = confusion_matrix(self.y_test, best_results['predictions'])
        
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=self.label_encoder.classes_,
                   yticklabels=self.label_encoder.classes_, ax=ax2)
        ax2.set_title(f'Confusion Matrix - {self.best_model_name}', fontweight='bold')
        ax2.set_xlabel('Predicted')
        ax2.set_ylabel('Actual')
        
        # 3. Metrics comparison
        ax3 = axes[0, 2]
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
        best_metrics = [best_results[metric.lower().replace(' ', '_')] for metric in metrics]
        
        bars = ax3.bar(metrics, best_metrics, color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'])
        ax3.set_title(f'Metrics - {self.best_model_name}', fontweight='bold')
        ax3.set_ylabel('Score')
        ax3.grid(True, alpha=0.3)
        
        # Add value labels
        for bar, score in zip(bars, best_metrics):
            ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                    f'{score:.3f}', ha='center', va='bottom', fontweight='bold')
        
        # 4. Sentiment distribution
        ax4 = axes[1, 0]
        sentiment_counts = self.df['sentiment'].value_counts()
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']
        wedges, texts, autotexts = ax4.pie(sentiment_counts.values, labels=sentiment_counts.index, 
                                          autopct='%1.1f%%', colors=colors, startangle=90)
        ax4.set_title('Dataset Sentiment Distribution', fontweight='bold')
        
        # 5. Model performance heatmap
        ax5 = axes[1, 1]
        pivot_data = self.results_df.set_index('Model')[['Accuracy', 'Precision', 'Recall', 'F1 Score']]
        sns.heatmap(pivot_data, annot=True, fmt='.3f', cmap='YlOrRd', ax=ax5)
        ax5.set_title('Model Performance Heatmap', fontweight='bold')
        
        # 6. Text length distribution
        ax6 = axes[1, 2]
        text_lengths = self.df['cleaned_text'].str.len()
        ax6.hist(text_lengths, bins=50, color='skyblue', alpha=0.7, edgecolor='black')
        ax6.set_title('Review Text Length Distribution', fontweight='bold')
        ax6.set_xlabel('Text Length (characters)')
        ax6.set_ylabel('Frequency')
        ax6.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('custom_sentiment_analysis_results.png', dpi=300, bbox_inches='tight')
        print("✅ Visualizations saved as 'custom_sentiment_analysis_results.png'")
        
        return fig
    
    def save_model(self, model_name=None):
        """Save the best model"""
        if model_name is None:
            model_name = self.best_model_name
        
        print(f"\n💾 Saving best model: {model_name}")
        
        if model_name == 'BERT':
            # Save BERT model
            self.models[model_name]['model'].save_model("./best_bert_sentiment_model")
            joblib.dump(self.models[model_name]['tokenizer'], "./best_bert_tokenizer.pkl")
        else:
            # Save traditional model
            model = self.models[model_name]['model']
            vectorizer = self.models[model_name]['vectorizer']
            
            joblib.dump(model, f"./best_{model_name.lower().replace(' ', '_')}_model.pkl")
            joblib.dump(vectorizer, f"./best_{model_name.lower().replace(' ', '_')}_vectorizer.pkl")
        
        # Save label encoder
        joblib.dump(self.label_encoder, "./label_encoder.pkl")
        
        # Save results
        self.results_df.to_csv("model_performance_results.csv", index=False)
        
        print("✅ Model and results saved successfully!")
    
    def predict_sample(self, text, model_name=None):
        """Predict sentiment for a sample text"""
        if model_name is None:
            model_name = self.best_model_name
        
        print(f"\n🔮 Predicting sentiment using {model_name}...")
        
        # Clean text
        cleaned_text = self.clean_text(text)
        
        if model_name == 'BERT':
            # BERT prediction
            tokenizer = self.models[model_name]['tokenizer']
            model = self.models[model_name]['model'].model
            
            inputs = tokenizer(cleaned_text, return_tensors="pt", padding=True, truncation=True, max_length=128)
            outputs = model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            
        else:
            # Traditional model prediction
            vectorizer = self.models[model_name]['vectorizer']
            model = self.models[model_name]['model']
            
            text_vec = vectorizer.transform([cleaned_text])
            probabilities = model.predict_proba(text_vec)[0]
            prediction = model.predict(text_vec)[0]
        
        sentiment = self.label_encoder.classes_[prediction]
        confidence = probabilities[prediction]
        
        print(f"Text: '{text}'")
        print(f"Predicted sentiment: {sentiment}")
        print(f"Confidence: {confidence:.3f}")
        
        return sentiment, confidence


def main():
    """Main execution function"""
    print("🚀 Custom Sentiment Analysis Model Training")
    print("="*60)
    
    # Get CSV file path
    csv_file = input("Enter the path to your CSV file (or press Enter for 'bpi_reviews.csv'): ").strip()
    if not csv_file:
        csv_file = 'bpi_reviews.csv'
    
    try:
        # Initialize model trainer
        trainer = CustomSentimentModel(csv_file)
        
        # Load and preprocess data
        trainer.load_and_preprocess_data()
        
        # Prepare data for training
        trainer.prepare_data()
        
        # Train traditional models
        trainer.train_traditional_models()
        
        # Train BERT model (optional)
        use_bert = input("\nDo you want to train a BERT model? (y/n): ").strip().lower()
        if use_bert == 'y':
            trainer.train_bert_model()
        
        # Generate detailed report
        results_df = trainer.generate_detailed_report()
        
        # Create visualizations
        trainer.create_visualizations()
        
        # Save model
        trainer.save_model()
        
        # Test prediction
        test_text = input("\nEnter a test review to predict sentiment (or press Enter to skip): ").strip()
        if test_text:
            trainer.predict_sample(test_text)
        
        print("\n✅ Training complete!")
        print("📁 Files generated:")
        print("   - custom_sentiment_analysis_results.png (Visualizations)")
        print("   - model_performance_results.csv (Detailed results)")
        print("   - best_*_model.pkl (Saved models)")
        print("   - label_encoder.pkl (Label encoder)")
        
        print(f"\n🏆 Best model: {trainer.best_model_name}")
        print(f"   F1 Score: {trainer.models[trainer.best_model_name]['f1_score']:.4f}")
        print(f"   Accuracy: {trainer.models[trainer.best_model_name]['accuracy']:.4f}")
        
    except FileNotFoundError:
        print(f"❌ Error: Could not find the file '{csv_file}'")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
