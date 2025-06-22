import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Category } from "@shared/schema";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: dbCategories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const categories = [
    { id: "all-products", name: "🛍️ All Products" },
    ...dbCategories.map(cat => ({ 
      id: cat.name, 
      name: `${cat.icon} ${cat.name}` 
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-2 md:gap-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            className={`rounded-full text-xs sm:text-sm px-3 py-2 min-h-[36px] flex-1 lg:flex-initial transition-all duration-200 ${
              activeCategory === category.id
                ? "bg-primary text-white shadow-md scale-105"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105"
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="truncate">{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
