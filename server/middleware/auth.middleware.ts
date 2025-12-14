import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing or invalid authentication token' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // TODO: Verify JWT with Clerk/Firebase/Auth0
    // const decoded = verifyToken(token);
    
    // Mock User for development
    req.user = {
      id: 'user_12345',
      role: 'student'
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden', message: 'Token is invalid or expired' });
  }
};