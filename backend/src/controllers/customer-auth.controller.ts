import { Request, Response, NextFunction } from 'express';
import CustomerAuthService from '@/services/customer-auth.service';

class CustomerAuthController {
  private customerAuthService = new CustomerAuthService();

  /** POST /api/public/store/:subdomain/auth/register */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subdomain = req.params.subdomain;
      const data = await this.customerAuthService.register(subdomain, req.body);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token: data.token,
        customer: data.customer,
      });
    } catch (error) {
      next(error);
    }
  };

  /** POST /api/public/store/:subdomain/auth/login */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subdomain = req.params.subdomain;
      const data = await this.customerAuthService.login(subdomain, req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: data.token,
        customer: data.customer,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default CustomerAuthController;
