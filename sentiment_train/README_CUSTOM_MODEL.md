# Custom Sentiment Analysis Model Training

This directory contains a comprehensive custom sentiment analysis model training system that trains multiple models on your BPI reviews dataset and provides detailed performance metrics including F1 scores, precision, recall, and confusion matrices.

## 🚀 Features

### **Multiple Model Types**
- **Traditional ML Models**: Logistic Regression, Random Forest, Gradient Boosting, SVM, Naive Bayes
- **BERT Model**: State-of-the-art transformer-based model
- **Multiple Vectorizers**: TF-IDF and Count vectorizers for text processing

### **Comprehensive Metrics**
- **F1 Score**: Harmonic mean of precision and recall
- **Precision**: Accuracy of positive predictions
- **Recall**: Ability to find all positive instances
- **Accuracy**: Overall prediction accuracy
- **Confusion Matrix**: Detailed error analysis

### **Visualizations**
- Model performance comparison charts
- Confusion matrices
- Sentiment distribution analysis
- Text length distribution
- Performance heatmaps

## 📁 Files

### **Core Scripts**
- `custom_sentiment_model.py` - Main training script
- `test_model.py` - Model testing and prediction script
- `train.py` - Original BERT-based analysis script

### **Data Files**
- `bpi_reviews.csv` - Your dataset with reviews and ratings
- `requirements.txt` - Python dependencies

### **Generated Files** (after training)
- `custom_sentiment_analysis_results.png` - Performance visualizations
- `model_performance_results.csv` - Detailed metrics table
- `best_*_model.pkl` - Trained model files
- `label_encoder.pkl` - Label encoding information

## 🛠️ Installation

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Verify Installation**:
   ```bash
   python -c "import torch, transformers, sklearn; print('All dependencies installed!')"
   ```

## 🎯 Usage

### **Step 1: Train the Model**

```bash
python custom_sentiment_model.py
```

The script will:
1. Load your `bpi_reviews.csv` dataset
2. Preprocess the text data
3. Create sentiment labels from star ratings:
   - ⭐⭐⭐⭐⭐ (4-5 stars) → **positive**
   - ⭐⭐⭐ (3 stars) → **neutral**
   - ⭐⭐ (1-2 stars) → **negative**
4. Train multiple traditional ML models
5. Optionally train a BERT model
6. Generate comprehensive performance reports
7. Create visualizations
8. Save the best performing model

### **Step 2: Test the Model**

```bash
python test_model.py
```

This will:
1. Load your trained model
2. Test it with sample texts
3. Show prediction results and confidence scores

## 📊 Understanding the Results

### **F1 Score**
- **Range**: 0.0 to 1.0 (higher is better)
- **Interpretation**: 
  - 0.9+ = Excellent
  - 0.8-0.9 = Very Good
  - 0.7-0.8 = Good
  - 0.6-0.7 = Fair
  - <0.6 = Poor

### **Precision vs Recall**
- **Precision**: "Of all positive predictions, how many were correct?"
- **Recall**: "Of all actual positives, how many did we find?"
- **F1**: Harmonic mean balancing both metrics

### **Confusion Matrix**
```
                Predicted
Actual    Positive  Neutral  Negative
Positive     TP       FN       FN
Neutral      FP       TN       FN
Negative     FP       FN       TN
```

## 🔧 Customization

### **Modify Model Parameters**

Edit `custom_sentiment_model.py` to adjust:

```python
# Change test split ratio
trainer.prepare_data(test_size=0.3)  # 30% test, 70% train

# Modify vectorizer parameters
vectorizers = {
    'TF-IDF': TfidfVectorizer(max_features=10000, ngram_range=(1, 3)),
    'Count': CountVectorizer(max_features=10000, ngram_range=(1, 3))
}

# Adjust BERT training parameters
training_args = TrainingArguments(
    learning_rate=1e-5,  # Lower learning rate
    num_train_epochs=5,  # More epochs
    per_device_train_batch_size=8,  # Smaller batch size
)
```

### **Add New Models**

```python
# Add new models to the models dictionary
models = {
    'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
    'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100),
    'Your New Model': YourModelClass(parameters),
}
```

## 📈 Expected Performance

Based on typical sentiment analysis tasks:

### **Traditional Models**
- **Logistic Regression**: 0.75-0.85 F1
- **Random Forest**: 0.80-0.88 F1
- **Gradient Boosting**: 0.82-0.90 F1
- **SVM**: 0.78-0.86 F1

### **BERT Model**
- **BERT-base**: 0.85-0.92 F1
- **Fine-tuned BERT**: 0.88-0.94 F1

## 🎯 Use Cases

### **1. Real-time Sentiment Analysis**
```python
from test_model import SentimentPredictor

predictor = SentimentPredictor('.', 'BERT')  # or your best model
sentiment, confidence = predictor.predict("Great service today!")
print(f"Sentiment: {sentiment}, Confidence: {confidence:.3f}")
```

### **2. Batch Processing**
```python
texts = ["Review 1", "Review 2", "Review 3"]
results = predictor.predict_batch(texts)
for result in results:
    print(f"{result['text']} → {result['sentiment']}")
```

### **3. Integration with Your App**
```python
# Load model once at startup
predictor = SentimentPredictor('.', 'BERT')

# Use for real-time predictions
def analyze_review(review_text):
    sentiment, confidence = predictor.predict(review_text)
    return {
        'sentiment': sentiment,
        'confidence': confidence,
        'timestamp': datetime.now()
    }
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Memory Error with BERT**:
   ```python
   # Reduce batch size
   per_device_train_batch_size=8
   per_device_eval_batch_size=8
   ```

2. **Poor Performance**:
   - Check data quality
   - Increase training data
   - Try different vectorizers
   - Adjust model parameters

3. **Model Loading Error**:
   - Ensure all `.pkl` files are in the same directory
   - Check file permissions
   - Verify model compatibility

### **Performance Optimization**

1. **For Large Datasets**:
   ```python
   # Use smaller feature set
   max_features=3000
   
   # Use faster models
   models = {
       'Logistic Regression': LogisticRegression(),
       'Multinomial NB': MultinomialNB(),
   }
   ```

2. **For Production**:
   - Save only the best model
   - Use model compression
   - Implement caching

## 📚 Advanced Features

### **Cross-Validation**
```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(model, X, y, cv=5, scoring='f1_weighted')
print(f"Cross-validation F1: {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
```

### **Hyperparameter Tuning**
```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'C': [0.1, 1, 10, 100],
    'penalty': ['l1', 'l2']
}

grid_search = GridSearchCV(LogisticRegression(), param_grid, cv=5, scoring='f1_weighted')
grid_search.fit(X_train, y_train)
print(f"Best parameters: {grid_search.best_params_}")
```

## 🎉 Success Metrics

Your model training is successful when you see:

✅ **F1 Score > 0.80** for traditional models  
✅ **F1 Score > 0.85** for BERT model  
✅ **Balanced precision and recall**  
✅ **Clear confusion matrix patterns**  
✅ **Consistent performance across test sets**  

## 📞 Support

If you encounter issues:

1. Check the error messages carefully
2. Verify your dataset format
3. Ensure all dependencies are installed
4. Try with a smaller dataset first
5. Check the generated logs and visualizations

---

**Happy Training! 🚀**

Your custom sentiment analysis model will provide detailed insights into customer sentiment with comprehensive F1 scores and performance metrics.
