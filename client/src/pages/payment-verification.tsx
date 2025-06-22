
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";

export default function PaymentVerificationPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    transactionId: "",
    paymentMethod: "upi",
    amount: "",
    paymentScreenshot: "",
    additionalNotes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/verify-payment", formData);
      
      toast({
        title: "Verification Request Submitted",
        description: "Your payment verification request has been submitted. You will receive access within 24 hours after verification.",
      });

      // Reset form
      setFormData({
        productId: "",
        transactionId: "",
        paymentMethod: "upi",
        amount: "",
        paymentScreenshot: "",
        additionalNotes: ""
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to submit payment verification</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Payment Verification
          </CardTitle>
          <p className="text-sm text-gray-600">
            Submit your payment details for manual verification and instant access
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="productId">Product ID</Label>
              <Input
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
                placeholder="Enter the product ID you purchased"
                required
              />
            </div>

            <div>
              <Label htmlFor="transactionId">Transaction ID / UPI Reference Number</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                placeholder="Enter your transaction ID"
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="upi">UPI Payment</option>
                <option value="qr">QR Code Payment</option>
                <option value="razorpay">Razorpay Gateway</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Amount Paid</Label>
              <Input
                id="amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="Enter the amount you paid"
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentScreenshot">Payment Screenshot URL (Optional)</Label>
              <Input
                id="paymentScreenshot"
                value={formData.paymentScreenshot}
                onChange={(e) => setFormData({...formData, paymentScreenshot: e.target.value})}
                placeholder="Upload screenshot to any image hosting service and paste URL"
              />
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                placeholder="Any additional information about your payment"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
              <Upload className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Verification Process</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your payment will be verified manually within 24 hours</li>
              <li>• You will receive instant access once verified</li>
              <li>• For faster verification, include transaction ID and screenshot</li>
              <li>• Contact support if you need immediate assistance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
