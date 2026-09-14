import {closeDb} from "gtfs";
import {loadGtfs} from "./gtfs/loader.js";
import {getLinesForStop, getStopGroups} from "./gtfs/stops.js"
import {getRouteData, getVariantsForRoute} from "./gtfs/route.js";
import {
    getAllSchedulesForLineAndStop,
    getDayOfWeekString,
    getDisplayDayAndMonth,
    getHourGroupsForStopAndLineAndServiceId
} from "./gtfs/stop-schedule.js";
import {getServiceIdsAndDates} from "./gtfs/services.js";

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

// try {
//     const res = getRouteData('55');
//     console.dir(res, {depth: null});
// }

// try {
//     const res = getStopTimesForStopAndLineAndServiceId('2026-09-04_PN', '39', 0, '1041');
//     console.dir(res, {depth: null});
// }

// try {
//     const { serviceIdsByDate, datesByServiceId } = getServiceIdsAndDates();
//     console.dir(serviceIdsByDate, { depth: null });
//     console.dir(datesByServiceId, { depth: null });
// }

try {
    const res = getAllSchedulesForLineAndStop('N2', 0, '1042');
    console.dir(res, { depth: null });
}

finally {
    closeDb(db);
}