import gspread
from google.oauth2.service_account import Credentials

scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
]

credentials = Credentials.from_service_account_file('trashscan-450913-eb9189146693.json', scopes=scope)
gc = gspread.authorize(credentials)

# Test connection
sheet = gc.open_by_key("1rHjXMxilei_FCJN49NDKmdFz8kSiX4ryCnaHPNcqeDc")
print("Connection successful!")