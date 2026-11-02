import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract item details passed via navigation state
  const { item, type } = location.state || {};

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fallback if accessed directly without selecting a service
  if (!item) {
    return (
      <div className="max-w-md mx-auto my-16 text-center text-white">
        <h2 className="text-xl font-bold mb-2">No Item Selected</h2>
        <p className="text-emerald-300 text-sm mb-6">
          Please select a service or event ticket before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      <h2 className="text-2xl font-bold text-center">Payment Checkout Shell</h2>
    </div>
  );
}