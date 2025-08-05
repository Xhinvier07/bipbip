# Machine Learning Documentation for BIPBIP

This document outlines the machine learning components of the Branch Intelligence Platform (BIPBIP), focusing primarily on sentiment analysis for customer reviews and other potential predictive models.

## 1. Sentiment Analysis

Sentiment analysis is a core component of BIPBIP, providing insights into customer satisfaction and branch health based on review data.

### 1.1. Goal

To accurately classify the sentiment (positive, negative, neutral) of customer reviews and aggregate these insights to provide a "Sentiment Health Score" for each branch.

### 1.2. Data Collection & Preparation

*   **Sources**: Customer reviews from Google Maps (scraped via `review_scraper`), potentially augmented with synthetic data.
*   **Preprocessing Steps**:
    *   **Cleaning**: Removal of noise (HTML tags, special characters, URLs).
    *   **Language Detection**: Identify and handle reviews in English, Tagalog, and Taglish. For Taglish, consider language identification at the word level or using models trained on mixed-language data.
    *   **Tokenization**: Breaking down text into words or subword units.
    *   **Normalization**: Lowercasing, stemming/lemmatization (optional, depending on model).
    *   **Stop Word Removal**: Removing common words that don't carry significant meaning (e.g., "the", "is").

### 1.3. Model Architecture & Training

*   **Initial Approach (MVP)**: Utilize pre-trained transformer models fine-tuned for sentiment analysis, such as `cardiffnlp/twitter-roberta-base-sentiment` or similar models available on Hugging Face that support multiple languages or are robust to code-switching.
*   **Custom Model (Future)**: If sufficient labeled data is acquired, consider training a custom model using architectures like Bi-directional LSTMs, GRUs, or more advanced transformers.
*   **Training Data**: Labeled review data (real and synthetic). For synthetic data, ensure a balanced distribution of sentiments.
*   **Training Process**:
    *   **Framework**: PyTorch or TensorFlow.
    *   **Fine-tuning**: Adapt pre-trained models to the specific domain of bank reviews.
    *   **Evaluation Metrics**: Accuracy, Precision, Recall, F1-score, Confusion Matrix.

### 1.4. Inference & Integration

*   **Batch Processing**: Process new reviews in batches to update sentiment scores periodically.
*   **API Endpoint**: Expose the sentiment analysis model via a REST API (e.g., using FastAPI) for the backend to consume.
*   **Output**: Sentiment score (e.g., -1 to 1 or 0 to 1), sentiment label (positive, negative, neutral), and confidence score.

## 2. Other Potential ML Models (Future Considerations)

### 2.1. Customer Flow Prediction

*   **Goal**: Predict customer traffic at branches at different times of the day/week.
*   **Data**: Historical transaction logs, foot traffic data (if available), external factors (holidays, local events).
*   **Models**: Time series models (ARIMA, Prophet), recurrent neural networks (LSTMs).

### 2.2. Transaction Time Prediction

*   **Goal**: Estimate the time required for various transactions.
*   **Data**: Historical transaction data (type, start time, end time), customer demographics, branch staffing levels.
*   **Models**: Regression models (Linear Regression, Random Forest, Gradient Boosting).

### 2.3. Churn Risk Prediction

*   **Goal**: Identify customers at high risk of churning.
*   **Data**: Customer transaction history, service interactions, demographic data.
*   **Models**: Classification models (Logistic Regression, SVM, Gradient Boosting, Neural Networks).

## 3. Tech Stack for Machine Learning

*   **Languages**: Python
*   **Libraries**: Hugging Face Transformers, scikit-learn, PyTorch/TensorFlow, NLTK, spaCy, Pandas, NumPy.
*   **Deployment**: FastAPI for model serving, Docker for containerization.
*   **Training Environment**: Google Colab Pro, local GPU machines.

## 4. Development Workflow

1.  **Data Acquisition**: Continuously collect and preprocess review data.
2.  **Model Experimentation**: Test different pre-trained models and fine-tuning strategies.
3.  **Model Training**: Train and validate the chosen model on the prepared dataset.
4.  **API Development**: Create a robust API for model inference.
5.  **Integration**: Integrate the ML API with the backend for data processing and storage.
6.  **Monitoring**: Implement monitoring for model performance and data drift.

This document provides a foundational understanding of the machine learning efforts within BIPBIP, with sentiment analysis as the primary focus for the MVP.