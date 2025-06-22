import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";
import type { Product } from "@shared/schema";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess: () => void;
}

export default function PaymentVerificationModal({ isOpen, onClose, product, onSuccess }: PaymentVerificationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState({
    transactionId: "",
    paymentMethod: "razorpay",
    amount: product.price,
    paymentScreenshot: "",
    additionalNotes: ""
  });

  const handleSubmit = async () => {
    if (!verificationData.transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your payment transaction ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/verify-payment", {
        productId: product.id,
        transactionId: verificationData.transactionId,
        paymentMethod: verificationData.paymentMethod,
        amount: verificationData.amount,
        paymentScreenshot: verificationData.paymentScreenshot,
        additionalNotes: verificationData.additionalNotes
      }) as { success?: boolean; requestId?: string };

      if (response.success) {
        toast({
          title: "Verification Submitted",
          description: "Your payment verification has been submitted for review",
        });
        onSuccess();
        onClose();
      }

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to submit verification",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Payment Verification for {product.name}
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

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              If you've completed payment via Razorpay link, please provide your transaction details below for verification and instant access.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID / Payment ID *</Label>
              <Input
                id="transactionId"
                value={verificationData.transactionId}
                onChange={(e) => setVerificationData(prev => ({ ...prev, transactionId: e.target.value }))}
                placeholder="Enter your Razorpay transaction ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount Paid</Label>
              <Input
                id="amount"
                value={`₹${verificationData.amount}`}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value="Razorpay"
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
              <Input
                id="screenshot"
                type="url"
                value={verificationData.paymentScreenshot}
                onChange={(e) => setVerificationData(prev => ({ ...prev, paymentScreenshot: e.target.value }))}
                placeholder="Paste screenshot URL or upload to image hosting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={verificationData.additionalNotes}
                onChange={(e) => setVerificationData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any additional information about your payment"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !verificationData.transactionId.trim()}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>Submitting Verification...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Payment Verification
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Your access will be granted within 5-10 minutes after verification
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}