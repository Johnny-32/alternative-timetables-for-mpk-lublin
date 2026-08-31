import { openDb } from "gtfs";
import {gtfsConfig} from "./config.js";

export function loadGtfs() {
    return openDb(gtfsConfig);
}