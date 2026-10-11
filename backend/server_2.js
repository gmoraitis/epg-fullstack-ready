import express from 'express';
import cors from 'cors';
import { loadCache } from './test_fetch.js';

const app = express(); // We create the express app
const PORT = 4000; // We define the 'door'


app.use(cors());// we allow every broser to ask data from this server
// We define a route
app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello George! Server is ON" });
});


app.get('/api/epg', async (req, res) => {
    // 1. Διαβαζουμε τι ζητησε ο χρηστης
    const requestDate = req.query.date;// πχ "2026-10-10"

    // 2. Φερνουμε τα δεδομενα απο το ψυγειο (loadCache)
    const data = await loadCache();

    let filteredEvents = data.events;


    //3. Αν ο χρηστης εδωσε ημερονμηνια, φιλτραρουμε
    if (requestDate) {
        filteredEvents = data.events.filter(ev => ev.start && ev.start.startsWith(requestDate))
    }

    // 4. Στελνουμε πισω τα καναλια και τισ φιλτραρισμενσ εκμπομπες
    res.json({
        channels: data.channels,
        events: filteredEvents
    });

});

// Βρες συγκεκριμενη εκπομπη
app.get('/api/program/:id', async (req, res) => {
    const programId = req.params.id;
    const data = await loadCache();

    // Χρησιμοποίησε το .find() εδώ για να βρεις την εκπομπή!
    const foundProgram = data.events.find(e => e.id === programId);
    // Αν δεν υπάρχει -> res.status(404).json(...)
    if (!foundProgram) {
        return res.status(404).json({ error: "Program not found" });
    }

    // Αν υπάρχει to stelnoume -> res.json(foundProgram)
    res.json(foundProgram);
}
);


// We say to server to listen to this port
app.listen(PORT, () => {
    console.log(`Server is listening to http://localhost:${PORT}`);
});
