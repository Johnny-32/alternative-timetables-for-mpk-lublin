import {closeDb} from "gtfs";
import {loadGtfs} from "./gtfs/loader.js";
import {getStopGroups} from "./gtfs/stops.js"

const db = loadGtfs();

// try {
//     const dates = getDatesFromCalendarDates();
//     const {
//         serviceIdsByDate,
//         datesByServiceId,
//     } = getServiceIdsAndDates(dates);
//     console.log(serviceIdsByDate);
//     console.log(datesByServiceId);
// }

// try {
//     const routeTypes = getRouteTypes();
//     console.log(routeTypes);
// }

try {
    const stopGroupList = getStopGroups();
    console.log(stopGroupList);
}
finally {
    closeDb(db);
}