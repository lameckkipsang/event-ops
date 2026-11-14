import React from 'react';
import { Mail, Phone, HelpCircle, FileText, MessageSquare } from 'lucide-react';

export default function HelpSupport() {
  const faqs = [
    {
      question: "How do I buy a ticket?",
      answer: "Navigate to the 'Events' tab, select an event, choose your preferred ticket tier, and click 'Proceed to Checkout'. You will be prompted to enter your M-Pesa phone number to complete the payment."
    },
    {
      question: "How do vendors get paid?",
      answer: "All payments are held in our Escrow system. Once you successfully deliver your service at the event and the organizer confirms, the funds are automatically released to your registered M-Pesa number."
    },
    {
      question: "Can I get a refund if an event is cancelled?",
      answer: "Yes! Because of our Escrow Protection Policy, funds are not released to the organizer until the event happens. If it gets cancelled, attendees are automatically refunded."
    },
    {
      question: "How do I host an event?",
      answer: "You must register an account and select 'Event Organizer' as your role. Once logged in, go to the Events page and click 'Host a New Event' to set up your details and ticket tiers."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">How can we help?</h1>
        <p className="text-emerald-300 text-sm md:text-base max-w-xl mx-auto">
          Find answers to common questions or reach out to our support team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Contact Cards */}
        <div className="bg-emerald-900/40 border border-emerald-800/80 p-6 rounded-3xl text-center hover:bg-emerald-900/60 transition-colors">
          <Mail className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">Email Support</h3>
          <p className="text-emerald-300/70 text-xs mb-3">Get in touch via email</p>
          <a href="mailto:support@eventops.co.ke" className="text-orange-400 font-semibold text-sm hover:underline">
            lameck.cs16@gmail.com
          </a>
        </div>

        <div className="bg-emerald-900/40 border border-emerald-800/80 p-6 rounded-3xl text-center hover:bg-emerald-900/60 transition-colors">
          <Phone className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">Call Us</h3>
          <p className="text-emerald-300/70 text-xs mb-3">Mon-Fri from 8am to 5pm</p>
          <a href="tel:+254700000000" className="text-orange-400 font-semibold text-sm hover:underline">
            +254 725 713 859
          </a>
        </div>

        <div className="bg-emerald-900/40 border border-emerald-800/80 p-6 rounded-3xl text-center hover:bg-emerald-900/60 transition-colors">
          <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">Live Chat</h3>
          <p className="text-emerald-300/70 text-xs mb-3">Chat with our resolution team</p>
          <button className="text-emerald-950 bg-emerald-400 hover:bg-emerald-300 px-4 py-1.5 rounded-lg font-bold text-sm transition-colors">
            Start Chat
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-orange-500" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-emerald-950/60 border border-emerald-800/60 p-5 rounded-2xl">
              <h4 className="text-emerald-100 font-bold mb-2 text-sm flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                {faq.question}
              </h4>
              <p className="text-emerald-300/80 text-xs leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}