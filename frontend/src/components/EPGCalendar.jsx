import React, { useEffect, useState } from "react";
import { FaInfoCircle, FaSync, FaTimes } from "react-icons/fa";
const HOUR_HEIGHT = 140; // Adjusted for a reasonable zoom level

// Create an array of 15-minute intervals for the timeline
const TIME_MARKERS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const isHour = minute === 0;
  const label = isHour ? `${hour.toString().padStart(2, "0")}:00` : `:${minute}`;
  return { id: i, label, isHour };
});

const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
const TARGET_TIMEZONE = "Europe/Athens";

/**
 * Calculates the total minutes from the start of the day for a given Date object in a specific timezone.
 * This is a reliable, mathematical way to handle timezone-specific calculations.
 * @param {Date} dateObj The date object to calculate from.
 * @param {string} timeZone The IANA timezone string (e.g., "Europe/Athens").
 * @returns {number} The total minutes from the start of the day in that timezone.
 */
function getMinutesInTimezone(dateObj, timeZone) {
  // Use Intl.DateTimeFormat to get the hour and minute in the target timezone.
  // This is the most reliable way to handle timezones, including DST.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false, // Use 24-hour format for easier parsing
  });

  const parts = formatter.formatToParts(dateObj);
  const hour = parseInt(parts.find(p => p.type === 'hour').value, 10) % 24; // Use modulo to handle '24' for midnight
  const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
  return hour * 60 + minute;
}

export default function EPGCalendar({ apiBase = '' }) {
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [channels, setChannels] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [infoModalEvent, setInfoModalEvent] = useState(null);
  const [infoModalPoster, setInfoModalPoster] = useState(null); // State for the movie poster
  const [hiddenEvents, setHiddenEvents] = useState({});
  const [allChannels, setAllChannels] = useState({}); // New state for all available channels
  const [showChannelModal, setShowChannelModal] = useState(false); // New state for modal visibility
  const [selectedChannels, setSelectedChannels] = useState({}); // New state for selected channels
  const [hiddenChannelIds, setHiddenChannelIds] = useState({}); // New state for hiding columns
  const [nowLineTop, setNowLineTop] = useState(null); // State for the current time indicator line

  useEffect(() => {
    fetchData();
  }, [date, apiBase]); // Initial fetch on date change

  useEffect(() => {
    // Refetch when selected channels change, but only if the modal is closed
    if (!showChannelModal) {
      fetchData();
    }
  }, [selectedChannels, showChannelModal]); // Refetch when channel selection is applied

  useEffect(() => {
    const updateNowLine = () => {
      const today = new Date().toLocaleDateString('en-CA');
      if (date === today) {
        const now = new Date();
        const minutesFromDayStart = getMinutesInTimezone(now, TARGET_TIMEZONE);
        setNowLineTop((minutesFromDayStart / 60) * HOUR_HEIGHT);
      } else {
        setNowLineTop(null); // Hide line for other days
      }
    };

    updateNowLine();
    const intervalId = setInterval(updateNowLine, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, [date]);

  const fetchData = (force = false) => {
    const activeChannelIds = Object.keys(selectedChannels).filter(id => selectedChannels[id]);
    const channelQuery = activeChannelIds.length > 0 ? `&channels=${activeChannelIds.join(',')}` : '';
    const url = `${apiBase}/api/epg?date=${date}${channelQuery}`;

    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }; if (force) {
      options.cache = 'reload';
    }
    fetch(url, options)
      .then((r) => r.json())
      .then((data) => {
        setChannels(data.channels || []);
        setEvents(data.events || []);
        setEvents(data.events || []);
        setAllChannels(data.allChannels || {});

        // Initialize selected channels on first load
        if (Object.keys(selectedChannels).length === 0 && data.channels) {
          const initialSelected = {};
          data.channels.forEach(ch => initialSelected[ch.id] = true);
          setSelectedChannels(initialSelected);
        }

        if (force) console.log("Data refetched from server.");
      })
      .catch((err) => console.error(err));
    // setSelectedEvent([]); // Do not reset selected events on date change to allow notes across days.
    // Do not reset hidden channels on date change to persist them within the session.
  };

  function getEventStyle(ev) {
    const eventStartDate = new Date(ev.start);
    const eventEndDate = new Date(ev.end);

    // Calculate position based on Athens time.
    const minutesFromDayStart = getMinutesInTimezone(eventStartDate, TARGET_TIMEZONE);
    const top = (minutesFromDayStart / 60) * HOUR_HEIGHT;

    const height = Math.max(
      ((eventEndDate - eventStartDate) / MILLISECONDS_IN_HOUR) * HOUR_HEIGHT,
      20
    ); // Set a minimum height of 20px
    return { top, height };
  }

  const handleEventClick = (event) => {
    const currentSelected = selectedEvent ? [...selectedEvent] : [];
    const isSelected = currentSelected.some(e => e.id === event.id);

    if (isSelected) {
      setSelectedEvent(currentSelected.filter(e => e.id !== event.id));
    } else {
      const newSelected = [...currentSelected, event];
      newSelected.sort((a, b) => new Date(a.start) - new Date(b.start));
      setSelectedEvent(newSelected);
    }
  };

  function hideEvent(ev) {
    setHiddenEvents(prev => ({ ...prev, [ev.id]: true }));
  }
  const checkOverlap = (eventA, eventB) => {
    const startA = new Date(eventA.start).getTime();
    const endA = new Date(eventA.end).getTime();
    const startB = new Date(eventB.start).getTime();
    const endB = new Date(eventB.end).getTime();

    return (startA < endB && endA > startB);
  };

  const getOverlappingEvents = (events) => {
    const overlapping = new Set();
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (checkOverlap(events[i], events[j])) {
          overlapping.add(events[i].id);
          overlapping.add(events[j].id);
        }
      }
    }
    return overlapping;
  };

  const hideChannelColumn = (channelId) => {
    setHiddenChannelIds(prev => ({ ...prev, [channelId]: true }));
  };

  function changeDay(offset) {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + offset);
    setDate(currentDate.toLocaleDateString('en-CA'));
  }

  const today = new Date();
  const todayString = today.toLocaleDateString('en-CA');

  const capitalize = (s) => {
    if (typeof s !== 'string' || s.length === 0) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  /**
   * Fetches movie details from TMDB to get a poster image.
   * @param {object} event The event object containing the title.
   */
  const fetchMoviePoster = async (event) => {
    if (!event || !event.title) return;

    // Reset poster for the new modal
    setInfoModalPoster(null);

    const apiKey = process.env.REACT_APP_TMDB_API_KEY;
    if (!apiKey) {
      console.error("TMDB API key is missing. Please add it to your .env.local file.");
      return;
    }

    try {
      const searchResponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(event.title)}`);
      const searchData = await searchResponse.json();

      if (searchData.results && searchData.results.length > 0) {
        const posterPath = searchData.results[0].poster_path;
        if (posterPath) setInfoModalPoster(`https://image.tmdb.org/t/p/w500${posterPath}`);
      }
    } catch (error) {
      console.error("Failed to fetch movie poster:", error);
    }
  };
  return (
    <div className="text-gray-100 p-4 h-full flex flex-col">
      {/* =================================================================
          1. HEADER SECTION
          - Title, date navigation, and main action buttons.
      ================================================================= */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">EPG Calendar</h2>
        <div className="flex items-center gap-2">
          {/* Date Navigation */}
          <button onClick={() => changeDay(-1)} className="p-2 bg-gray-800 rounded w-10 font-bold text-lg">&lt;</button>
          <span className="p-2 bg-gray-800 rounded w-48 text-center">
            {new Date(date + 'T00:00:00').toLocaleDateString('el-GR', {
              weekday: 'long', day: '2-digit', month: '2-digit'
            })}
          </span>
          <button onClick={() => changeDay(1)} className="p-2 bg-gray-800 rounded w-10 font-bold text-lg">&gt;</button>
          {/* Action Buttons */}
          <button onClick={() => setShowChannelModal(true)} className="p-2 bg-indigo-600 rounded ml-4" title="Select Channels">
            Channels
          </button>
          <button onClick={() => fetchData(true)} className="p-2 bg-gray-800 rounded ml-4" title="Refetch data">
            <FaSync />
          </button>
        </div>
      </div>

      {/* =================================================================
          2. EPG GRID (Scrollable Area)
          - Contains the timeline and all channel columns.
      ================================================================= */}
      <div className="flex-grow overflow-auto relative">
        <div style={{ display: 'flex', position: 'relative' }}>
          {/* 2a. Timeline Column */}
          <div style={{ width: 50, flexShrink: 0, position: 'sticky', left: 0, zIndex: 20 }} className="border-r border-gray-800 bg-gray-900">
            {/* Sticky Header for alignment */}
            <div className="sticky top-0 bg-gray-900 h-10 border-b border-gray-800">&nbsp;</div>
            {/* Current Time Line Indicator - Placed here for correct positioning context */}
            {nowLineTop !== null && (
              <div
                className="absolute border-t-2 border-red-500"
                style={{
                  top: `${nowLineTop}px`,
                  left: 0,
                  width: '100vw', // Make it very wide
                  transform: 'translateX(50px)', // Move it to start after the timeline
                  zIndex: 25, // Ensure it's above events but below modals
                }}
              />
            )}
            {/* Timeline markers (e.g., 01:00, :15, :30) */}
            <div className="pr-2">
              {TIME_MARKERS.map(marker => (
                <div key={marker.id} style={{ height: HOUR_HEIGHT / 4 }} className={`text-right ${marker.isHour ? 'text-sm text-gray-400' : 'text-xs text-gray-600'}`}>
                  {marker.label}
                </div>
              ))}
            </div>
          </div>

          {/* 2c. Channel Columns */}
          {channels.filter(ch => !hiddenChannelIds[ch.id]).map(ch => (
            <div key={ch.id} style={{ width: 200, flexShrink: 1, minWidth: 140, maxWidth: 500 }} className="border-l border-gray-800">
              <div className="font-medium sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 h-10 text-center flex items-center justify-center border-b border-gray-800 group">
                <span className="flex-grow">{capitalize(ch.name)}</span>
                <button onClick={() => hideChannelColumn(ch.id)} className="absolute right-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title={`Hide ${capitalize(ch.name)}`}>
                  <FaTimes />
                </button>
              </div>
              {/* Events container for a single channel */}
              <div style={{ position: 'relative', minHeight: HOUR_HEIGHT * 24 }} className="p-2">
                {events.filter(ev => ev.channelId === ch.id && !hiddenEvents[ev.id]).map(ev => {
                  const isDayInPast = date < todayString;
                  const isEventInPastToday = date === todayString && new Date(ev.end) < today;
                  const isPast = isDayInPast || isEventInPastToday;
                  const isSelected = selectedEvent?.find(e => e.id === ev.id);

                  const st = getEventStyle(ev);
                  {/* Individual Event Item */ }
                  return (
                    <div
                      key={ev.id}
                      style={{
                        position: 'absolute',
                        left: 8,
                        right: 8,
                        top: `${st.top}px`,
                        height: `${st.height}px`,
                        borderRadius: 8,
                        backgroundColor: isSelected ? '#ef4444' : (isPast ? '#2d3748' : '#47419cff'), // red-700, gray-800, custom-blue
                        color: 'white',
                      }}
                      className="p-2 text-sm cursor-pointer border border-gray-800"
                      onClick={() => handleEventClick(ev)}>
                      <div className="flex justify-between items-start h-full">
                        <div className="flex-grow overflow-hidden">
                          <div className="font-semibold">{ev.title}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(ev.start).toLocaleDateString('el-GR', { timeZone: TARGET_TIMEZONE, weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-gray-300">
                            <span>
                              {new Date(ev.start).toLocaleTimeString([], { timeZone: TARGET_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })}
                              {' - '}
                              {new Date(ev.end).toLocaleTimeString([], { timeZone: TARGET_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 pl-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInfoModalEvent(ev);
                              fetchMoviePoster(ev); // Fetch poster on info click
                            }}
                            className="text-white/70 hover:text-white">
                            <FaInfoCircle />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); hideEvent(ev); }} className="text-red-300 hover:text-white font-bold">
                            &times;
                          </button>
                        </div>
                      </div>
                      {isSelected && <div className="absolute w-full border-b-2 border-dashed border-red-400" style={{ top: '50%', left: '-100vw', width: '200vw', zIndex: -1 }}></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================
          3. EVENT INFO MODAL
          - Displays detailed information about a single event.
      ================================================================= */}
      {infoModalEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-3xl w-11/12 flex gap-6">
            {infoModalPoster && (
              <img src={infoModalPoster} alt="Movie Poster" className="w-1/3 rounded-md object-cover" />
            )}
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{infoModalEvent.title}</h3>
                  <div className="text-sm text-gray-400">{capitalize(allChannels[infoModalEvent.channelId] || infoModalEvent.channelId)} • {''}
                    {new Date(infoModalEvent.start).toLocaleTimeString([], { timeZone: TARGET_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })}
                    {' - '}
                    {new Date(infoModalEvent.end).toLocaleTimeString([], { timeZone: TARGET_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
                <button onClick={() => setInfoModalEvent(null)} className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-white">
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-300 flex-grow overflow-y-auto max-h-48 pr-2">
                {infoModalEvent.description}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { window.open(apiBase + '/api/program/' + encodeURIComponent(infoModalEvent.id)); }} className="px-4 py-2 bg-indigo-600 rounded text-sm">More Details</button>
                <button onClick={() => setInfoModalEvent(null)} className="px-4 py-2 bg-gray-800 rounded text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          4. NOTES SECTION
          - Lists all events that the user has selected/clicked on.
      ================================================================= */}
      {selectedEvent && selectedEvent.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <div className="text-sm space-y-1">
            {selectedEvent.map(event => {
              const overlappingEvents = getOverlappingEvents(selectedEvent);
              const isOverlapping = overlappingEvents.has(event.id);
              return (
                <div key={event.id} className={`flex justify-between items-center p-2 rounded ${isOverlapping ? 'bg-red-900/50' : 'bg-gray-700/50'}`}>
                  <span>
                    <span className="font-semibold text-indigo-300 mr-2">{capitalize(allChannels[event.channelId])}</span>
                    <span className="font-bold ">{event.title}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({new Date(event.start).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                      {' '}
                      {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      {' - '}
                      {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })})
                    </span>
                  </span>
                  <button onClick={() => handleEventClick(event)} className="text-red-400 hover:text-red-200"><FaTimes /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================
          5. CHANNEL SELECTION MODAL
          - Allows users to show or hide specific channel columns.
      ================================================================= */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-11/12 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Select Channels</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
              {Object.entries(allChannels)
                .sort(([, aName], [, bName]) => aName.localeCompare(bName))
                .map(([id, name]) => (
                  <div key={id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`ch-${id}`}
                      checked={!!selectedChannels[id]}
                      onChange={() => {
                        setSelectedChannels(prev => ({
                          ...prev,
                          [id]: !prev[id]
                        }));
                      }}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor={`ch-${id}`} className="text-sm">{capitalize(name)}</label>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowChannelModal(false)} className="px-4 py-2 bg-indigo-600 rounded">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
