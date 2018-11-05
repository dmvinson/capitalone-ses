import pandas as pd

df = pd.read_csv('metro-bike-share-trip-data.csv')

df['Start Time'] = pd.to_datetime(df['Start Time'])
df['End Time'] = pd.to_datetime(df['End Time'])

def get_duration(row):
    start = row['Start Time']
    end = row['End Time']
    if pd.isna(start) or pd.isna(end):
        return pd.NaT
    delta = end - start
    return delta

df['Duration'] = df.apply(get_duration, axis=1)

average = df['Duration'].mean()