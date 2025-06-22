import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Smartphone, Download, Star, Shield, Zap } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt automatically on mobile for better adoption
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && !isInstalled) {
        setTimeout(() => setIsVisible(true), 3000); // Show after 3 seconds
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Show again after 24 hours for persistent mobile adoption
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if already installed or no install prompt available
  if (isInstalled || !isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
              Install PremiumLeaks App
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* App Benefits */}
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Instant Access</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Offline Browsing</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Push Notifications</span>
              </div>
            </CardContent>
          </Card>

          {/* Installation Benefits */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900">Get the Full Experience</h3>
            <p className="text-sm text-gray-600">
              Install our app for faster loading, offline access, and instant notifications about new products and offers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleInstall}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App Now
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          {/* Mobile-specific instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>📱 On iPhone: Tap Share → Add to Home Screen</p>
            <p>🤖 On Android: Tap Install or Add to Home Screen</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}