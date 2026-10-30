import React from 'react';
import { Store } from 'lucide-react';

export default function VendorMarketplace() {
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
    </div>
  );
}