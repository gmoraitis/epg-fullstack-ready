import React, { useState, useEffect } from 'react';

export default function EPGCalendar_2({ apiBase = 'http://localhost:4000' }) {
    // 1. Η Μνήμη μας (State)
    const [date, setDate] = useState('2026-10-11');
    const [channels, setChannels] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Συνάρτηση αλλαγής ημέρας
    function changeDay(offset) {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + offset);
        setDate(currentDate.toISOString().split('T')[0]);
    }

    // 3. Το Τηλέφωνο στο Backend
    useEffect(() => {
        setIsLoading(true); // 👈 1. Άναψε το loading στην εκκίνηση!
        console.log(`📡 Καλώ το Backend για την ημερομηνία: ${date}`);
        fetch(`${apiBase}/api/epg?date=${date}`)
            .then(res => res.json())
            .then(data => {
                setChannels(data.channels || []);
                setEvents(data.events || []);
                setIsLoading(false); // 👈 2. Σβήσε το loading, ήρθαν τα δεδομένα!
            })
            .catch(err => {
                console.error("Σφάλμα σύνδεσης με το Backend:", err);
                setIsLoading(false)
            }); // 👈 3. Σβήσε το loading ακόμα κι αν απέτυχε!

    }, [date]); // 👈 Τρέχει αυτόματα σε κάθε αλλαγή του date!

    // Υπολογισμός Ελληνικής Ημερομηνίας (Derived Value)
    const formattedDate = new Intl.DateTimeFormat('el-GR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));

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

                <span className="text-xl font-semibold bg-gray-800 px-6 py-2 rounded
                capitalize">
                    {formattedDate}
                </span>

                <button
                    onClick={() => changeDay(1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xl font-bold">
                    &gt;
                </button>
            </div>

            {/* Πληροφορίες που ήρθαν από το Backend */}
            {isLoading ? <div>Το προγραμμα φωρτωνει..</div> : <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-green-400 font-bold mb-2">
                    ✅ Συνδέθηκε με το Backend!
                </p>
                <p>📺 Κανάλια που βρέθηκαν: <span className="font-bold">{channels.length}</span></p>
                {/* Λίστα Καναλιών & Εκπομπών τους */}
                <div className="flex flex-col gap-4 mt-6">
                    {channels.map(channel => {
                        // 1. Βρίσκουμε τις εκπομπές αυτού του συγκεκριμένου καναλιού
                        const channelEvents = events.filter(e => e.channel === channel.id);

                        return (
                            <div key={channel.id} className="bg-gray-700/50 p-4 rounded-lg">
                                {/* Όνομα Καναλιού */}
                                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                                    📺 {channel.name} ({channelEvents.length} εκπομπές)
                                </h3>

                                {/* Οι πρώτες 3 εκπομπές του */}
                                <div className="flex flex-col gap-1">
                                    {channelEvents.slice(0, 3).map(e => (
                                        <div key={e.id} className="text-sm text-gray-300 bg-gray-800 px-3 py-1.5 rounded">
                                            🕒 {e.start.slice(11, 16)} - {typeof e.title === 'object'? e.title._ : e.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>}
        </div>

    );
}