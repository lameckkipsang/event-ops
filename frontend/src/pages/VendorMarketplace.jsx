import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Filter, PlusCircle, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceApi';
import api from '../services/api';

export default function VendorMarketplace() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
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

  // Auth & Role Checks
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

    marketplaceService.getPackages(params)
      .then(data => {
        setPackages(data);
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
      .then(data => setCategories(data))
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

  // Vendor Actions
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
      await api.delete(`packages/${id}/`);
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
        await api.put(`packages/${editingPackageId}/`, formData);
      } else {
        await api.post(`packages/`, formData);
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
            Discover and hire professional service packages to bring your events to life.
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

      <div className="bg-emerald-950/60 border border-emerald-800/80 p-4 rounded-2xl mb-8 flex flex-wrap gap-4 items-center justify-between shadow-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold flex items-center gap-1 text-emerald-300">
            <Filter className="w-4 h-4 text-orange-400" /> Filter by:
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
            <option value="">All Tiers</option>
            <option value="BASIC">Basic</option>
            <option value="STANDARD">Standard</option>
            <option value="PREMIUM">Premium</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        {(selectedCategory || selectedTier) && (
          <button 
            onClick={() => { setSelectedCategory(''); setSelectedTier(''); }}
            className="text-xs text-orange-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-emerald-400 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span>Loading marketplace packages...</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-12 text-center text-emerald-300/60">
          No vendor packages found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => {
            const isOwner = pkg.vendor_username?.toLowerCase() === currentUsername?.toLowerCase();
            
            return (
              <div key={pkg.id} className="bg-emerald-900/60 border border-emerald-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-lg">
                      {pkg.tier_display}
                    </span>
                    <span className="text-xs text-emerald-300/80 bg-emerald-950 px-2.5 py-1 rounded-lg">
                      {pkg.category_name}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{pkg.title}</h3>
                  <p className="text-emerald-200/80 text-sm line-clamp-3 mb-4">{pkg.description}</p>
                  
                  <div className="text-xs text-emerald-300/70 mb-4">
                    Offered by: <span className="font-semibold text-white">@{pkg.vendor_username}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-800/40 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-xs text-emerald-400/60 block">Price</span>
                    <span className="text-lg font-bold text-white">KES {parseFloat(pkg.price).toLocaleString()}</span>
                  </div>

                  {isOwner ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(pkg)}
                        className="bg-emerald-800 hover:bg-emerald-700 text-orange-400 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-emerald-600/50 flex items-center gap-1.5"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="bg-red-950 hover:bg-red-900 text-red-300 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-red-800/80 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleBookService(pkg)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-orange-500/20"
                    >
                      Book Service
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-emerald-950 border border-emerald-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 my-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-emerald-900/85 hover:bg-emerald-800 text-emerald-200 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                Vendor Portal
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-3 flex items-center gap-2">
                <Store className="w-6 h-6 text-orange-500" /> 
                {editingPackageId ? 'Edit Service Package' : 'Create Service Package'}
              </h2>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs text-center">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Platinum DJ Setup"
                  className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">Service Tier</label>
                  <select
                    required
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="BASIC">Basic</option>
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Price (KES)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Service Description</label>
                <textarea
                  rows="4"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what is included in this package..."
                  className="w-full bg-emerald-900/50 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Package...
                  </>
                ) : (
                  editingPackageId ? 'Update Service Package' : 'Publish Service Package'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}