import {getTrips, getStoptimes} from "gtfs";

type RouteVariant = {
    stopIds: string[];
    frequency: number;
};

type Stop = {
    id: string;
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
};

type RouteData = {
    stops: Stop[];
    changes: RouteChange[][];
};

//TODO: Remove duplicate route changes


export function getRouteData(routeId: string): Map<number, RouteData> {
    const variantsForRoute = getVariantsForRoute(routeId);
    const result = new Map<number, RouteData>();

    for (const [directionId, variants] of variantsForRoute) {
        if (variants.length === 0) {
            continue;
        }

        const mainVariant = variants[0];

        const stops: Stop[] = mainVariant!.stopIds.map(stopId => ({id: stopId}));

        const changes: RouteChange[][] = [];

        for (const variant of variants.slice(1)) {
            const change = getRouteChange(
                mainVariant!.stopIds,
                variant
            );

            if (change) {
                changes.push(change);
            }
        }

        result.set(directionId, {
            stops,
            changes
        });
    }

    return result;
}

function getRouteChange(
    mainStops: string[],
    variant: RouteVariant
): RouteChange[] | null {
    const variantStops = variant.stopIds;

    // Identical routes
    if (arraysEqual(mainStops, variantStops)) {
        return null;
    }

    const routeChangeList: RouteChange[] = [];
    let routeChangeStops = [];

    let lastSharedStop: string | undefined = undefined;

    let mainIndex: number | undefined = undefined;

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
                    });
                } else {
                    routeChangeList.push({
                        type: "longerTerminusFromStart",
                        toStopId: variantStop,
                        stopIds: routeChangeStops,
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
        });
    }

    if (routeChangeStops.length !== 0) {
        routeChangeList.push({
            type: "longerTerminusFromEnd",
            ...(lastSharedStop ? { fromStopId: lastSharedStop } : {}),
            stopIds: routeChangeStops,
        });
    }

    return routeChangeList.length > 0 ? routeChangeList : null;
}


function getDirectionIdsForRoute(routeId: string): number[] {
    const trips = getTrips({ route_id: routeId }, ['direction_id']);

    return [...new Set(trips.map(trip => trip.direction_id!))];
}

function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
        return false;
    }

    return a.every((value, index) => value == b[index]);
}

export function getVariantsForRoute(routeId: string) {
    const directionIds = getDirectionIdsForRoute(routeId);
    const stopIdsToReturn: Map<number, RouteVariant[]> = new Map;

    for (const directionId of directionIds) {
        const trips = getTrips({ route_id: routeId, direction_id: directionId });

        const routeVariants: RouteVariant[] = [];

        for (const trip of trips) {
            const stopIds = getStoptimes({ trip_id: trip.trip_id }, ['stop_id'])
                .map(stopTime => stopTime.stop_id!);

            const existingVariant = routeVariants.find(
                variant => arraysEqual(variant.stopIds, stopIds));

            if (existingVariant) {
                existingVariant.frequency++;
            } else {
                routeVariants.push({
                    stopIds,
                    frequency: 1
                });
            }
        }

        routeVariants.sort((a, b) => b.frequency - a.frequency);

        stopIdsToReturn.set(directionId, routeVariants);
    }

    return stopIdsToReturn;
}
