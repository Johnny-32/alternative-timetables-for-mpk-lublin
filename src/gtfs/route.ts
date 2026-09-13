import {getTrips, getStoptimes} from "gtfs";
import {loadGtfs} from "./loader.js";
import {getStopName, getStopNameWithStopCode} from "./stops.js";

type RouteVariant = {
    stopIds: string[];
    frequency: number;
    tripIds: string[];
};

type RouteChangeType = 'shorterTerminusFromStart' | 'shorterTerminusFromEnd'
    | 'longerTerminusFromStart' | 'longerTerminusFromEnd'
    | 'diffRouting' | 'shortcut';

type RouteChange = {
    type: RouteChangeType;
    fromStopId?: string;
    toStopId?: string;
    stopIds?: string[];
    skippedStopIds?: string[];
    frequency: number;
    tripIds: string[];
    annotation?: string;
};

type RouteData = {
    mainStops: string[];
    mainFrequency: number;
    mainTripIds: string[];
    changes: RouteChange[];
};

type StopHelper = {
    stop_id: string;
    stop_name: string;
    stop_code: string;
    street_name: string;
}


function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((value, index) => value == b[index]);
}

function getDirectionIdsForRoute(routeId: string): number[] {
    const trips = getTrips({ route_id: routeId }, ['direction_id']);

    return [...new Set(trips.map(trip => trip.direction_id!))];
}

export function getVariantsForRoute(routeId: string) {
    const directionIds = getDirectionIdsForRoute(routeId);
    const stopIdsToReturn: Map<number, RouteVariant[]> = new Map;

    for (const directionId of directionIds) {
        const trips = getTrips({ route_id: routeId, direction_id: directionId });

        const routeVariants: RouteVariant[] = [];

        for (const trip of trips) {
            const tripId = trip.trip_id;
            const stopIds = getStoptimes({ trip_id: tripId }, ['stop_id'])
                .map(stopTime => stopTime.stop_id!);

            const existingVariant = routeVariants.find(
                variant => arraysEqual(variant.stopIds, stopIds));

            if (existingVariant) {
                existingVariant.frequency++;
                existingVariant.tripIds.push(tripId);
            } else {
                routeVariants.push({
                    stopIds,
                    frequency: 1,
                    tripIds: [tripId],
                });
            }
        }

        routeVariants.sort((a, b) => b.frequency - a.frequency);

        stopIdsToReturn.set(directionId, routeVariants);
    }

    return stopIdsToReturn;
}

function getRouteChangesForVariant(
    mainStops: string[],
    variant: RouteVariant
): RouteChange[] | null {
    const { stopIds: variantStops, frequency } = variant;

    const routeChangeList: RouteChange[] = [];
    let routeChangeStops = [];

    let lastSharedStop: string | undefined = undefined;

    let mainIndex: number | undefined = undefined;

    const tripIds = variant.tripIds;

    for (const variantStop of variantStops) {
        mainIndex = mainStops.indexOf(variantStop);

        if (mainIndex !== -1) {
            // Checking if the route has been shortened from the start
            if (variantStops.indexOf(variantStop) === 0 && mainIndex > 0) {
                const skippedStops = mainStops.slice(0, mainIndex);

                routeChangeList.push({
                    type: "shorterTerminusFromStart",
                    toStopId: variantStop,
                    skippedStopIds: skippedStops,
                    frequency,
                    tripIds,
                });
            }

            // Return from a detour
            if (routeChangeStops.length !== 0) {
                // Different routing
                if (lastSharedStop) {
                    const lastSharedIndex = mainStops.indexOf(lastSharedStop);
                    const skippedStops = mainStops.slice(lastSharedIndex + 1, mainIndex);

                    routeChangeList.push({
                        type: 'diffRouting',
                        fromStopId: lastSharedStop,
                        toStopId: variantStop,
                        stopIds: routeChangeStops,
                        ...(skippedStops.length > 0 ? {skippedStopIds: skippedStops}: {}),
                        frequency,
                        tripIds,
                    });
                } else {
                    routeChangeList.push({
                        type: "longerTerminusFromStart",
                        toStopId: variantStop,
                        stopIds: routeChangeStops,
                        frequency,
                        tripIds,
                    });
                }

                routeChangeStops = [];
            } else {
                if (lastSharedStop && mainStops[mainIndex - 1] !== lastSharedStop) {
                    const lastSharedIndex = mainStops.indexOf(lastSharedStop);
                    const skippedStops = mainStops.slice(lastSharedIndex + 1, mainIndex);

                    routeChangeList.push({
                        type: "shortcut",
                        fromStopId: lastSharedStop!,
                        toStopId: variantStop,
                        skippedStopIds: skippedStops,
                        frequency,
                        tripIds,
                    });
                }
            }
            lastSharedStop = variantStop;
        } else {
            routeChangeStops.push(variantStop);
        }
    }

    // Checking if the route has been shortened from the end
    if (mainIndex !== undefined && mainIndex !== -1 && mainIndex !== mainStops.length - 1) {
        routeChangeList.push({
            type: "shorterTerminusFromEnd",
            toStopId: variantStops[variantStops.length - 1]!,
            skippedStopIds: mainStops.slice(mainIndex + 1),
            frequency,
            tripIds,
        });
    }

    if (routeChangeStops.length !== 0) {
        routeChangeList.push({
            type: "longerTerminusFromEnd",
            ...(lastSharedStop ? { fromStopId: lastSharedStop } : {}),
            stopIds: routeChangeStops,
            frequency,
            tripIds,
        });
    }

    return routeChangeList.length > 0 ? routeChangeList : null;
}

function sortStopsWithGuide(sorted: string[], toSort: StopHelper[], attribute: keyof StopHelper): string[] {
    return sorted.map(id => toSort
        .find(stop => stop.stop_id === id)?.[attribute]).filter(Boolean) as string[];
}

function getRouteChangeDescription(mainStops: RouteData["mainStops"], change: RouteChange): string | null {
    const db = loadGtfs();

    switch (change.type) {
        case 'shortcut': {
            const { fromStopId, toStopId, skippedStopIds } = change;

            const mainRouteStopIds = [fromStopId!, ...skippedStopIds!, toStopId!];
            const placeholdersMain = mainRouteStopIds.map(() => '?').join(',');

            const mainStops = db
                .prepare(`SELECT stop_id, stop_name, stop_code, street_name FROM stops 
                WHERE stop_id IN (${placeholdersMain})`)
                .all(...mainRouteStopIds) as StopHelper[];

            const mainStreets = mainStops.map(stop => stop.street_name);

            const shortcutStopIds = [fromStopId, toStopId];
            const placeholdersShortcut = shortcutStopIds.map(() => '?').join(',');

            const shortcutStops = db
                .prepare(`SELECT stop_id, stop_name, street_name FROM stops 
                WHERE stop_id IN (${placeholdersShortcut})`)
                .all(...shortcutStopIds) as StopHelper[];

            const shortcutStreets = shortcutStops.map(stop => stop.street_name);

            const skippedStreetsRaw = mainStreets.filter(
                shortcutStreet => !shortcutStreets.includes(shortcutStreet));
            const skippedStreets = Array.from(new Set(skippedStreetsRaw));

            if (skippedStopIds?.length === 1) {
                const [skippedStopId] = skippedStopIds
                const skippedStopName = getStopName(skippedStopId!);
                if (skippedStopName == getStopName(fromStopId!) || skippedStopName == getStopName(toStopId!)) {
                    return `Kurs z pominięciem ${getStopNameWithStopCode(skippedStopId!)}`;
                } else {
                    return `Kurs z pominięciem ${skippedStopName}`;
                }
            } else if (skippedStreets.length === 0) {
                const skippedStopsFormatted = skippedStopIds!.map(stop => getStopNameWithStopCode(stop))
                    .join(', ');
                return `Kurs z pominięciem przystanków: ${skippedStopsFormatted}`;
            } else {
                const skippedStreetsString = skippedStreets.join(', ');
                if (skippedStreets.length === 1) {
                    return `Kurs z pominięciem ulicy: ${skippedStreetsString}`;
                } else {
                    return `Kurs z pominięciem ulic: ${skippedStreetsString}`;
                }
            }
        }

        case "diffRouting": {
            const { fromStopId, toStopId, stopIds, skippedStopIds } = change;

            const mergedStopIds: string[] = [fromStopId!, ...stopIds!, toStopId!];
            const placeholdersVariant = mergedStopIds.map(() => '?').join(',');

            const variantStops = db
                .prepare(`SELECT stop_id, stop_name, stop_code FROM stops
                WHERE stop_id IN (${placeholdersVariant})`)
                .all(...mergedStopIds) as StopHelper[];

            const variantStopNames = sortStopsWithGuide(mergedStopIds, variantStops, 'stop_name');

            const mergedSkippedStopIds = [fromStopId, ...(skippedStopIds ?? []), toStopId];
            const placeholdersSkipped = mergedSkippedStopIds.map(() => '?').join(',')

            const skippedStops = db
                .prepare(`SELECT stop_id, stop_name, stop_code FROM stops
                WHERE stop_id IN (${placeholdersSkipped})`)
                .all(...mergedSkippedStopIds) as StopHelper[];

            const skippedStopNames = skippedStops.map(stop => stop.stop_name);

            const uniqueVariantStopNames = variantStopNames.filter(
                varStop => !skippedStopNames.includes(varStop));

            if (uniqueVariantStopNames.length === 0) {
                return `Kurs przez ${variantStopNames[0]}`;
            }

            const middleStopNameIndex = Math.floor((uniqueVariantStopNames.length - 1) / 2);
            const middleStopName = uniqueVariantStopNames[middleStopNameIndex];

            return `Kurs przez ${middleStopName}`;
        }

        case 'shorterTerminusFromEnd':
            return `Kurs skrócony do ${getStopName(change.toStopId!)}`;

        case 'longerTerminusFromEnd':
            const stopIds = change.stopIds!;
            const lastStop = getStopName(stopIds[stopIds.length - 1]!)
            return `Kurs przedłużony do ${lastStop}`;

        default:
            return null;
    }
}


function aggregateRouteChanges(changes: RouteChange[]): RouteChange[] {
    const changeMap = new Map<string, RouteChange>;

    for (const change of changes) {
        const key = [
            change.type,
            change.fromStopId ?? '',
            change.toStopId ?? '',
            (change.stopIds ?? []).join(','),
            (change.skippedStopIds ?? []).join(','),
        ].join('|');

        const existing = changeMap.get(key);

        if (existing) {
            existing.frequency += change.frequency;
            existing.tripIds.push(...change.tripIds);
        } else {
            changeMap.set(key, {
                ...change,
                tripIds: [...change.tripIds]});
        }
    }

    return Array.from(changeMap.values());
}

export function getRouteData(routeId: string): Map<number, RouteData> {
    const variantsForRoute = getVariantsForRoute(routeId);
    const result = new Map<number, RouteData>();

    for (const [directionId, variants] of variantsForRoute) {
        const mainVariant = variants[0];
        const mainFrequency = mainVariant!.frequency;
        const mainTripIds = mainVariant!.tripIds;

        const mainStops: string[] = mainVariant!.stopIds;

        const rawChanges: RouteChange[] = [];

        for (const variant of variants.slice(1)) {
            const variantChanges = getRouteChangesForVariant(
                mainVariant!.stopIds,
                variant,
            );

            if (variantChanges) {
                rawChanges.push(...variantChanges);
            }
        }

        const aggregatedChanges = aggregateRouteChanges(rawChanges);

        for (const change of aggregatedChanges) {
            const annotation = getRouteChangeDescription(mainStops, change)
            if (annotation) {
                change.annotation = annotation;
            }
        }

        result.set(directionId, {
            mainStops,
            mainFrequency,
            mainTripIds,
            changes: aggregatedChanges,
        });
    }

    return result;
}

function getChangesByTrip(routeId: string, directionId: number, tripId: string): RouteChange[]{
    const changes = getRouteData(routeId).get(directionId)?.changes;

    if (!changes) {
        return [];
    }

    return changes.filter(change => change.tripIds.includes(tripId));
}
