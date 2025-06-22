
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { Upload, Package, Check, AlertCircle, Eye, Image as ImageIcon, X, Home, ArrowLeft, Settings } from "lucide-react";
import { Link } from "wouter";
import ProductPreviewCard from "@/components/product-preview-card";
import CategoryDropdown from "@/components/category-dropdown";
import { z } from "zod";

const adminProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  demoLink: z.string().optional(),
  accessLink: z.string().optional(),
  tags: z.string().optional(),
  viewCount: z.number().default(0),
  soldCount: z.number().default(0),
  rating: z.number().default(0),
  reviewCount: z.number().default(0),
  inStock: z.boolean().default(true),
  isHighDemand: z.boolean().default(false),
  hasInstantAccess: z.boolean().default(false),
});

type AdminProductForm = z.infer<typeof adminProductSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<AdminProductForm>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      brand: "",
      demoLink: "",
      accessLink: "",
      tags: "",
      viewCount: 0,
      soldCount: 0,
      rating: 0,
      reviewCount: 0,
      inStock: true,
      isHighDemand: false,
      hasInstantAccess: true,
    },
  });

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: reader.result,
              fileName: file.name
            })
          });

          const result = await response.json();
          if (result.success) {
            setUploadedImages(prev => [...prev, result.imageUrl]);
            toast({ title: "Image uploaded successfully!" });
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (error: any) {
          toast({
            title: "Upload failed",
            description: error.message || "Failed to upload image",
            variant: "destructive"
          });
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      setIsUploadingImage(false);
    }
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => handleImageUpload(file));
    } else {
      toast({
        title: "No valid images",
        description: "Please drop valid image files",
        variant: "destructive"
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const createProductMutation = useMutation({
    mutationFn: async (data: AdminProductForm) => {
      // Use the first uploaded image as the primary image
      const primaryImageUrl = uploadedImages.length > 0 ? uploadedImages[0] : '';
      
      const productData = {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        tags: data.tags ? data.tags.split(",").map(tag => tag.trim()) : [],
        imageUrl: primaryImageUrl, // Set the primary image
        // Ensure boolean fields are properly converted
        inStock: Boolean(data.inStock),
        isHighDemand: Boolean(data.isHighDemand),
        hasInstantAccess: Boolean(data.hasInstantAccess),
        viewCount: Number(data.viewCount) || 0,
        soldCount: Number(data.soldCount) || 0,
        rating: Number(data.rating) || 0,
        reviewCount: Number(data.reviewCount) || 0,
      };
      
      console.log('Product data being sent:', productData);
      
      // Create the product first
      const product = await apiRequest("POST", "/api/admin/products", productData);
      
      // Add all uploaded images to the product
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const productResponse = product as any;
          if (productResponse?.id) {
            await apiRequest("POST", `/api/products/${productResponse.id}/images`, {
              imageUrl: uploadedImages[i],
              altText: `${data.name} - Image ${i + 1}`,
              displayOrder: i,
              isPrimary: i === 0 // First image is primary
            });
          }
        }
      }
      
      return product;
    },
    onSuccess: () => {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      form.reset();
      setUploadedImages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Created",
        description: "Product has been successfully added with images.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminProductForm) => {
    if (uploadedImages.length === 0) {
      toast({
        title: "Image Required",
        description: "Please upload at least one image for the product",
        variant: "destructive",
      });
      return;
    }
    
    // Convert string values to proper types
    const processedData = {
      ...data,
      viewCount: Number(data.viewCount) || 0,
      soldCount: Number(data.soldCount) || 0,
      rating: Number(data.rating) || 0,
      reviewCount: Number(data.reviewCount) || 0,
      inStock: Boolean(data.inStock),
      isHighDemand: Boolean(data.isHighDemand),
      hasInstantAccess: Boolean(data.hasInstantAccess),
    };
    
    createProductMutation.mutate(processedData);
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
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/images" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
              <ImageIcon className="w-4 h-4" />
              <span>Manage Images</span>
            </Link>
            <Link href="/admin/uploaded-images" className="flex items-center gap-2 hover:text-purple-200 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Uploaded Images</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Link>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Product</h2>
            <p className="text-gray-600">Upload images and add product details</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
          {/* Product Form */}
          <Card className="shadow-lg max-w-4xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6" />
                Add New Product
              </CardTitle>
              <CardDescription className="text-purple-100">
                Fill in product details and upload images
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Product Images *</Label>
                  
                  {/* Drop Zone */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag and drop images here or click to browse</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleImageUpload(file));
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? "Uploading..." : "Choose Images"}
                    </Button>
                  </div>

                  {/* Uploaded Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Primary
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter product name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium">Brand *</Label>
                    <Input
                      id="brand"
                      {...form.register("brand")}
                      placeholder="Enter brand name"
                    />
                    {form.formState.errors.brand && (
                      <p className="text-red-500 text-sm">{form.formState.errors.brand.message}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                    <CategoryDropdown 
                      value={form.watch("category") || ""} 
                      onValueChange={(value) => form.setValue("category", value)} 
                    />
                    {form.formState.errors.category && (
                      <p className="text-red-500 text-sm">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register("price")}
                      placeholder="19.99"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  {/* Original Price */}
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice" className="text-sm font-medium">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      {...form.register("originalPrice")}
                      placeholder="29.99"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Enter detailed product description..."
                    rows={4}
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demo Link */}
                  <div className="space-y-2">
                    <Label htmlFor="demoLink" className="text-sm font-medium">Demo Link</Label>
                    <Input
                      id="demoLink"
                      {...form.register("demoLink")}
                      placeholder="https://demo.example.com"
                    />
                  </div>

                  {/* Access Link */}
                  <div className="space-y-2">
                    <Label htmlFor="accessLink" className="text-sm font-medium">Access Link</Label>
                    <Input
                      id="accessLink"
                      {...form.register("accessLink")}
                      placeholder="https://content.example.com"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    {...form.register("tags")}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* Boolean Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      {...form.register("inStock")}
                      className="rounded border border-gray-300"
                      defaultChecked={true}
                    />
                    <Label htmlFor="inStock" className="text-sm font-medium">In Stock</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isHighDemand"
                      {...form.register("isHighDemand")}
                      className="rounded border border-gray-300"
                      defaultChecked={false}
                    />
                    <Label htmlFor="isHighDemand" className="text-sm font-medium">High Demand</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasInstantAccess"
                      {...form.register("hasInstantAccess")}
                      className="rounded border border-gray-300"
                      defaultChecked={true}
                    />
                    <Label htmlFor="hasInstantAccess" className="text-sm font-medium">Instant Access</Label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || uploadedImages.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Creating Product...
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Created Successfully!
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setUploadedImages([]);
                    }}
                    className="px-8"
                  >
                    Clear All
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your product will appear to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.watch('name') && uploadedImages.length > 0 ? (
                  <div className="max-w-sm mx-auto">
                    <ProductPreviewCard
                      product={{
                        id: 0,
                        name: form.watch('name') || 'Product Name',
                        brand: form.watch('brand') || 'Brand',
                        description: form.watch('description') || 'Product description',
                        price: parseFloat(form.watch('price')) || 0,
                        imageUrl: uploadedImages[0] || '',
                        category: form.watch('category') || 'Category',
                        tags: form.watch('tags') ? (form.watch('tags') || '').split(',').map(tag => tag.trim()) : [],
                        rating: parseFloat(form.watch('rating')?.toString() || '0') || 0,
                        reviewCount: 0
                      }}
                      showPreviewLabel={true}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Upload images and fill product name to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Success Message */}
            {uploadSuccess && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Product created successfully with images!</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-blue-700">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Quick Guide:</h3>
                    <ul className="text-sm space-y-1">
                      <li>• Upload images by dragging or clicking</li>
                      <li>• First image becomes the primary image</li>
                      <li>• Fill required fields marked with *</li>
                      <li>• Preview updates in real-time</li>
                      <li>• All images are automatically linked to product</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
