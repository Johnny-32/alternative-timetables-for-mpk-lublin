import {closeDb} from "gtfs";
import {loadGtfs} from "./gtfs/loader.js";
import {getLinesForStop, getStopGroups} from "./gtfs/stops.js"
import {getRouteData, getVariantsForRoute} from "./gtfs/route.js";

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

// try {
//     const stopGroupList = getStopGroups();
//     console.log(stopGroupList);
// }

// try {
//     const lines = getLinesForStop('1042');
//     console.log(lines);
// }

try {
    const res = getRouteData('3');
    console.dir(res, {depth: null});
}

finally {
    closeDb(db);
}