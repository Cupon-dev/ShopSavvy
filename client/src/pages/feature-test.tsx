import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Share2, CreditCard, ShoppingCart, CheckCircle, ExternalLink } from 'lucide-react';
import SocialShare from '@/components/social-share';
import RazorpayPopup from '@/components/razorpay-popup';

export default function FeatureTest() {
  const { toast } = useToast();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const testProduct = {
    id: 1,
    name: 'Premium Digital Course Bundle',
    description: 'Complete web development course with React, Node.js, and PostgreSQL',
    price: '2999',
    originalPrice: '9999',
    category: 'education',
    brand: 'PremiumLeaks',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
    viewCount: 1234,
    soldCount: 567,
    rating: 4.8,
    reviewCount: 89,
    hasInstantAccess: true,
    isHighDemand: true,
    demoLink: 'https://demo.example.com',
    accessLink: 'https://course.example.com',
    razorpayLink: 'https://rzp.io/rzp/feature-test-product',
    inStock: true,
    createdAt: new Date('2025-06-12T12:00:00.000Z'),
    updatedAt: new Date('2025-06-12T12:00:00.000Z')
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: "Your purchase has been completed successfully",
    });
    setIsPaymentOpen(false);
  };

  const testSocialSharing = () => {
    setIsShareOpen(true);
  };

  const testPaymentFlow = () => {
    setIsPaymentOpen(true);
  };

  const testQuickShare = async (platform: string) => {
    const shareUrl = `${window.location.origin}/product/${testProduct.id}`;
    const shareText = `Check out this amazing deal on ${testProduct.name}! Only ₹${testProduct.price}`;

    const shareLinks = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    };

    const url = shareLinks[platform as keyof typeof shareLinks];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast({
        title: "Quick Share Success!",
        description: `Product shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Testing Hub</h1>
        <p className="text-gray-600">Test one-click social sharing and payment functionality</p>
      </div>

      {/* Feature Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Social Media Sharing
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">One-click sharing implemented</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Facebook, Twitter, WhatsApp, Telegram support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Native mobile sharing API</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Copy link functionality</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment System
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Razorpay payment links</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">UPI payments supported</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Credit/Debit card payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Payment verification system</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Product Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <img 
              src={testProduct.imageUrl} 
              alt={testProduct.name}
              className="w-32 h-24 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{testProduct.name}</h3>
              <p className="text-gray-600 mb-2">{testProduct.description}</p>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-2xl font-bold text-gray-900">₹{testProduct.price}</span>
                <span className="text-lg text-gray-500 line-through">₹{testProduct.originalPrice}</span>
                <Badge variant="destructive">70% OFF</Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={testSocialSharing} variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Test Sharing
                </Button>
                <Button onClick={testPaymentFlow} size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Test Payment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={() => testQuickShare('whatsapp')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="text-green-600">📱</span>
              WhatsApp
            </Button>
            <Button 
              onClick={() => testQuickShare('telegram')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="text-blue-500">✈️</span>
              Telegram
            </Button>
            <Button 
              onClick={() => testQuickShare('twitter')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="text-blue-400">🐦</span>
              Twitter
            </Button>
            <Button 
              onClick={testPaymentFlow} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Payment
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Testing Notes:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Social sharing opens in new tabs/apps for real sharing</li>
              <li>• Payment system uses Razorpay test links when credentials are provided</li>
              <li>• Mobile devices support native sharing API</li>
              <li>• All product cards now have share buttons</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Social Share Modal */}
      <SocialShare
        product={testProduct}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Payment Modal */}
      <RazorpayPopup
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        product={testProduct}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}