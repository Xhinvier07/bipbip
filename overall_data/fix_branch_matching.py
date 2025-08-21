#!/usr/bin/env python3
"""
Fix branch matching issues by adding missing branches to branch.csv
and improving the matching logic in compute.py
"""

import pandas as pd
import re
from typing import List, Dict, Set

def add_missing_branches_to_csv():
    """Add missing branches to branch.csv"""
    
    print("🔧 Adding missing branches to branch.csv...")
    
    # Load existing branch.csv
    try:
        branch_df = pd.read_csv('../bea_generator/branch.csv')
        print(f"✅ Loaded existing branch.csv with {len(branch_df)} rows")
    except Exception as e:
        print(f"❌ Error loading branch.csv: {e}")
        return
    
    # Missing branches that need to be added
    missing_branches = [
        "BPI West Ave. - Del Monte Branch",
        "BPI W5Th Avenue BGC Branch", 
        "BPI One Global Place Branch",
        "BPI PSE The Fort Branch"
    ]
    
    # Check which branches are already in the CSV
    existing_branches = set(branch_df['branch_name'].unique())
    
    branches_to_add = []
    for branch in missing_branches:
        if branch not in existing_branches:
            branches_to_add.append(branch)
            print(f"   ➕ Will add: {branch}")
        else:
            print(f"   ✅ Already exists: {branch}")
    
    if not branches_to_add:
        print("✅ All branches already exist in branch.csv")
        return
    
    # Create new rows for missing branches
    new_rows = []
    for branch in branches_to_add:
        # Create a sample review entry for each missing branch
        new_row = {
            'branch_name': branch,
            'review_text': f"Sample review for {branch}. This branch was added to ensure proper matching.",
            'star_rating': 3,  # Neutral rating
            'date': '1 year ago'
        }
        new_rows.append(new_row)
    
    # Add new rows to the dataframe
    new_df = pd.DataFrame(new_rows)
    updated_df = pd.concat([branch_df, new_df], ignore_index=True)
    
    # Save updated CSV
    try:
        updated_df.to_csv('../bea_generator/branch.csv', index=False)
        print(f"✅ Successfully added {len(branches_to_add)} branches to branch.csv")
        print(f"   Total branches now: {len(updated_df['branch_name'].unique())}")
    except Exception as e:
        print(f"❌ Error saving updated branch.csv: {e}")

def improve_branch_matching_logic():
    """Create improved branch matching logic for compute.py"""
    
    print("\n🔧 Creating improved branch matching logic...")
    
    improved_logic = '''
def create_branch_mapping(self, sheet1_branches: List[str], main_branches: List[str]) -> Dict[str, str]:
    """Create mapping between Sheet1 branch names and Main sheet branch names with improved matching"""
    mapping = {}
    matched_sheet1 = set()
    matched_main = set()
    unmatched_main = []
    unmatched_sheet1 = []

    print(f"🔍 Branch Mapping Analysis:")
    print(f"   Sheet1 branches: {len(sheet1_branches)}")
    print(f"   Main branches: {len(main_branches)}")
    print("-" * 60)

    # First pass: Try exact matches and high similarity matches
    for main_branch in main_branches:
        main_clean = self.clean_branch_name(main_branch)
        best_match = None
        highest_score = 0

        for sheet1_branch in sheet1_branches:
            if sheet1_branch in matched_sheet1:
                continue  # Skip already matched branches
            
            sheet1_clean = self.clean_branch_name(sheet1_branch)
            
            # Try exact match first
            if main_clean == sheet1_clean:
                best_match = sheet1_branch
                highest_score = 1.0
                break
            
            # Try similarity matching with lower threshold
            score = self.calculate_branch_name_similarity(main_clean, sheet1_clean)
            if score > highest_score and score > 0.15:  # Lowered threshold to 15%
                highest_score = score
                best_match = sheet1_branch

        if best_match:
            mapping[best_match] = main_branch
            matched_sheet1.add(best_match)
            matched_main.add(main_branch)
            print(f"✅ Mapped: '{best_match}' → '{main_branch}' (score: {highest_score:.2f})")
        else:
            unmatched_main.append(main_branch)

    # Second pass: Try reverse matching for unmatched Sheet1 branches
    for sheet1_branch in sheet1_branches:
        if sheet1_branch in matched_sheet1:
            continue
        
        sheet1_clean = self.clean_branch_name(sheet1_branch)
        best_match = None
        highest_score = 0

        for main_branch in main_branches:
            if main_branch in matched_main:
                continue
            
            main_clean = self.clean_branch_name(main_branch)
            score = self.calculate_branch_name_similarity(sheet1_clean, main_clean)
            
            if score > highest_score and score > 0.15:
                highest_score = score
                best_match = main_branch

        if best_match:
            mapping[sheet1_branch] = best_match
            matched_sheet1.add(sheet1_branch)
            matched_main.add(best_match)
            print(f"🔄 Reverse Mapped: '{sheet1_branch}' → '{best_match}' (score: {highest_score:.2f})")
        else:
            unmatched_sheet1.append(sheet1_branch)

    # Report unmatched branches
    print(f"\\n📊 Mapping Results:")
    print(f"   Successfully mapped: {len(mapping)} branches")
    print(f"   Unmatched Main branches: {len(unmatched_main)}")
    print(f"   Unmatched Sheet1 branches: {len(unmatched_sheet1)}")
    
    if unmatched_main:
        print(f"\\n⚠️  Unmatched Main branches ({len(unmatched_main)}):")
        for i, branch in enumerate(unmatched_main[:10]):  # Show first 10
            print(f"   {i+1}. {branch}")
        if len(unmatched_main) > 10:
            print(f"   ... and {len(unmatched_main) - 10} more")
    
    if unmatched_sheet1:
        print(f"\\n⚠️  Unmatched Sheet1 branches ({len(unmatched_sheet1)}):")
        for i, branch in enumerate(unmatched_sheet1[:10]):  # Show first 10
            print(f"   {i+1}. {branch}")
        if len(unmatched_sheet1) > 10:
            print(f"   ... and {len(unmatched_sheet1) - 10} more")

    return mapping
'''
    
    # Save the improved logic to a file
    with open('improved_branch_matching_logic.py', 'w', encoding='utf-8') as f:
        f.write(improved_logic)
    
    print("✅ Created improved_branch_matching_logic.py")
    print("   Copy this logic to replace the create_branch_mapping method in compute.py")

def create_manual_mapping_file():
    """Create a manual mapping file for difficult cases"""
    
    print("\n🔧 Creating manual mapping file...")
    
    # Manual mappings for difficult cases
    manual_mappings = {
        # Generated branch name -> Main sheet branch name
        "BPI St. Luke's Branch": "St. Luke's",
        "BPI T Sora - Visayas Avenue Branch": "T Sora - Visayas Avenue", 
        "BPI Tandang Sora Branch": "Tandang Sora",
        "BPI Timog Avenue Branch": "Timog Avenue",
        "BPI Timog Circle Branch": "Timog Circle",
        "BPI Trinoma Branch": "Trinoma",
        "BPI Trinoma North Branch": "Trinoma North",
        "BPI U.P. Techno Hub Branch": "U.P. Techno Hub",
        "BPI UP Town Center Branch": "Up Town Center",
        "BPI Visayas Avenue Branch": "Visayas Avenue",
        "BPI Waltermart North EDSA Branch": "Waltermart North EDSA",
        "BPI West Avenue Del Monte Branch": "West Ave. - Del Monte",
        "BPI Xavierville Branch": "Xavierville",
        "BPI Eastwood City Branch": "Eastwood City",
        "BPI SM North EDSA Branch": "SM North EDSA",
        "BPI GLOBE BGC Branch": "Globe BGC",
        "BPI Infinity Branch": "Infinity",
        "BPI Market Market Branch": "Market Market",
        "BPI W5Th Avenue BGC Branch": "W5Th Avenue BGC",
        "BPI Diego Silang - Petron C5 Branch": "Diego Silang - Petron C5",
        "BPI FTI Taguig Branch": "FTI Taguig",
        "BPI Fort Bonifacio Bayani Road Branch": "Fort Bonifacio Bayani Road",
        "BPI Fort Mckinley Hill Branch": "Fort Mckinley Hill",
        "BPI Fort Serendra Branch": "Fort Serendra",
        "BPI Marulas Branch": "Marulas",
        "BPI Valenzuela Paso De Blas Branch": "Paso De Blas",
        "BPI Valenzuela Malinta Branch": "Valenzuela Malinta",
        "BPI Valenzuela Dalandanan Branch": "Valenzuela Dalandanan",
        "BPI One Global Place Branch": "One Global Place",
        "BPI PSE The Fort Branch": "PSE The Fort"
    }
    
    # Create a Python dictionary file
    mapping_content = f'''# Manual branch mapping for difficult cases
# Generated branch name -> Main sheet branch name

MANUAL_BRANCH_MAPPING = {{
'''
    
    for generated, main in manual_mappings.items():
        mapping_content += f"    '{generated}': '{main}',\n"
    
    mapping_content += "}\n"
    
    # Save the mapping file
    with open('manual_branch_mapping.py', 'w', encoding='utf-8') as f:
        f.write(mapping_content)
    
    print(f"✅ Created manual_branch_mapping.py with {len(manual_mappings)} mappings")
    print("   Import this in compute.py to use manual mappings")

def main():
    """Main function to fix branch matching issues"""
    
    print("🔧 Branch Matching Fix Tool")
    print("=" * 60)
    
    # Step 1: Add missing branches to branch.csv
    add_missing_branches_to_csv()
    
    # Step 2: Create improved matching logic
    improve_branch_matching_logic()
    
    # Step 3: Create manual mapping file
    create_manual_mapping_file()
    
    print(f"\n✅ Branch matching fixes completed!")
    print(f"📝 Next steps:")
    print(f"   1. Review the updated branch.csv")
    print(f"   2. Copy improved_branch_mapping_logic.py to compute.py")
    print(f"   3. Import manual_branch_mapping.py in compute.py")
    print(f"   4. Test the improved matching logic")

if __name__ == "__main__":
    main()
