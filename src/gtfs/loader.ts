import { openDb } from "gtfs";
import { gtfsConfig } from "./config.js";

import type Database from "better-sqlite3";

export function loadGtfs(): Database.Database {
    return openDb(gtfsConfig);
}