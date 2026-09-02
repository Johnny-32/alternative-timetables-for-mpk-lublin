from datetime import datetime, timedelta


# Only the next 9 days will be parsed from calendar_dates
# (and also trips and stop_times will need to be truncated as well).
# ISSUE: Night lines that stretch both days
# FIX: If the stop_times go beyond 24:00:00, we can flag this stop time as one that goes beyond designated day,
# and we can flag it as e.g. fri/sat

def get_next_9_days():
    now = datetime.now()
    dates = []

    i = 1
    while i <= 9:
        formatted_date_str = now.strftime('%Y%m%d')
        dates.append(int(formatted_date_str))
        now += timedelta(days=1)
        i += 1

    return dates


def main(files):
    calendar_dates = files['calendar_dates.txt']
    trips = files['trips.txt']
    stop_times = files['stop_times.txt']

    dates = get_next_9_days()

    calendar_dates = calendar_dates[
        calendar_dates['date'].isin(dates)
    ]

    trips = trips[
        trips['service_id'].isin(calendar_dates['service_id'])
    ]

    stop_times = stop_times[
        stop_times['trip_id'].isin(trips['trip_id'])
    ]

    files['calendar_dates.txt'] = calendar_dates
    files['trips.txt'] = trips
    files['stop_times.txt'] = stop_times

    return files
