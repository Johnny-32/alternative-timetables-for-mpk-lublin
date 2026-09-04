import {getCalendarDates, getServiceIdsByDate} from "gtfs";

/*
Only the next 9 days will be parsed from calendar_dates
(and also trips and stop_times will need to be truncated as well).
ISSUE: Night lines that stretch both days
FIX: If the stop_times go beyond 24:00:00, we can flag this stop time as one that goes beyond designated day,
and we can flag it as e.g. fri/sat
 */

type ServiceIdsByDate = Map<number, string[]>

type DatesByServiceId = Map<string, number[]>

export function getDatesFromCalendarDates() {
    const rows = getCalendarDates();

    return [...new Set(
        rows.map(({ date }) => Number(date))
    )].sort((a, b) => a - b);
}

export function getServiceIdsAndDates(dates: number[]): {
    serviceIdsByDate: ServiceIdsByDate,
    datesByServiceId: DatesByServiceId
}  {
    const serviceIdsByDate = new Map<number, string[]>();
    const datesByServiceId = new Map<string, number[]>();

    for (const date of dates) {
        const serviceIds = getServiceIdsByDate(date);

        serviceIdsByDate.set(date, serviceIds);

        for (const serviceId of serviceIds) {
            const serviceDates = datesByServiceId.get(serviceId);

            if (serviceDates) {
                serviceDates.push(date);
            } else {
                datesByServiceId.set(serviceId, [date]);
            }
        }
    }

    return {
        serviceIdsByDate,
        datesByServiceId,
    };
}