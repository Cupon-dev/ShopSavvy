import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Bell, Send, Calendar, Target, Trash2, Plus, Megaphone } from 'lucide-react';

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

export default function MarketingAdmin() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
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
      const response = await apiRequest('GET', '/api/marketing-campaigns');
      setCampaigns(response as MarketingCampaign[]);
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
      setShowCreateForm(false);
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

  const quickCampaignTemplates = [
    {
      title: "FLASH SALE - 80% OFF",
      description: "Limited time flash sale on all digital products. Hurry, only 24 hours left!",
      discount: 80,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop"
    },
    {
      title: "WEEKEND SPECIAL - 60% OFF",
      description: "Weekend special offer on premium content. Perfect for upgrading your digital library.",
      discount: 60,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
    },
    {
      title: "NEW YEAR MEGA SALE - 70% OFF",
      description: "Start the new year with exclusive digital content at unbeatable prices.",
      discount: 70,
      image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&h=400&fit=crop"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Admin</h1>
          <p className="text-gray-600 mt-1">Manage marketing campaigns and push notifications</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Quick Templates */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Campaign Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickCampaignTemplates.map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setNewCampaign({
                    ...newCampaign,
                    offerTitle: template.title,
                    description: template.description,
                    discountPercentage: template.discount,
                    bannerImage: template.image,
                    isBanner: true
                  });
                  setShowCreateForm(true);
                }}>
                <img src={template.image} alt={template.title} className="w-full h-24 object-cover rounded mb-2" />
                <h3 className="font-semibold text-sm">{template.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                <Badge variant="destructive" className="mt-2">{template.discount}% OFF</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card className="mb-6">
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

            <div className="flex gap-2">
              <Button 
                onClick={createCampaign} 
                disabled={isCreating || !newCampaign.offerTitle.trim()}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Active Campaigns ({campaigns.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {campaign.bannerImage && (
                      <img 
                        src={campaign.bannerImage} 
                        alt={campaign.offerTitle}
                        className="w-20 h-16 object-cover rounded"
                      />
                    )}
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
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                <p className="text-sm">Create your first marketing campaign to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}