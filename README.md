# New timetable for MPK Lublin buses
This project aims to make a better looking and more modern timetables for MPK Lublin

## Technologies
- Python
- HTML, CSS
- Playwright

## How it works
- Getting an .html file from the MPK Lublin website using [requests](https://pypi.org/project/requests/)
- Parsing a table from an .html file using [Beautiful Soup](https://beautiful-soup-4.readthedocs.io/en/latest/)
- Manipulating the data, so that it can be exported to HTML using [Jinja2](https://jinja.palletsprojects.com/)
- Making a PDF file with a timetable using [Playwright](https://playwright.dev/python/)
- Calculating frequencies on the specific line, the stop and time of day, using my own algorithm

## To do:
- Make a proper logo with a barcode with my GitHub project url
- Make a disclaimer on the left, below the stop and street list
- Add a color scheme for night lines (like in Vienna)
- Add in JS proper height (stop list will take as much space as possible and the text will shrink in order to fit if it's too big)
- Add in JS proper width (stop list will no longer overflow out of the document)

## Currently working on:
Making a Vienna style timetable

## Future plans
- Make an Amsterdam style timetable and make it ready for publishing
- Make a variation of Munich's, and maybe make a Copenhagen style timetable for the whole route
- Test frequency algorithm on a variety of MPK Lublin lines and stops (including these in non-holiday timetables)
- A website that will display a specific timetable picked by a user, in an HTML format with an option to export to PDF in a print-friendly format
- Add retrieving data from GTFS instead of .html (probably via GTFS-to-HTML)
- Make a tier list with bus lines (separate tier list for each time ex. weekdays and then maybe group them into categories for ex. key lines have a frequency of 15 minutes during rush hour, 30 minutes on saturdays...)


### Maybe in the distant future
- Add timetables in different formats for example:
  - MPK Lublin style - with columns corresponding to different hours
  - SL Stockholm style - one timetable for the whole line with departure times only for most important stops and departures that are read like a book (from left to right and top to bottom)
- A section that lets user pick two bus stops and then show all departures from A to B and B to A and their corresponding lengths (maybe I'll add a timer that will show time to a next departure)
- Add realtime departure board for stops and for routes 

## Usage
Will be updated in the future.
