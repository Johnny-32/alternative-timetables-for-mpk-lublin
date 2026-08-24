def lcs_length(a, b):
    n, m = len(a), len(b)

    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i][j - 1], dp[i - 1][j])

    return dp[n][m]

def main(files):
    stops = files['stops.txt']
    stop_times = files['stop_times.txt']
    trips = files['trips.txt']

    # Trim stop names
    stops['stop_name'] = stops['stop_name'].str.strip()

    # stop_times = stop_times.sort_values(
    #     ['trip_id', 'stop_sequence']
    # ).copy()

    # Filter rows containing 'Zajezdnia' and containing NO fully uppercase words
    depot_stops_dict = (
        stops.loc[
            stops['stop_name'].str.contains('Zajezdnia', na=False) &
            ~stops['stop_name'].str.contains(r'\b[A-Z-]+\b', regex=True),
            ['stop_id', 'stop_name']
        ]
        .set_index('stop_id')
        ['stop_name']
        .to_dict()
    )

    # Filter trips that include a deopt
    depot_trip_ids = stop_times.loc[
        stop_times['stop_id'].isin(depot_stops_dict.keys()),
        'trip_id'
    ].unique()

    # Remove stop_times that are from a depot
    stop_times = stop_times[
            ~stop_times['trip_id'].isin(depot_trip_ids)
    ]

    # Remove trips that include a depot
    trips = trips[
            ~trips['trip_id'].isin(depot_trip_ids)
    ]

    # Adding route_id and stop_name columns to stop_times df

    merged = stop_times.merge(trips[['trip_id', 'route_id']], on='trip_id')
    merged = merged.merge(stops[['stop_id', 'stop_name']], on='stop_id')

    # merged = merged.sort_values(['trip_id', 'stop_sequence'])

    # Deleting trips from a terminus to a stop (they are not present in the MPK Lublin website),
    # while keeping shuttle services like line 'Gaj'

    two_stop_trips_to_remove = []

    for route_id, route_group in merged.groupby('route_id'):
        trip_lengths = route_group.groupby('trip_id').size()

        if trip_lengths.max() >= 3:
            for trip_id, trip_group in route_group.groupby('trip_id'):
                if len(trip_group) <= 2:
                    two_stop_trips_to_remove.append(trip_id)


    trips = trips[~trips['trip_id'].isin(two_stop_trips_to_remove)]
    stop_times = stop_times[~stop_times['trip_id'].isin(two_stop_trips_to_remove)]
    merged = merged[~merged['trip_id'].isin(two_stop_trips_to_remove)]


    # Adding trip_headsign

    headsigns = {}

    for route_id, route_group in merged.groupby('route_id'):
        for trip_id, trip_group in route_group.groupby('trip_id'):
            headsign = trip_group['stop_name'].iloc[-1]
            headsigns[trip_id] = headsign

    trips['trip_headsign'] = trips['trip_id'].map(headsigns)
    merged['trip_headsign'] = merged['trip_id'].map(headsigns)


    # Adding direction_id in 3 steps:

    # 1. If the route has only 2 unique headsigns, then we can assign direction_id based on that,
    # headsign of the first trip will be assigned to direction_id = 0, the other one to direction_id = 1

    direction_ids = {}

    for route_id, route_group in merged.groupby('route_id'):
        unique_headsigns = route_group['trip_headsign'].unique()

        if len(unique_headsigns) == 2:
            first_headsign = unique_headsigns[0]

            for trip_id, trip_group in route_group.groupby('trip_id'):
                trip_headsign = trip_group['trip_headsign'].iloc[0]
                direction_id = 0 if trip_headsign == first_headsign else 1
                direction_ids[trip_id] = int(direction_id)

        else:

            shared_stop_names = None

            for trip_id, trip_group in route_group.groupby('trip_id'):
                current_trip_stops = set(trip_group['stop_name'])

                if shared_stop_names is None:
                    shared_stop_names = current_trip_stops
                else:
                    shared_stop_names = shared_stop_names.intersection(current_trip_stops)

            # 2. For routes with more than 2 unique headsigns:
            #
            # Assumption: even though the variants differ (different start/end stops),
            # all trips on the route share a common "trunk" - the same stops somewhere
            # in the middle of the trip.
            #
            # Algorithm:
            #   1. Find the set of stops shared by ALL trips on this route
            #      (intersection of stop_name sets, same as shared_stop_names computed earlier).
            #   2. From this shared set, pick two stops to use as reference points
            #      (the first and last stop of the shared trunk, in stop_sequence order).
            #   3. Pick the first trip as the "reference" trip and check the order of these
            #      two stops in its stop_sequence - this defines what direction_id = 0 means.
            #      E.g. if in the reference trip stop_a comes before stop_b -> that's direction_id = 0.
            #   4. For every other trip, check the order of stop_a and stop_b in its stop_sequence:
            #        - stop_a before stop_b -> direction_id = 0 (same direction as the reference trip)
            #        - stop_b before stop_a -> direction_id = 1 (opposite direction)

            if len(shared_stop_names) >= 2:
                first_trip_id = route_group['trip_id'].iloc[0]
                first_trip = route_group[route_group['trip_id'] == first_trip_id]

                stop_sequence_map = dict(zip(first_trip['stop_name'], first_trip['stop_sequence']))

                sorted_shared_stops = sorted(shared_stop_names, key=lambda name: stop_sequence_map[name])

                stop_a, stop_b = sorted_shared_stops[0], sorted_shared_stops[-1]

                for trip_id, trip_group in route_group.groupby('trip_id'):
                    pos_of_stop_a = trip_group.loc[trip_group['stop_name'] == stop_a, 'stop_sequence'].iloc[0]
                    pos_of_stop_b = trip_group.loc[trip_group['stop_name'] == stop_b, 'stop_sequence'].iloc[0]

                    if pos_of_stop_a < pos_of_stop_b:
                        direction_id = 0
                    else:
                        direction_id = 1

                    direction_ids[trip_id] = int(direction_id)

            # 3. For routes with less than 2 shared_stops (oftentimes 0)
            # We'll use LCS (Longest common subsequence) to find stop_ids that match the longest trip,
            # if most of them match direction_id = 0, if not direction_id = 1

            else:
                trip_lengths = route_group.groupby('trip_id').size()

                longest_trip_id = trip_lengths.idxmax()
                longest_trip_stop_ids = route_group[route_group['trip_id'] == longest_trip_id]['stop_id'].tolist()

                for trip_id, trip_group in route_group.groupby('trip_id'):
                    current_trip_stop_ids = trip_group['stop_id'].tolist()
                    current_trip_stop_ids_reverse = current_trip_stop_ids[::-1]

                    lcs_length_normal = lcs_length(longest_trip_stop_ids, current_trip_stop_ids)
                    lcs_length_reverse = lcs_length(longest_trip_stop_ids, current_trip_stop_ids_reverse)

                    denominator = min(len(longest_trip_stop_ids), len(current_trip_stop_ids))

                    score_normal = lcs_length_normal / denominator
                    score_reverse = lcs_length_reverse / denominator

                    if score_normal > score_reverse:
                        direction_id = 0
                    else:
                        direction_id = 1

                    direction_ids[trip_id] = int(direction_id)

    trips['direction_id'] = trips['trip_id'].map(direction_ids)

    files['stops.txt'] = stops
    files['stop_times.txt'] = stop_times
    files['trips.txt'] = trips

    return files
