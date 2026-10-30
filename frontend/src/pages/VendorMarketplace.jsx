import React, { useState, useEffect } from 'react';
import { Store, Filter } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceApi';

export default function VendorMarketplace() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTier, setSelectedTier] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    marketplaceService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

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
    </div>
  );
}