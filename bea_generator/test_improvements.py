#!/usr/bin/env python3
"""
Test script to demonstrate the improved BPI Transaction Generator
with data dispersion control and quality percentage settings.
"""

import datetime
from generate import BPITransactionGenerator
import pandas as pd

def test_different_configurations():
    """Test different data configurations to show the improvements"""
    
    print("🧪 Testing Improved BPI Transaction Generator")
    print("=" * 60)
    
    # Test configurations
    test_configs = [
        {
            'name': 'Tight Data, Mostly Good',
            'dispersion': 0.5,
            'good_percentage': 80.0
        },
        {
            'name': 'Normal Data, Balanced',
            'dispersion': 1.0,
            'good_percentage': 70.0
        },
        {
            'name': 'Spread Data, Mixed Quality',
            'dispersion': 2.0,
            'good_percentage': 50.0
        }
    ]
    
    for config in test_configs:
        print(f"\n🔬 Testing: {config['name']}")
        print("-" * 40)
        
        # Initialize generator with test config
        generator = BPITransactionGenerator(
            sheet_id="test",
            credentials_path=None,  # No credentials for testing
            data_dispersion=config['dispersion'],
            good_data_percentage=config['good_percentage']
        )
        
        # Load sample branches (create a simple list for testing)
        generator.branches = [
            "BPI Ayala Branch",
            "BPI Makati Branch", 
            "BPI Quezon City Branch",
            "BPI Manila Branch",
            "BPI Pasig Branch"
        ]
        
        # Generate data for 2 days
        start_date = datetime.date.today()
        transactions = generator.generate_all_transactions_mixed(start_date, 2)
        df = pd.DataFrame(transactions)
        
        # Print summary
        generator.print_data_summary(df)
        
        # Save test data
        filename = f"test_{config['name'].replace(' ', '_').lower()}.csv"
        df.to_csv(filename, index=False)
        print(f"   💾 Test data saved: {filename}")

def compare_with_original():
    """Compare improved generator with original approach"""
    
    print(f"\n📊 Comparison: Original vs Improved")
    print("=" * 60)
    
    # Original approach (simulated)
    print("Original approach would generate:")
    print("   - Fixed time ranges per transaction type")
    print("   - No branch-specific variations")
    print("   - Random sentiment without quality control")
    print("   - Similar averages across branches")
    
    print("\nImproved approach generates:")
    print("   - Configurable data dispersion")
    print("   - Controlled good/bad data percentages")
    print("   - Branch-specific performance factors")
    print("   - More realistic data variation")
    print("   - Better correlation between times and sentiment")

if __name__ == "__main__":
    test_different_configurations()
    compare_with_original()
    
    print(f"\n✅ Testing complete!")
    print("Check the generated CSV files to see the data differences.")
