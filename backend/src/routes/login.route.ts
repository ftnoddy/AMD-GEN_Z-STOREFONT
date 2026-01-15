import { Router } from 'express';
import LoginController from '@/controllers/login.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

class LoginRoute {
  public path = '/auth';
  public router = Router();
  private loginController = new LoginController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public routes
    this.router.post(`${this.path}/register`, this.loginController.register);
    this.router.post(`${this.path}/login`, this.loginController.login);

    // Protected route
    this.router.post(`${this.path}/logout`, authMiddleware, this.loginController.logout);
  }
}

export default LoginRoute;
