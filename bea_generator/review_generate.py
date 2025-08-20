# Script to generate review feedback samples CSV
import pandas as pd

# Sample review texts for each sentiment category
positive_reviews = [
    "Excellent service! Staff was very helpful and quick processing.",
    "Fast transaction, friendly staff. Will come back again.",
    "Very efficient branch. No long waiting time today.",
    "Staff explained everything clearly. Great customer service!",
    "Quick and professional service. Highly recommended branch.",
    "Clean facility, organized queue system. Very satisfied.",
    "Teller was courteous and processed my request quickly.",
    "No hassle transaction. Staff was accommodating.",
    "Great branch! Modern facilities and efficient service.",
    "Outstanding customer service. Staff went above and beyond.",
    "Very fast processing. Impressed with the service quality.",
    "Friendly atmosphere, helpful staff. Five stars!",
    "Smooth transaction from start to finish. Well done!",
    "Professional staff, clean environment. Excellent experience.",
    "Quick service despite busy day. Thank you for good service.",
    "Efficient tellers, minimal wait time. Very pleased.",
    "Staff was patient in explaining loan details. Great service!",
    "Modern branch with excellent customer service standards.",
    "Fast and accurate processing. Keep up the good work!",
    "Wonderful experience! Staff made banking easy and convenient."
]

negative_reviews = [
    "Very long waiting time. Poor queue management system.",
    "Unfriendly staff, slow service. Need improvement urgently.",
    "Waited over 30 minutes for simple transaction. Terrible.",
    "Rude teller, unprofessional behavior. Very disappointed.",
    "System always down, wasting customer's time. Fix it!",
    "Crowded branch, insufficient staff. Need more tellers.",
    "Poor customer service. Staff seems uninterested to help.",
    "Long lines every day. Need better crowd management.",
    "Slow processing, outdated systems. Time to upgrade.",
    "Staff lacks proper training. Made errors in transaction.",
    "Terrible experience. Will switch to another branch.",
    "Air conditioning not working. Hot and uncomfortable.",
    "Website says open but branch was closed. Poor communication.",
    "ATM always broken. Need better machine maintenance.",
    "Complicated procedures, unhelpful staff. Frustrating experience.",
    "Waited 1 hour for loan processing. Completely unacceptable.",
    "Staff talking personal matters while serving. Very unprofessional.",
    "No proper social distancing. Safety protocols ignored.",
    "Parking area too small. Always full, very inconvenient.",
    "Computer system slow. Every transaction takes forever."
]

neutral_reviews = [
    "Regular service, nothing special. Average branch experience.",
    "Standard banking service. Met basic expectations.",
    "Okay service, could be better. Room for improvement.",
    "Average wait time, decent staff. Typical bank visit.",
    "Service was fine, not great but acceptable.",
    "Normal processing time. Staff did their job adequately.",
    "Standard branch operations. Nothing to complain about.",
    "Fair service quality. Expected better but okay overall.",
    "Decent facilities, average customer service. It's okay.",
    "Regular bank experience. No major issues encountered.",
    "Standard procedures followed. Nothing remarkable happened.",
    "Average branch, typical banking service provided.",
    "Acceptable service level. Staff was professional enough.",
    "Normal banking experience. No surprises, good or bad.",
    "Fair processing time. Service was satisfactory overall.",
    "Standard bank branch. Met minimum service expectations.",
    "Regular transaction completed. Nothing special to note.",
    "Average customer service. Staff was polite but busy.",
    "Typical bank visit. Service was adequate for needs.",
    "Standard operating procedures. Everything went normally."
]

# Create DataFrame
review_data = {
    'sentiment': ['positive'] * 20 + ['negative'] * 20 + ['neutral'] * 20,
    'review_text': positive_reviews + negative_reviews + neutral_reviews
}

df = pd.DataFrame(review_data)

# Save to CSV
df.to_csv('bpi_review_samples.csv', index=False)
print("✅ Review samples saved to 'bpi_review_samples.csv'")
print(f"Total samples: {len(df)} ({len(positive_reviews)} positive, {len(negative_reviews)} negative, {len(neutral_reviews)} neutral)")
print("\nFirst few samples:")
print(df.head())