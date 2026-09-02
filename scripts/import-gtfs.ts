import {importGtfs} from "gtfs";
import {gtfsConfig} from "../src/gtfs/config.js";

const config = {
    ...gtfsConfig,
    agencies: [
        {
            path: './data/gtfs-lublin.zip',
        }
    ]
};

async function main() {
    try {
        console.log('Importing GTFS...')
        await importGtfs(config);
        console.log('GTFS has been imported')
    } catch (error) {
        console.error('GTFS import error:');
        console.error(error);
        process.exit(1);
    }
}

await main();
