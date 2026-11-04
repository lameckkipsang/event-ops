import React from 'react';
import { Calendar, Receipt, Clock, CheckCircle, Download, Hash } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReceiptCard({ transaction }) {
  if (!transaction) return null;

  const handleDownloadPDF = async () => {
    const element = document.getElementById(`receipt-card-${transaction.id}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#022c22',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      pdf.save(`EventOps-Receipt-${transaction.mpesa_receipt_number || transaction.id}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <div
      id={`receipt-card-${transaction.id}`}
      style={{
        backgroundColor: '#022c22',
        borderColor: '#065f46',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <span
              style={{
                backgroundColor: '#431407',
                color: '#fb923c',
                borderColor: 'rgba(249, 115, 22, 0.3)',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                padding: '2px 10px',
                borderRadius: '0.25rem',
                borderWidth: '1px',
                borderStyle: 'solid',
                display: 'inline-block'
              }}
            >
              {transaction.booking_title ? 'Marketplace Booking' : 'Event Ticket'}
            </span>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#ffffff', marginTop: '0.5rem' }}>
              {transaction.booking_title || transaction.ticket_title || 'Event Access Pass'}
            </h3>
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 'extrabold', color: '#fb923c' }}>
            KES {transaction.amount ? parseFloat(transaction.amount).toLocaleString() : '0'}
          </span>
        </div>

        <div
          style={{
            fontSize: '0.75rem',
            color: '#6ee7b7',
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            borderTop: '1px solid #064e3b',
            borderBottom: '1px solid #064e3b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hash style={{ width: '1rem', height: '1rem', color: '#34d399' }} />
            <span>Transaction ID: #{transaction.id}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar style={{ width: '1rem', height: '1rem', color: '#34d399' }} />
            <span>Date: {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt style={{ width: '1rem', height: '1rem', color: '#34d399' }} />
            <span>Receipt No: {transaction.mpesa_receipt_number || 'Processing...'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: '1rem', height: '1rem', color: '#34d399' }} />
            <span>
              Status: <strong style={{ color: '#a7f3d0' }}>{transaction.status || 'UNKNOWN'}</strong> (Escrow: {transaction.escrow_status || 'N/A'})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
        <span style={{ fontSize: '11px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle style={{ width: '14px', height: '14px', color: '#34d399' }} /> Verified Purchase
        </span>
        <button
          onClick={handleDownloadPDF}
          style={{
            backgroundColor: '#f97316',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '0.75rem',
            fontSize: '12px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Download style={{ width: '16px', height: '16px' }} /> Download PDF
        </button>
      </div>
    </div>
  );
}