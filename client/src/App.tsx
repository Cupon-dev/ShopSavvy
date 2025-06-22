import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import InstallPrompt from "@/components/install-prompt";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Library from "@/pages/library";
import Profile from "@/pages/profile";
import Favorites from "@/pages/favorites";
import OrderTracking from "@/pages/order-tracking";
import Admin from "@/pages/admin";
import PaymentTest from "@/pages/payment-test";
import WebhookTest from "@/pages/webhook-test";
import PaymentVerificationPage from "@/pages/payment-verification";
import PaymentReconciliation from "@/pages/payment-reconciliation";
import SystemTest from "@/pages/system-test";
import MarketingAdmin from "@/pages/marketing-admin";
import MarketingDemo from "@/pages/marketing-demo";
import FeatureTest from "@/pages/feature-test";
import ProductImagesAdmin from "@/pages/product-images-admin";
import ImageUrlManager from "@/pages/image-url-manager";
import UploadedImagesTable from "@/pages/uploaded-images-table";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/library" component={Library} />
      <Route path="/profile" component={Profile} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/track-order" component={OrderTracking} />
      <Route path="/admin" component={Admin} />
      <Route path="/payment-test" component={PaymentTest} />
      <Route path="/webhook-test" component={WebhookTest} />
      <Route path="/system-test" component={SystemTest} />
      <Route path="/payment-verification" component={PaymentVerificationPage} />
      <Route path="/payment-reconciliation" component={PaymentReconciliation} />
      <Route path="/marketing-admin" component={MarketingAdmin} />
      <Route path="/marketing-demo" component={MarketingDemo} />
      <Route path="/product-images-admin" component={ProductImagesAdmin} />
      <Route path="/image-url-manager" component={ImageUrlManager} />
      <Route path="/uploaded-images-table" component={UploadedImagesTable} />
      <Route path="/feature-test" component={FeatureTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <InstallPrompt />
        <Router />
        <BottomNavigation />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;