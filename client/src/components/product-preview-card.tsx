import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingCart, Star } from "lucide-react";

interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
}

interface ProductPreviewCardProps {
  product: Product;
  className?: string;
  showPreviewLabel?: boolean;
}

export default function ProductPreviewCard({ 
  product, 
  className = "", 
  showPreviewLabel = false 
}: ProductPreviewCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={`relative ${className}`}>
      {showPreviewLabel && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            Preview
          </Badge>
        </div>
      )}
      
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            
            {!imageError ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm">Image not available</div>
                </div>
              </div>
            )}
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-white/90">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Category Badge */}
            {product.category && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                  {product.category}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="p-4 space-y-2">
            {/* Brand */}
            {product.brand && (
              <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                {product.brand}
              </div>
            )}
            
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
              {product.name}
            </h3>
            
            {/* Description */}
            {product.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  {product.rating} {product.reviewCount && `(${product.reviewCount})`}
                </span>
              </div>
            )}
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0 text-gray-500">
                    +{product.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-lg font-bold text-purple-600">
                  {formatPrice(product.price)}
                </span>
              </div>
              <Button size="sm" className="h-7 text-xs">
                Buy Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}