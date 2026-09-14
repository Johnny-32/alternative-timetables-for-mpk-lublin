export interface MinuteItem {
    minute: string; // e.g. '05'
    note?: string;  // e.g. 'a' for trips with an annotation
}

export interface HourGroup {
    hour: number; // e.g '8'
    minutes: MinuteItem[];
}

export interface DayTypeGroup {
    day_type: string; // e.g. 'Saturday'
    hours: HourGroup[];
}

export interface NoteItem {
    symbol: string; // e.g. 'a'
    text: string;   // e.g 'Route extended to the Pancerniaków 03 stop'
}

export type StopStatus = 'past' | 'current' | 'future';

export interface StopItem {
    stop_id: string;      // e.g. '5581'
    stop_name: string;    // e.g. 'Plac Litewski'
    stop_code?: string;   // e.g. '02' - indicates which stop this is from the group of stops
    street_name?: string; // e.g. '3 Maja'
    status: StopStatus;
}

export interface FormattedStopTimetable {
    current_stop_id: string;    // e.g. '5581'
    current_stop_name: string;  // e.g. 'Plac Litewski'
    current_stop_code?: string; // e.g. '02' - indicates which stop this is from the group of stops
    route_short_name: string;   // e.g. '15' or 'N2'
    direction_headsign: string; // e.g. Direction: 'Daszyńskiego'
    period: string;             // e.g. 'Holidays'
    valid_from: string          // e.g '27.06.2026'
    day_types: DayTypeGroup[];
    stop_list: StopItem[];
    hours: HourGroup[];
    notes: NoteItem[];
}