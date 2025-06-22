
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface PaymentVerificationButtonProps {
  productId: number;
  productName: string;
  onSuccess: () => void;
}

export default function PaymentVerificationButton({ 
  productId, 
  productName, 
  onSuccess 
}: PaymentVerificationButtonProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [verificationData, setVerificationData] = useState({
    transactionId: "",
    amount: "",
    paymentMethod: "razorpay"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationData.transactionId.trim()) {
      toast({
        title: "Missing Transaction ID",
        description: "Please enter your transaction ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/verify-payment", {
        productId,
        transactionId: verificationData.transactionId,
        paymentMethod: verificationData.paymentMethod,
        amount: verificationData.amount,
        additionalNotes: `Manual verification for ${productName}`
      });
      
      toast({
        title: "Verification Submitted",
        description: "Your payment verification has been submitted. You should receive access within 24 hours.",
      });

      setShowForm(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-900">Payment Issues?</h4>
              <p className="text-sm text-orange-700">
                If your payment was successful but access wasn't granted, submit for manual verification
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Submit Payment for Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Payment Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="transactionId" className="text-xs">Transaction ID / Payment ID</Label>
            <Input
              id="transactionId"
              value={verificationData.transactionId}
              onChange={(e) => setVerificationData({
                ...verificationData, 
                transactionId: e.target.value
              })}
              placeholder="Enter your transaction ID"
              className="h-8"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="amount" className="text-xs">Amount Paid (Optional)</Label>
            <Input
              id="amount"
              value={verificationData.amount}
              onChange={(e) => setVerificationData({
                ...verificationData, 
                amount: e.target.value
              })}
              placeholder="Enter amount paid"
              className="h-8"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-8 text-xs"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowForm(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>

        <p className="text-xs text-orange-600 mt-2">
          Manual verification typically takes 2-24 hours. You'll receive access once verified.
        </p>
      </CardContent>
    </Card>
  );
}
