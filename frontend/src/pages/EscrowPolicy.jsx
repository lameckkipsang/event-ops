import React from 'react';
import { ShieldCheck, Lock, CheckCircle, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function EscrowPolicy() {
  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-emerald-900/40 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Escrow Protection Policy</h1>
        <p className="text-emerald-200/70 text-sm md:text-base max-w-xl mx-auto">
          Learn how EventOps protects organizers, vendors, and attendees by holding funds securely until services are fully delivered.
        </p>
      </div>

      <div className="space-y-8">
        
        <div className="flex gap-6 items-start bg-emerald-950/60 p-6 rounded-2xl border border-emerald-800/60">
          <div className="w-12 h-12 shrink-0 bg-emerald-900 border border-emerald-700 rounded-full flex items-center justify-center text-emerald-400 font-black text-lg">
            1
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-100 flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-orange-400" /> Funds are Secured
            </h3>
            <p className="text-sm text-emerald-300/80 leading-relaxed">
              When an organizer books a vendor or an attendee buys a ticket, the payment is processed instantly via M-Pesa. 
              However, the money is <strong>not</strong> sent immediately to the vendor or organizer. Instead, it is held securely in the EventOps Escrow Account.
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-start bg-emerald-950/60 p-6 rounded-2xl border border-emerald-800/60">
          <div className="w-12 h-12 shrink-0 bg-emerald-900 border border-emerald-700 rounded-full flex items-center justify-center text-emerald-400 font-black text-lg">
            2
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-100 flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-orange-400" /> Service Delivery
            </h3>
            <p className="text-sm text-emerald-300/80 leading-relaxed">
              The vendor fulfills their service on the day of the event, or the event takes place as scheduled for the attendees. 
              The funds remain locked, ensuring that buyers are protected against no-shows or scams.
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-start bg-emerald-950/60 p-6 rounded-2xl border border-emerald-800/60">
          <div className="w-12 h-12 shrink-0 bg-emerald-900 border border-emerald-700 rounded-full flex items-center justify-center text-emerald-400 font-black text-lg">
            3
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-100 flex items-center gap-2 mb-2">
              <RefreshCcw className="w-5 h-5 text-orange-400" /> Funds Released
            </h3>
            <p className="text-sm text-emerald-300/80 leading-relaxed">
              Once the event concludes successfully and no disputes are raised within 24 hours, the smart contract automatically releases the funds. 
              The payout is sent directly to the vendor's or organizer's registered M-Pesa phone number.
            </p>
          </div>
        </div>

        <div className="mt-10 p-6 bg-orange-950/30 border border-orange-900/50 rounded-2xl">
          <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> What happens if there is a dispute?
          </h3>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            If a vendor fails to show up, or an event is completely cancelled, the buyer can initiate a dispute through their dashboard. 
            The EventOps resolution team will pause the escrow release, investigate the claim, and if verified, issue a full refund directly to the buyer's M-Pesa account.
          </p>
        </div>

      </div>
    </div>
  );
}