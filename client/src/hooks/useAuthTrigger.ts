import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useAuthTrigger() {
  const { isAuthenticated } = useAuth();
  const browsingTimeRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Only set up timer for unauthenticated users who haven't been prompted yet
    if (!isAuthenticated && !hasTriggeredRef.current) {
      // Set 2-minute timer for browsing trigger
      browsingTimeRef.current = setTimeout(() => {
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          redirectToAuth('You\'ve been browsing for a while! Sign in to access exclusive deals and faster checkout.');
        }
      }, 2 * 60 * 1000); // 2 minutes
    }

    return () => {
      if (browsingTimeRef.current) {
        clearTimeout(browsingTimeRef.current);
      }
    };
  }, [isAuthenticated]);

  const redirectToAuth = (message: string) => {
    // Store the message for display on auth page
    sessionStorage.setItem('authPromptMessage', message);
    window.location.href = '/api/login';
  };

  const triggerAuthForAction = (action: string) => {
    if (!isAuthenticated && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      redirectToAuth(`Please sign in to ${action}. Join thousands of satisfied customers!`);
      return false;
    }
    return true;
  };

  return { triggerAuthForAction };
}