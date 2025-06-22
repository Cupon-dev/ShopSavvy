
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, CreditCard, Package, User, Database } from "lucide-react";

export default function SystemTest() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState({});

  // Fetch payment verification data
  const { data: paymentVerification, isLoading: verificationLoading, refetch: refetchVerification } = useQuery({
    queryKey: ["/api/payment-verification"],
    enabled: isAuthenticated,
  });

  // Fetch current user's library
  const { data: library = [], refetch: refetchLibrary } = useQuery({
    queryKey: ["/api/library"],
    enabled: isAuthenticated,
  });

  // Fetch payment history
  const { data: payments = [], refetch: refetchPayments } = useQuery({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
  });

  // Test payment for a specific product
  const testPaymentMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("POST", "/api/test-payment", {
        productId,
        amount: "99.99"
      });
    },
    onSuccess: () => {
      toast({
        title: "Test Payment Successful",
        description: "Payment processed and access granted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Test Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Run comprehensive system test
  const runSystemTest = async () => {
    const results = {};
    
    try {
      // Test 1: Auth verification
      results.auth = user ? { status: "pass", message: "User authenticated" } : { status: "fail", message: "User not authenticated" };
      
      // Test 2: API connectivity
      try {
        await apiRequest("GET", "/api/auth/user");
        results.api = { status: "pass", message: "API connection successful" };
      } catch (error) {
        results.api = { status: "fail", message: "API connection failed" };
      }
      
      // Test 3: Database connectivity
      try {
        const dbTest = await apiRequest("GET", "/api/payment-verification");
        results.database = { status: "pass", message: "Database connection successful" };
      } catch (error) {
        results.database = { status: "fail", message: "Database connection failed" };
      }
      
      // Test 4: Payment system
      if (payments && payments.length > 0) {
        results.payments = { status: "pass", message: `Found ${payments.length} payments` };
      } else {
        results.payments = { status: "warning", message: "No payments found" };
      }
      
      // Test 5: Library access
      if (library && library.length > 0) {
        results.library = { status: "pass", message: `Found ${library.length} library items` };
      } else {
        results.library = { status: "warning", message: "No library access found" };
      }
      
      setTestResults(results);
      
    } catch (error) {
      toast({
        title: "System Test Failed",
        description: "Error running system tests",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated && !verificationLoading) {
      runSystemTest();
    }
  }, [isAuthenticated, verificationLoading, payments, library]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to access the system testing dashboard</p>
              <Button onClick={() => window.location.href = '/api/login'}>
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "fail": return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">System Testing Dashboard</h1>
          <p className="text-gray-600">Comprehensive testing and verification of payment processing</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Status
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={runSystemTest}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Tests
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(testResults).map(([test, result]: [string, any]) => (
                    <div key={test} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium capitalize">{test} System</p>
                          <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                      </div>
                      <Badge variant={result.status === "pass" ? "default" : result.status === "fail" ? "destructive" : "secondary"}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            {paymentVerification && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{paymentVerification.totalPayments}</p>
                      <p className="text-sm text-gray-600">Total Payments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">₹{paymentVerification.totalAmount?.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Total Amount</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{paymentVerification.libraryAccess}</p>
                      <p className="text-sm text-gray-600">Library Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{paymentVerification.productsWithAccess?.length}</p>
                      <p className="text-sm text-gray-600">Products Access</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchPayments()}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Payment #{payment.id}</p>
                            <p className="text-sm text-gray-600">Product ID: {payment.productId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{payment.amount}</p>
                            <Badge variant="default">{payment.status}</Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>Payment ID: {payment.paymentId}</p>
                          <p>Method: {payment.paymentMethod}</p>
                          <p>Date: {new Date(payment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No payments found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Library Access
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchLibrary()}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {library.length > 0 ? (
                  <div className="space-y-4">
                    {library.map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.product?.name || `Product ${item.productId}`}</p>
                            <p className="text-sm text-gray-600">Product ID: {item.productId}</p>
                            <p className="text-sm text-gray-600">
                              Purchased: {new Date(item.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={item.accessGranted ? "default" : "destructive"}>
                            {item.accessGranted ? "Access Granted" : "No Access"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No library items found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => testPaymentMutation.mutate(1)}
                    disabled={testPaymentMutation.isPending}
                  >
                    Test Payment - Product 1
                  </Button>
                  <Button 
                    onClick={() => testPaymentMutation.mutate(2)}
                    disabled={testPaymentMutation.isPending}
                  >
                    Test Payment - Product 2
                  </Button>
                  <Button 
                    onClick={() => testPaymentMutation.mutate(3)}
                    disabled={testPaymentMutation.isPending}
                  >
                    Test Payment - Product 3
                  </Button>
                  <Button 
                    onClick={() => refetchVerification()}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh All Data
                  </Button>
                </div>
                
                {paymentVerification && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Product Access Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {paymentVerification.allProducts?.map((product: any) => (
                        <div key={product.productId} className="flex items-center justify-between p-3 border rounded">
                          <span>Product {product.productId}</span>
                          <div className="flex items-center gap-2">
                            {product.hasAccess ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {product.hasAccess ? "Access Granted" : "No Access"}
                            </span>
                            {product.totalPaid > 0 && (
                              <Badge variant="outline">₹{product.totalPaid}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
