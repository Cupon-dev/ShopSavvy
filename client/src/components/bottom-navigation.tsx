import { useLocation } from "wouter";
import { Home, ShoppingCart, Heart, BookOpen, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { data: cartItems = [] } = useCart();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
      active: location === "/",
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      path: "/cart",
      active: location === "/cart",
      badge: cartItems.length > 0 ? cartItems.length : undefined,
    },
    {
      label: "Library",
      icon: BookOpen,
      path: "/library",
      active: location === "/library",
      requireAuth: true,
    },
    {
      label: "Favorites",
      icon: Heart,
      path: "/favorites",
      active: location === "/favorites",
      requireAuth: true,
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
      active: location === "/profile",
      requireAuth: true,
    },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.requireAuth && !isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    setLocation(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                {item.badge && (
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {item.badge > 99 ? "99+" : item.badge}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}