import {closeDb} from "gtfs";
import {loadGtfs} from "./gtfs/loader.js";
import {getLinesForStop, getStopGroups} from "./gtfs/stops.js"
import {getRouteData, getStopIdList, getStopNameList, getVariantsForRoute} from "./gtfs/route.js";
import {
    getAllSchedulesForLineAndStop, getChangesToDisplayOnThisStopAndLine,
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
//     const res = getRouteData('8');
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

// try {
//     const res = getAllSchedulesForLineAndStop('N2', 0, '1042');
//     console.dir(res, { depth: null });
// }

try {
    const routeData = getRouteData('7');
    const routeDataDir = routeData.get(0);
    const changesRd = routeDataDir?.changes;
    const mainRd = routeDataDir?.mainStops;
    const changes = getChangesToDisplayOnThisStopAndLine('6752', mainRd!, changesRd!);

    console.dir(changes, { depth: null });
}

// try {
//     console.dir(getRouteData('55'), { depth: null });
// }

// try {
//     const routeData = getRouteData('55');
//     const routeDataDir = routeData.get(1);
//     const changesRd = routeDataDir?.changes;
//     const mainRd = routeDataDir?.mainStops;
//     const stopIdList = getStopIdList(mainRd!, changesRd!);
//     console.log(getStopNameList(stopIdList));
// }

finally {
    closeDb(db);
}