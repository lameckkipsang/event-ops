import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Filter, PlusCircle, Edit, Trash2, X, Loader2, Mail, Phone, Building } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceApi';
import api from '../services/api';

export default function VendorMarketplace() {
  const navigate = useNavigate();
  const [groupedVendors, setGroupedVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [loading, setLoading] = useState(true);

  // Vendor Management State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tier: 'STANDARD',
    price: '',
    description: '',
  });

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
  const currentUsername = localStorage.getItem('username') || jwtData?.username || '';
  const isVendor = token && role === 'VENDOR';

  const fetchPackages = () => {
    setLoading(true);
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTier) params.tier = selectedTier;

    api.get('marketplace/packages/', { params })
      .then(response => {
        // Backend now returns grouped list originally due to the overridden list method
        const data = response.data.results || response.data;
        setGroupedVendors(data);
      })
      .catch(err => {
        console.error("Error fetching packages:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    marketplaceService.getCategories()
      .then(data => {
        const cats = data.results || data;
        setCategories(cats);
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [selectedCategory, selectedTier]);

  const handleBookService = (pkg) => {
    const checkoutState = {
      item: {
        id: pkg.id,
        title: pkg.title,
        price: pkg.price,
        description: pkg.description,
      },
      type: 'vendor_package',
    };

    if (!token) {
      navigate('/login', { state: { returnTo: '/payment', ...checkoutState } });
      return;
    }
    navigate('/payment', { state: checkoutState });
  };

  const handleOpenCreateModal = () => {
    setEditingPackageId(null);
    setFormData({
      title: '',
      category: categories.length > 0 ? categories[0].id : '',
      tier: 'STANDARD',
      price: '',
      description: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPackageId(pkg.id);
    setFormData({
      title: pkg.title,
      category: pkg.category || '',
      tier: pkg.tier || 'STANDARD',
      price: pkg.price,
      description: pkg.description,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm("Are you sure you want to remove this service from the marketplace?")) return;
    
    try {
      await api.delete(`marketplace/packages/${id}/`);
      fetchPackages();
    } catch (err) {
      console.error("Failed to delete package:", err);
      alert("Failed to delete the package. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError('');

    try {
      if (editingPackageId) {
        await api.patch(`marketplace/packages/${editingPackageId}/`, formData);
      } else {
        await api.post(`marketplace/packages/`, formData);
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      console.error("Failed to save package:", err.response?.data || err);
      setFormError("Failed to save package. Please check your inputs.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-emerald-400">
            <Store className="w-8 h-8 text-orange-500" />
            Vendor Marketplace
          </h1>
          <p className="text-emerald-200/70 mt-1">
            Discover verified companies and explore their service tiers for your next event.
          </p>
        </div>

        {isVendor && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Service Package</span>
          </button>
        )}
      </div>

      <div className="bg-emerald-950/60 border border-emerald-800/80 p-4 rounded-2xl mb-10 flex flex-wrap gap-4 items-center justify-between shadow-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold flex items-center gap-1 text-emerald-300">
            <Filter className="w-4 h-4 text-orange-400" /> Filter Marketplace:
          </span>

          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-emerald-900 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select 
            value={selectedTier} 
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-emerald-900 border border-emerald-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
          >
            <option value="">All Service Tiers</option>
            <option value="BASIC">Basic</option>
            <option value="STANDARD">Standard</option>
            <option value="PREMIUM">Premium</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        {(selectedCategory || selectedTier) && (
          <button 
            onClick={() => { setSelectedCategory(''); setSelectedTier(''); }}
            className="text-xs text-orange-400 hover:underline font-bold px-3 py-2 bg-orange-950/40 rounded-lg border border-orange-500/30"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-emerald-400 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span>Loading vendors and packages...</span>
        </div>
      ) : groupedVendors.length === 0 ? (
        <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-12 text-center text-emerald-300/60">
          No vendors found matching your criteria.
        </div>
      ) : (
        <div className="space-y-12">
          {groupedVendors.map((vendorGroup, idx) => {
            const isOwnerGroup = vendorGroup.vendor_username?.toLowerCase() === currentUsername?.toLowerCase();

            return (
              <div key={idx} className="bg-emerald-900/20 border border-emerald-800/80 rounded-3xl overflow-hidden shadow-2xl">
                {/* Vendor Company Header */}
                <div className="bg-emerald-950/80 p-6 border-b border-emerald-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-500/20 border border-orange-500/40 rounded-2xl flex items-center justify-center text-orange-400 text-xl font-black shadow-lg">
                       {vendorGroup.company_name ? vendorGroup.company_name[0].toUpperCase() : vendorGroup.vendor_username[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        {vendorGroup.company_name} 
                        {isOwnerGroup && <span className="text-[10px] bg-emerald-700/80 text-white px-2 py-0.5 rounded-full ml-2 font-semibold">Your Company</span>}
                      </h2>
                      <p className="text-sm text-emerald-300 font-medium">@{vendorGroup.vendor_username}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-xs text-emerald-200/80">
                    <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-400" /> {vendorGroup.contact_email || 'No email provided'}</span>
                    {vendorGroup.contact_phone && (
                      <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {vendorGroup.contact_phone}</span>
                    )}
                  </div>
                </div>

                {/* Vendor Packages / Tiers */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 bg-emerald-900/10">
                  {vendorGroup.packages.map((pkg) => (
                    <div key={pkg.id} className="bg-emerald-950/90 border border-emerald-800/60 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-600 transition-colors shadow-lg">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-500/20">
                            {pkg.tier_display || pkg.tier}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                            {pkg.category_name}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2">{pkg.title}</h3>
                        <p className="text-emerald-200/80 text-sm line-clamp-4 mb-6">{pkg.description}</p>
                      </div>

                      <div className="pt-4 border-t border-emerald-800/40 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70 block">Package Price</span>
                          <span className="text-lg font-extrabold text-white">KES {parseFloat(pkg.price).toLocaleString()}</span>
                        </div>

                        {isOwnerGroup ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenEditModal(pkg)}
                              className="bg-emerald-800 hover:bg-emerald-700 text-orange-400 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-emerald-600/50 flex items-center gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeletePackage(pkg.id)}
                              className="bg-red-950 hover:bg-red-900 text-red-300 px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-red-800/80 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleBookService(pkg)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2"
                          >
                            Book Tier
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Screen Create / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-emerald-950 overflow-y-auto w-full h-full">
          <div className="w-full max-w-3xl mx-auto p-6 sm:p-12 space-y-8 pb-32 mt-4 sm:mt-10">
            <div className="flex justify-between items-center border-b border-emerald-800/80 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                  Vendor Portal
                </span>
                <h2 className="text-3xl font-extrabold text-white mt-3 flex items-center gap-2">
                  <Store className="w-8 h-8 text-orange-500" /> 
                  {editingPackageId ? 'Edit Service Package' : 'Create Service Package'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 p-3 rounded-full transition-colors border border-emerald-700/50">
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-sm text-center font-semibold shadow-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-emerald-900/20 p-8 rounded-3xl border border-emerald-800/60 space-y-8">
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-300 mb-2">Package Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Platinum DJ Setup or Cinematic Gold Coverage"
                    className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-5 py-4 text-base text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-2">Service Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-orange-500 shadow-inner appearance-none"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-300 mb-2">Package Tier</label>
                    <select
                      required
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:border-orange-500 shadow-inner appearance-none"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-300 mb-2">Price (KES)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-5 py-4 text-base text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-300 mb-2">Service Description (What exactly is included?)</label>
                  <textarea
                    rows="5"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Full-day coverage by 3 professional photographers, drone shots, and a 10-minute highlight video..."
                    className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl px-5 py-4 text-base text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500 shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-emerald-800/60">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transition-all text-lg"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Saving Package...
                    </>
                  ) : (
                    editingPackageId ? 'Update Service Package' : 'Publish Service Package to Marketplace'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}