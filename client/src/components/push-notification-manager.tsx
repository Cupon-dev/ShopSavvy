import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Calendar, Target, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MarketingCampaign {
  id: number;
  pushId: string;
  offerTitle: string;
  description: string;
  bannerImage?: string;
  discountPercentage?: number;
  validUntil?: string;
  buttonText: string;
  buttonAction?: string;
  isActive: boolean;
  isBanner: boolean;
  priority: number;
  targetCategory?: string;
  scheduledTime?: string;
  status: string;
  createdAt: string;
}

export default function PushNotificationManager() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    offerTitle: '',
    description: '',
    bannerImage: '',
    discountPercentage: 50,
    validUntil: '',
    buttonText: 'BUY NOW',
    buttonAction: '/',
    isBanner: false,
    priority: 0,
    targetCategory: '',
    scheduledTime: ''
  });

  const fetchCampaigns = async () => {
    try {
      const response = await apiRequest('GET', '/api/marketing-campaigns') as MarketingCampaign[];
      setCampaigns(response);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign = async () => {
    setIsCreating(true);
    try {
      await apiRequest('POST', '/api/marketing-campaigns', {
        ...newCampaign,
        pushId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      
      toast({
        title: "Campaign Created",
        description: "Marketing campaign has been created successfully",
      });
      
      fetchCampaigns();
      setNewCampaign({
        offerTitle: '',
        description: '',
        bannerImage: '',
        discountPercentage: 50,
        validUntil: '',
        buttonText: 'BUY NOW',
        buttonAction: '/',
        isBanner: false,
        priority: 0,
        targetCategory: '',
        scheduledTime: ''
      });
    } catch (error: any) {
      toast({
        title: "Campaign Creation Failed",
        description: error.message || "Failed to create campaign",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const sendPushNotification = async (campaign: MarketingCampaign) => {
    try {
      await apiRequest('POST', '/api/send-push-notification', {
        campaignId: campaign.id,
        title: campaign.offerTitle,
        message: campaign.description,
        data: {
          action: campaign.buttonAction,
          discount: campaign.discountPercentage
        }
      });
      
      toast({
        title: "Push Notification Sent",
        description: "Marketing push notification has been sent to all users",
      });
    } catch (error: any) {
      toast({
        title: "Push Failed",
        description: error.message || "Failed to send push notification",
        variant: "destructive"
      });
    }
  };

  const deleteCampaign = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/marketing-campaigns/${id}`);
      toast({
        title: "Campaign Deleted",
        description: "Marketing campaign has been deleted",
      });
      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete campaign",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Create Marketing Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Title</label>
              <Input
                value={newCampaign.offerTitle}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, offerTitle: e.target.value }))}
                placeholder="MEGA SALE ALERT!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Percentage</label>
              <Input
                type="number"
                value={newCampaign.discountPercentage}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) }))}
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={newCampaign.description}
              onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Get exclusive access to premium digital content with instant download"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Banner Image URL</label>
              <Input
                value={newCampaign.bannerImage}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, bannerImage: e.target.value }))}
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <Input
                value={newCampaign.buttonText}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, buttonText: e.target.value }))}
                placeholder="BUY NOW"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <Input
                type="datetime-local"
                value={newCampaign.validUntil}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Category</label>
              <Input
                value={newCampaign.targetCategory}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, targetCategory: e.target.value }))}
                placeholder="electronics, fashion, etc."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newCampaign.isBanner}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, isBanner: e.target.checked }))}
              />
              Display as Banner
            </label>
          </div>

          <Button 
            onClick={createCampaign} 
            disabled={isCreating || !newCampaign.offerTitle.trim()}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Campaign'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{campaign.offerTitle}</h3>
                      <Badge variant={campaign.isActive ? "default" : "secondary"}>
                        {campaign.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {campaign.isBanner && (
                        <Badge variant="outline">Banner</Badge>
                      )}
                      {campaign.discountPercentage && (
                        <Badge variant="destructive">{campaign.discountPercentage}% OFF</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                      {campaign.validUntil && (
                        <span>Expires: {new Date(campaign.validUntil).toLocaleDateString()}</span>
                      )}
                      <span>Status: {campaign.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => sendPushNotification(campaign)}
                      className="flex items-center gap-1"
                    >
                      <Send className="h-3 w-3" />
                      Send Push
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCampaign(campaign.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {campaigns.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No marketing campaigns created yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}