import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
import time
import datetime
import numpy as np
from typing import Dict, List, Tuple
import re


class BPIBranchHealthCalculator:
    def __init__(self, sheet_id: str, credentials_path: str):
        self.sheet_id = sheet_id
        self.gc = None
        self.branch_mapping = {}  # Will store mapping between different branch name formats

        # Strict Service Standards (in minutes) - More demanding for better score distribution
        self.service_standards = {
            'withdrawal': {'waiting': {'normal': 2.5, 'peak': 6}, 'processing': {'normal': 2.5, 'peak': 3.5}},
            'deposit': {'waiting': {'normal': 3, 'peak': 8}, 'processing': {'normal': 3, 'peak': 4.5}},
            'encashment': {'waiting': {'normal': 4, 'peak': 10}, 'processing': {'normal': 4, 'peak': 6}},
            'transfer': {'waiting': {'normal': 3, 'peak': 6}, 'processing': {'normal': 3, 'peak': 4}},
            'customer service': {'waiting': {'normal': 5, 'peak': 12}, 'processing': {'normal': 7, 'peak': 12}},
            'account service': {'waiting': {'normal': 8, 'peak': 15}, 'processing': {'normal': 10, 'peak': 15}},
            'loan': {'waiting': {'normal': 10, 'peak': 20}, 'processing': {'normal': 15, 'peak': 25}}
        }

        # Strict Performance Requirements
        self.performance_requirements = {
            'avg_waiting_time_max': 4.0,  # Maximum 4 minutes average waiting
            'avg_processing_time_max': 5.0,  # Maximum 5 minutes average processing
            'min_sentiment_score': 3.0,  # Minimum sentiment score of 3.0
            'max_transaction_time': 9.0  # Maximum combined transaction time for excellent score
        }

        # Branch capacity standards
        self.capacity_standards = {
            'normal_day': 150,
            'peak_day': 270,
            'regular_branch_bea': 3,  # BPI Express Assist
        }

        # Randomized financial performance per branch (simulating real variations)
        self.branch_financial_scores = {}  # Will store branch-specific financial scores

        self.setup_sheets_connection(credentials_path)

    def setup_sheets_connection(self, credentials_path: str):
        """Setup Google Sheets API connection"""
        try:
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            credentials = Credentials.from_service_account_file(credentials_path, scopes=scope)
            self.gc = gspread.authorize(credentials)
            print("✅ Google Sheets connection established successfully!")
        except Exception as e:
            print(f"❌ Error establishing Google Sheets connection: {e}")
            raise

    def create_branch_mapping(self, sheet1_branches: List[str], main_branches: List[str]) -> Dict[str, str]:
        """Create mapping between Sheet1 branch names and Main sheet branch names"""
        mapping = {}

        for main_branch in main_branches:
            # Clean main branch name for matching
            main_clean = self.clean_branch_name(main_branch)

            # Find best match in Sheet1 branches
            best_match = None
            highest_score = 0

            for sheet1_branch in sheet1_branches:
                sheet1_clean = self.clean_branch_name(sheet1_branch)
                score = self.calculate_branch_name_similarity(main_clean, sheet1_clean)

                if score > highest_score and score > 0.3:  # 30% similarity threshold
                    highest_score = score
                    best_match = sheet1_branch

            if best_match:
                mapping[best_match] = main_branch
                print(f"📍 Mapped: '{best_match}' → '{main_branch}' (similarity: {highest_score:.2f})")
            else:
                print(f"⚠️  No match found for Main branch: '{main_branch}'")

        return mapping

    def clean_branch_name(self, branch_name: str) -> str:
        """Clean and normalize branch name for matching"""
        # Remove common prefixes/suffixes
        cleaned = branch_name.lower()
        cleaned = re.sub(r'\bbpi\b', '', cleaned)
        cleaned = re.sub(r'\bbranch\b', '', cleaned)
        cleaned = re.sub(r'^the\b', '', cleaned)

        # Remove special characters and extra spaces
        cleaned = re.sub(r'[^\w\s]', ' ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        return cleaned

    def calculate_branch_name_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity score between two branch names"""
        words1 = set(name1.split())
        words2 = set(name2.split())

        if not words1 or not words2:
            return 0.0

        # Calculate Jaccard similarity
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))

        return intersection / union if union > 0 else 0.0

    def fetch_transaction_data(self) -> pd.DataFrame:
        """Fetch transaction data from Sheet1"""
        try:
            sheet = self.gc.open_by_key(self.sheet_id)
            worksheet = sheet.worksheet("Sheet1")

            # Get all values
            data = worksheet.get_all_values()

            if not data:
                print("⚠️  No data found in Sheet1")
                return pd.DataFrame()

            # Convert to DataFrame
            df = pd.DataFrame(data[1:], columns=data[0])  # First row as headers

            # Clean and convert data types
            if not df.empty:
                # Convert numeric columns
                numeric_columns = ['waiting_time', 'processing_time', 'transaction_time', 'sentiment_score']
                for col in numeric_columns:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors='coerce')

                # Convert date column
                if 'date' in df.columns:
                    df['date'] = pd.to_datetime(df['date'], errors='coerce')

                print(f"📊 Fetched {len(df)} transactions from Sheet1")

            return df

        except Exception as e:
            print(f"❌ Error fetching transaction data: {e}")
            return pd.DataFrame()

    def fetch_main_sheet_structure(self) -> pd.DataFrame:
        """Fetch the structure and existing data from Main sheet"""
        try:
            sheet = self.gc.open_by_key(self.sheet_id)

            try:
                worksheet = sheet.worksheet("Main")
            except gspread.WorksheetNotFound:
                # Create Main worksheet if it doesn't exist
                worksheet = sheet.add_worksheet(title="Main", rows=1000, cols=11)

                # Add headers
                headers = [
                    'city', 'branch_name', 'address', 'latitude', 'longitude',
                    'avg_waiting_time', 'avg_processing_time', 'avg_transaction_time',
                    'transaction_count', 'sentiment_score', 'bhs'
                ]
                worksheet.update('A1:K1', [headers])
                print("✅ Created Main sheet with headers")
                return pd.DataFrame(columns=headers)

            # Get existing data
            data = worksheet.get_all_values()
            if len(data) <= 1:  # Only headers or empty
                return pd.DataFrame(columns=data[0] if data else [])

            df = pd.DataFrame(data[1:], columns=data[0])
            print(f"📋 Fetched Main sheet with {len(df)} branches")
            return df

        except Exception as e:
            print(f"❌ Error fetching Main sheet: {e}")
            return pd.DataFrame()

    def get_branch_financial_score(self, branch_name: str) -> float:
        """Get randomized but consistent financial score for each branch"""
        if branch_name not in self.branch_financial_scores:
            # Create deterministic but varied financial scores based on branch name
            import hashlib

            # Use branch name as seed for consistent but different scores
            branch_hash = int(hashlib.md5(branch_name.encode()).hexdigest(), 16)
            np.random.seed(branch_hash % 10000)  # Use hash as seed

            # Generate financial score between 20-95 with realistic distribution
            # Most branches should be average (50-80), some excellent (80-95), some poor (20-50)
            rand_val = np.random.random()

            if rand_val < 0.5:  # 5% poor performing branches
                score = np.random.uniform(20, 45)
            elif rand_val < 0.60:  # 55% average branches
                score = np.random.uniform(45, 75)
            elif rand_val < 0.70:  # 20% good branches
                score = np.random.uniform(75, 85)
            else:  # 10% excellent branches
                score = np.random.uniform(85, 95)

            self.branch_financial_scores[branch_name] = round(score, 1)

            # Reset random seed to not affect other operations
            np.random.seed(None)

        return self.branch_financial_scores[branch_name]

    def is_peak_day(self, date: datetime.date) -> bool:
        """Determine if a date is a peak day (Mondays, Fridays, 15th, 30th)"""
        weekday = date.weekday()  # Monday = 0, Sunday = 6
        day = date.day
        return weekday in [0, 4] or day in [15, 30]

    def calculate_service_efficiency_score(self, branch_data: pd.DataFrame, branch_name: str) -> float:
        """Calculate strict service efficiency score for a branch"""
        if branch_data.empty:
            return 0.0

        # Overall branch performance against strict requirements
        avg_waiting = branch_data['waiting_time'].mean()
        avg_processing = branch_data['processing_time'].mean()
        avg_total = branch_data['transaction_time'].mean()

        # Strict scoring based on overall performance
        waiting_score = self.calculate_performance_score(
            avg_waiting,
            self.performance_requirements['avg_waiting_time_max'],
            excellent_threshold=5.0,  # Excellent if under 4 min average
            poor_threshold=6.0  # Poor if over 6 min average
        )

        processing_score = self.calculate_performance_score(
            avg_processing,
            self.performance_requirements['avg_processing_time_max'],
            excellent_threshold=5.0,  # Excellent if under 3 min average
            poor_threshold=9.0  # Poor if over 8 min average
        )

        total_time_score = self.calculate_performance_score(
            avg_total,
            self.performance_requirements['max_transaction_time'],
            excellent_threshold=10.0,  # Excellent if under 6 min total
            poor_threshold=18.0  # Poor if over 15 min total
        )

        # Additional penalty for transaction type mix efficiency
        type_efficiency_penalty = 0
        transaction_types = branch_data['transaction_type'].value_counts()

        # Penalty if too many complex transactions with poor handling
        complex_types = ['loan', 'account service', 'customer service']
        complex_ratio = sum(transaction_types.get(t, 0) for t in complex_types) / len(branch_data)

        if complex_ratio > 0.3:  # More than 30% complex transactions
            complex_data = branch_data[branch_data['transaction_type'].isin(complex_types)]
            complex_avg_time = complex_data['transaction_time'].mean()
            if complex_avg_time > 20:  # Taking too long for complex transactions
                type_efficiency_penalty = min(20, (complex_avg_time - 20) * 2)

        # Calculate weighted efficiency score
        efficiency_score = (
                                       waiting_score * 0.35 + processing_score * 0.35 + total_time_score * 0.30) - type_efficiency_penalty

        return max(0, min(100, efficiency_score))

    def calculate_performance_score(self, actual_value: float, max_requirement: float,
                                    excellent_threshold: float, poor_threshold: float) -> float:
        """Calculate performance score based on thresholds"""
        if actual_value <= excellent_threshold:
            return 100  # Excellent performance
        elif actual_value <= max_requirement:
            # Linear decrease from 100 to 70 between excellent and requirement
            return 100 - ((actual_value - excellent_threshold) / (max_requirement - excellent_threshold)) * 20
        elif actual_value <= poor_threshold:
            # Linear decrease from 70 to 20 between requirement and poor threshold
            return 70 - ((actual_value - max_requirement) / (poor_threshold - max_requirement)) * 40
        else:
            # Very poor performance, minimum score with additional penalty
            penalty = min(15, (actual_value - poor_threshold) * 2)
            return max(5, 20 - penalty)

    def calculate_customer_experience_score(self, branch_data: pd.DataFrame) -> float:
        """Calculate strict customer experience score based on sentiment with requirement of 3.0 minimum"""
        if branch_data.empty or 'sentiment_score' not in branch_data.columns:
            return 0.0

        # Average sentiment score (1-5 scale) with strict requirements
        avg_sentiment = branch_data['sentiment_score'].mean()

        # Strict scoring based on sentiment requirements
        if avg_sentiment >= 4.5:
            experience_score = 95  # Excellent customer experience
        elif avg_sentiment >= 4.0:
            experience_score = 85  # Very good
        elif avg_sentiment >= 3.5:
            experience_score = 75  # Good
        elif avg_sentiment >= self.performance_requirements['min_sentiment_score']:  # 3.0
            experience_score = 60  # Meets minimum requirement
        elif avg_sentiment >= 2.5:
            experience_score = 40  # Below requirement
        elif avg_sentiment >= 2.0:
            experience_score = 25  # Poor
        else:
            experience_score = 10  # Very poor

        # Additional factors
        # Consistency bonus/penalty based on sentiment variance
        sentiment_std = branch_data['sentiment_score'].std()
        if sentiment_std < 0.5:  # Very consistent experience
            experience_score += 5
        elif sentiment_std > 1.0:  # Inconsistent experience
            experience_score -= 10

        # Volume consideration - harder to maintain quality with high volume
        transaction_count = len(branch_data)
        if transaction_count > 400 and avg_sentiment >= 3.5:
            experience_score += 5  # Bonus for maintaining quality at high volume
        elif transaction_count > 200 and avg_sentiment < 3.0:
            experience_score -= 5  # Penalty for poor quality at high volume

        return max(0, min(100, experience_score))

    def calculate_peak_capacity_score(self, branch_data: pd.DataFrame) -> float:
        """Calculate strict operational capacity and peak management score"""
        if branch_data.empty:
            return 0.0

        # Group by date to get daily volumes
        daily_volumes = branch_data.groupby(branch_data['date'].dt.date).size()

        if daily_volumes.empty:
            return 0.0

        capacity_scores = []

        for date, volume in daily_volumes.items():
            is_peak = self.is_peak_day(date)
            standard = self.capacity_standards['peak_day'] if is_peak else self.capacity_standards['normal_day']

            daily_data = branch_data[branch_data['date'].dt.date == date]
            avg_total_time = daily_data['transaction_time'].mean()
            avg_waiting_time = daily_data['waiting_time'].mean()

            # Strict capacity scoring
            if volume <= standard * 0.6:  # Low volume day (70% of standard or less)
                if avg_total_time <= 8:
                    score = 90  # Excellent - low volume, fast service
                elif avg_total_time <= 12:
                    score = 80  # Good
                else:
                    score = 60  # Poor service despite low volume

            elif volume <= standard:  # Normal capacity (80-100% of standard)
                if avg_total_time <= 10:
                    score = 85  # Excellent capacity management
                elif avg_total_time <= 15:
                    score = 75  # Good
                elif avg_total_time <= 20:
                    score = 65  # Acceptable
                else:
                    score = 45  # Poor time management

            elif volume <= standard * 1.2:  # Slightly over capacity (100-120%)
                if avg_total_time <= 12:
                    score = 75  # Excellent handling of excess volume
                elif avg_total_time <= 18:
                    score = 60  # Good handling
                elif avg_total_time <= 25:
                    score = 45  # Struggling with volume
                else:
                    score = 30  # Poor handling

            else:  # Significantly over capacity (>120%)
                over_capacity_ratio = volume / standard
                if avg_total_time <= 15:
                    score = max(50, 70 - (over_capacity_ratio - 1.2) * 20)  # Managing well despite overload
                elif avg_total_time <= 25:
                    score = max(30, 50 - (over_capacity_ratio - 1.2) * 30)  # Struggling
                else:
                    score = max(10, 30 - (over_capacity_ratio - 1.2) * 40)  # Failing to manage

            # Additional penalty for excessive waiting times regardless of volume
            if avg_waiting_time > 10:
                score -= min(20, (avg_waiting_time - 10) * 2)

            capacity_scores.append(max(0, score))

        # Overall capacity score with consistency factor
        base_score = np.mean(capacity_scores)

        # Penalize high variability in daily performance
        if len(capacity_scores) > 1:
            score_std = np.std(capacity_scores)
            if score_std > 15:  # High variability in performance
                base_score -= min(10, score_std - 15)

        return max(0, min(100, base_score))

    def calculate_branch_health_score(self, service_eff: float, customer_exp: float,
                                      peak_capacity: float, financial_perf: float) -> float:
        """Calculate overall Branch Health Score using weighted formula"""
        # Weights as specified in requirements
        weights = {
            'service_efficiency': 0.4,
            'customer_experience': 0.3,
            'peak_capacity': 0.2,
            'financial_performance': 0.1
        }

        bhs = (
                service_eff * weights['service_efficiency'] +
                customer_exp * weights['customer_experience'] +
                peak_capacity * weights['peak_capacity'] +
                financial_perf * weights['financial_performance']
        )

        return round(bhs, 2)

    def calculate_metrics_for_branch(self, branch_name: str, branch_data: pd.DataFrame) -> Dict:
        """Calculate all metrics for a specific branch"""
        if branch_data.empty:
            return {
                'avg_waiting_time': 0,
                'avg_processing_time': 0,
                'avg_transaction_time': 0,
                'transaction_count': 0,
                'sentiment_score': 0,
                'bhs': 0
            }

        # Basic metrics
        avg_waiting_time = round(branch_data['waiting_time'].mean(), 2)
        avg_processing_time = round(branch_data['processing_time'].mean(), 2)
        avg_transaction_time = round(branch_data['transaction_time'].mean(), 2)
        transaction_count = len(branch_data)
        avg_sentiment_score = round(branch_data['sentiment_score'].mean(), 2)

        # Advanced metrics for BHS calculation
        service_efficiency = self.calculate_service_efficiency_score(branch_data, branch_name)
        customer_experience = self.calculate_customer_experience_score(branch_data)
        peak_capacity = self.calculate_peak_capacity_score(branch_data)
        financial_performance = self.get_branch_financial_score(branch_name)  # Now randomized per branch

        # Calculate BHS
        bhs = self.calculate_branch_health_score(
            service_efficiency, customer_experience, peak_capacity, financial_performance
        )

        return {
            'avg_waiting_time': avg_waiting_time,
            'avg_processing_time': avg_processing_time,
            'avg_transaction_time': avg_transaction_time,
            'transaction_count': transaction_count,
            'sentiment_score': avg_sentiment_score,
            'bhs': bhs
        }

    def update_main_sheet(self, updated_data: pd.DataFrame):
        """Update the Main sheet with calculated metrics"""
        try:
            sheet = self.gc.open_by_key(self.sheet_id)
            worksheet = sheet.worksheet("Main")

            # Prepare data for update (preserve existing static columns)
            update_data = []

            for _, row in updated_data.iterrows():
                update_row = [
                    row.get('city', ''),
                    row.get('branch_name', ''),
                    row.get('address', ''),
                    row.get('latitude', ''),
                    row.get('longitude', ''),
                    row.get('avg_waiting_time', 0),
                    row.get('avg_processing_time', 0),
                    row.get('avg_transaction_time', 0),
                    row.get('transaction_count', 0),
                    row.get('sentiment_score', 0),
                    row.get('bhs', 0)
                ]
                update_data.append(update_row)

            # Update the sheet (starting from row 2, keeping headers)
            if update_data:
                end_row = len(update_data) + 1
                range_name = f'A2:K{end_row}'
                worksheet.update(values=update_data, range_name=range_name)

                print(f"✅ Updated Main sheet with {len(update_data)} branches")

                # Print summary
                total_transactions = sum(row[8] for row in update_data)  # transaction_count column
                avg_bhs = sum(row[10] for row in update_data) / len(update_data)  # bhs column
                print(f"📊 Summary: {total_transactions} total transactions, Average BHS: {avg_bhs:.2f}")

        except Exception as e:
            print(f"❌ Error updating Main sheet: {e}")

    def process_and_update(self):
        """Main processing function - fetch data, calculate metrics, and update"""
        print(f"🔄 Processing update at {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Fetch transaction data from Sheet1
        transaction_df = self.fetch_transaction_data()

        if transaction_df.empty:
            print("⚠️  No transaction data to process")
            return

        # Fetch Main sheet structure
        main_df = self.fetch_main_sheet_structure()

        # Create branch mapping if not exists
        if not self.branch_mapping and not main_df.empty:
            sheet1_branches = transaction_df['branch_name'].unique().tolist()
            main_branches = main_df['branch_name'].tolist()
            self.branch_mapping = self.create_branch_mapping(sheet1_branches, main_branches)

        # Process each branch
        updated_branches = []

        # Get unique Sheet1 branches that have mappings
        for sheet1_branch, main_branch in self.branch_mapping.items():
            branch_transactions = transaction_df[transaction_df['branch_name'] == sheet1_branch]

            if branch_transactions.empty:
                continue

            # Calculate metrics
            metrics = self.calculate_metrics_for_branch(main_branch, branch_transactions)

            # Find existing branch data in Main sheet
            existing_row = main_df[main_df['branch_name'] == main_branch] if not main_df.empty else pd.DataFrame()

            if not existing_row.empty:
                # Update existing branch
                branch_data = existing_row.iloc[0].to_dict()
                branch_data.update(metrics)
            else:
                # New branch (create with minimal static data)
                branch_data = {
                    'city': 'Manila',  # Default city
                    'branch_name': main_branch,
                    'address': f'{main_branch} Address',  # Placeholder
                    'latitude': '14.5995',  # Manila coordinates
                    'longitude': '120.9842',
                    **metrics
                }

            updated_branches.append(branch_data)

            print(f"📍 {main_branch}: {metrics['transaction_count']} transactions, "
                  f"BHS: {metrics['bhs']}, Avg Time: {metrics['avg_transaction_time']}min, "
                  f"Sentiment: {metrics['sentiment_score']}, Financial: {self.get_branch_financial_score(main_branch)}")

        # Create updated DataFrame and update Main sheet
        if updated_branches:
            updated_df = pd.DataFrame(updated_branches)
            self.update_main_sheet(updated_df)
        else:
            print("⚠️  No branches to update")

    def run_continuous_monitoring(self, update_interval_seconds: int = 30):
        """Run continuous monitoring and updating"""
        print(f"🚀 Starting BPI Branch Health Score Calculator")
        print(f"📊 Update interval: {update_interval_seconds} seconds")
        print(f"📅 Started at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 60)

        iteration = 1

        while True:
            try:
                print(f"\n📈 Iteration #{iteration}")
                self.process_and_update()

                print(f"⏰ Next update in {update_interval_seconds} seconds...")
                print("-" * 40)

                time.sleep(update_interval_seconds)
                iteration += 1

            except KeyboardInterrupt:
                print(f"\n🛑 Monitoring stopped by user")
                break
            except Exception as e:
                print(f"❌ Error during processing: {e}")
                print(f"⏰ Retrying in {update_interval_seconds} seconds...")
                time.sleep(update_interval_seconds)

    def run_single_update(self):
        """Run a single update cycle"""
        print(f"🔄 Running single update cycle...")
        self.process_and_update()
        print(f"✅ Single update complete!")


def main():
    # Configuration
    SHEET_ID = "1_OBma2uuzISl-5-5OTw3zsx5uWt_K3JfxxgehRfvquA"
    CREDENTIALS_PATH = "trashscan-450913-8d2548518ddc.json"

    print("=== BPI Branch Health Score Calculator ===\n")

    # Initialize calculator
    try:
        calculator = BPIBranchHealthCalculator(SHEET_ID, CREDENTIALS_PATH)
    except Exception as e:
        print(f"❌ Failed to initialize calculator: {e}")
        return

    # Get user preference
    print("Choose operation mode:")
    print("1. Single update (run once)")
    print("2. Continuous monitoring (real-time updates)")

    choice = input("Enter choice (1-2): ").strip()

    if choice == "1":
        # Single update
        calculator.run_single_update()

    elif choice == "2":
        # Continuous monitoring
        update_interval = input("Enter update interval in seconds (default: 30): ").strip()
        update_interval = int(update_interval) if update_interval.isdigit() else 30

        print(f"\n🎯 Starting continuous monitoring...")
        print(f"💡 Press Ctrl+C to stop monitoring")

        calculator.run_continuous_monitoring(update_interval)

    else:
        print("❌ Invalid choice")


if __name__ == "__main__":
    main()