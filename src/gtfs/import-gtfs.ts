import {importGtfs} from "gtfs";
import {gtfsConfig} from "./config.js";

const config = {
    ...gtfsConfig,
    agencies: [
        {
            path: './data/lublin-zbiorkom-fixed.zip',
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
