import {getRouteData} from "./route.js";
import {getCalendarDates, getTrips} from "gtfs";
import {getStoptimes} from "gtfs";
import {parse} from "csv-parse/sync";
import {getServiceIdsAndDates} from "./services.js";

export type NoteItem = {
    symbol: string; // e.g. 'a'
    text: string;   // e.g 'Route extended to the Pancerniaków 03 stop'
}

export type MinuteItem = {
    minute: string; // e.g. '05'
    note?: NoteItem;
}

export type HourGroup = {
    hour: string; // e.g '08'
    minutes: MinuteItem[];
}

export type ScheduleForDay = {
    calendarDate: number;
    dayOfWeek: string; // e.g. Czw.
    DayAndMonth: string; // e.g. 16.09
    serviceId: string;
    hours: HourGroup[];
}


export function getHourGroupsForStopAndLineAndServiceId(serviceId: string,
                                                        routeId: string,
                                                        directionId: number,
                                                        stopid: string) {
    const trips = getTrips({service_id: serviceId,
        route_id: routeId,
        direction_id: directionId});
    const tripIds = trips.map(trip => trip.trip_id);

    const stopTimesObject = getStoptimes({stop_id: stopid, trip_id: tripIds});

    // Remove seconds from departure times
    const stopTimes = stopTimesObject
        .map(stopTime => stopTime.departure_time
        ?.split(':')
        .slice(0, 2)
        .join(':'))
        .sort();

    // Fix hours that are 25 and bigger

    const hourGroupsMap = new Map<string, MinuteItem[]>();

    stopTimes.forEach(stopTime => {
        if (!stopTime) return;

        const [hourStr, minuteStr] = stopTime!.split(':');
        let hour = parseInt(hourStr!);

        if (hour >= 24) {
            hour -= 24;
        }

        const fixedHourStr = hour.toString().padStart(2, '0');

        if (!hourGroupsMap.has(fixedHourStr)) {
            hourGroupsMap.set(fixedHourStr, []);
        }

        hourGroupsMap.get(fixedHourStr)!.push({minute: minuteStr!});
    });

    const hourGroups: HourGroup[] = Array.from(hourGroupsMap.entries())
        .map(([hour, minutes]) => ({ hour, minutes }));

    return hourGroups;

}

function getIsoDateString(calendarDate: number) {
    let cdString = calendarDate.toString();

    return `${cdString.slice(0, 4)}-${cdString.slice(4, 6)}-${cdString.slice(6, 8)}`;
}

export function getDisplayDayAndMonth(calendarDate: number): string {// e.g. 16.09 {
    const isoDateString = getIsoDateString(calendarDate);
    const month = isoDateString.substring(5, 7);
    const day = isoDateString.substring(8, 10);

    return `${day}.${month}`;
}

export function getDayOfWeekString(isoDateString: string): string { // e.g. Czw. {
    const dayOfWeekIdx = new Date(isoDateString).getDay();
    const days = ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'];

    return days[dayOfWeekIdx]!;
}

function getServiceIdsForStopAndLine(routeId: string, directionId: number, stopId: string): string[] {
    const trips = getTrips({ route_id: routeId, direction_id: directionId, });
    const routeTripIds = trips.map(trip => trip.trip_id);

    const stopTimes = getStoptimes({ trip_id: routeTripIds, stop_id: stopId });

    const validTripIds = new Set(stopTimes.map(stop => stop.trip_id));

    const uniqueServiceIds = new Set<string>();

    trips.forEach(trip => {
        if (validTripIds.has(trip.trip_id)) {
            uniqueServiceIds.add(trip.service_id);
        }
    });

    return Array.from(uniqueServiceIds);
}


export function getStopTimesForInstanceForServiceId(
    serviceId: string, routeId: string, directionId: number, stopId: string): ScheduleForDay[] {

    const { datesByServiceId } = getServiceIdsAndDates();

    const calendarDates: number[] = datesByServiceId.get(serviceId) || [];

    const isoDateStrings: string[] = calendarDates.map(cd => getIsoDateString(cd));

    const daysOfWeek: string[] = isoDateStrings.map(isoDS => getDayOfWeekString(isoDS));

    const displaysOfDayAndMonth: string[] = calendarDates.map(cd => getDisplayDayAndMonth(cd));

    const hourGroups = getHourGroupsForStopAndLineAndServiceId(serviceId, routeId, directionId, stopId);

    let schedulesForDates: ScheduleForDay[] = [];

    for (let idx = 0; idx < calendarDates.length; idx++) {
        let scheduleForDay: ScheduleForDay = {
            calendarDate: calendarDates[idx]!,
            dayOfWeek: daysOfWeek[idx]!,
            DayAndMonth: displaysOfDayAndMonth[idx]!,
            serviceId,
            hours: hourGroups!,
        }
        schedulesForDates.push(scheduleForDay);
    }

    return schedulesForDates;
}

export function getAllSchedulesForLineAndStop(routeId: string, directionId: number, stopId: string): ScheduleForDay[] {
    const serviceIds = getServiceIdsForStopAndLine(routeId, directionId, stopId);

    const allSchedules: ScheduleForDay[] = [];

    for (const serviceId of serviceIds) {
        const schedulesForServiceId: ScheduleForDay[] =
            getStopTimesForInstanceForServiceId(serviceId, routeId, directionId,stopId);

        allSchedules.push(...schedulesForServiceId);
    }

    return allSchedules;
}
