
import { parseStringPromise } from 'xml2js';

// { } = OBJECT (Αντικείμενο με κλειδιά) ──► Μπαίνεις με ΤΕΛΕΙΑ: .key
// [ ] = ARRAY (Λίστα με σειριακά νούμερα) ─► Μπαίνεις με ΑΓΚΥΛΗ: [0], [1]

// helper function for dates
function fixedDate(dateString) {
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hour = dateString.slice(8, 10);
    const minute = dateString.slice(10, 12);
    const second = dateString.slice(12, 14);
    return `${year}-${month}-${day}T${hour}:${minute}:${second}+03:00`;
}

const xml_data =
    `<tv generator-info-name="epg-greece-cyprus" generator-info-url="https://github.com/tvappshq/epg-greece-cyprus">
    < channel id = "4e" >
        <display-name>4e</display-name>
  </channel >
  <channel id="Al Jazeera">
    <display-name>Al Jazeera</display-name>
  </channel>
  <channel id="AnimalPlanet">
    <display-name>AnimalPlanet</display-name>
  </channel>
  <channel id="Ant1 Comedy">
    <display-name>Ant1 Comedy</display-name>
  </channel>
  <channel id="Ant1 Drama">
    <display-name>Ant1 Drama</display-name>
  </channel>
  <channel id="BBC News">
    <display-name>BBC News</display-name>
  </channel>
  <channel id="BBCEarth">
    <display-name>BBCEarth</display-name>
  </channel> 
    <programme start="20260902100000 +0300" stop="20260902113000 +0300" channel="ert1.gr">
    <title>ΣΥΝΔΕΣΕΙΣ</title>
    <desc>Ενημερωτική εκπομπή.</desc>
  </programme>
  </tv>`

export async function parseXmltv(xmlString) {
    const result = await parseStringPromise(xmlString)
    console.log('data in json object', JSON.stringify(result, null, 2))

    // convert object to normal object
    const rawChannels = result.tv.channel;
    const rawProgrammes = result.tv.programme
    const cleanChannels = [];
    const cleanProgrammes = [];


    for (const ch of rawChannels) {
        cleanChannels.push(
            {
                id: ch.$.id,
                name: ch['display-name'][0]
            }

        )
    }

    for (const pr of rawProgrammes) {
        cleanProgrammes.push({
            id:`${fixedDate(pr.$.start)}_${pr.$.channel}`,
            start: fixedDate(pr.$.start),
            stop: fixedDate(pr.$.stop),
            channel: pr.$.channel.toLowerCase().split('.')[0],
            title: pr['title'][0],
            desc: pr['desc'][0]
        }
        )
    }
    return {
      channels:cleanChannels,
      events:cleanProgrammes
    }

}


// TEST: Calling the function with the xml_data. This part will be run 
// from the server_2.js, but here is temporaly a test

async function test(){
  const cleanData = await parseXmltv(xml_data);

  console.log("=== The object that returns from parser_2");
  console.log(cleanData);
}

test();
