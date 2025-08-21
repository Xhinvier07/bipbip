# BPI Transaction Generator - Improvements

## Overview
The BPI Transaction Generator has been significantly improved to provide better data dispersion control and configurable data quality percentages. This addresses the issue where generated data had similar averages across branches.

## Key Improvements

### 1. Data Dispersion Control
- **New Parameter**: `data_dispersion` (0.5 to 2.0)
- **Purpose**: Controls how spread out the generated data is
- **Values**:
  - `0.5`: Tight data (similar values, low variance)
  - `1.0`: Normal spread (default)
  - `2.0`: Very spread out data (high variance)

### 2. Quality Percentage Control
- **New Parameter**: `good_data_percentage` (50% to 90%)
- **Purpose**: Controls the percentage of "good" vs "bad" transactions
- **Values**:
  - `50%`: Equal good/bad data
  - `70%`: Mostly good data (default)
  - `90%`: Almost all good data

### 3. Enhanced Transaction Configuration
Each transaction type now has three performance levels:
- **Good**: Fast, efficient transactions
- **Bad**: Slow, problematic transactions  
- **Base**: Original ranges (for backward compatibility)

### 4. Branch-Specific Performance Factors
- Each branch gets a unique performance factor (0.7 to 1.3)
- Consistent across runs for the same branch
- Creates realistic variations between branches

### 5. Improved Sentiment Generation
- Sentiment scores now correlate with transaction quality
- Good transactions → Higher sentiment scores
- Bad transactions → Lower sentiment scores
- Controlled randomness based on dispersion factor

## Usage Examples

### Basic Usage
```python
# Default settings (normal dispersion, 70% good data)
generator = BPITransactionGenerator(sheet_id, credentials_path)

# Tight data, mostly good
generator = BPITransactionGenerator(
    sheet_id, 
    credentials_path,
    data_dispersion=0.5,
    good_data_percentage=80.0
)

# Spread data, mixed quality
generator = BPITransactionGenerator(
    sheet_id,
    credentials_path, 
    data_dispersion=2.0,
    good_data_percentage=50.0
)
```

### Interactive Mode
When running the generator interactively, you'll now be prompted for:
1. **Dispersion Factor**: How spread out the data should be
2. **Good Data Percentage**: What percentage should be "good" transactions

## Data Quality Improvements

### Before (Original)
- Fixed time ranges per transaction type
- Random sentiment without correlation
- Similar averages across branches
- No quality control

### After (Improved)
- Configurable time ranges based on quality
- Sentiment correlated with transaction performance
- Branch-specific variations
- Controlled good/bad data distribution
- Better data dispersion

## Testing

Run the test script to see the improvements:
```bash
python test_improvements.py
```

This will generate sample data with different configurations and show the differences in:
- Time statistics (mean, std dev)
- Sentiment distribution
- Branch performance variations
- Data quality achieved vs target

## Expected Results

With the improved generator, you should see:
1. **More varied averages** between branches
2. **Better correlation** between transaction times and sentiment
3. **Controlled data quality** matching your specified percentages
4. **Realistic data dispersion** based on your settings

## Configuration Tips

### For Realistic Data
- Use `dispersion=1.0` and `good_percentage=70.0`
- This mimics real-world scenarios where most transactions are good

### For Testing Edge Cases
- Use `dispersion=2.0` and `good_percentage=50.0`
- This creates maximum variation for testing

### For Consistent Performance
- Use `dispersion=0.5` and `good_percentage=80.0`
- This creates tight, mostly good data

## Files Modified
- `generate.py`: Main generator with all improvements
- `test_improvements.py`: Test script to demonstrate improvements
- `README_IMPROVEMENTS.md`: This documentation file
