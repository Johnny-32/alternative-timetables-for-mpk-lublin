from add_service_categories import main as add_service_categories
from add_directions_and_headsigns import main as add_direction_id_and_headsigns
from gtfs_io import load_gtfs, save_gtfs


def main():
    files = load_gtfs('lublin-zbiorkom.zip')

    files = add_service_categories(files)
    files = add_direction_id_and_headsigns(files)

    save_gtfs(files, 'lublin-zbiorkom-fixed.zip')

if __name__ == '__main__':
    main()
