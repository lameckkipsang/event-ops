import { useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export default function GlobalNotificationListener() {
  const { addToast } = useToast();
  
  useEffect(() => {
    const checkNotifications = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return; 

      try {
        const res = await api.get('accounts/notifications/');
        const newNotifs = res.data;
        
        if (newNotifs.length > 0) {
          const idsToMark = [];
          newNotifs.forEach(notif => {
            addToast({
              title: notif.title,
              message: notif.message,
              type: 'info',
              link: notif.link
            });
            idsToMark.push(notif.id);
          });
          
          if (idsToMark.length > 0) {
            await api.patch('accounts/notifications/', { ids: idsToMark });
          }
        }
      } catch (err) {
        console.error("Silent notification check failed", err);
      }
    };

    // Run the check every 10 seconds unconditionally
    const interval = setInterval(checkNotifications, 10000);
    
    // Also run it once immediately on mount
    checkNotifications(); 

    return () => clearInterval(interval);
  }, [addToast]);

  return null;
}