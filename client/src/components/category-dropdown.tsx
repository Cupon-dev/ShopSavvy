import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@shared/schema";

interface CategoryDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function CategoryDropdown({ value, onValueChange, placeholder = "Select category" }: CategoryDropdownProps) {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading categories..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.name}>
            {category.icon} {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}