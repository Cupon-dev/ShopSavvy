import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Flame } from "lucide-react";

export default function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 0,
    seconds: 0,
  });
  
  const [currentOffer, setCurrentOffer] = useState({
    title: "MEGA DIGITAL SALE",
    description: "Digital Marketing Kit 🔥",
    icon: "🔥"
  });

  const offers = [
    { title: "MEGA DIGITAL SALE", description: "Digital Marketing Kit 🔥", icon: "🔥" },
    { title: "FLASH DEAL", description: "E-commerce Bundle 💎", icon: "⚡" },
    { title: "WEEKEND SPECIAL", description: "SEO Tools Pack 🎯", icon: "🚀" },
    { title: "CLEARANCE SALE", description: "Social Media Kit 💰", icon: "💎" }
  ];
  
  // Live sold count that increases realistically
  const [soldCount, setSoldCount] = useState(4739);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          // Start new offer with random hours (3-8)
          const newHours = Math.floor(Math.random() * 6) + 3;
          const newOffer = offers[Math.floor(Math.random() * offers.length)];
          setCurrentOffer(newOffer);
          return { hours: newHours, minutes: 0, seconds: 0 };
        }

        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offers]);
  
  // Animate sold count increasing every 10-30 seconds
  useEffect(() => {
    const soldTimer = setInterval(() => {
      setSoldCount(prev => prev + Math.floor(Math.random() * 3) + 1); // +1 to +3
    }, 10000 + Math.random() * 20000); // 10-30 seconds
    
    return () => clearInterval(soldTimer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="relative promo-gradient rounded-xl p-4 overflow-hidden floating-decorations">
        {/* Background decorative elements */}
        <div className="absolute bottom-6 left-8 w-3 h-3 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-4 right-6 w-5 h-5 border border-white/30 rounded-full"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left Section - Offer Text */}
          <div className="lg:col-span-1">
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">{currentOffer.title}</h2>
            <p className="text-white/90 mb-2 text-sm lg:text-base">{currentOffer.description}</p>
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 text-yellow-300 fill-current animate-pulse" style={{animationDelay: `${i * 0.2}s`}} />
              ))}
            </div>
            <div className="text-white mb-2">
              <span className="font-bold text-base transition-all duration-700">{soldCount.toLocaleString()}</span>
              <span className="text-xs opacity-90 ml-1">already sold</span>
            </div>
          </div>

          {/* Middle Section - Banner Images */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="flex items-center space-x-3">
              {["70%", "60%", "65%", "55%"].map((discount, i) => (
                <div key={i} className="text-center relative">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <span className="text-black font-bold text-sm lg:text-base relative z-10">{discount}</span>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🔥</span>
                    </div>
                  </div>
                  <span className="text-white/80 text-xs mt-1 block">OFF</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Hot Deal, Timer, and CTA */}
          <div className="lg:col-span-1 text-center lg:text-right">
            <div className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-full font-medium mb-3 shadow-lg">
              <Flame className="h-4 w-4 mr-2 animate-bounce" />
              <span className="text-sm font-bold">HOT DEAL</span>
            </div>
            
            <div className="mb-3">
              <p className="text-white/80 text-xs mb-1">DEAL ENDS IN:</p>
              <div className="flex items-center space-x-1 text-white justify-center lg:justify-end">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-2 min-w-[40px]">
                  <div className="text-lg font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-300">HRS</div>
                </div>
                <span className="text-lg font-bold">:</span>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-2 min-w-[40px]">
                  <div className="text-lg font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-300">MIN</div>
                </div>
                <span className="text-lg font-bold">:</span>
                <div className="bg-black/30 backdrop-blur-sm rounded-lg px-2 py-2 min-w-[40px]">
                  <div className="text-lg font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs text-gray-300">SEC</div>
                </div>
              </div>
            </div>
            
            <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse">
              BUY NOW!
            </Button>
            
            <div className="mt-2 text-xs text-white/70">
              Limited time offer • While stocks last
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
