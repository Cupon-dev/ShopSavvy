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

interface PaymentLinkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: (paymentData: any) => void;
}

export default function PaymentLinkPopup({ isOpen, onClose, product, onSuccess }: PaymentLinkPopupProps) {
  const { toast } = useToast();
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
    setErrorMessage("");
    return true;
  };

  const handleCreatePaymentLink = async () => {
    if (!validateDetails()) return;

    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/create-payment-link", {
        amount: product.price,
        productId: product.id,
        customerDetails
      }) as { paymentLink?: string };

      const paymentLinkUrl = response.paymentLink;
      
      if (!paymentLinkUrl) {
        throw new Error("Failed to create payment link");
      }

      window.open(paymentLinkUrl, '_blank');
      
      toast({
        title: "Payment Link Opened",
        description: "Complete your payment in the new tab",
      });

      onClose();

    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create payment link");
      toast({
        title: "Payment Link Failed",
        description: error.message || "Failed to create payment link",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
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
              onClick={handleCreatePaymentLink}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>Creating Payment Link...</>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Pay ₹{product.price} with Razorpay
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}