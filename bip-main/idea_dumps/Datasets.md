# Datasets for BIPBIP

This document outlines the essential datasets required for the Branch Intelligence Platform (BIPBIP), detailing their purpose, structure, and potential acquisition methods.

## 1. Branch Information Dataset

*   **Purpose**: To identify and locate bank branches for mapping and analysis.
*   **Data Points**:
    *   `branch_id`: Unique identifier for each branch.
    *   `branch_name`: Name of the bank branch.
    *   `address`: Full physical address of the branch.
    *   `city`: City where the branch is located.
    *   `latitude`: Geographic latitude coordinate.
    *   `longitude`: Geographic longitude coordinate.
    *   `contact_number` (Optional): Phone number of the branch.
    *   `operating_hours` (Optional): Branch operating hours.
*   **Sources**:
    *   Web scraping (e.g., from bank websites, Google Maps).
    *   Existing internal databases (if available).
    *   Manual entry/correction.
*   **Current Status**: Partially available in `branch_scraper/deduplicated_branches.csv`.

## 2. Customer Reviews Dataset

*   **Purpose**: To perform sentiment analysis and generate insights into customer satisfaction.
*   **Data Points**:
    *   `review_id`: Unique identifier for each review.
    *   `branch_id`: Foreign key linking to the `Branch Information` dataset.
    *   `review_text`: The actual text content of the customer review.
    *   `rating`: Star rating associated with the review (e.g., 1-5 stars).
    *   `review_date`: Date the review was posted.
    *   `sentiment_score` (Derived): Numerical sentiment score (e.g., -1 to 1).
    *   `sentiment_label` (Derived): Categorical sentiment (Positive, Negative, Neutral).
*   **Sources**:
    *   Web scraping (e.g., Google Maps reviews via `review_scraper`).
    *   Synthetic data generation (using prompts and templates).
*   **Considerations**:
    *   Handling multiple languages (English, Tagalog, Taglish).
    *   Ensuring a balanced distribution of sentiments for training.

## 3. Transaction Data Dataset

*   **Purpose**: To predict customer flow, average transaction times, and analyze historical transaction patterns.
*   **Data Points**:
    *   `transaction_id`: Unique identifier for each transaction.
    *   `branch_id`: Foreign key linking to the `Branch Information` dataset.
    *   `customer_id` (Optional): Anonymous customer identifier.
    *   `transaction_type`: Type of transaction (e.g., deposit, withdrawal, loan application, account opening).
    *   `transaction_start_time`: Timestamp when the transaction began.
    *   `transaction_end_time`: Timestamp when the transaction ended.
    *   `queue_time` (Derived): Time spent waiting in line.
    *   `service_time` (Derived): Time spent performing the transaction.
    *   `amount` (Optional): Transaction amount.
*   **Sources**:
    *   Bank's internal transaction logs (e.g., from BEA).
    *   Simulated data for MVP if real data is unavailable.

## 4. Branch Performance Metrics Dataset

*   **Purpose**: To track and display various performance indicators for each branch over time.
*   **Data Points**:
    *   `metric_id`: Unique identifier for the metric entry.
    *   `branch_id`: Foreign key linking to the `Branch Information` dataset.
    *   `date`: Date for which the metrics are recorded.
    *   `total_transactions`: Total number of transactions for the period.
    *   `in_branch_customer_visits`: Number of unique customer visits.
    *   `average_transaction_time`: Average time taken for all transactions.
    *   `overall_branch_health_score`: Aggregated score reflecting branch performance (e.g., based on sentiment, efficiency, customer traffic).
    *   `staff_count` (Optional): Number of staff on duty.
*   **Sources**:
    *   Aggregated data from `Transaction Data` and `Customer Reviews`.
    *   Internal operational reports.
    *   Simulated data for future predictions.

## 5. User Data Dataset

*   **Purpose**: To manage user accounts and access control for the BIPBIP application.
*   **Data Points**:
    *   `user_id`: Unique identifier for each user.
    *   `username` / `email`.
    *   `password_hash`: Hashed password for security.
    *   `role`: User role (e.g., admin, analyst, guest).
    *   `last_login`.
*   **Sources**:
    *   User registration within the application.
    *   Internal user management systems.

## 6. Synthetic Data Generation

*   **Purpose**: To augment real datasets, especially for sentiment analysis, to ensure sufficient and balanced training data, and for simulating scenarios.
*   **Methodology**:
    *   **Review Data**: Using AI models (e.g., GPT-3/4) with specific prompts to generate reviews with predefined sentiments (positive, negative, neutral) and topics relevant to banking.
    *   **Transaction/Performance Data**: Generating realistic transaction volumes, customer flow patterns, and associated metrics based on statistical distributions and known patterns (e.g., higher traffic on paydays).
*   **Guidelines**: Ensure generated data maintains realism and diversity to prevent model overfitting and bias.

## 7. External Data (Future Considerations)

*   **Purpose**: To incorporate external factors that might influence branch performance and customer behavior.
*   **Data Points**:
    *   Public holidays calendar.
    *   Local event schedules (e.g., festivals, concerts).
    *   Weather data.
    *   Economic indicators.
*   **Sources**:
    *   Public APIs (e.g., government calendars, weather APIs).

This comprehensive list of datasets will serve as a guide for data acquisition, preparation, and integration throughout the development of BIPBIP.