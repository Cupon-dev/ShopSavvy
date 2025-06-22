
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";

interface PaymentRecord {
  paymentId: string;
  amount: number;
  productId: number;
  customerDetails?: any;
}

export default function PaymentReconciliation() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentIds, setPaymentIds] = useState("");
  const [bulkPayments, setBulkPayments] = useState("");
  const [reconciliationResults, setReconciliationResults] = useState<any>(null);

  // Fetch current user payments for reference
  const { data: currentPayments } = useQuery({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
  });

  // Fetch current library access
  const { data: currentLibrary } = useQuery({
    queryKey: ["/api/library"],
    enabled: isAuthenticated,
  });

  // Single payment reconciliation
  const reconcileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/reconcile-razorpay-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: (data) => {
      setReconciliationResults(data);
      toast({
        title: "Reconciliation Complete",
        description: `Processed ${data.summary.successful} payments successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    },
    onError: (error: any) => {
      toast({
        title: "Reconciliation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk payment reconciliation
  const bulkReconcileMutation = useMutation({
    mutationFn: async (payments: PaymentRecord[]) => {
      const response = await fetch("/api/bulk-reconcile-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payments }),
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: (data) => {
      setReconciliationResults(data);
      toast({
        title: "Bulk Reconciliation Complete",
        description: `Processed ${data.summary.successful} out of ${data.summary.total} payments`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Reconciliation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSingleReconciliation = () => {
    const ids = paymentIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter at least one payment ID",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, using sample data - in production you'd get this from Razorpay API
    reconcileMutation.mutate({
      paymentIds: ids,
      amount: 89.99, // You'd get this from Razorpay
      productId: 3, // You'd determine this from payment notes
      customerDetails: { name: "Customer", email: "customer@example.com" }
    });
  };

  const handleBulkReconciliation = () => {
    try {
      const payments = JSON.parse(bulkPayments);
      if (!Array.isArray(payments)) {
        throw new Error("Data must be an array");
      }
      bulkReconcileMutation.mutate(payments);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON format",
        variant: "destructive",
      });
    }
  };

  const sampleBulkData = `[
  {
    "paymentId": "pay_sample123456789",
    "amount": 89.99,
    "productId": 3,
    "customerDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210"
    }
  }
]`;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access payment reconciliation</p>
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
        <h1 className="text-3xl font-bold mb-2">Payment Reconciliation</h1>
        <p className="text-gray-600">Reconcile previously paid Razorpay payments with database</p>
      </div>

      {/* Current Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{currentPayments?.length || 0}</p>
            <p className="text-sm text-gray-600">Total payments in database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Library Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{currentLibrary?.length || 0}</p>
            <p className="text-sm text-gray-600">Products with access</p>
          </CardContent>
        </Card>
      </div>

      {/* Single Payment Reconciliation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Single Payment Reconciliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paymentIds">Payment IDs (comma-separated)</Label>
            <Input
              id="paymentIds"
              value={paymentIds}
              onChange={(e) => setPaymentIds(e.target.value)}
              placeholder="pay_xxxxxxxxxxxxx, pay_yyyyyyyyyyyyy"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter Razorpay payment IDs separated by commas
            </p>
          </div>
          
          <Button 
            onClick={handleSingleReconciliation}
            disabled={reconcileMutation.isPending}
            className="w-full"
          >
            {reconcileMutation.isPending ? "Processing..." : "Reconcile Payments"}
          </Button>
        </CardContent>
      </Card>

      {/* Bulk Payment Reconciliation */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Payment Reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bulkPayments">Payment Data (JSON)</Label>
            <Textarea
              id="bulkPayments"
              value={bulkPayments}
              onChange={(e) => setBulkPayments(e.target.value)}
              placeholder={sampleBulkData}
              className="h-40 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter payment data as JSON array with paymentId, amount, productId, and customerDetails
            </p>
          </div>
          
          <Button 
            onClick={handleBulkReconciliation}
            disabled={bulkReconcileMutation.isPending}
            className="w-full"
            variant="outline"
          >
            {bulkReconcileMutation.isPending ? "Processing..." : "Bulk Reconcile"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {reconciliationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Reconciliation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {reconciliationResults.summary?.successful || 0}
                  </p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {reconciliationResults.summary?.skipped || 0}
                  </p>
                  <p className="text-sm text-gray-600">Skipped</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {reconciliationResults.summary?.failed || reconciliationResults.summary?.errors || 0}
                  </p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>

              {/* Detailed Results */}
              {reconciliationResults.results && (
                <div className="space-y-2">
                  <h4 className="font-medium">Detailed Results:</h4>
                  {reconciliationResults.results.map((result: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-mono text-sm">{result.paymentId}</p>
                        {result.productName && (
                          <p className="text-sm text-gray-600">{result.productName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'success' || result.status === 'reconciled_with_access' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : result.status === 'skipped' || result.status === 'already_exists' ? (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm capitalize">{result.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Errors */}
              {reconciliationResults.errors && reconciliationResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors:</h4>
                  {reconciliationResults.errors.map((error: any, index: number) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="font-mono text-sm">{error.paymentId}</p>
                      <p className="text-sm text-red-600">{error.error}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
