import React from 'react';
import EPGCalendar from './components/EPGCalendar.jsx';
export default function App() {
  return (<div className='bg-gray-900 h-full w-full'><EPGCalendar apiBase={'http://localhost:4000'} /></div>)
}