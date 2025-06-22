import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Calendar, ExternalLink, Lock, RefreshCw } from "lucide-react";
import { Library, Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useEffect } from "react";

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Library access requires authentication, redirecting to login');
      window.location.href = '/api/login';
      return;
    }
  }, [isAuthenticated]);
  
  // Enable auto-sync for real-time payment detection
  const { isAutoSyncing, triggerManualSync } = useAutoSync(isAuthenticated);

  // Critical payment diagnostics
  const diagnosticsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/diagnose-payments");
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Diagnostics result:', data);
      if (data.newAccessGranted > 0) {
        toast({
          title: "Payment Issues Resolved!",
          description: `${data.newAccessGranted} payment problems fixed - content now available`
        });
      } else if (data.diagnosis?.payments > 0) {
        toast({
          title: "Diagnostics Complete",
          description: `Found ${data.diagnosis.payments} payments, ${data.diagnosis.libraryItems} library items`
        });
      } else {
        toast({
          title: "No Payment Issues Found",
          description: "All payments are properly synchronized"
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Diagnostics Failed",
        description: error.message || "Unable to run payment diagnostics",
        variant: "destructive"
      });
    }
  });

  const { data: libraryItems = [], isLoading, refetch: refetchLibrary, error } = useQuery<(Library & { product: Product })[]>({
    queryKey: ["/api/library"],
    enabled: isAuthenticated,
    retry: 3,
    retryDelay: 2000,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/grant-verified-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync verified purchases');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Library Access Updated",
        description: `Access granted for ${data.accessGranted || 0} verified payments`
      });
      // Force refresh of library data
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      refetchLibrary();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to grant access",
        variant: "destructive"
      });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Your Library</h1>
          <p className="text-gray-600 mb-8">Sign in to access your purchased content</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Library</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gray-100 border-gray-300 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Library</h1>
              <p className="text-gray-600">
                {libraryItems.length} item{libraryItems.length !== 1 ? 's' : ''} in your collection
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAutoSyncing && (
                <div className="flex items-center text-sm text-blue-600">
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Auto-syncing payments...
                </div>
              )}
              <Button 
                onClick={() => diagnosticsMutation.mutate()}
                disabled={diagnosticsMutation.isPending || isAutoSyncing}
                variant="outline"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                {diagnosticsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Diagnosing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Fix Payment Issues
                  </>
                )}
              </Button>
              <Button 
                onClick={() => triggerManualSync()}
                disabled={isAutoSyncing || diagnosticsMutation.isPending}
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Sync Now
              </Button>
            </div>
          </div>
        </div>

        {libraryItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-6">
              Purchase products to add them to your library. Content appears instantly after purchase.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {libraryItems.map((item) => (
              <Card key={item.id} className="bg-white border-gray-200 hover:border-purple-500 transition-colors shadow-sm">
                <div className="relative">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      Owned
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{item.product.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    by {item.product.brand}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Purchased {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'Recently'}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Only show access button if user has purchased this content */}
                  {item.product.accessLink ? (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                      <a href={item.product.accessLink} target="_blank" rel="noopener noreferrer">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Access Content
                      </a>
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed">
                      <Lock className="w-4 h-4 mr-2" />
                      Content Not Available
                    </Button>
                  )}
                  
                  {/* Demo link only if available */}
                  {item.product.demoLink && (
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" asChild>
                      <a href={item.product.demoLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Demo
                      </a>
                    </Button>
                  )}
                  
                  {/* Download option completely removed for security */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}