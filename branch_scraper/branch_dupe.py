import pandas as pd
import numpy as np

def remove_duplicate_branches(input_csv_path, output_csv_path):
    """
    Remove duplicate branches based on branch_name and address.
    Keeps the record with the most complete data (non-null latitude/longitude preferred).
    
    Args:
        input_csv_path (str): Path to the input CSV file
        output_csv_path (str): Path for the output CSV file without duplicates
    """
    
    # Read the CSV file
    try:
        df = pd.read_csv(input_csv_path)
        print(f"Loaded CSV: {len(df)} records")
        
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
        return
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return
    
    # Clean column names (remove whitespace)
    df.columns = df.columns.str.strip()
    
    # Store original count
    original_count = len(df)
    
    # Clean and normalize text data for better duplicate detection
    def clean_text(text):
        if pd.isna(text):
            return ''
        return str(text).strip().lower()
    
    # Create normalized columns for matching
    df['branch_name_clean'] = df['branch_name'].apply(clean_text)
    df['address_clean'] = df['address'].apply(clean_text)
    
    # Create a duplicate key based on branch_name and address
    df['duplicate_key'] = df['branch_name_clean'] + '|' + df['address_clean']
    
    # Find duplicates
    duplicate_groups = df.groupby('duplicate_key')
    duplicates_found = sum(1 for name, group in duplicate_groups if len(group) > 1)
    
    print(f"Found {duplicates_found} groups of duplicates")
    
    # Function to select the best record from duplicates
    def select_best_record(group):
        if len(group) == 1:
            return group.iloc[0]
        
        # Print duplicate information
        print(f"\nDuplicate found for: {group.iloc[0]['branch_name']} at {group.iloc[0]['address']}")
        print(f"  Found {len(group)} duplicate records")
        
        # Priority logic for selecting the best record:
        # 1. Records with both latitude and longitude
        # 2. Records with at least one coordinate
        # 3. First record if all are equally incomplete
        
        # Score each record based on data completeness
        def score_record(row):
            score = 0
            # Higher score for having latitude
            if pd.notna(row['latitude']) and row['latitude'] != '':
                score += 2
            # Higher score for having longitude  
            if pd.notna(row['longitude']) and row['longitude'] != '':
                score += 2
            # Small bonus for having city data
            if pd.notna(row['city']) and row['city'] != '':
                score += 1
            return score
        
        # Calculate scores for all records in the group
        group_copy = group.copy()
        group_copy['completeness_score'] = group_copy.apply(score_record, axis=1)
        
        # Sort by completeness score (descending) and then by original index
        best_record = group_copy.sort_values(['completeness_score', 'duplicate_key'], 
                                           ascending=[False, True]).iloc[0]
        
        print(f"  Kept record with completeness score: {best_record['completeness_score']}")
        
        return best_record
    
    # Apply the selection logic to each duplicate group
    print("\nProcessing duplicates...")
    selected_records = []
    
    for duplicate_key, group in duplicate_groups:
        best_record = select_best_record(group)
        selected_records.append(best_record)
    
    # Create the deduplicated dataframe
    deduplicated_df = pd.DataFrame(selected_records)
    
    # Remove the temporary columns
    columns_to_remove = ['branch_name_clean', 'address_clean', 'duplicate_key', 'completeness_score']
    for col in columns_to_remove:
        if col in deduplicated_df.columns:
            deduplicated_df = deduplicated_df.drop(col, axis=1)
    
    # Reset index
    deduplicated_df = deduplicated_df.reset_index(drop=True)
    
    # Sort by city, then branch_name for better organization
    if 'city' in deduplicated_df.columns:
        deduplicated_df = deduplicated_df.sort_values(['city', 'branch_name'], na_position='last')
        deduplicated_df = deduplicated_df.reset_index(drop=True)
    
    # Save the deduplicated data
    try:
        deduplicated_df.to_csv(output_csv_path, index=False)
        
        # Summary statistics
        final_count = len(deduplicated_df)
        removed_count = original_count - final_count
        
        print(f"\nDeduplication completed successfully!")
        print(f"Original records: {original_count}")
        print(f"Final records: {final_count}")
        print(f"Duplicates removed: {removed_count}")
        print(f"Output saved to: {output_csv_path}")
        
        # Show some statistics about data completeness
        if 'latitude' in deduplicated_df.columns and 'longitude' in deduplicated_df.columns:
            complete_coords = deduplicated_df[
                (pd.notna(deduplicated_df['latitude'])) & 
                (pd.notna(deduplicated_df['longitude']))
            ].shape[0]
            print(f"Records with complete coordinates: {complete_coords}/{final_count}")
        
    except Exception as e:
        print(f"Error saving output file: {e}")

def analyze_duplicates(csv_path):
    """
    Analyze and show duplicate information without removing them.
    
    Args:
        csv_path (str): Path to the CSV file to analyze
    """
    try:
        df = pd.read_csv(csv_path)
        print(f"Analyzing duplicates in: {csv_path}")
        print(f"Total records: {len(df)}")
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Clean and normalize text data
        def clean_text(text):
            if pd.isna(text):
                return ''
            return str(text).strip().lower()
        
        df['branch_name_clean'] = df['branch_name'].apply(clean_text)
        df['address_clean'] = df['address'].apply(clean_text)
        df['duplicate_key'] = df['branch_name_clean'] + '|' + df['address_clean']
        
        # Find and display duplicates
        duplicate_groups = df.groupby('duplicate_key')
        duplicate_details = []
        
        for duplicate_key, group in duplicate_groups:
            if len(group) > 1:
                duplicate_details.append({
                    'branch_name': group.iloc[0]['branch_name'],
                    'address': group.iloc[0]['address'],
                    'city': group.iloc[0]['city'] if 'city' in group.columns else 'N/A',
                    'count': len(group)
                })
        
        if duplicate_details:
            print(f"\nFound {len(duplicate_details)} sets of duplicates:")
            print("-" * 80)
            for dup in duplicate_details:
                print(f"Branch: {dup['branch_name']}")
                print(f"Address: {dup['address']}")
                print(f"City: {dup['city']}")
                print(f"Duplicate count: {dup['count']}")
                print("-" * 40)
        else:
            print("\nNo duplicates found!")
            
    except Exception as e:
        print(f"Error analyzing file: {e}")

def main():
    """
    Main function with options to analyze or remove duplicates
    """
    # File paths - modify these as needed
    input_csv = "merged_branches.csv"  # or "branch.csv" 
    output_csv = "deduplicated_branches.csv"
    
    print("Branch Duplicate Removal Tool")
    print("=" * 50)
    
    # Option 1: Just analyze duplicates first
    print("Step 1: Analyzing duplicates...")
    analyze_duplicates(input_csv)
    
    print("\n" + "=" * 50)
    
    # Option 2: Remove duplicates
    print("Step 2: Removing duplicates...")
    remove_duplicate_branches(input_csv, output_csv)

if __name__ == "__main__":
    main()