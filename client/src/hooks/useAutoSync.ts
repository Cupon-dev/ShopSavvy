import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function useAutoSync(isAuthenticated: boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-sync mutation for real-time payment detection
  const autoSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sync-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Auto-sync failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Enhanced sync result:', data);
      if (data.newAccessGranted > 0) {
        toast({
          title: "Payment Sync Complete!",
          description: `${data.newAccessGranted} purchases now available in your library`
        });
      }
      // Always refresh to show updated library state
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    },
    onError: (error: any) => {
      // Silent error handling for background sync to avoid spamming user
      console.error('Auto-sync error:', error);
    }
  });

  // Set up real-time auto-sync
  useEffect(() => {
    if (isAuthenticated) {
      // Initial sync on authentication
      autoSyncMutation.mutate();
      
      // Set up automatic background sync every 30 seconds
      syncIntervalRef.current = setInterval(() => {
        autoSyncMutation.mutate();
      }, 30000);

      // Cleanup interval on unmount or auth change
      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
          syncIntervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated]);

  // Manual sync function for user-triggered sync
  const triggerManualSync = () => {
    autoSyncMutation.mutate();
  };

  return {
    isAutoSyncing: autoSyncMutation.isPending,
    triggerManualSync
  };
}