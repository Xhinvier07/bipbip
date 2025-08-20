import random
import datetime
import gspread
from google.oauth2.service_account import Credentials
import pandas as pd
import time
import os
from typing import Dict, List, Tuple, Optional


class BPITransactionGenerator:
    def __init__(self, sheet_id: str, credentials_path: str = None):
        self.sheet_id = sheet_id
        self.branches = []  # Will be loaded from CSV
        self.review_samples = {}  # Will be loaded from review CSV

        # Transaction type configurations with weights (higher = more frequent)
        self.transaction_config = {
            'withdrawal': {
                'weight': 30,
                'waiting_time': {'normal': (2, 5), 'peak': (8, 15)},
                'processing_time': {'normal': (2, 4), 'peak': (3, 6)}
            },
            'deposit': {
                'weight': 25,
                'waiting_time': {'normal': (3, 7), 'peak': (10, 20)},
                'processing_time': {'normal': (3, 6), 'peak': (5, 8)}
            },
            'encashment': {
                'weight': 15,
                'waiting_time': {'normal': (4, 8), 'peak': (12, 25)},
                'processing_time': {'normal': (4, 7), 'peak': (6, 10)}
            },
            'transfer': {
                'weight': 12,
                'waiting_time': {'normal': (3, 6), 'peak': (8, 15)},
                'processing_time': {'normal': (3, 5), 'peak': (4, 7)}
            },
            'customer service': {
                'weight': 8,
                'waiting_time': {'normal': (5, 12), 'peak': (15, 25)},
                'processing_time': {'normal': (7, 15), 'peak': (10, 20)}
            },
            'account service': {
                'weight': 6,
                'waiting_time': {'normal': (8, 15), 'peak': (15, 30)},
                'processing_time': {'normal': (10, 20), 'peak': (15, 25)}
            },
            'loan': {
                'weight': 4,
                'waiting_time': {'normal': (10, 20), 'peak': (20, 40)},
                'processing_time': {'normal': (15, 30), 'peak': (20, 45)}
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

        base_volume = 190  # Standard volume
        peak_volume = 310  # Peak volume

        if self.is_peak_day(date):
            # Peak day with some variation (85-110% of peak volume)
            volume = int(peak_volume * random.uniform(0.85, 1.10))
        else:
            # Normal day with more variation (70-115% of base volume)
            volume = int(base_volume * random.uniform(0.70, 1.15))

        # Reset random seed to maintain randomness for other operations
        random.seed()

        return max(90, volume)  # Minimum 90 customers per day

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

    def get_waiting_processing_time(self, transaction_type: str, is_peak: bool) -> Tuple[int, int]:
        """Get waiting and processing time for a transaction"""
        config = self.transaction_config[transaction_type]
        period = 'peak' if is_peak else 'normal'

        waiting_min, waiting_max = config['waiting_time'][period]
        processing_min, processing_max = config['processing_time'][period]

        waiting_time = random.randint(waiting_min, waiting_max)
        processing_time = random.randint(processing_min, processing_max)

        return waiting_time, processing_time

    def generate_sentiment(self, total_time: int) -> Tuple[str, float, str]:
        """Generate sentiment based on transaction time and get corresponding review text"""
        # Base sentiment score influenced by total time
        if total_time <= 10:
            base_score = random.uniform(3.5, 5.0)
        elif total_time <= 20:
            base_score = random.uniform(2.5, 4.0)
        else:
            base_score = random.uniform(1.0, 3.0)

        # Add some randomness for realistic variation
        sentiment_score = max(1.0, min(5.0, base_score + random.uniform(-0.5, 0.5)))

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
            waiting_time, processing_time = self.get_waiting_processing_time(transaction_type, is_peak)
            transaction_time = waiting_time + processing_time

            # Generate sentiment and review
            sentiment, sentiment_score, review_text = self.generate_sentiment(transaction_time)

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

    def generate_with_realtime_streaming(self, start_date: datetime.date, days: int,
                                         frequency_seconds: int = 1, records_per_interval: int = 5) -> pd.DataFrame:
        """Generate and stream data in real-time batches to Google Sheets"""
        print(f"Starting real-time streaming generation:")
        print(f"  Date range: {start_date} to {start_date + datetime.timedelta(days=days - 1)}")
        print(f"  Frequency: Every {frequency_seconds} seconds")
        print(f"  Records per interval: {records_per_interval}")
        print(f"  Total days: {days}")
        print(f"  Branches: {len(self.branches)}")
        print("-" * 50)

        # Generate ALL transactions first (mixed order, not sequential by branch)
        all_transactions = self.generate_all_transactions_mixed(start_date, days)
        total_transactions = len(all_transactions)

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

            # Upload current state to Google Sheets if available
            if self.gc:
                try:
                    current_df = pd.DataFrame(streamed_transactions)
                    self.upload_batch_to_sheets(current_df, append_mode=False)
                    print(f"      ✅ Uploaded to Google Sheets (Total: {len(streamed_transactions):,} records)")
                except Exception as e:
                    print(f"      ❌ Failed to upload to Google Sheets: {e}")

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
        """Upload dataframe batch to Google Sheets"""
        if not self.gc:
            return False

        try:
            sheet = self.gc.open_by_key(self.sheet_id)

            try:
                worksheet = sheet.worksheet(worksheet_name)
                if not append_mode:
                    worksheet.clear()
            except gspread.WorksheetNotFound:
                worksheet = sheet.add_worksheet(title=worksheet_name, rows=50000,
                                                cols=15)  # Increased columns for more data

            # Convert DataFrame to list of lists for upload
            if not append_mode or worksheet.row_count <= 1:
                # Include headers if starting fresh
                data = [df.columns.tolist()] + df.values.tolist()
                start_row = 1
            else:
                # Append without headers
                data = df.values.tolist()
                start_row = worksheet.row_count + 1

            # Calculate the correct column range dynamically
            num_columns = len(df.columns)
            end_column = chr(ord('A') + num_columns - 1)  # Convert to letter (A, B, C... L)
            end_row = start_row + len(data) - 1
            range_name = f'A{start_row}:{end_column}{end_row}'

            # Use the new API format: values first, then range_name
            if not append_mode:
                # Replace all data
                worksheet.update(values=data, range_name=range_name)
            else:
                # Append data
                new_data = df.values.tolist()
                worksheet.update(values=new_data, range_name=range_name)

            return True

        except Exception as e:
            raise Exception(f"Error uploading batch to Google Sheets: {e}")

    def upload_to_sheets(self, df: pd.DataFrame, worksheet_name: str = "Sheet1") -> bool:
        """Upload dataframe to Google Sheets"""
        if not self.gc:
            print("No Google Sheets connection available")
            return False

        try:
            # Open the spreadsheet
            sheet = self.gc.open_by_key(self.sheet_id)

            try:
                # Try to open existing worksheet
                worksheet = sheet.worksheet(worksheet_name)
                # Clear existing data
                worksheet.clear()
            except gspread.WorksheetNotFound:
                # Create new worksheet if it doesn't exist
                worksheet = sheet.add_worksheet(title=worksheet_name, rows=10000, cols=10)

            # Convert DataFrame to list of lists for upload
            data = [df.columns.tolist()] + df.values.tolist()

            # Update the worksheet in batches for large datasets
            batch_size = 1000
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                start_row = i + 1
                end_row = start_row + len(batch) - 1

                # Calculate the correct column range based on actual data columns (12 columns: A to L)
                end_column = chr(ord('A') + len(df.columns) - 1)  # Dynamic column calculation
                range_name = f'A{start_row}:{end_column}{end_row}'

                # Use the new API format: values first, then range_name
                worksheet.update(values=batch, range_name=range_name)

                if len(data) > batch_size:
                    print(f"Uploaded batch {i // batch_size + 1}/{(len(data) - 1) // batch_size + 1}")

            print(f"Successfully uploaded {len(df)} transactions to Google Sheets!")
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


def get_user_input():
    """Interactive function to get user preferences"""
    print("=== BPI Transaction Generator ===\n")

    # Get branch CSV file
    branch_file = input("Enter branch CSV filename (default: branch.csv): ").strip()
    if not branch_file:
        branch_file = "branch.csv"

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
            'days': days
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
            'records_per_interval': records_per_interval
        }

    else:
        # Today only
        return {
            'mode': 'today',
            'branch_file': branch_file,
            'start_date': datetime.date.today(),
            'days': 1
        }


def main():
    # Your Google Sheet ID
    SHEET_ID = "1_OBma2uuzISl-5-5OTw3zsx5uWt_K3JfxxgehRfvquA"

    # Get user preferences
    config = get_user_input()

    # Initialize the generator
    generator = BPITransactionGenerator(SHEET_ID, credentials_path="trashscan-450913-8d2548518ddc.json")  # Add your credentials path here

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
    elif config['mode'] == 'today':
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

    # Upload to Google Sheets if available
    if generator.gc:
        upload = input("\nUpload to Google Sheets? (y/n): ").strip().lower()
        if upload == 'y':
            generator.upload_to_sheets(df)

    print(f"\n✅ Generation complete!")
    print(f"   Total records: {len(df):,}")
    print(
        f"   Date range: {config['start_date']} to {config['start_date'] + datetime.timedelta(days=config['days'] - 1)}")
    print(f"   Branches: {len(generator.branches)}")
    print(f"   File saved: {filename}")


if __name__ == "__main__":
    main()