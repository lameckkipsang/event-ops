import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Shield, Ticket, ArrowRight, Sparkles, Loader2, X, MapPin, CheckCircle2 } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

  const token = localStorage.getItem('access_token');

  const fetchEvents = () => {
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
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setSelectedTier(null);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedTier(null);
  };

  const handlePurchaseTicket = () => {
    if (!selectedTier || !selectedEvent) return;

    navigate('/payment', {
      state: {
        item: {
          id: selectedTier.id,
          title: `${selectedEvent.title} - ${selectedTier.ticket_type}`,
          price: selectedTier.price,
          description: selectedEvent.description || 'Event Ticket Booking',
        },
        type: 'event_ticket',
      },
    });
  };

  const handleHostClick = (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/events');
  };

  return (
    <div className="space-y-16 pb-12 relative text-white">
      <section className="bg-emerald-950 text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 rounded-b-3xl border-b border-emerald-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center space-x-2 bg-emerald-900/80 text-orange-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-orange-500/30">
            <Shield className="w-4 h-4" />
            <span>Escrow-Protected Ticketing Guarantee</span>
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Seamless Event Planning & <span className="text-orange-500">Scam-Free</span> Ticketing
          </h1>
          
          <p className="text-lg sm:text-xl text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Discover verified events, buy tickets instantly via M-Pesa, and hire top service vendors with built-in escrow security.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/events"
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Events</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            
            <button
              onClick={handleHostClick}
              className="w-full sm:w-auto bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 border border-emerald-700/50 font-semibold px-8 py-3.5 rounded-xl flex items-center justify-center transition-all"
            >
              Host an Event
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-emerald-900/60 border border-emerald-800/80 p-7 rounded-2xl shadow-lg backdrop-blur-sm space-y-4">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl flex items-center justify-center font-bold">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-xl">Instant Mobile STK Push</h3>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Complete payments seamlessly via M-Pesa STK Push and instantly generate secure digital tickets with QR validation.
            </p>
          </div>

          <div className="bg-emerald-900/60 border border-emerald-800/80 p-7 rounded-2xl shadow-lg backdrop-blur-sm space-y-4">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl flex items-center justify-center font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-xl">Escrow Fund Protection</h3>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Ticket payouts and vendor hire deposits are safely held in escrow until the event is executed successfully.
            </p>
          </div>

          <div className="bg-emerald-900/60 border border-emerald-800/80 p-7 rounded-2xl shadow-lg backdrop-blur-sm space-y-4">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-xl">Verified Vendor Marketplace</h3>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Hire vetted sound engineers, DJs, caterers, and venues directly with transparent pricing and review histories.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/marketplace" 
          className="bg-emerald-900/60 border border-emerald-800/80 p-7 rounded-2xl shadow-lg backdrop-blur-sm space-y-4 hover:border-orange-500/50 transition-all transform hover:-translate-y-1 block group"
        >
          <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl flex items-center justify-center font-bold group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-xl flex items-center justify-between">
            <span>Verified Vendor Marketplace</span>
            <ArrowRight className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            Hire vetted sound engineers, DJs, caterers, and venues directly with transparent pricing and review histories.
          </p>
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-emerald-800/60 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Upcoming Highlights</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Events</h2>
          </div>
          <Link to="/events" className="text-orange-400 hover:text-orange-300 font-bold text-sm flex items-center space-x-1">
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 space-y-3 text-emerald-200">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="p-6 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center text-emerald-200 text-sm">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center space-y-2">
            <p className="text-emerald-200 text-base font-medium">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} onCheckTiers={handleOpenModal} />
            ))}
          </div>
        )}
      </section>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={handleCloseModal} />
          <div className="relative bg-emerald-950 border border-emerald-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                Event Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">{selectedEvent.title}</h2>
            </div>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">{selectedEvent.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-emerald-900">
              <div className="flex items-center gap-3 text-emerald-200 text-sm">
                <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>{new Date(selectedEvent.date || selectedEvent.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-200 text-sm">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>{selectedEvent.location || 'Nairobi, Kenya'}</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3">Select Available Ticket</h3>
              <div className="space-y-3">
                {selectedEvent.ticket_tiers && selectedEvent.ticket_tiers.length > 0 ? (
                  selectedEvent.ticket_tiers.map((tier) => {
                    const isSelected = selectedTier?.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all border ${
                          isSelected ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-500/10' : 'bg-emerald-900/40 border-emerald-800/60 hover:border-emerald-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-400" />}
                          <div>
                            <span className="font-bold text-white text-sm block">{tier.ticket_type}</span>
                            <span className="text-xs text-emerald-300/70">{tier.quantity_available} available</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-orange-400 text-base">KES {parseFloat(tier.price).toLocaleString()}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-emerald-300/60">Free Admission / No tickets required</div>
                )}
              </div>
            </div>

            {selectedTier && (
              <div className="pt-4 border-t border-emerald-900 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400/70 block">Total Price</span>
                  <span className="text-xl font-extrabold text-white">KES {parseFloat(selectedTier.price).toLocaleString()}</span>
                </div>
                <button 
                  onClick={handlePurchaseTicket}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  Purchase Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}