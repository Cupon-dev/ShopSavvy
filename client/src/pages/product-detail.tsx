import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Eye, TrendingUp, ShoppingCart, ArrowLeft } from "lucide-react";
import type { Product } from "@shared/schema";
import PaymentLinkPopup from "@/components/payment-link-popup";
import PaymentVerificationModal from "@/components/payment-verification-modal";

export default function ProductDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id && isAuthenticated,
  });

  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/${id}`],
    enabled: !!id && isAuthenticated,
  });

  const { data: accessStatus } = useQuery<{ hasAccess: boolean }>({
    queryKey: [`/api/access/${id}`],
    enabled: !!id && isAuthenticated,
  });

  const accessMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", `/api/access/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/access/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: parseInt(id!),
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
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", {
          productId: parseInt(id!),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}`] });
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
              <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice && product.price 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : null;

  const savings = product.originalPrice && product.price
    ? (parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)
    : null;

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('Payment success data received:', paymentData);

      toast({
        title: "Payment Successful!",
        description: `Access has been granted to ${product.name}`,
      });

      // Refresh access status and other queries
      queryClient.invalidateQueries({ queryKey: [`/api/access/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });

      // Small delay to ensure backend processing is complete
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Payment success handling error:', error);
      toast({
        title: "Success! Please refresh the page",
        description: "Your payment was successful. Please refresh to see your access.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              <div className="relative">
                {discount && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-red-600 text-sm font-medium bg-white/90 px-3 py-1 rounded">
                      -{discount}%
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-4 right-4 z-10 bg-white/90 hover:bg-white shadow-sm rounded-full ${
                    favoriteStatus?.isFavorite ? "text-red-500" : "text-gray-600 hover:text-red-500"
                  }`}
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <Heart className={`h-6 w-6 ${favoriteStatus?.isFavorite ? "fill-current" : ""}`} />
                </Button>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Eye className="h-4 w-4 mr-1" />
                <span>{product.viewCount?.toLocaleString() || 0} viewing</span>
              </div>
              <div className="flex items-center text-sm text-blue-600 mb-3">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{product.soldCount?.toLocaleString() || 0} sold</span>
              </div>
              {product.isHighDemand && (
                <div className="text-sm text-red-500 font-medium mb-3">⚡ High Demand!</div>
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{product.brand}</p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium ml-2">{product.rating || "0.0"}</span>
                  <span className="text-gray-500 ml-2">({product.reviewCount || 0} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through ml-4">₹{product.originalPrice}</span>
                    {savings && (
                      <span className="text-lg text-primary font-medium ml-4">
                        Save ₹{savings}
                      </span>
                    )}
                  </>
                )}
              </div>

              {product.hasInstantAccess && (
                <div className="text-primary font-medium mb-6 flex items-center">
                  <span className="text-2xl mr-2">⚡</span>
                  Instant Access
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  size="lg"
                  className="w-full bg-secondary hover:bg-blue-600 text-white text-lg py-3"
                  onClick={() => setIsPaymentPopupOpen(true)}
                >
                  🛒 BUY NOW
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full text-lg py-3"
                  onClick={() => setIsVerificationModalOpen(true)}
                >
                  ✅ Already Paid? Verify Payment
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full text-lg py-3"
                  onClick={() => addToCartMutation.mutate()}
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Link Popup */}
      <PaymentLinkPopup
        isOpen={isPaymentPopupOpen}
        onClose={() => setIsPaymentPopupOpen(false)}
        product={product}
        onSuccess={handlePaymentSuccess}
      />

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        product={product}
        onSuccess={() => {
          setIsVerificationModalOpen(false);
          toast({
            title: "Verification Submitted",
            description: "Your payment will be verified shortly"
          });
        }}
      />
    </div>
  );
}