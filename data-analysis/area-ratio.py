import collections
import json
import pandas as pd


df = pd.read_csv('data/metro-bike-share-trip-data.csv')

with open('stations.json', 'r') as f:
    data = json.load(f)

ending_stations = df['Ending Station ID']
ending_counts = ending_stations.value_counts()

ending_counts.index = ending_counts.index.astype(int)

results = collections.defaultdict(int)

print(data)
for i in range(len(ending_counts)):
    station = ending_counts.index[i]
    area = data['stations'][str(station)]['area']

    results[area] += int(ending_counts.iloc[i])

data['areaRideCounts'] = results

with open('stations.json', 'w') as f:
    json.dump(data, f)
