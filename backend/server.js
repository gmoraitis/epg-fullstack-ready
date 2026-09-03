import express from 'express';
import axios from 'axios';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { parseXmltv } from './parser.js';
import dotenv from 'dotenv';
import cors from 'cors';
import channelsRoute, { CHANNELS as masterChannels } from './channels.js';

dotenv.config();

const app = express();
app.use(cors());
app.use('/api/channels', channelsRoute);
const PORT = process.env.PORT || 4000;
const CACHE_FILE = path.join(process.cwd(), 'cache.json');
const FEED_URL = process.env.EPG_FEED_URL || 'https://ext.greektv.app/epg/epg.xml';

async function fetchAndCache() {
  console.log('[EPG] fetching', FEED_URL);
  try {
    const res = await axios.get(FEED_URL, { timeout: 20000, responseType: 'text' });
    const xml = res.data;
    const parsed = await parseXmltv(xml);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    console.log('[EPG] cached events:', parsed.events.length || 0);
    return parsed;
  } catch (err) {
    console.error('[EPG] fetch error', err.message);
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(raw);
    }
    return { channelMap: {}, events: [] };
  }
}

async function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const raw = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      return fetchAndCache();
    }
  }
  return fetchAndCache();
}

fetchAndCache();
cron.schedule('0 */6 * * *', () => {
  console.log('[CRON] refresh');
  fetchAndCache();
});

app.get('/api/epg', async (req, res) => {
  const date = req.query.date;
  const channelFilter = req.query.channels ? req.query.channels.split(',') : null;
  const shouldRefresh = req.headers['cache-control'] === 'no-cache';
  let parsed;
  if (shouldRefresh) {
    parsed = await fetchAndCache();
  } else {
    parsed = await loadCache();
  }
  let events = parsed.events;

  if (date) {
    events = parsed.events.filter(event => {
      if (!event.start) return false;
      // An event belongs to a given day if and only if it STARTS on that day.
      // We compare the date part of the string directly to avoid all timezone issues.
      return event.start.startsWith(date);
    });
  }

  const channelIdsWithEvents = new Set(events.map(e => e.channelId));
  let channels;

  if (channelFilter) {
    // Use the provided channel filter
    channels = channelFilter.map(id => ({ id, name: parsed.channelMap[id] || id }));
  } else {
    // Filter channels from the master list based on which ones have events.
    channels = masterChannels.filter(c => channelIdsWithEvents.has(c.api)).map(c => ({ id: c.api, name: c.name }));
  }
  res.json({ channels, events, allChannels: parsed.channelMap });
});

app.get('/api/program/:id', async (req, res) => {
  const id = req.params.id;
  const parsed = await loadCache();
  const ev = parsed.events.find(e => e.id === id);
  if (!ev) return res.status(404).json({ error: 'not found' });
  res.json(ev);
});

app.get('/api/refresh', async (req, res) => {
  const parsed = await fetchAndCache();
  res.json({ status: 'ok', count: parsed.events.length });
});

app.listen(PORT, () => console.log('EPG backend listening on', PORT));
