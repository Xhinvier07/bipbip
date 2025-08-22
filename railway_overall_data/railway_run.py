import os
import time
import datetime
from compute import BPIBranchHealthCalculator

def railway_main():
    """
    Main function for Railway deployment - runs continuously to calculate 
    branch health metrics and update Google Sheets
    """
    # Get configuration from environment variables or use defaults
    SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc")
    CREDENTIALS_PATH = os.environ.get("GOOGLE_CREDENTIALS_PATH", "trashscan-450913-eb9189146693.json")
    
    # Update interval in seconds
    UPDATE_INTERVAL = int(os.environ.get("UPDATE_INTERVAL", "30"))

    print("=" * 60)
    print("Railway BPI Branch Health Calculator")
    print("=" * 60)
    print(f"Starting with configuration:")
    print(f"- Sheet ID: {SHEET_ID}")
    print(f"- Update Interval: {UPDATE_INTERVAL} seconds")
    print(f"- Started at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Initialize calculator
    try:
        calculator = BPIBranchHealthCalculator(SHEET_ID, CREDENTIALS_PATH)
    except Exception as e:
        print(f"❌ Failed to initialize calculator: {e}")
        print("Retrying in 30 seconds...")
        time.sleep(30)
        return railway_main()  # Retry initialization

    print(f"\n🎯 Starting continuous monitoring...")
    
    # Run continuous monitoring
    calculator.run_continuous_monitoring(UPDATE_INTERVAL)

    # This code shouldn't be reached under normal conditions
    # because run_continuous_monitoring runs an infinite loop
    print("❌ Monitoring stopped unexpectedly")
    print("Restarting in 30 seconds...")
    time.sleep(30)
    return railway_main()  # Restart if the loop exits unexpectedly

if __name__ == "__main__":
    # Initial delay to ensure services are fully started
    print("Waiting 10 seconds for services to initialize...")
    time.sleep(10)
    
    # Start the main process
    railway_main()
