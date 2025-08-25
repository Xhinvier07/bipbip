import random
import datetime
import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
import time
import os
import numpy as np
from typing import Dict, List, Tuple, Optional


class BPITransactionGenerator:
    def __init__(self, sheet_id: str, credentials_path: str = None,
                 data_dispersion: float = 1.0, good_data_percentage: float = 70.0):
        """
        Initialize the BPI Transaction Generator with improved data control

        Args:
            sheet_id: Google Sheets ID
            credentials_path: Path to Google credentials file
            data_dispersion: Controls how spread out the data is (0.5 = tight, 2.0 = very spread)
            good_data_percentage: Percentage of transactions that should be "good" (fast, high sentiment)
        """
        self.sheet_id = sheet_id
        self.branches = []  # Will be loaded from CSV
        self.review_samples = {}  # Will be loaded from review CSV

        # Data quality control parameters
        self.data_dispersion = max(0.1, min(5.0, data_dispersion))  # Clamp between 0.1 and 5.0
        self.good_data_percentage = max(10.0, min(95.0, good_data_percentage))  # Clamp between 10% and 95%
        self.bad_data_percentage = 100.0 - self.good_data_percentage

        print(f"📊 Data Configuration:")
        print(f"   Dispersion Factor: {self.data_dispersion} (0.5=tight, 2.0=spread)")
        print(f"   Good Data: {self.good_data_percentage}%")
        print(f"   Bad Data: {self.bad_data_percentage}%")

        # Enhanced transaction type configurations with dispersion control
        self.transaction_config = {
            'withdrawal': {
                'weight': 30,
                'waiting_time': {
                    'normal': {'good': (1, 3), 'bad': (4, 8), 'base': (2, 5)},  #
                    'peak': {'good': (5, 10), 'bad': (12, 20), 'base': (8, 15)}
                },
                'processing_time': {
                    'normal': {'good': (1, 3), 'bad': (4, 7), 'base': (2, 4)},
                    'peak': {'good': (2, 4), 'bad': (5, 10), 'base': (3, 6)}
                }
            },
            'deposit': {
                'weight': 25,
                'waiting_time': {
                    'normal': {'good': (2, 4), 'bad': (5, 10), 'base': (3, 7)},
                    'peak': {'good': (6, 12), 'bad': (15, 25), 'base': (10, 20)}
                },
                'processing_time': {
                    'normal': {'good': (2, 4), 'bad': (5, 9), 'base': (3, 6)},
                    'peak': {'good': (3, 5), 'bad': (6, 12), 'base': (5, 8)}
                }
            },
            'encashment': {
                'weight': 15,
                'waiting_time': {
                    'normal': {'good': (3, 5), 'bad': (6, 12), 'base': (4, 8)},
                    'peak': {'good': (8, 15), 'bad': (18, 30), 'base': (12, 25)}
                },
                'processing_time': {
                    'normal': {'good': (3, 5), 'bad': (6, 10), 'base': (4, 7)},
                    'peak': {'good': (4, 6), 'bad': (8, 15), 'base': (6, 10)}
                }
            },
            'transfer': {
                'weight': 12,
                'waiting_time': {
                    'normal': {'good': (2, 4), 'bad': (5, 9), 'base': (3, 6)},
                    'peak': {'good': (5, 10), 'bad': (12, 20), 'base': (8, 15)}
                },
                'processing_time': {
                    'normal': {'good': (2, 3), 'bad': (4, 7), 'base': (3, 5)},
                    'peak': {'good': (3, 4), 'bad': (5, 10), 'base': (4, 7)}
                }
            },
            'customer service': {
                'weight': 8,
                'waiting_time': {
                    'normal': {'good': (3, 8), 'bad': (10, 18), 'base': (5, 12)},
                    'peak': {'good': (10, 18), 'bad': (20, 35), 'base': (15, 25)}
                },
                'processing_time': {
                    'normal': {'good': (5, 10), 'bad': (12, 20), 'base': (7, 15)},
                    'peak': {'good': (7, 12), 'bad': (15, 25), 'base': (10, 20)}
                }
            },
            'account service': {
                'weight': 6,
                'waiting_time': {
                    'normal': {'good': (5, 10), 'bad': (12, 22), 'base': (8, 15)},
                    'peak': {'good': (10, 18), 'bad': (20, 40), 'base': (15, 30)}
                },
                'processing_time': {
                    'normal': {'good': (7, 12), 'bad': (15, 25), 'base': (10, 20)},
                    'peak': {'good': (10, 15), 'bad': (18, 30), 'base': (15, 25)}
                }
            },
            'loan': {
                'weight': 4,
                'waiting_time': {
                    'normal': {'good': (7, 12), 'bad': (15, 30), 'base': (10, 20)},
                    'peak': {'good': (15, 25), 'bad': (30, 50), 'base': (20, 40)}
                },
                'processing_time': {
                    'normal': {'good': (10, 18), 'bad': (20, 40), 'base': (15, 30)},
                    'peak': {'good': (15, 22), 'bad': (25, 50), 'base': (20, 45)}
                }
            }
        }

        # Initialize Google Sheets connection if credentials provided
        if credentials_path:
            self.setup_sheets_connection(credentials_path)
        else:
            self.gc = None
            print("No credentials provided. Will generate data only (no Google Sheets upload)")

    def load_branches(self, csv_file: str = "branch.csv") -> bool:
        """Load branch names from CSV file"""
        try:
            if not os.path.exists(csv_file):
                print(f"Branch CSV file '{csv_file}' not found!")
                return False

            branch_df = pd.read_csv(csv_file)

            if 'branch_name' not in branch_df.columns:
                print(f"Column 'branch_name' not found in {csv_file}")
                print(f"Available columns: {list(branch_df.columns)}")
                return False

            self.branches = branch_df['branch_name'].dropna().unique().tolist()
            print(f"Loaded {len(self.branches)} branches: {', '.join(self.branches)}")
            return True

        except Exception as e:
            print(f"Error loading branches from {csv_file}: {e}")
            return False

    def setup_sheets_connection(self, credentials_path: str):
        """Setup Google Sheets API connection"""
        try:
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            credentials = Credentials.from_service_account_file(credentials_path, scopes=scope)
            self.gc = gspread.authorize(credentials)
            print("Google Sheets connection established successfully!")
        except Exception as e:
            print(f"An error occurred: {e}")

    def load_review_samples(self, csv_file: str = "bpi_review_samples.csv") -> bool:
        """Load review text samples from CSV file"""
        try:
            if not os.path.exists(csv_file):
                print(f"Review samples CSV file '{csv_file}' not found!")
                return False

            review_df = pd.read_csv(csv_file)

            if 'sentiment' not in review_df.columns or 'review_text' not in review_df.columns:
                print(f"Required columns 'sentiment' and 'review_text' not found in {csv_file}")
                return False

            # Group reviews by sentiment
            self.review_samples = {
                'positive': review_df[review_df['sentiment'] == 'positive']['review_text'].tolist(),
                'negative': review_df[review_df['sentiment'] == 'negative']['review_text'].tolist(),
                'neutral': review_df[review_df['sentiment'] == 'neutral']['review_text'].tolist()
            }

            print(f"Loaded review samples: {len(self.review_samples['positive'])} positive, "
                  f"{len(self.review_samples['negative'])} negative, {len(self.review_samples['neutral'])} neutral")
            return True

        except Exception as e:
            print(f"Error loading review samples from {csv_file}: {e}")
            return False

    def is_peak_day(self, date: datetime.date) -> bool:
        """Determine if a given date is a peak day"""
        # Monday = 0, Sunday = 6
        weekday = date.weekday()
        day = date.day

        # Peak days: Mondays (0), Fridays (4), 15th, and 30th of month
        return weekday in [0, 4] or day in [15, 30]

    def get_customer_volume(self, date: datetime.date, branch_name: str) -> int:
        """Get expected customer volume for a given date and branch (with realistic variations)"""
        # Create branch-specific seed for consistent but different patterns
        branch_seed = hash(branch_name + date.strftime("%Y-%m-%d")) % 1000
        random.seed(branch_seed)

        # Branch-specific performance factors (some branches are busier than others)
        branch_performance_factor = (hash(branch_name) % 100) / 100.0  # 0.0 to 1.0

        base_volume = 190  # Standard volume
        peak_volume = 310  # Peak volume

        # Apply branch-specific variation (±20%)
        branch_variation = 0.8 + (branch_performance_factor * 0.4)  # 0.8 to 1.2

        if self.is_peak_day(date):
            # Peak day with some variation (85-110% of peak volume)
            volume = int(peak_volume * random.uniform(0.85, 1.10) * branch_variation)
        else:
            # Normal day with more variation (70-115% of base volume)
            volume = int(base_volume * random.uniform(0.70, 1.15) * branch_variation)

        # Reset random seed to maintain randomness for other operations
        random.seed()

        return max(90, volume)  # Minimum 90 customers per day

    def get_branch_performance_factor(self, branch_name: str) -> float:
        """Get branch-specific performance factor that affects transaction times"""
        # Create consistent but varied performance factors for each branch
        branch_hash = hash(branch_name) % 1000
        np.random.seed(branch_hash)

        # Generate performance factor: 0.7 to 1.3 (some branches are faster/slower)
        performance_factor = 0.7 + (np.random.random() * 0.6)

        # Reset seed
        np.random.seed(None)

        return performance_factor

    def generate_transaction_id(self, customer_num: int, is_bulk: bool, date: datetime.date, branch_name: str) -> str:
        """Generate transaction ID format: BranchInitials + Date + CustomerType + Number"""
        # Get branch initials (first 3 characters, uppercase)
        branch_initials = branch_name.replace(" ", "")[:3].upper()
        date_str = date.strftime("%m%d")
        transaction_type = "B" if is_bulk else "N"
        return f"{branch_initials}{date_str}{transaction_type}{customer_num:03d}"

    def get_random_transaction_type(self) -> str:
        """Get random transaction type based on weights"""
        types = list(self.transaction_config.keys())
        weights = [self.transaction_config[t]['weight'] for t in types]
        return random.choices(types, weights=weights)[0]

    def get_waiting_processing_time(self, transaction_type: str, is_peak: bool, branch_name: str = None) -> Tuple[
        int, int]:
        """Get waiting and processing time for a transaction with quality control and branch variation"""
        config = self.transaction_config[transaction_type]
        period = 'peak' if is_peak else 'normal'

        # Determine if this transaction is "good" or "bad" based on percentage
        is_good = random.random() < self.good_data_percentage / 100.0

        if is_good:
            # Good data: use the 'good' range
            waiting_min, waiting_max = config['waiting_time'][period]['good']
            processing_min, processing_max = config['processing_time'][period]['good']
        else:
            # Bad data: use the 'bad' range
            waiting_min, waiting_max = config['waiting_time'][period]['bad']
            processing_min, processing_max = config['processing_time'][period]['bad']

        # Apply dispersion factor to spread the data
        waiting_range = waiting_max - waiting_min
        processing_range = processing_max - processing_min

        # Use normal distribution for more realistic spread
        waiting_time = int(waiting_min + (random.gauss(0.5, 0.2) * waiting_range * self.data_dispersion))
        processing_time = int(processing_min + (random.gauss(0.5, 0.2) * processing_range * self.data_dispersion))

        # Apply branch-specific performance factor if branch name provided
        if branch_name:
            performance_factor = self.get_branch_performance_factor(branch_name)
            waiting_time = int(waiting_time * performance_factor)
            processing_time = int(processing_time * performance_factor)

        # Ensure minimum values
        waiting_time = max(1, waiting_time)
        processing_time = max(1, processing_time)

        return waiting_time, processing_time

    def generate_sentiment(self, total_time: int, is_good_transaction: bool = None) -> Tuple[str, float, str]:
        """Generate sentiment based on transaction time and quality control"""
        # If is_good_transaction is provided, use it; otherwise determine based on time
        if is_good_transaction is None:
            # Determine if this should be a good transaction based on percentage
            is_good_transaction = random.random() < self.good_data_percentage / 100.0

        if is_good_transaction:
            # Good transaction: higher sentiment scores
            if total_time <= 8:
                base_score = random.uniform(4.0, 5.0)  # Excellent
            elif total_time <= 15:
                base_score = random.uniform(3.5, 4.5)  # Very good
            elif total_time <= 25:
                base_score = random.uniform(3.0, 4.0)  # Good
            else:
                base_score = random.uniform(2.5, 3.5)  # Acceptable
        else:
            # Bad transaction: lower sentiment scores
            if total_time <= 10:
                base_score = random.uniform(2.5, 3.5)  # Neutral to slightly positive
            elif total_time <= 20:
                base_score = random.uniform(2.0, 3.0)  # Neutral
            elif total_time <= 30:
                base_score = random.uniform(1.5, 2.5)  # Slightly negative
            else:
                base_score = random.uniform(1.0, 2.0)  # Negative

        # Add controlled randomness based on dispersion
        variation = random.gauss(0, 0.3) * self.data_dispersion
        sentiment_score = max(1.0, min(5.0, base_score + variation))

        # Determine sentiment category
        if sentiment_score < 2:
            sentiment = "negative"
        elif sentiment_score < 3:
            sentiment = "neutral"
        else:
            sentiment = "positive"

        # Get random review text for this sentiment
        review_text = ""
        if self.review_samples and sentiment in self.review_samples:
            if self.review_samples[sentiment]:
                review_text = random.choice(self.review_samples[sentiment])

        return sentiment, round(sentiment_score, 2), review_text

    def generate_daily_transactions_for_branch(self, date: datetime.date, branch_name: str) -> List[Dict]:
        """Generate all transactions for a specific date and branch"""
        is_peak = self.is_peak_day(date)
        customer_volume = self.get_customer_volume(date, branch_name)

        transactions = []
        normal_counter = 1
        bulk_counter = 1

        print(f"  └─ {branch_name}: {customer_volume} transactions ({'Peak' if is_peak else 'Normal'} day)")

        for _ in range(customer_volume):
            # Determine if this is a bulk transaction (10% chance)
            is_bulk = random.random() < 0.20

            # Generate customer ID based on transaction type with sequential numbering
            if is_bulk:
                customer_id = f"B{bulk_counter:03d}"
                transaction_id = self.generate_transaction_id(bulk_counter, True, date, branch_name)
                bulk_counter += 1
            else:
                customer_id = f"N{normal_counter:03d}"
                transaction_id = self.generate_transaction_id(normal_counter, False, date, branch_name)
                normal_counter += 1

            # Get transaction type and times
            transaction_type = self.get_random_transaction_type()
            waiting_time, processing_time = self.get_waiting_processing_time(transaction_type, is_peak, branch_name)
            transaction_time = waiting_time + processing_time

            # Determine if this is a good transaction for consistency
            is_good_transaction = random.random() < self.good_data_percentage / 100.0

            # Generate sentiment and review with consistent quality
            sentiment, sentiment_score, review_text = self.generate_sentiment(transaction_time, is_good_transaction)

            transaction = {
                'transaction_id': transaction_id,
                'customer_id': customer_id,
                'branch_name': branch_name,
                'transaction_type': transaction_type,
                'waiting_time': waiting_time,
                'processing_time': processing_time,
                'transaction_time': transaction_time,
                'date': date.strftime('%Y-%m-%d'),
                'sentiment': sentiment,
                'sentiment_score': sentiment_score,
                'review_text': review_text,
                'bhs': ''
            }

            transactions.append(transaction)

        return transactions

    def generate_all_transactions_mixed(self, start_date: datetime.date, days: int) -> List[Dict]:
        """Generate all transactions for date range with mixed branch order (not sequential by branch)"""
        all_transactions = []

        print(f"Generating mixed transactions for {days} days across {len(self.branches)} branches...")

        for day_num in range(days):
            current_date = start_date + datetime.timedelta(days=day_num)
            print(f"Day {day_num + 1}/{days} - {current_date}:")

            # Generate transactions for each branch separately first
            daily_branch_transactions = {}
            total_daily = 0

            for branch in self.branches:
                branch_transactions = self.generate_daily_transactions_for_branch(current_date, branch)
                daily_branch_transactions[branch] = branch_transactions
                total_daily += len(branch_transactions)

            # Mix all branch transactions randomly
            mixed_daily_transactions = []
            branch_indices = {branch: 0 for branch in self.branches}
            branch_lengths = {branch: len(daily_branch_transactions[branch]) for branch in self.branches}

            # Create a mixed order by randomly selecting from available branches
            while len(mixed_daily_transactions) < total_daily:
                # Get branches that still have transactions
                available_branches = [branch for branch in self.branches
                                      if branch_indices[branch] < branch_lengths[branch]]

                if not available_branches:
                    break

                # Randomly select a branch
                selected_branch = random.choice(available_branches)

                # Add next transaction from selected branch
                transaction = daily_branch_transactions[selected_branch][branch_indices[selected_branch]]
                mixed_daily_transactions.append(transaction)
                branch_indices[selected_branch] += 1

            all_transactions.extend(mixed_daily_transactions)
            print(f"  Mixed {total_daily} transactions from all branches")

        print(f"Total mixed transactions generated: {len(all_transactions)}")
        return all_transactions

    def generate_daily_transactions_all_branches(self, date: datetime.date) -> List[Dict]:
        """Generate all transactions for all branches on a specific date"""
        all_transactions = []

        for branch in self.branches:
            branch_transactions = self.generate_daily_transactions_for_branch(date, branch)
            all_transactions.extend(branch_transactions)

        return all_transactions

    def generate_date_range_data(self, start_date: datetime.date, end_date: datetime.date) -> pd.DataFrame:
        """Generate transaction data for a date range across all branches"""
        all_transactions = []
        current_date = start_date

        total_days = (end_date - start_date).days + 1
        print(
            f"Generating data for {total_days} days ({start_date} to {end_date}) across {len(self.branches)} branches\n")

        day_counter = 1
        while current_date <= end_date:
            print(f"Day {day_counter}/{total_days}:")
            daily_transactions = self.generate_daily_transactions_all_branches(current_date)
            all_transactions.extend(daily_transactions)

            current_date += datetime.timedelta(days=1)
            day_counter += 1

        print(f"Total transactions generated: {len(all_transactions)}")
        return pd.DataFrame(all_transactions)

    def check_existing_data_dates(self, worksheet_name: str = "Sheet1") -> set:
        """Check what dates already exist in the Google Sheet"""
        if not self.gc:
            return set()

        try:
            sheet = self.gc.open_by_key(self.sheet_id)
            worksheet = sheet.worksheet(worksheet_name)

            # Get all data
            all_data = worksheet.get_all_values()
            if len(all_data) <= 1:  # Only headers or empty
                return set()

            # Find the date column index (assuming it's named 'date')
            headers = all_data[0]
            if 'date' not in headers:
                print("Warning: 'date' column not found in existing data")
                return set()

            date_col_index = headers.index('date')
            existing_dates = set()

            # Extract dates from all rows (skip header)
            for row in all_data[1:]:
                if len(row) > date_col_index and row[date_col_index]:
                    existing_dates.add(row[date_col_index])

            print(f"Found existing data for {len(existing_dates)} dates in Google Sheets")
            return existing_dates

        except Exception as e:
            print(f"Error checking existing dates: {e}")
            return set()

    def generate_with_realtime_streaming(self, start_date: datetime.date, days: int,
                                         frequency_seconds: int = 1, records_per_interval: int = 5) -> pd.DataFrame:
        """Generate and stream data in real-time batches to Google Sheets (APPEND MODE ONLY)"""
        print(f"Starting real-time streaming generation:")
        print(f"  Date range: {start_date} to {start_date + datetime.timedelta(days=days - 1)}")
        print(f"  Frequency: Every {frequency_seconds} seconds")
        print(f"  Records per interval: {records_per_interval}")
        print(f"  Total days: {days}")
        print(f"  Branches: {len(self.branches)}")
        print("-" * 50)

        # Check for existing data in Google Sheets to avoid duplicates
        existing_dates = self.check_existing_data_dates() if self.gc else set()

        # Filter out dates that already exist
        dates_to_generate = []
        for day_num in range(days):
            current_date = start_date + datetime.timedelta(days=day_num)
            date_str = current_date.strftime('%Y-%m-%d')
            if date_str not in existing_dates:
                dates_to_generate.append(current_date)
            else:
                print(f"⏭️  Skipping {date_str} - already exists in Google Sheets")

        if not dates_to_generate:
            print("🔄 All requested dates already exist in Google Sheets. No new data to generate.")
            # Still return existing data for display purposes
            return pd.DataFrame()

        print(f"📅 Will generate data for {len(dates_to_generate)} new dates")

        # Generate ALL transactions first (mixed order, not sequential by branch)
        all_transactions = []
        for date in dates_to_generate:
            print(f"Generating for {date}:")
            daily_transactions = self.generate_all_transactions_mixed(date, 1)
            all_transactions.extend(daily_transactions)

        total_transactions = len(all_transactions)
        if total_transactions == 0:
            print("No transactions to stream")
            return pd.DataFrame()

        # Calculate batch configuration
        batch_size = records_per_interval
        total_batches = (total_transactions + batch_size - 1) // batch_size  # Ceiling division

        print(f"\n📊 Streaming Configuration:")
        print(f"  Total transactions: {total_transactions:,}")
        print(f"  Records per batch: {batch_size}")
        print(f"  Total batches: {total_batches}")
        print(
            f"  Estimated time: {total_batches * frequency_seconds} seconds ({(total_batches * frequency_seconds) / 60:.1f} minutes)")
        print("-" * 50)

        streamed_transactions = []

        # Stream transactions in batches
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, total_transactions)
            batch = all_transactions[start_idx:end_idx]

            # Add batch to streamed transactions
            streamed_transactions.extend(batch)

            records_processed = len(streamed_transactions)
            percentage_complete = (records_processed / total_transactions) * 100

            print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Batch {batch_num + 1}/{total_batches}: "
                  f"{len(batch)} records added ({records_processed:,}/{total_transactions:,} - {percentage_complete:.1f}%)")

            # Show sample transactions from current batch
            if batch:
                print(
                    f"  Sample: {batch[0]['branch_name']} - {batch[0]['transaction_type']} - {batch[0]['customer_id']}")
                if len(batch) > 1:
                    print(
                        f"          {batch[-1]['branch_name']} - {batch[-1]['transaction_type']} - {batch[-1]['customer_id']}")

            # Upload current batch to Google Sheets if available (APPEND MODE ONLY)
            if self.gc:
                try:
                    # Convert only the new batch to DataFrame
                    batch_df = pd.DataFrame(batch)
                    self.upload_batch_to_sheets(batch_df, append_mode=True)  # ALWAYS APPEND
                    print(f"      ✅ Appended {len(batch)} records to Google Sheets")
                except Exception as e:
                    print(f"      ❌ Failed to append to Google Sheets: {e}")

            # Save progress periodically
            if (batch_num + 1) % 20 == 0 or batch_num == total_batches - 1:
                temp_df = pd.DataFrame(streamed_transactions)
                filename = f"bpi_realtime_progress_batch{batch_num + 1}_of_{total_batches}.csv"
                temp_df.to_csv(filename, index=False)
                print(f"      💾 Progress saved: {filename}")

            # Wait for next batch (except for last batch)
            if batch_num < total_batches - 1:
                time.sleep(frequency_seconds)

        print(f"\n🎉 Real-time streaming complete!")
        print(f"   Total transactions streamed: {len(streamed_transactions):,}")
        print(f"   Branches represented: {len(set(t['branch_name'] for t in streamed_transactions))}")
        print(f"   Total time taken: {total_batches * frequency_seconds} seconds")

        return pd.DataFrame(streamed_transactions)

    def upload_batch_to_sheets(self, df: pd.DataFrame, worksheet_name: str = "Sheet1",
                               append_mode: bool = True) -> bool:
        """Upload dataframe batch to Google Sheets with improved append logic"""
        if not self.gc:
            return False

        try:
            sheet = self.gc.open_by_key(self.sheet_id)

            try:
                worksheet = sheet.worksheet(worksheet_name)
            except gspread.WorksheetNotFound:
                worksheet = sheet.add_worksheet(title=worksheet_name, rows=50000, cols=15)

            # Check if worksheet is empty or needs headers
            existing_data = worksheet.get_all_values()
            is_empty = len(existing_data) == 0

            # Convert DataFrame to list of lists for upload
            data_to_upload = df.values.tolist()

            if is_empty:
                # First time upload - include headers
                headers = [df.columns.tolist()]
                all_data = headers + data_to_upload
                start_row = 1
            else:
                # Append mode - just add data without headers
                all_data = data_to_upload
                start_row = len(existing_data) + 1

            # Calculate the correct column range dynamically
            num_columns = len(df.columns)
            end_column = chr(ord('A') + num_columns - 1)  # Convert to letter (A, B, C... L)
            end_row = start_row + len(all_data) - 1
            range_name = f'A{start_row}:{end_column}{end_row}'

            # Upload the data
            worksheet.update(values=all_data, range_name=range_name)
            return True

        except Exception as e:
            raise Exception(f"Error uploading batch to Google Sheets: {e}")

    def upload_to_sheets(self, df: pd.DataFrame, worksheet_name: str = "Sheet1", append_mode: bool = False) -> bool:
        """Upload dataframe to Google Sheets with option to append or replace"""
        if not self.gc:
            print("No Google Sheets connection available")
            return False

        try:
            # Open the spreadsheet
            sheet = self.gc.open_by_key(self.sheet_id)

            try:
                # Try to open existing worksheet
                worksheet = sheet.worksheet(worksheet_name)
                if not append_mode:
                    # Clear existing data only if explicitly not appending
                    worksheet.clear()
            except gspread.WorksheetNotFound:
                # Create new worksheet if it doesn't exist
                worksheet = sheet.add_worksheet(title=worksheet_name, rows=10000, cols=15)

            if append_mode:
                # Check existing data to determine where to start appending
                existing_data = worksheet.get_all_values()
                start_row = len(existing_data) + 1 if existing_data else 1

                # Only add headers if worksheet is empty
                if len(existing_data) == 0:
                    data = [df.columns.tolist()] + df.values.tolist()
                    start_row = 1
                else:
                    data = df.values.tolist()
            else:
                # Replace mode - include headers
                data = [df.columns.tolist()] + df.values.tolist()
                start_row = 1

            # Update the worksheet in batches for large datasets
            batch_size = 1000
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                current_start_row = start_row + i
                end_row = current_start_row + len(batch) - 1

                # Calculate the correct column range based on actual data columns
                end_column = chr(ord('A') + len(df.columns) - 1)  # Dynamic column calculation
                range_name = f'A{current_start_row}:{end_column}{end_row}'

                # Use the new API format: values first, then range_name
                worksheet.update(values=batch, range_name=range_name)

                if len(data) > batch_size:
                    print(f"Uploaded batch {i // batch_size + 1}/{(len(data) - 1) // batch_size + 1}")

            action = "appended to" if append_mode else "uploaded to"
            print(f"Successfully {action} Google Sheets: {len(df)} transactions!")
            return True

        except Exception as e:
            print(f"Error uploading to Google Sheets: {e}")
            return False

    def save_to_csv(self, df: pd.DataFrame, filename: str = None):
        """Save dataframe to CSV file"""
        if filename is None:
            filename = f"bpi_transactions_{datetime.date.today().strftime('%Y%m%d')}.csv"

        df.to_csv(filename, index=False)
        print(f"Data saved to {filename}")

    def print_data_summary(self, df: pd.DataFrame):
        """Print summary statistics of generated data"""
        if df.empty:
            print("No data to summarize")
            return

        print(f"\n📊 Generated Data Summary:")
        print(f"   Total transactions: {len(df):,}")
        print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"   Branches: {df['branch_name'].nunique()}")

        print(f"\n⏱️  Time Statistics:")
        print(f"   Average waiting time: {df['waiting_time'].mean():.2f} minutes")
        print(f"   Average processing time: {df['processing_time'].mean():.2f} minutes")
        print(f"   Average total time: {df['transaction_time'].mean():.2f} minutes")
        print(f"   Waiting time std dev: {df['waiting_time'].std():.2f}")
        print(f"   Processing time std dev: {df['processing_time'].std():.2f}")

        print(f"\n😊 Sentiment Statistics:")
        print(f"   Average sentiment score: {df['sentiment_score'].mean():.2f}")
        print(f"   Sentiment distribution:")
        sentiment_counts = df['sentiment'].value_counts()
        for sentiment, count in sentiment_counts.items():
            percentage = (count / len(df)) * 100
            print(f"     {sentiment}: {count:,} ({percentage:.1f}%)")

        print(f"\n🏦 Transaction Types:")
        type_counts = df['transaction_type'].value_counts()
        for ttype, count in type_counts.items():
            percentage = (count / len(df)) * 100
            print(f"     {ttype}: {count:,} ({percentage:.1f}%)")

        print(f"\n📈 Branch Performance (Top 5 by avg transaction time):")
        branch_stats = df.groupby('branch_name').agg({
            'transaction_time': ['mean', 'count'],
            'sentiment_score': 'mean'
        }).round(2)
        branch_stats.columns = ['avg_time', 'transactions', 'avg_sentiment']
        branch_stats = branch_stats.sort_values('avg_time')

        for i, (branch, stats) in enumerate(branch_stats.head().iterrows()):
            print(
                f"     {i + 1}. {branch}: {stats['avg_time']}min, {stats['transactions']} txns, {stats['avg_sentiment']} sentiment")

        print(f"\n🎯 Data Quality Achieved:")
        good_transactions = len(df[df['sentiment_score'] >= 3.5])
        bad_transactions = len(df[df['sentiment_score'] < 3.0])
        actual_good_percentage = (good_transactions / len(df)) * 100
        actual_bad_percentage = (bad_transactions / len(df)) * 100

        print(f"   Target good data: {self.good_data_percentage:.1f}%")
        print(f"   Actual good data: {actual_good_percentage:.1f}%")
        print(f"   Actual bad data: {actual_bad_percentage:.1f}%")
        print(f"   Dispersion factor used: {self.data_dispersion}")


def get_user_input():
    """Interactive function to get user preferences"""
    print("=== BPI Transaction Generator ===\n")

    # Get branch CSV file
    branch_file = input("Enter branch CSV filename (default: branch.csv): ").strip()
    if not branch_file:
        branch_file = "branch.csv"

    # Get data quality parameters
    print("\n📊 Data Quality Configuration:")
    print("Dispersion Factor: Controls how spread out the data is")
    print("  - 0.5: Tight data (similar values)")
    print("  - 1.0: Normal spread (default)")
    print("  - 2.0: Very spread out data")

    dispersion = input("Enter dispersion factor (0.5-2.0, default: 1.0): ").strip()
    try:
        dispersion = float(dispersion) if dispersion else 1.0
        dispersion = max(0.5, min(2.0, dispersion))
    except ValueError:
        dispersion = 1.0
        print("Invalid input, using default: 1.0")

    print(f"\nGood Data Percentage: Percentage of transactions that should be 'good' (fast, high sentiment)")
    print("  - 50%: Equal good/bad data")
    print("  - 70%: Mostly good data (default)")
    print("  - 90%: Almost all good data")

    good_percentage = input("Enter good data percentage (50-90, default: 70): ").strip()
    try:
        good_percentage = float(good_percentage) if good_percentage else 70.0
        good_percentage = max(50.0, min(90.0, good_percentage))
    except ValueError:
        good_percentage = 70.0
        print("Invalid input, using default: 70%")

    # Get generation mode
    print("\nGeneration Options:")
    print("1. Generate specific date range (all at once)")
    print("2. Generate with real-time streaming")
    print("3. Generate for today only")

    mode = input("Choose option (1-3): ").strip()

    if mode == "1":
        # Date range mode
        start_date_str = input("Enter start date (YYYY-MM-DD) or press Enter for today: ").strip()
        if not start_date_str:
            start_date = datetime.date.today()
        else:
            start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()

        days = int(input("Enter number of days to generate: "))
        end_date = start_date + datetime.timedelta(days=days - 1)

        return {
            'mode': 'range',
            'branch_file': branch_file,
            'start_date': start_date,
            'end_date': end_date,
            'days': days,
            'dispersion': dispersion,
            'good_percentage': good_percentage
        }

    elif mode == "2":
        # Real-time streaming mode
        start_date_str = input("Enter start date (YYYY-MM-DD) or press Enter for today: ").strip()
        if not start_date_str:
            start_date = datetime.date.today()
        else:
            start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()

        days = int(input("Enter number of days to generate: "))
        frequency = int(input("Enter frequency in seconds (1-10, default: 1): ") or "1")
        records_per_interval = int(input("Enter number of records per interval (1-50, default: 5): ") or "5")

        return {
            'mode': 'realtime',
            'branch_file': branch_file,
            'start_date': start_date,
            'days': days,
            'frequency': frequency,
            'records_per_interval': records_per_interval,
            'dispersion': dispersion,
            'good_percentage': good_percentage
        }

    else:
        # Today only
        return {
            'mode': 'today',
            'branch_file': branch_file,
            'start_date': datetime.date.today(),
            'days': 1,
            'dispersion': dispersion,
            'good_percentage': good_percentage
        }


def main():
    # Your Google Sheet ID
    SHEET_ID = "1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc"

    # Get user preferences
    config = get_user_input()

    # Initialize the generator with data quality parameters
    generator = BPITransactionGenerator(
        SHEET_ID,
        credentials_path="trashscan-450913-eb9189146693.json",
        data_dispersion=config['dispersion'],
        good_data_percentage=config['good_percentage']
    )

    # Load branches from CSV
    if not generator.load_branches(config['branch_file']):
        print("Failed to load branches. Exiting...")
        return

    # Load review samples
    if not generator.load_review_samples():
        print("⚠️  Warning: Failed to load review samples. Review text will be empty.")
        proceed = input("Continue anyway? (y/n): ").strip().lower()
        if proceed != 'y':
            print("Exiting...")
            return

    # Generate data based on mode
    if config['mode'] == 'today':
        print(f"\nGenerating data for today ({config['start_date']})...")
        today_transactions = generator.generate_all_transactions_mixed(config['start_date'], 1)
        df = pd.DataFrame(today_transactions)

    elif config['mode'] == 'range':
        print(f"\nGenerating data for date range...")
        df = generator.generate_date_range_data(config['start_date'], config['end_date'])

    elif config['mode'] == 'realtime':
        print(f"\nStarting real-time streaming generation...")
        if not generator.gc:
            print("⚠️  Warning: No Google Sheets connection. Real-time streaming will only save to CSV.")
            proceed = input("Continue anyway? (y/n): ").strip().lower()
            if proceed != 'y':
                print("Exiting...")
                return

        df = generator.generate_with_realtime_streaming(
            config['start_date'],
            config['days'],
            config['frequency'],
            config['records_per_interval']
        )

    # Save results
    filename = f"bpi_transactions_{config['start_date'].strftime('%Y%m%d')}_{len(df)}records.csv"
    generator.save_to_csv(df, filename)

    # Print detailed summary
    generator.print_data_summary(df)

    # Upload to Google Sheets if available and not in realtime mode (realtime already uploads)
    if generator.gc and config['mode'] != 'realtime':
        upload_choice = input("\nUpload to Google Sheets? (y/n/a - where 'a' means append): ").strip().lower()
        if upload_choice in ['y', 'a']:
            append_mode = upload_choice == 'a'
            action = "append to" if append_mode else "replace data in"
            print(f"Will {action} Google Sheets...")
            generator.upload_to_sheets(df, append_mode=append_mode)

    print(f"\n✅ Generation complete!")
    print(f"   Total records: {len(df):,}")
    print(
        f"   Date range: {config['start_date']} to {config['start_date'] + datetime.timedelta(days=config['days'] - 1)}")
    print(f"   Branches: {len(generator.branches)}")
    print(f"   File saved: {filename}")


if __name__ == "__main__":
    main()