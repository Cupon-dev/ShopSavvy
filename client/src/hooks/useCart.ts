import { useQuery } from "@tanstack/react-query";
import type { CartItem, Product } from "@shared/schema";

export function useCart() {
  return useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });
}
