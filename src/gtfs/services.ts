import { getServiceIdsByDate } from "gtfs";

/*
Only the next 9 days will be parsed from calendar_dates
(and also trips and stop_times will need to be truncated as well).
ISSUE: Night lines that stretch both days
FIX: If the stop_times go beyond 24:00:00, we can flag this stop time as one that goes beyond designated day,
and we can flag it as e.g. fri/sat
 */

export function getNext9Days() {
    let dates: number[] = [];
    let now = new Date();

    let i = 1;
    while (i <= 9) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        let formattedDateStr: string = `${year}${month}${day}`;
        const formattedDateNum = Number(formattedDateStr);
        dates.push(formattedDateNum);
        now.setDate(now.getDate() + 1);
        i++;
    }

    return dates;
}
// Days as keys, serviceIds for values, e.g. '20260817': ['2026_2026-08-14_SN', '2026-08-14_NN']...
export async function getServiceIdsForDates(dates: number[]) {
    const serviceIdsByDate = new Map<number, string[]>();

    await Promise.all(
        dates.map(async (date) => {
            const serviceIdsForDay = getServiceIdsByDate(date);
            serviceIdsByDate.set(date, serviceIdsForDay);
        })
    );

    return serviceIdsByDate;
}

export async function getDatesForServiceId(dates: number[]) {
    const datesByServiceId = new Map<string, number[]>();

    const results = await Promise.all(
        dates.map(async (date) => ({
            date,
            serviceIds: getServiceIdsByDate(date)
        }))
    );

    for (const {date, serviceIds} of results) {
        for (const serviceId of serviceIds) {
            if (!datesByServiceId.has(serviceId)) {
                datesByServiceId.set(serviceId, []);
            }
            datesByServiceId.get(serviceId)!.push(date);
        }
    }

    return datesByServiceId;
}
