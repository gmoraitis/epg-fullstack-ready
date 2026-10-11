import { parseStringPromise } from 'xml2js';

import { CHANNELS as masterChannels } from './channels.js'


// { } = OBJECT (Αντικείμενο με κλειδιά) ──► Μπαίνεις με ΤΕΛΕΙΑ: .key
// [ ] = ARRAY (Λίστα με σειριακά νούμερα) ─► Μπαίνεις με ΑΓΚΥΛΗ: [0], [1]

// helper function for dates
function fixedDate(dateString) {
  // 🛡️ Ο ΦΡΟΥΡΟΣ: Αν το dateString είναι άδειο ή δεν είναι κείμενο, σταμάτα εδώ!
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }
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

const allowedChannelIds = new Set(masterChannels.map(c => c.api));
// Περιέχει: 'ert1', 'ert2', 'ert3', 'mega', 'ant1', 'star', 'open', 'alpha', 'skai'

export async function parseXmltv(xmlString) {
  const result = await parseStringPromise(xmlString)

  // convert object to normal object
  const rawChannels = result.tv.channel;
  const rawProgrammes = result.tv.programme
  const cleanChannels = [];
  const cleanProgrammes = [];


  for (const ch of rawChannels) {
    const cleanId = ch.$.id ? ch.$.id.toLowerCase().split('.')[0]
      : '';

    // Κρατα μονο εαν ειναι ενα απο τα 9!
    if (allowedChannelIds.has(cleanId)) {
      cleanChannels.push(
        {
          id: ch.$.id,
          name: ch['display-name'][0]
        }

      )
    }
  }

  for (const pr of rawProgrammes) {
    // Παίρνουμε με ασφάλεια τα πεδία (είτε υπάρχουν στο $, είτε απευθείας)
    const rawStart = pr.$ ? pr.$.start : pr.start;
    const rawStop = pr.$ ? pr.$.stop : pr.stop;
    const rawChannel = pr.$ ? pr.$.channel : pr.channel;

    const cleanChannel = rawChannel ? rawChannel.toLowerCase().split('.')[0] : 'unknown';

    // Αν το κανάλι ΔΕΝ ανήκει στα 9, προσπέρασέ το (continue)!
    if (!allowedChannelIds.has(cleanChannel)) {
      continue;
    }
    const cleanStart = fixedDate(rawStart);
    const cleanStop = fixedDate(rawStop);

    cleanProgrammes.push({
      id: `${cleanStart}_${rawChannel || 'nochannel'}`,
      start: cleanStart,
      stop: cleanStop,
      channel: cleanChannel,
      title: pr.title ? (Array.isArray(pr.title) ? pr.title[0] : pr.title) : '',
      desc: pr.desc ? (Array.isArray(pr.desc) ? pr.desc[0] : pr.desc) : ''
    });
  }
  return {
    channels: cleanChannels,
    events: cleanProgrammes
  }

}


// TEST: Calling the function with the xml_data. This part will be run 
// from the server_2.js, but here is temporaly a test

async function test() {
  const cleanData = await parseXmltv(xml_data);

  console.log("=== The object that returns from parser_2");
  console.log(cleanData);
}

//test();
