from datetime import datetime
import re
import pandas as pd


def extract_clean_date(val):
    """Extracts an 8-digit YYYYMMDD date from strings like '2026-08-14_IN', '2026-08-14', or '20260814'."""
    match = re.search(r'(\d{4})[-_]?(\d{2})[-_]?(\d{2})', str(val))
    if match:
        return f'{match.group(1)}{match.group(2)}{match.group(3)}'
    return None


def get_service_category(raw_val):
    """Maps a date string to WEEKDAY, SATURDAY, or SUNDAY."""
    clean_date = extract_clean_date(raw_val)
    if clean_date:
        dt = datetime.strptime(clean_date, '%Y%m%d')
        weekday = dt.weekday()  # 0=Mon, 4=Fri, 5=Sat, 6=Sun
        if weekday < 5:
            return 'WEEKDAY', clean_date
        elif weekday == 5:
            return 'SATURDAY', clean_date
        else:
            return 'SUNDAY', clean_date
    return 'WEEKDAY', None


def main(files):

    trips = files['trips.txt']
    calendar_dates = files['calendar_dates.txt']

    service_map = {}
    extracted_dates = []

    # Map each service_id to its day-of-week category
    for _, row in calendar_dates.iterrows():
        sid = str(row['service_id']).strip()

        # Try cleaning from 'date' column first, fallback to service_id
        date_val = (
            row['date']
            if 'date' in row and pd.notna(row['date'])
            else sid
        )
        category, clean_dt = get_service_category(date_val)

        if clean_dt is None and date_val != sid and extract_clean_date(sid):
            category, clean_dt = get_service_category(sid)

        service_map[sid] = category
        if clean_dt:
            extracted_dates.append(clean_dt)

    min_date = min(extracted_dates) if extracted_dates else '20260101'
    max_date = max(extracted_dates) if extracted_dates else '20261231'

    # Update trips.txt service_ids to WEEKDAY / SATURDAY / SUNDAY
    trips['service_id'] = (
        trips['service_id']
        .astype(str)
        .str.strip()
        .map(lambda x: service_map.get(x, 'WEEKDAY'))
    )

    # Build standard calendar.txt dataframe
    calendar_df = pd.DataFrame([
        {
            'service_id': 'WEEKDAY',
            'monday': 1,
            'tuesday': 1,
            'wednesday': 1,
            'thursday': 1,
            'friday': 1,
            'saturday': 0,
            'sunday': 0,
            'start_date': min_date,
            'end_date': max_date,
        },
        {
            'service_id': 'SATURDAY',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 1,
            'sunday': 0,
            'start_date': min_date,
            'end_date': max_date,
        },
        {
            'service_id': 'SUNDAY',
            'monday': 0,
            'tuesday': 0,
            'wednesday': 0,
            'thursday': 0,
            'friday': 0,
            'saturday': 0,
            'sunday': 1,
            'start_date': min_date,
            'end_date': max_date,
        },
    ])

    empty_cal_dates = pd.DataFrame(
        columns=['service_id', 'date', 'exception_type']
    )

    files['calendar.txt'] = calendar_df
    files['calendar_dates.txt'] = empty_cal_dates
    files['trips.txt'] = trips

    return files
