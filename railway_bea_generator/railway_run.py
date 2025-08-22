import os
import random
import datetime
import time
import pandas as pd
from generate import BPITransactionGenerator

def railway_main():
    """
    Main function for Railway deployment - runs continuously to generate and stream 
    transaction data to Google Sheets
    """
    # Get configuration from environment variables or use defaults
    SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc")
    CREDENTIALS_PATH = os.environ.get("GOOGLE_CREDENTIALS_PATH", "trashscan-450913-eb9189146693.json")
    BRANCH_FILE = os.environ.get("BRANCH_FILE", "branch.csv")
    REVIEWS_FILE = os.environ.get("REVIEWS_FILE", "bpi_review_samples.csv")
    
    # Data generation parameters
    DATA_DISPERSION = float(os.environ.get("DATA_DISPERSION", "1.0"))
    GOOD_DATA_PERCENTAGE = float(os.environ.get("GOOD_DATA_PERCENTAGE", "70.0"))
    
    # Streaming parameters
    FREQUENCY_SECONDS = int(os.environ.get("FREQUENCY_SECONDS", "1"))
    RECORDS_PER_INTERVAL = int(os.environ.get("RECORDS_PER_INTERVAL", "5"))
    DAYS_TO_GENERATE = int(os.environ.get("DAYS_TO_GENERATE", "1"))
    START_DATE_STR = os.environ.get("START_DATE", datetime.date.today().strftime("%Y-%m-%d"))
    
    try:
        START_DATE = datetime.datetime.strptime(START_DATE_STR, "%Y-%m-%d").date()
    except ValueError:
        print(f"Invalid START_DATE format: {START_DATE_STR}. Using today's date.")
        START_DATE = datetime.date.today()

    print("=" * 50)
    print("Railway BPI Transaction Generator")
    print("=" * 50)
    print(f"Starting with configuration:")
    print(f"- Sheet ID: {SHEET_ID}")
    print(f"- Start Date: {START_DATE}")
    print(f"- Days to Generate: {DAYS_TO_GENERATE}")
    print(f"- Frequency: {FREQUENCY_SECONDS} seconds")
    print(f"- Records per Interval: {RECORDS_PER_INTERVAL}")
    print(f"- Data Dispersion: {DATA_DISPERSION}")
    print(f"- Good Data Percentage: {GOOD_DATA_PERCENTAGE}%")
    print("=" * 50)

    # Initialize the generator with data quality parameters
    generator = BPITransactionGenerator(
        SHEET_ID, 
        credentials_path=CREDENTIALS_PATH,
        data_dispersion=DATA_DISPERSION,
        good_data_percentage=GOOD_DATA_PERCENTAGE
    )

    # Load branches from CSV
    if not generator.load_branches(BRANCH_FILE):
        print("Failed to load branches. Exiting...")
        return

    # Load review samples
    if not generator.load_review_samples(REVIEWS_FILE):
        print("⚠️  Warning: Failed to load review samples. Review text will be empty.")

    print("\nStarting real-time streaming generation...")
    
    # Generate and stream data
    df = generator.generate_with_realtime_streaming(
        START_DATE,
        DAYS_TO_GENERATE,
        FREQUENCY_SECONDS,
        RECORDS_PER_INTERVAL
    )

    # After completion, save final CSV
    filename = f"bpi_transactions_{START_DATE.strftime('%Y%m%d')}_{len(df)}records.csv"
    generator.save_to_csv(df, filename)

    # Print summary
    generator.print_data_summary(df)
    
    print("\n✅ Data generation completed!")
    print("=" * 50)
    
    # Keep the process running (optional, depends on your requirements)
    print("Process completed. Sleeping to keep container alive.")
    
    # Keep process running forever or until stopped
    while True:
        time.sleep(3600)  # Sleep for an hour

if __name__ == "__main__":
    railway_main()
