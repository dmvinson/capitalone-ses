import json
import collections
import pandas as pd
import requests
import time

from geocode import reverse_geocode

with open('stations.json', 'r') as f:
    data = json.load(f)

df = pd.read_csv('data/metro-bike-share-trip-data.csv')

starting_stations = df['Starting Station ID']
ending_stations = df['Ending Station ID']

starting_counts = starting_stations.value_counts()
ending_counts = ending_stations.value_counts()

starting_counts.index = starting_counts.index.astype(int)
ending_counts.index = ending_counts.index.astype(int)

# Generate Station name, location, and start/end popularity
result = collections.defaultdict(dict)
for i in range(len(starting_counts)):
    startStation = starting_counts.index[i]
    startingLat, startingLong = df.iloc[startStation][
        'Starting Station Latitude'], df.iloc[startStation]['Starting Station Longitude']
    # Convert to regular int, json.dump can't handle int64
    result[int(startStation)]['startRanking'] = i + 1
    result[int(startStation)]['location'] = [startingLat, startingLong]
    endStation = ending_counts.index[i]
    result[int(endStation)]['endRanking'] = i + 1

# Add station neighborhoods to result
for station in result:
    time.sleep(2)  # Don't poll too much to help our open source friends
    station_info = reverse_geocode(result[station]['location'])
    result[station]['area'] = station_info['address']['neighbourhood']
    try:
        result[station]['place'] = station_info['address']['road']
    except:
        if 'name' in station_info:
            result[station]['place'] = station_info['name']
        else:
            result[station]['place'] = station_info['neighbourhood']


for station in result:
    station_id = int(station)
    starting_trips_mask = df['Starting Station ID'] == station_id
    starting_trips = df[starting_trips_mask]
    ending_trips_mask = df['Ending Station ID'] == station_id
    ending_trips = df[ending_trips_mask]

    one_way_starts = starting_trips[starting_trips['Trip Route Category'] == 'One Way']
    most_common_to = one_way_starts.groupby('Ending Station ID').count(
    ).reset_index().sort_values(by='Trip ID', ascending=False)['Ending Station ID'].iloc[0]
    most_common_to = str(int(most_common_to))

    one_way_ends = ending_trips[ending_trips['Trip Route Category'] == 'One Way']
    most_common_from = one_way_ends.groupby('Starting Station ID').count().reset_index(
    ).sort_values(by='Trip ID', ascending=False)['Starting Station ID'].iloc[0]
    most_common_from = str(int(most_common_from))
    result[station]['mostCommonTo'] = most_common_to
    result[station]['mostCommonFrom'] = most_common_from

    involved_trips = df[starting_trips_mask | ending_trips_mask]
    has_distance_mask = involved_trips['Distance'].notnull()
    average_distance = involved_trips[has_distance_mask]['Distance'].mean()
    result[station]['averageDistance'] = average_distance if not pd.isna(
        average_distance) else None

    has_duration_mask = involved_trips['Duration'].notnull()
    result[station]['averageTime'] = involved_trips[has_duration_mask]['Duration'].mean()
    result[station]['totalTrips'] = len(involved_trips)


# Count stations per area
area_station_counts = collections.defaultdict(int)
for station in result:
    area_station_counts[result[station]['area']] += 1

data['stations'] = result
data['areaStationCounts'] = area_station_counts


with open('stations.json', 'w') as f:
    json.dump(data, f)
