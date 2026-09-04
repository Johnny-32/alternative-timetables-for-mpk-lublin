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
### First page - inspired by mpk.krakow.pl
List of lines grouped by type bus, trolleybus, night bus (maybe special lines and express lines)
### Line page - inspired by jakdojade.pl
Without "Main route" only with "All variants"
Add all trip headsigns (e.g. 150 Mełgiewska WSEI/Pancerniaków)
### Stop page for a line - inspired by jakdojade.pl "Show full timetable"
Ability to choose for which the day the timetable is valid (out of 9 days)

### Via stop:
### First page - inspired by wtp.waw.pl
Long list of all stops including a search feature, stops don't include stop numbers id's so e.g. Plac Litewski
### Stop page group - e.g. Plac Litewski - inspired by wtp.waw.pl
User can go to a stop page for a line or by clicking a line in a stop
or to a stop page for a line
Lines that don't run for the selected day will be grayed out
### Stop page - inspired by jakdojade.pl "Departures"
Ability to choose which lines are displayed and also a button to select all

### By clicking on a specific trip in a stop page or a stop page for a line we'll be redirected to a trip view


## Future features
- Make timetables for each line/stop combination, just like MPK Lublin
- Make a custom template for these timetables
- Make PDF files with timetables, like in main-python branch
- Add checking for new GTFS files and automatically downloading them
