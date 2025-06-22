import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import type { Product } from "@shared/schema";

interface RazorpayPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: (paymentData: any) => void;
}

export default function RazorpayPopup({ isOpen, onClose, product, onSuccess }: RazorpayPopupProps) {
  const { toast } = useToast();
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success' | 'error'>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validateDetails = () => {
    if (!customerDetails.name.trim()) {
      setErrorMessage("Please enter your name");
      return false;
    }
    if (!customerDetails.email.trim() || !customerDetails.email.includes('@')) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    if (!customerDetails.phone.trim() || customerDetails.phone.length < 10) {
      setErrorMessage("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    if (!validateDetails()) return;

    setIsProcessing(true);
    setPaymentStep('processing');
    setErrorMessage("");

    try {
      // Create secure payment session with webhook verification
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          customerDetails: customerDetails
        })
      });

      const paymentResponse = await response.json();

      console.log('Payment response:', paymentResponse);

      if (!response.ok || !paymentResponse.success) {
        throw new Error(paymentResponse.message || "Failed to create payment session");
      }

      if (!paymentResponse.paymentUrl) {
        throw new Error("No payment URL received from server");
      }

      console.log('Opening payment URL:', paymentResponse.paymentUrl);

      // Use direct redirect for reliable payment processing
      console.log('Redirecting to payment URL for secure processing');
      window.location.href = paymentResponse.paymentUrl;
      
      setPaymentStep('success');
      toast({
        title: "Secure Payment Created",
        description: "Complete your payment in the new tab. Access will be granted only after verified payment.",
      });

      // Close popup after delay
      setTimeout(() => {
        onClose();
        setPaymentStep('details');
      }, 3000);

    } catch (error: any) {
      console.error('Payment session error:', error);
      setPaymentStep('error');
      setErrorMessage(error.message || "Failed to create payment session");
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to create payment session",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
    setErrorMessage("");
  };

  const resetForm = () => {
    setPaymentStep('details');
    setErrorMessage("");
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment for {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  ₹{product.price}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Steps */}
          {paymentStep === 'details' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              <Button 
                onClick={handleRazorpayPayment}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Pay ₹{product.price} with Razorpay
                  </>
                )}
              </Button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-medium">Creating Payment Link...</h3>
              <p className="text-gray-600">Please wait while we prepare your payment</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-700">Payment Link Created!</h3>
              <p className="text-gray-600 mb-4">
                Complete your payment in the new tab and return here
              </p>
              <Button onClick={() => { onClose(); resetForm(); }} variant="outline">
                Close
              </Button>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-700">Payment Link Failed</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <div className="space-y-2">
                <Button onClick={resetForm} className="w-full">
                  Try Again
                </Button>
                <Button onClick={() => { onClose(); resetForm(); }} variant="outline" className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}