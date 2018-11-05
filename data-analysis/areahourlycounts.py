import collections
import json
from math import isnan
import pandas as pd

df = pd.read_csv('data/metro-bike-share-trip-data.csv')
df['Start Time'] = pd.to_datetime(df['Start Time'])


with open('stations.json', 'r') as f:
    data = json.load(f)


def get_hourly_counts(neighborhood):
    neighborhood_stations = [station for station in data['stations']
                             if data['stations'][station]['area'] == neighborhood]
    hourly_counts = []
    for hour in range(24):
        hour_mask = df['Start Time'].map(lambda x: x.hour) == hour
        filtered = df[hour_mask]
        filtered_count = 0
        for i in range(len(filtered)):
            row = filtered.iloc[i]
            if isnan(row['Ending Station ID']):
                continue
            else:
                station = str(int(row['Ending Station ID']))
            filtered_count += 1 if station in neighborhood_stations else 0
        hourly_counts.append(filtered_count)
    return hourly_counts


neighborhoods = data['areaStationCounts'].keys()

results = {}

for n in neighborhoods:
    results[n] = get_hourly_counts(n)

data['areaHourlyCounts'] = results

with open('stations.json', 'w') as f:
    json.dump(data, f)
