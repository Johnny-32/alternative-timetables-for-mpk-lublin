import { importGtfs, openDb } from "gtfs";
import type Database from "better-sqlite3";
import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import { gtfsConfig } from "../src/gtfs/config.js";

const gtfsZipPath = "./data/gtfs-lublin-fixed.zip";

const config = {
    ...gtfsConfig,
    agencies: [
        {
            path: gtfsZipPath,
        },
    ],
};

type StopCsvRow = { stop_id: string; street_name?: string };

function columnExists(db: Database.Database, table: string, column: string): boolean {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return columns.some((col) => col.name === column);
}

function addStreetNameColumn(db: Database.Database, zipPath: string) {
    if (!columnExists(db, "stops", "street_name")) {
        db.exec(`ALTER TABLE stops ADD COLUMN street_name TEXT`);
    }

    const zip = new AdmZip(zipPath);
    const stopsEntry = zip.getEntry("stops.txt");

    if (!stopsEntry) {
        throw new Error("Stops.txt not found in GTFS");
    }

    const stopsContent = stopsEntry.getData().toString("utf8");
    const rows = parse(stopsContent, { columns: true }) as StopCsvRow[];

    const update = db.prepare(`UPDATE stops SET street_name = ? WHERE stop_id = ?`);
    const tx = db.transaction((rowsToInsert: StopCsvRow[]) => {
        for (const row of rowsToInsert) {
            if (row.street_name) update.run(row.street_name, row.stop_id);
        }
    });
    tx(rows);
}

async function main() {
    try {
        console.log("Importing GTFS...");
        await importGtfs(config);
        console.log("GTFS has been imported");

        console.log("Adding street_name to stops...");
        const db = openDb(gtfsConfig);
        addStreetNameColumn(db, gtfsZipPath);
        console.log("street_name added");
    } catch (error) {
        console.error("GTFS import error:");
        console.error(error);
        process.exit(1);
    }
}

await main();