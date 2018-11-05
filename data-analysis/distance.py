import pandas as pd
import numpy as np
from geopy import distance

def get_distance(row):
    start = (row['Starting Station Latitude'], row['Starting Station Longitude'])
    stop = (row['Ending Station Latitude'], row['Ending Station Longitude'])
    try:
        return distance.distance(start, stop).meters
    except ValueError: # NaN coordinates
        return np.nan


df = pd.read_csv('data/metro-bike-share-trip-data.csv')

df['Distance'] = df.apply(get_distance, axis=1)

# mask to filter our round trips since we can't know distance travelled
zero_mask = df['Distance'].map(lambda x: x) != 0


average = df['Distance'][zero_mask].mean()

# 5427.192425600836