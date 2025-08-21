#!/usr/bin/env python3
"""
Comprehensive analysis of branch matching issues between generated data and branch.csv
This will help identify why 63 branches are not being matched.
"""

import pandas as pd
import re
from typing import List, Dict, Set, Tuple

def clean_branch_name(branch_name: str) -> str:
    """Clean and normalize branch name for matching with improved logic"""
    if not branch_name:
        return ""
        
    # Convert to lowercase and remove extra spaces
    cleaned = branch_name.lower().strip()
    
    # Remove common prefixes/suffixes
    cleaned = re.sub(r'\bbpi\b', '', cleaned)
    cleaned = re.sub(r'\bbranch\b', '', cleaned)
    cleaned = re.sub(r'\boffice\b', '', cleaned)
    cleaned = re.sub(r'\bcenter\b', '', cleaned)
    cleaned = re.sub(r'\bthe\b', '', cleaned)
    cleaned = re.sub(r'\band\b', '', cleaned)
    cleaned = re.sub(r'\bof\b', '', cleaned)
    cleaned = re.sub(r'\bin\b', '', cleaned)
    cleaned = re.sub(r'\bat\b', '', cleaned)
    
    # Remove special characters but keep spaces
    cleaned = re.sub(r'[^\w\s]', ' ', cleaned)
    
    # Remove extra spaces and normalize
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned

def calculate_branch_name_similarity(name1: str, name2: str) -> float:
    """Calculate similarity score between two branch names"""
    if not name1 or not name2:
        return 0.0
        
    # Split into words
    words1 = set(name1.split())
    words2 = set(name2.split())

    if not words1 or not words2:
        return 0.0

    # Calculate Jaccard similarity
    intersection = len(words1.intersection(words2))
    union = len(words1.union(words2))

    base_similarity = intersection / union if union > 0 else 0.0
    
    # Bonus for partial word matches
    partial_matches = 0
    for word1 in words1:
        for word2 in words2:
            if word1 in word2 or word2 in word1:
                partial_matches += 0.1
    
    return min(1.0, base_similarity + partial_matches)

def load_branch_data():
    """Load branch data from different sources"""
    print("📊 Loading branch data...")
    
    # Load branch.csv (review data)
    try:
        branch_df = pd.read_csv('../bea_generator/branch.csv')
        branch_names = branch_df['branch_name'].unique().tolist()
        print(f"✅ Loaded {len(branch_names)} unique branches from branch.csv")
    except Exception as e:
        print(f"❌ Error loading branch.csv: {e}")
        branch_names = []
    
    # Load generated transaction data
    generated_branches = set()
    try:
        # Check for generated transaction files
        import glob
        transaction_files = glob.glob('../bea_generator/bpi_realtime_progress_*.csv')
        
        for file in transaction_files:
            try:
                df = pd.read_csv(file)
                if 'branch_name' in df.columns:
                    generated_branches.update(df['branch_name'].unique())
            except Exception as e:
                print(f"⚠️  Error reading {file}: {e}")
        
        generated_branches = list(generated_branches)
        print(f"✅ Found {len(generated_branches)} unique branches in generated data")
    except Exception as e:
        print(f"❌ Error loading generated data: {e}")
        generated_branches = []
    
    return branch_names, generated_branches

def analyze_branch_patterns(branch_names: List[str], generated_branches: List[str]):
    """Analyze patterns in branch names to understand matching issues"""
    
    print(f"\n🔍 Branch Pattern Analysis")
    print("=" * 60)
    
    # Clean all branch names
    branch_cleaned = {clean_branch_name(branch): branch for branch in branch_names}
    generated_cleaned = {clean_branch_name(branch): branch for branch in generated_branches}
    
    print(f"📝 Sample branch names from branch.csv (first 10):")
    for i, (cleaned, original) in enumerate(list(branch_cleaned.items())[:10]):
        print(f"   {i+1:2d}. '{original}' → '{cleaned}'")
    
    print(f"\n📝 Sample branch names from generated data (first 10):")
    for i, (cleaned, original) in enumerate(list(generated_cleaned.items())[:10]):
        print(f"   {i+1:2d}. '{original}' → '{cleaned}'")
    
    # Find exact matches
    exact_matches = set(branch_cleaned.keys()) & set(generated_cleaned.keys())
    print(f"\n✅ Exact matches: {len(exact_matches)}")
    for match in list(exact_matches)[:5]:
        print(f"   '{match}'")
    
    # Find potential matches with scores
    potential_matches = []
    for branch_clean, branch_orig in branch_cleaned.items():
        for gen_clean, gen_orig in generated_cleaned.items():
            if branch_clean != gen_clean:  # Skip exact matches
                score = calculate_branch_name_similarity(branch_clean, gen_clean)
                if score > 0.1:  # Show all potential matches
                    potential_matches.append((branch_orig, gen_orig, score))
    
    # Sort by score
    potential_matches.sort(key=lambda x: x[2], reverse=True)
    
    print(f"\n🔍 Top Potential Matches (score > 0.1):")
    for i, (branch, gen, score) in enumerate(potential_matches[:20]):
        print(f"   {i+1:2d}. '{branch}' ↔ '{gen}' (score: {score:.2f})")
    
    # Find completely unmatched branches
    branch_cleaned_set = set(branch_cleaned.keys())
    generated_cleaned_set = set(generated_cleaned.keys())
    
    unmatched_branch = []
    for cleaned, original in branch_cleaned.items():
        best_score = 0
        for gen_clean in generated_cleaned_set:
            score = calculate_branch_name_similarity(cleaned, gen_clean)
            best_score = max(best_score, score)
        if best_score < 0.1:
            unmatched_branch.append(original)
    
    unmatched_generated = []
    for cleaned, original in generated_cleaned.items():
        best_score = 0
        for branch_clean in branch_cleaned_set:
            score = calculate_branch_name_similarity(cleaned, branch_clean)
            best_score = max(best_score, score)
        if best_score < 0.1:
            unmatched_generated.append(original)
    
    print(f"\n❌ Completely Unmatched Branches:")
    print(f"   branch.csv branches with no match: {len(unmatched_branch)}")
    print(f"   Generated branches with no match: {len(unmatched_generated)}")
    
    if unmatched_generated:
        print(f"\n   Unmatched Generated branches:")
        for i, branch in enumerate(unmatched_generated[:20]):
            print(f"      {i+1:2d}. {branch}")
        if len(unmatched_generated) > 20:
            print(f"      ... and {len(unmatched_generated) - 20} more")
    
    return unmatched_branch, unmatched_generated, potential_matches

def analyze_specific_unmatched_branches(unmatched_branches: List[str]):
    """Analyze the specific unmatched branches you mentioned"""
    
    print(f"\n🎯 Analysis of Specific Unmatched Branches")
    print("=" * 60)
    
    # The branches you mentioned as unmatched
    specific_unmatched = [
        "St. Luke's", "T Sora - Visayas Avenue", "Tandang Sora", "Timog Avenue", 
        "Timog Circle", "Trinoma", "Trinoma North", "U.P. Techno Hub", 
        "Up Town Center", "Visayas Avenue", "Waltermart North EDSA", 
        "West Ave. - Del Monte", "Xavierville", "Eastwood City", "SM North EDSA", 
        "Globe BGC", "Infinity", "Market Market", "W5Th Avenue BGC", 
        "Diego Silang - Petron C5", "FTI Taguig", "Fort Bonifacio Bayani Road", 
        "Fort Mckinley Hill", "Fort Serendra", "Marulas", "Paso De Blas", 
        "Valenzuela Malinta", "Valenzuela Dalandanan", "One Global Place", 
        "PSE The Fort", "Valenzuela"
    ]
    
    print(f"📋 Analyzing {len(specific_unmatched)} specific unmatched branches:")
    
    # Check if these branches exist in branch.csv
    branch_df = pd.read_csv('../bea_generator/branch.csv')
    branch_names = branch_df['branch_name'].unique().tolist()
    
    found_in_branch_csv = []
    not_found_in_branch_csv = []
    
    for branch in specific_unmatched:
        # Check for exact matches first
        exact_match = None
        for branch_name in branch_names:
            if branch.lower() in branch_name.lower() or branch_name.lower() in branch.lower():
                exact_match = branch_name
                break
        
        if exact_match:
            found_in_branch_csv.append((branch, exact_match))
        else:
            not_found_in_branch_csv.append(branch)
    
    print(f"\n✅ Found in branch.csv ({len(found_in_branch_csv)}):")
    for original, found in found_in_branch_csv:
        print(f"   '{original}' → '{found}'")
    
    print(f"\n❌ NOT found in branch.csv ({len(not_found_in_branch_csv)}):")
    for branch in not_found_in_branch_csv:
        print(f"   '{branch}'")
    
    return found_in_branch_csv, not_found_in_branch_csv

def suggest_solutions(found_branches: List[Tuple], not_found_branches: List[str], potential_matches: List[Tuple]):
    """Suggest solutions for the branch matching issues"""
    
    print(f"\n💡 Suggested Solutions")
    print("=" * 60)
    
    print(f"1. 🔧 For branches found in branch.csv ({len(found_branches)}):")
    print("   - These branches exist but may have different naming conventions")
    print("   - Consider updating the mapping logic to handle these variations")
    
    print(f"\n2. ❌ For branches NOT found in branch.csv ({len(not_found_branches)}):")
    print("   - These branches need to be added to branch.csv")
    print("   - Or the generated data is creating branches that don't exist")
    
    print(f"\n3. 🔍 Potential matches found ({len(potential_matches)}):")
    print("   - Review these potential matches and update mapping rules")
    
    print(f"\n4. 📝 Recommended Actions:")
    print("   a) Add missing branches to branch.csv")
    print("   b) Improve the cleaning function to handle more variations")
    print("   c) Lower the similarity threshold for matching")
    print("   d) Create a manual mapping file for difficult cases")
    print("   e) Review the generated data to ensure it only creates real branches")

def main():
    """Main analysis function"""
    print("🔧 Comprehensive Branch Matching Analysis")
    print("=" * 60)
    
    # Load data
    branch_names, generated_branches = load_branch_data()
    
    if not branch_names or not generated_branches:
        print("❌ Could not load branch data. Please check file paths.")
        return
    
    # Analyze patterns
    unmatched_branch, unmatched_generated, potential_matches = analyze_branch_patterns(
        branch_names, generated_branches
    )
    
    # Analyze specific unmatched branches
    found_branches, not_found_branches = analyze_specific_unmatched_branches(unmatched_generated)
    
    # Suggest solutions
    suggest_solutions(found_branches, not_found_branches, potential_matches)
    
    print(f"\n📊 Summary:")
    print(f"   Total branches in branch.csv: {len(branch_names)}")
    print(f"   Total branches in generated data: {len(generated_branches)}")
    print(f"   Branches found in branch.csv: {len(found_branches)}")
    print(f"   Branches NOT found in branch.csv: {len(not_found_branches)}")
    print(f"   Potential matches to review: {len(potential_matches)}")

if __name__ == "__main__":
    main()
