import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  ExternalLink, 
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import RazorpayPopup from "@/components/razorpay-popup";

const CheckoutForm = ({ totalAmount, cartItems }: { totalAmount: number, cartItems: any[] }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);

    try {
      const data = await apiRequest("POST", "/api/create-payment-link", { 
        amount: totalAmount,
        items: cartItems 
      }) as { paymentLink?: { url: string } };

      // Check if payment link was created successfully
      if (data.paymentLink && data.paymentLink.url) {
        // Open Razorpay payment link in new tab
        window.open(data.paymentLink.url, '_blank');
      } else {
        throw new Error("Payment link creation failed");
      }

      toast({
        title: "Payment Link Created",
        description: "Redirecting to Razorpay for secure payment...",
      });
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
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
        title: "Payment Failed",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Secure Payment with Razorpay</h3>
        <p className="text-sm text-blue-700">
          You'll be redirected to Razorpay's secure payment gateway to complete your purchase.
        </p>
      </div>

      <Button 
        onClick={handleRazorpayPayment}
        className="w-full bg-secondary hover:bg-blue-600 text-white animate-pulse"
        size="lg"
        disabled={isProcessing}
      >
        <CreditCard className="h-5 w-5 mr-2 animate-bounce" />
        {isProcessing ? "Creating Payment Link..." : `Pay ₹${totalAmount.toFixed(2)} with Razorpay`}
        <ExternalLink className="h-4 w-4 ml-2 animate-pulse" />
      </Button>
    </div>
  );
};

export default function Checkout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

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

  const totalAmount = cartItems?.reduce((sum, item) => 
    sum + (parseFloat(item.product.price) * (item.quantity || 1)), 0
  ) || 0;

  const totalItems = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Button onClick={() => window.location.href = "/"}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </div>
    );
  }

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
          Back to Cart
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.brand}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{(parseFloat(item.product.price) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-primary font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm totalAmount={totalAmount} cartItems={cartItems || []} />
                <div className="text-xs text-gray-500 text-center mt-4">
                  ⚡ Instant access to digital products after purchase
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}