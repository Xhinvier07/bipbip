#!/usr/bin/env python3
"""
Test script for the custom sentiment analysis model
Demonstrates how to load and use the trained model
"""

import joblib
import pandas as pd
import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class SentimentPredictor:
    def __init__(self, model_path=None, model_type=None):
        """Initialize the sentiment predictor"""
        self.model = None
        self.vectorizer = None
        self.tokenizer = None
        self.label_encoder = None
        self.model_type = model_type
        
        if model_path:
            self.load_model(model_path, model_type)
    
    def load_model(self, model_path, model_type):
        """Load the trained model"""
        print(f"Loading {model_type} model from {model_path}...")
        
        try:
            if model_type == 'BERT':
                # Load BERT model
                self.model = AutoModelForSequenceClassification.from_pretrained(f"{model_path}/best_bert_sentiment_model")
                self.tokenizer = joblib.load(f"{model_path}/best_bert_tokenizer.pkl")
            else:
                # Load traditional model
                self.model = joblib.load(f"{model_path}/best_{model_type.lower().replace(' ', '_')}_model.pkl")
                self.vectorizer = joblib.load(f"{model_path}/best_{model_type.lower().replace(' ', '_')}_vectorizer.pkl")
            
            # Load label encoder
            self.label_encoder = joblib.load(f"{model_path}/label_encoder.pkl")
            
            print(f"✅ {model_type} model loaded successfully!")
            print(f"Classes: {self.label_encoder.classes_}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def clean_text(self, text):
        """Clean and preprocess text"""
        if pd.isna(text):
            return ''
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def predict(self, text):
        """Predict sentiment for a given text"""
        if not self.model:
            print("❌ No model loaded!")
            return None, None
        
        # Clean text
        cleaned_text = self.clean_text(text)
        
        if self.model_type == 'BERT':
            # BERT prediction
            inputs = self.tokenizer(cleaned_text, return_tensors="pt", padding=True, truncation=True, max_length=128)
            outputs = self.model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
            prediction = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][prediction].item()
        else:
            # Traditional model prediction
            text_vec = self.vectorizer.transform([cleaned_text])
            probabilities = self.model.predict_proba(text_vec)[0]
            prediction = self.model.predict(text_vec)[0]
            confidence = probabilities[prediction]
        
        sentiment = self.label_encoder.classes_[prediction]
        
        return sentiment, confidence
    
    def predict_batch(self, texts):
        """Predict sentiment for multiple texts"""
        results = []
        
        for text in texts:
            sentiment, confidence = self.predict(text)
            results.append({
                'text': text,
                'sentiment': sentiment,
                'confidence': confidence
            })
        
        return results

def main():
    """Main function to test the model"""
    print("🧪 Custom Sentiment Analysis Model Tester")
    print("="*50)
    
    # Sample test texts
    test_texts = [
        "Great service! The staff was very helpful and friendly.",
        "Terrible experience. Long wait times and rude staff.",
        "The service was okay, nothing special but not bad either.",
        "Excellent customer service, fast transactions, highly recommended!",
        "Worst bank ever! Avoid this branch at all costs.",
        "The ATM was working fine and the location is convenient.",
        "Very slow service and the staff seems disorganized.",
        "Professional staff and clean facilities. Good experience overall."
    ]
    
    # Try to load model (you'll need to train first)
    try:
        # Check if model files exist
        import os
        model_files = [f for f in os.listdir('.') if f.endswith('.pkl')]
        
        if model_files:
            print("Found model files:")
            for file in model_files:
                print(f"  - {file}")
            
            # Try to determine model type
            if 'bert' in str(model_files).lower():
                model_type = 'BERT'
                model_path = '.'
            else:
                # Find traditional model
                for file in model_files:
                    if 'model.pkl' in file and 'vectorizer' not in file:
                        model_type = file.replace('best_', '').replace('_model.pkl', '').replace('_', ' ').title()
                        break
                else:
                    model_type = 'Traditional'
                model_path = '.'
            
            predictor = SentimentPredictor(model_path, model_type)
            
            if predictor.model:
                print(f"\n🔮 Testing {model_type} model with sample texts:")
                print("-" * 60)
                
                for i, text in enumerate(test_texts, 1):
                    sentiment, confidence = predictor.predict(text)
                    print(f"{i}. Text: '{text[:50]}...'")
                    print(f"   Sentiment: {sentiment} (confidence: {confidence:.3f})")
                    print()
                
                # Batch prediction
                print("📊 Batch prediction results:")
                print("-" * 60)
                batch_results = predictor.predict_batch(test_texts)
                
                for result in batch_results:
                    print(f"'{result['text'][:40]}...' → {result['sentiment']} ({result['confidence']:.3f})")
                
                # Summary
                sentiments = [r['sentiment'] for r in batch_results]
                sentiment_counts = pd.Series(sentiments).value_counts()
                print(f"\n📈 Summary:")
                for sentiment, count in sentiment_counts.items():
                    print(f"   {sentiment}: {count} texts")
        
        else:
            print("❌ No model files found!")
            print("Please run the training script first:")
            print("   python custom_sentiment_model.py")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Please ensure you have trained the model first.")

if __name__ == "__main__":
    main()
