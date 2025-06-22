import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Truck, MapPin, Calendar, ExternalLink } from "lucide-react";

interface TrackingEvent {
  id: number;
  status: string;
  location: string;
  description: string;
  eventTime: string;
  estimatedDelivery?: string;
}

interface OrderWithTracking {
  id: number;
  totalAmount: string;
  status: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingUrl?: string;
  createdAt: string;
  tracking?: TrackingEvent[];
}

export default function OrderTracking() {
  const [, navigate] = useLocation();
  const [trackingInput, setTrackingInput] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: orderTracking, isLoading, error } = useQuery<OrderWithTracking>({
    queryKey: ['/api/orders', currentOrderId, 'tracking'],
    enabled: !!currentOrderId,
  });

  const handleTrackOrder = () => {
    if (!trackingInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter an order ID or tracking number",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll use the input as order ID
    const orderId = parseInt(trackingInput);
    if (isNaN(orderId)) {
      toast({
        title: "Invalid Order ID",
        description: "Please enter a valid order ID",
        variant: "destructive",
      });
      return;
    }

    setCurrentOrderId(orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Order Tracking</h1>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Track Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter Order ID or Tracking Number"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTrackOrder} disabled={isLoading}>
                {isLoading ? "Tracking..." : "Track Order"}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Enter your order ID to view real-time tracking information
            </p>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-2">Order Not Found</h3>
                <p className="text-sm">
                  Please check your order ID and try again, or contact support if you need assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {orderTracking && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order #{orderTracking.id}</span>
                  <Badge className={getStatusColor(orderTracking.status)}>
                    {formatStatus(orderTracking.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Total</p>
                    <p className="font-semibold">${orderTracking.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold">{formatDate(orderTracking.createdAt)}</p>
                  </div>
                  {orderTracking.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold font-mono">{orderTracking.trackingNumber}</p>
                    </div>
                  )}
                  {orderTracking.shippingCarrier && (
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-semibold capitalize">{orderTracking.shippingCarrier}</p>
                    </div>
                  )}
                </div>

                {orderTracking.estimatedDelivery && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Estimated Delivery: {formatDate(orderTracking.estimatedDelivery)}
                      </span>
                    </div>
                  </div>
                )}

                {orderTracking.trackingUrl && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <a
                        href={orderTracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Track on Carrier Website
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderTracking.tracking && orderTracking.tracking.length > 0 ? (
                  <div className="space-y-4">
                    {orderTracking.tracking.map((event, index) => (
                      <div key={event.id} className="relative">
                        {index < orderTracking.tracking!.length - 1 && (
                          <div className="absolute left-4 top-8 h-8 w-0.5 bg-gray-200" />
                        )}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{event.description}</p>
                              <Badge className={getStatusColor(event.status)}>
                                {formatStatus(event.status)}
                              </Badge>
                            </div>
                            {event.location && (
                              <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(event.eventTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Tracking Events Yet</h3>
                    <p className="text-sm text-gray-600">
                      Tracking information will appear here once your order ships.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Demo Section */}
        {!currentOrderId && (
          <Card>
            <CardHeader>
              <CardTitle>Demo Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Try tracking with these demo order IDs to see the system in action:
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrackingInput("1")}
                >
                  Order #1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrackingInput("2")}
                >
                  Order #2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrackingInput("3")}
                >
                  Order #3
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}