import pandas as pd

df = pd.read_csv('metro-bike-share-trip-data.csv')


time_station_match = []
for hour in range(24):
    hour_mask = df['Start Time'].map(lambda x: x.hour) == hour
    filtered = df[hour_mask]
    most_common = filtered['Ending Station ID'].value_counts()
    time_station_match.append(most_common)

time_station = pd.concat(time_station_match, axis=1)
time_station.columns = ['Hour ' + str(i) for i in range(24)]

most_used_station = []
for i in range(24):
    max_stations = time_station['Hour {}'.format(i)].nlargest(n=5)
    most_used_station.append(max_stations)

most_used_df = pd.concat(most_used_station, axis=1)