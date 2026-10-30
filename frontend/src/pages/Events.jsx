import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function Events() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white relative">
      {/* Header */}
      <div className="border-b border-emerald-800/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" />
          All Events
        </h1>
        <p className="text-emerald-200/70 mt-1">
          Explore all upcoming tech summits, conferences, and community meetups.
        </p>
      </div>
    </div>
  );
}