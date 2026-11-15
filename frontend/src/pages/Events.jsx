import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, X, Ticket, MapPin, PlusCircle, Trash2, Plus, ImageIcon } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../services/api';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

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
  });
  
  const [ticketTiers, setTicketTiers] = useState([
    { ticket_type: 'Regular', price: '', quantity_available: '100', description: 'Standard entry access to all general areas.' }
  ]);
  
  const [imageFiles, setImageFiles] = useState([]);
  const [hostingLoading, setHostingLoading] = useState(false);
  const [hostingError, setHostingError] = useState('');

  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role') || '';

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
  const isOrganizer = token && (role === 'ORGANIZER' || role === 'STAFF');

  // Prevent attendees from viewing empty management routes if they land on them directly
  useEffect(() => {
    if (!isOrganizer && window.location.pathname.includes('/manage-events')) {
      navigate('/events', { replace: true });
    }
  }, [isOrganizer, navigate]);

  const fetchEvents = () => {
    api.get('/events/')
      .then((response) => {
        const data = response.data.results || response.data;
        setEvents(data);
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
    setSelectedTier(event.ticket_tiers?.[0] || null);
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
    });
    setTicketTiers([
      { ticket_type: 'Regular', price: '', quantity_available: '100', description: 'Standard entry access to all general areas.' }
    ]);
    setImageFiles([]); 
    setHostingError('');
    setIsHostingOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEventId(event.id);
    setHostingForm({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      start_date: event.start_date ? event.start_date.split('T')[0] : '',
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      venue_name: event.venue_name || '',
      venue_location: event.venue_location || '',
    });
    
    if (event.ticket_tiers && event.ticket_tiers.length > 0) {
      setTicketTiers(event.ticket_tiers.map(t => ({
        ticket_type: t.ticket_type || 'Regular',
        price: t.price !== undefined ? String(t.price) : '',
        quantity_available: t.quantity_available ? String(t.quantity_available) : '100',
        description: t.description || 'Access tier perks.'
      })));
    } else {
      setTicketTiers([
        { ticket_type: 'Regular', price: '', quantity_available: '100', description: 'Standard entry access.' }
      ]);
    }

    setImageFiles([]);
    setHostingError('');
    setSelectedEvent(null);
    setIsHostingOpen(true);
  };

  const handleAddTierRow = () => {
    setTicketTiers([...ticketTiers, { ticket_type: 'VIP', price: '', quantity_available: '50', description: 'Priority seating and complimentary refreshments.' }]);
  };

  const handleRemoveTierRow = (index) => {
    if (ticketTiers.length === 1) return;
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...ticketTiers];
    updated[index][field] = value;
    setTicketTiers(updated);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
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
    const checkoutState = {
      item: {
        id: selectedTier.id,
        title: `${selectedEvent.title} - ${selectedTier.ticket_type}`,
        price: selectedTier.price,
        description: selectedTier.description || selectedEvent.description || 'Event Ticket Booking',
      },
      type: 'event_ticket',
    };
    if (!token) {
      navigate('/login', { state: { returnTo: '/payment', ...checkoutState } });
      return;
    }
    navigate('/payment', { state: checkoutState });
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

    const formData = new FormData();
    formData.append('title', hostingForm.title);
    formData.append('description', hostingForm.description);
    if(hostingForm.category) formData.append('category', hostingForm.category);
    formData.append('start_date', formatDate(hostingForm.start_date));
    formData.append('end_date', formatDate(hostingForm.end_date || hostingForm.start_date));
    formData.append('venue_name', hostingForm.venue_name);
    formData.append('venue_location', hostingForm.venue_location || hostingForm.venue_name);

    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    const formattedTiers = ticketTiers.map(tier => ({
      ticket_type: tier.ticket_type || 'Regular',
      price: isNaN(parseFloat(tier.price)) ? 0 : parseFloat(tier.price),
      quantity_available: parseInt(tier.quantity_available) || 100,
      description: tier.description || ''
    }));

    formData.append('ticket_tiers', JSON.stringify(formattedTiers));

    try {
      if (editingEventId) {
        await api.patch(`/events/${editingEventId}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await api.post('/events/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
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

        {isOrganizer ? (
          <button
            onClick={handleOpenCreateModal}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Host a New Event</span>
          </button>
        ) : (
          <div className="bg-emerald-950/60 border border-emerald-800 px-4 py-2.5 rounded-xl text-emerald-300 text-xs font-semibold">
            Signed in as Attendee
          </div>
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

      {/* Full Screen Hosting Modal */}
      {isHostingOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-emerald-950 overflow-y-auto w-full h-full">
          <div className="w-full max-w-4xl mx-auto p-6 sm:p-12 space-y-8 pb-32">
            
            <div className="flex justify-between items-center border-b border-emerald-800/80 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                  Organizer Portal
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-3 flex items-center gap-2">
                  <PlusCircle className="w-8 h-8 text-orange-500" /> 
                  {editingEventId ? 'Edit Event Details' : 'Host a New Event'}
                </h2>
              </div>
              <button onClick={() => setIsHostingOpen(false)} className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 p-3 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {hostingError && (
              <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-sm text-center">{hostingError}</div>
            )}

            <form onSubmit={handleHostSubmit} className="space-y-8">
              {/* Event Basics */}
              <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-800/60 space-y-6">
                <h3 className="text-lg font-bold text-emerald-400">1. Basic Information</h3>
                <div>
                  <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    value={hostingForm.title}
                    onChange={(e) => setHostingForm({ ...hostingForm, title: e.target.value })}
                    placeholder="e.g. Zindua Capstone Presentations"
                    className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Event Description</label>
                  <textarea
                    rows="4"
                    required
                    value={hostingForm.description}
                    onChange={(e) => setHostingForm({ ...hostingForm, description: e.target.value })}
                    placeholder="Provide event details..."
                    className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Category</label>
                    <input
                      type="text"
                      required
                      value={hostingForm.category}
                      onChange={(e) => setHostingForm({ ...hostingForm, category: e.target.value })}
                      placeholder="e.g. Tech, Music"
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Event Images / Banners</label>
                    <div className="relative">
                      <ImageIcon className="w-5 h-5 text-emerald-400 absolute left-4 top-3.5" />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-emerald-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-800 file:text-emerald-200 hover:file:bg-emerald-700 cursor-pointer"
                      />
                    </div>
                    {imageFiles.length > 0 && (
                      <p className="text-[11px] text-emerald-400 mt-1">{imageFiles.length} file(s) selected.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Time & Location */}
              <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-800/60 space-y-6">
                <h3 className="text-lg font-bold text-emerald-400">2. Time & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={hostingForm.start_date}
                      onChange={(e) => setHostingForm({ ...hostingForm, start_date: e.target.value, end_date: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-1.5">End Date</label>
                    <input
                      type="date"
                      required
                      value={hostingForm.end_date}
                      onChange={(e) => setHostingForm({ ...hostingForm, end_date: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Venue Name</label>
                    <input
                      type="text"
                      required
                      value={hostingForm.venue_name}
                      onChange={(e) => setHostingForm({ ...hostingForm, venue_name: e.target.value })}
                      placeholder="e.g. Parklands Plaza"
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-1.5">Venue Location</label>
                    <input
                      type="text"
                      required
                      value={hostingForm.venue_location}
                      onChange={(e) => setHostingForm({ ...hostingForm, venue_location: e.target.value })}
                      placeholder="e.g. Westlands, Nairobi"
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tiers */}
              <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-800/60 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-emerald-400">3. Ticket Tiers & Pricing</h3>
                  <button
                    type="button"
                    onClick={handleAddTierRow}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" /> Add Another Tier
                  </button>
                </div>

                {ticketTiers.map((tier, index) => (
                  <div key={index} className="p-5 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl space-y-4 relative">
                    {ticketTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTierRow(index)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-2 bg-red-950/50 rounded-lg transition-colors"
                        title="Remove Tier"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pr-12">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Tier Name</label>
                        <select
                          value={tier.ticket_type}
                          onChange={(e) => handleTierChange(index, 'ticket_type', e.target.value)}
                          className="w-full bg-emerald-900 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="Basic" className="bg-emerald-950 text-white">Basic</option>
                          <option value="Regular" className="bg-emerald-950 text-white">Regular</option>
                          <option value="VIP" className="bg-emerald-950 text-white">VIP</option>
                          <option value="VVIP" className="bg-emerald-950 text-white">VVIP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Price (KES)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={tier.price}
                          onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                          placeholder="0 for Free"
                          className="w-full bg-emerald-900 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Available Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={tier.quantity_available}
                          onChange={(e) => handleTierChange(index, 'quantity_available', e.target.value)}
                          placeholder="100"
                          className="w-full bg-emerald-900 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Tier Description (What's included?)</label>
                      <input
                        type="text"
                        value={tier.description || ''}
                        onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                        placeholder="e.g. Standard entry access to all general sessions."
                        className="w-full bg-emerald-900 border border-emerald-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={hostingLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all text-lg"
                >
                  {hostingLoading ? 'Saving Event...' : editingEventId ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Ticket Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-emerald-950 overflow-y-auto w-full h-full">
          <div className="w-full max-w-5xl mx-auto p-6 sm:p-12 space-y-8 pb-32">
            
            <button onClick={handleCloseModal} className="absolute top-6 right-6 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 p-3 rounded-full transition-colors z-20 shadow-lg border border-emerald-700/50">
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col lg:flex-row gap-12">
               {/* Left Column - Event Details */}
               <div className="lg:w-1/2 space-y-6">
                  {selectedEvent.images && selectedEvent.images.length > 0 ? (
                    <div className="w-full h-64 sm:h-80 rounded-3xl overflow-hidden relative shadow-2xl border border-emerald-800">
                      <img 
                        src={selectedEvent.images[0].image_url} 
                        alt={selectedEvent.title} 
                        className="w-full h-full object-cover"
                      />
                      {selectedEvent.images.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-md">
                          + {selectedEvent.images.length - 1} More Photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 sm:h-80 rounded-3xl bg-emerald-900/50 border border-emerald-800 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-emerald-800" />
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1.5 rounded-lg border border-orange-500/30">
                      Event Overview
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 leading-tight">{selectedEvent.title}</h2>
                  </div>

                  <p className="text-emerald-100/90 text-base leading-relaxed">{selectedEvent.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-emerald-800/60">
                    <div className="flex items-center gap-3 text-emerald-200">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold">{new Date(selectedEvent.start_date || selectedEvent.date || selectedEvent.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-200">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold">{selectedEvent.venue_location || selectedEvent.location || 'Nairobi, Kenya'}</span>
                    </div>
                  </div>
               </div>

               {/* Right Column - Ticket Selection */}
               <div className="lg:w-1/2 flex flex-col justify-center">
                 <div className="bg-emerald-900/30 p-8 rounded-3xl border border-emerald-800/60">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Ticket className="w-6 h-6 text-orange-400" /> Select Ticket Tier
                    </h3>
                    <div className="space-y-4">
                      {selectedEvent.ticket_tiers && selectedEvent.ticket_tiers.length > 0 ? (
                        selectedEvent.ticket_tiers.map((tier) => {
                          const isSelected = selectedTier?.id === tier.id;
                          return (
                            <div
                              key={tier.id}
                              onClick={() => setSelectedTier(tier)}
                              className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                                isSelected ? 'bg-orange-950/60 border-orange-500 shadow-xl shadow-orange-500/10' : 'bg-emerald-950/60 border-emerald-800/60 hover:border-emerald-600'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-orange-500' : 'border-emerald-600'}`}>
                                      {isSelected && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                  </div>
                                  <span className="font-extrabold text-white text-lg">{tier.ticket_type}</span>
                                </div>
                                <span className="font-extrabold text-orange-400 text-xl">
                                  {parseFloat(tier.price) > 0 ? `KES ${parseFloat(tier.price).toLocaleString()}` : 'Free'}
                                </span>
                              </div>
                              {tier.description && (
                                <p className="text-sm text-emerald-200/80 pl-8 mt-2">{tier.description}</p>
                              )}
                              <span className="text-[11px] text-emerald-400/70 pl-8 mt-3 block font-bold uppercase tracking-wider">
                                {tier.quantity_available} tickets available
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm font-semibold text-emerald-300/80 p-6 bg-emerald-950/60 rounded-2xl border border-emerald-800 text-center">
                          Free Admission / No tickets required
                        </div>
                      )}
                    </div>

                    {selectedTier && (
                      <div className="pt-8 mt-8 border-t border-emerald-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/70 block">Total Due</span>
                          <span className="text-3xl font-extrabold text-white">
                            {parseFloat(selectedTier.price) > 0 ? `KES ${parseFloat(selectedTier.price).toLocaleString()}` : 'Free'}
                          </span>
                        </div>
                        <button 
                          onClick={handlePurchaseTicket}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-orange-500/25 flex items-center gap-2 transition-all"
                        >
                          <Ticket className="w-5 h-5" />
                          Checkout Securely
                        </button>
                      </div>
                    )}
                 </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}