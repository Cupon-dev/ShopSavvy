import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, RefreshCw, Image, Trash2, Search, Home, ArrowLeft, Settings } from "lucide-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UploadedImage {
  id: number;
  productId: number;
  productName: string;
  productBrand: string;
  imageUrl: string;
  usableUrl: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export default function UploadedImagesTable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin
  if (!user || user.id !== "43074406") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>Admin access required to view uploaded images table.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch all uploaded images with details
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['/api/admin/uploaded-images-table'],
    enabled: true
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      const response = await fetch(`/api/product-images/${imageId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/uploaded-images-table'] });
      toast({ title: "Image deleted successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete image", description: error.message, variant: "destructive" });
    }
  });

  // Update product primary URL mutation
  const updatePrimaryUrlMutation = useMutation({
    mutationFn: async ({ productId, imageUrl }: { productId: number; imageUrl: string }) => {
      const response = await fetch(`/api/products/${productId}/update-primary-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      if (!response.ok) throw new Error('Failed to update primary image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/uploaded-images-table'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product primary image updated successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update primary image", description: error.message, variant: "destructive" });
    }
  });

  const copyToClipboard = (url: string, type: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast({ title: `${type} URL copied to clipboard!` });
  };

  const handleSetAsProductPrimary = (image: UploadedImage) => {
    updatePrimaryUrlMutation.mutate({ 
      productId: image.productId, 
      imageUrl: image.usableUrl 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter images based on search term
  const filteredImages = images.filter((image: UploadedImage) =>
    image.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.productBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.altText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading uploaded images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              Uploaded Images
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/images" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
              <Image className="w-4 h-4" />
              <span>Manage Images</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Panel
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Uploaded Images Table</h2>
            <p className="text-gray-600">Manage all uploaded images and get URLs for product primary images</p>
          </div>

          {/* Search and Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Database Images ({images.length} total)
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by product name, brand, or alt text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{images.length}</div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {images.filter((img: UploadedImage) => img.isPrimary).length}
                </div>
                <div className="text-sm text-gray-600">Primary Images</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {images.filter((img: UploadedImage) => img.imageUrl?.startsWith('data:image')).length}
                </div>
                <div className="text-sm text-gray-600">Database Stored</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(images.map((img: UploadedImage) => img.productId)).size}
                </div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No images match your search criteria" : "No images found in database"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Image Details</TableHead>
                      <TableHead>Usable URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImages.map((image: UploadedImage) => (
                      <TableRow key={image.id}>
                        <TableCell>
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
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
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{image.productName || 'Unknown Product'}</div>
                            <div className="text-sm text-gray-500">{image.productBrand || 'Unknown Brand'}</div>
                            <div className="text-xs text-gray-400">ID: {image.productId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {image.altText && (
                              <div className="text-sm font-medium">{image.altText}</div>
                            )}
                            <div className="text-xs text-gray-500">Order: {image.displayOrder}</div>
                            <div className="text-xs text-gray-400">Image ID: {image.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={image.usableUrl} 
                              readOnly 
                              className="font-mono text-xs w-64"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(image.usableUrl, "Image")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={image.isPrimary ? "default" : "secondary"}>
                              {image.isPrimary ? "Primary" : "Secondary"}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {image.imageUrl?.startsWith('data:image') ? 'Database' : 'External URL'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(image.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSetAsProductPrimary(image)}
                              disabled={updatePrimaryUrlMutation.isPending}
                              className="text-xs"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Set Primary
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(window.location.origin + image.usableUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteImageMutation.mutate(image.id)}
                              disabled={deleteImageMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}