import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuthTrigger } from "@/hooks/useAuthTrigger";
import { useAccess } from "@/hooks/useAccess";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Eye, TrendingUp, ShoppingCart, Play, Lock, ExternalLink } from "lucide-react";
import RazorpayPopup from "@/components/razorpay-popup";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerAuthForAction } = useAuthTrigger();
  const { isAuthenticated } = useAuth();
  const { data: accessData, isLoading: accessLoading } = useAccess(product.id);
  const hasAccess = isAuthenticated && !accessLoading && (accessData?.hasAccess === true);
  

  
  // Live numbers state for realistic fluctuations
  const [liveViewCount, setLiveViewCount] = useState(product.viewCount || 0);
  const [liveSoldCount, setLiveSoldCount] = useState(product.soldCount || 0);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  
  // Animate viewing numbers to fluctuate between +/- 10-20 from base
  useEffect(() => {
    const baseViewCount = product.viewCount || 0;
    const viewInterval = setInterval(() => {
      const variation = Math.floor(Math.random() * 41) - 20; // -20 to +20
      setLiveViewCount(Math.max(0, baseViewCount + variation));
    }, 2000 + Math.random() * 3000); // 2-5 seconds
    
    return () => clearInterval(viewInterval);
  }, [product.viewCount]);
  
  // Animate sold numbers to slowly increase by 1-10
  useEffect(() => {
    const baseSoldCount = product.soldCount || 0;
    const soldInterval = setInterval(() => {
      setLiveSoldCount(prev => {
        const increase = Math.floor(Math.random() * 10) + 1; // 1-10
        return prev + increase;
      });
    }, 8000 + Math.random() * 12000); // 8-20 seconds
    
    return () => clearInterval(soldInterval);
  }, [product.soldCount]);

  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/${product.id}`],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (favoriteStatus?.isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${product.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", {
          productId: product.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${product.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: favoriteStatus?.isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: favoriteStatus?.isFavorite 
          ? "Product removed from your favorites."
          : "Product added to your favorites!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Buy Now function - opens payment popup
  const handleBuyNow = () => {
    if (!triggerAuthForAction('make a purchase')) return;
    setIsPaymentPopupOpen(true);
  };

  // Payment success handler
  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/access", product.id] });
    queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    setLiveSoldCount(prev => prev + 1);
  };

  // Demo link handler
  const handleDemo = () => {
    if (product.demoLink) {
      window.open(product.demoLink, '_blank');
    }
  };

  // Access link handler (for purchased content)
  const handleAccess = () => {
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "Please purchase this product to access the content.",
        variant: "destructive",
      });
      return;
    }
    
    if (product.accessLink) {
      window.open(product.accessLink, '_blank');
    }
  };

  const discount = product.originalPrice && product.price 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : null;

  const savings = product.originalPrice && product.price
    ? (parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)
    : null;

  return (
    <Card className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        {discount && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-red-600 text-xs font-medium bg-white/90 px-2 py-1 rounded">
              -{discount}%
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 z-10 bg-white/90 hover:bg-white shadow-sm rounded-full ${
            favoriteStatus?.isFavorite ? "text-red-500" : "text-gray-600 hover:text-red-500"
          }`}
          onClick={() => toggleFavoriteMutation.mutate()}
          disabled={toggleFavoriteMutation.isPending}
        >
          <Heart className={`h-5 w-5 ${favoriteStatus?.isFavorite ? "fill-current" : ""}`} />
        </Button>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => window.location.href = `/product/${product.id}`}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <Eye className="h-3 w-3 mr-1 animate-pulse" />
          <span className="transition-all duration-500">{liveViewCount.toLocaleString()} viewing</span>
        </div>
        <div className="flex items-center text-xs text-blue-600 mb-2">
          <TrendingUp className="h-3 w-3 mr-1 animate-bounce" />
          <span className="transition-all duration-700">{liveSoldCount.toLocaleString()} sold</span>
        </div>
        {product.isHighDemand && (
          <div className="text-xs text-red-500 font-medium mb-1">⚡ High Demand!</div>
        )}

        <h3 className="font-medium text-gray-900 mb-1">{product.brand}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.name}</p>
        <div className="flex items-center mb-2">
          <Star className="h-3 w-3 text-yellow-400 fill-current animate-pulse" />
          <span className="text-sm font-medium ml-1">{product.rating || "0.0"}</span>
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center mb-3">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
              {savings && (
                <span className="text-xs text-primary font-medium ml-2">
                  Save ₹{savings}
                </span>
              )}
            </>
          )}
        </div>
        {product.hasInstantAccess && (
          <div className="text-xs text-primary font-medium mb-3">⚡ Instant Access</div>
        )}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleBuyNow}
            >
              🛒 BUY NOW
            </Button>
            {product.demoLink && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDemo}
                className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                title="View Demo"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {product.accessLink && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleAccess}
                className={`transition-all duration-300 ${hasAccess ? 'bg-green-500 hover:bg-green-600 text-white border-green-500 animate-pulse' : 'border-gray-300 hover:bg-gray-50'}`}
                title={hasAccess ? "Access Granted - Click to View Content" : "Purchase Required for Access"}
              >
                {hasAccess ? (
                  <div className="relative">
                    <Lock className="h-4 w-4 text-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
              </Button>
            )}

          </div>
          <Button 
            variant="outline" 
            className="w-full hover:animate-bounce"
            onClick={() => {
              if (!triggerAuthForAction('add items to cart')) return;
              addToCartMutation.mutate();
            }}
            disabled={addToCartMutation.isPending}
          >
            <ShoppingCart className="h-4 w-4 mr-2 animate-pulse" />
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>

      {/* Payment Popup */}
      <RazorpayPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        product={product}
        onSuccess={handlePaymentSuccess}
      />


    </Card>
  );
}
