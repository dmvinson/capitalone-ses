import pandas as pd
from distance import get_distance

df = pd.read_csv('metro-bike-share-trip-data.csv')
df['Start Time'] = pd.to_datetime(df['Start Time'])
df['End Time'] = pd.to_datetime(df['End Time'])


df['Distance'] = df.apply(get_distance, axis=1)

hourly_counts = []
hourly_duration_average = []
hourly_distance_average = []
for hour in range(24):
    hour_mask = df['Start Time'].map(lambda x: x.hour) == hour
    filtered = df[hour_mask]
    filtered_count = filtered['Trip ID'].count()
    hourly_counts.append(filtered_count)
    hourly_duration_average.append(filtered['Duration'].mean())
    hourly_distance_average.append(filtered['Distance'].mean())
