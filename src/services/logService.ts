import { Log } from '../models';
import { Request } from 'express';
import { AuthRequest } from '../middleware/auth';

interface LogData {
  type: string;
  action: string;
  details?: object;
  status?: string;
}

export const logActivity = async (
  logData: LogData,
  req: Request | AuthRequest
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    await Log.create({
      type: logData.type,
      action: logData.action,
      details: logData.details,
      userId: (authReq as any).user?.id,
      apiKeyId: authReq.apiKey?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: logData.status || 'success',
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
