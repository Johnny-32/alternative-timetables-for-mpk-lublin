import zipfile
import pandas as pd

def load_gtfs(input_zip):
    files = {}

    with zipfile.ZipFile(input_zip, 'r') as z:
        for filename in z.namelist():

            if filename in {
                'calendar_dates.txt',
                'routes.txt',
                'stop_times.txt',
                'trips.txt'
            }:
                files[filename] = pd.read_csv(z.open(filename))
            elif filename == 'stops.txt':
                files[filename] = pd.read_csv(z.open(filename), dtype={'stop_code': str})
            else:
                files[filename] = z.read(filename)

    return files


def save_gtfs(files, output_zip):

    with zipfile.ZipFile(
        output_zip, 'w', compression=zipfile.ZIP_DEFLATED
    ) as z:

        for filename, data in files.items():

            if isinstance(data, pd.DataFrame):
                csv_data = data.to_csv(index=False)
                z.writestr(filename, csv_data)
            else:
                z.writestr(filename, data)