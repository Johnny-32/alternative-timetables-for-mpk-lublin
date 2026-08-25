# New timetable for MPK Lublin buses
This project aims to make a better looking and simpler timetable for MPK Lublin buses and also show some cool and useful features based on it.

## Technologies
- Python
- [GTFS-to-HTML](https://gtfstohtml.com/)

## How it works
- Modifying GTFS file (courtesy of [zbiorkom.live](https://zbiorkom.live/warsaw/blog/otwarte-dane-4VIz7Imv6dDIIy6j2e87Cs)) - changing calendar dates to days of the week, removing whietspaces, adding direction_id and trip_headsign to trips.txt, so that GTFS-to-HTML can properly generate timetables
- Generating the timetables (web based) using GTFS-to-HTML

##Future features
- Make timetables for each line/stop combination, just like MPK Lublin
- Make a custom template for these timetables
- Make pdf files with timetables, like in main-python branch
- Add checking for new GTFS files and automatically downloading them

