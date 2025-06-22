import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Share2, Facebook, Twitter, MessageCircle, Copy, Link } from 'lucide-react';
import { Product } from '@/../../shared/schema';
import { useState } from 'react';

interface SocialShareProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialShare({ product, isOpen, onClose }: SocialShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/product/${product.id}`;
  const shareText = `Check out this amazing deal on ${product.name}! Only $${product.price} - ${product.description}`;
  const hashtags = `#PremiumLeaks #DigitalProducts #Deal #${product.category}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${encodeURIComponent(hashtags.replace(/#/g, ''))}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast({
        title: "Shared!",
        description: `Product shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared!",
          description: "Product shared successfully",
        });
      } catch (error) {
        // User cancelled sharing
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Product
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex gap-3 mb-3">
              <img 
                src={product.imageUrl || '/placeholder-product.jpg'} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h4 className="font-medium text-sm">{product.name}</h4>
                <p className="text-xs text-gray-600">${product.price}</p>
                <p className="text-xs text-gray-500 mt-1">{product.category}</p>
              </div>
            </div>
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button 
              onClick={handleNativeShare}
              className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share via Device
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4 text-blue-400" />
              Twitter
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4 text-blue-500" />
              Telegram
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2"
            disabled={copied}
          >
            {copied ? (
              <>
                <Copy className="h-4 w-4 text-green-600" />
                Link Copied!
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>

          <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
            <p className="font-medium mb-1">Share Preview:</p>
            <p className="text-gray-600">{shareText}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}