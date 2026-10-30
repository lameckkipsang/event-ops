import React, { useState, useEffect } from 'react';
import { Store, Filter } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceApi';

export default function VendorMarketplace() {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    marketplaceService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Fetch packages whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTier) params.tier = selectedTier;

    marketplaceService.getPackages(params)
      .then(data => {
        setPackages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching packages:", err);
        setLoading(false);
      });
  }, [selectedCategory, selectedTier]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-3 text-emerald-400">
          <Store className="w-8 h-8 text-orange-500" />
          Vendor Marketplace
        </h1>
        <p className="text-emerald-200/70 mt-1">
          Discover and hire professional service packages to bring your events to life.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-emerald-950/60 border border-emerald-800/80 p-4 rounded-2xl mb-8 flex flex-wrap gap-4 items-center justify-between shadow-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold flex items-center gap-1 text-emerald-300">
            <Filter className="w-4 h-4 text-orange-400" /> Filter by:
          </span>

          {/* Category Filter */}
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

          {/* Tier Filter */}
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

        {/* Clear Filters */}
        {(selectedCategory || selectedTier) && (
          <button 
            onClick={() => { setSelectedCategory(''); setSelectedTier(''); }}
            className="text-xs text-orange-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-20 text-emerald-400 font-medium">Loading marketplace packages...</div>
      ) : packages.length === 0 ? (
        <div className="bg-emerald-950/40 border border-emerald-900 rounded-2xl p-12 text-center text-emerald-300/60">
          No vendor packages found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
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

                <button 
                  onClick={() => alert(`Booking modal hook for package: ${pkg.title}`)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}