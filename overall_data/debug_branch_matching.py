#!/usr/bin/env python3
"""
Debug script to analyze branch matching issues in compute.py
This will help identify why 63 branches are not being matched.
"""

import pandas as pd
import re
from typing import List, Dict, Set

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
    """Calculate similarity score between two branch names with improved logic"""
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
    
    # Bonus for partial word matches (e.g., "makati" vs "makati city")
    partial_matches = 0
    for word1 in words1:
        for word2 in words2:
            if word1 in word2 or word2 in word1:
                partial_matches += 0.1
    
    return min(1.0, base_similarity + partial_matches)

def analyze_branch_names(sheet1_branches: List[str], main_branches: List[str]):
    """Analyze branch names and find potential matches"""
    
    print(f"🔍 Branch Name Analysis")
    print(f"=" * 60)
    print(f"Sheet1 branches: {len(sheet1_branches)}")
    print(f"Main branches: {len(main_branches)}")
    
    # Clean all branch names
    sheet1_cleaned = {clean_branch_name(branch): branch for branch in sheet1_branches}
    main_cleaned = {clean_branch_name(branch): branch for branch in main_branches}
    
    print(f"\n📝 Sample Cleaned Names:")
    print("Sheet1 (first 10):")
    for i, (cleaned, original) in enumerate(list(sheet1_cleaned.items())[:10]):
        print(f"   {i+1:2d}. '{original}' → '{cleaned}'")
    
    print("\nMain (first 10):")
    for i, (cleaned, original) in enumerate(list(main_cleaned.items())[:10]):
        print(f"   {i+1:2d}. '{original}' → '{cleaned}'")
    
    # Find exact matches
    exact_matches = set(sheet1_cleaned.keys()) & set(main_cleaned.keys())
    print(f"\n✅ Exact matches: {len(exact_matches)}")
    for match in list(exact_matches)[:5]:
        print(f"   '{match}'")
    
    # Find potential matches with scores
    potential_matches = []
    for sheet1_clean, sheet1_orig in sheet1_cleaned.items():
        for main_clean, main_orig in main_cleaned.items():
            if sheet1_clean != main_clean:  # Skip exact matches
                score = calculate_branch_name_similarity(sheet1_clean, main_clean)
                if score > 0.1:  # Show all potential matches
                    potential_matches.append((sheet1_orig, main_orig, score))
    
    # Sort by score
    potential_matches.sort(key=lambda x: x[2], reverse=True)
    
    print(f"\n🔍 Top Potential Matches (score > 0.1):")
    for i, (sheet1, main, score) in enumerate(potential_matches[:20]):
        print(f"   {i+1:2d}. '{sheet1}' ↔ '{main}' (score: {score:.2f})")
    
    # Find completely unmatched branches
    sheet1_cleaned_set = set(sheet1_cleaned.keys())
    main_cleaned_set = set(main_cleaned.keys())
    
    unmatched_sheet1 = []
    for cleaned, original in sheet1_cleaned.items():
        best_score = 0
        for main_clean in main_cleaned_set:
            score = calculate_branch_name_similarity(cleaned, main_clean)
            best_score = max(best_score, score)
        if best_score < 0.1:
            unmatched_sheet1.append(original)
    
    unmatched_main = []
    for cleaned, original in main_cleaned.items():
        best_score = 0
        for sheet1_clean in sheet1_cleaned_set:
            score = calculate_branch_name_similarity(cleaned, sheet1_clean)
            best_score = max(best_score, score)
        if best_score < 0.1:
            unmatched_main.append(original)
    
    print(f"\n❌ Completely Unmatched Branches:")
    print(f"   Sheet1 branches with no match: {len(unmatched_sheet1)}")
    print(f"   Main branches with no match: {len(unmatched_main)}")
    
    if unmatched_sheet1:
        print(f"\n   Unmatched Sheet1 branches:")
        for i, branch in enumerate(unmatched_sheet1[:15]):
            print(f"      {i+1:2d}. {branch}")
        if len(unmatched_sheet1) > 15:
            print(f"      ... and {len(unmatched_sheet1) - 15} more")
    
    if unmatched_main:
        print(f"\n   Unmatched Main branches:")
        for i, branch in enumerate(unmatched_main[:15]):
            print(f"      {i+1:2d}. {branch}")
        if len(unmatched_main) > 15:
            print(f"      ... and {len(unmatched_main) - 15} more")

def main():
    """Main function to run the analysis"""
    print("🔧 Branch Matching Debug Tool")
    print("=" * 60)
    
    # You can manually input some sample branch names here for testing
    # Or load from your actual data files
    
    # Example branch names (replace with your actual data)
    sheet1_branches = [
        "BPI Ayala Branch",
        "BPI Makati Branch", 
        "BPI Quezon City Branch",
        "BPI Manila Branch",
        "BPI Pasig Branch"
    ]
    
    main_branches = [
        "Ayala",
        "Makati",
        "Quezon City", 
        "Manila",
        "Pasig"
    ]
    
    print("Using sample data. Replace with your actual branch lists.")
    print("To use your actual data, modify the lists in this script.")
    
    analyze_branch_names(sheet1_branches, main_branches)
    
    print(f"\n💡 Next Steps:")
    print("1. Replace the sample branch lists with your actual data")
    print("2. Run this script to see the detailed analysis")
    print("3. Look for patterns in the unmatched branches")
    print("4. Consider adding more cleaning rules based on the patterns found")

if __name__ == "__main__":
    main()
