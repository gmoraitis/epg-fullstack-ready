import React from 'react';
import EPGCalendar_2 from './components/EPGCalendar_2.jsx';
export default function App() {
  return (<div className='bg-gray-900 h-full w-full'><EPGCalendar_2 apiBase={'http://localhost:4000'} /></div>)
}