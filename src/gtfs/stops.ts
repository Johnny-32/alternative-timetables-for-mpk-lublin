import {loadGtfs} from "./loader.js";
import {getStoptimes, getTrips} from "gtfs";
import {getRouteTypes, type RouteData} from "./routes.js"
import {typeOrder} from "./routes.js"

type GeographicCoordinates = {
    stopLongitude: number | null;
    stopLatitude: number | null;
}

type Stop = {
    id: string;
    nameAndStopCode: string;
    geographicCoordinates: GeographicCoordinates;
    streetName: string
    lines: string[];
};

type StopGroup = {
    name: string;
    stops: Stop[];
};

type RawStopRow = {
    stop_id: string;
    stop_name: string | null;
    stop_code: string | null;
    stop_lat: number | null;
    stop_lon: number | null;
    street_name: string | null;
}

export function getLinesForStop(id: string): string[] {
    const allStopTimes = getStoptimes({stop_id: id});
    const routeData = getRouteTypes();

    return [...new Set(
        allStopTimes
            .flatMap(stop_time =>
                getTrips({trip_id: stop_time.trip_id}, ['route_id'])
            )
            .map(trip => trip.route_id)
    )].sort((a, b) => {
        const aType = routeData.get(a)?.type;
        const bType = routeData.get(b)?.type;

        if (aType !== bType) {
            return typeOrder[aType!] - typeOrder[bType!];
        }

        const aNum = /^\d+$/.test(a);
        const bNum = /^\d+$/.test(b);

        if (aNum && bNum) return Number(a) - Number(b);
        if (aNum) return -1;
        if (bNum) return 1;

        return a.localeCompare(b);
    });
}

export function getStopGroups(): StopGroup[] {
    const db = loadGtfs();

    const allStops = db
        .prepare('SELECT stop_id, stop_name, stop_code, stop_lat, stop_lon, street_name FROM stops')
        .all() as RawStopRow[];

    const stopGroupsMap = new Map<string, Stop[]>();

    for (const oneStop of allStops) {
        const oneStopId = oneStop.stop_id;

        const lines = getLinesForStop(oneStopId);

        const oneStopName = oneStop.stop_name
            ? oneStop.stop_name
            : '';

        const nameAndStopCode = oneStop.stop_code
            ? `${oneStopName} ${oneStop.stop_code}`
            : `${oneStopName}`;

        const geographicCoordinates: GeographicCoordinates = {
            stopLongitude: oneStop.stop_lon,
            stopLatitude: oneStop.stop_lat
        };

        const stop: Stop = {
            id: oneStopId,
            nameAndStopCode: nameAndStopCode,
            geographicCoordinates: geographicCoordinates,
            streetName: oneStop.street_name ?? '',
            lines: lines
        }

        const stopGroupName = oneStopName.replace(/ NŻ$/, '').trim();

        const existingGroup = stopGroupsMap.get(stopGroupName);
        if (existingGroup) {
            existingGroup.push(stop);
        } else {
            stopGroupsMap.set(stopGroupName, [stop]);
        }
    }

    return Array.from(stopGroupsMap, ([name, stops]) => ({
        name, stops
    }));
}