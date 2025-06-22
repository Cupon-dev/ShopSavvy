import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface NotificationPayload {
  campaignId: number;
  title: string;
  body: string;
  productId?: number;
  action?: string;
  discount?: number;
}

class PushNotificationService {
  private wss: WebSocketServer | null = null;
  private connectedClients = new Set<WebSocket>();

  initialize(server: Server) {
    // Create WebSocket server for real-time push notifications
    this.wss = new WebSocketServer({ 
      server: server, 
      path: '/push-notifications',
      clientTracking: true
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Push notification client connected');
      this.connectedClients.add(ws);

      ws.on('close', () => {
        console.log('Push notification client disconnected');
        this.connectedClients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('Push notification WebSocket error:', error);
        this.connectedClients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Push notifications active'
      }));
    });

    console.log('Push notification service initialized');
  }

  // Send push notification to all connected clients
  async sendNotificationToAll(payload: NotificationPayload): Promise<void> {
    const notificationData = {
      type: 'push_notification',
      data: {
        title: payload.title,
        body: payload.body,
        campaignId: payload.campaignId,
        productId: payload.productId,
        action: payload.action || 'view',
        discount: payload.discount,
        timestamp: Date.now()
      }
    };

    const message = JSON.stringify(notificationData);
    let sentCount = 0;

    // Send to all connected WebSocket clients
    this.connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
          sentCount++;
        } catch (error) {
          console.error('Failed to send notification to client:', error);
          this.connectedClients.delete(client);
        }
      } else {
        this.connectedClients.delete(client);
      }
    });

    console.log(`Push notification sent to ${sentCount} connected clients:`, {
      title: payload.title,
      campaignId: payload.campaignId
    });

    // In production, integrate with service like Firebase Cloud Messaging
    await this.sendToFCM(payload);
  }

  // Production push notification service integration
  private async sendToFCM(payload: NotificationPayload): Promise<void> {
    // This would integrate with Firebase Cloud Messaging for production
    // For now, we simulate the notification sending
    try {
      console.log('FCM Push notification (simulated):', {
        to: 'all_users',
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          click_action: payload.action || '/',
        },
        data: {
          campaignId: payload.campaignId.toString(),
          productId: payload.productId?.toString(),
          discount: payload.discount?.toString(),
          timestamp: Date.now().toString()
        }
      });

      // Simulate successful delivery for demo
      return Promise.resolve();
    } catch (error) {
      console.error('FCM notification failed:', error);
      throw error;
    }
  }

  // Get notification statistics
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      serverActive: this.wss !== null
    };
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Helper function to send marketing campaign notifications
export async function sendMarketingPushNotification(campaign: any): Promise<void> {
  try {
    await pushNotificationService.sendNotificationToAll({
      campaignId: campaign.id,
      title: campaign.offerTitle || 'New Offer Available!',
      body: campaign.description || 'Check out our latest deals and discounts!',
      productId: campaign.productId,
      action: campaign.buttonAction || '/',
      discount: campaign.discountPercentage
    });
  } catch (error) {
    console.error('Failed to send marketing push notification:', error);
    // Don't throw error to prevent campaign creation failure
  }
}