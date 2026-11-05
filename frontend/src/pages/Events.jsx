import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, X, Ticket, MapPin, CheckCircle2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../services/api';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selected Event Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

  // Hosting / Editing Modal State
  const [isHostingOpen, setIsHostingOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [hostingForm, setHostingForm] = useState({
    title: '',
    description: '',
    category: '',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_location: '',
    ticket_type: 'Regular',
    price: '',
    quantity_available: '100',
  });
  const [hostingLoading, setHostingLoading] = useState(false);
  const [hostingError, setHostingError] = useState('');

  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role') || '';

  // Helper to decode JWT access token to get user ID / username if not stored separately
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const jwtData = token ? parseJwt(token) : null;
  const currentUserId = localStorage.getItem('user_id') || jwtData?.user_id || jwtData?.sub || '';
  const currentUsername = localStorage.getItem('username') || jwtData?.username || '';

  const isOrganizer = token && (role === 'ORGANIZER' || role === 'STAFF' || !role);

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

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setHostingForm({
      title: '',
      description: '',
      category: '',
      start_date: '',
      end_date: '',
      venue_name: '',
      venue_location: '',
      ticket_type: 'Regular',
      price: '',
      quantity_available: '100',
    });
    setHostingError('');
    setIsHostingOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEventId(event.id);
    setHostingForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      start_date: event.start_date || event.date || '',
      end_date: event.end_date || event.date || '',
      venue_name: event.venue_name || '',
      venue_location: event.venue_location || '',
      ticket_type: event.ticket_tiers?.[0]?.ticket_type || 'Regular',
      price: event.ticket_tiers?.[0]?.price !== undefined ? String(event.ticket_tiers[0].price) : '',
      quantity_available: event.ticket_tiers?.[0]?.quantity_available ? String(event.ticket_tiers[0].quantity_available) : '100',
    });
    setHostingError('');
    setSelectedEvent(null);
    setIsHostingOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/events/${eventId}/`);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event. You must be the event organizer to perform this action.');
    }
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

  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setHostingLoading(true);
    setHostingError('');

    const formatDate = (val) => {
      if (!val) return new Date().toISOString().split('T')[0];
      if (val.includes('/')) {
        const [day, month, year] = val.split('/');
        return `${year}-${month}-${day}`;
      }
      return val;
    };

    const parsedPrice = parseFloat(hostingForm.price);

    const payload = {
      title: hostingForm.title,
      description: hostingForm.description,
      category: hostingForm.category,
      start_date: formatDate(hostingForm.start_date),
      end_date: formatDate(hostingForm.end_date || hostingForm.start_date),
      venue_name: hostingForm.venue_name,
      venue_location: hostingForm.venue_location || hostingForm.venue_name,
      ticket_tiers: [
        {
          ticket_type: hostingForm.ticket_type || 'Regular',
          price: isNaN(parsedPrice) ? 0 : parsedPrice,
          quantity_available: parseInt(hostingForm.quantity_available) || 100,
        }
      ]
    };

    try {
      if (editingEventId) {
        await api.put(`/events/${editingEventId}/`, payload);
      } else {
        await api.post('/events/', payload);
      }
      
      setIsHostingOpen(false);
      setEditingEventId(null);
      fetchEvents();
    } catch (err) {
      console.error('Failed to save event:', err.response?.data || err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Please check your inputs and try again.';
      setHostingError(`Failed to save event: ${serverMsg}`);
    } finally {
      setHostingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-800/60 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-500" />
            All Events
          </h1>
          <p className="text-emerald-200/70 mt-1">Explore upcoming events and check available ticket tiers.</p>
        </div>

        {isOrganizer && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Host a New Event</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center text-emerald-200 text-sm">{error}</div>
      ) : events.length === 0 ? (
        <div className="p-12 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center space-y-2">
          <p className="text-emerald-200 text-base font-medium">No events available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onCheckTiers={handleOpenModal} 
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteEvent}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
            />
          ))}
        </div>
      )}

      {/* Host / Edit Event Modal */}
      {isHostingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={() => setIsHostingOpen(false)} />
          <div className="relative bg-emerald-950 border border-emerald-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 my-auto max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsHostingOpen(false)} className="absolute top-4 right-4 bg-emerald-900/85 hover:bg-emerald-800 text-emerald-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                Organizer Portal
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-orange-500" /> 
                {editingEventId ? 'Edit Event Details' : 'Host a New Event'}
              </h2>
            </div>

            {hostingError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs text-center">{hostingError}</div>
            )}

            <form onSubmit={handleHostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={hostingForm.title}
                  onChange={(e) => setHostingForm({ ...hostingForm, title: e.target.value })}
                  placeholder="e.g. Zindua Capstone Presentations"
                  className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={hostingForm.category}
                    onChange={(e) => setHostingForm({ ...hostingForm, category: e.target.value })}
                    placeholder="e.g. Tech, Music"
                    className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={hostingForm.start_date}
                    onChange={(e) => setHostingForm({ ...hostingForm, start_date: e.target.value, end_date: e.target.value })}
                    className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Venue Name</label>
                  <input
                    type="text"
                    required
                    value={hostingForm.venue_name}
                    onChange={(e) => setHostingForm({ ...hostingForm, venue_name: e.target.value })}
                    placeholder="e.g. Parklands Plaza"
                    className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    value={hostingForm.venue_location}
                    onChange={(e) => setHostingForm({ ...hostingForm, venue_location: e.target.value })}
                    placeholder="e.g. Westlands, Nairobi"
                    className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-900/30 border border-emerald-800 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Ticket Pricing</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Tier Name</label>
                    <input
                      type="text"
                      value={hostingForm.ticket_type}
                      onChange={(e) => setHostingForm({ ...hostingForm, ticket_type: e.target.value })}
                      placeholder="Regular / VIP"
                      className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Price (KES)</label>
                    <input
                      type="number"
                      min="0"
                      value={hostingForm.price}
                      onChange={(e) => setHostingForm({ ...hostingForm, price: e.target.value })}
                      placeholder="0 for Free"
                      className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={hostingForm.quantity_available}
                      onChange={(e) => setHostingForm({ ...hostingForm, quantity_available: e.target.value })}
                      placeholder="100"
                      className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={hostingForm.description}
                  onChange={(e) => setHostingForm({ ...hostingForm, description: e.target.value })}
                  placeholder="Provide event details..."
                  className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={hostingLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {hostingLoading ? 'Saving Event...' : editingEventId ? 'Update Event' : 'Publish Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event Details & Ticket Purchasing Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={handleCloseModal} />
          <div className="relative bg-emerald-950 border border-emerald-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex justify-between items-start gap-4 pr-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                  Event Overview
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">{selectedEvent.title}</h2>
              </div>
            </div>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">{selectedEvent.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-emerald-900">
              <div className="flex items-center gap-3 text-emerald-200 text-sm">
                <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>{new Date(selectedEvent.start_date || selectedEvent.date || selectedEvent.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-200 text-sm">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>{selectedEvent.venue_location || selectedEvent.location || 'Nairobi, Kenya'}</span>
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