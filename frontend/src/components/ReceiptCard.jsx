import React from 'react';
import { Calendar, Receipt, Clock, CheckCircle, Download } from 'lucide-react';

export default function ReceiptCard({ tx }) {
  const handlePrint = () => {
    const element = document.getElementById(`receipt-card-${tx.id}`);
    if (element) {
      element.classList.add('is-printing');
    }
    window.print();
    if (element) {
      element.classList.remove('is-printing');
    }
  };

  return (
    <div
      id={`receipt-card-${tx.id}`}
      className="receipt-card bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-6 shadow-xl relative flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950 px-2.5 py-0.5 rounded border border-orange-500/30">
              {tx.mpesa_receipt_number ? 'Paid Ticket' : 'Pending Payment'}
            </span>
            <h3 className="text-lg font-bold text-white mt-2">
              {tx.booking_details?.package_name || tx.booking_details?.event_title || 'Event Ticket'}
            </h3>
          </div>
          <span className="text-lg font-extrabold text-orange-400">
            KES {parseFloat(tx.amount).toLocaleString()}
          </span>
        </div>

        <div className="text-xs text-emerald-300/70 space-y-1.5 py-3 border-y border-emerald-900">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Date: {new Date(tx.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Receipt No: {tx.mpesa_receipt_number || 'Processing...'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>
              Status: <strong className="text-emerald-200">{tx.status}</strong> (Escrow: {tx.escrow_status})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-emerald-400/80 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified Purchase
        </span>
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors no-print"
        >
          <Download className="w-3.5 h-3.5" /> Print Receipt
        </button>
      </div>
    </div>
  );
}