import { Request, Response, NextFunction } from 'express';
import LoginService from '@/services/login.service';

class LoginController {
  private loginService = new LoginService();

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginService.register(req.body);
      if (result.status === 201 && result.token) {
        res.status(201).json({
          success: true,
          message: result.message,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(result.status).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginService.login(req.body);

      if (result.status === 200 && result.token) {
        res.status(200).json({
          success: true,
          message: result.message,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(result.status).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginService.logout();
      res.clearCookie('token');
      res.status(result.status).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default LoginController;
