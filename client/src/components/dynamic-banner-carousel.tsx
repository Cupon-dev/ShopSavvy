import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, TrendingUp, Star, Eye, Clock } from "lucide-react";
import type { Product } from "@shared/schema";

interface BannerTimer {
  id: string;
  productId: number;
  startTime: number;
  duration: number; // in seconds
  pausedAt?: number;
  isActive: boolean;
}

interface DynamicBannerCarouselProps {
  autoRotate?: boolean;
  rotationInterval?: number;
}

export default function DynamicBannerCarousel({ 
  autoRotate = true, 
  rotationInterval = 4000 
}: DynamicBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerTimers, setBannerTimers] = useState<BannerTimer[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch products for banner rotation
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      return data as Product[];
    },
  });

  // Initialize banner timers for each product
  useEffect(() => {
    if (products.length > 0 && bannerTimers.length === 0) {
      const initialTimers = products.map((product, index) => {
        const savedTimer = localStorage.getItem(`banner_timer_${product.id}`);
        let timer: BannerTimer;

        if (savedTimer) {
          const parsed = JSON.parse(savedTimer);
          const now = Date.now();
          const elapsed = parsed.pausedAt ? (parsed.pausedAt - parsed.startTime) : (now - parsed.startTime);
          const remaining = Math.max(0, parsed.duration - Math.floor(elapsed / 1000));
          
          timer = {
            id: `timer_${product.id}`,
            productId: product.id,
            startTime: now,
            duration: remaining,
            isActive: remaining > 0
          };
        } else {
          // Create new timer with random duration between 6-10 hours
          const duration = 6 * 3600 + Math.floor(Math.random() * 4 * 3600); // 6-10 hours in seconds
          timer = {
            id: `timer_${product.id}`,
            productId: product.id,
            startTime: Date.now(),
            duration: duration,
            isActive: true
          };
        }

        // Save to localStorage
        localStorage.setItem(`banner_timer_${product.id}`, JSON.stringify(timer));
        return timer;
      });

      setBannerTimers(initialTimers);
    }
  }, [products, bannerTimers.length]);

  // Auto-rotate banner images
  useEffect(() => {
    if (autoRotate && products.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
      }, rotationInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRotate, products.length, rotationInterval]);

  // Update timers every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(Date.now());
      setBannerTimers(prevTimers => {
        const updatedTimers = prevTimers.map(timer => {
          if (!timer.isActive) return timer;

          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
          const remaining = Math.max(0, timer.duration - elapsed);
          
          const updatedTimer = {
            ...timer,
            isActive: remaining > 0
          };

          // Update localStorage with current state
          localStorage.setItem(`banner_timer_${timer.productId}`, JSON.stringify({
            ...updatedTimer,
            pausedAt: Date.now()
          }));

          return updatedTimer;
        });

        return updatedTimers;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Cleanup on unmount - save current state
  useEffect(() => {
    return () => {
      bannerTimers.forEach(timer => {
        localStorage.setItem(`banner_timer_${timer.productId}`, JSON.stringify({
          ...timer,
          pausedAt: Date.now()
        }));
      });
    };
  }, [bannerTimers]);

  // Format time remaining
  const formatTimeRemaining = (timer: BannerTimer): string => {
    if (!timer.isActive) return "00:00:00";
    
    const elapsed = Math.floor((currentTime - timer.startTime) / 1000);
    const remaining = Math.max(0, timer.duration - elapsed);
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get current product and timer
  const currentProduct = products[currentIndex];
  const currentTimer = bannerTimers.find(timer => timer.productId === currentProduct?.id);

  if (isLoading || !currentProduct) {
    return (
      <Card className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
        <div className="h-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="h-8 w-48 bg-white/20 rounded mb-4"></div>
            <div className="h-4 w-32 bg-white/20 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative h-64 md:h-80">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${currentProduct.imageUrl})`,
              filter: 'brightness(0.3)'
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          
          {/* Content */}
          <div className="relative h-full flex items-center justify-between p-6 md:p-8">
            {/* Left Content */}
            <div className="flex-1 text-white">
              <div className="mb-4">
                <Badge variant="secondary" className="mb-2 bg-red-600 text-white border-0">
                  <Timer className="w-3 h-3 mr-1" />
                  LIMITED TIME OFFER
                </Badge>
                <h2 className="text-2xl md:text-4xl font-bold mb-2 text-shadow">
                  {currentProduct.name}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 mb-4">
                  by {currentProduct.brand}
                </p>
              </div>

              {/* Price and Discount */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl md:text-4xl font-bold text-green-400">
                  ₹{currentProduct.price}
                </span>
                {currentProduct.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{currentProduct.originalPrice}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      {Math.round((1 - parseFloat(currentProduct.price) / parseFloat(currentProduct.originalPrice)) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{currentProduct.viewCount?.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{currentProduct.soldCount} sold</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current text-yellow-400" />
                  <span>{currentProduct.rating}/5</span>
                </div>
              </div>

              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                BUY NOW
              </Button>
            </div>

            {/* Right Content - Timer */}
            <div className="text-center text-white ml-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Clock className="w-8 h-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm text-gray-300 mb-2">OFFER ENDS IN</p>
                <div className="text-3xl md:text-4xl font-mono font-bold text-red-400">
                  {currentTimer ? formatTimeRemaining(currentTimer) : "00:00:00"}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Hurry! Limited time only
                </p>
              </div>
            </div>
          </div>

          {/* Product Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {products.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Banner Rotation Indicator */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Showing {currentIndex + 1} of {Math.min(products.length, 5)} featured products
        </p>
      </div>
    </div>
  );
}