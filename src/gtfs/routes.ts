import {getRoutes} from "gtfs";

type VehicleType = 'bus' | 'trolleybus' | 'night';

type RouteDetails = {
    routeShortName: string;
    type: VehicleType;
};

type RouteData = Map<string, RouteDetails>; // string is a route_id

export function getRouteTypes(): RouteData {
    const routeData: RouteData = new Map<string, RouteDetails>
    const allRoutes = getRoutes();

    for (const oneRoute of allRoutes) {
        const r_id = oneRoute.route_id;

        let vehicleType: VehicleType;

        if (r_id.charAt(0) === '1' && r_id.length == 3)
            vehicleType = 'trolleybus';
        else if (r_id.charAt(0) === 'N' && r_id.length == 2)
            vehicleType = 'night';
        else vehicleType = 'bus';

        const rd: RouteDetails = {
            routeShortName: oneRoute.route_short_name ?? '',
            type: vehicleType
        };
        routeData.set(oneRoute.route_id, rd);
    }

    return routeData;
}