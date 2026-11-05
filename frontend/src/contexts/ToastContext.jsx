import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const addToast = useCallback(({ title, message, type = 'info', link = null }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, link }]);
    
    // Auto-remove after 6 seconds
    setTimeout(() => removeToast(id), 6000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleToastClick = (link, id) => {
    if (link) {
      navigate(link);
    }
    removeToast(id);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-4">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            onClick={() => handleToastClick(toast.link, toast.id)}
            className={`cursor-pointer w-80 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all flex items-start gap-3 hover:scale-105
              ${toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' : ''}
              ${toast.type === 'error' ? 'bg-red-950/95 border-red-500/50 text-red-200' : ''}
              ${toast.type === 'info' ? 'bg-orange-950/95 border-orange-500/50 text-orange-200' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-orange-400 shrink-0 animate-pulse" />}
            
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white">{toast.title}</h4>
              <p className="text-xs mt-0.5 opacity-90">{toast.message}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }} 
              className="opacity-60 hover:opacity-100 hover:bg-white/10 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};