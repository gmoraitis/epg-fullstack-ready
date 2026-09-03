import { parseStringPromise } from 'xml2js';


export async function parseXmltv(xmlString) {
  const obj = await parseStringPromise(xmlString, { explicitArray: false, mergeAttrs: true });
  const tv = obj.tv || {};
  const channelsRaw = tv.channel || [];
  const programmesRaw = tv.programme || [];

  const channels = Array.isArray(channelsRaw) ? channelsRaw : (channelsRaw ? [channelsRaw] : []);
  const programmes = Array.isArray(programmesRaw) ? programmesRaw : (programmesRaw ? [programmesRaw] : []);

  const channelMap = {};
  channels.forEach(ch => {
    const id = ch.id || ch['@id'] || (ch.$ && ch.$.id);
    const name = ch['display-name'] ? (Array.isArray(ch['display-name']) ? ch['display-name'][0] : ch['display-name']) : id;
    channelMap[id] = name;
  });
  function normalizeXmltvTimestamp(ts) {
    if (!ts || typeof ts !== 'string') return ts;
    // xmltv timestamps look like: 20251127004500 +0200 or 20251127004500+0200 or 20251127004500.
    // We need to convert this to an ISO 8601 string that Javascript's Date object can parse.
    const m = ts.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
    if (!m) return ts;
    const [, Y, M, D, h, min, s, offset] = m;
    const offsetStr = offset ? `${offset.slice(0, 3)}:${offset.slice(3)}` : 'Z'; // Convert +0200 to +02:00 or default to Z (UTC)
    return `${Y}-${M}-${D}T${h}:${min}:${s}${offsetStr}`;
  }

  const events = programmes.map(p => {
    const rawChannelId = p.channel || p['channel'];
    // Normalize channel ID: make it lowercase and remove .gr, .com, etc. to match `channels.js`
    const channel = rawChannelId ? rawChannelId.toLowerCase().split('.')[0] : null;
    const rawStart = p.start || p['start'];
    const rawStop = p.stop || p['stop'];
    const start = normalizeXmltvTimestamp(rawStart);
    const stop = normalizeXmltvTimestamp(rawStop);
    const title = p.title ? (typeof p.title === 'string' ? p.title : (p.title._ || (Array.isArray(p.title) ? p.title[0] : ''))) : '';
    const desc = p.desc ? (typeof p.desc === 'string' ? p.desc : (p.desc._ || (Array.isArray(p.desc) ? p.desc[0] : ''))) : '';
    const id = `${start}_${rawChannelId}`; // Use original raw ID for uniqueness
    return { id, channelId: channel, title, start, end: stop, description: desc };
  }).filter(Boolean);

  return { channelMap, events };
}
