# BPI Branch Health Calculator - Railway Deployment

This project is set up for automated continuous monitoring of branch health metrics with real-time Google Sheets integration using Railway.

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
| `GOOGLE_CREDENTIALS_PATH` | Path to Google service account JSON | "trashscan-450913-eb9189146693.json" |
| `UPDATE_INTERVAL` | Seconds between updates | "30" |

## Files

- `compute.py` - Core branch health calculation logic
- `railway_run.py` - Railway entry point script
- `trashscan-450913-eb9189146693.json` - Google service account credentials
- `branch.csv` - Branch data

## Features

- Calculates branch health scores from transaction data
- Matches branch names between Sheet1 and Main sheet
- Updates Google Sheets in real-time
- Continues running even if browser is closed
- Customizable update interval via environment variables

## Branch Health Score (BHS) Calculation

The BHS score considers multiple factors:

1. **Service Efficiency** (40%): Based on waiting and processing times
2. **Customer Experience** (30%): Based on sentiment scores
3. **Peak Capacity** (20%): How well branches handle peak days
4. **Financial Performance** (10%): Branch-specific financial metrics

## Deployment Instructions

See the detailed [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md) for step-by-step deployment instructions.

## Security Notes

- The Google service account credentials are included in the repository. In a production environment, you should use Railway's secret management to secure these credentials.
- Make sure your Google Sheet permissions are properly configured to allow the service account to write to it.

## Troubleshooting

- **Script fails to connect to Google Sheets**: Verify your credentials and Sheet ID
- **Branch mapping issues**: Check your branch names for consistency between sheets
- **Container restarts**: Ensure your Railway account has sufficient resources for continuous operation
