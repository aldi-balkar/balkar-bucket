import axios from 'axios';
import logger from '../config/logger';

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
}

export const sendWebhook = async (
  webhookUrl: string,
  payload: WebhookPayload
): Promise<void> => {
  try {
    await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    logger.info('Webhook sent successfully', { url: webhookUrl, event: payload.event });
  } catch (error) {
    logger.error('Failed to send webhook', { url: webhookUrl, error });
  }
};
