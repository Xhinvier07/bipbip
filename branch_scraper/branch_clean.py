import pandas as pd
import numpy as np

def merge_branch_data(branch_csv_path, sheet1_csv_path, output_csv_path):
    """
    Merge branch data from two CSV files based on matching criteria.
    
    Args:
        branch_csv_path (str): Path to the existing branch.csv file
        sheet1_csv_path (str): Path to the sheet1.csv file with new data
        output_csv_path (str): Path for the output merged CSV file
    """
    
    # Read the CSV files
    try:
        branch_df = pd.read_csv(branch_csv_path)
        sheet1_df = pd.read_csv(sheet1_csv_path)
        
        print(f"Loaded branch.csv: {len(branch_df)} records")
        print(f"Loaded sheet1.csv: {len(sheet1_df)} records")
        
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        return
    except Exception as e:
        print(f"Error reading CSV files: {e}")
        return
    
    # Clean column names (remove whitespace)
    branch_df.columns = branch_df.columns.str.strip()
    sheet1_df.columns = sheet1_df.columns.str.strip()
    
    # Ensure all required columns exist
    required_cols = ['city', 'branch_name', 'address', 'latitude', 'longitude']
    
    # Check if branch.csv has lat/lng columns, if not add them
    for col in ['latitude', 'longitude']:
        if col not in branch_df.columns:
            branch_df[col] = np.nan
    
    # Verify sheet1.csv has all required columns
    missing_cols = [col for col in required_cols if col not in sheet1_df.columns]
    if missing_cols:
        print(f"Error: Missing columns in sheet1.csv: {missing_cols}")
        return
    
    # Clean and normalize text data for better matching
    def clean_text(text):
        if pd.isna(text):
            return ''
        return str(text).strip().lower()
    
    # Create normalized matching keys
    branch_df['match_key'] = (
        branch_df['city'].apply(clean_text) + '|' + 
        branch_df['branch_name'].apply(clean_text) + '|' + 
        branch_df['address'].apply(clean_text)
    )
    
    sheet1_df['match_key'] = (
        sheet1_df['city'].apply(clean_text) + '|' + 
        sheet1_df['branch_name'].apply(clean_text) + '|' + 
        sheet1_df['address'].apply(clean_text)
    )
    
    # Track changes
    updated_count = 0
    added_count = 0
    
    # Process each record in sheet1
    for idx, sheet1_row in sheet1_df.iterrows():
        match_key = sheet1_row['match_key']
        
        # Find matching records in branch_df
        matching_indices = branch_df[branch_df['match_key'] == match_key].index
        
        if len(matching_indices) > 0:
            # Update existing records with latitude and longitude
            for match_idx in matching_indices:
                # Only update if latitude/longitude are missing or NaN
                if pd.isna(branch_df.loc[match_idx, 'latitude']) or pd.isna(branch_df.loc[match_idx, 'longitude']):
                    branch_df.loc[match_idx, 'latitude'] = sheet1_row['latitude']
                    branch_df.loc[match_idx, 'longitude'] = sheet1_row['longitude']
                    updated_count += 1
                    print(f"Updated: {sheet1_row['branch_name']} in {sheet1_row['city']}")
        else:
            # Add new branch (no matching record found)
            new_row = {
                'city': sheet1_row['city'],
                'branch_name': sheet1_row['branch_name'],
                'address': sheet1_row['address'],
                'latitude': sheet1_row['latitude'],
                'longitude': sheet1_row['longitude'],
                'match_key': match_key
            }
            branch_df = pd.concat([branch_df, pd.DataFrame([new_row])], ignore_index=True)
            added_count += 1
            print(f"Added: {sheet1_row['branch_name']} in {sheet1_row['city']}")
    
    # Remove the temporary match_key column
    branch_df = branch_df.drop('match_key', axis=1)
    
    # Save the merged data
    try:
        branch_df.to_csv(output_csv_path, index=False)
        print(f"\nMerge completed successfully!")
        print(f"Updated {updated_count} existing branches with lat/lng")
        print(f"Added {added_count} new branches")
        print(f"Total records in output: {len(branch_df)}")
        print(f"Output saved to: {output_csv_path}")
        
    except Exception as e:
        print(f"Error saving output file: {e}")

def main():
    """
    Main function to run the merge process
    """
    # File paths - modify these as needed
    branch_csv = "branch.csv"
    sheet1_csv = "sheet1.csv"
    output_csv = "merged_branches.csv"
    
    print("Starting branch data merge process...")
    print("=" * 50)
    
    merge_branch_data(branch_csv, sheet1_csv, output_csv)

if __name__ == "__main__":
    main()