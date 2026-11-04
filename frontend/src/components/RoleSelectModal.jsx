import React, { useState } from 'react';
import { UserCheck, Shield, Store, Calendar, ArrowRight } from 'lucide-react';

export default function RoleSelectModal({ isOpen, onSubmit, onCancel }) {
  const [selectedRole, setSelectedRole] = useState('ATTENDEE');

  if (!isOpen) return null;

  const roles = [
    { id: 'ATTENDEE', label: 'Attendee', description: 'Browse events and purchase tickets', icon: UserCheck },
    { id: 'ORGANIZER', label: 'Organizer', description: 'Create and manage events & tickets', icon: Calendar },
    { id: 'VENDOR', label: 'Vendor / Supplier', description: 'Offer service packages to events', icon: Store },
    { id: 'SECURITY', label: 'Security Agency', description: 'Check in tickets and verify attendees', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-md">
      <div className="bg-emerald-950 border border-emerald-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-white space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
            Almost Done
          </span>
          <h2 className="text-2xl font-bold mt-3">Select Your Role</h2>
          <p className="text-emerald-200/70 text-sm mt-1">
            Please choose how you plan to use EventOps. This tailors your dashboard experience.
          </p>
        </div>

        <div className="space-y-3">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-orange-950/40 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-emerald-900/40 border-emerald-800/60 hover:border-emerald-700'
                }`}
              >
                <div className={`p-3 rounded-xl ${isSelected ? 'bg-orange-500 text-white' : 'bg-emerald-900 text-emerald-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-white block text-sm">{r.label}</span>
                  <span className="text-xs text-emerald-300/70">{r.description}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-emerald-900">
          <button
            onClick={onCancel}
            className="flex-1 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(selectedRole)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}