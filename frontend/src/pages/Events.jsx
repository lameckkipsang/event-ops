import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/events/')
      .then((response) => {
        setEvents(response.data);
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setError('Unable to load events at this time.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white relative">
      {/* Header */}
      <div className="border-b border-emerald-800/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" />
          All Events
        </h1>
        <p className="text-emerald-200/70 mt-1">
          Explore all upcoming tech summits, conferences, and community meetups.
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center text-emerald-200 text-sm">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center space-y-2">
          <p className="text-emerald-200 text-base font-medium">No events available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="cursor-pointer transform transition-all hover:-translate-y-1">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}