# BPI Transaction Generator - Railway Deployment

This project is set up for automated continuous generation of BPI transaction data with real-time Google Sheets integration using Railway.

## Quick Start

1. Create a new project on [Railway](https://railway.app/)
2. Connect this repository to your Railway project
3. Set the required environment variables
4. Deploy!

## Environment Variables

Configure the following environment variables in your Railway project settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_SHEET_ID` | Your Google Sheets ID | "1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc" |
| `GOOGLE_CREDENTIALS_PATH` | Path to Google service account JSON | "trashscan-450913-8d2548518ddc.json" |
| `BRANCH_FILE` | Path to branch CSV file | "branch.csv" |
| `REVIEWS_FILE` | Path to review samples CSV | "bpi_review_samples.csv" |
| `DATA_DISPERSION` | Controls data spread (0.5=tight, 2.0=spread) | "1.0" |
| `GOOD_DATA_PERCENTAGE` | Percentage of "good" transactions | "70.0" |
| `FREQUENCY_SECONDS` | Seconds between batch uploads | "1" |
| `RECORDS_PER_INTERVAL` | Records per batch | "5" |
| `DAYS_TO_GENERATE` | Number of days to generate data for | "1" |
| `START_DATE` | Starting date (YYYY-MM-DD) | Today's date |

## Files

- `generate.py` - Core data generation logic
- `railway_run.py` - Railway entry point script
- `trashscan-450913-8d2548518ddc.json` - Google service account credentials
- `branch.csv` - Branch data
- `bpi_review_samples.csv` - Sample review texts for generation

## Features

- Generates realistic transaction data
- Streams data to Google Sheets in real-time
- Continues running even if browser is closed
- Customizable parameters via environment variables
- Automatic CSV backups during execution

## Deployment Instructions

### 1. Setup Railway Project

1. Sign up for [Railway](https://railway.app/)
2. Create a new project
3. Choose "Deploy from GitHub repo"
4. Connect to your GitHub repository containing this code
5. Railway will automatically detect the Procfile

### 2. Configure Environment Variables

In Railway dashboard:
1. Go to your project
2. Click "Variables"
3. Add the environment variables listed above
4. Adjust values as needed for your specific requirements

### 3. Deploy

1. Click "Deploy" in the Railway dashboard
2. Wait for the build and deployment to complete
3. Check logs to verify the script is running

## Security Notes

- The Google service account credentials are included in the repository. In a production environment, you should use Railway's secret management to secure these credentials.
- Make sure your Google Sheet permissions are properly configured to allow the service account to write to it.

## Troubleshooting

- **Script fails to connect to Google Sheets**: Verify your credentials and Sheet ID
- **Missing data**: Check the log output for any errors during generation
- **Container restarts**: Ensure your Railway account has sufficient resources for continuous operation
