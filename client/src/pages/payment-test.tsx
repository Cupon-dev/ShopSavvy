import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import RazorpayPopup from "@/components/razorpay-popup";
import { CheckCircle, AlertCircle, CreditCard, Database, User } from "lucide-react";
import type { Product, Payment, Library } from "@shared/schema";

export default function PaymentTestPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

  // Fetch test products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  // Fetch user's payment history
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
  });

  // Fetch user's library access
  const { data: library = [] } = useQuery<(Library & { product: Product })[]>({
    queryKey: ["/api/library"],
    enabled: isAuthenticated,
  });

  // Simplified payment test - one call does everything
  const testPaymentMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("POST", "/api/complete-purchase", { 
        productId,
        paymentId: `test_${Date.now()}`,
        amount: "89.99"
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.alreadyOwned ? "Already Owned" : "Purchase Successful",
        description: data.message,
      });
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestPayment = (product: Product) => {
    setSelectedProduct(product);
    setIsPaymentPopupOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (selectedProduct) {
      try {
        // Single call to complete the entire purchase
        const result = await apiRequest("POST", "/api/complete-purchase", {
          productId: selectedProduct.id,
          paymentId: `razorpay_${Date.now()}`,
          amount: selectedProduct.price
        });
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/library"] });
        
        toast({
          title: "Purchase Complete",
          description: result.message,
        });
      } catch (error: any) {
        toast({
          title: "Purchase Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    setIsPaymentPopupOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to test payment functionality</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment System Test</h1>
        <p className="text-gray-600">Comprehensive testing of payment flow and access control</p>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="font-mono">{user?.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p>{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge variant="default">Authenticated</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Payment History ({payments.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Payment ID: {payment.paymentId}</p>
                      <p className="text-sm text-gray-600">Product ID: {payment.productId} • Method: {payment.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${payment.amount}</p>
                    <p className="text-xs text-gray-500">{payment.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No payment records found</p>
          )}
        </CardContent>
      </Card>

      {/* Library Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Library Access ({library.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {library.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {library.map((item: any) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{item.product?.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">Price: {item.product?.price}</p>
                  <Badge variant="default" className="text-xs">
                    Access Granted
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No library access found</p>
          )}
        </CardContent>
      </Card>

      {/* Test Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Test Payment Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h4 className="font-medium mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">by {product.brand}</p>
                <p className="text-lg font-bold text-green-600 mb-3">{product.price}</p>
                <Button
                  onClick={() => handleTestPayment(product)}
                  className="w-full"
                  size="sm"
                >
                  Test Purchase
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Direct Access Test */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Payment Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Test direct payment processing without popup (for debugging)
          </p>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => testPaymentMutation.mutate(3)}
              disabled={testPaymentMutation.isPending}
              variant="outline"
            >
              {testPaymentMutation.isPending ? "Processing..." : "Test Product ID 3"}
            </Button>
            <Button
              onClick={() => testPaymentMutation.mutate(1)}
              disabled={testPaymentMutation.isPending}
              variant="outline"
            >
              {testPaymentMutation.isPending ? "Processing..." : "Test Product ID 1"}
            </Button>
          </div>
          <Button
            onClick={async () => {
              try {
                await fetch('/api/grant-verified-access', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                queryClient.invalidateQueries({ queryKey: ["/api/library"] });
                queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
                toast({
                  title: "Library Synced",
                  description: "Library access updated with verified payments",
                });
              } catch (error) {
                toast({
                  title: "Sync Failed",
                  description: "Failed to sync library access",
                  variant: "destructive",
                });
              }
            }}
            variant="secondary"
            className="w-full"
          >
            Force Sync Library Access
          </Button>
        </CardContent>
      </Card>

      {/* Payment Popup */}
      {selectedProduct && (
        <RazorpayPopup
          isOpen={isPaymentPopupOpen}
          onClose={() => setIsPaymentPopupOpen(false)}
          product={selectedProduct}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}