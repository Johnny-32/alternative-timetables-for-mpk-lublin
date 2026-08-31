import {closeDb} from "gtfs";
import {loadGtfs} from "./gtfs/loader.js";
import {getAllCalendarDates} from "./gtfs/services.js";

const db = loadGtfs();

try {
    const calendarDates = getAllCalendarDates();
    console.table(calendarDates);
} finally {
    closeDb(db);
}