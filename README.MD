# New timetable for MPK Lublin buses
This project aims to make a better looking and simpler timetable for MPK Lublin buses and also show some cool and useful features based on it.

## Technologies
- Python
- node-GTFS

## How it works (as of now)
- Modifying GTFS file (courtesy of [MKuran](https://mkuran.pl/gtfs/)) - changing calendar dates to days of the week, removing whitespaces, adding direction_id and trip_headsign to trips.txt, so that GTFS-to-HTML can properly generate timetables
- Preparing data for the website via [node-GTFS](https://github.com/BlinkTagInc/node-gtfs)

## For developers

### Prerequisites
#### uv

- **macOS and Linux**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

- **Windows**
```PowerShell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### Node.js

- Download Node.js LTS version [here](https://nodejs.org/en/download)

#### Visual Studio Build Tools

From Desktop development with C++ pick: 
- MSVC – C++ build tools
- Windows 10/11 SDK

### Installation...

1. Clone the repo
```bash
git clone https://github.com/Johnny-32/alternative-timetables-for-mpk-lublin.git
```
2. Install NPM packages
```bash
npm install
```

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


## Roadmap
- [ ] Make timetables for each line/stop combination, just like MPK Lublin
- [ ] Make a custom template for these timetables
- [ ] Make PDF files with timetables, like in main-python branch
- [ ]Add checking for new GTFS files and automatically downloading them

## In the distant future
- Make map-first website (inspired by mpk.krakow.pl)
- For each stop add a next stop name for easier stop identification (inspired by wtp.waw.pl) e.g. Plac Litewski 01 >> Ogród Saski
- Compatibility with GTFS data of other cities than Lublin
- GTFS-RT compatibility (realtime departures, route changes)
- Trip planner via OpenTripPlanner
- Displaying unique data (like frequencies, operating hours) in an attractive format (maybe with GTFSwizard)
