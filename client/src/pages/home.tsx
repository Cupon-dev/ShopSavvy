import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthTrigger } from "@/hooks/useAuthTrigger";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import SearchBar from "@/components/search-bar";
import DynamicBannerCarousel from "@/components/dynamic-banner-carousel";
import CategoryFilter from "@/components/category-filter";
import ProductCard from "@/components/product-card";
import FomoTimer from "@/components/fomo-timer";
import FrontPageMedia from "@/components/front-page-media";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all-products");
  
  // Initialize browsing timer for authentication triggers
  useAuthTrigger();
  
  const { data: products, isLoading } = useProducts(
    activeCategory === "all-products" || activeCategory === "all" ? undefined : activeCategory,
    searchQuery
  );
  
  const { data: cartItems } = useCart();

  // Fetch FOMO timers for countdown displays
  const { data: fomoTimers = [] } = useQuery({
    queryKey: ['/api/fomo-timers'],
    enabled: true
  }) as { data: any[] };

  const cartItemCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Login Banner */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Welcome back, <strong>{user?.firstName || user?.email}</strong>! Browse our latest products and enjoy instant access to your purchases.</span>
          </div>
        </div>
      </div>

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Dynamic Banner Carousel with Session-Based Timers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <DynamicBannerCarousel autoRotate={true} rotationInterval={4000} />
      </div>
      
      {/* FOMO Timers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {(fomoTimers as any[]).map((timer: any) => (
          <FomoTimer
            key={timer.id}
            title={timer.title}
            description={timer.description}
            endTime={timer.endTime}
            resetHours={timer.resetAfterHours}
            className="mb-4"
          />
        ))}
      </div>

      {/* Front Page Media Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <FrontPageMedia />
      </div>

      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" data-products-section>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 transition-all duration-500 ease-in-out">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-green-600"
            onClick={() => window.location.href = "/cart"}
          >
            <ShoppingCart className="h-6 w-6" />
            <Badge className="absolute -top-2 -right-2 bg-accent text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
              {cartItemCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* PWA Install Prompt for Mobile FOMO */}
      <PWAInstallPrompt />
    </div>
  );
}
