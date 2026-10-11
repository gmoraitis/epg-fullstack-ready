import axios from "axios";
import { parseXmltv } from "./parser_2.js";
import fs from 'fs';
import cron from 'node-cron';

async function fetchAndCache() {

    console.log("1. Downloading begins...");
    const response = await axios.get('https://ext.greektv.app/epg/epg.xml');

    console.log("2. Data found ! Size od data :", response.data.length, "characters");

    console.log("3. Parsing begins...");
    const cleanData = await parseXmltv(response.data);

    console.log("4. Saving to disk...");
    fs.writeFileSync('cache_2.json', JSON.stringify(cleanData, null, 2), 'utf-8');

    console.log("5. Events found ready:", cleanData.events.length);



    return (cleanData)
}

export async function loadCache() {
    if (fs.existsSync('cache_2.json')) {
        let cache_2 = fs.readFileSync('cache_2.json', "utf-8");
        let cacheToJosn = JSON.parse(cache_2);
        return (cacheToJosn)
    }
    else {
        return fetchAndCache();
    }

};

//loadCache();


// "Στο λεπτό 0, κάθε 6 ώρες (* / 6), κάθε μέρα"
// cron.schedule('0 */12 * * *', () => {
//     console.log('[CRON] Πέρασαν 6 ώρες! Κατεβάζω φρέσκο πρόγραμμα...');
//     fetchAndCache();
// });