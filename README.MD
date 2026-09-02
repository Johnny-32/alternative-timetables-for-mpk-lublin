# New timetable for MPK Lublin buses
This project aims to make a better looking and simpler timetable for MPK Lublin buses and also show some cool and useful features based on it.

## Technologies
- Python
- node-GTFS (in the future)

## How it works
- Modifying GTFS file (courtesy of [MKuran](https://mkuran.pl/gtfs/)) - changing calendar dates to days of the week, removing whitespaces, adding direction_id and trip_headsign to trips.txt, so that GTFS-to-HTML can properly generate timetables
- Generating the timetables (web based) using GTFS-to-HTML

## Graphical side - two paths: via line, via stop

### Via line:
### First page - inspired by wtp.waw.pl
"select a line:" header with all the lines grouped by type bus, trolleybus, night bus,
(maybe special lines and express lines)
Lines that don't run for the selected day will be grayed out
### Line page - inspired by wtp.waw.pl
With stop numbers and street names like in Warsaw
Choosing direction and within direction trip patterns like in Berlin
### Stop page for a line - e.g. Plac Litewski 02 for line 32 - inspired by wtp.waw.pl "rozkład jazdy"
Timetable in a format: first column as hours rest as minutes
Ability to choose for which the day the timetable is valid (out of 9 days)

### Via stop:
### First page - inspired by wtp.waw.pl
Long list of all stops including a search feature, stops don't include stop numbers id's so e.g. Plac Litewski
### Stop page group - e.g. Plac Litewski - inspired by wtp.waw.pl
User can go to a stop page or by clicking a line in a stop, to a stop page for a line
Lines that don't run for the selected day will be grayed out
### Stop page - e.g. Plac Litewski 02 - inspired by wtp.waw.pl
User can go to a stop page for a line from here
Add filtering by line and highlighting the soonest departures


## Future features
- Make timetables for each line/stop combination, just like MPK Lublin
- Make a custom template for these timetables
- Make PDF files with timetables, like in main-python branch
- Add checking for new GTFS files and automatically downloading them
