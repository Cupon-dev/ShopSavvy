import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useAccess(productId: number) {
  const { isAuthenticated } = useAuth();

  return useQuery<{ hasAccess: boolean }>({
    queryKey: ['/api/access', productId],
    enabled: isAuthenticated && !!productId,
    retry: false,
  });
}