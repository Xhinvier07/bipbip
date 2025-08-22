# Step-by-Step Railway Deployment Guide for BPI Branch Health Calculator

This guide will walk you through deploying the BPI Branch Health Calculator to Railway for continuous execution.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app) if you don't have one)
2. A GitHub account to push your code
3. The Google Sheets service account credentials file (`trashscan-450913-eb9189146693.json`)

## Step 1: Prepare Your Repository

1. Create a new GitHub repository or use an existing one
2. Push all files in this directory to your repository:
   - `compute.py`
   - `railway_run.py`
   - `requirements.txt`
   - `Procfile`
   - `Dockerfile`
   - `branch.csv`
   - `trashscan-450913-eb9189146693.json`
   - `.gitignore`
   - `README.md`

## Step 2: Set Up Railway Project

1. Log in to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect to your GitHub account if needed
5. Select the repository containing your code
6. Railway will automatically detect the Procfile and start deployment

## Step 3: Configure Environment Variables

1. In your Railway project, click on "Variables" in the left sidebar
2. Add the following environment variables (adjust values as needed):
   
   ```
   GOOGLE_SHEET_ID=1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc
   GOOGLE_CREDENTIALS_PATH=trashscan-450913-eb9189146693.json
   UPDATE_INTERVAL=30
   ```

## Step 4: Deploy Your Application

1. If deployment didn't start automatically, click on "Deploy" in the top right
2. Wait for the build and deployment to complete
3. Click on "View Logs" to monitor the deployment and execution

## Step 5: Verify Operation

1. Check the logs to ensure your script started successfully
2. Look for messages like "Google Sheets connection established successfully!" and "Updated Main sheet"
3. Verify in your Google Sheet that the Main sheet is being updated with branch health metrics

## Understanding the Branch Health Score Calculator

The calculator performs these key operations:

1. **Fetches transaction data** from the Sheet1 worksheet
2. **Maps branch names** between Sheet1 and Main sheet
3. **Calculates health metrics** for each branch:
   - Service efficiency (waiting/processing times)
   - Customer experience (sentiment scores)
   - Peak capacity handling
   - Financial performance
4. **Updates the Main sheet** with the calculated metrics
5. **Repeats the process** at the configured interval

## Important Notes

1. **Continuous Operation**: Once deployed, your script will continue running even if you close your browser or sign out of Railway. This is the key benefit of using Railway for this application.

2. **Monitoring**: You can monitor the script's progress through Railway's logging interface.

3. **Redeployment**: If you need to modify the script or update parameters, simply update the environment variables and redeploy.

4. **Resource Usage**: Be aware that continuous operation will consume Railway resources. If you're on the free tier, you might need to upgrade if you plan to run this script for extended periods.

5. **Google Sheets API Limits**: Be mindful of Google Sheets API rate limits. If you encounter issues, try increasing the `UPDATE_INTERVAL` value.

## Troubleshooting

- **Build Failures**: Check that all required files are in your repository
- **Runtime Errors**: Check the logs for Python errors or exceptions
- **Google Sheets Connection Issues**: Verify your service account credentials and Sheet ID
- **Branch Mapping Problems**: Check for branch name inconsistencies between sheets
- **Script Not Running Continuously**: Ensure your Railway project is set to "Always On" in settings

For more help, refer to the [Railway Documentation](https://docs.railway.app/) or create an issue in your GitHub repository.
