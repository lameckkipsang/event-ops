import { Calendar, MapPin, Ticket, Edit, Trash2 } from 'lucide-react';

export default function EventCard({ event, onCheckTiers, onEdit, onDelete, currentUserId, currentUsername }) {
  const startingPrice = event.ticket_tiers && event.ticket_tiers.length > 0
    ? Math.min(...event.ticket_tiers.map(tier => parseFloat(tier.price || 0)))
    : null;

  const eventDate = event.start_date || event.date || event.created_at;
  const eventLocation = event.venue_location || event.venue_name || event.location || 'Nairobi, Kenya';

  const token = localStorage.getItem('access_token');

  const isOwner = Boolean(token) && (
    (event.organizer_username && currentUsername && event.organizer_username.toLowerCase() === currentUsername.toLowerCase()) ||
    (event.organizer && String(event.organizer) === String(currentUserId)) ||
    (event.organizer?.id && String(event.organizer.id) === String(currentUserId)) ||
    (event.organizer_id && String(event.organizer_id) === String(currentUserId))
  );

  return (
    <div className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm group flex flex-col justify-between">
      <div>
        {/* Always render header if category exists OR if the user is the owner */}
        {(event.category || isOwner) && (
          <div className="bg-emerald-950 p-4 relative border-b border-emerald-800/50 flex justify-between items-center">
            {event.category ? (
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                {event.category}
              </span>
            ) : <span />}

            {isOwner && (
              <div className="flex items-center gap-2 z-15 ml-auto">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit && onEdit(event); }}
                  className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-orange-400 rounded-lg transition-colors border border-emerald-600/50 flex items-center gap-1.5 text-xs font-bold shadow"
                  title="Edit Event"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDelete && onDelete(event.id); }}
                  className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg transition-colors border border-red-800/80 flex items-center gap-1.5 text-xs font-bold shadow"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-5 space-y-3">
          <h3 className="text-xl font-bold text-white">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-emerald-200/80 text-sm line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="text-xs text-emerald-300/70 space-y-1.5 pt-2">
            {eventDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>{new Date(eventDate).toLocaleDateString()}</span>
              </div>
            )}
            {eventLocation && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
                <span>{eventLocation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between border-t border-emerald-800/40 mt-4">
        <div>
          <span className="text-xs text-emerald-300/60 block">Starting Price</span>
          <span className="text-lg font-extrabold text-white">
            {startingPrice !== null && !isNaN(startingPrice) && startingPrice > 0 
              ? `KES ${startingPrice.toLocaleString()}` 
              : 'Free'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onCheckTiers && onCheckTiers(event)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-1.5"
        >
          <Ticket className="w-4 h-4" />
          <span>Check Ticket Tiers</span>
        </button>
      </div>
    </div>
  );
}