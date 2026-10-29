import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export default function EventCard({ event }) {
  if (!event) return null;

  return (
    <div className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm hover:border-orange-500/50 transition-all group flex flex-col justify-between">
      <div>
        <div className="bg-emerald-950 p-4 relative border-b border-emerald-800/50">
          {event.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
              {event.category}
            </span>
          )}
          <h3 className="mt-3 text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
            {event.title}
          </h3>
        </div>

        <div className="p-5 space-y-3">
          {event.description && (
            <p className="text-emerald-200/80 text-sm line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="text-xs text-emerald-300/70 space-y-1.5 pt-2">
            {event.date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>{event.date}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-emerald-800/40 mt-4">
        <div>
          <span className="text-xs text-emerald-300/60 block">Price</span>
          <span className="text-lg font-extrabold text-white">
            {event.price ? `KES ${event.price}` : 'Free'}
          </span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-1.5"
        >
          <Ticket className="w-4 h-4" />
          <span>Get Ticket</span>
        </Link>
      </div>
    </div>
  );
}