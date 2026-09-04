import {loadGtfs} from "./loader.js";

type GeographicCoordinates = {
    stopLongitude: number | null;
    stopLatitude: number | null;
}

type Stop = {
    id: string;
    nameAndStopCode: string;
    geographicCoordinates: GeographicCoordinates;
    streetName: string
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

export function getStopGroups(): StopGroup[] {
    const db = loadGtfs();

    const allStops = db
        .prepare('SELECT stop_id, stop_name, stop_code, stop_lat, stop_lon, street_name FROM stops')
        .all() as RawStopRow[];

    const stopGroupsMap = new Map<string, Stop[]>();

    for (const oneStop of allStops) {
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
            id: oneStop.stop_id,
            nameAndStopCode: nameAndStopCode,
            geographicCoordinates: geographicCoordinates,
            streetName: oneStop.street_name ?? ''
        }

        const stopGroupName = oneStopName.replace(' NŻ', '').trim();

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