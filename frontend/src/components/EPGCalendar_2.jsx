import React, { useState, useEffect } from 'react';

export default function EPGCalendar_2({ apiBase = 'http://localhost:4000' }) {
    // 1. Η Μνήμη μας (State)
    const [date, setDate] = useState('2026-10-11');
    const [channels, setChannels] = useState([]);
    const [events, setEvents] = useState([]);

    // 2. Συνάρτηση αλλαγής ημέρας
    function changeDay(offset) {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + offset);
        setDate(currentDate.toISOString().split('T')[0]);
    }

    // 3. Το Τηλέφωνο στο Backend
    useEffect(() => {
        console.log(`📡 Καλώ το Backend για την ημερομηνία: ${date}`);
        fetch(`${apiBase}/api/epg?date=${date}`)
            .then(res => res.json())
            .then(data => {
                setChannels(data.channels || []);
                setEvents(data.events || []);
            })
            .catch(err => console.error("Σφάλμα σύνδεσης με το Backend:", err));
    }, [date]); // 👈 Τρέχει αυτόματα σε κάθε αλλαγή του date!

    // 4. Η Οθόνη (UI)
    return (
        <div className="p-6 text-white bg-gray-900 min-h-screen">
            {/* Header με κουμπιά */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => changeDay(-1)} 
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xl font-bold">
                    &lt;
                </button>

                <span className="text-xl font-semibold bg-gray-800 px-6 py-2 rounded">
                    {date}
                </span>

                <button 
                    onClick={() => changeDay(1)} 
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xl font-bold">
                    &gt;
                </button>
            </div>

            {/* Πληροφορίες που ήρθαν από το Backend */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-green-400 font-bold mb-2">
                    ✅ Συνδέθηκε με το Backend!
                </p>
                <p>📺 Κανάλια που βρέθηκαν: <span className="font-bold">{channels.length}</span></p>
                <p>🎬 Εκπομπές για αυτή τη μέρα: <span className="font-bold">{events.length}</span></p>
            </div>
        </div>
    );
}