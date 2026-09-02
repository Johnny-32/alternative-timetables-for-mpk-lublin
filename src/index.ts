import {closeDb} from "gtfs";
import {loadGtfs} from "./gtfs/loader.js";
import {getDatesForServiceId, getNext9Days, getServiceIdsForDates} from "./gtfs/services.js";

const db = loadGtfs();

try {
    const dates = getNext9Days();
    // const result = await getServiceIdsForDates(dates);
    const result = await getDatesForServiceId(dates);
    console.log(result);
} finally {
    closeDb(db);
}