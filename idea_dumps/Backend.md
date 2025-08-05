# Backend Documentation for BIPBIP

This document details the backend architecture, technology stack, API endpoints, and database schema for the Branch Intelligence Platform (BIPBIP). It serves as a comprehensive guide for backend development and integration.

## 1. Technology Stack

-   **API Framework:** FastAPI (Python) or Express.js (Node.js) for building robust and scalable APIs.
-   **Database:** Supabase (PostgreSQL) as the primary database solution, offering real-time capabilities and authentication.
-   **Alternative Database:** Google Sheets API for simpler data management and manual updates, especially during MVP.
-   **Authentication:** JWT (JSON Web Tokens) for secure, stateless authentication with role-based access control.
-   **Caching:** Redis (optional) for improving API response times by caching frequently accessed data.
-   **Deployment:** Heroku, Railway, or Google Cloud Run for deploying the backend services.

## 2. API Endpoints

### 2.1. Authentication Endpoints

-   `POST /api/auth/login`:
    -   **Description:** Authenticates a user and returns JWT tokens.
    -   **Request Body:** `{ "username": "string", "password": "string" }`
    -   **Response:** `{ "access_token": "string", "token_type": "bearer", "expires_in": "integer" }`

-   `POST /api/auth/refresh`:
    -   **Description:** Refreshes an expired access token using a refresh token.
    -   **Request Body:** `{ "refresh_token": "string" }`
    -   **Response:** `{ "access_token": "string", "token_type": "bearer", "expires_in": "integer" }`

-   `GET /api/auth/me`:
    -   **Description:** Retrieves information about the currently authenticated user.
    -   **Headers:** `Authorization: Bearer <access_token>`
    -   **Response:** `{ "user_id": "string", "username": "string", "role": "string" }`

### 2.2. Branch Management Endpoints

-   `GET /api/branches`:
    -   **Description:** Retrieves a list of all BPI branches.
    -   **Query Parameters:** `city`, `limit`, `offset`
    -   **Response:** `[ { "id": "integer", "branch_name": "string", "address": "string", ... } ]`

-   `GET /api/branches/{id}`:
    -   **Description:** Retrieves detailed information for a specific branch.
    -   **Path Parameters:** `id` (integer)
    -   **Response:** `{ "id": "integer", "branch_name": "string", "address": "string", ... }`

-   `GET /api/branches/{id}/metrics`:
    -   **Description:** Fetches performance metrics for a given branch.
    -   **Path Parameters:** `id` (integer)
    -   **Query Parameters:** `start_date`, `end_date`
    -   **Response:** `{ "avg_wait_time": "float", "total_transactions": "integer", ... }`

-   `GET /api/branches/{id}/sentiment`:
    -   **Description:** Retrieves sentiment analysis results for a specific branch.
    -   **Path Parameters:** `id` (integer)
    -   **Query Parameters:** `start_date`, `end_date`
    -   **Response:** `{ "overall_sentiment": "string", "positive_percentage": "float", "negative_percentage": "float", "reviews": [...] }`

### 2.3. Analytics Endpoints

-   `GET /api/analytics/transactions`:
    -   **Description:** Provides aggregated transaction analytics across the network or filtered by branch.
    -   **Query Parameters:** `branch_id`, `start_date`, `end_date`, `transaction_type`
    -   **Response:** `{ "total_transactions": "integer", "transactions_by_type": { ... }, ... }`

-   `GET /api/analytics/staff`:
    -   **Description:** Offers insights into staff productivity and utilization.
    -   **Query Parameters:** `branch_id`, `staff_id`, `start_date`, `end_date`
    -   **Response:** `{ "avg_service_time": "float", "staff_utilization": "float", ... }`

-   `GET /api/analytics/customers`:
    -   **Description:** Retrieves customer flow metrics and patterns.
    -   **Query Parameters:** `branch_id`, `start_date`, `end_date`
    -   **Response:** `{ "peak_hours": "array", "avg_customer_visits": "float", ... }`

-   `GET /api/analytics/churn`:
    -   **Description:** Provides predictions and insights related to customer churn risk.
    -   **Query Parameters:** `branch_id`, `customer_id`
    -   **Response:** `{ "churn_probability": "float", "risk_factors": "array", ... }`

### 2.4. Simulation Endpoints

-   `POST /api/simulation/customer-flow`:
    -   **Description:** Runs a customer flow simulation based on provided parameters.
    -   **Request Body:** `{ "branch_id": "integer", "arrival_rate": "float", "service_time_avg": "float", "num_tellers": "integer", ... }`
    -   **Response:** `{ "simulated_wait_time": "float", "simulated_queue_length": "integer", "utilization": "float" }`

-   `POST /api/simulation/staffing`:
    -   **Description:** Simulates optimal staffing levels given predicted customer demand.
    -   **Request Body:** `{ "branch_id": "integer", "predicted_customer_flow": "array", "transaction_mix": "object", ... }`
    -   **Response:** `{ "optimal_staff_count": "integer", "recommended_schedule": "object", "cost_savings": "float" }`

## 3. Database Schema (Supabase/PostgreSQL)

### 3.1. `branches` Table

Stores core information about each BPI branch.

```sql
CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  branch_name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  branch_type TEXT, -- e.g., "Main", "Satellite", "Mall"
  opening_hours JSONB, -- e.g., { "Mon": "9-5", "Tue": "9-5" }
  contact_info JSONB, -- e.g., { "phone": "string", "email": "string" }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2. `reviews` Table

Stores raw and processed customer review data.

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  language TEXT, -- e.g., "en", "tl", "taglish"
  source TEXT, -- e.g., "Google Maps", "Facebook", "Synthetic"
  review_date TIMESTAMP WITH TIME ZONE,
  sentiment_score DOUBLE PRECISION, -- e.g., -1.0 to 1.0
  sentiment_label TEXT, -- e.g., "Positive", "Negative", "Neutral"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3. `transactions` Table

Stores simulated or actual transaction logs for each branch.

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- e.g., "Deposit", "Withdrawal", "Account Opening"
  transaction_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER, -- Time taken for the transaction
  staff_id INTEGER, -- ID of the staff member handling the transaction
  customer_id TEXT, -- Anonymized customer identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.4. `branch_metrics` Table

Stores aggregated daily or hourly performance metrics for each branch.

```sql
CREATE TABLE branch_metrics (
  id SERIAL PRIMARY KEY,
  branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  avg_wait_time DOUBLE PRECISION,
  total_transactions INTEGER,
  staff_count INTEGER,
  customer_count INTEGER, -- Number of unique customers served
  satisfaction_score DOUBLE PRECISION, -- Aggregated sentiment score or survey score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.5. `users` Table (for Authentication)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  role TEXT NOT NULL, -- e.g., "admin", "branch_manager", "regional_director"
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Backend Development Flow

1.  **Setup:** Initialize FastAPI/Express.js project, configure database connection (Supabase).
2.  **Authentication:** Implement JWT-based authentication, user registration, and role management.
3.  **API Development:** Create endpoints for branches, analytics, and simulation, ensuring proper request validation and response formatting.
4.  **Database Integration:** Define ORM models (if applicable) or direct SQL queries for data interaction.
5.  **Business Logic:** Implement the core logic for data processing, aggregation, and interaction with ML models.
6.  **Error Handling:** Implement robust error handling and logging mechanisms.
7.  **Testing:** Write unit and integration tests for API endpoints and business logic.
8.  **Deployment:** Containerize the application (e.g., Docker) and deploy to a cloud platform.