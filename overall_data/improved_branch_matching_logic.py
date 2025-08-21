
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
    print(f"\n📊 Mapping Results:")
    print(f"   Successfully mapped: {len(mapping)} branches")
    print(f"   Unmatched Main branches: {len(unmatched_main)}")
    print(f"   Unmatched Sheet1 branches: {len(unmatched_sheet1)}")
    
    if unmatched_main:
        print(f"\n⚠️  Unmatched Main branches ({len(unmatched_main)}):")
        for i, branch in enumerate(unmatched_main[:10]):  # Show first 10
            print(f"   {i+1}. {branch}")
        if len(unmatched_main) > 10:
            print(f"   ... and {len(unmatched_main) - 10} more")
    
    if unmatched_sheet1:
        print(f"\n⚠️  Unmatched Sheet1 branches ({len(unmatched_sheet1)}):")
        for i, branch in enumerate(unmatched_sheet1[:10]):  # Show first 10
            print(f"   {i+1}. {branch}")
        if len(unmatched_sheet1) > 10:
            print(f"   ... and {len(unmatched_sheet1) - 10} more")

    return mapping
