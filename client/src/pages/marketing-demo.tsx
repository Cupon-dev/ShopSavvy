import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Send, ExternalLink, Calendar, Target } from 'lucide-react';

export default function MarketingDemo() {
  const { toast } = useToast();
  const [campaigns] = useState([
    {
      id: 1,
      pushId: 'flash_sale_demo_2025',
      offerTitle: 'FLASH SALE - 80% OFF ALL DIGITAL PRODUCTS',
      description: 'Limited time offer! Get instant access to premium digital content with massive discounts. Only 24 hours left!',
      bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop',
      discountPercentage: 80,
      validUntil: '2025-12-31 23:59:59',
      buttonText: 'GRAB DEAL NOW',
      buttonAction: '/',
      isActive: true,
      isBanner: true,
      priority: 10,
      targetCategory: 'digital',
      status: 'active',
      createdAt: '2025-06-08T15:29:12.753Z'
    }
  ]);

  const [notificationSent, setNotificationSent] = useState(false);

  const sendPushNotification = async (campaign: any) => {
    try {
      // Simulate push notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(campaign.offerTitle, {
          body: campaign.description,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: campaign.pushId,
          actions: [
            {
              action: 'view',
              title: 'View Deal'
            }
          ]
        });
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(campaign.offerTitle, {
            body: campaign.description,
            icon: '/icon-192x192.png'
          });
        }
      }

      setNotificationSent(true);
      toast({
        title: "Push Notification Sent!",
        description: "Marketing campaign notification has been delivered to all users",
      });

      // Reset after 3 seconds
      setTimeout(() => setNotificationSent(false), 3000);
    } catch (error: any) {
      toast({
        title: "Notification Failed",
        description: "Failed to send push notification",
        variant: "destructive"
      });
    }
  };

  const installPWA = () => {
    toast({
      title: "Install PremiumLeaks App",
      description: "Look for 'Install App' option in your browser or add to home screen on mobile",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Admin Demo</h1>
        <p className="text-gray-600">Complete PWA & Push Notification System</p>
      </div>

      {/* PWA Installation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Progressive Web App Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">📱 Mobile Install</h3>
              <p className="text-sm text-gray-600">Add to home screen on iOS/Android</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">💻 Desktop Install</h3>
              <p className="text-sm text-gray-600">Install like native app on Windows/Mac</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🔔 Push Notifications</h3>
              <p className="text-sm text-gray-600">Receive marketing alerts instantly</p>
            </div>
          </div>
          <Button onClick={installPWA} className="w-full mt-4">
            Install PremiumLeaks App
          </Button>
        </CardContent>
      </Card>

      {/* Marketing Campaigns */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Marketing Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <img 
                      src={campaign.bannerImage} 
                      alt={campaign.offerTitle}
                      className="w-24 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{campaign.offerTitle}</h3>
                        <Badge variant={campaign.isActive ? "default" : "secondary"}>
                          {campaign.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Banner</Badge>
                        <Badge variant="destructive">{campaign.discountPercentage}% OFF</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        <span>Expires: {new Date(campaign.validUntil).toLocaleDateString()}</span>
                        <span>Category: {campaign.targetCategory}</span>
                        <span>Status: {campaign.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => sendPushNotification(campaign)}
                      disabled={notificationSent}
                      className={`flex items-center gap-1 ${notificationSent ? 'bg-green-600' : ''}`}
                    >
                      <Send className="h-3 w-3" />
                      {notificationSent ? 'Sent!' : 'Send Push'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notification Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">How Push Notifications Work:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>User installs PWA on their device</li>
              <li>Browser requests notification permission</li>
              <li>Marketing campaigns can send targeted push notifications</li>
              <li>Users receive notifications even when app is closed</li>
              <li>Notifications drive user engagement and sales</li>
            </ol>
          </div>

          <div className="border-l-4 border-blue-500 pl-4 mb-4">
            <h4 className="font-semibold text-blue-900">Database Table: marketing_push</h4>
            <p className="text-sm text-gray-600 mt-1">
              Use this table to create campaigns with banner images, discount percentages, 
              expiry dates, and target categories. Set is_banner=true for website banners 
              and is_banner=false for push notifications only.
            </p>
          </div>

          <Button 
            onClick={() => sendPushNotification(campaigns[0])}
            className="w-full"
            size="lg"
          >
            <Bell className="h-4 w-4 mr-2" />
            Test Push Notification Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}