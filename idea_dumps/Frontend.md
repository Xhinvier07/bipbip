# Frontend Documentation for BIPBIP

This document outlines the frontend architecture, design principles, and key components of the Branch Intelligence Platform (BIPBIP). It serves as a guide for development and provides context for AI agents.

## 1. Technology Stack

-   **Framework:** React with Vite (JavaScript)
-   **State Management:** Redux Toolkit or React Context API
-   **Styling:** Tailwind CSS for utility-first styling
-   **UI Components:** Headless UI, Radix UI, or Material UI for accessible and customizable components
-   **Maps Integration:** Google Maps API for interactive branch visualizations
-   **Charts/Visualization:** D3.js, Chart.js, or Recharts for data representation
-   **3D Visualization (Future/Simulation):** Three.js for immersive branch simulations
-   **HTTP Client:** Axios for API requests

## 2. Design System

### 2.1. Typography

-   **Primary Font:** Inter or Poppins (sans-serif)
-   **Headings (H1-H6):** Semi-bold weights, sizes ranging from 24px to 48px for hierarchy.
-   **Body Text:** Regular weight, 16px for readability.
-   **Small Text/Captions:** Regular weight, 14px for supplementary information.

### 2.2. Color Palette

Inspired by the provided logo colors, with additional functional colors:

-   **Primary Brand Colors:**
    -   `#fea000` (Orange): Main accent, primary actions, highlights.
    -   `#cf3d58` (Red): Alerts, critical information, warnings.
    -   `#c95a94` (Pink): Secondary elements, subtle accents.
    -   `#bc7eff` (Purple): Tertiary elements, background gradients.

-   **Neutral Colors:**
    -   `#2d3748` (Dark Blue): Text, headers, primary backgrounds.
    -   `#f7fafc` (Light Gray): Backgrounds, subtle dividers.
    -   `#a0aec0` (Medium Gray): Inactive elements, borders.

-   **Functional Colors:**
    -   `#48bb78` (Success Green): Positive feedback, successful operations.
    -   `#ed8936` (Warning Orange): Cautionary messages.
    -   `#f56565` (Error Red): Error states, failed operations.
    -   `#4299e1` (Info Blue): Informational messages.

## 3. Pages and Components

### 3.1. Core Pages

1.  **Login Page:**
    -   User authentication form.
    -   Role-based access control for different user types (Branch Managers, Regional Directors).

2.  **Dashboard:**
    -   Central hub for operational intelligence.
    -   Key Performance Indicator (KPI) summary cards.
    -   Transaction charts and historical trends.
    -   Branch performance metrics (wait times, staff utilization).
    -   Filterable by time periods (day, week, month, year).
    -   Integrated chatbot for quick queries.

3.  **Map View:**
    -   Interactive map displaying all BPI branches.
    -   Color-coded markers indicating real-time branch status (e.g., sentiment, capacity).
    -   Search and filter functionalities (by city, performance score).
    -   Right-panel for overall statistics and simulation controls.

4.  **Simulation Page:**
    -   Dedicated interface for customer flow and staffing simulations.
    -   2D/3D visualization of branch layouts.
    -   Adjustable parameters (e.g., number of tellers, customer arrival rate).
    -   Scenario comparison and predictive outcomes.

5.  **Branch Details Page:**
    -   Drill-down view for specific branch metrics.
    -   Detailed staff performance insights.
    -   Comprehensive customer sentiment analysis for the branch.
    -   Historical data and trend analysis.

### 3.2. Reusable Components

1.  **Navigation:**
    -   Sidebar navigation for main sections.
    -   Top navigation bar with user profile, notifications, and search.

2.  **Data Visualization Components:**
    -   Line charts for time-series data (e.g., wait times over time).
    -   Bar charts for comparisons (e.g., branch performance).
    -   Pie/Donut charts for distributions (e.g., transaction types).
    -   Heatmaps for geospatial data density (e.g., customer satisfaction across regions).

3.  **Interactive Map Elements:**
    -   Customizable branch markers with dynamic status indicators.
    -   Clustering logic for dense areas to improve performance.
    -   Search bar and filter dropdowns.
    -   Custom info windows displaying quick branch summaries on click.

4.  **Form Elements:**
    -   Input fields, dropdowns, checkboxes, radio buttons.
    -   Date pickers for filtering data.
    -   Sliders for simulation parameters.

5.  **Tables:**
    -   Sortable and filterable data tables for detailed metrics.
    -   Pagination for large datasets.

6.  **Modals and Dialogs:**
    -   For confirmations, detailed views, or input forms.

## 4. Frontend Development Flow

1.  **Setup:** Initialize Vite project, configure Tailwind CSS, set up routing.
2.  **Authentication:** Implement login/logout, JWT handling, and protected routes.
3.  **Data Fetching:** Integrate with backend APIs using Axios, manage loading and error states.
4.  **State Management:** Define Redux slices or Context providers for global state.
5.  **Component Development:** Build reusable UI components following design system guidelines.
6.  **Page Assembly:** Combine components to create complete pages.
7.  **Map Integration:** Initialize Google Maps, add markers, implement interactivity.
8.  **Visualization:** Integrate charting libraries for data representation.
9.  **Simulation UI:** Develop controls and display for simulation results.
10. **Testing:** Unit tests for components, integration tests for pages.
11. **Deployment:** Build for production and deploy to a hosting service (e.g., Vercel, Netlify).