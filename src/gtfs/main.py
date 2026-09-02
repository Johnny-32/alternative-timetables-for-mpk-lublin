from add_directions_and_headsigns import main as add_direction_id_and_headsigns
from reduce_trips_and_stop_times import main as reduce_trips_and_stop_times
from gtfs_io import load_gtfs, save_gtfs
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def main():
    files = load_gtfs(os.path.join(DATA_DIR, 'gtfs-lublin.zip'))

    files = reduce_trips_and_stop_times(files)
    files = add_direction_id_and_headsigns(files)

    save_gtfs(files, os.path.join(DATA_DIR, 'gtfs-lublin-fixed.zip'))

if __name__ == '__main__':
    main()
