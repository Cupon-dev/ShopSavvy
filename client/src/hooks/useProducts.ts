import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

export function useProducts(category?: string, search?: string) {
  return useQuery<Product[]>({
    queryKey: ["/api/products", { category, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });
}
