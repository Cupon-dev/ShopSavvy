
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Eye, TrendingUp, Clock, Flame, User } from "lucide-react";

export default function Landing() {
  const { isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  // Get top 4 highest offer products for banner cycling
  const topOfferProducts = [
    {
      id: 1,
      name: "Pink Bra",
      brand: "PINK",
      price: "₹1",
      originalPrice: "₹100",
      rating: 4.9,
      reviews: 789,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: 3,
      name: "Vintage Leather Handbag",
      brand: "Heritage Craft", 
      price: "₹89.99",
      originalPrice: "₹129.99",
      rating: 4.8,
      reviews: 456,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: 4,
      name: "Wireless Bluetooth Headphones",
      brand: "SoundWave",
      price: "₹79.99", 
      originalPrice: "₹119.99",
      rating: 4.6,
      reviews: 892,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: 5,
      name: "Smart Fitness Watch",
      brand: "TechFit",
      price: "₹199.99",
      originalPrice: "₹299.99", 
      rating: 4.7,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    }
  ];

  // Auto-cycle through products every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % topOfferProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const mockProducts = [
    {
      id: 1,
      name: "Pink Bra",
      brand: "PINK",
      price: "₹1",
      originalPrice: "₹100",
      rating: 4.9,
      reviews: 789,
      views: 7202,
      sold: 6057,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "clothing",
      isHighDemand: false,
    },
    {
      id: 2,
      name: "Mallu bgrade collection",
      brand: "B-Grade",
      price: "₹129.99",
      originalPrice: "₹179",
      discount: null,
      rating: 4.7,
      reviews: 789,
      views: 6986,
      sold: 6381,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "clothing",
      isHighDemand: false,
    },
    {
      id: 3,
      name: "Vintage Leather Handbag",
      brand: "Heritage Craft",
      price: "₹89.99",
      originalPrice: "₹129.99",
      discount: "-31%",
      rating: 4.8,
      reviews: 156,
      views: 4101,
      sold: 11458,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "bags",
      stockLeft: 12,
      isHighDemand: false,
    },
    {
      id: 4,
      name: "Classic Comfort Essential",
      brand: "Essentials",
      price: "₹19.99",
      originalPrice: "₹29.99",
      discount: "-33%",
      rating: 4.9,
      reviews: 567,
      views: 9743,
      sold: 11275,
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "clothing",
      isHighDemand: true,
    },
    {
      id: 5,
      name: "Urban Style Casual Shirt",
      brand: "Urban Trends",
      price: "₹32.99",
      originalPrice: "₹45.99",
      discount: "-28%",
      rating: 4.7,
      reviews: 896,
      views: 9140,
      sold: 3454,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "clothing",
      isHighDemand: true,
    },
    {
      id: 6,
      name: "Classic Black Tee",
      brand: "Minimalist",
      price: "₹24.99",
      originalPrice: "₹35.99",
      discount: "-30%",
      rating: 4.6,
      reviews: 234,
      views: 7873,
      sold: 5223,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "clothing",
      isHighDemand: false,
    },
    {
      id: 7,
      name: "Business Portrait Collection",
      brand: "Professional",
      price: "₹49.99",
      originalPrice: "₹75.99",
      discount: "-34%",
      rating: 4.8,
      reviews: 445,
      views: 10815,
      sold: 10428,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "accessories",
      isHighDemand: false,
    },
    {
      id: 8,
      name: "Premium Accessory Set",
      brand: "Luxury Leather",
      price: "₹79.99",
      originalPrice: "₹129.99",
      discount: "-38%",
      rating: 4.9,
      reviews: 312,
      views: 2237,
      sold: 10704,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "accessories",
      stockLeft: 15,
      isHighDemand: false,
    },
    {
      id: 9,
      name: "Wireless Bluetooth Headphones",
      brand: "SoundWave",
      price: "₹79.99",
      originalPrice: "₹119.99",
      rating: 4.6,
      reviews: 892,
      views: 6543,
      sold: 2100,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "Electronics",
      isHighDemand: true,
    },
    {
      id: 10,
      name: "Smart Fitness Watch",
      brand: "TechFit",
      price: "₹199.99",
      originalPrice: "₹299.99",
      rating: 4.7,
      reviews: 234,
      views: 8912,
      sold: 1456,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "Electronics",
      isHighDemand: false,
    },
    {
      id: 11,
      name: "Digital Marketing Course",
      brand: "LearnPro",
      price: "₹49.99",
      originalPrice: "₹199.99",
      rating: 4.8,
      reviews: 1123,
      views: 12456,
      sold: 3789,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "Digital",
      isHighDemand: true,
    },
    {
      id: 12,
      name: "Photography Preset Pack",
      brand: "PhotoMaster",
      price: "₹29.99",
      originalPrice: "₹89.99",
      rating: 4.5,
      reviews: 567,
      views: 7890,
      sold: 2345,
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "Digital",
      isHighDemand: false,
    },
    {
      id: 13,
      name: "Minimalist Wallet",
      brand: "SlimCarry",
      price: "₹39.99",
      originalPrice: "₹59.99",
      rating: 4.4,
      reviews: 678,
      views: 5432,
      sold: 1876,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "wallets",
      isHighDemand: false,
    },
    {
      id: 14,
      name: "Designer Sunglasses",
      brand: "StyleVision",
      price: "₹89.99",
      originalPrice: "₹149.99",
      rating: 4.6,
      reviews: 345,
      views: 4321,
      sold: 987,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      category: "accessories",
      stockLeft: 8,
      isHighDemand: true,
    },
  ];

  const categories = [
    { id: "all-products", name: "🛍️ All Products", active: true },
    { id: "accessories", name: "⚡ Accessories" },
    { id: "all", name: "🛍️ All" },
    { id: "bags", name: "👜 Bags" },
    { id: "clothing", name: "👕 Clothing" },
    { id: "shoes", name: "👠 Shoes" },
    { id: "wallets", name: "👛 Wallets" },
  ];

  const [activeCategory, setActiveCategory] = useState("all-products");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = "/"}>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Cupon Zone</h1>
              <span className="text-lg">🎫</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative" onClick={() => window.location.href = "/api/login"}>
                <ShoppingCart className="h-5 w-5 animate-pulse" />
                <Badge className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  3
                </Badge>
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                variant="ghost" 
                size="icon"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Login Banner */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span><strong>Returning user?</strong> Click the login icon above and enter your email or mobile number to access your purchased products instantly!</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Find your next digital treasure..."
            className="w-full pl-12 pr-4 py-3 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Promo Banner - Cycling through top offers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-8 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute bottom-6 left-8 w-3 h-3 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-4 right-6 w-5 h-5 border border-white/30 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">MEGA DIGITAL SALE</h2>
              <p className="text-white/90 mb-2">{topOfferProducts[currentProductIndex].name}</p>
              <p className="text-white/80 text-sm mb-4">by {topOfferProducts[currentProductIndex].brand}</p>
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(topOfferProducts[currentProductIndex].rating) ? 'text-yellow-300 fill-current' : 'text-white/30'}`} />
                ))}
                <span className="text-white/90 text-sm ml-2">({topOfferProducts[currentProductIndex].reviews})</span>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6 lg:mb-0">
              <img 
                src={topOfferProducts[currentProductIndex].image} 
                alt={topOfferProducts[currentProductIndex].name}
                className="w-32 h-32 object-cover rounded-xl shadow-lg transition-all duration-500"
              />
            </div>

            <div className="text-center lg:text-right">
              <div className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-full font-medium mb-3">
                <Flame className="h-4 w-4 mr-2" />
                <span>HOT DEAL</span>
              </div>
              <div className="text-white mb-2">
                <div className="flex items-center justify-center lg:justify-end space-x-2 mb-2">
                  <span className="text-2xl font-bold">{topOfferProducts[currentProductIndex].price}</span>
                  <span className="text-sm line-through opacity-70">{topOfferProducts[currentProductIndex].originalPrice}</span>
                </div>
                <span className="text-sm opacity-90">Limited Time Offer</span>
              </div>
              <div className="flex items-center space-x-2 mb-4 text-white">
                <div className="bg-black/20 rounded px-2 py-1 text-sm font-mono">07</div>
                <span>:</span>
                <div className="bg-black/20 rounded px-2 py-1 text-sm font-mono">57</div>
                <span>:</span>
                <div className="bg-black/20 rounded px-2 py-1 text-sm font-mono">19</div>
              </div>
              <p className="text-white/80 text-xs mb-4">time left ⏰</p>
              <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-full text-lg">
                🛒 BUY NOW! ⚡
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              className={`rounded-full ${
                activeCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="relative">
                {product.isHighDemand && (
                  <Badge className="absolute bottom-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    🔥 HOT
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 z-10"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{product.views.toLocaleString()} viewing</span>
                </div>
                <div className="flex items-center text-xs text-blue-600 mb-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{product.sold.toLocaleString()} sold</span>
                </div>
                {product.isHighDemand && (
                  <div className="text-xs text-red-500 font-medium mb-1">⚡ High Demand!</div>
                )}
                <h3 className="font-medium text-gray-900 mb-1">{product.brand}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.name}</p>
                <div className="flex items-center mb-2">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium ml-1">{product.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>
                <div className="flex items-center mb-3">
                  <span className="text-lg font-bold text-gray-900">{product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through ml-2">{product.originalPrice}</span>
                      <span className="text-xs text-primary font-medium ml-2">
                        Save {(parseFloat(product.originalPrice.replace('₹', '')) - parseFloat(product.price.replace('₹', ''))).toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-primary font-medium mb-3">⚡ Instant Access</div>
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-secondary hover:bg-blue-600 text-white"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    🛒 BUY NOW
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = "/api/login"}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Cart */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-green-600"
          onClick={() => window.location.href = "/api/login"}
        >
          <ShoppingCart className="h-6 w-6" />
          <Badge className="absolute -top-2 -right-2 bg-accent text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            3
          </Badge>
        </Button>
      </div>
    </div>
  );
}
