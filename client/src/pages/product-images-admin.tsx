import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Star, Image, Home, ArrowLeft, Settings } from "lucide-react";
import { Link } from "wouter";
import ImageUpload from "@/components/image-upload";
import ProductPreviewCard from "@/components/product-preview-card";

interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
}

export default function ProductImagesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [newImage, setNewImage] = useState({
    imageUrl: "",
    altText: "",
    displayOrder: 0,
    isPrimary: false
  });

  // Check if user is admin
  if (!user || user.id !== "43074406") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>Admin access required to manage product images.</AlertDescription>
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
  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: [`/api/products/${selectedProductId}/images`],
    enabled: !!selectedProductId
  });

  // Add image mutation
  const addImageMutation = useMutation({
    mutationFn: async (imageData: any) => {
      const response = await fetch(`/api/products/${selectedProductId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${selectedProductId}/images`] });
      setNewImage({ imageUrl: "", altText: "", displayOrder: 0, isPrimary: false });
      toast({ title: "Image added successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add image", description: error.message, variant: "destructive" });
    }
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/product-images/${imageId}`, { method: 'DELETE' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${selectedProductId}/images`] });
      toast({ title: "Image deleted successfully!" });
    }
  });

  // Set primary image mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/products/${selectedProductId}/images/${imageId}/set-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${selectedProductId}/images`] });
      toast({ title: "Primary image updated!" });
    }
  });

  const handleAddImage = () => {
    if (!newImage.imageUrl.trim()) {
      toast({ title: "Please upload an image first", variant: "destructive" });
      return;
    }
    addImageMutation.mutate(newImage);
  };

  const handleClearAllImages = async () => {
    if (!selectedProductId) return;
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete ALL images for this product? This action cannot be undone."
    );
    
    if (confirmDelete) {
      try {
        // Get all images for the product
        const currentImages = await fetch(`/api/products/${selectedProductId}/images`).then(res => res.json());
        
        // Delete each image
        for (const image of currentImages) {
          await fetch(`/api/product-images/${image.id}`, { method: 'DELETE' });
        }
        
        queryClient.invalidateQueries({ queryKey: [`/api/products/${selectedProductId}/images`] });
        toast({ title: "All images deleted successfully!" });
      } catch (error) {
        toast({ title: "Failed to delete images", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <span className="text-purple-200">|</span>
            <Link href="/admin" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
            <span className="text-purple-200">|</span>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Image className="w-5 h-5" />
              Image Manager
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/uploaded-images" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
              <Upload className="w-4 h-4" />
              <span>View All Images</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Panel
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Images Manager</h2>
            <p className="text-gray-600">Upload and manage images for your products</p>
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
                <SelectValue placeholder="Choose a product to manage images" />
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

        {selectedProductId && (
          <>
            {/* Add New Image */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Add New Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload Component */}
                <div>
                  <Label>Upload Image</Label>
                  <ImageUpload
                    onImageUploaded={(imageUrl) => setNewImage({ ...newImage, imageUrl })}
                    className="mt-2"
                  />
                </div>
                
                {newImage.imageUrl && (
                  <>
                    <div>
                      <Label htmlFor="altText">Alt Text (Optional)</Label>
                      <Input
                        id="altText"
                        placeholder="Description of the image"
                        value={newImage.altText}
                        onChange={(e) => setNewImage({ ...newImage, altText: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        min="0"
                        value={newImage.displayOrder}
                        onChange={(e) => setNewImage({ ...newImage, displayOrder: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={newImage.isPrimary}
                        onChange={(e) => setNewImage({ ...newImage, isPrimary: e.target.checked })}
                      />
                      <Label htmlFor="isPrimary">Set as primary image</Label>
                    </div>
                    <Button 
                      onClick={handleAddImage}
                      disabled={addImageMutation.isPending}
                      className="w-full"
                    >
                      {addImageMutation.isPending ? "Adding..." : "Add Image to Product"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Existing Images */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Images</CardTitle>
                  {images.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearAllImages}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="text-center py-8">Loading images...</div>
                ) : images.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No images found for this product
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image: ProductImage) => (
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
                            {!image.isPrimary && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPrimaryMutation.mutate(image.id)}
                                disabled={setPrimaryMutation.isPending}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          {image.altText && (
                            <p className="text-sm text-gray-600 truncate">{image.altText}</p>
                          )}
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Generate usable URL for this image
                                const timestamp = new Date(image.createdAt).getTime();
                                const imageUrl = `/api/images/${timestamp}_image.jpg`;
                                navigator.clipboard.writeText(window.location.origin + imageUrl);
                                toast({ title: "Image URL copied to clipboard!" });
                              }}
                              className="flex-1"
                            >
                              Copy URL
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              disabled={deleteImageMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </div>
    </div>
  );
}