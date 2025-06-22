import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Webhook, TestTube, Database, CheckCircle, AlertCircle, Play } from "lucide-react";
import type { Payment, Library, Product } from "@shared/schema";

export default function WebhookTestPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [webhookData, setWebhookData] = useState({
    event: 'payment.captured',
    paymentId: 'pay_test_' + Date.now(),
    orderId: 'order_test_' + Date.now(),
    amount: 12999, // Amount in paise
    currency: 'INR',
    status: 'captured',
    method: 'card',
    contact: '+919876543210',
    email: 'test@example.com',
    userId: user?.id || '43074406',
    productId: 1
  });

  // Simulate Razorpay webhook
  const webhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const webhookPayload = {
        event: data.event,
        payload: {
          payment: {
            entity: {
              id: data.paymentId,
              order_id: data.orderId,
              amount: data.amount,
              currency: data.currency,
              status: data.status,
              method: data.method,
              contact: data.contact,
              email: data.email,
              notes: {
                user_id: data.userId,
                product_id: data.productId.toString()
              }
            }
          }
        }
      };

      const response = await fetch('/api/webhook/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Webhook Test Successful",
        description: "Payment processed and access granted via webhook",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    },
    onError: (error: any) => {
      toast({
        title: "Webhook Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test direct payment endpoint
  const directPaymentMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest("POST", "/api/payment-success", {
        productId,
        amount: "129.99",
        customerDetails: {
          email: "test@example.com",
          phone: "+919876543210",
          name: "Test User"
        },
        paymentMethod: 'test_direct',
        cardDetails: {
          lastFour: "1234",
          expiryMonth: "12",
          expiryYear: "25"
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Direct Payment Test Successful",
        description: "Payment processed directly",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    },
    onError: (error: any) => {
      toast({
        title: "Direct Payment Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch payment history for verification
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: isAuthenticated,
  });

  // Fetch library access for verification
  const { data: library = [] } = useQuery<(Library & { product: Product })[]>({
    queryKey: ["/api/library"],
    enabled: isAuthenticated,
  });

  const handleWebhookTest = () => {
    webhookMutation.mutate(webhookData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setWebhookData(prev => ({ ...prev, [field]: value }));
  };

  const generateRealWebhookPayload = () => {
    const timestamp = Date.now();
    setWebhookData({
      ...webhookData,
      paymentId: `pay_${Math.random().toString(36).substr(2, 9)}`,
      orderId: `order_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.floor(Math.random() * 50000) + 1000 // Random amount between 10-500 rupees
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to test webhook functionality</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Razorpay Webhook Testing</h1>
        <p className="text-gray-600">Test webhook integration and payment flow verification</p>
      </div>

      <Tabs defaultValue="webhook" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhook">Webhook Test</TabsTrigger>
          <TabsTrigger value="direct">Direct Payment</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="webhook">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Simulate Razorpay Webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event">Event Type</Label>
                  <Input
                    id="event"
                    value={webhookData.event}
                    onChange={(e) => handleInputChange('event', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paymentId">Payment ID</Label>
                  <Input
                    id="paymentId"
                    value={webhookData.paymentId}
                    onChange={(e) => handleInputChange('paymentId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={webhookData.orderId}
                    onChange={(e) => handleInputChange('orderId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (in paise)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={webhookData.amount}
                    onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={webhookData.userId}
                    onChange={(e) => handleInputChange('userId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    type="number"
                    value={webhookData.productId}
                    onChange={(e) => handleInputChange('productId', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={webhookData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={webhookData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateRealWebhookPayload}
                  variant="outline"
                >
                  Generate New Payload
                </Button>
                <Button
                  onClick={handleWebhookTest}
                  disabled={webhookMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {webhookMutation.isPending ? "Testing..." : "Test Webhook"}
                </Button>
              </div>

              <div>
                <Label>Generated Webhook Payload Preview:</Label>
                <Textarea
                  value={JSON.stringify({
                    event: webhookData.event,
                    payload: {
                      payment: {
                        entity: {
                          id: webhookData.paymentId,
                          order_id: webhookData.orderId,
                          amount: webhookData.amount,
                          currency: webhookData.currency,
                          status: webhookData.status,
                          method: webhookData.method,
                          contact: webhookData.contact,
                          email: webhookData.email,
                          notes: {
                            user_id: webhookData.userId,
                            product_id: webhookData.productId.toString()
                          }
                        }
                      }
                    }
                  }, null, 2)}
                  rows={10}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direct">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Direct Payment Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test direct payment processing bypassing webhook
              </p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 11, 12, 13].map(productId => (
                  <Button
                    key={productId}
                    onClick={() => directPaymentMutation.mutate(productId)}
                    disabled={directPaymentMutation.isPending}
                    variant="outline"
                  >
                    Test Product {productId}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            {/* Payment Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Payment Records ({payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.slice(0, 10).map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">ID: {payment.paymentId}</p>
                            <p className="text-sm text-gray-600">
                              Product: {payment.productId} • Method: {payment.paymentMethod}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-500">
                                Notes: {typeof payment.notes === 'string' ? payment.notes.slice(0, 100) : 'Has details'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{payment.amount}</p>
                          <Badge variant="default">{payment.status}</Badge>
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
                  Library Access ({library.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {library.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {library.map((item: any) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium">{item.product?.name || `Product ${item.productId}`}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          User: {item.userId} • Product: {item.productId}
                        </p>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}