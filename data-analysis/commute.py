import pandas as pd

df = pd.read_csv('metro-bike-share-trip-data.csv')


def mask_filter(row):
    hour = row.hour
    return ((hour > 6 and hour < 10) or (hour > 3 and hour < 7))


mask = df['Start Time'].apply(mask_filter)

commuters = df[mask]

commuter_passes = commuters['Passholder Type'].value_counts()
"""
Monthly Pass    16029
Walk-up          3179
Flex Pass        1387
Staff Annual       82
"""

commuting_trips = commuters['Trip ID'].count()  # 20677


def get_season(week_num):
    if week_num in range(9) or week_num in range(49, 52):
        return 'Winter'
    elif week_num in range(9, 22):
        return 'Spring'
    elif week_num in range(22, 36):
        return 'Summer'
    elif week_num in range(36, 49):
        return 'Fall'


# Get weekly counts
counts = {}
season_counts = {
    'Winter': 0,
    'Spring': 0,
    'Fall': 0,
    'Summer': 0
}
for year in [2016, 2017]:
    for week in range(52):
        week_mask = commuters['Start Time'].map(
            lambda x: (x.year, x.week)) == (year, week)
        season = get_season(week)
        weekly_commutes = commuters.loc[week_mask]
        count = weekly_commutes['Trip ID'].count()
        season_counts[season] += count
        counts[(year, week)] = count

# Remove nonexistent year-month combos
counts = {k: counts[k] for k in counts if counts[k] > 0}
season_counts = [[k, season_counts[k]] for k in season_counts]

commuters['Ending Station ID'].value_counts()

average_trips = sum(counts.values())/len(counts)
