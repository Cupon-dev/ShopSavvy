import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Copy, Image, ExternalLink, RefreshCw } from "lucide-react";

interface Product {
  id: number;
  name: string;
  brand: string;
  imageUrl: string;
}

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export default function ImageUrlManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Check if user is admin
  if (!user || user.id !== "43074406") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>Admin access required to manage image URLs.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch all products
  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
    enabled: true
  });

  // Fetch images for selected product
  const { data: images = [] } = useQuery({
    queryKey: [`/api/products/${selectedProductId}/images`],
    enabled: !!selectedProductId
  });

  // Get primary image URL
  const { data: primaryImageData } = useQuery({
    queryKey: [`/api/products/${selectedProductId}/primary-image`],
    enabled: !!selectedProductId
  });

  // Update product primary URL mutation
  const updatePrimaryUrlMutation = useMutation({
    mutationFn: async ({ productId, imageUrl }: { productId: number; imageUrl: string }) => {
      const response = await fetch(`/api/products/${productId}/update-primary-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product primary image updated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update primary image", description: error.message, variant: "destructive" });
    }
  });

  const copyToClipboard = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: `${type} URL copied to clipboard!` });
  };

  const generateImageUrl = (image: ProductImage) => {
    if (image.imageUrl.startsWith('data:image')) {
      const timestamp = new Date(image.createdAt).getTime();
      return `${window.location.origin}/api/images/${timestamp}_image.jpg`;
    }
    return image.imageUrl;
  };

  const handleSetAsProductPrimary = (image: ProductImage) => {
    if (!selectedProductId) return;
    
    const imageUrl = generateImageUrl(image);
    updatePrimaryUrlMutation.mutate({ 
      productId: selectedProductId, 
      imageUrl 
    });
  };

  const selectedProduct = products.find((p: Product) => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image URL Manager</h1>
          <p className="text-gray-600">Get URLs from database images to use as product primary images</p>
        </div>

        {/* Product Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Select Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setSelectedProductId(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a product to manage image URLs" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product: Product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - {product.brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedProduct && (
          <>
            {/* Current Product Image */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Current Product Primary Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23f3f4f6'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'>No Image</text></svg>";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <Label className="text-sm font-medium">Current URL:</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          value={selectedProduct.imageUrl} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedProduct.imageUrl, "Current")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Images */}
            <Card>
              <CardHeader>
                <CardTitle>Database Images - Get URLs for Product Primary Image</CardTitle>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No images found in database for this product
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image: ProductImage) => {
                      const imageUrl = generateImageUrl(image);
                      return (
                        <div key={image.id} className="border rounded-lg p-4 space-y-3">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image.imageUrl}
                              alt={image.altText || "Product image"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23f3f4f6'/><text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' fill='%236b7280'>No Image</text></svg>";
                              }}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant={image.isPrimary ? "default" : "secondary"}>
                                {image.isPrimary ? "Primary" : `Order: ${image.displayOrder}`}
                              </Badge>
                            </div>
                            
                            {image.altText && (
                              <p className="text-sm text-gray-600 truncate">{image.altText}</p>
                            )}
                            
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Usable URL:</Label>
                              <div className="flex gap-1">
                                <Input 
                                  value={imageUrl} 
                                  readOnly 
                                  className="font-mono text-xs"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(imageUrl, "Image")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSetAsProductPrimary(image)}
                                disabled={updatePrimaryUrlMutation.isPending}
                                className="flex-1"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Set as Product Primary
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(imageUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}